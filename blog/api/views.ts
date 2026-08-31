import type { VercelRequest, VercelResponse } from '@vercel/node'
import { connectToDatabase } from './lib/mongodb'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const { db } = await connectToDatabase()
    const collection = db.collection('article_views')

    // POST: 浏览量 +1
    if (req.method === 'POST') {
      const rawId = (req.query.id || req.body?.id) as string
      if (!rawId) return res.status(400).json({ error: 'Missing id' })

      const articleId = !isNaN(Number(rawId)) ? Number(rawId) : rawId
      const rawResult = await collection.findOneAndUpdate(
        { $or: [{ articleId: articleId }, { articleId: String(articleId) }] },
        {
          $inc: { views: 1 },
          $setOnInsert: { articleId: articleId }
        },
        { upsert: true, returnDocument: 'after' }
      )

      const result: any = (rawResult && typeof rawResult === 'object' && 'value' in rawResult) 
        ? (rawResult as any).value 
        : rawResult

      return res.status(200).json({ id: articleId, views: result?.views ?? 1 })
    }

    // GET: 查询浏览量
    if (req.method === 'GET') {
      const rawIds = req.query.ids as string | undefined
      const singleId = req.query.id as string | undefined

      if (rawIds) {
        const idList = rawIds.split(',').map(id => id.trim()).filter(Boolean)
        const numIds = idList.map(id => Number(id)).filter(id => !isNaN(id))

        const records = await collection
          .find(
            { $or: [{ articleId: { $in: numIds } }, { articleId: { $in: idList } }] },
            { projection: { _id: 0, articleId: 1, views: 1 } }
          )
          .toArray()

        const viewsMap: Record<string | number, number> = {}
        idList.forEach(id => { viewsMap[id] = 0 })
        records.forEach(r => {
          if (r.articleId !== undefined) {
            viewsMap[r.articleId] = r.views || 0
          }
        })

        return res.status(200).json({ views: viewsMap })
      }

      if (singleId) {
        const articleId = !isNaN(Number(singleId)) ? Number(singleId) : singleId
        const record = await collection.findOne(
          { $or: [{ articleId: articleId }, { articleId: String(articleId) }] },
          { projection: { _id: 0, views: 1 } }
        )
        return res.status(200).json({ id: articleId, views: record?.views ?? 0 })
      }

      const allRecords = await collection.find({}, { projection: { _id: 0, articleId: 1, views: 1 } }).toArray()
      const viewsMap: Record<string | number, number> = {}
      allRecords.forEach(r => {
        if (r.articleId !== undefined) viewsMap[r.articleId] = r.views || 0
      })
      return res.status(200).json({ views: viewsMap })
    }
  } catch (error: any) {
    console.error('[Views API Error]:', error.message)
    return res.status(200).json({ views: {}, error: error.message })
  }
}