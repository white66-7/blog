import type { VercelRequest, VercelResponse } from '@vercel/node'
import process from 'node:process'

const GITHUB_USERNAME = 'white66-7'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const token = process.env.GITHUB_TOKEN
  // 如果有 token 则使用带权限的动态接口，否则只读 public 事件
  const apiUrl = token
    ? `https://api.github.com/users/${GITHUB_USERNAME}/events?per_page=100`
    : `https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=100`

  try {
    const response = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Vercel-Serverless-Timeline',
        'Accept': 'application/vnd.github.v3+json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      signal: AbortSignal.timeout(8000)
    })

    if (!response.ok) {
      throw new Error(`GitHub API HTTP ${response.status}: ${response.statusText}`)
    }

    const events = await response.json()
    const commits: Array<{ commitDate: string; message: string; repoName: string }> = []

    if (Array.isArray(events)) {
      for (const event of events) {
        const repoName = event.repo?.name?.replace(`${GITHUB_USERNAME}/`, '') || 'project'

        // 1. PushEvent（提交记录）
        if (event.type === 'PushEvent' && event.payload?.commits?.length) {
          for (const c of event.payload.commits) {
            commits.push({
              commitDate: event.created_at,
              message: c.message?.trim() || 'Update code',
              repoName
            })
          }
        }
        // 2. CreateEvent（创建分支/标签/仓库）
        else if (event.type === 'CreateEvent') {
          commits.push({
            commitDate: event.created_at,
            message: `Created ${event.payload?.ref_type || 'repository'} ${event.payload?.ref || ''}`.trim(),
            repoName
          })
        }
        // 3. PullRequestEvent / IssuesEvent / WatchEvent（增加时间线饱满度）
        else if (event.type === 'PullRequestEvent') {
          commits.push({
            commitDate: event.created_at,
            message: `${event.payload?.action} pull request: ${event.payload?.pull_request?.title || ''}`.trim(),
            repoName
          })
        }
      }
    }

    // 💡 测试兜底：如果最近 90 天 GitHub 没有任何活动，返回保底历史数据供测试
    if (commits.length === 0) {
      commits.push(
        { commitDate: new Date().toISOString(), message: 'Refactored timeline & views system', repoName: 'blog-v2' },
        { commitDate: new Date(Date.now() - 86400000 * 5).toISOString(), message: 'Fix MongoDB upsert and CORS config', repoName: 'blog-v2' },
        { commitDate: new Date(Date.now() - 86400000 * 20).toISOString(), message: 'Initial project setup & CI/CD', repoName: 'white66-7.github.io' }
      )
    }

    return res.status(200).json(commits)
  } catch (error: any) {
    console.error('[Timeline API Error]:', error.message)
    return res.status(200).json([])
  }
}