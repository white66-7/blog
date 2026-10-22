import { Redis } from '@upstash/redis'
import process from 'node:process'

/**
 * Vercel Serverless 上的 Redis 客户端。
 */

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

const KEY_PREFIX = (process.env.REDIS_KEY_PREFIX || 'blog').trim().replace(/:+$/, '') || 'blog'

const parsedTimeout = Number(process.env.REDIS_TIMEOUT_MS)
const COMMAND_TIMEOUT_MS = Number.isFinite(parsedTimeout) && parsedTimeout > 0 ? parsedTimeout : 1200

/** 设为 true 可临时关闭所有缓存（排障时很有用） */
const CACHE_DISABLED = process.env.CACHE_DISABLED === 'true'

export const redisEnabled = Boolean(REST_URL && REST_TOKEN) && !CACHE_DISABLED

let lastWarnAt = 0

/** 限流日志，避免 Redis 故障时把 Vercel 日志刷爆 */
function warn(message: string) {
  const now = Date.now()
  if (now - lastWarnAt < 60_000) return
  lastWarnAt = now
  console.warn('[Redis]', message)
}

function prefixKey(name: string): string {
  return `${KEY_PREFIX}:${name}`
}

/**
 * 每次调用都新建客户端；未配置时抛错，调用方会先用 redisEnabled 判断，
 * 因此正常路径不会走到异常分支。
 */
export function getRedis(): Redis {
  if (!REST_URL || !REST_TOKEN) {
    throw new Error('[Redis] 未配置 UPSTASH_REDIS_REST_URL 或 UPSTASH_REDIS_REST_TOKEN')
  }

  return new Redis({
    url: REST_URL,
    token: REST_TOKEN,
    // 每次调用都是新客户端，没有可合并的命令；关闭自动 pipeline，避免无谓的批处理延迟
    enableAutoPipelining: false,
    // 缓存失败不应该拖慢接口：不重试，单条命令超时后直接降级
    retry: false,
    signal: () => AbortSignal.timeout(COMMAND_TIMEOUT_MS),
  })
}

/** 读取 JSON 缓存，未命中 / 解析失败 / Redis 不可用时返回 null */
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

/** 写入 JSON 缓存，带过期时间（秒） */
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

export interface RateLimitResult {
  /** 本窗口内是否已经超限 */
  limited: boolean
  /** 距离窗口结束还剩多少秒，用于提示用户 */
  retryAfter: number
  /** 当前窗口内已计数的请求次数 */
  count: number
}

/**
 * 固定窗口限流：INCR + 首次 EXPIRE，用 Lua 保证原子性，一次往返完成。
 * Redis 不可用时返回 null，由调用方决定是否降级到进程内内存限流。
 */
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
