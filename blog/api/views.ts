import type { VercelRequest, VercelResponse } from '@vercel/node'
import { connectToDatabase } from './_lib/mongodb.js'
import { cacheGet, cacheSet } from './_lib/redis.js'
import { CACHE_KEYS, CACHE_TTL } from './_lib/cache.js'

type ViewsMap = Record<string, number>

/** 同一实例内的并发请求共用一次数据库查询，避免缓存未命中时一起打穿 MongoDB */
let allViewsInflight: Promise<ViewsMap> | null = null

function normalizeArticleId(rawId: string): string | number {
  const value = rawId.trim()
  const num = Number(value)
  return value !== '' && Number.isFinite(num) ? num : value
}

/** 文章浏览量整体只有几十~几百条，一次全量读出比按 ids 拼 $in 查询更适合缓存 */
async function loadAllViewsFromDb(): Promise<ViewsMap> {
  const { db } = await connectToDatabase()
  const records = await db
    .collection('article_views')
    .find({}, { projection: { _id: 0, articleId: 1, views: 1 } })
    .toArray()

  const map: ViewsMap = {}
  for (const record of records) {
    if (record.articleId === undefined || record.articleId === null) continue
    map[String(record.articleId)] = Number(record.views) || 0
  }
  return map
}

async function getAllViews(): Promise<ViewsMap> {
  const cachedViews = await cacheGet<ViewsMap>(CACHE_KEYS.viewsAll)
  if (cachedViews) return cachedViews

  if (!allViewsInflight) {
    allViewsInflight = loadAllViewsFromDb()
      .then(async map => {
        await cacheSet(CACHE_KEYS.viewsAll, map, CACHE_TTL.views)
        return map
      })
      .finally(() => {
        allViewsInflight = null
      })
  }

  return allViewsInflight
}

/**
 * 浏览量 +1 后同步更新缓存（write-through），而不是直接删键：
 * 否则每打开一篇文章都会让整张浏览量缓存失效，缓存命中率会很难看。
 */
async function syncViewsCache(articleId: string | number, views: number): Promise<void> {
  const map = await cacheGet<ViewsMap>(CACHE_KEYS.viewsAll)
  if (!map) return

  map[String(articleId)] = views
  await cacheSet(CACHE_KEYS.viewsAll, map, CACHE_TTL.views)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    // POST: 浏览量 +1
    if (req.method === 'POST') {
      const rawId = (req.query.id || req.body?.id) as string | number | undefined
      if (rawId === undefined || rawId === null || rawId === '') {
        return res.status(400).json({ error: 'Missing id' })
      }

      const articleId = normalizeArticleId(String(rawId))
      const { db } = await connectToDatabase()

      const rawResult = await db.collection('article_views').findOneAndUpdate(
        { $or: [{ articleId: articleId }, { articleId: String(articleId) }] },
        {
          $inc: { views: 1 },
          $setOnInsert: { articleId: articleId },
        },
        { upsert: true, returnDocument: 'after' },
      )

      const result: any = rawResult && typeof rawResult === 'object' && 'value' in rawResult
        ? (rawResult as any).value
        : rawResult

      const views = Number(result?.views) || 1
      await syncViewsCache(articleId, views)

      return res.status(200).json({ id: articleId, views })
    }

    // GET: 查询浏览量
    if (req.method === 'GET') {
      const rawIds = req.query.ids as string | undefined
      const singleId = req.query.id as string | undefined

      if (!rawIds && !singleId) {
        return res.status(200).json({ views: await getAllViews() })
      }

      const viewsMap = await getAllViews()

      if (rawIds) {
        const idList = rawIds.split(',').map(id => id.trim()).filter(Boolean)
        const result: ViewsMap = {}
        idList.forEach(id => {
          result[id] = viewsMap[id] ?? 0
        })
        return res.status(200).json({ views: result })
      }

      const articleId = normalizeArticleId(singleId as string)
      return res.status(200).json({ id: articleId, views: viewsMap[String(articleId)] ?? 0 })
    }

    res.setHeader('Allow', ['GET', 'POST', 'OPTIONS'])
    return res.status(405).json({ error: `Method not allowed: ${req.method}` })
  } catch (error: any) {
    console.error('[Views API Error]:', error.message)
    return res.status(200).json({ views: {}, error: error.message })
  }
}
