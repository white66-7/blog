import type { VercelRequest, VercelResponse } from '@vercel/node'
import { MongoClient, Db } from 'mongodb'
import process from 'node:process'

const uri = process.env.MONGODB_URI || ''
let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
  if (cachedClient && cachedDb) return { client: cachedClient, db: cachedDb }
  if (!uri) throw new Error('MONGODB_URI not configured')

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 3000,
    connectTimeoutMS: 3000,
    maxPoolSize: 10
  })
  await client.connect()
  const db = client.db()
  cachedClient = client
  cachedDb = db
  return { client, db }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
  if (req.method === 'OPTIONS') return res.status(200).end()

  try {
    const { db } = await connectToDatabase()
    const collection = db.collection('github_commits')

    // 💡 查询库中全部记录（上限可提升到 3000+ 条）
    const dbCommits = await collection
      .find({})
      .sort({ commitDate: -1 })
      .limit(3000)
      .toArray()

    const result = dbCommits.map(item => ({
      commitDate: item.commitDate ? new Date(item.commitDate).toISOString() : new Date().toISOString(),
      message: item.message || 'Update code',
      repoName: item.repoName || 'repo',
      url: item.url || ''
    }))

    return res.status(200).json(result)
  } catch (error: any) {
    console.error('[Timeline Handler Error]:', error.message)
    return res.status(200).json([])
  }
}