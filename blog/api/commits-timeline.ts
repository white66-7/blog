import type { VercelRequest, VercelResponse } from '@vercel/node'
import { MongoClient, Db } from 'mongodb'
import process from 'node:process'

const GITHUB_USERNAME = 'white66-7'

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const token = process.env.GITHUB_TOKEN
  const headers: Record<string, string> = {
    'User-Agent': 'Vercel-Timeline',
    'Accept': 'application/vnd.github.v3+json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }

  try {
    const { db } = await connectToDatabase()
    const collection = db.collection('github_commits')

    // 💡 1. 查询数据库中所有历史提交（上限提升至 1000 条）
    const dbCommits = await collection.find({}).sort({ commitDate: -1 }).limit(1000).toArray()

    if (dbCommits && dbCommits.length > 0) {
      const result = dbCommits.map(item => ({
        commitDate: item.commitDate ? new Date(item.commitDate).toISOString() : new Date().toISOString(),
        message: item.message || 'Update code',
        repoName: item.repoName || 'repo',
        url: item.url || ''
      }))
      return res.status(200).json(result)
    }

    // 💡 2. 数据库若为空，走全局 Commit 搜索兜底
    const searchRes = await fetch(
      `https://api.github.com/search/commits?q=author:${GITHUB_USERNAME}&sort=author-date&order=desc&per_page=100`,
      { headers: { ...headers, Accept: 'application/vnd.github.cloak-preview+json' } }
    )

    if (searchRes.ok) {
      const sJson = (await searchRes.json()) as any
      if (Array.isArray(sJson.items) && sJson.items.length > 0) {
        const list = sJson.items.map((item: any) => ({
          commitDate: item.commit?.author?.date || item.commit?.committer?.date || new Date().toISOString(),
          message: item.commit?.message?.split('\n')[0] || 'Update code',
          repoName: item.repository?.name || 'repo',
          url: item.html_url || ''
        }))
        return res.status(200).json(list)
      }
    }

    return res.status(200).json([])
  } catch (error: any) {
    console.error('[Timeline Handler Error]:', error.message)
    return res.status(200).json([])
  }
}