export interface LyricLine {
  time: number  // 秒
  text: string
  translation?: string
}

/** 解码歌词文本：优先 UTF-8，若出现替换符 U+FFFD 则回退 GBK（兼容常见中文歌词编码） */
export function decodeLrc(buf: ArrayBuffer): string {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(buf)
  } catch {
    try {
      return new TextDecoder('gbk').decode(buf)
    } catch {
      return new TextDecoder('utf-8').decode(buf)
    }
  }
}

// 匹配一行里的所有时间戳标签，如 [00:12.34] / [1:02:3] / [00:12]
const TIME_TAG = /\[(\d{1,3}):(\d{1,2})(?:\.(\d{1,3}))?\]/g
// 元数据标签，如 [ti:标题] / [ar:歌手] / [offset:+500]
const META_TAG = /^\[[a-zA-Z]+:[^\]]*\]/

/** 解析 .lrc 歌词文本，返回按时间升序排列的歌词行 */
export function parseLrc(text: string): LyricLine[] {
  if (!text) return []
  const rawList: { time: number; text: string }[] = []
  let offsetMs = 0

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim()
    if (!line) continue

    const offsetMatch = /^\[offset:\s*([+-]?\d+)\s*\]/i.exec(line)
    if (offsetMatch) {
      offsetMs = parseInt(offsetMatch[1] ?? '0', 10) || 0
      continue
    }

    if (!TIME_TAG.test(line) && META_TAG.test(line)) {
      TIME_TAG.lastIndex = 0
      continue
    }
    TIME_TAG.lastIndex = 0

    const tags: number[] = []
    let m: RegExpExecArray | null
    while ((m = TIME_TAG.exec(line)) !== null) {
      const min = parseInt(m[1] ?? '0', 10)
      const sec = parseInt(m[2] ?? '0', 10)
      const fracStr = m[3] || ''
      let frac = 0
      if (fracStr.length === 1) frac = parseInt(fracStr, 10) / 10
      else if (fracStr.length === 2) frac = parseInt(fracStr, 10) / 100
      else if (fracStr.length >= 3) frac = parseInt(fracStr.slice(0, 3), 10) / 1000
      tags.push(min * 60 + sec + frac + offsetMs / 1000)
    }

    if (!tags.length) continue

    const textContent = line.replace(TIME_TAG, '').trim()
    for (const t of tags) {
      rawList.push({ time: t, text: textContent })
    }
  }

  // 1. 按时间升序排序
  rawList.sort((a, b) => a.time - b.time)

  // 2. 合并相同时间戳的行（第一行为原文，第二行为译文）
  const result: LyricLine[] = []
  for (const item of rawList) {
    const last = result[result.length - 1]
    // 如果与上一行时间戳相同（容差 50ms 内），且上一行还没有译文，则作为译文合并
    if (last && Math.abs(last.time - item.time) < 0.05 && !last.translation) {
      last.translation = item.text
    } else {
      result.push({ time: item.time, text: item.text })
    }
  }

  return result
}