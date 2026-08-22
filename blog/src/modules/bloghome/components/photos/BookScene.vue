<template>
  <div
    class="book-scene-container animate__animated animate__fadeIn"
    style="animation-delay: 0.3s; animation-duration: 1.5s;"
  >
    <!-- 3D 书本场景 -->
    <div class="book-scene">
      <div class="book-wrapper">
        <div class="book bound">
          <div class="pages">
            <div
              v-for="(sheet, index) in sheets"
              :key="index"
              :ref="el => { if (el) pageRefs[index] = el }"
              class="page"
            >
              <!-- 正面（右页） -->
              <div class="page-face front" :class="{ 'face-active': isFrontVisible(index) }">
                <div v-if="sheet.front.type === 'blank'" class="page-content blank-content"></div>
                <div v-else class="page-content grid-page">
                  <div
                    v-for="(photo, i) in sheet.front.items"
                    :key="i"
                    class="polaroid-in-book"
                    :class="{ 'clickable': isFrontVisible(index) && !isAnimating }"
                    @click.stop="isFrontVisible(index) && !isAnimating ? $emit('open-photo', photo) : null"
                  >
                    <div class="photo">
                      <!-- 视频：默认暂停展示第一帧 -->
                      <video
                        v-if="isVideo(photo)"
                        :src="photo.url"
                        class="real-image"
                        preload="metadata"
                        playsinline
                        muted
                        @loadedmetadata="setMiddleFrame"
                      ></video>
                      <!-- 图片 -->
                      <img v-else :src="photo.url" class="real-image" />

                      <!-- 视频专属：左下角胶片图标 -->
                      <div v-if="isVideo(photo)" class="video-badge">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                          <path d="M0 0h24v24H0z" fill="none" />
                          <path fill="currentColor" d="M20 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-9.66 4.638a1.235 1.235 0 0 0-1.715.992a29 29 0 0 0-.176 3.264c0 1.55.112 2.719.176 3.264c.097.82.952 1.319 1.715.991a28 28 0 0 0 2.915-1.481a28 28 0 0 0 2.742-1.784a1.234 1.234 0 0 0 0-1.98a28 28 0 0 0-2.741-1.786a28 28 0 0 0-2.916-1.48" />
                        </svg>
                      </div>

                      <div class="dust"></div>
                      <div class="scratches"></div>
                    </div>
                    <div class="caption-handwritten">{{ photo.title }}</div>
                  </div>
                  <div class="page-number">{{ index * 2 }}</div>
                </div>
              </div>

              <!-- 背面（左页） -->
              <div class="page-face back" :class="{ 'face-active': isBackVisible(index) }">
                <div v-if="sheet.back.type === 'blank'" class="page-content blank-content"></div>
                <div v-else class="page-content grid-page">
                  <div
                    v-for="(photo, i) in sheet.back.items"
                    :key="i"
                    class="polaroid-in-book"
                    :class="{ 'clickable': isBackVisible(index) && !isAnimating }"
                    @click.stop="isBackVisible(index) && !isAnimating ? $emit('open-photo', photo) : null"
                  >
                    <div class="photo">
                      <!-- 视频：默认暂停展示第一帧 -->
                      <video
                        v-if="isVideo(photo)"
                        :src="photo.url"
                        class="real-image"
                        preload="metadata"
                        playsinline
                        muted
                        @loadedmetadata="setMiddleFrame"
                      ></video>
                      <!-- 图片 -->
                      <img v-else :src="photo.url" class="real-image" />

                      <!-- 视频专属：左下角胶片图标 -->
                      <div v-if="isVideo(photo)" class="video-badge">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                          <path d="M0 0h24v24H0z" fill="none" />
                          <path fill="currentColor" d="M20 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-9.66 4.638a1.235 1.235 0 0 0-1.715.992a29 29 0 0 0-.176 3.264c0 1.55.112 2.719.176 3.264c.097.82.952 1.319 1.715.991a28 28 0 0 0 2.915-1.481a28 28 0 0 0 2.742-1.784a1.234 1.234 0 0 0 0-1.98a28 28 0 0 0-2.741-1.786a28 28 0 0 0-2.916-1.48" />
                        </svg>
                      </div>

                      <div class="dust"></div>
                      <div class="scratches"></div>
                    </div>
                    <div class="caption-handwritten">{{ photo.title }}</div>
                  </div>
                  <div class="page-number">{{ index * 2 + 1 }}</div>
                </div>
                <div class="page-fold-left"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="page-block block-right" 
             :style="{ 
               width: rightEdgeWidth + 'px', 
               opacity: rightEdgeProgress > 0.1 ? 0.9 : 0 
             }"></div>
        <div class="page-block block-left"  
             :style="{ 
               width: leftEdgeWidth + 'px', 
               opacity: leftEdgeProgress > 0.1 ? 0.9 : 0 
             }"></div>
      </div>
    </div>

    <!-- 底部悬浮控制条 (Controls Capsule) -->
    <div class="controls-bar">
      <!-- 上一页按钮 -->
      <button 
        class="ctrl-btn" 
        :class="{ 'disabled': activePageIndex === 0 || isAnimating }" 
        :disabled="activePageIndex === 0 || isAnimating"
        @click.stop="prevPage"
        aria-label="Previous Page"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="15 18 9 12 15 6"></polyline>
        </svg>
      </button>

      <!-- 进度指示条 / 圆点 -->
      <div class="dots-wrapper">
        <div
          v-for="(_, i) in (maxFlipped + 1)"
          :key="i"
          class="dot-indicator"
          :class="{ 'active': activePageIndex === i }"
          @click.stop="goToPage(i)"
        ></div>
      </div>

      <!-- 下一页按钮 -->
      <button 
        class="ctrl-btn" 
        :class="{ 'disabled': activePageIndex >= maxFlipped || isAnimating }" 
        :disabled="activePageIndex >= maxFlipped || isAnimating"
        @click.stop="nextPage"
        aria-label="Next Page"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="9 18 15 12 9 6"></polyline>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import gsap from 'gsap'

