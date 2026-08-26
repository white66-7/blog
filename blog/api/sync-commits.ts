import type { VercelRequest, VercelResponse } from '@vercel/node'
import { MongoClient } from 'mongodb'
import process from 'node:process'

const GITHUB_USERNAME = 'white66-7'

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

    // 1. 获取所有公开仓库（显式标注类型为 any[]）
    const reposRes = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100`, { headers })
    if (!reposRes.ok) throw new Error(`拉取仓库失败: ${reposRes.statusText}`)
    const repos = (await reposRes.json()) as any[]

    let newCount = 0

    if (Array.isArray(repos)) {
      // 2. 遍历仓库获取 Commits 并写入 MongoDB
      for (const repo of repos) {
        const repoName = repo.name
        let page = 1
        let hasMore = true

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
              const sha = item.sha
              const commitData = item.commit
              const commitDate = commitData?.author?.date || commitData?.committer?.date

              // 存在则更新，不存在则插入
              const result = await collection.updateOne(
                { sha: sha },
                {
                  $set: {
                    sha,
                    repoName,
                    message: commitData?.message?.split('\n')[0] || 'Update code',
                    commitDate: commitDate ? new Date(commitDate) : new Date(),
                    url: item.html_url
                  }
                },
                { upsert: true }
              )

              if (result.upsertedCount > 0) {
                newCount++
              }
            }

            if (commits.length === 100) {
              page++
            } else {
              hasMore = false
            }
          } else {
            hasMore = false
          }
        }
      }
    }

    await client.close()
    return res.status(200).json({
      success: true,
      message: `同步成功！本次共新增存入了 ${newCount} 条提交记录。`
    })
  } catch (error: any) {
    await client.close()
    console.error('同步失败:', error)
    return res.status(500).json({ error: error.message })
  }
}