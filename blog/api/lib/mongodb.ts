import { MongoClient, Db } from 'mongodb'

const uri = process.env.MONGODB_URI || ''
let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable')
  }

  const client = new MongoClient(uri)
  await client.connect()
  const db = client.db() // 默认连接 URI 中指定的数据库

  cachedClient = client
  cachedDb = db
  return { client, db }
}