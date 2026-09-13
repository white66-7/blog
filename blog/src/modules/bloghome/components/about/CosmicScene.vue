<template>
  <div class="cosmic-hero-wrapper">
    <div class="cosmic-stage">
      <!-- Canvas 动态星芒与流星雨 -->
      <canvas ref="canvasRef" class="space-canvas"></canvas>

      <!-- 3D 核心主场景 -->
      <div class="scene-scaler">
        <div class="scene">
          <div class="sun"></div>
          <div class="planet"></div>
          <div class="planet-2"></div>
          <div class="planet-3"></div>
          <div class="planet-4"></div>
          <div class="planet-6"></div>
          
          <!-- 5号木星（纯 GPU 硬件加速） -->
          <div class="planet-5">
            <div class="jupiter-clouds"></div>
          </div>

          <!-- 3D 立方体基座 -->
          <div class="cuboid">
            <div class="top">
              <div class="outline"></div>
              <div class="outline"></div>
              <div class="outline"></div>
              <div class="outline"></div>
            </div>
            <div class="front"></div>
            <div class="right"></div>
          </div>

          <!-- 2D 融入式人物与倒影 -->
          <div class="character-container">
            <img :src="characterImg" alt="character" class="character-body" />
            <img :src="characterImg" alt="character reflection" class="character-reflection" />
          </div>
        </div>
      </div>

      <!-- 深空信号检索加载：极简幽灵微光态（点位与第一页星标严格 1:1 锚定） -->
      <transition name="scanner-fade">
        <div v-if="isLoading" class="cosmic-scanner-layer">
          <!-- 8 个在原位微微呼吸的幽灵星光核 -->
          <div
            v-for="probe in loadingProbePositions"
            :key="probe.key"
            class="ghost-beacon"
            :style="{
              '--d-top': probe.d.top,
              '--d-left': probe.d.left,
              '--m-top': probe.m.top,
              '--m-left': probe.m.left,
              '--delay': probe.delay
            }"
          >
            <div class="ghost-dot"></div>
            <div class="ghost-halo"></div>
          </div>

          <!-- 底部极简呼吸提示（克制纤细） -->
          <div class="minimal-hud">
            <span class="hud-pulse-dot"></span>
            <span class="hud-text">SIGNAL SEARCHING</span>
            <span class="hud-freq">{{ scanFreq }}</span>
          </div>
        </div>
      </transition>

      <!-- 可点击的高亮留言星辰（电影级时空曲率跃迁） -->
      <div v-show="!isLoading" class="beacons-layer">
        <div
          v-for="(beacon, index) in currentGalaxySignals"
          :key="beacon.id"
          class="interactive-beacon"
          :class="{
            'is-warping-out': warpState === 'leaving',
            'is-warping-in': warpState === 'entering'
          }"
          :style="{ 
            '--d-top': beacon.desktopTop,
            '--d-left': beacon.desktopLeft,
            '--m-top': beacon.mobileTop,
            '--m-left': beacon.mobileLeft,
            '--delay': beacon.delay || '0s',
            '--stagger': `${index * 0.035}s`
          }"
          @click="openSignal(beacon)"
        >
          <div class="beacon-core"></div>
          <div class="beacon-flare-h" :style="{ animationDelay: beacon.delay }"></div>
          <div class="beacon-flare-v" :style="{ animationDelay: beacon.delay }"></div>
          <div class="beacon-ripple" :style="{ animationDelay: beacon.delay }"></div>
          
          <div class="beacon-hint">
            <span class="hint-dot"></span>
            <span class="hint-freq">{{ beacon.freq }}</span>
          </div>
        </div>
      </div>

      <!-- 【左下角】下一星系跃迁控制按钮 -->
      <button 
        v-if="!isLoading && totalGalaxies > 1"
        class="warp-galaxy-btn"
        :disabled="warpState !== 'idle'"
        @click="warpToNextGalaxy"
        title="跃迁至下一个星系"
      >
        <span class="galaxy-tag">{{ String(currentGalaxyIndex + 1).padStart(2, '0') }}</span>
        <span class="warp-label">跃迁</span>
      </button>

      <!-- 【右下角】宇宙背景音播放按钮 -->
      <button
        class="audio-icon-button"
        :class="{ 'is-playing': isPlaying }"
        @click="toggleAudio"
        title="播放/暂停宇宙背景音"
      >
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
      </button>
      <audio ref="audioRef" preload="none" loop :src="cosmicAudio"></audio>
    </div>

    <!-- 留言全息微窗 -->
    <CosmicSignalTerminal 
      v-model="isModalOpen" 
      :signal-data="activeSignal" 
    />

    <!-- 底部深空渐变暗角 -->
    <div class="bottom-dark-fade"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import CosmicSignalTerminal from './CosmicSignalTerminal.vue'