const props = defineProps({
  sheets: { type: Array, required: true },
  cover: { type: String, default: '' }
})

defineEmits(['open-photo'])

// 判断是否为视频
const isVideo = (item) => {
  if (!item) return false
  if (item.type === 'video') return true
  if (typeof item.url === 'string') {
    return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(item.url)
  }
  return false
}

const setMiddleFrame = (e) => {
  const video = e.target;
  if (video.duration) {
    video.currentTime = video.duration / 2;
  }
}

const pageRefs = ref([])
const PAGE_STEP = 6
const flippedCount = ref(0)
const activePageIndex = ref(0)
const isAnimating = ref(false)

const leftEdgeProgress = ref(0)
const rightEdgeProgress = ref(0)

const maxFlipped = computed(() => props.sheets.length)

const totalEdgeWidth = computed(() => {
  if (!props.sheets.length) return 0
  return Math.min(8, Math.max(4, props.sheets.length * 1.5))
})

const leftEdgeWidth = computed(() => {
  if (!maxFlipped.value) return 0
  return totalEdgeWidth.value * (leftEdgeProgress.value / maxFlipped.value)
})

const rightEdgeWidth = computed(() => {
  if (!maxFlipped.value) return 0
  return totalEdgeWidth.value * (rightEdgeProgress.value / maxFlipped.value)
})

const isFrontVisible = (index) => index === flippedCount.value
const isBackVisible = (index) => index === flippedCount.value - 1

const updateEdgesByAngle = (pageIndex, rotationY) => {
  const RIGHT_END_ANGLE = 2; 
  const LEFT_START_ANGLE = 178;
  const STICKY_POWER = 2;

  const r = Math.abs(rotationY);
  const pRight = Math.max(0, Math.min(1, r / RIGHT_END_ANGLE));
  const rightContribution = 1 - Math.pow(pRight, STICKY_POWER);

  const pLeft = Math.max(0, Math.min(1, (r - LEFT_START_ANGLE) / (180 - LEFT_START_ANGLE)));
  const leftContribution = Math.pow(pLeft, STICKY_POWER);

  leftEdgeProgress.value = pageIndex + leftContribution;
  rightEdgeProgress.value = (maxFlipped.value - 1 - pageIndex) + rightContribution;
}

const initPages = () => {
  flippedCount.value = 0
  activePageIndex.value = 0
  isAnimating.value = false
  leftEdgeProgress.value = 0
  rightEdgeProgress.value = maxFlipped.value 

  const validPages = pageRefs.value.filter(el => el != null)
  if (validPages.length === 0) return

  const total = validPages.length
  validPages.forEach((pageEl, index) => {
    gsap.killTweensOf(pageEl)
    gsap.set(pageEl, {
      rotationY: 0,
      z: (total - index) * PAGE_STEP,
      zIndex: total - index,
      force3D: true
    })
  })
}

