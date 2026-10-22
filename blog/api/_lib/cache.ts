import { cacheGet, cacheSet } from './redis.js'

/**
 * 缓存键统一收口，避免各个接口里散落字符串导致失效逻辑对不上。
 * 键名末尾带版本号，将来数据结构变化时改版本即可整体作废旧缓存。
 */
export const CACHE_KEYS = {
  /** 全部文章的浏览量映射 { [articleId]: views } */
  viewsAll: 'views:all:v1',
  /** GitHub 提交时间线（cron 同步后会主动失效） */
  timeline: 'commits:timeline:v1',
  /** GitHub 贡献热力图（GraphQL 有速率限制，适合长缓存） */
  contributions: 'github:contributions:v1',
  /** 审核通过的留言列表 */
  signalsApproved: 'signals:approved:v1',
  /** 天气按坐标缓存，保留两位小数约等于 1km 精度 */
  weather: (lat: number, lon: number) => `weather:${lat.toFixed(2)}:${lon.toFixed(2)}`,
  /** 留言提交限流键（ip 传哈希，避免把明文 IP 写进 Redis） */
  signalsRateLimit: (ipHash: string) => `ratelimit:signals:${ipHash}`,
}

/** 各类数据的缓存时长（秒） */
export const CACHE_TTL = {
  /** 浏览量：前端会带 _t 时间戳绕过浏览器/CDN 缓存，这里只挡住数据库压力 */
  views: 120,
  /** 时间线：每天 cron 同步，10 分钟兜底 */
  timeline: 600,
  /** 贡献热力图：GitHub API 限额，缓存 30 分钟 */
  contributions: 1800,
  /** 留言列表：审核后主动失效，60 秒兜底 */
  signals: 60,
  /** 天气：跟随接口原本的 s-maxage=600 */
  weather: 600,
}

/**
 * 读缓存 → 未命中则执行 loader → 回写缓存。
 */
export async function cached<T>(
  key: string,
  ttlSeconds: number,
  loader: () => Promise<T>,
  shouldCache: (value: T) => boolean = () => true,
): Promise<T> {
  const hit = await cacheGet<T>(key)
  if (hit !== null) return hit

  const value = await loader()
  if (shouldCache(value)) {
    await cacheSet(key, value, ttlSeconds)
  }
  return value
}
