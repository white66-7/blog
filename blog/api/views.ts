import type { VercelRequest, VercelResponse } from '@vercel/node'
import { MongoClient, Db } from 'mongodb'
import process from 'node:process'

// 1. 数据库连接池复用
const uri = process.env.MONGODB_URI || ''
let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) return { client: cachedClient, db: cachedDb }
  if (!uri) throw new Error('未配置 MONGODB_URI')

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 4000,
    connectTimeoutMS: 4000,
    maxPoolSize: 10 // 限制连接池大小
  })

  await client.connect()
  const db = client.db()
  cachedClient = client
  cachedDb = db
  return { client, db }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const { db } = await connectToDatabase()
  const collection = db.collection('article_views')

  // ==================== 1. POST 请求：文章详情页阅读量 +1 ====================
  if (req.method === 'POST') {
    const rawId = (req.query.id || req.body?.id) as string
    if (!rawId) return res.status(400).json({ error: 'Missing id' })

    const articleId = !isNaN(Number(rawId)) ? Number(rawId) : rawId
    const result = await collection.findOneAndUpdate(
      { $or: [{ articleId: articleId }, { articleId: String(articleId) }] },
      {
        $inc: { views: 1 },
        $setOnInsert: { articleId: articleId }
      },
      { upsert: true, returnDocument: 'after' }
    )
    return res.status(200).json({ id: articleId, views: result?.views ?? 1 })
  }

  // ==================== 2. GET 请求：支持批量查询 + CDN 边缘缓存 ====================
  if (req.method === 'GET') {
    // 💡 关键优化：开启 Vercel CDN 边缘缓存 30 秒，极大缩短响应时间（毫秒级）
    res.setHeader('Cache-Control', 'public, s-maxage=30, stale-while-revalidate=60')

    const rawIds = req.query.ids as string | undefined
    const singleId = req.query.id as string | undefined

    // 场景 A：批量查询多个文章 ID (例如 ?ids=1,2,3,4,5,6)
    if (rawIds) {
      const idList = rawIds.split(',').map(id => id.trim()).filter(Boolean)
      const numIds = idList.map(id => Number(id)).filter(id => !isNaN(id))

      // 查库：同时匹配数字和字符串 ID
      const records = await collection.find({
        $or: [
          { articleId: { $in: numIds } },
          { articleId: { $in: idList } }
        ]
      }).toArray()

      // 转为映射字典 { 1: 100, 2: 50, ... }
      const viewsMap: Record<string | number, number> = {}
      idList.forEach(id => { viewsMap[id] = 0 }) // 默认 0
      records.forEach(r => {
        if (r.articleId !== undefined) {
          viewsMap[r.articleId] = r.views || 0
        }
      })

      return res.status(200).json({ views: viewsMap })
    }

    // 场景 B：单个查询 (例如 ?id=1)
    if (singleId) {
      const articleId = !isNaN(Number(singleId)) ? Number(singleId) : singleId
      const record = await collection.findOne({
        $or: [{ articleId: articleId }, { articleId: String(articleId) }]
      })
      return res.status(200).json({ id: articleId, views: record?.views ?? 0 })
    }

    // 场景 C：不传参数时，默认查全部
    const allRecords = await collection.find({}).toArray()
    const viewsMap: Record<string | number, number> = {}
    allRecords.forEach(r => {
      if (r.articleId !== undefined) viewsMap[r.articleId] = r.views || 0
    })
    return res.status(200).json({ views: viewsMap })
  }
}