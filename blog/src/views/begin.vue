<template>
  <!-- 黑色加载屏，通过 isExiting 触发退场动画 -->
  <div class="t1" :class="{ 'slide-up-exit': isExiting }">
    <!-- 手写文字 SVG 动画 -->
    <div class="wrapperON">
      <svg width="100%" height="200" viewBox="0 0 800 200" xmlns="http://www.w3.org/2000/svg">
<text 
  x="50%" y="50%" 
  text-anchor="middle" dy=".3em" 
  class="animated-text"
  :class="{ play: fontsLoaded }"
>
  一路向北的站点
</text>
      </svg>
    </div>

    <!-- 牛顿摆待机动画 -->
    <div class="newtons-cradle">
      <div class="newtons-cradle__dot"></div>
      <div class="newtons-cradle__dot"></div>
      <div class="newtons-cradle__dot"></div>
      <div class="newtons-cradle__dot"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import bgImage from '@/assets/木叶创立.webp'

const fontsLoaded = ref(false)

const emit = defineEmits<{ (e: 'finish'): void }>()

const isExiting = ref(false)
const MIN_DISPLAY_TIME = 2500 

onMounted(() => {
  const startTime = Date.now()

  // 1. 加载背景图片（之后主页使用）
  const loadImage = new Promise((resolve) => {
    const img = new Image()
    img.src = bgImage
    img.onload = img.onerror = resolve
  })

  // 2. 等待页面所有字体（包含手写字体 Zhi Mang Xing）加载完成
  const loadFonts = document.fonts.ready

  // 3. 等待全部资源就绪，然后保证最短显示时间
  Promise.all([loadImage, loadFonts]).then(() => {
    fontsLoaded.value = true
    const elapsed = Date.now() - startTime
    const delay = Math.max(MIN_DISPLAY_TIME - elapsed, 0)
    setTimeout(() => {
      exitSplash()
    }, delay)
  })
})

// 触发挥幕布退场，并在动画结束后通知父组件
const exitSplash = () => {
  isExiting.value = true
  setTimeout(() => {
    emit('finish')
  }, 1200) // 与 CSS 中 transition 时长匹配
}
</script>


<style scoped>
/* ========== 加载屏基础容器 ========== */
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
  background-color: #000;
  overflow: hidden;
  z-index: 9999;
  /* 向上滑出 + 淡出的过渡动画 */
  transition: transform 1.2s cubic-bezier(0.77, 0, 0.175, 1), opacity 1s ease;
}

/* 退场状态：整体上移并透明 */
.t1.slide-up-exit {
  transform: translateY(-100%);
  opacity: 0;
  pointer-events: none;
}

/* ========== 文字 SVG 容器 ========== */
.wrapperON {
  height: auto;
  width: 100%;
  max-width: 800px;
  margin-bottom: 20px;
}

/* ========== 手写中文动画 ========== */
.animated-text {
  font-size: 80px;
  font-family: 'ShangShouJiangHuShuFa';
  font-weight: normal;
  stroke: #ffffff;
  stroke-width: 1.5px;
  fill: transparent;
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
  /* 默认不播放动画，透明 */
  animation: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.animated-text.play {
  animation: drawText 2.5s ease-in-out forwards;
  opacity: 1;
}

@keyframes drawText {
  0% {
    stroke-dashoffset: 1000;
    fill: transparent;
  }
  70% {
    stroke-dashoffset: 0;
    fill: transparent;
  }
  100% {
    stroke-dashoffset: 0;
    fill: rgba(255, 255, 255, 1);
  }
}

/* ========== 牛顿摆动画 ========== */
.newtons-cradle {
  --uib-size: 50px;
  --uib-speed: 1.2s;
  --uib-color: #ffffff;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: var(--uib-size);
  height: var(--uib-size);
}

.newtons-cradle__dot {
  position: relative;
  display: flex;
  align-items: center;
  height: 100%;
  width: 25%;
  transform-origin: center top;
}

.newtons-cradle__dot::after {
  content: '';
  display: block;
  width: 100%;
  height: 25%;
  border-radius: 50%;
  background-color: var(--uib-color);
}

.newtons-cradle__dot:first-child {
  animation: swing var(--uib-speed) linear infinite;
}

.newtons-cradle__dot:last-child {
  animation: swing2 var(--uib-speed) linear infinite;
}

@keyframes swing {
  0% {
    transform: rotate(0deg);
    animation-timing-function: ease-out;
  }
  25% {
    transform: rotate(70deg);
    animation-timing-function: ease-in;
  }
  50% {
    transform: rotate(0deg);
    animation-timing-function: linear;
  }
}

@keyframes swing2 {
  0% {
    transform: rotate(0deg);
    animation-timing-function: linear;
  }
  50% {
    transform: rotate(0deg);
    animation-timing-function: ease-out;
  }
  75% {
    transform: rotate(-70deg);
    animation-timing-function: ease-in;
  }
}
</style>