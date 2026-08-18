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
                    :class="{ 'clickable': isBackVisible(index) }"
                    @click.stop="isBackVisible(index) ? $emit('open-photo', photo) : null"
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
const isAnimating = ref(false)
const FLIP_DURATION = 1.0

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

const nextPage = () => {
  if (isAnimating.value || flippedCount.value >= maxFlipped.value) return
  isAnimating.value = true

  const index = flippedCount.value
  const targetCount = index + 1
  const pageEl = pageRefs.value[index]
  const total = pageRefs.value.filter(Boolean).length
  if (!pageEl) { isAnimating.value = false; return; }

  gsap.set(pageEl, { z: total * PAGE_STEP, zIndex: total + 1 })

  gsap.to(pageEl, {
    rotationY: -180,
    duration: FLIP_DURATION,
    ease: 'power2.inOut',
    onUpdate: function() {
      const currentRot = gsap.getProperty(pageEl, "rotationY")
      updateEdgesByAngle(index, currentRot)
    },
    onComplete: () => {
      gsap.set(pageEl, { z: (index + 1) * PAGE_STEP, zIndex: index + 1 })
      flippedCount.value = targetCount
      leftEdgeProgress.value = flippedCount.value
      rightEdgeProgress.value = maxFlipped.value - flippedCount.value
      isAnimating.value = false
    }
  })
}

const prevPage = () => {
  if (isAnimating.value || flippedCount.value <= 0) return
  isAnimating.value = true

  const targetCount = flippedCount.value - 1
  const index = targetCount
  const pageEl = pageRefs.value[index]
  const total = pageRefs.value.filter(Boolean).length
  if (!pageEl) { isAnimating.value = false; return; }

  gsap.set(pageEl, { z: total * PAGE_STEP, zIndex: total + 1 })

  gsap.to(pageEl, {
    rotationY: 0,
    duration: FLIP_DURATION,
    ease: 'power2.inOut',
    onUpdate: function() {
      const currentRot = gsap.getProperty(pageEl, "rotationY")
      updateEdgesByAngle(index, currentRot)
    },
    onComplete: () => {
      gsap.set(pageEl, { z: (total - index) * PAGE_STEP, zIndex: total - index })
      flippedCount.value = targetCount
      leftEdgeProgress.value = flippedCount.value
      rightEdgeProgress.value = maxFlipped.value - flippedCount.value
      isAnimating.value = false
    }
  })
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
  background: radial-gradient(ellipse at 50% 42%, rgba(255, 246, 226, 0.55), rgba(255, 255, 255, 0.06) 60%, transparent 75%);
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
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='.08'/%3E%3C/svg%3E");
  background-color: rgba(255, 252, 243, 0.92);
  border: 1px solid rgba(0, 0, 0, 0.06);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #333;
}

.nav-btn:hover {
  background-color: #fff;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.16), inset 0 1px 0 rgba(255, 255, 255, 0.9);
  transform: translateY(-50%) scale(1.1) rotate(2deg);
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

/* ================= 书脊阴影 ================= */
.book-wrapper::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 3.5px;
  left: 50%;
  transform: translateX(-50%);
  width: min(60px, calc(var(--book-w) * 0.15));
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