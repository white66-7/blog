<!-- Clock.vue 倒计时独立组件（支持路由切换后台保持） -->
<template>
  <div class="timer-container" :class="{ 'is-done': isDone }" :style="{ '--pct': fillPct + '%' }">
    <div class="timer-intro">
      <p class="intro-text">如果你心存困惑，陷入迷茫，两分钟的思考或许能帮到你</p>
    </div>
    <p class="timer-eyebrow" :class="{ 'blessing-text': isDone }">{{ labelText }}</p>
    
    <div class="timer-stage">
      <div class="timer-fill" aria-hidden="true"></div>
      <div class="timer-digits">
        <span class="timer-base">{{ formattedTime }}</span>
        <span class="timer-over" aria-hidden="true">{{ formattedTime }}</span>
      </div>
    </div>
    
    <div class="timer-controls">
      <button class="timer-btn primary" @click="handleToggle">{{ toggleBtnText }}</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const STORAGE_KEY = '__focus_clock_state__'

const props = defineProps({
  initialMinutes: {
    type: Number,
    default: 2 
  }
})

const defaultDuration = props.initialMinutes * 60 * 1000
const total = ref(defaultDuration)
const remaining = ref(defaultDuration)
const isRunning = ref(false)
const isDone = ref(false)
let endAt = 0
let animFrameId = null

const pad = (n) => String(n).padStart(2, '0')

const formattedTime = computed(() => {
  const t = Math.max(0, Math.ceil(remaining.value / 1000))
  const h = Math.floor(t / 3600)
  const m = Math.floor((t % 3600) / 60)
  const s = t % 60
  return h ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
})

const fillPct = computed(() => {
  if (total.value <= 0) return '0.000'
  return (Math.max(0, Math.min(1, remaining.value / total.value)) * 100).toFixed(3)
})

const labelText = computed(() => {
  if (isDone.value) return "祝愿你找到自己的答案 ✨"
  const t = Math.round(total.value / 1000)
  const h = Math.floor(t / 3600)
  const m = Math.round((t % 3600) / 60)
  const parts = []
  if (h) parts.push(`${h} hour${h > 1 ? 's' : ''}`)
  if (m) parts.push(`${m} minute${m > 1 ? 's' : ''}`)
  if (!parts.length) parts.push(`${t} second${t === 1 ? '' : 's'}`)
  return parts.join(' ') + ' timer'
})

const toggleBtnText = computed(() => {
  if (isDone.value) return 'Start again'
  return isRunning.value ? 'Pause' : (remaining.value < total.value ? 'Resume' : 'Start')
})

// 存储状态到本地
const saveState = () => {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      total: total.value,
      remaining: remaining.value,
      isRunning: isRunning.value,
      isDone: isDone.value,
      endAt: endAt
    })
  )
}

const chime = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)()
    ;[0, 0.28, 0.56].forEach((offset) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.value = 880
      osc.connect(gain).connect(ctx.destination)
      const t = ctx.currentTime + offset
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.25, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.22)
      osc.start(t)
      osc.stop(t + 0.24)
    })
  } catch (e) {}
}

const updateTimer = () => {
  if (!isRunning.value) return
  const left = endAt - Date.now()
  if (left <= 0) {
    remaining.value = 0
    isRunning.value = false
    isDone.value = true
    saveState()
    chime()
    return
  }
  remaining.value = left
  animFrameId = requestAnimationFrame(updateTimer)
}

const handleStart = () => {
  if (isDone.value) handleReset()
  endAt = Date.now() + remaining.value
  isRunning.value = true
  saveState()
  animFrameId = requestAnimationFrame(updateTimer)
}

const handlePause = () => {
  remaining.value = Math.max(0, endAt - Date.now())
  isRunning.value = false
  saveState()
  if (animFrameId) cancelAnimationFrame(animFrameId)
}

const handleToggle = () => {
  if (isRunning.value) {
    handlePause()
  } else {
    handleStart()
  }
}

const handleReset = () => {
  isRunning.value = false
  isDone.value = false
  remaining.value = total.value
  saveState()
  if (animFrameId) cancelAnimationFrame(animFrameId)
}

