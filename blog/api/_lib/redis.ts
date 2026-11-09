import { Redis } from '@upstash/redis'
import process from 'node:process'

// Vercel Serverless 上的 Redis 客户端
const REST_URL = (
  process.env.UPSTASH_REDIS_REST_URL ||
  process.env.KV_REST_API_URL ||
  ''
)
  .trim()
  .replace(/\/+$/, '')

const REST_TOKEN = (
  process.env.UPSTASH_REDIS_REST_TOKEN ||
  process.env.KV_REST_API_TOKEN ||
  ''
).trim()

// 运行环境
// 本地没配是blog
// 远程配了是prod
const KEY_PREFIX = (process.env.REDIS_KEY_PREFIX || 'blog').trim().replace(/:+$/, '') || 'blog'

const parsedTimeout = Number(process.env.REDIS_TIMEOUT_MS)
const COMMAND_TIMEOUT_MS = Number.isFinite(parsedTimeout) && parsedTimeout > 0 ? parsedTimeout : 1200

/** 设为 true 临时关闭所有缓存 */
const CACHE_DISABLED = process.env.CACHE_DISABLED === 'true'

export const redisEnabled = Boolean(REST_URL && REST_TOKEN) && !CACHE_DISABLED

let lastWarnAt = 0

/** 限流日志 */
function warn(message: string) {
  const now = Date.now()
  if (now - lastWarnAt < 60_000) return
  lastWarnAt = now
  console.warn('[Redis]', message)
}

function prefixKey(name: string): string {
  return `${KEY_PREFIX}:${name}`
}

// redisEnabled 判断后新建客户端
export function getRedis(): Redis {
  if (!REST_URL || !REST_TOKEN) {
    throw new Error('未配置 URL 或 TOKEN')
  }

  return new Redis({
    url: REST_URL,
    token: REST_TOKEN,
    // 是否把多个命令合并成一个 HTTP 请求
    enableAutoPipelining: false,
    // HTTP 请求失败是否自动重试
    retry: false,
    signal: () => AbortSignal.timeout(COMMAND_TIMEOUT_MS),
  })
}

/** 读取缓存 */
export async function cacheGet<T>(name: string): Promise<T | null> {
  if (!redisEnabled) return null

  try {
    const value = await getRedis().get<T>(prefixKey(name))
    return value ?? null
  } catch (error: any) {
    warn(error?.message || String(error))
    return null
  }
}

/** 写入 JSON  */
export async function cacheSet(name: string, value: unknown, ttlSeconds: number): Promise<boolean> {
  if (!redisEnabled || value === undefined) return false

  try {
    const ttl = Math.max(1, Math.round(ttlSeconds))
    await getRedis().set(prefixKey(name), value, { ex: ttl })
    return true
  } catch (error: any) {
    warn(error?.message || String(error))
    return false
  }
}

/** 删除一个或多个缓存键 */
export async function cacheDel(...names: string[]): Promise<boolean> {
  if (!redisEnabled || names.length === 0) return true

  try {
    await getRedis().del(...names.map(prefixKey))
    return true
  } catch (error: any) {
    warn(error?.message || String(error))
    return false
  }
}

// 类型声明约定
export interface RateLimitResult {
  /** 本窗口内是否已经超限 */
  limited: boolean
  /** 距离窗口结束还剩多少秒，用于提示用户 */
  retryAfter: number
  /** 当前窗口内已计数的请求次数 */
  count: number
}

export async function hitRateLimit(name: string, windowSeconds: number): Promise<RateLimitResult | null> {
  if (!redisEnabled) return null

  const window = Math.max(1, Math.round(windowSeconds))
  const script = [
    "local count = redis.call('INCR', KEYS[1])",
    "if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end",
    "local ttl = redis.call('TTL', KEYS[1])",
    'return {count, ttl}',
  ].join('\n')

  try {
    const result = await getRedis().eval(script, [prefixKey(name)], [String(window)])
    if (!Array.isArray(result)) return null

    const count = Number(result[0])
    const ttl = Number(result[1])
    if (!Number.isFinite(count)) return null

    return {
      limited: count > 1,
      retryAfter: Number.isFinite(ttl) && ttl > 0 ? ttl : window,
      count,
    }
  } catch (error: any) {
    warn(error?.message || String(error))
    return null
  }
}
