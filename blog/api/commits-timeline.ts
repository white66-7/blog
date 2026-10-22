import type { VercelRequest, VercelResponse } from '@vercel/node'
import { connectToDatabase } from './_lib/mongodb.js'
import { cached, CACHE_KEYS, CACHE_TTL } from './_lib/cache.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')   // 允许访问来源
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')  // 接口操作方式
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate') // 浏览器侧不缓存，交给 Redis
  if (req.method === 'OPTIONS') return res.status(200).end()    // 预检测放行

  try {
    const result = await cached(CACHE_KEYS.timeline, CACHE_TTL.timeline, async () => {
      const { db } = await connectToDatabase()
      const collection = db.collection('github_commits')

      const dbCommits = await collection
        .find({})
        .sort({ commitDate: -1 })
        .limit(3000)
        .toArray()

      return dbCommits.map(item => ({
        commitDate: item.commitDate ? new Date(item.commitDate).toISOString() : new Date().toISOString(),
        message: item.message || 'Update code',
        repoName: item.repoName || 'repo',
        url: item.url || '',
      }))
    })

    return res.status(200).json(result)
  } catch (error: any) {
    console.error('[Timeline Handler Error]:', error.message)
    return res.status(200).json([])
  }
}
