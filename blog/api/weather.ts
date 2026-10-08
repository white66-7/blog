import type { VercelRequest, VercelResponse } from '@vercel/node'

/**
 * 天气代理接口：前端只请求本站 /api/weather?lat=..&lon=..
 *
 * 为什么放到服务端：
 *  1. 浏览器直连 wttr.in / open-meteo 会撞上跨域、被墙、限流，之前“两个地区一直转圈”就是这个原因；
 *  2. 服务端可以聚合多个数据源，一个挂了立刻换下一个；
 *  3. 走 Vercel 边缘缓存（s-maxage），同一地区短时间内重复切换直接命中缓存，不给上游添压力。
 *
 * 返回：{ ok: true, temp, type, desc, source, fetchedAt } 或 { ok: false, error }
 * 失败也返回 HTTP 200（沿用本站其它接口的约定），前端只判断 ok 字段。
 */

type WeatherType = 'sun' | 'rain' | 'snow' | 'thunder' | 'wind'

interface WeatherPayload {
  type: WeatherType
  temp: number
  desc: string
  source: 'open-meteo' | 'wttr.in'
}

/** 单个数据源的超时时间，两个源叠加仍远小于 Vercel 函数默认 10s 上限 */
const SOURCE_TIMEOUT = 3500

const TYPE_LABEL: Record<WeatherType, string> = {
  sun: 'Sunny',
  rain: 'Rain',
  snow: 'Snow',
  thunder: 'Storms',
  wind: 'Windy',
}

/** WMO 天气代码 → 卡片内置天气类型 */
function wmoToType(code: number): WeatherType {
  if (code === 0 || code === 1) return 'sun'
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return 'snow'
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return 'rain'
  if (code >= 95) return 'thunder'
  return 'wind'
}

/** wttr.in 的英文描述 → 卡片内置天气类型 */
function descToType(desc: string): WeatherType {
  const text = desc.toLowerCase()
  if (text.includes('sunny') || text.includes('clear')) return 'sun'
  if (text.includes('snow') || text.includes('sleet') || text.includes('ice') || text.includes('blizzard')) return 'snow'
  if (text.includes('thunder') || text.includes('storm')) return 'thunder'
  if (text.includes('rain') || text.includes('drizzle') || text.includes('shower')) return 'rain'
  return 'wind'
}

/** 数据源 1：open-meteo（免密钥、支持跨域、国内基本可直连） */
async function fetchFromOpenMeteo(lat: number, lon: number): Promise<WeatherPayload> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    '&current=temperature_2m,weather_code&timezone=auto'

  const res = await fetch(url, { signal: AbortSignal.timeout(SOURCE_TIMEOUT) })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const data = (await res.json()) as any
  const temp = Number(data?.current?.temperature_2m)
  if (!Number.isFinite(temp)) throw new Error('返回数据缺少温度字段')

  const code = Number(data?.current?.weather_code)
  const type = wmoToType(Number.isFinite(code) ? code : -1)
  return { type, temp: Math.round(temp), desc: TYPE_LABEL[type], source: 'open-meteo' }
}

/** 数据源 2：wttr.in 兜底 */
async function fetchFromWttr(lat: number, lon: number): Promise<WeatherPayload> {
  const url = `https://wttr.in/${lat},${lon}?format=j1`

  const res = await fetch(url, {
    signal: AbortSignal.timeout(SOURCE_TIMEOUT),
    headers: { 'User-Agent': 'curl/8.0.1' }, // wttr.in 对浏览器 UA 会返回网页版，这里固定成 curl
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)

  const data = (await res.json()) as any
  const current = data?.current_condition?.[0]
  const temp = Number(current?.temp_C)
  if (!Number.isFinite(temp)) throw new Error('返回数据缺少温度字段')

  const type = descToType(String(current?.weatherDesc?.[0]?.value ?? ''))
  return { type, temp: Math.round(temp), desc: TYPE_LABEL[type], source: 'wttr.in' }
}

const SOURCES = [fetchFromOpenMeteo, fetchFromWttr]

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  if (req.method === 'OPTIONS') return res.status(200).end()

  const lat = Number(req.query.lat)
  const lon = Number(req.query.lon)
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
    return res.status(400).json({ ok: false, error: 'Invalid lat/lon' })
  }

  const errors: string[] = []
  for (const source of SOURCES) {
    try {
      const payload = await source(lat, lon)
      res.setHeader('Cache-Control', 'public, s-maxage=600, stale-while-revalidate=1800')
      return res.status(200).json({ ok: true, ...payload, fetchedAt: Date.now() })
    } catch (error: any) {
      errors.push(`${source.name}: ${error?.message || error}`)
    }
  }

  console.error('[Weather API] 所有数据源均失败:', errors.join(' | '))
  res.setHeader('Cache-Control', 'no-store')
  return res.status(200).json({ ok: false, error: errors.join(' | ') })
}
