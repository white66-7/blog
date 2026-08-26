import type { VercelRequest, VercelResponse } from '@vercel/node'
import process from 'node:process'
import { connectToDatabase } from './lib/mongodb' // 请确认您的 connectToDatabase 路径

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 设置跨域
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  // 解析 ID
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

  // 统一转为数字 ID（若非纯数字则保留字符串）
  const articleId = !isNaN(Number(rawId)) ? Number(rawId) : rawId

  try {
    const { db } = await connectToDatabase()
    const collection = db.collection('article_views')

    // 匹配数字或字符串类型的历史老数据
    const queryFilter = {
      $or: [
        { articleId: articleId },
        { articleId: String(articleId) }
      ]
    }

    let views = 0

    if (req.method === 'POST') {
      // ✅ 修复核心：必须用 $setOnInsert 确保新文档写入 articleId
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
      // GET 请求：只读
      const record = await collection.findOne(queryFilter)
      views = record?.views ?? 0
    }

    return res.status(200).json({ id: articleId, views })
  } catch (error: any) {
    console.error('[Views API Error]:', error.message)
    // 降级返回，避免前端报错崩溃
    return res.status(200).json({ id: rawId, views: 0, error: error.message })
  }
}