import type { VercelRequest, VercelResponse } from '@vercel/node'
import { MongoClient } from 'mongodb'
import process from 'node:process'

const GITHUB_USERNAME = 'white66-7'

// 💡 可以在这里补充你本地可能用过的 Git 邮箱，避免漏抓
const KNOWN_AUTHOR_EMAILS = [
  'white66-7', // 用户名
  // 'your-qq-email@qq.com',
  // 'your-personal@gmail.com'
]

export const config = {
  maxDuration: 60 // 申请最大执行时长（Vercel Pro 有效，免费版会自动取上限）
}

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

    const operationsMap = new Map<string, any>()

    // ================= 阶段 1：Search API 深度分页抓取（最多抓取 10 页共 1000 条） =================
    let searchPage = 1
    let hasMoreSearch = true

    while (hasMoreSearch && searchPage <= 10) {
      try {
        const searchUrl = `https://api.github.com/search/commits?q=author:${GITHUB_USERNAME}&sort=author-date&order=desc&per_page=100&page=${searchPage}`
        const searchRes = await fetch(searchUrl, {
          headers: { ...headers, Accept: 'application/vnd.github.cloak-preview+json' },
          signal: AbortSignal.timeout(6000)
        })

        if (!searchRes.ok) break

        const sJson = (await searchRes.json()) as any
        const items = sJson.items || []

        if (items.length === 0) {
          hasMoreSearch = false
          break
        }

        for (const item of items) {
          const commitData = item.commit
          const commitDate = commitData?.author?.date || commitData?.committer?.date
          if (!item.sha) continue

          operationsMap.set(item.sha, {
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

        if (items.length < 100) hasMoreSearch = false
        else searchPage++
      } catch (e) {
        console.warn(`[Search API] 第 ${searchPage} 页抓取失败:`, e)
        break
      }
    }

    // ================= 阶段 2：获取所有名下、协作、组织仓库 =================
    // 优先使用 /user/repos（可获取私有仓库、组织仓库、协作仓库），若未配 Token 则回退到 /users/:username/repos
    const reposUrl = token
      ? 'https://api.github.com/user/repos?affiliation=owner,collaborator,organization_member&per_page=100&sort=updated'
      : `https://api.github.com/users/${GITHUB_USERNAME}/repos?type=all&per_page=100&sort=updated`

    const reposRes = await fetch(reposUrl, { headers, signal: AbortSignal.timeout(6000) })

    if (reposRes.ok) {
      const repos = (await reposRes.json()) as any[]
      if (Array.isArray(repos)) {
        // 限制并发数量，防止 Vercel 函数超载或触发 GitHub API 速率限制
        const MAX_CONCURRENT = 5
        for (let i = 0; i < repos.length; i += MAX_CONCURRENT) {
          const chunk = repos.slice(i, i + MAX_CONCURRENT)
          await Promise.all(
            chunk.map(async (repo) => {
              const repoOwner = repo.owner?.login || GITHUB_USERNAME
              const repoName = repo.name

              // 1. 获取该仓库的所有分支（解决非主分支提交丢失问题）
              let branches: string[] = ['main', 'master']
              try {
                const bRes = await fetch(
                  `https://api.github.com/repos/${repoOwner}/${repoName}/branches?per_page=20`,
                  { headers, signal: AbortSignal.timeout(4000) }
                )
                if (bRes.ok) {
                  const bList = (await bRes.json()) as any[]
                  if (Array.isArray(bList) && bList.length > 0) {
                    branches = bList.map(b => b.name)
                  }
                }
              } catch { /* ignore */ }

              // 2. 遍历该仓库的各主要分支
              for (const branch of branches.slice(0, 5)) { // 每个仓库最多看前 5 个活跃分支
                let page = 1
                let hasMoreCommits = true

                while (hasMoreCommits && page <= 5) { // 每个分支拉取最多 500 条
                  try {
                    const commitsRes = await fetch(
                      `https://api.github.com/repos/${repoOwner}/${repoName}/commits?sha=${encodeURIComponent(branch)}&per_page=100&page=${page}`,
                      { headers, signal: AbortSignal.timeout(5000) }
                    )
                    if (!commitsRes.ok) break

                    const commits = (await commitsRes.json()) as any[]
                    if (!Array.isArray(commits) || commits.length === 0) break

                    for (const item of commits) {
                      const commitData = item.commit
                      const authorLogin = item.author?.login || ''
                      const authorEmail = commitData?.author?.email || ''
                      const authorName = commitData?.author?.name || ''

                      // 💡 关键：精准匹配是自己的提交（排除 Fork 仓库中别人的提交）
                      const isMe =
                        authorLogin.toLowerCase() === GITHUB_USERNAME.toLowerCase() ||
                        KNOWN_AUTHOR_EMAILS.some(k =>
                          authorEmail.toLowerCase().includes(k.toLowerCase()) ||
                          authorName.toLowerCase().includes(k.toLowerCase())
                        )

                      if (!isMe && repo.fork) {
                        // 如果是 fork 项目且不是我自己的提交，跳过
                        continue
                      }

                      const commitDate = commitData?.author?.date || commitData?.committer?.date
                      if (item.sha) {
                        operationsMap.set(item.sha, {
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
                    }

                    if (commits.length === 100) page++
                    else hasMoreCommits = false
                  } catch {
                    hasMoreCommits = false
                  }
                }
              }
            })
          )
        }
      }
    }

    // ================= 阶段 3：批量写入 MongoDB =================
    const operations = Array.from(operationsMap.values())
    let totalSaved = 0

    if (operations.length > 0) {
      // 分批写入，防止单次 Payload 过大
      const BATCH_SIZE = 500
      for (let i = 0; i < operations.length; i += BATCH_SIZE) {
        const batch = operations.slice(i, i + BATCH_SIZE)
        const res = await collection.bulkWrite(batch, { ordered: false })
        totalSaved += (res.upsertedCount || 0) + (res.modifiedCount || 0) + (res.matchedCount || 0)
      }
    }

    await client.close()
    return res.status(200).json({
      success: true,
      count: operations.length,
      message: `全量同步完成！共抓取并聚合了 ${operations.length} 条唯一提交记录。`
    })
  } catch (error: any) {
    await client.close()
    return res.status(500).json({ error: error.message })
  }
}