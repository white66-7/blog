<template>
  <div class="slider-wrapper"  @mouseenter="onMouseEnter"  @mouseleave="onMouseLeave">
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
            <!-- 图片区域（纯背景图） -->
            <div
              class="property-image"
              :style="{ backgroundImage: `url(${image.url})` }"
            ></div>

            <!-- 描述区域（只显示描述文本） -->
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
import { ref, onMounted, onUnmounted } from 'vue'

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
  timer = setInterval(nextSlide,4000)
}

const stopAutoPlay = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

// 鼠标悬停暂停轮播
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

/* 图片区域（默认全屏） */
.property-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: height 0.4s cubic-bezier(0.645, 0.045, 0.355, 1);
}

/* 描述区域（默认高度 0 隐藏） */
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
  background: rgba(255,255,255,0.7);
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