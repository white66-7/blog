<template>
  <div
    class="book-scene-container animate__animated animate__fadeIn"
    style="animation-delay: 0.3s; animation-duration: 1.5s;"
  >
    <!-- 左翻页按钮 -->
    <button class="nav-btn prev-btn" @click.stop="prevPage" :class="{ 'hidden': flippedCount === 0 }">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </button>

    <!-- 右翻页按钮 -->
    <button class="nav-btn next-btn" @click.stop="nextPage" :class="{ 'hidden': flippedCount >= maxFlipped }">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </button>

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
                    :class="{ 'clickable': isFrontVisible(index) }"
                    @click.stop="isFrontVisible(index) ? $emit('open-photo', photo) : null"
                  >
                    <div class="photo">
                      <img :src="photo.url" class="real-image" />
                      <div class="dust"></div>
                      <div class="scratches"></div>
                    </div>
                    <div class="caption-handwritten">{{ photo.title }}</div>
                  </div>
                  <div class="page-number">{{ index * 2 }}</div>
                </div>
                <div class="page-fold-right"></div>
              </div>

              <!-- 背面（左页） -->
              <div class="page-face back" :class="{ 'face-active': isBackVisible(index) }">
                <div v-if="sheet.back.type === 'blank'" class="page-content blank-content"></div>
                <div v-else class="page-content grid-page">
                  <div
                    v-for="(photo, i) in sheet.back.items"
                    :key="i"
                    class="polaroid-in-book"
                    :class="{ 'clickable': isBackVisible(index) }"
                    @click.stop="isBackVisible(index) ? $emit('open-photo', photo) : null"
                  >
                    <div class="photo">
                      <img :src="photo.url" class="real-image" />
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

        <!-- 左右页边厚度 -->
<div class="page-block block-right" 
     :class="{ 'page-block-hidden': hideRight }" 
     :style="{ width: rightEdgeWidth + 'px' }"></div>
<div class="page-block block-left"  
     :class="{ 'page-block-hidden': hideLeft }" 
     :style="{ width: leftEdgeWidth + 'px' }"></div>
      </div>
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
const emit = defineEmits(['open-photo'])

const pageRefs = ref([])
const PAGE_STEP = 6
const flippedCount = ref(0)
const targetFlippedCount = ref(0)
const isAnimating = ref(false)
const FLIP_DURATION = 1.0

// 控制左右厚度块隐藏
const hideLeft = ref(false)
const hideRight = ref(false)

const maxFlipped = computed(() => props.sheets.length)

const totalEdgeWidth = computed(() => {
  if (!props.sheets.length) return 0
  return Math.min(8, Math.max(4, props.sheets.length * 1.5))
})

// 关键：宽度基于 flippedCount（当前真实页数），而不是 targetFlippedCount
const leftEdgeWidth = computed(() => {
  if (!maxFlipped.value) return 0
  return totalEdgeWidth.value * (flippedCount.value / maxFlipped.value)
})

const rightEdgeWidth = computed(() => {
  if (!maxFlipped.value) return 0
  return totalEdgeWidth.value * ((maxFlipped.value - flippedCount.value) / maxFlipped.value)
})

const isFrontVisible = (index) => index === flippedCount.value
const isBackVisible = (index) => index === flippedCount.value - 1

const initPages = () => {
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
  flippedCount.value = 0
  targetFlippedCount.value = 0
  isAnimating.value = false
  hideLeft.value = false
  hideRight.value = false
}

const nextPage = () => {
  if (isAnimating.value || flippedCount.value >= maxFlipped.value) return
  isAnimating.value = true

  targetFlippedCount.value = Math.min(maxFlipped.value, flippedCount.value + 1)

  // 翻页时：隐藏右侧厚度块（正在减少的一侧），左侧保持不动
  hideRight.value = true
  hideLeft.value = false

  const index = flippedCount.value
  const pageEl = pageRefs.value[index]
  const total = pageRefs.value.filter(Boolean).length
  if (!pageEl) { isAnimating.value = false; return; }

  gsap.set(pageEl, {
    z: total * PAGE_STEP,
    zIndex: total + 1
  })

  gsap.to(pageEl, {
    rotationY: -180,
    duration: FLIP_DURATION,
    ease: 'power2.inOut',
    onComplete: () => {
      gsap.set(pageEl, {
        z: (index + 1) * PAGE_STEP,
        zIndex: index + 1
      })
      flippedCount.value = targetFlippedCount.value
      isAnimating.value = false

      // 翻页结束：恢复右侧厚度块显示（此时宽度已更新）
      hideRight.value = false
    }
  })
}

