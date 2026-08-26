import type { VercelRequest, VercelResponse } from '@vercel/node'
import process from 'node:process'

const GITHUB_USERNAME = 'white66-7'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const token = process.env.GITHUB_TOKEN

  try {
    const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/events/public?per_page=100`, {
      headers: {
        'User-Agent': 'Vercel-Serverless',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      signal: AbortSignal.timeout(8000)
    })

    if (!response.ok) throw new Error(`GitHub API HTTP ${response.status}`)
    const events = await response.json()

    const commits: Array<{ commitDate: string; message: string; repoName: string }> = []
    if (Array.isArray(events)) {
      for (const event of events) {
        const repoName = event.repo?.name?.replace(`${GITHUB_USERNAME}/`, '') || 'project'

        // 1. 提交代码事件 (PushEvent)
        if (event.type === 'PushEvent' && event.payload?.commits) {
          for (const c of event.payload.commits) {
            commits.push({
              commitDate: event.created_at,
              message: c.message || 'Update code',
              repoName
            })
          }
        }
        // 2. 创建分支/仓库事件 (CreateEvent)
        else if (event.type === 'CreateEvent') {
          commits.push({
            commitDate: event.created_at,
            message: `Created ${event.payload?.ref_type || 'repository'} ${event.payload?.ref || ''}`.trim(),
            repoName
          })
        }
      }
    }

    return res.status(200).json(commits)
  } catch (error: any) {
    console.error('[Timeline API] 错误:', error.message)
    return res.status(200).json([])
  }
}