import characterImg from '/about/person.webp'
import cosmicAudio from '/about/cosmic_dreams.mp3'

const canvasRef = ref(null)
const audioRef = ref(null)
const isPlaying = ref(false)
let animId = null
let observer = null
const isSceneVisible = ref(true)

const isModalOpen = ref(false)
const activeSignal = ref(null)

/**
 * 16 组双轨坐标池
 */
const safePositions = [
  // 顶部天顶深空走廊
  { d: { top: '16%', left: '10%' }, m: { top: '16%', left: '14%' } }, // 0
  { d: { top: '22%', left: '86%' }, m: { top: '16%', left: '86%' } }, // 1
  { d: { top: '12%', left: '24%' }, m: { top: '21%', left: '22%' } }, // 2
  { d: { top: '13%', left: '75%' }, m: { top: '21%', left: '78%' } }, // 3

  // 极左侧深空狭缝
  { d: { top: '38%', left: '19%' }, m: { top: '32%', left: '8%' } },  // 4
  { d: { top: '50%', left: '8%'  }, m: { top: '44%', left: '7%' } },  // 5
  { d: { top: '64%', left: '9%'  }, m: { top: '56%', left: '8%' } },  // 6
  { d: { top: '72%', left: '22%' }, m: { top: '68%', left: '9%' } },  // 7

  // 极右侧深空狭缝
  { d: { top: '38%', left: '76%' }, m: { top: '32%', left: '92%' } }, // 8
  { d: { top: '54%', left: '88%' }, m: { top: '44%', left: '93%' } }, // 9
  { d: { top: '62%', left: '75%' }, m: { top: '56%', left: '92%' } }, // 10
  { d: { top: '74%', left: '84%' }, m: { top: '68%', left: '91%' } }, // 11

  // 底部安全区
  { d: { top: '80%', left: '14%' }, m: { top: '78%', left: '16%' } }, // 12
  { d: { top: '86%', left: '8%'  }, m: { top: '83%', left: '26%' } }, // 13
  { d: { top: '84%', left: '88%' }, m: { top: '85%', left: '50%' } }, // 14
  { d: { top: '16%', left: '89%' }, m: { top: '76%', left: '68%' } }  // 15
]

// 原始数据（默认为空，由接口或预加载缓存动态获取）
const rawSignals = ref([])

// 加载状态与深空频谱
const isLoading = ref(true)
const scanFreq = ref('1420.405 MHz')
let freqInterval = null

// ================= 星系分页与跃迁状态 =================
const GALAXY_SIZE = 8
const currentGalaxyIndex = ref(0)
const warpState = ref('idle')

// 严格对应第一星系（第 0 页）的 8 个初始点位，消除错位
const loadingProbePositions = computed(() => {
  return Array.from({ length: GALAXY_SIZE }, (_, i) => {
    const posIndex = (0 * 5 + i * 2) % safePositions.length
    const basePos = safePositions[posIndex]
    return {
      key: `probe-slot-${i}`,
      d: basePos.d,
      m: basePos.m,
      delay: `${(i * 0.18).toFixed(2)}s`
    }
  })
})

const startFreqScanning = () => {
  const baseFreqs = [1420.405, 1420.812, 1421.325, 1420.128, 1422.046, 1419.789]
  let idx = 0
  freqInterval = setInterval(() => {
    idx = (idx + 1) % baseFreqs.length
    const jitter = (Math.random() * 0.06 - 0.03).toFixed(3)
    scanFreq.value = `${(baseFreqs[idx] + parseFloat(jitter)).toFixed(3)} MHz`
  }, 120)
}

const stopFreqScanning = () => {
  if (freqInterval) {
    clearInterval(freqInterval)
    freqInterval = null
  }
}

const totalGalaxies = computed(() => {
  return Math.max(1, Math.ceil(rawSignals.value.length / GALAXY_SIZE))
})

// 当前星系的星座编排
const currentGalaxySignals = computed(() => {
  const start = currentGalaxyIndex.value * GALAXY_SIZE
  const pageItems = rawSignals.value.slice(start, start + GALAXY_SIZE)

  return pageItems.map((item, i) => {
    const posIndex = (currentGalaxyIndex.value * 5 + i * 2) % safePositions.length
    const basePos = safePositions[posIndex]
    const delaySec = ((i * 0.45) % 2.5).toFixed(2)

    return {
      ...item,
      id: item._id || item.id || `beacon-${start + i}`,
      desktopTop: basePos.d.top,
      desktopLeft: basePos.d.left,
      mobileTop: basePos.m.top,
      mobileLeft: basePos.m.left,
      delay: `${delaySec}s`
    }
  })
})