const handleKeydown = (e) => {
  if (e.target.tagName === 'BUTTON' && e.code === 'Space') return
  if (e.code === 'Space') {
    e.preventDefault()
    isRunning.value ? handlePause() : handleStart()
  }
}

onMounted(() => {
  // 1. 尝试从本地恢复上一次的状态
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      const state = JSON.parse(saved)
      total.value = state.total || defaultDuration
      isDone.value = state.isDone || false

      if (state.isRunning) {
        const left = state.endAt - Date.now()
        if (left <= 0) {
          remaining.value = 0
          isRunning.value = false
          isDone.value = true
        } else {
          remaining.value = left
          endAt = state.endAt
          isRunning.value = true
          animFrameId = requestAnimationFrame(updateTimer)
        }
      } else {
        remaining.value = state.remaining
        isRunning.value = false
      }
    } catch (e) {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  // 2. 解析 URL 参数（如果路由 URL 带有指定参数，以参数为准）
  const q = new URLSearchParams(window.location.search)
  const num = (...keys) => {
    for (const k of keys) {
      const v = parseFloat(q.get(k))
      if (!isNaN(v) && v >= 0) return v
    }
    return 0
  }
  const customTotal = Math.round(
    (num('h', 'hours') * 3600 + num('m', 'mins', 'minutes') * 60 + num('s', 'secs', 'seconds')) * 1000
  )
  if (customTotal > 0 && !saved) {
    total.value = customTotal
    remaining.value = customTotal
  }

  window.addEventListener('keydown', handleKeydown)
  if (q.has('autostart') && !isRunning.value) handleStart()
})

onUnmounted(() => {
  // 切走路由时只停止前端动画渲染，不清除倒计时时间戳数据
  if (animFrameId) cancelAnimationFrame(animFrameId)
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Martian+Mono:wght@200;300;500&display=swap');

.timer-container {
  --timer-paper: #FAF7F2;
  --timer-ink: #16181f;
  --timer-fill: #4b5bd6;
  --timer-done: #37c39a;
  --timer-muted: #6d7385;

  width: min(500px, 90%);
  margin: 60px auto 40px;
  display: grid;
  gap: 16px;
  justify-items: center;
  font-family: "Martian Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
}

.timer-intro {
  text-align: center;
  margin-bottom: 6px;
}

.intro-text {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.6;
  color: #16181f;
  letter-spacing: 0.02em;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif;
  opacity: 0.85;
}

.timer-container.is-done {
  --timer-fill: var(--timer-done);
}

.timer-eyebrow {
  margin: 0;
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--timer-muted);
  transition: all 0.3s ease;
}

.timer-eyebrow.blessing-text {
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.06em;
  color: var(--timer-done);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", sans-serif;
}

.timer-stage {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 2;
  display: grid;
  place-items: center;
  border: 1px solid rgba(22, 24, 31, 0.14);
  border-radius: 18px;
  overflow: hidden;
  background: transparent;
}

.timer-fill {
  position: absolute;
  inset: auto 0 0 0;
  height: var(--pct);
  background: var(--timer-fill);
  transition: background-color 0.4s ease;
}

.timer-digits {
  position: relative;
  font-size: clamp(38px, 10vw, 72px);
  font-weight: 200;
  letter-spacing: -0.05em;
  line-height: 1;
  font-variant-numeric: tabular-nums;
  user-select: none;
}

.timer-over {
  position: absolute;
  inset: 0;
  color: var(--timer-paper);
  clip-path: inset(calc(100% - var(--pct)) 0 0 0);
}

.timer-controls {
  display: flex;
  justify-content: center;
}

.timer-btn {
  font: inherit;
  font-size: 13px;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: var(--timer-paper);
  background: var(--timer-ink);
  border: 1px solid var(--timer-ink);
  border-radius: 999px;
  padding: 10px 32px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.timer-btn:hover {
  opacity: 0.88;
  transform: translateY(-1px);
}

.timer-btn:active {
  transform: translateY(0);
}

.timer-btn:focus-visible {
  outline: 2px solid var(--timer-fill);
  outline-offset: 3px;
}

@media (max-width: 600px) {
  .intro-text {
    font-size: 14px;
    padding: 0 10px;
  }
}
</style>