import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {

  console.log('[DEBUG ENV KEYS]:', Object.keys(process.env).filter(k => k.includes('MONGO') || k.includes('GITHUB') || k.includes('VERCEL')))
  // 设置跨域
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
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

  // 如果没有配 MONGODB_URI，直接安全返回 0
  if (!uri) {
    console.warn('[Views API] 环境变量 MONGODB_URI 未配置')
    return res.status(200).json({ id, views: 0 })
  }

  try {
    // 采用动态引入，防止顶级静态导入崩溃
    const { MongoClient } = await import('mongodb')
    
    const client = new MongoClient(uri, {
      serverSelectionTimeoutMS: 2500,
      connectTimeoutMS: 2500,
    })

    await client.connect()
    const db = client.db()
    const collection = db.collection('article_views')

    // 查询对应文章的浏览量
    const record = await collection.findOne({ articleId: id })
    const views = record?.views ?? 0

    // 关闭连接或保持连接
    await client.close()

    return res.status(200).json({ id, views })
  } catch (error: any) {
    console.error('[Views API Error]:', error.message)
    // 发生任何异常均安全降级，返回 200 与 views: 0，绝不抛 500！
    return res.status(200).json({ id, views: 0, warning: error.message })
  }
}