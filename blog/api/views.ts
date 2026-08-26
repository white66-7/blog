import type { VercelRequest, VercelResponse } from '@vercel/node'
import process from 'node:process'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 设置跨域
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  // 解析 ID（兼容 ?id=xxx 或 /api/views/xxx）
  let id = req.query.id as string | undefined
  if (!id && req.url) {
    const urlParts = req.url.split('?')[0]?.split('/') || []
    const lastPart = urlParts[urlParts.length - 1]
    if (lastPart && lastPart !== 'views') {
      id = lastPart
    }
  }

  if (!id) {
    return res.status(200).json({ id: 'unknown', views: 0 })
  }

  const uri = process.env.MONGODB_URI
  if (!uri) {
    console.warn('[Views API] 环境变量 MONGODB_URI 未配置')
    return res.status(200).json({ id, views: 0 })
  }

  try {
    const { MongoClient } = await import('mongodb')
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 3000,
      connectTimeoutMS: 3000,
    })

    await client.connect()
    const db = client.db()
    const collection = db.collection('article_views')

    // 兼容数字和字符串类型的 articleId
    const queryFilter = {
      $or: [
        { articleId: String(id) },
        { articleId: Number(id) }
      ]
    }

    let views = 0

    if (req.method === 'POST') {
      // ✅ POST 请求：阅读量 +1（如果没有记录则自动创建并将 views 设为 1）
      const result = await collection.findOneAndUpdate(
        queryFilter,
        { $inc: { views: 1 } },
        { upsert: true, returnDocument: 'after' }
      )
      views = result?.views ?? 1
    } else {
      // ✅ GET 请求：只读取阅读量，不自增
      const record = await collection.findOne(queryFilter)
      views = record?.views ?? 0
    }

    await client.close()
    return res.status(200).json({ id, views })
  } catch (error: any) {
    console.error('[Views API Error]:', error.message)
    return res.status(200).json({ id, views: 0, warning: error.message })
  }
}