// 核心跳转函数
const goToPage = (targetIndex) => {
  if (isAnimating.value || targetIndex === flippedCount.value) return
  if (targetIndex < 0 || targetIndex > maxFlipped.value) return

  activePageIndex.value = targetIndex
  isAnimating.value = true

  const total = pageRefs.value.filter(Boolean).length
  const fromIndex = flippedCount.value
  const toIndex = targetIndex
  const isForward = toIndex > fromIndex
  const numPages = Math.abs(toIndex - fromIndex)

  const totalDuration = numPages === 1 ? 0.85 : Math.min(1.3, 0.4 + numPages * 0.12)
  const staggerDelay = numPages === 1 ? 0 : (totalDuration * 0.35) / numPages
  const pageDuration = numPages === 1 ? totalDuration : totalDuration - (numPages - 1) * staggerDelay

  const tl = gsap.timeline({
    onComplete: () => {
      for (let i = 0; i < total; i++) {
        const el = pageRefs.value[i]
        if (!el) continue
        if (i < toIndex) {
          gsap.set(el, {
            rotationY: -180,
            z: (i + 1) * PAGE_STEP,
            zIndex: i + 1
          })
        } else {
          gsap.set(el, {
            rotationY: 0,
            z: (total - i) * PAGE_STEP,
            zIndex: total - i
          })
        }
      }

      flippedCount.value = toIndex
      leftEdgeProgress.value = toIndex
      rightEdgeProgress.value = maxFlipped.value - toIndex
      isAnimating.value = false
    }
  })

  if (isForward) {
    for (let step = 0; step < numPages; step++) {
      const i = fromIndex + step
      const el = pageRefs.value[i]
      if (!el) continue

      const startTime = step * staggerDelay
      tl.set(el, { z: (total + step + 1) * PAGE_STEP, zIndex: total + step + 1 }, startTime)
      tl.to(el, {
        rotationY: -180,
        duration: pageDuration,
        ease: 'power2.inOut',
        onUpdate: () => {
          if (step === numPages - 1) {
            const r = gsap.getProperty(el, "rotationY")
            updateEdgesByAngle(i, r)
          }
        }
      }, startTime)
    }
  } else {
    for (let step = 0; step < numPages; step++) {
      const i = fromIndex - 1 - step
      const el = pageRefs.value[i]
      if (!el) continue

      const startTime = step * staggerDelay
      tl.set(el, { z: (total + step + 1) * PAGE_STEP, zIndex: total + step + 1 }, startTime)
      tl.to(el, {
        rotationY: 0,
        duration: pageDuration,
        ease: 'power2.inOut',
        onUpdate: () => {
          if (step === numPages - 1) {
            const r = gsap.getProperty(el, "rotationY")
            updateEdgesByAngle(i, r)
          }
        }
      }, startTime)
    }
  }
}

const nextPage = () => {
  goToPage(activePageIndex.value + 1)
}

const prevPage = () => {
  goToPage(activePageIndex.value - 1)
}

let lastLength = -1

watch(() => props.sheets, (newSheets) => {
  if (newSheets.length === lastLength) return
  lastLength = newSheets.length

  pageRefs.value = []
  leftEdgeProgress.value = 0
  rightEdgeProgress.value = newSheets.length

  nextTick(() => { initPages() })
}, { immediate: true })
</script>

<style scoped>
/* ==========================================
   全局变量 & 容器
========================================== */
.book-scene-container {
  --book-w: min(32vw, calc((100vh - 220px) / 1.35));
  --book-h: calc(var(--book-w) * 1.35);
  position: relative;
  z-index: 2;
  height: 100vh;
  padding-top: 40px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(ellipse at 50% 42%, rgba(255, 246, 226, 0.55), rgba(255, 255, 255, 0.06) 60%, transparent 75%);
}

/* ==========================================
   底部悬浮控制条
========================================== */
.controls-bar {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 18px;
  background-color: rgba(255, 252, 243, 0.82);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(220, 210, 190, 0.85);
  border-radius: 9999px;
  box-shadow: 
    0 10px 30px -4px rgba(0, 0, 0, 0.12),
    0 4px 12px -2px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  z-index: 100;
  user-select: none;
  transition: all 0.3s ease;
}

.controls-bar:hover {
  background-color: rgba(255, 253, 246, 0.95);
  box-shadow: 
    0 14px 36px -4px rgba(0, 0, 0, 0.16),
    0 6px 16px -2px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

/* 翻页按钮 */
.ctrl-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #4a453e;
  cursor: pointer;
  padding: 0;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.ctrl-btn svg {
  width: 24px;
  height: 24px;
  transition: transform 0.2s ease;
}

.ctrl-btn:hover:not(.disabled) {
  background-color: rgba(0, 0, 0, 0.06);
  color: #1a1a1a;
  transform: scale(1.12);
}

.ctrl-btn:active:not(.disabled) {
  transform: scale(0.92);
}

.ctrl-btn.disabled {
  opacity: 0.2;
  cursor: not-allowed;
  transform: none;
}

/* 指示器轨道 */
.dots-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 90px;
  padding: 0 6px;
  height: 30px;
}