const warpToNextGalaxy = () => {
  if (warpState.value !== 'idle') return

  warpState.value = 'leaving'

  setTimeout(() => {
    currentGalaxyIndex.value = (currentGalaxyIndex.value + 1) % totalGalaxies.value
    warpState.value = 'entering'

    setTimeout(() => {
      warpState.value = 'idle'
    }, 600)
  }, 400)
}

// 💡 优先读取加载屏预热好的数据，无感秒开；若未命中则回退到真实 fetch
const fetchApprovedSignals = async () => {
  // 1. 检查是否存在加载屏提前拉取并存入的缓存
  const cached = sessionStorage.getItem('preloaded_signals')
  if (cached) {
    try {
      const parsed = JSON.parse(cached)
      if (Array.isArray(parsed) && parsed.length > 0) {
        rawSignals.value = parsed
        // 短暂展示 280ms 仪式感深空微光扫描后优雅亮起，无需发起任何网络请求
        startFreqScanning()
        setTimeout(() => {
          isLoading.value = false
          stopFreqScanning()
        }, 280)
        return
      }
    } catch (e) {
      console.warn('解析预加载信标异常，降级为常规拉取:', e)
    }
  }

  // 2. 缓存未命中（如用户单页刷新），执行常规接口拉取
  isLoading.value = true
  startFreqScanning()
  try {
    const res = await fetch('/api/signals')
    const json = await res.json()
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      rawSignals.value = json.data
      // 写入 sessionStorage，为后续重复查看与星系切页建立缓存
      sessionStorage.setItem('preloaded_signals', JSON.stringify(json.data))
    }
  } catch (e) {
    console.warn('获取信标信号异常:', e)
  } finally {
    setTimeout(() => {
      isLoading.value = false
      stopFreqScanning()
    }, 500)
  }
}

const openSignal = (beacon) => {
  if (warpState.value !== 'idle') return
  activeSignal.value = beacon
  isModalOpen.value = true
}

const toggleAudio = () => {
  if (!audioRef.value) return
  if (audioRef.value.paused) {
    audioRef.value.play()
    isPlaying.value = true
  } else {
    audioRef.value.pause()
    isPlaying.value = false
  }
}

