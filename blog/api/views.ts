import type { VercelRequest, VercelResponse } from '@vercel/node'
import { MongoClient, Db } from 'mongodb'
import process from 'node:process'

// ==================== 1. 数据库连接池与缓存逻辑（内置在当前文件） ====================
const uri = process.env.MONGODB_URI || ''
let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  if (!uri) {
    throw new Error('未检测到环境变量 MONGODB_URI，请在 Vercel 控制台配置')
  }

  // 创建客户端连接并复用
  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  })

  await client.connect()
  const db = client.db() // 默认连接 URI 中的数据库

  cachedClient = client
  cachedDb = db
  return { client, db }
}

// ==================== 2. 云函数主 Handler ====================
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 设置跨域响应头
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // 处理浏览器的 OPTIONS 预检请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  // 解析文章 ID（优先从 query 获取，若没有则从 URL 路径获取）
  let rawId = req.query.id as string | undefined
  if (!rawId && req.url) {
    const urlParts = req.url.split('?')[0]?.split('/') || []
    const lastPart = urlParts[urlParts.length - 1]
    if (lastPart && lastPart !== 'views') {
      rawId = lastPart
    }
  }

  if (!rawId) {
    return res.status(400).json({ error: 'Missing article ID', views: 0 })
  }

  // 统一转成数字（如果纯数字）或保持字符串
  const articleId = !isNaN(Number(rawId)) ? Number(rawId) : rawId

  try {
    const { db } = await connectToDatabase()
    const collection = db.collection('article_views')

    // 兼容历史记录中数字或字符串格式的 articleId
    const queryFilter = {
      $or: [
        { articleId: articleId },
        { articleId: String(articleId) }
      ]
    }

    let views = 0

    if (req.method === 'POST') {
      // ✅ 自增阅读量：使用 $setOnInsert 保证初次插入时必须写入 articleId
      const result = await collection.findOneAndUpdate(
        queryFilter,
        {
          $inc: { views: 1 },
          $setOnInsert: { articleId: articleId }
        },
        { upsert: true, returnDocument: 'after' }
      )
      views = result?.views ?? 1
    } else {
      // ✅ GET 只读查询：不自增
      const record = await collection.findOne(queryFilter)
      views = record?.views ?? 0
    }

    return res.status(200).json({ id: articleId, views })
  } catch (error: any) {
    console.error('[Views API Error]:', error.message)
    return res.status(500).json({
      id: rawId,
      views: 0,
      error: error.message
    })
  }
}