import { connectToDatabase } from './_lib/mongodb.js'
import { ObjectId } from 'mongodb'

// 简单的内存防刷限流（记录 IP 和最后提交时间）
const ipRateLimitMap = new Map<string, number>()

// 每 10 分钟自动清理一次过期的 IP 记录，防止内存泄漏
setInterval(() => {
  const now = Date.now()
  for (const [ip, timestamp] of ipRateLimitMap.entries()) {
    if (now - timestamp > 60 * 1000) {
      ipRateLimitMap.delete(ip)
    }
  }
}, 10 * 60 * 1000)

/**
 * 1. 提交留言 (POST /api/signals)
 */
export async function createSignal(req: any, res: any) {
  try {
    // 防刷限制：同 IP 1 分钟内只能提交 1 次
    const clientIp = 
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 
      req.socket.remoteAddress || 
      'unknown'

    const lastSubmitTime = ipRateLimitMap.get(clientIp)
    const nowTimestamp = Date.now()

    if (lastSubmitTime && nowTimestamp - lastSubmitTime < 60 * 1000) {
      const waitSeconds = Math.ceil((60 * 1000 - (nowTimestamp - lastSubmitTime)) / 1000)
      return res.status(429).json({ error: `提交太频繁，请等待 ${waitSeconds} 秒后再试` })
    }

    const { source, message } = req.body

    if (!source?.trim() || !message?.trim()) {
      return res.status(400).json({ error: '昵称和留言内容不能为空' })
    }

    // 过滤换行符与多余空格，限制字符长度
    const cleanSource = source.replace(/[\r\n]/g, '').trim().slice(0, 12)
    const cleanMessage = message.trim().slice(0, 40)

    const { db } = await connectToDatabase()

    // 保留频段数值仅用于星空卡片上的数字装饰
    const randomFreq = (Math.random() * 8000 + 1000).toFixed(3) + 'MHz'
    const now = new Date()
    const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}`

    const newSignal = {
      source: cleanSource,
      message: cleanMessage,
      freq: randomFreq,
      date: dateStr,
      status: 'pending', // pending: 待审核 / approved: 已通过 / rejected: 已拒绝
      clientIp,
      createdAt: now
    }

    const result = await db.collection('signals').insertOne(newSignal)
    ipRateLimitMap.set(clientIp, nowTimestamp)

    return res.json({ 
      success: true, 
      id: result.insertedId, 
      message: '留言提交成功，待审核后展示' 
    })
  } catch (err) {
    return res.status(500).json({ error: '提交留言失败，请稍后重试' })
  }
}

/**
 * 2. 获取已审核的留言列表 (GET /api/signals)
 */
export async function getApprovedSignals(req: any, res: any) {
  try {
    const { db } = await connectToDatabase()
    const signals = await db.collection('signals')
      .find(
        { status: 'approved' },
        { projection: { clientIp: 0 } } // 隐藏客户端 IP 等隐私数据
      )
      .sort({ createdAt: -1 })
      .limit(14) // 最多展示 14 条
      .toArray()

    return res.json({ success: true, data: signals })
  } catch (err) {
    return res.status(500).json({ error: '获取留言列表失败' })
  }
}

/**
 * 3. 管理员审核留言 (PATCH /api/admin/signals/:id)
 * 请求体: { status: 'approved' | 'rejected' }
 */
export async function reviewSignal(req: any, res: any) {
  try {
    // 简易鉴权：验证管理员密钥
    const adminToken = req.headers['x-admin-token']
    if (!process.env.ADMIN_SECRET || adminToken !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: '无访问权限' })
    }

    const { id } = req.params || req.query
    const { status } = req.body

    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: '无效的审核状态' })
    }

    const { db } = await connectToDatabase()
    const result = await db.collection('signals').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, reviewedAt: new Date() } }
    )

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: '留言不存在' })
    }

    return res.json({ success: true, message: `审核完成（状态：${status}）` })
  } catch (err) {
    return res.status(500).json({ error: '审核操作失败' })
  }
}