/* 指示点 */
.dot-indicator {
  position: relative;
  height: 8px;
  width: 8px;
  border-radius: 9999px;
  background-color: rgba(74, 69, 62, 0.28);
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dot-indicator::after {
  content: '';
  position: absolute;
  top: -8px;
  bottom: -8px;
  left: -4px;
  right: -4px;
}

.dot-indicator:hover:not(.active) {
  background-color: rgba(74, 69, 62, 0.7);
  transform: scale(1.4);
  box-shadow: 0 0 8px rgba(74, 69, 62, 0.35);
}

.dot-indicator.active {
  width: 28px;
  background-color: #38322a;
  box-shadow: 0 2px 6px rgba(56, 50, 42, 0.25);
}

.dot-indicator.active:hover {
  transform: scale(1.06);
  background-color: #1a1815;
}

/* ==========================================
   3D 场景屏蔽
========================================== */
.book-scene,
.book-wrapper,
.book,
.pages,
.page,
.page-face,
.page-content {
  pointer-events: none;
}

/* ==========================================
   书本 3D 场景
========================================== */
.book-scene {
  position: relative;
  perspective: clamp(800px, calc(var(--book-w) * 1.8), 1600px);
  width: calc(var(--book-w) * 2);
  height: var(--book-h);
}

.book-scene::after {
  content: '';
  position: absolute;
  bottom: -16px;
  left: 50%;
  transform: translateX(-50%);
  width: 72%;
  height: 16px;
  background: radial-gradient(ellipse, rgba(0, 0, 0, 0.18), transparent 70%);
  filter: blur(3px);
  pointer-events: none;
  z-index: 0;
}

.book-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  isolation: isolate;
}

/* ================= 书皮 ================= */
.book.bound {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  transform: rotateX(8deg);
  transform-style: preserve-3d;
}

.book.bound::before {
  content: '';
  position: absolute;
  inset: -15px;
  border-radius: 6px;
  transform: translateZ(-3px);
  background-color: #f6eeda;
  background-image:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='.2'/%3E%3C/svg%3E"),
    radial-gradient(ellipse at center, #fffef9 0%, #fdf9ef 70%, #f7efda 100%);
  background-blend-mode: multiply;
}

/* ================= 书脊底层接缝（优化为自然微缝，层级置底不遮挡翻页） ================= */
.book-wrapper::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 3.5px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  background: linear-gradient(to right,
      transparent 0%,
      rgba(60, 45, 30, 0.08) 35%,
      rgba(60, 45, 30, 0.22) 50%,
      rgba(60, 45, 30, 0.08) 65%,
      transparent 100%);
  z-index: 2;
  pointer-events: none;
  mix-blend-mode: multiply;
}

/* ================= 页面结构 ================= */
.pages {
  position: absolute;
  top: 0;
  left: 50%;
  width: 50%;
  height: 100%;
  transform-style: preserve-3d;
}

.page {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transform-origin: left center;
}

/* ================= 书页纸面 ================= */
.page-face {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  backface-visibility: hidden;
  background-color: #f7f5ef;
  background-image:
    linear-gradient(rgba(255, 255, 255, .55), rgba(255, 255, 255, .55)),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='.1'/%3E%3C/svg%3E");
}

/* 右页（Front）：随 3D 纸张运动的书脊侧自然凹陷光影 */
.front {
  border-radius: 0 4px 4px 0;
  box-shadow: inset 1px 0 2px rgba(0, 0, 0, 0.04);
}

.front::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: min(42px, 16%);
  background: linear-gradient(to right, rgba(50, 35, 20, 0.16) 0%, rgba(50, 35, 20, 0.04) 55%, transparent 100%);
  pointer-events: none;
  z-index: 15;
  mix-blend-mode: multiply;
}

/* 左页（Back）：随 3D 纸张运动的书脊侧自然凹陷光影 */
.back {
  transform: rotateY(180deg);
  border-radius: 4px 0 0 4px;
  box-shadow: inset -1px 0 2px rgba(0, 0, 0, 0.04);
}

.back::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  width: min(42px, 16%);
  background: linear-gradient(to left, rgba(50, 35, 20, 0.16) 0%, rgba(50, 35, 20, 0.04) 55%, transparent 100%);
  pointer-events: none;
  z-index: 15;
  mix-blend-mode: multiply;
}

