import './lib/env'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const GITHUB_USERNAME = 'white66-7'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  const token = process.env.GITHUB_TOKEN

  try {
    // 👇 添加 4 秒超时控制器
    const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=30`, {
      headers: {
        'User-Agent': 'Vercel-Serverless',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      signal: AbortSignal.timeout(4000)
    })

    if (!response.ok) throw new Error(`GitHub API HTTP ${response.status}`)
    const events = await response.json()

    const commits: Array<{ commitDate: string; message: string; repoName: string }> = []
    if (Array.isArray(events)) {
      for (const event of events) {
        if (event.type === 'PushEvent' && event.payload?.commits) {
          const repoName = event.repo.name.replace(`${GITHUB_USERNAME}/`, '')
          for (const c of event.payload.commits) {
            commits.push({
              commitDate: event.created_at,
              message: c.message || 'Update code',
              repoName
            })
          }
        }
      }
    }

    return res.status(200).json(commits)
  } catch (error: any) {
    console.error('[Timeline API] 请求降级/超时:', error.message)
    return res.status(200).json([])
  }
}