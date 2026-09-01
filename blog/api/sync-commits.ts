import type { VercelRequest, VercelResponse } from '@vercel/node'
import { connectToDatabase } from './_lib/mongodb.js'

const GITHUB_USERNAME = 'white66-7'

export const config = {
  maxDuration: 15
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const token = process.env.GITHUB_TOKEN
  const debugLogs: string[] = []

  if (!token) {
    debugLogs.push('⚠️ 警告: 未检测到 GITHUB_TOKEN，极易触发 GitHub API 403 限流！')
  }

  try {
    const { db } = await connectToDatabase()
    const collection = db.collection('github_commits')

    const headers: Record<string, string> = {
      'User-Agent': 'Vercel-Sync-Incremental',
      'Accept': 'application/vnd.github.v3+json',
      ...(token ? { Authorization: `token ${token}` } : {})
    }

    const operationsMap = new Map<string, any>()

    // ================= 策略 1：查询用户最近的 Push 事件 =================
    try {
      debugLogs.push(`正在请求 /users/${GITHUB_USERNAME}/events...`)
      const eventsRes = await fetch(
        `https://api.github.com/users/${GITHUB_USERNAME}/events?per_page=30`,
        { headers, signal: AbortSignal.timeout(8000) } // 提高到 8 秒
      )

      if (!eventsRes.ok) {
        const errText = await eventsRes.text()
        debugLogs.push(`Events API 响应非 200: ${eventsRes.status} - ${errText}`)
      } else {
        const events = (await eventsRes.json()) as any[]
        if (Array.isArray(events)) {
          let pushCount = 0
          for (const ev of events) {
            if (ev.type === 'PushEvent' && ev.payload?.commits) {
              const repoSimpleName = (ev.repo?.name || '').split('/').pop() || 'repo'
              for (const c of ev.payload.commits) {
                if (!c.sha) continue
                pushCount++
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
          debugLogs.push(`Events API 解析完成，提取到 ${pushCount} 个 Push 提交`)
        }
      }
    } catch (e: any) {
      debugLogs.push(`Events API 异常: ${e.name === 'TimeoutError' ? '请求超时(8s)' : e.message}`)
    }

    // ================= 策略 2：拉取最近活跃的前 6 个仓库 =================
    try {
      const reposUrl = `https://api.github.com/users/${GITHUB_USERNAME}/repos?type=all&per_page=6&sort=pushed&direction=desc`
      debugLogs.push(`正在请求用户仓库列表: ${reposUrl}...`)
      
      const reposRes = await fetch(reposUrl, { headers, signal: AbortSignal.timeout(8000) })
      if (!reposRes.ok) {
        const errText = await reposRes.text()
        debugLogs.push(`Repos API 响应非 200: ${reposRes.status} - ${errText}`)
      } else {
        const recentRepos = (await reposRes.json()) as any[]
        if (Array.isArray(recentRepos)) {
          debugLogs.push(`获取到 ${recentRepos.length} 个活跃仓库，开始拉取各仓库 commits...`)
          
          await Promise.all(
            recentRepos.map(async (repo) => {
              const repoOwner = repo.owner?.login || GITHUB_USERNAME
              const repoName = repo.name

              // 💡 去掉 author 强制过滤，防止因本地 git 邮箱与 github 账号不匹配导致被过滤成 0
              const commitsUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/commits?per_page=15`
              
              try {
                const cRes = await fetch(commitsUrl, { headers, signal: AbortSignal.timeout(8000) })
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
              } catch (err: any) {
                debugLogs.push(`仓库 ${repoName} commits 拉取超时或失败`)
              }
            })
          )
        }
      }
    } catch (e: any) {
      debugLogs.push(`Repos 抓取流程异常: ${e.message}`)
    }

    // ================= 批量写入 MongoDB =================
    const operations = Array.from(operationsMap.values())
    let newlyAdded = 0

    if (operations.length > 0) {
      const resBulk = await collection.bulkWrite(operations, { ordered: false })
      newlyAdded = resBulk.upsertedCount || 0
    }

    const totalCount = await collection.countDocuments()

    return res.status(200).json({
      success: true,
      newlyAdded,
      currentTotalInDB: totalCount,
      operationsFound: operations.length,
      debugLogs, // 💡 返回完整的调试日志
      message: `同步完成！本次扫描到 ${operations.length} 条提交，新增入库 ${newlyAdded} 条，数据库共 ${totalCount} 条。`
    })
  } catch (error: any) {
    return res.status(500).json({ error: error.message, debugLogs })
  }
}