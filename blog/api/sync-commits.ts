import type { VercelRequest, VercelResponse } from '@vercel/node'
import { connectToDatabase } from './lib/mongodb'

const GITHUB_USERNAME = 'white66-7'

export const config = {
  maxDuration: 15
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const token = process.env.GITHUB_TOKEN

  try {
    const { db } = await connectToDatabase()
    const collection = db.collection('github_commits')

    const headers: Record<string, string> = {
      'User-Agent': 'Vercel-Sync-Incremental',
      'Accept': 'application/vnd.github.v3+json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }

    const operationsMap = new Map<string, any>()

    // ================= 增量策略 1：查询用户最近的 Push 事件 =================
    try {
      const eventsRes = await fetch(
        `https://api.github.com/users/${GITHUB_USERNAME}/events?per_page=30`,
        { headers, signal: AbortSignal.timeout(3000) }
      )
      if (eventsRes.ok) {
        const events = (await eventsRes.json()) as any[]
        if (Array.isArray(events)) {
          for (const ev of events) {
            if (ev.type === 'PushEvent' && ev.payload?.commits) {
              const repoSimpleName = (ev.repo?.name || '').split('/').pop() || 'repo'
              for (const c of ev.payload.commits) {
                if (!c.sha) continue
                operationsMap.set(c.sha, {
                  updateOne: {
                    filter: { sha: c.sha },
                    update: {
                      $set: {
                        sha: c.sha,
                        repoName: repoSimpleName,
                        message: c.message?.split('\n')[0] || 'Update code',
                        commitDate: new Date(ev.created_at || Date.now()),
                        url: c.url?.replace('api.github.com/repos', 'github.com').replace('/commits/', '/commit/') || ''
                      }
                    },
                    upsert: true
                  }
                })
              }
            }
          }
        }
      }
    } catch (e) {
      console.warn('[Events API 失败，继续执行仓库检查]:', e)
    }

    // ================= 增量策略 2：只拉取最近发生过推送的前 6 个仓库 =================
    try {
      const reposUrl = token
        ? 'https://api.github.com/user/repos?affiliation=owner,collaborator&per_page=6&sort=pushed&direction=desc'
        : `https://api.github.com/users/${GITHUB_USERNAME}/repos?type=all&per_page=6&sort=pushed&direction=desc`

      const reposRes = await fetch(reposUrl, { headers, signal: AbortSignal.timeout(3000) })
      if (reposRes.ok) {
        const recentRepos = (await reposRes.json()) as any[]
        if (Array.isArray(recentRepos)) {
          await Promise.all(
            recentRepos.map(async (repo) => {
              const repoOwner = repo.owner?.login || GITHUB_USERNAME
              const repoName = repo.name

              const commitsUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/commits?author=${encodeURIComponent(GITHUB_USERNAME)}&per_page=20`
              const cRes = await fetch(commitsUrl, { headers, signal: AbortSignal.timeout(3000) })
              if (!cRes.ok) return

              const commits = (await cRes.json()) as any[]
              if (!Array.isArray(commits)) return

              for (const item of commits) {
                if (!item.sha) continue
                const commitData = item.commit
                const commitDate = commitData?.author?.date || commitData?.committer?.date

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
            })
          )
        }
      }
    } catch (e) {
      console.warn('[Repos Commits 抓取失败]:', e)
    }

    // ================= 批量增量 Upsert 写入 MongoDB =================
    const operations = Array.from(operationsMap.values())
    let newlyAdded = 0

    if (operations.length > 0) {
      const resBulk = await collection.bulkWrite(operations, { ordered: false })
      newlyAdded = (resBulk.upsertedCount || 0)
    }

    const totalCount = await collection.countDocuments()

    return res.status(200).json({
      success: true,
      newlyAdded,
      currentTotalInDB: totalCount,
      message: `增量同步完成！本次扫描到 ${operations.length} 条最新提交，新增入库 ${newlyAdded} 条，数据库当前共有 ${totalCount} 条记录。`
    })
  } catch (error: any) {
    return res.status(500).json({ error: error.message })
  }
}