.blank-content {
  background: linear-gradient(180deg, #fbf8f1 0%, #f5f0e4 100%);
}

.page-fold-left {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  border-right: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
  box-shadow: 5px 5px 10px rgba(221, 221, 221, 0.6);
  pointer-events: none;
}

/* ================= 内容区域 ================= */
.page-content {
  width: 100%;
  height: 100%;
  padding: 20px;
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.grid-page {
  justify-content: space-evenly;
  padding: 20px;
}

/* ================= 页边厚度块 ================= */
.page-block {
  position: absolute;
  top: 2px;
  bottom: 3.5px;
  z-index: 5;
  pointer-events: none;
  background: repeating-linear-gradient(
    to right,
    #d9d2c0 0 1px,
    #efe9da 1px 2px,
    #fffdf6 2px 3px
  );
  box-shadow: inset 0 0 3px rgba(0, 0, 0, .18);
  opacity: 0.9;
}

.block-right {
  right: -2px;
  border-radius: 0 3px 3px 0;
}

.block-left {
  left: -2px;
  border-radius: 3px 0 0 3px;
  background: repeating-linear-gradient(
    to right,
    #fffdf6 0 1px,
    #efe9da 1px 2px,
    #d9d2c0 2px 3px
  );
}

/* ================= 宝丽来相纸 ================= */
.polaroid-in-book {
  position: relative;
  width: 75%;
  height: 42%;
  padding: 12px 12px 18px 12px;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s, box-shadow 0.3s, z-index 0.3s;
  display: flex;
  flex-direction: column;
  pointer-events: none;
}

.polaroid-in-book:nth-child(odd) {
  transform: rotate(-2deg);
}

.polaroid-in-book:nth-child(even) {
  transform: rotate(1.5deg);
}

.polaroid-in-book.clickable {
  pointer-events: auto;
  cursor: zoom-in;
}

.polaroid-in-book.clickable:hover {
  transform: scale(1.05) rotate(0deg);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.polaroid-in-book .photo {
  flex-grow: 1;
  min-height: 0;
  position: relative;
  overflow: hidden;
  background: #1a1a1a;
  pointer-events: none;
}

/* ================= 视频左下角图标 ================= */
.video-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  z-index: 6;
  width: 35px;
  height: 35px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(2px);
  border-radius: 4px;
  color: #ffffff;
  pointer-events: none;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.video-badge svg {
  width: 30px;
  height: 30px;
}

.caption-handwritten {
  font-family: 'Comic Sans MS', 'Chalkboard SE', 'Marker Felt', 'KaiTi', cursive;
  text-align: center;
  margin-top: 10px;
  font-size: 14px;
  color: #333;
  pointer-events: none;
}

.page-number {
  position: absolute;
  bottom: 20px;
  font-family: 'Playfair Display', serif;
  font-weight: bold;
  opacity: 0.5;
  pointer-events: none;
}

.front .page-number {
  right: 30px;
}

.back .page-number {
  left: 30px;
}

/* ================= 照片 / 视频通用效果 ================= */
.real-image {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  filter: contrast(1.1) sepia(0.15);
  pointer-events: none;
}

.dust {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-image:
    radial-gradient(#000 1px, transparent 1px),
    radial-gradient(#000 1px, transparent 1px);
  background-size: 50px 50px;
  background-position: 0 0, 25px 25px;
  opacity: 0.05;
  z-index: 3;
  pointer-events: none;
}

.scratches {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background:
    linear-gradient(45deg, transparent 45%, rgba(0, 0, 0, 0.05) 46%, transparent 47%),
    linear-gradient(-45deg, transparent 45%, rgba(0, 0, 0, 0.05) 46%, transparent 47%);
  background-size: 200px 200px;
  opacity: 0.5;
  z-index: 3;
  pointer-events: none;
}

/* ================= 移动端适配 ================= */
@media (max-width: 768px) {
  .book-scene-container {
    --book-w: min(42vw, calc((100vh - 180px) / 1.4));
    --book-h: calc(var(--book-w) * 1.4);
    padding-top: 30px;
  }

  .controls-bar {
    bottom: 20px;
    padding: 6px 14px;
    gap: 10px;
  }

  .ctrl-btn {
    width: 36px;
    height: 36px;
  }

  .ctrl-btn svg {
    width: 20px;
    height: 20px;
  }

  .dot-indicator.active {
    width: 20px;
  }

  .polaroid-in-book {
    width: 90%;
    padding: 6px 6px 12px 6px;
  }

  .page-block {
    display: none;
  }
}
</style>