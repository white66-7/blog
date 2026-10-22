import { connectToDatabase } from './_lib/mongodb.js'
import { ObjectId } from 'mongodb'
import { createHash } from 'node:crypto'
import { cacheDel, hitRateLimit } from './_lib/redis.js'
import { cached, CACHE_KEYS, CACHE_TTL } from './_lib/cache.js'

const RATE_LIMIT_WINDOW_SECONDS = 60

// Redis 不可用时退化为进程内限流（只能挡住同一实例的请求，聊胜于无）
const ipRateLimitMap = new Map<string, number>()

function hitMemoryRateLimit(ip: string, windowMs: number): number {
  const now = Date.now()

  // 惰性清理，避免 setInterval 在 Serverless 实例里常驻、影响函数冻结
  for (const [key, timestamp] of ipRateLimitMap) {
    if (now - timestamp >= windowMs) ipRateLimitMap.delete(key)
  }

  const lastSubmitTime = ipRateLimitMap.get(ip)
  if (lastSubmitTime !== undefined && now - lastSubmitTime < windowMs) {
    return Math.ceil((windowMs - (now - lastSubmitTime)) / 1000)
  }

  ipRateLimitMap.set(ip, now)
  return 0
}

function getClientIp(req: any): string {
  return (
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown'
  )
}

// 提交留言 
async function createSignal(req: any, res: any) {
  try {
    const clientIp = getClientIp(req)

    // IP 只以哈希形式进入 Redis，避免在缓存里留下明文地址
    const ipHash = createHash('sha256').update(clientIp).digest('hex').slice(0, 16)
    const rateLimit = await hitRateLimit(
      CACHE_KEYS.signalsRateLimit(ipHash),
      RATE_LIMIT_WINDOW_SECONDS,
    )

    if (rateLimit?.limited) {
      return res.status(429).json({ error: `提交太频繁，请等待 ${rateLimit.retryAfter} 秒后重试` })
    }

    // Redis 未配置或调用失败时，退回当前实例的内存限流
    if (rateLimit === null) {
      const waitSeconds = hitMemoryRateLimit(clientIp, RATE_LIMIT_WINDOW_SECONDS * 1000)
      if (waitSeconds > 0) {
        return res.status(429).json({ error: `提交太频繁，请等待 ${waitSeconds} 秒后重试` })
      }
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

// 获取留言列表 
async function getSignals(req: any, res: any) {
  try {
    const adminToken = req.headers['x-admin-token']

    if (adminToken) {
      const serverSecret = process.env.ADMIN_SECRET

      // 服务端根本没读取到环境变量
      if (!serverSecret) {
        return res.status(500).json({ 
          success: false, 
          error: '服务端未读取到 ADMIN_SECRET' 
        })
      }

      // 密码输入错误
      if (adminToken.trim() !== serverSecret.trim()) {
        return res.status(401).json({ 
          success: false, 
          error: '管理员密钥错误！' 
        })
      }

      // 密码正确
      const { db } = await connectToDatabase()
      const pendingSignals = await db.collection('signals')
        .find({ status: 'pending' })
        .sort({ createdAt: -1 })
        .toArray()

      // 顺便查一下数据库里一共有多少条数据
      const totalCount = await db.collection('signals').countDocuments()

      return res.json({ 
        success: true, 
        data: pendingSignals,
        totalInDb: totalCount // 库里的总数据量
      })
    }

    // 普通访客：只展示审核通过的留言，审核动作会主动失效这份缓存
    const signals = await cached(CACHE_KEYS.signalsApproved, CACHE_TTL.signals, async () => {
      const { db } = await connectToDatabase()
      return db.collection('signals')
        .find({ status: 'approved' }, { projection: { clientIp: 0 } })
        .sort({ createdAt: -1 })
        .limit(16)
        .toArray()
    })

    return res.json({ success: true, data: signals })
  } catch (err: any) {
    console.error('获取留言失败:', err)
    return res.status(500).json({ error: '获取留言失败: ' + err.message })
  }
}
// 管理员审核留言 
async function reviewSignal(req: any, res: any) {
  try {
    const adminToken = req.headers['x-admin-token']
    if (!process.env.ADMIN_SECRET || adminToken !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ error: '无访问权限' })
    }

    const { id, status } = req.body

    if (!id || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: '参数不完整' })
    }

    const { db } = await connectToDatabase()
    const result = await db.collection('signals').updateOne(
      { _id: new ObjectId(id) },
      { $set: { status, reviewedAt: new Date() } }
    )

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: '留言不存在' })
    }

    // 审核结果会改变访客看到的列表，立刻让缓存失效
    await cacheDel(CACHE_KEYS.signalsApproved)

    return res.json({ success: true, message: `审核完成（状态：${status}）` })
  } catch (err: any) {
    console.error('审核留言错误:', err)
    return res.status(500).json({ error: '审核操作失败' })
  }
}

// Vercel Serverless Function 默认导出入口
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
