import type { VercelRequest, VercelResponse } from '@vercel/node'
import { MongoClient, Db } from 'mongodb'
import process from 'node:process'

// ==================== 1. 复用 MongoDB 连接池 ====================
const uri = process.env.MONGODB_URI || ''
let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  if (!uri) {
    throw new Error('未配置 MONGODB_URI 环境变量')
  }

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000,
  })

  await client.connect()
  const db = client.db()

  cachedClient = client
  cachedDb = db
  return { client, db }
}

// ==================== 2. 云函数 Handler ====================
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const { db } = await connectToDatabase()
    
    // 对应 Spring Boot 实体类的 MongoDB 集合名
    // 如果你在实体类上使用了 @Document(collection = "xxx")，这里填对应的集合名
    // Spring Boot 默认集合名一般是 githubCommit 或 github_commits
    const collection = db.collection('github_commits')

    // 从数据库中按 commitDate 倒序查询最近的 150 条 commit
    const commitsFromDb = await collection
      .find({})
      .sort({ commitDate: -1 })
      .limit(150)
      .toArray()

    // 格式化为前端 timeline 组件需要的数据格式
    const result = commitsFromDb.map(item => ({
      commitDate: item.commitDate ? new Date(item.commitDate).toISOString() : new Date().toISOString(),
      message: item.message || 'Update code',
      repoName: item.repoName || 'repository',
      url: item.url || ''
    }))

    return res.status(200).json(result)
  } catch (error: any) {
    console.error('[Timeline Mongo Error]:', error.message)
    // 数据库若异常返回空数组，避免前端崩溃
    return res.status(200).json([])
  }
}