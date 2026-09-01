import { MongoClient, Db } from 'mongodb'
import * as dns from 'node:dns'
import process from 'node:process'


const DNS_SERVERS = (process.env.DNS_SERVERS || '').split(',').map(s => s.trim()).filter(Boolean)
if (DNS_SERVERS.length) {
  try { dns.setServers(DNS_SERVERS) } catch (e: any){ console.warn('Invalid DNS_SERVERS, using system defaults:', e.message)}
}

const uri = process.env.MONGODB_URI || ''
let cachedClient: MongoClient | null = null //调度中心
let cachedDb: Db | null = null   //具体数据库

export async function connectToDatabase() {
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable') //报错并终端程序
  }

  const client = new MongoClient(uri, {
    serverSelectionTimeoutMS: 3000,
    connectTimeoutMS: 3000,
    maxPoolSize: 10,
  })
  await client.connect()
  const db = client.db() // 连接指定的数据库(括号里写库名称)

  cachedClient = client
  cachedDb = db
  return { client, db }
}