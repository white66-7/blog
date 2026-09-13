<template>
  <!-- 加载屏主容器，通过 isExiting 触发平滑上滑淡出退场 -->
  <div class="t1" :class="{ 'slide-up-exit': isExiting, 't1--quick': mode === 'navigating' }">
    <!-- 2. 主体区：手写书法文字 + 右下角传统朱砂落款印章 -->
    <div class="brand-wrapper">
      <div class="svg-container">
        <BrandLogoSvg />
      </div>

      <!-- 传统朱砂方印 (白文/盖印动效) -->
      <div class="chinese-seal">
        <div class="seal-inner">
          <span class="seal-at">@</span>
          <span class="seal-text">white66-7</span>
        </div>
      </div>
    </div>

    <!-- 3. 状态区：12 瓣淡墨色菊花 Loader + Loading... 文字 -->
    <div class="status-indicator">
      <div class="loader">
        <div class="bar1"></div>
        <div class="bar2"></div>
        <div class="bar3"></div>
        <div class="bar4"></div>
        <div class="bar5"></div>
        <div class="bar6"></div>
        <div class="bar7"></div>
        <div class="bar8"></div>
        <div class="bar9"></div>
        <div class="bar10"></div>
        <div class="bar11"></div>
        <div class="bar12"></div>
      </div>
      <span class="loading-caption">Loading...</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import { articles } from '@/date/articles'
import BrandLogoSvg from '@/modules/bloghome/components/BrandLogoSvg.vue'

// 仅保留首屏立刻会见到的 1~2 张核心背景/头像
import MYimage from '@/assets/me.webp'
import bgImage from '@/assets/木叶创立.webp'

const router = useRouter()
const emit = defineEmits<{ (e: 'finish'): void }>()

const props = defineProps<{
  mode?: 'initial' | 'navigating'
  navigated?: boolean
}>()

const isExiting = ref(false)

const isFastMode = sessionStorage.getItem('splash_shown') !== null
sessionStorage.setItem('splash_shown', 'true')
const MIN_DISPLAY_TIME = isFastMode ? 300 : 2200
const NAVIGATE_DISPLAY_MS = 600
const EXIT_ANIMATION_MS = props.mode === 'navigating' ? 450 : 1100

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

onMounted(() => {
  if (props.mode === 'navigating') {
    runNavigatingSplash()
  } else {
    runInitialSplash()
  }
})

// 💡 首次启动：等路由就绪 + 核心大图，后台静默预热
const runInitialSplash = () => {
  const startTime = Date.now()

  // 1. 关键路径：只等待路由就绪 + 核心 2 张大图
  const routerPromise = router.isReady().catch(() => {})
  const criticalImages = [MYimage, bgImage]
  const imagePromise = Promise.all(
    criticalImages.map(url => new Promise((resolve) => {
      const img = new Image()
      img.src = url
      img.onload = resolve
      img.onerror = resolve
      setTimeout(resolve, 5000)
    }))
  )
  const MAX_INITIAL_WAIT_MS = 8000

  // 2. 非关键路径预热（仅首次执行，静默并发）
  // (1) 预热文章浏览量
  const firstPageIds = articles.slice(0, 6).map(a => a.id).join(',')
  axios.get(`/api/views?ids=${firstPageIds}`).then(res => {
    if (res.data?.views) {
      sessionStorage.setItem('preloaded_views', JSON.stringify(res.data.views))
    }
  }).catch(() => {})

  // (2) 预热提交时间线
  fetch('/api/commits-timeline').catch(() => {})

  // (3) 💡 新增：预加载审核通过的留言列表，同时预热 MongoDB 连接池
  axios.get('/api/signals').then(res => {
    if (res.data?.success && res.data?.data) {
      sessionStorage.setItem('preloaded_signals', JSON.stringify(res.data.data))
    }
  }).catch(() => {})

  // (4) 闲时加载相册等次要大图
  setTimeout(() => {
    const secondaryImages = ['/covers/game.webp']
    secondaryImages.forEach(src => {
      const img = new Image()
      img.src = src
    })
  }, 1000)

  // 3. 阻塞等待核心资源与动画保底
  Promise.race([
    Promise.all([imagePromise, routerPromise]),
    sleep(MAX_INITIAL_WAIT_MS)
  ]).then(async () => {
    const elapsed = Date.now() - startTime
    const delay = Math.max(MIN_DISPLAY_TIME - elapsed, 0)
    await sleep(delay)
    exitSplash()
  })
}

// 💡 路由切换逻辑
const runNavigatingSplash = () => {
  const startTime = Date.now()

  watch(() => props.navigated, (done) => {
    if (!done) return
    const elapsed = Date.now() - startTime
    const delay = Math.max(NAVIGATE_DISPLAY_MS - elapsed, 0)
    setTimeout(exitSplash, delay)
  }, { immediate: true })

  setTimeout(exitSplash, 30000)
}

const exitSplash = () => {
  isExiting.value = true
  setTimeout(() => {
    emit('finish')
  }, EXIT_ANIMATION_MS)
}
</script>

<style scoped>
.t1 {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100vh;
  margin: 0;
  position: fixed;
  inset: 0;
  background-color: #FAF7F2;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='.1'/%3E%3C/svg%3E");
  overflow: hidden;
  z-index: 9999;
  transition: transform 1.1s cubic-bezier(0.77, 0, 0.175, 1), opacity 0.9s ease;
}

