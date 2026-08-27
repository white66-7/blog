import type { VercelRequest, VercelResponse } from '@vercel/node'
import { MongoClient, Db } from 'mongodb'
import process from 'node:process'
import * as dns from 'node:dns'

// 本地开发修复：Node 的 c-ares 默认 DNS 可能指向无效的 127.0.0.1
const DNS_SERVERS = (process.env.DNS_SERVERS || '').split(',').map(s => s.trim()).filter(Boolean)
if (DNS_SERVERS.length) {
  try { dns.setServers(DNS_SERVERS) } catch { /* ignore invalid config */ }
}

const uri = process.env.MONGODB_URI || ''
let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) return { client: cachedClient, db: cachedDb }
  if (!uri) throw new Error('未配置 MONGODB_URI')

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 3000,
    connectTimeoutMS: 3000,
    maxPoolSize: 10,
  })

  await client.connect()
  const db = client.db()
  cachedClient = client
  cachedDb = db
  return { client, db }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 设置跨域
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  // 💡 保证数据绝对实时，禁用 CDN 脏缓存
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const { db } = await connectToDatabase()
    const collection = db.collection('article_views')

    // ==================== POST：详情页阅读量 +1 ====================
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

    // 💡 兼容 MongoDB Driver v4/v5 (包含 .value) 与 v6+ (直接返回文档)
    const result: any = (rawResult && typeof rawResult === 'object' && 'value' in rawResult) 
      ? (rawResult as any).value 
      : rawResult

    return res.status(200).json({ id: articleId, views: result?.views ?? 1 })
  }

    // ==================== GET：查询（单条 / 批量） ====================
    if (req.method === 'GET') {
      const rawIds = req.query.ids as string | undefined
      const singleId = req.query.id as string | undefined

      // 批量查询（列表页专用）
      if (rawIds) {
        const idList = rawIds.split(',').map(id => id.trim()).filter(Boolean)
        const numIds = idList.map(id => Number(id)).filter(id => !isNaN(id))

        // 仅查询需要字段，提升查询性能
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

      // 单篇查询
      if (singleId) {
        const articleId = !isNaN(Number(singleId)) ? Number(singleId) : singleId
        const record = await collection.findOne(
          { $or: [{ articleId: articleId }, { articleId: String(articleId) }] },
          { projection: { _id: 0, views: 1 } }
        )
        return res.status(200).json({ id: articleId, views: record?.views ?? 0 })
      }

      // 默认查全部
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