<template>
  <div class="slider-wrapper" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
    <div class="slider-viewport">
      <div
        class="slider-inner"
        :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
      >
        <div
          class="slide"
          v-for="(image, idx) in images"
          :key="idx"
          :class="{ active: idx === currentIndex }"
        >
          <div class="property-card">
            <!-- 图片区域 -->
            <div class="property-image">
              <!-- 骨架层：图片加载完前显示 -->
              <div
                :class="['skeleton-img', { 'skeleton-hidden': imageLoaded[idx] }]"
              ></div>
              <!-- 真实背景图层：加载完成后淡入 -->
              <div
                class="bg-img"
                :style="{ backgroundImage: `url(${image.url})` }"
                :class="{ 'bg-visible': imageLoaded[idx] }"
              ></div>
            </div>

            <!-- 描述区域 -->
            <div class="property-description">
              <p>{{ image.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 左右箭头 -->
    <div class="slider-controls prev-next">
      <button class="prev" @click="prevSlide">
        <span>&#10094;</span>
      </button>
      <button class="next" @click="nextSlide">
        <span>&#10095;</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'

interface SlideImage {
  url: string
  title?: string
  description?: string
}

const props = defineProps<{
  images: SlideImage[]
}>()

const currentIndex = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

// ---------- 图片预加载 & 骨架状态 ----------
const imageLoaded = ref<boolean[]>([])

const preloadImages = (images: { url: string }[]) => {
  imageLoaded.value = new Array(images.length).fill(false)
  images.forEach((img, idx) => {
    const image = new Image()
    image.onload = () => { imageLoaded.value[idx] = true }
    image.onerror = () => { imageLoaded.value[idx] = true } // 失败也隐藏骨架
    image.src = img.url
  })
}

watch(() => props.images, (newImages) => {
  preloadImages(newImages)
}, { immediate: true })

// ---------- 轮播逻辑 ----------
const nextSlide = () => {
  currentIndex.value = (currentIndex.value + 1) % props.images.length
}

const prevSlide = () => {
  currentIndex.value =
    (currentIndex.value - 1 + props.images.length) % props.images.length
}

const startAutoPlay = () => {
  if (props.images.length <= 1) return
  stopAutoPlay()
  timer = setInterval(nextSlide, 4000)
}

const stopAutoPlay = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

const onMouseEnter = () => stopAutoPlay()
const onMouseLeave = () => startAutoPlay()

onMounted(() => {
  startAutoPlay()
})

onUnmounted(() => {
  stopAutoPlay()
})
</script>

<style scoped>
/* ========= 轮播容器 ========= */
.slider-wrapper {
  position: relative;
  max-width: 100%;
  margin: 1em auto;
  overflow: hidden;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  background: #f2f2f2;
}

.slider-viewport {
  overflow: hidden;
}

.slider-inner {
  display: flex;
  transition: transform 800ms cubic-bezier(0.77, 0, 0.175, 1);
  line-height: 0;
}

.slide {
  flex: 0 0 100%;
  position: relative;
  aspect-ratio: 16 / 9;
  overflow: hidden;
}

.property-card {
  width: 100%;
  height: 100%;
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  background: #fff;
}

/* ========= 图片区域（绝对定位） ========= */
.property-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transition: height 0.4s cubic-bezier(0.645, 0.045, 0.355, 1);
}

/* 真实背景图层 */
.bg-img {
  position: absolute;
  inset: 0;
  z-index: 1;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.bg-visible {
  opacity: 1;
}

/* 骨架层 */
.skeleton-img {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: linear-gradient(
    90deg,
    #e0e0e0 25%,
    #f5f5f5 50%,
    #e0e0e0 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
  opacity: 1;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.skeleton-hidden {
  opacity: 0;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* ========= 描述区域 ========= */
.property-description {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 0;
  overflow: hidden;
  background-color: #fafafc;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0;
  box-sizing: border-box;
  transition: height 0.4s cubic-bezier(0.645, 0.045, 0.355, 1),
              padding 0.4s cubic-bezier(0.645, 0.045, 0.355, 1);
  z-index: 1;
}

.property-description p {
  margin: 0;
  font-size: 0.95em;
  color: #555;
  white-space: pre-line;
  line-height: 1.5;
}

/* ========= Hover 效果 ========= */
.property-card:hover .property-image {
  height: 55%;
}

.property-card:hover .property-description {
  height: 45%;
  padding: 0.8em 1.2em;
}

/* ========= 左右箭头 ========= */
.slider-controls button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.7);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
}

.slider-wrapper:hover .slider-controls button {
  opacity: 0.7;
  pointer-events: auto;
}

.slider-controls button:hover {
  opacity: 1;
}

.prev { left: 10px; }
.next { right: 10px; }

/* ========= 移动端：始终显示图片 + 描述 ========= */
@media (max-width: 640px) {
  .property-image {
    height: 55%;
  }
  .property-description {
    height: 45%;
    padding: 0.8em 1.2em;
    overflow: visible;
  }
  .property-card:hover .property-image {
    height: 55%;
  }
  .property-card:hover .property-description {
    height: 45%;
    padding: 0.8em 1.2em;
  }
}
</style>