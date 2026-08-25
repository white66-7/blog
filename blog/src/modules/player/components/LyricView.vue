<template>
  <div class="lyric-view">

    <div ref="scrollRef" class="lyric-scroll" :class="{ 'is-single': lyrics.length === 1 }">
      <div v-if="!lyrics.length" class="lyric-empty">
        <div class="empty-title">NO LYRICS</div>
        <div class="empty-sub">将同名的 .lrc 文件与音频一起导入即可显示歌词</div>
      </div>

      <div v-else class="lyric-list">
        <div
          v-for="(l, i) in lyrics"
          :key="i"
          class="lyric-line"
          :class="{ on: i === currentLineIdx }"
          :ref="(el) => setLineRef(el, i)"
        >
          <!-- 原文 -->
          <div class="line-origin">{{ l.text || '·' }}</div>
          <!-- 译文（存在时才显示） -->
          <div v-if="l.translation" class="line-trans">{{ l.translation }}</div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, computed, watchEffect, onMounted, onBeforeUnmount } from 'vue'
import { useAudioStore } from '@/stores/audioStore'
import { parseLrc } from '@/modules/player/utils/lrc'
import type { LyricLine } from '@/modules/player/utils/lrc'

const audioStore = useAudioStore()

// 从当前歌曲的 lrc 字段解析歌词行（按时间升序）
const lyrics = computed<LyricLine[]>(() => {
  const lrc = audioStore.currentSong?.lrc
  return parseLrc(lrc || '')
})

// 二分查找当前时间所属的歌词行下标
const currentLineIdx = computed(() => {
  const ls = lyrics.value
  if (!ls.length) return -1
  const t = audioStore.currentTime
  let lo = 0, hi = ls.length - 1, ans = -1
  while (lo <= hi) {
    const mid = (lo + hi) >> 1
    if (ls[mid]!.time <= t) { ans = mid; lo = mid + 1 }
    else hi = mid - 1
  }
  return ans
})

const scrollRef = ref<HTMLElement | null>(null)
const lineEls: HTMLElement[] = []

function setLineRef(el: unknown, i: number) {
  if (el) lineEls[i] = el as HTMLElement
  else delete lineEls[i]
}

let raf = 0
watchEffect(() => {
  const idx = currentLineIdx.value
  const ls = lyrics.value
  const container = scrollRef.value
  if (!container || !ls.length) return

  // 没有匹配到任何歌词行时才回到顶部
  if (idx < 0) {
    container.scrollTo({ top: 0 })
    return
  }

  const el = lineEls[idx]
  if (!el) return

  cancelAnimationFrame(raf)
  raf = requestAnimationFrame(() => {
    if (!scrollRef.value) return
    const target = el.offsetTop - scrollRef.value.clientHeight / 2 + el.offsetHeight / 2
    scrollRef.value.scrollTo({ top: target, behavior: 'smooth' })
  })
}, { flush: 'post' })  // 注意这里添加了选项

// 让歌词列表上下各留出滚动容器一半高的留白，
// 这样第一行/最后一行也能精确滚动到整列正中（CSS 的百分比 padding 是相对宽度，不可靠）
let ro: ResizeObserver | null = null
function updatePad() {
  const container = scrollRef.value
  if (!container) return
  const list = container.querySelector<HTMLElement>('.lyric-list')
  if (!list) return
  const half = Math.round(container.clientHeight / 2)
  list.style.paddingTop = `${half}px`
  list.style.paddingBottom = `${half}px`
}
onMounted(() => {
  const container = scrollRef.value
  if (!container) return
  ro = new ResizeObserver(updatePad)
  ro.observe(container)
  updatePad()
})
onBeforeUnmount(() => {
  ro?.disconnect()
  cancelAnimationFrame(raf)
})
</script>

<style scoped>
.lyric-view {
  flex: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center; /* 让歌词显示区垂直居中 */
  gap: 14px;
}


.lyric-scroll {
  height: 50%; /* 显示区只占列高约一半 */
  min-height: 0;
  overflow-y: auto;
  position: relative;
  scrollbar-width: none;
}
.lyric-scroll::-webkit-scrollbar {
  display: none;
}

.lyric-list {
  /* 上下留白由 JS 按容器高度的一半动态设置，确保首尾行能滚动到正中 */
  display: flex;
  flex-direction: column;
  align-items: center;
}

.lyric-line {
  text-align: center;
  padding: 10px 16px;
  transition: all 0.3s ease;
  color: rgba(255, 255, 255, 0.45);
}

.line-origin {
  font-size: 16px;
  line-height: 1.4;
}

.line-trans {
  font-size: 13px;
  margin-top: 4px;
  opacity: 0.8;
  line-height: 1.3;
}

/* 高亮当前正在唱的行 */
.lyric-line.on {
  color: #ffffff;
  transform: scale(1.04);
}

.lyric-line.on .line-origin {
  font-size: 18px;
  font-weight: 600;
}

.lyric-line.on .line-trans {
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
}

.lyric-empty {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-align: center;
}

.empty-title {
  font-size: 1.1rem;
  letter-spacing: 4px;
  color: #3a3a52;
}

.empty-sub {
  font-size: .72rem;
  color: #3a3a52;
  letter-spacing: 1px;
  line-height: 1.8;
}

.lyric-scroll.is-single {
  display: flex;
  align-items: center;
  justify-content: center;
}

.lyric-scroll.is-single .lyric-list {
  width: 100%;
}
</style>
