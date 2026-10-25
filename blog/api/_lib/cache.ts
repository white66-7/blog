import { cacheGet, cacheSet } from './redis.js'


export const CACHE_KEYS = {
  /** 全部文章的浏览量映射 */
  viewsAll: 'views:all:v1',
  /** GitHub 提交时间线 */
  timeline: 'commits:timeline:v1',
  /** GitHub 贡献热力图 */
  contributions: 'github:contributions:v1',
  /** 审核通过的留言列表 */
  signalsApproved: 'signals:approved:v1',
  /** 天气按坐标缓存，保留两位小数约等于 1km 精度 */
  weather: (lat: number, lon: number) => `weather:${lat.toFixed(2)}:${lon.toFixed(2)}`,
  /** 留言提交限流键 */
  signalsRateLimit: (ipHash: string) => `ratelimit:signals:${ipHash}`,
}

/** 各类数据的缓存时长 */
export const CACHE_TTL = {
  views: 120,
  timeline: 600,
  contributions: 1800,
  signals: 60,
  weather: 600,
}

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