const prevPage = () => {
  if (isAnimating.value || flippedCount.value <= 0) return
  isAnimating.value = true

  targetFlippedCount.value = Math.max(0, flippedCount.value - 1)

  // 翻页时：隐藏左侧厚度块（正在减少的一侧），右侧保持不动
  hideLeft.value = true
  hideRight.value = false

  const index = flippedCount.value - 1
  const pageEl = pageRefs.value[index]
  const total = pageRefs.value.filter(Boolean).length
  if (!pageEl) { isAnimating.value = false; return; }

  gsap.set(pageEl, {
    z: total * PAGE_STEP,
    zIndex: total + 1
  })

  gsap.to(pageEl, {
    rotationY: 0,
    duration: FLIP_DURATION,
    ease: 'power2.inOut',
    onComplete: () => {
      gsap.set(pageEl, {
        z: (total - index) * PAGE_STEP,
        zIndex: total - index
      })
      flippedCount.value = targetFlippedCount.value
      isAnimating.value = false

      // 翻页结束：恢复左侧厚度块显示
      hideLeft.value = false
    }
  })
}

let lastLength = -1

watch(() => props.sheets, (newSheets) => {
  if (newSheets.length === lastLength) return
  lastLength = newSheets.length

  pageRefs.value = []
  nextTick(() => { initPages() })
}, { immediate: true })
</script>

<style scoped>
/* ==========================================
   全局变量 & 容器
========================================== */
.book-scene-container {
  --book-w: min(36vw, calc((100vh - 180px) / 1.35));
  --book-h: calc(var(--book-w) * 1.35);
  position: relative;
  z-index: 2;
  height: 100vh;
  padding-top: 60px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.08);
}

/* ==========================================
   翻页按钮
========================================== */
.nav-btn {
  position: absolute;
  top: calc(50% + 30px);
  transform: translateY(-50%);
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #333;
}

.nav-btn:hover {
  background: #fff;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  transform: translateY(-50%) scale(1.1);
}

.nav-btn svg {
  width: 30px;
  height: 30px;
}

.prev-btn {
  left: calc(50% - var(--book-w) - 60px);
}

.next-btn {
  right: calc(50% - var(--book-w) - 60px);
}

.nav-btn.hidden {
  opacity: 0;
  pointer-events: none;
  transform: translateY(-50%) scale(0.8);
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
  perspective: clamp(800px, calc(var(--book-w) * 1.8), 1600px);
  width: calc(var(--book-w) * 2);
  height: var(--book-h);
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

/* ================= 书脊阴影（贴合书页高度） ================= */
.book-wrapper::after {
  content: '';
  position: absolute;
  top: 0;                         /* 对齐书页上边 */
  bottom: 3.5px;                      /* 对齐书页下边 */
  left: 50%;
  transform: translateX(-50%);
  width: min(60px, calc(var(--book-w) * 0.15));  /* 随书宽自适应 */
  background: linear-gradient(to right,
      transparent 0%,
      rgba(0, 0, 0, 0.2) 42%,
      rgba(0, 0, 0, 0.35) 49%,
      rgba(0, 0, 0, 0.4) 50%,
      rgba(0, 0, 0, 0.35) 51%,
      rgba(0, 0, 0, 0.2) 58%,
      transparent 100%);
  z-index: 100;
  pointer-events: none;
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

/* ==========================================
   书页纸面
========================================== */
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

.front {
  border-radius: 0 4px 4px 0;
  box-shadow: inset 2px 0 5px rgba(0, 0, 0, 0.1);
}

.back {
  transform: rotateY(180deg);
  border-radius: 4px 0 0 4px;
  box-shadow: inset -2px 0 5px rgba(0, 0, 0, 0.1);
}

.blank-content {
  background: linear-gradient(180deg, #fbf8f1 0%, #f5f0e4 100%);
}

/* 页面折痕 */
.page-fold-right {
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-left: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
  box-shadow: -5px 5px 10px rgba(221, 221, 221, 0.6);
  pointer-events: none;
}

.page-block-hidden {
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s;
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

/* ==========================================
   内容区域
========================================== */
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

/* ==========================================
   页边厚度块
========================================== */
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

/* ==========================================
   宝丽来相纸
========================================== */
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

/* ==========================================
   照片效果
========================================== */
.real-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: contrast(1.1) sepia(0.15);
  pointer-events: none;
}

.photo::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(120deg,
      rgba(255, 255, 255, 0) 30%,
      rgba(255, 255, 255, 0.4) 32%,
      rgba(255, 255, 255, 0) 35%);
  animation: shine 4s infinite;
  z-index: 2;
  pointer-events: none;
}

@keyframes shine {
  0% {
    transform: translateX(-100%) rotate(120deg);
  }

  20%,
  100% {
    transform: translateX(100%) rotate(120deg);
  }
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

/* ==========================================
   移动端适配
========================================== */
@media (max-width: 768px) {
  .book-scene-container {
    --book-w: min(45vw, calc((100vh - 160px) / 1.4));
    --book-h: calc(var(--book-w) * 1.4);
    padding-top: 50px;
  }

  .nav-btn {
    width: 40px;
    height: 40px;
    top: calc(50% + 25px);
  }

  .nav-btn svg {
    width: 20px;
    height: 20px;
  }

  .prev-btn {
    left: 4px;
  }

  .next-btn {
    right: 4px;
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