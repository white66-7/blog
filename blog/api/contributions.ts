import type { VercelRequest, VercelResponse } from '@vercel/node'
import { cached, CACHE_KEYS, CACHE_TTL } from './_lib/cache.js'

const GITHUB_USERNAME = 'white66-7'

interface ContributionDay {
  contributionCount: number
  date: string
}

interface ContributionWeek {
  contributionDays: ContributionDay[]
}

type ContributionWeeks = ContributionWeek[]

// 定义返回的数据结构接口
interface GitHubGraphQLResponse {
  data?: {
    user?: {
      contributionsCollection?: {
        contributionCalendar?: {
          weeks?: ContributionWeeks
        }
      }
    }
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')

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
    // GitHub GraphQL 未认证时每小时只有 60 次额度，缓存 30 分钟可以避免刷新页面就消耗额度
    const weeks = await cached<ContributionWeeks>(
      CACHE_KEYS.contributions,
      CACHE_TTL.contributions,
      async () => {
        const token = process.env.GITHUB_TOKEN

        const response = await fetch('https://api.github.com/graphql', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Vercel-Serverless',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ query, variables: { username: GITHUB_USERNAME } }),
          signal: AbortSignal.timeout(4000),
        })

        if (!response.ok) throw new Error(`GitHub API HTTP ${response.status}`)

        //  类型断言为定义好的接口类型
        const json = (await response.json()) as GitHubGraphQLResponse
        return json.data?.user?.contributionsCollection?.contributionCalendar?.weeks || []
      },
      // 空数组通常是限流/失败的结果，不写入缓存，下次请求可以立刻重试
      weeks => Array.isArray(weeks) && weeks.length > 0,
    )

    return res.status(200).json({ weeks })
  } catch (error: any) {
    console.error('[Contributions API] 请求降级/超时:', error.message)
    // 失败时直接返回空数组
    return res.status(200).json({ weeks: [] })
  }
}
