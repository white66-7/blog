const KEY = 'cyber_img_loaded'
let loaded = new Set<string>()
try {
  loaded = new Set(JSON.parse(sessionStorage.getItem(KEY) || '[]'))
} catch { /* 忽略损坏数据 */ }

/** 该 URL 本会话是否已成功加载过 */
export function isImageLoaded(url: string): boolean {
  return loaded.has(url)
}

/** 手动标记某 URL 已加载成功（供组件内 <img> 原生 onload 回调使用） */
export function markImageLoaded(url: string): void {
  if (!url || loaded.has(url)) return
  loaded.add(url)
  try {
    sessionStorage.setItem(KEY, JSON.stringify([...loaded]))
  } catch { /* 容量满时忽略 */ }
}

/**
 * 预加载图片，返回 Promise。
 * 已加载过的直接 resolve，不重复创建 Image 对象。
 */
export function preloadImage(url: string): Promise<void> {
  if (loaded.has(url)) return Promise.resolve()

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      loaded.add(url)
      try {
        sessionStorage.setItem(KEY, JSON.stringify([...loaded]))
      } catch { /* 容量满时忽略，不影响功能 */ }
      resolve()
    }
    img.onerror = () => reject(new Error('图片加载失败: ' + url))
    img.src = url
  })
}

/** 批量预加载：返回每个 URL 是否已就绪的布尔数组 */
export function preloadImages(urls: string[]): Promise<boolean[]> {
  return Promise.all(urls.map(url =>
    preloadImage(url).then(() => true).catch(() => true) // 失败也视为已处理，隐藏骨架
  ))
}
