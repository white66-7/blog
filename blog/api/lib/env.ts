import dotenv from 'dotenv'
import path from 'node:path'
import process from 'node:process'
import dns from 'node:dns' // 👈 1. 引入 dns 模块

// 👈 2. 让当前 Node 进程优先向阿里/谷歌 DNS 询问 SRV 记录，不改动电脑系统！
dns.setServers(['223.5.5.5', '8.8.8.8', '114.114.114.114'])

// 本地开发加载环境变量
dotenv.config({ path: path.resolve(process.cwd(), '.env.local'), quiet: true })
dotenv.config({ path: path.resolve(process.cwd(), '.env'), quiet: true })