.t1--quick {
  transition: transform 0.45s cubic-bezier(0.77, 0, 0.175, 1), opacity 0.4s ease;
}

.t1::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 60vh;
  background: radial-gradient(ellipse at 50% -10%, rgba(255, 244, 224, 0.5), transparent 70%);
  pointer-events: none;
  z-index: 0;
}

.t1 > * {
  position: relative;
  z-index: 1;
}

.t1.slide-up-exit {
  transform: translateY(-100%);
  opacity: 0;
  pointer-events: none;
}

.brand-wrapper {
  position: relative;
  width: 90%;
  max-width: 820px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
}

.svg-container {
  width: 100%;
  height: 170px;
}

:deep(.animated-text) {
  stroke: #2C2C2C;
  stroke-width: 1.4px;
  fill: transparent;
  stroke-dasharray: 800;
  stroke-dashoffset: 800;
  animation: drawText 2.4s ease-in-out forwards;
}

@keyframes drawText {
  0% {
    stroke-dashoffset: 800;
    fill: transparent;
  }
  75% {
    stroke-dashoffset: 0;
    fill: transparent;
  }
  100% {
    stroke-dashoffset: 0;
    fill: #2C2C2C;
  }
}

.chinese-seal {
  position: absolute;
  right: 22%;
  bottom: 22px;
  transform: rotate(-3deg);
  width: 92px;
  height: 30px;
  border: 1.5px solid #a82824;
  border-radius: 3px;
  padding: 1.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform-origin: center center;
  animation: stampIn 0.45s cubic-bezier(0.25, 1, 0.5, 1) forwards;
  animation-delay: 1.85s;
  pointer-events: none;
}

.seal-inner {
  width: 100%;
  height: 100%;
  background-color: #a82824;
  color: #FAF7F2;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  font-family: 'ZiTiGuanJiaKaiTi', 'SimSun', -apple-system, sans-serif;
  font-weight: bold;
  border-radius: 1.5px;
  box-shadow: inset 0 0 2px rgba(0, 0, 0, 0.3);
  white-space: nowrap;
}

.seal-at {
  font-size: 11px;
  opacity: 0.85;
}

.seal-text {
  font-size: 12px;
  letter-spacing: 0.5px;
}

@keyframes stampIn {
  0% {
    opacity: 0;
    transform: scale(2.2) rotate(14deg);
    filter: blur(2px);
  }
  75% {
    opacity: 1;
    transform: scale(0.94) rotate(-6deg);
    filter: blur(0);
  }
  100% {
    opacity: 0.92;
    transform: scale(1) rotate(-4deg);
  }
}

.status-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 10px;
}

.loader {
  position: relative;
  width: 32px;
  height: 32px;
}

.loader div {
  width: 7%;
  height: 22%;
  background: #5C5549;
  position: absolute;
  left: 50%;
  top: 30%;
  opacity: 0;
  border-radius: 50px;
  box-shadow: 0 0 1px rgba(0, 0, 0, 0.1);
  animation: fade458 1.1s linear infinite;
}

@keyframes fade458 {
  from {
    opacity: 0.9;
  }
  to {
    opacity: 0.12;
  }
}

.loader .bar1  { transform: rotate(0deg) translate(0, -130%); animation-delay: 0s; }
.loader .bar2  { transform: rotate(30deg) translate(0, -130%); animation-delay: -1.008s; }
.loader .bar3  { transform: rotate(60deg) translate(0, -130%); animation-delay: -0.916s; }
.loader .bar4  { transform: rotate(90deg) translate(0, -130%); animation-delay: -0.825s; }
.loader .bar5  { transform: rotate(120deg) translate(0, -130%); animation-delay: -0.733s; }
.loader .bar6  { transform: rotate(150deg) translate(0, -130%); animation-delay: -0.641s; }
.loader .bar7  { transform: rotate(180deg) translate(0, -130%); animation-delay: -0.55s; }
.loader .bar8  { transform: rotate(210deg) translate(0, -130%); animation-delay: -0.458s; }
.loader .bar9  { transform: rotate(240deg) translate(0, -130%); animation-delay: -0.366s; }
.loader .bar10 { transform: rotate(270deg) translate(0, -130%); animation-delay: -0.275s; }
.loader .bar11 { transform: rotate(300deg) translate(0, -130%); animation-delay: -0.183s; }
.loader .bar12 { transform: rotate(330deg) translate(0, -130%); animation-delay: -0.091s; }

.loading-caption {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 2px;
  color: rgba(44, 44, 44, 0.45);
  animation: captionPulse 2s ease-in-out infinite;
}

@keyframes captionPulse {
  0%, 100% { opacity: 0.35; }
  50% { opacity: 0.75; }
}

@media (prefers-reduced-motion: reduce) {
  :deep(.animated-text),
  .chinese-seal,
  .loader div,
  .loading-caption {
    animation: none !important;
  }
  :deep(.animated-text) {
    stroke-dashoffset: 0;
    fill: #2C2C2C;
  }
  .chinese-seal {
    opacity: 0.92;
    transform: scale(1) rotate(-4deg);
  }
}

@media (max-width: 640px) {
  .svg-container {
    height: 120px;
  }
  .chinese-seal {
    right: 5%;
    bottom: -6px;
    width: 84px;
    height: 26px;
  }
  .seal-text {
    font-size: 10.5px;
  }
}
</style>