// Canvas 星空与流星系统
onMounted(() => {
  fetchApprovedSignals()
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  const isMobile = window.innerWidth <= 768
  const STATIC_STAR_COUNT = isMobile ? 180 : 550
  const TWINKLE_STAR_COUNT = isMobile ? 35 : 90

  let width = 0
  let height = 0
  let dpr = 1

  const offscreenCanvas = document.createElement('canvas')
  const offscreenCtx = offscreenCanvas.getContext('2d')
  let twinklingStars = []

  const initStars = () => {
    offscreenCanvas.width = canvas.width
    offscreenCanvas.height = canvas.height
    offscreenCtx.scale(dpr, dpr)
    offscreenCtx.clearRect(0, 0, width, height)

    for (let i = 0; i < STATIC_STAR_COUNT; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      const size = Math.random() * 0.85 + 0.2
      const alpha = Math.random() * 0.42 + 0.1

      offscreenCtx.fillStyle = `rgba(240, 243, 255, ${alpha})`
      offscreenCtx.beginPath()
      offscreenCtx.arc(x, y, size, 0, Math.PI * 2)
      offscreenCtx.fill()
    }

    twinklingStars = Array.from({ length: TWINKLE_STAR_COUNT }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.1 + 0.5,
      baseAlpha: Math.random() * 0.35 + 0.25,
      speed: Math.random() * 0.02 + 0.008,
      phase: Math.random() * Math.PI * 2
    }))
  }

  const handleResize = () => {
    if (!canvas) return
    dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.0 : 1.25)
    width = canvas.offsetWidth
    height = canvas.offsetHeight
    canvas.width = Math.floor(width * dpr)
    canvas.height = Math.floor(height * dpr)
    ctx.scale(dpr, dpr)
    initStars()
  }

  handleResize()
  window.addEventListener('resize', handleResize)

  class ShootingStar {
    constructor() {
      this.reset()
    }
    reset() {
      this.x = Math.random() * width * 1.3
      this.y = Math.random() * (height * 0.45)
      this.len = Math.random() * 80 + 40
      this.speed = Math.random() * 6 + 6
      this.size = Math.random() * 1.0 + 0.6
      this.angle = ((35 + 5 * Math.random()) * Math.PI) / 180
      this.active = false
      this.wait = Math.random() * 180 + 30
    }
    update() {
      if (this.wait > 0) {
        this.wait--
        return
      }
      this.active = true
      this.x -= Math.cos(this.angle) * this.speed
      this.y += Math.sin(this.angle) * this.speed
      if (this.x < -100 || this.y > height + 100) {
        this.reset()
      }
    }
    draw(c) {
      if (!this.active) return
      const tailX = this.x + Math.cos(this.angle) * this.len
      const tailY = this.y - Math.sin(this.angle) * this.len
      const grad = c.createLinearGradient(this.x, this.y, tailX, tailY)
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)')
      grad.addColorStop(0.2, 'rgba(215, 230, 255, 0.65)')
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)')

      c.save()
      c.beginPath()
      c.strokeStyle = grad
      c.lineWidth = this.size
      c.lineCap = 'round'
      c.moveTo(this.x, this.y)
      c.lineTo(tailX, tailY)
      c.stroke()
      c.restore()
    }
  }

  const shootingStars = Array.from({ length: isMobile ? 1 : 2 }, () => new ShootingStar())

  const render = () => {
    if (!isSceneVisible.value) {
      animId = requestAnimationFrame(render)
      return
    }

    ctx.clearRect(0, 0, width, height)
    ctx.drawImage(offscreenCanvas, 0, 0, width, height)

    twinklingStars.forEach((s) => {
      s.phase += s.speed
      const alpha = s.baseAlpha + Math.sin(s.phase) * 0.25
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.06, alpha)})`
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
      ctx.fill()
    })

    shootingStars.forEach((star) => {
      star.update()
      star.draw(ctx)
    })

    animId = requestAnimationFrame(render)
  }
  render()

  observer = new IntersectionObserver(([entry]) => {
    isSceneVisible.value = entry.isIntersecting
  }, { threshold: 0.05 })

  observer.observe(canvas)

  onUnmounted(() => {
    stopFreqScanning()
    if (animId) cancelAnimationFrame(animId)
    if (observer) observer.disconnect()
    window.removeEventListener('resize', handleResize)
  })
})
</script>

<style scoped>
@property --moon-angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: true;
}

@property --space {
  syntax: "<length>";
  initial-value: 0px;
  inherits: true;
}

.cosmic-hero-wrapper {
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  position: relative;
  background-color: #101114;
  overflow: hidden;
}

.cosmic-stage {
  --color-primary: rgba(220, 219, 219, 0.85);
  --time: 24s;
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(circle at 50% 40%, #28292e 0%, #15161a 58%, #101114 100%);
  overflow: hidden;
  perspective: 1000px;
}

.space-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

/* ================= 极简幽灵微光加载层 ================= */
.cosmic-scanner-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 22;
}

.scanner-fade-enter-active,
.scanner-fade-leave-active {
  transition: opacity 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.scanner-fade-enter-from,
.scanner-fade-leave-to {
  opacity: 0;
}

/* 幽灵信标点（位置严格匹配第一页信标） */
.ghost-beacon {
  position: absolute;
  top: var(--d-top);
  left: var(--d-left);
  width: 20px;
  height: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

/* 核心极简暗光点 */
.ghost-dot {
  width: 3.5px;
  height: 3.5px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.85);
  box-shadow: 0 0 6px rgba(255, 255, 255, 0.8);
  animation: ghost-breathe 2.4s ease-in-out infinite alternate;
  animation-delay: var(--delay);
}

/* 柔和微光光晕（彻底摒弃机械圈与文字） */
.ghost-halo {
  position: absolute;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(56, 189, 248, 0.22) 0%, transparent 70%);
  animation: ghost-halo-pulse 2.4s ease-in-out infinite alternate;
  animation-delay: var(--delay);
}

@keyframes ghost-breathe {
  0% { transform: scale(0.7); opacity: 0.2; }
  100% { transform: scale(1.15); opacity: 0.9; }
}

@keyframes ghost-halo-pulse {
  0% { transform: scale(0.6); opacity: 0.08; }
  100% { transform: scale(1.6); opacity: 0.45; }
}

/* 底部极简呼吸 HUD */
.minimal-hud {
  position: absolute;
  bottom: 2.5rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 14px;
  background: rgba(16, 18, 24, 0.55);
  border-radius: 30px;
  backdrop-filter: blur(8px);
  pointer-events: none;
}

.hud-pulse-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #38bdf8;
  box-shadow: 0 0 6px #38bdf8;
  animation: hud-dot 1.5s ease-in-out infinite;
}

.hud-text {
  font-family: 'Orbitron', monospace;
  font-size: 0.62rem;
  letter-spacing: 0.12em;
  color: rgba(255, 255, 255, 0.45);
}

.hud-freq {
  font-family: 'Orbitron', monospace;
  font-size: 0.62rem;
  letter-spacing: 0.08em;
  color: rgba(56, 189, 248, 0.7);
  font-variant-numeric: tabular-nums;
}

@keyframes hud-dot {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1.2); }
}

/* ================= 交互星星信标图层 ================= */
.beacons-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 20;
}

.interactive-beacon {
  position: absolute;
  top: var(--d-top);
  left: var(--d-left);
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  pointer-events: auto;
  transform: translate(-50%, -50%);
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease;
  will-change: transform, opacity;
}

.interactive-beacon:hover {
  transform: translate(-50%, -50%) scale(1.3);
}

/* ================= 超空间跃迁动画 ================= */
.interactive-beacon.is-warping-out {
  pointer-events: none;
  animation: warp-singularity-collapse 0.38s cubic-bezier(0.6, 0.05, 0.2, 1) forwards;
  animation-delay: var(--stagger);
}

.interactive-beacon.is-warping-out .beacon-hint {
  opacity: 0 !important;
  transform: translateX(-50%) translateY(0) scale(0.6) !important;
  transition: all 0.12s ease !important;
}

.interactive-beacon.is-warping-out .beacon-ripple {
  animation: none !important;
  transform: scale(0.1);
  opacity: 0;
  transition: transform 0.2s cubic-bezier(0.4, 0, 1, 1), opacity 0.2s ease;
}

.interactive-beacon.is-warping-out .beacon-flare-h {
  animation: none !important;
  transform: scaleX(0) scaleY(2.5);
  opacity: 0;
  transition: all 0.22s cubic-bezier(0.7, 0, 0.84, 0);
}

.interactive-beacon.is-warping-out .beacon-flare-v {
  animation: none !important;
  transform: scaleY(0) scaleX(2.5);
  opacity: 0;
  transition: all 0.22s cubic-bezier(0.7, 0, 0.84, 0);
}

.interactive-beacon.is-warping-out .beacon-core {
  animation: core-flash-collapse 0.38s cubic-bezier(0.4, 0, 0.2, 1) forwards;
}

@keyframes warp-singularity-collapse {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
    filter: brightness(1);
  }
  25% {
    transform: translate(-50%, -50%) scale(1.15);
    opacity: 1;
    filter: brightness(3.5);
  }
  50% {
    transform: translate(-50%, -50%) scale(0.7);
    opacity: 0.9;
  }
  100% {
    transform: translate(-50%, -50%) scale(0);
    opacity: 0;
  }
}

@keyframes core-flash-collapse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 10px #ffffff, 0 0 20px rgba(180, 215, 255, 0.9);
  }
  30% {
    transform: scale(2.2);
    box-shadow: 0 0 25px #ffffff, 0 0 35px #38bdf8;
    background: #ffffff;
  }
  100% {
    transform: scale(0.1);
    box-shadow: 0 0 0 transparent;
  }
}

.interactive-beacon.is-warping-in {
  pointer-events: none;
  animation: warp-arrive-in 0.55s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: var(--stagger);
}

@keyframes warp-arrive-in {
  0% {
    transform: translate(-50%, -50%) scale(3.5);
    opacity: 0;
    filter: brightness(2.5);
  }
  35% {
    opacity: 1;
  }
  75% {
    transform: translate(-50%, -50%) scale(0.9);
  }
  100% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
}

.beacon-core {
  width: 4.5px;
  height: 4.5px;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 0 10px #ffffff, 0 0 16px rgba(180, 215, 255, 0.85);
  z-index: 2;
  transition: all 0.2s ease;
}

.beacon-flare-h {
  position: absolute;
  width: 26px;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.95), transparent);
  animation: flare-glow 3s infinite ease-in-out;
}

.beacon-flare-v {
  position: absolute;
  width: 1px;
  height: 26px;
  background: linear-gradient(180deg, transparent, rgba(255, 255, 255, 0.95), transparent);
  animation: flare-glow 3s infinite ease-in-out;
}

.beacon-ripple {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.5);
  animation: beacon-wave 2.8s cubic-bezier(0.2, 0.8, 0.2, 1) infinite;
}

@keyframes beacon-wave {
  0% { width: 6px; height: 6px; opacity: 0.9; }
  100% { width: 38px; height: 38px; opacity: 0; }
}

@keyframes flare-glow {
  0%, 100% { opacity: 0.35; transform: scale(0.85); }
  50% { opacity: 1; transform: scale(1.2); }
}

.beacon-hint {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(6px);
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(14, 15, 18, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 2px 6px;
  border-radius: 2px;
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 0.6rem;
  color: rgba(255, 255, 255, 0.7);
  letter-spacing: 0.05em;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: all 0.2s ease;
}

.hint-freq {
  font-family: 'Orbitron', monospace;
  letter-spacing: 0.1em;
  font-variant-numeric: tabular-nums;
  font-weight: 300;
  text-shadow: 0 0 8px rgba(126, 241, 178, 0.6);
}

.hint-dot {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: #7ef1b2;
}

.interactive-beacon:hover .beacon-hint {
  opacity: 1;
  transform: translateX(-50%) translateY(10px);
}

/* ================= 【左下角】星系跃迁按钮 ================= */
.warp-galaxy-btn {
  position: absolute;
  left: 2rem;
  bottom: 2.2rem;
  z-index: 4200;
  display: flex;
  align-items: center;
  gap: 7px;
  background: rgba(18, 20, 26, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 6px 14px;
  border-radius: 20px;
  color: #ffffff;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  outline: none;
}

.warp-galaxy-btn:hover:not(:disabled) {
  background: rgba(30, 35, 45, 0.85);
  border-color: rgba(56, 189, 248, 0.6);
  box-shadow: 0 0 16px rgba(56, 189, 248, 0.25);
  transform: translateY(-2px);
}

.warp-galaxy-btn:active:not(:disabled) {
  transform: scale(0.96);
}

.warp-galaxy-btn:disabled {
  opacity: 0.5;
  cursor: wait;
}

.galaxy-tag {
  font-family: 'Orbitron', monospace;
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: #38bdf8;
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  padding-right: 7px;
}

.warp-label {
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  color: rgba(255, 255, 255, 0.85);
}

/* ================= 【右下角】背景音按钮 ================= */
.audio-icon-button {
  border: 1px solid rgba(255, 255, 255, 0.35);
  padding: 0.5rem;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  position: absolute;
  right: 2rem;
  bottom: 2.2rem;
  z-index: 4200;
  display: flex;
  gap: 0.15rem;
  align-items: center;
  justify-content: center;
  opacity: 0.75;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.audio-icon-button:hover {
  opacity: 1;
  transform: scale(1.1);
  border-color: rgba(255, 255, 255, 0.9);
}

.audio-icon-button .bar {
  background: #ffffff;
  height: 1.2rem;
  width: 0.085rem;
  border-radius: 1px;
}

.audio-icon-button .bar:nth-of-type(1),
.audio-icon-button .bar:nth-of-type(5) { height: 0.4rem; }
.audio-icon-button .bar:nth-of-type(2),
.audio-icon-button .bar:nth-of-type(4) { height: 0.8rem; }

.audio-icon-button.is-playing .bar {
  animation: bar-dance 1s ease-in-out infinite alternate;
}
.audio-icon-button.is-playing .bar:nth-of-type(2) { animation-delay: 0.2s; }
.audio-icon-button.is-playing .bar:nth-of-type(3) { animation-delay: 0.4s; }
.audio-icon-button.is-playing .bar:nth-of-type(4) { animation-delay: 0.6s; }
.audio-icon-button.is-playing .bar:nth-of-type(5) { animation-delay: 0.8s; }

@keyframes bar-dance {
  from { transform: scaleY(0.3); }
  to { transform: scaleY(1.3); }
}

/* ================= 场景 3D 核心样式 ================= */
.bottom-dark-fade {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 140px;
  background: linear-gradient(to bottom, transparent 0%, rgba(16, 17, 20, 0.8) 70%, #101114 100%);
  pointer-events: none;
  z-index: 10;
}

.scene-scaler {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3;
  transform: translateY(45px);
  transform-origin: center center;
}

.scene {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: scene-zoom-in-out var(--time) ease-in-out infinite;
  transform-style: preserve-3d;
}

@keyframes scene-zoom-in-out {
  0%, 100% { transform: scale(0.96); }
  50% { transform: scale(1.03); }
}

.cuboid {
  position: absolute;
  transform-style: preserve-3d;
  transform: rotateY(312deg) rotateX(350deg) rotateZ(10deg) translateY(220px);
  --size: 110px;
  --size-h: 55px;
  --size-h-n: -55px;
  z-index: 10;
}

.cuboid .top {
  width: var(--size);
  aspect-ratio: 1;
  background: linear-gradient(135deg, #e8dbdd, #989699);
  transform-style: preserve-3d;
  transform: rotateX(90deg) translateZ(var(--size-h-n));
  opacity: 0.95;
}

.cuboid .front {
  width: var(--size);
  aspect-ratio: 1 / 2;
  background: linear-gradient(#5f595d, transparent 70%);
  opacity: 0.55;
  transform: translateZ(var(--size-h));
  position: absolute;
}

.cuboid .right {
  width: var(--size);
  aspect-ratio: 1 / 2;
  background: linear-gradient(#5f595d 10%, transparent 90%);
  transform: translate3d(var(--size-h), 0, 0) rotateY(90deg);
  position: absolute;
  opacity: 0.7;
}

.cuboid .outline {
  position: absolute;
  width: var(--size);
  aspect-ratio: 1;
  border: 1px solid rgba(255, 255, 255, 0.75);
  translate: calc(-50% + var(--size-h)) calc(-50% + var(--size-h));
  padding: var(--space);
  --duration: 16s;
  animation: outline-animation var(--duration) 0s cubic-bezier(0.68, 0.27, 0.26, 0.91) infinite;
  opacity: 0;
  box-shadow: inset 0 0 8px rgba(255, 255, 255, 0.4), 0 0 8px rgba(255, 255, 255, 0.4);
  --initial-space: var(--size-h);
}

.cuboid .outline:nth-of-type(2) { animation-delay: 4s; }
.cuboid .outline:nth-of-type(3) { animation-delay: 8s; }
.cuboid .outline:nth-of-type(4) { animation-delay: 12s; }

@keyframes outline-animation {
  from {
    --space: var(--initial-space, 55px);
    opacity: 0;
  }
  10% { opacity: 0.35; }
  50% { opacity: 0.6; }
  80% { opacity: 0.05; }
  to {
    --space: calc(var(--initial-space, 55px) + 260px);
    opacity: 0;
    filter: blur(4px);
  }
}

.character-container {
  position: absolute;
  transform: translateY(268px);
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}

.character-body {
  width: 110px;
  height: auto;
  object-fit: contain;
  filter: brightness(0.9) contrast(1.05) drop-shadow(0 0 6px rgba(180, 205, 230, 0.25));
  user-select: none;
}

.character-reflection {
  width: 110px;
  height: auto;
  object-fit: contain;
  transform: scaleY(-1) translateY(4px);
  opacity: 0.22;
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.8) 0%, transparent 60%);
  -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.8) 0%, transparent 60%);
  filter: blur(1.5px) brightness(0.65);
}

@keyframes moon-animation {
  0%, 100% { --moon-angle: 180deg; }
  50% { --moon-angle: 200deg; }
}

.sun {
  border-radius: 50%;
  width: 280px;
  height: 280px;
  background: radial-gradient(circle at 60% 60%, #ffffff, #eae0e2 60%, #c9c7c7 100%);
  position: absolute;
  transform: translateY(-280px);
  box-shadow: 0 0 60px rgba(255, 255, 255, 0.35);
  transform-style: preserve-3d;
}

.planet {
  border-radius: 50%;
  width: 200px;
  height: 200px;
  background: radial-gradient(90% 90% at 60% 55%, #252525, #2a2f33 52%, #ede9ea 62%), #ede9ea;
  position: absolute;
  --r: 160px;
  --y: calc(-140px + sin(var(--moon-angle)) * var(--r));
  --z: calc(cos(var(--moon-angle)) * var(--r) * -1);
  transform: translateY(var(--y)) translateX(130px) translateZ(var(--z));
  animation: moon-animation var(--time) ease-in-out infinite;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.15);
  transform-style: preserve-3d;
}

.planet-2 {
  transform-style: preserve-3d;
  border-radius: 50%;
  width: 150px;
  height: 150px;
  background: radial-gradient(90% 90% at 60% 55%, #e3e3e3, #d2c6c8 52%, #212528 62%, transparent 82%);
  position: absolute;
  --r: 30px;
  --y: calc(-330px + sin(var(--moon-angle)) * var(--r));
  --z: calc(cos(var(--moon-angle)) * var(--r) * 1);
  transform: translateY(var(--y)) translateX(-220px) translateZ(var(--z));
  animation: moon-animation var(--time) ease-in-out infinite;
}

.planet-3 {
  transform-style: preserve-3d;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  background: radial-gradient(90% 90% at 70% 50%, #eeeeee 16%, #b7aeb0 38%, #3c4144 52%, #2d3134 60%, transparent 82%);
  position: absolute;
  transform: translateY(-180px) translateX(-220px);
  opacity: 0.7;
}

.planet-4 {
  transform-style: preserve-3d;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  background: radial-gradient(90% 90% at 70% 50%, #d0d0d0, #b7aeb0 38%, #121415 52%, #131617 60%, transparent 82%);
  position: absolute;
  transform: translateY(-90px) translateX(-240px);
  opacity: 0.6;
}

.planet-5 {
  transform-style: preserve-3d;
  border-radius: 50%;
  width: 120px;
  height: 120px;
  background: #25282d;
  position: absolute;
  --r: 60px;
  --y: calc(-260px + sin(var(--moon-angle)) * var(--r));
  --z: calc(cos(var(--moon-angle)) * var(--r) * 1);
  transform: translateY(var(--y)) translateX(210px) translateZ(var(--z));
  clip-path: circle();
  overflow: hidden;
  animation: moon-animation var(--time) ease-in-out infinite;
}

.jupiter-clouds {
  position: absolute;
  inset: -50px;
  background: repeating-linear-gradient(
    -20deg,
    #1d1f23 0px,
    #3f434a 12px,
    #696767 22px,
    #545152 34px,
    #2a2c31 46px
  );
  opacity: 0.85;
  animation: jupiter-shift calc(var(--time) * 2) linear infinite;
  will-change: transform;
}

.planet-5::after {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 10% 20%, transparent 35%, rgba(16, 18, 20, 0.9) 75%);
  pointer-events: none;
}

@keyframes jupiter-shift {
  0% { transform: translateX(0); }
  100% { transform: translateX(-46px); }
}

.planet-6 {
  transform-style: preserve-3d;
  border-radius: 50%;
  width: 85px;
  height: 85px;
  background: radial-gradient(90% 90% at 30% 55%, #f3ecec, #7a7a7a 52%, #212528 72%, transparent);
  position: absolute;
  --r: 70px;
  --y: calc(-300px + sin(var(--moon-angle)) * var(--r));
  --z: calc(cos(var(--moon-angle)) * var(--r) * 1);
  transform: translateY(var(--y)) translateX(260px) translateZ(var(--z));
  animation: moon-animation var(--time) ease-in-out infinite;
  display: grid;
  place-items: center;
}

.planet-6::after {
  content: "";
  position: absolute;
  border-radius: 50%;
  width: 140px;
  height: 14px;
  border: 24px solid #43484c;
  box-shadow: inset 0 0 10px black;
  transform: rotate(25deg);
  mask: radial-gradient(circle at 50% -20%, transparent 30%, black);
  clip-path: ellipse(47% 22% at 50% 50%);
}

/* ================= 移动端精准避让与性能优化 ================= */
@media (max-width: 768px) {
  .scene {
    animation: none !important;
  }

  .cuboid .outline {
    box-shadow: none !important;
  }
  
  @keyframes outline-animation {
    from {
      --space: var(--initial-space, 55px);
      opacity: 0;
    }
    20% { opacity: 0.45; }
    to {
      --space: calc(var(--initial-space, 55px) + 150px);
      opacity: 0;
    }
  }

  .sun {
    box-shadow: 0 0 25px rgba(255, 255, 255, 0.25) !important;
  }
  .planet {
    box-shadow: none !important;
  }

  .beacon-flare-h,
  .beacon-flare-v {
    animation: none !important;
    opacity: 0.75;
  }

  /* 移动端幽灵信标位置映射 */
  .ghost-beacon {
    top: var(--m-top);
    left: var(--m-left);
  }

  .minimal-hud {
    bottom: 5.2rem;
    padding: 3px 10px;
  }

  .interactive-beacon {
    top: var(--m-top);
    left: var(--m-left);
  }

  /* 靠左侧边缘星星提示气泡定位 */
  .interactive-beacon[style*="--m-left: 7%"] .beacon-hint,
  .interactive-beacon[style*="--m-left: 8%"] .beacon-hint,
  .interactive-beacon[style*="--m-left: 9%"] .beacon-hint {
    left: 0;
    transform: translateX(0) translateY(6px);
  }

  /* 靠右侧边缘星星提示气泡定位 */
  .interactive-beacon[style*="--m-left: 91%"] .beacon-hint,
  .interactive-beacon[style*="--m-left: 92%"] .beacon-hint,
  .interactive-beacon[style*="--m-left: 93%"] .beacon-hint {
    left: auto;
    right: 0;
    transform: translateX(0) translateY(6px);
  }

  /* 跃迁与音乐按钮 */
  .warp-galaxy-btn {
    left: 1.2rem;
    bottom: 1.5rem;
    padding: 5px 12px;
  }

  .audio-icon-button {
    right: 1.2rem;
    bottom: 1.5rem;
  }
}

@media (max-height: 850px) {
  .scene-scaler { transform: scale(0.85) translateY(40px); }
}
@media (max-height: 700px) {
  .scene-scaler { transform: scale(0.72) translateY(30px); }
}
@media (max-width: 900px) {
  .scene-scaler { transform: scale(0.76) translateY(38px); }
}
@media (max-width: 600px) {
  .scene-scaler { transform: scale(0.6) translateY(30px); }
}
@media (max-width: 400px) {
  .scene-scaler { transform: scale(0.5) translateY(25px); }
}
</style>