import './lib/env'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const GITHUB_USERNAME = 'white66-7'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  const token = process.env.GITHUB_TOKEN

  const query = `
    query($username: String!) {
      user(login: $username) {
        contributionsCollection {
          contributionCalendar {
            weeks {
              contributionDays {
                contributionCount
                date
              }
            }
          }
        }
      }
    }
  `

  try {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Vercel-Serverless',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      },
      body: JSON.stringify({ query, variables: { username: GITHUB_USERNAME } }),
      signal: AbortSignal.timeout(4000) 
    })

    if (!response.ok) throw new Error(`GitHub API HTTP ${response.status}`)
    const json = await response.json()
    const weeks = json.data?.user?.contributionsCollection?.contributionCalendar?.weeks || []

    return res.status(200).json({ weeks })
  } catch (error: any) {
    console.error('[Contributions API] 请求降级/超时:', error.message)
    // 失败时直接返回空数组，让前端正常渲染，不卡住页面
    return res.status(200).json({ weeks: [] })
  }
}