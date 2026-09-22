import type { VercelRequest, VercelResponse } from '@vercel/node'
import { connectToDatabase } from './_lib/mongodb.js'
import process from 'node:process'

// 从环境变量读取音乐专属密钥
const SECRET_KEY = process.env.MUSIC_SECRET

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const { db } = await connectToDatabase()
    const collection = db.collection('music_share')

    // -------------------------------------------------------------
    // POST: 安卓 App 操作
    // -------------------------------------------------------------
    if (req.method === 'POST') {
      const { content, secret, action } = req.body || {}

      if (secret !== SECRET_KEY) {
        return res.status(401).json({ error: 'Unauthorized: Invalid secret' })
      }

      // 1. 点击“下线”：直接把状态改为 false，清空内容
      if (action === 'stop') {
        await collection.updateOne(
          { key: 'latest_music' },
          {
            $set: {
              isActive: false,
              content: '',
              updatedAt: new Date()
            }
          },
          { upsert: true }
        )
        return res.status(200).json({ success: true, message: '已下线' })
      }

      // 2. 点击“上传”：设置状态为 true，更新内容
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid content' })
      }

      await collection.updateOne(
        { key: 'latest_music' },
        {
          $set: {
            isActive: true,
            content: content.trim(),
            updatedAt: new Date()
          }
        },
        { upsert: true }
      )

      return res.status(200).json({ success: true, message: '上线成功' })
    }

// -------------------------------------------------------------
    // GET: 网页前端弹窗读取状态
    // -------------------------------------------------------------
    if (req.method === 'GET') {
      const record = await collection.findOne(
        { key: 'latest_music' },
        { projection: { _id: 0, content: 1, updatedAt: 1, isActive: 1 } }
      )

      // 使用 optional chaining 防止 null 报错
      const isListening = Boolean(record?.isActive && record?.content)
      const content = isListening && record?.content ? String(record.content) : ''

      return res.status(200).json({
        isListening,
        content,
        updatedAt: record?.updatedAt || null
      })
    }

    return res.status(405).json({ error: `Method ${req.method} Not Allowed` })

  } catch (error: any) {
    console.error('[Music API Error]:', error.message)
    return res.status(200).json({ isListening: false, content: '', error: error.message })
  }
}