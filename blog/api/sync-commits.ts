import type { VercelRequest, VercelResponse } from '@vercel/node'
import { MongoClient } from 'mongodb'
import process from 'node:process'

const GITHUB_USERNAME = 'white66-7'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const uri = process.env.MONGODB_URI
  const token = process.env.GITHUB_TOKEN

  if (!uri) {
    return res.status(500).json({ error: 'MONGODB_URI 未配置' })
  }

  const client = new MongoClient(uri)

  try {
    await client.connect()
    const db = client.db()
    const collection = db.collection('github_commits')

    const headers: Record<string, string> = {
      'User-Agent': 'Vercel-Sync-Script',
      'Accept': 'application/vnd.github.v3+json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }

    // 1. 获取所有公开仓库
    const reposRes = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`, { headers })
    if (!reposRes.ok) throw new Error(`拉取仓库失败: ${reposRes.statusText}`)
    const repos = (await reposRes.json()) as any[]

    let totalSynced = 0

    if (Array.isArray(repos)) {
      for (const repo of repos) {
        const repoName = repo.name
        let page = 1
        let hasMore = true
        const operations: any[] = []

        while (hasMore && page <= 5) {
          const commitsRes = await fetch(
            `https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/commits?author=${GITHUB_USERNAME}&per_page=100&page=${page}`,
            { headers }
          )

          if (!commitsRes.ok) {
            hasMore = false
            break
          }

          const commits = (await commitsRes.json()) as any[]
          if (Array.isArray(commits) && commits.length > 0) {
            for (const item of commits) {
              const commitData = item.commit
              const commitDate = commitData?.author?.date || commitData?.committer?.date

              operations.push({
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
        }

        // ✅ 每个仓库收集完后，执行 1 次批量写入，大幅缩短耗时
        if (operations.length > 0) {
          const res = await collection.bulkWrite(operations, { ordered: false })
          totalSynced += (res.upsertedCount + res.modifiedCount)
        }
      }
    }

    await client.close()
    return res.status(200).json({
      success: true,
      message: `同步完成！已成功同步/更新 ${totalSynced} 条 Commit 记录。`
    })
  } catch (error: any) {
    await client.close()
    console.error('全量同步失败:', error)
    return res.status(500).json({ error: error.message })
  }
}