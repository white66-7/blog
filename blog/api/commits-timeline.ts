import type { VercelRequest, VercelResponse } from '@vercel/node'
import { MongoClient, Db } from 'mongodb'
import process from 'node:process'

const GITHUB_USERNAME = 'white66-7'

// ==================== 1. MongoDB 连接复用 ====================
const uri = process.env.MONGODB_URI || ''
let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) return { client: cachedClient, db: cachedDb }
  if (!uri) throw new Error('MONGODB_URI not configured')

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 4000,
    connectTimeoutMS: 4000,
    maxPoolSize: 10
  })
  await client.connect()
  const db = client.db()
  cachedClient = client
  cachedDb = db
  return { client, db }
}

// ==================== 2. GitHub 实时拉取并回填数据库 ====================
async function fetchAndSaveGithubCommits(db: Db | null, token?: string) {
  const headers: Record<string, string> = {
    'User-Agent': 'Vercel-Timeline-Sync',
    'Accept': 'application/vnd.github.v3+json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }

  const commitsList: Array<{ sha: string; repoName: string; message: string; commitDate: string; url: string }> = []

  try {
    // 1. 获取最近活跃的公开仓库
    const reposRes = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=pushed&per_page=15`, {
      headers,
      signal: AbortSignal.timeout(5000)
    })

    if (reposRes.ok) {
      const repos = (await reposRes.json()) as any[]
      if (Array.isArray(repos)) {
        // 并发拉取前 6 个仓库的 Commits
        const repoPromises = repos.slice(0, 6).map(async (repo) => {
          try {
            const cRes = await fetch(
              `https://api.github.com/repos/${GITHUB_USERNAME}/${repo.name}/commits?author=${GITHUB_USERNAME}&per_page=30`,
              { headers, signal: AbortSignal.timeout(5000) }
            )
            if (!cRes.ok) return []
            const cJson = (await cRes.json()) as any[]
            return Array.isArray(cJson)
              ? cJson.map(c => ({
                  sha: c.sha,
                  repoName: repo.name,
                  message: c.commit?.message?.split('\n')[0] || 'Update code',
                  commitDate: c.commit?.author?.date || c.commit?.committer?.date || new Date().toISOString(),
                  url: c.html_url || ''
                }))
              : []
          } catch {
            return []
          }
        })

        const nested = await Promise.all(repoPromises)
        for (const list of nested) {
          commitsList.push(...list)
        }
      }
    }

    // 2. ✅ 修复：必须 await bulkWrite，确保云函数返回前数据已真正写入 MongoDB
    if (commitsList.length > 0 && db) {
      const collection = db.collection('github_commits')
      const operations = commitsList.map(item => ({
        updateOne: {
          filter: { sha: item.sha },
          update: {
            $set: {
              sha: item.sha,
              repoName: item.repoName,
              message: item.message,
              commitDate: new Date(item.commitDate),
              url: item.url
            }
          },
          upsert: true
        }
      }))
      await collection.bulkWrite(operations, { ordered: false })
    }
  } catch (err: any) {
    console.error('自动抓取/回填 GitHub Commits 失败:', err.message)
  }

  return commitsList
}

// ==================== 3. 主 Handler ====================
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  // 开启 Vercel CDN 边缘缓存 60 秒（极速秒开）
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=120')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const token = process.env.GITHUB_TOKEN
  let db: Db | null = null

  try {
    const conn = await connectToDatabase()
    db = conn.db
  } catch (err: any) {
    console.warn('[Timeline] MongoDB 连接暂不可用，将尝试直接拉取 GitHub API:', err.message)
  }

  try {
    // 步骤 1：优先从 MongoDB 毫秒级返回
    if (db) {
      const collection = db.collection('github_commits')
      const dbCommits = await collection.find({}).sort({ commitDate: -1 }).limit(120).toArray()

      if (dbCommits && dbCommits.length > 0) {
        const result = dbCommits.map(item => ({
          commitDate: item.commitDate ? new Date(item.commitDate).toISOString() : new Date().toISOString(),
          message: item.message || 'Update code',
          repoName: item.repoName || 'repo',
          url: item.url || ''
        }))
        return res.status(200).json(result)
      }
    }

    // 步骤 2：如果数据库为空（冷启动），自动拉取并回填
    const liveCommits = await fetchAndSaveGithubCommits(db, token)
    liveCommits.sort((a, b) => new Date(b.commitDate).getTime() - new Date(a.commitDate).getTime())

    const finalResult = liveCommits.map(c => ({
      commitDate: c.commitDate,
      message: c.message,
      repoName: c.repoName,
      url: c.url
    }))

    return res.status(200).json(finalResult)
  } catch (error: any) {
    console.error('[Timeline Handler Error]:', error.message)
    return res.status(200).json([])
  }
}