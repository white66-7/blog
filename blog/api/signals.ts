import { connectToDatabase } from './_lib/mongodb.js'
import { ObjectId } from 'mongodb'

// 简单的内存防刷限流
const ipRateLimitMap = new Map<string, number>()

// 每 10 分钟自动清理一次过期的 IP 记录
setInterval(() => {
  const now = Date.now()
  for (const [ip, timestamp] of ipRateLimitMap.entries()) {
    if (now - timestamp > 60 * 1000) {
      ipRateLimitMap.delete(ip)
    }
  }
}, 10 * 60 * 1000)

// 1. 提交留言 
async function createSignal(req: any, res: any) {
  try {
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

    const cleanSource = source.replace(/[\r\n]/g, '').trim().slice(0, 12)
    const cleanMessage = message.trim().slice(0, 40)

    const { db } = await connectToDatabase()

    const randomFreq = (Math.random() * 8000 + 1000).toFixed(3) + 'MHz'
    const now = new Date()
    const dateStr = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}`

    const newSignal = {
      source: cleanSource,
      message: cleanMessage,
      freq: randomFreq,
      date: dateStr,
      status: 'pending', 
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
  } catch (err: any) {
    console.error('提交留言错误:', err)
    return res.status(500).json({ error: '提交留言失败，请稍后重试' })
  }
}

// 2. 获取留言列表 (GET) 
async function getSignals(req: any, res: any) {
  try {
    const { db } = await connectToDatabase()
    const adminToken = req.headers['x-admin-token']

    // ==========================================
    // ==========================================
    if (adminToken) {
      const serverSecret = process.env.ADMIN_SECRET

      // 服务端根本没读取到环境变量
      if (!serverSecret) {
        return res.status(500).json({ 
          success: false, 
          error: '服务端未读取到 ADMIN_SECRET！如果你刚在 Vercel 添加了变量，必须去 Deployments 点一次【Redeploy（重新部署）】才能生效！' 
        })
      }

      // 诊断 2：密码输入错误
      if (adminToken.trim() !== serverSecret.trim()) {
        return res.status(401).json({ 
          success: false, 
          error: '管理员密钥错误！请检查输入的密码是否与 Vercel 中的配置完全一致。' 
        })
      }

      // 诊断 3：密码完全正确，查询 pending 数据
      const pendingSignals = await db.collection('signals')
        .find({ status: 'pending' })
        .sort({ createdAt: -1 })
        .toArray()

      // 顺便查一下数据库里一共有多少条数据（方便排查）
      const totalCount = await db.collection('signals').countDocuments()

      return res.json({ 
        success: true, 
        data: pendingSignals,
        totalInDb: totalCount // 库里的总数据量
      })
    }
    // B. 普通访客（无 x-admin-token 头）：只返回已审核通过的留言
    const signals = await db.collection('signals')
      .find({ status: 'approved' }, { projection: { clientIp: 0 } })
      .sort({ createdAt: -1 })
      .limit(16)
      .toArray()

    return res.json({ success: true, data: signals })
  } catch (err: any) {
    console.error('获取留言失败:', err)
    return res.status(500).json({ error: '获取留言失败: ' + err.message })
  }
}
// 3. 管理员审核留言 (PATCH)
async function reviewSignal(req: any, res: any) {
  try {
    const adminToken = req.headers['x-admin-token']
    if (!process.env.ADMIN_SECRET || adminToken !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: '无访问权限' })
    }

    const { id, status } = req.body

    if (!id || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: '参数不完整或状态无效' })
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
  } catch (err: any) {
    console.error('审核留言错误:', err)
    return res.status(500).json({ error: '审核操作失败' })
  }
}

// ==========================================
// Vercel Serverless Function 必须的默认导出入口
// ==========================================
export default async function handler(req: any, res: any) {
  switch (req.method) {
    case 'GET':
      return await getSignals(req, res)
    case 'POST':
      return await createSignal(req, res)
    case 'PATCH':
      return await reviewSignal(req, res)
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PATCH'])
      return res.status(405).json({ error: `不支持的方法: ${req.method}` })
  }
}