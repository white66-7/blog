import type { VercelRequest, VercelResponse } from '@vercel/node'
import { MongoClient } from 'mongodb'
import process from 'node:process'

const GITHUB_USERNAME = 'white66-7'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const uri = process.env.MONGODB_URI
  const token = process.env.GITHUB_TOKEN

  if (!uri) return res.status(500).json({ error: 'MONGODB_URI 未配置' })

  const client = new MongoClient(uri)

  try {
    await client.connect()
    const db = client.db()
    const collection = db.collection('github_commits')

    const headers: Record<string, string> = {
      'User-Agent': 'Vercel-Sync-All',
      'Accept': 'application/vnd.github.v3+json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }

    let totalSaved = 0
    const operations: any[] = []

    // ================= 方案 A：全局搜索该作者历史所有 Commits =================
    try {
      const searchRes = await fetch(
        `https://api.github.com/search/commits?q=author:${GITHUB_USERNAME}&sort=author-date&order=desc&per_page=100`,
        { headers: { ...headers, Accept: 'application/vnd.github.cloak-preview+json' }, signal: AbortSignal.timeout(6000) }
      )
      if (searchRes.ok) {
        const sJson = (await searchRes.json()) as any
        if (Array.isArray(sJson.items)) {
          for (const item of sJson.items) {
            const commitData = item.commit
            const commitDate = commitData?.author?.date || commitData?.committer?.date
            operations.push({
              updateOne: {
                filter: { sha: item.sha },
                update: {
                  $set: {
                    sha: item.sha,
                    repoName: item.repository?.name || 'repo',
                    message: commitData?.message?.split('\n')[0] || 'Update code',
                    commitDate: commitDate ? new Date(commitDate) : new Date(),
                    url: item.html_url
                  }
                },
                upsert: true
              }
            })
          }
        }
      }
    } catch (e) {
      console.warn('搜索接口跳过:', e)
    }

    // ================= 方案 B：抓取所有名下仓库的所有历史 Commits（不过滤 author） =================
    const reposRes = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?type=all&per_page=100&sort=updated`,
      { headers, signal: AbortSignal.timeout(6000) }
    )

    if (reposRes.ok) {
      const repos = (await reposRes.json()) as any[]
      if (Array.isArray(repos)) {
        // 并发遍历仓库
        const repoPromises = repos.map(async (repo) => {
          const repoName = repo.name
          const subOps: any[] = []
          let page = 1
          let hasMore = true

          while (hasMore && page <= 3) { // 每个仓库最多拉 300 条
            try {
              // ⚠️ 关键点：去掉了 ?author=，保证任何本地邮箱提交的代码都能被拉下来
              const commitsRes = await fetch(
                `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/commits?per_page=100&page=${page}`,
                { headers, signal: AbortSignal.timeout(5000) }
              )
              if (!commitsRes.ok) break

              const commits = (await commitsRes.json()) as any[]
              if (Array.isArray(commits) && commits.length > 0) {
                for (const item of commits) {
                  const commitData = item.commit
                  const commitDate = commitData?.author?.date || commitData?.committer?.date
                  subOps.push({
                    updateOne: {
                      filter: { sha: item.sha },
                      update: {
                        $set: {
                          sha: item.sha,
                          repoName,
                          message: commitData?.message?.split('\n')[0] || 'Update code',
                          commitDate: commitDate ? new Date(commitDate) : new Date(),
                          url: item.html_url
                        }
                      },
                      upsert: true
                    }
                  })
                }
                if (commits.length === 100) page++
                else hasMore = false
              } else {
                hasMore = false
              }
            } catch {
              hasMore = false
            }
          }
          return subOps
        })

        const nestedOps = await Promise.all(repoPromises)
        for (const ops of nestedOps) {
          operations.push(...ops)
        }
      }
    }

    // 执行批量写入
    if (operations.length > 0) {
      const res = await collection.bulkWrite(operations, { ordered: false })
      totalSaved = (res.upsertedCount || 0) + (res.modifiedCount || 0) + (res.matchedCount || 0)
    }

    await client.close()
    return res.status(200).json({
      success: true,
      message: `全量同步完成！MongoDB 中当前共有/更新了 ${totalSaved} 条历史提交数据。`
    })
  } catch (error: any) {
    await client.close()
    return res.status(500).json({ error: error.message })
  }
}