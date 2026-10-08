<template>
  <div class="app-flex" :class="{ 'app-flex--scrolled': !isFirstScreen }">
    <Navbar :transparent="isFirstScreen" />
    <swiper :modules="modules" :direction="'vertical'" :slidesPerView="1" :speed="600"
      :mousewheel="{ forceToAxis: true, releaseOnEdges: true }" @swiper="onSwiperInit" @slideChange="onSlideChange"
      class="fullpage-swiper" :noSwipingClass="'scrollable-content'"
      :simulateTouch="false" :resistanceRatio="0">
      <!-- 第一屏 -->
      <swiper-slide class="slide-hero">
        <div class="hero-section">
          <TextEffect />
          <div class="arrow bounce"></div>

          <div class="wave-container">
            <svg class="waves" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
              viewBox="0 24 150 28" preserveAspectRatio="none" shape-rendering="auto">
              <defs>
                <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
              </defs>
              <g class="parallax">
                <use xlink:href="#gentle-wave" x="48" y="0" fill="rgba(240,240,240,0.9)" />
                <use xlink:href="#gentle-wave" x="48" y="3" fill="rgba(240,240,240,0.7)" />
                <use xlink:href="#gentle-wave" x="48" y="5" fill="rgba(240,240,240,0.5)" />
                <use xlink:href="#gentle-wave" x="48" y="7" fill="#f0f0f0" />
              </g>
            </svg>
          </div>
        </div>
      </swiper-slide>

      <!-- 第二屏 -->
      <swiper-slide class="slide-main">
        <div class="scrollable-content" @touchstart="handleTouchStart" @touchmove="handleTouchMove">
          <div class="main-body" ref="mainBody">
            <div class="two-columns">
              <!-- 左侧：卡片列（information + player） -->
              <aside class="left-column">
                <Information class="info-card" :class="[showAnimation && 'animate__animated animate__fadeInLeft']" />
                <player class="sticky-card"
                  :class="[showAnimation && 'animate__animated animate__fadeInLeft animate__delay-1s']"
                  style="--animate-delay: .15s;" />
                <Say :class="[showAnimation && 'animate__animated animate__fadeInLeft animate__delay-1s']"
                  style="--animate-delay: .3s;" />
              </aside>

              <!-- 右侧：相册、天气、文章列表 -->
              <div class="right-column">
                <div class="top-row">
                  <div class="album-container">
                    <ImageSlider :images="albumImages"
                      :class="[showAnimation && 'animate__animated animate__zoomIn']" />
                  </div>
                  <WeatherCard address="武汉" class="weather-card-comp"
                    :class="[showAnimation && 'animate__animated animate__fadeInRight animate__delay-1s']"
                    style="--animate-delay: .15s;" />
                </div>
                <!-- 注意：ArticleShow 的根节点本身就是 .articles-section，
                     不要再套一层同名 div —— 那层壳不会跟着 flex 长高，
                     多出来的高度会全部堆在“网站已上线”条下方，导致右列底边对不齐左列 -->
                <ArticleShow :articles="articleData"
                  :class="[showAnimation && 'animate__animated animate__fadeInUp animate__delay-1s']"
                  style="--animate-delay: .3s;" />
                <SiteAge :class="[showAnimation && 'animate__animated animate__fadeInUp animate__delay-1s']"
                  style="--animate-delay: .75s;" />
              </div>
            </div>
          </div>
        </div>
      </swiper-slide>
    </swiper>
  </div>
</template>

<script setup lang="ts">
import Information from '@/modules/bloghome/components/bloghome/information.vue';
import player from '@/modules/bloghome/components/bloghome/music.vue'
import Say from '@/modules/bloghome/components/bloghome/say.vue'
import TextEffect from '@/modules/bloghome/components/text.vue'
import Navbar from '@/modules/bloghome/components/load.vue'
import ImageSlider from '@/modules/bloghome/components/bloghome/image.vue'
import ArticleShow from '@/modules/bloghome/components/bloghome/article_show.vue'
import WeatherCard from '@/modules/bloghome/components/bloghome/weatherCard.vue'
import SiteAge from '@/modules/bloghome/components/bloghome/dateshow.vue'
import { articles as articleData } from '@/date/articles'
import { onActivated, nextTick, ref } from 'vue'
import { onBeforeRouteLeave } from 'vue-router'

import { Swiper, SwiperSlide } from 'swiper/vue'
import { Mousewheel, Pagination } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/mousewheel'
import 'swiper/css/pagination'
import 'animate.css'

const mainBody = ref<HTMLElement | null>(null)
const modules = [Mousewheel, Pagination]
const isFirstScreen = ref(true)
const swiperInstance = ref<any>(null)
const savedSlideIndex = ref(0)
const savedScrollTop = ref(0)
const showAnimation = ref(false)

let touchStartY = 0
let isSliding = false

defineOptions({ name: 'BlogHome' })

onBeforeRouteLeave((to, from) => {
  if (swiperInstance.value) {
    savedSlideIndex.value = swiperInstance.value.activeIndex
  }
  const container = document.querySelector('.scrollable-content')
  if (container) {
    savedScrollTop.value = container.scrollTop
  }
  // 无需调用 next()，正常执行完毕即代表放行路由
})

onActivated(async () => {
  await nextTick()

  if (swiperInstance.value && savedSlideIndex.value === 1 && swiperInstance.value.activeIndex === 0) {
    swiperInstance.value.slideTo(1, 0)
    swiperInstance.value.update()
  }

  // 恢复滚动位置
  const container = document.querySelector('.scrollable-content') as HTMLElement | null
  if (container && savedScrollTop.value > 0) {
    container.scrollTop = savedScrollTop.value
  }
})

const onSwiperInit = (swiper: any) => {
  swiperInstance.value = swiper
}

const handleTouchStart = (e: TouchEvent) => {
  const touch = e.touches?.[0]
  if (!touch) return
  touchStartY = touch.clientY
}

const handleTouchMove = (e: TouchEvent) => {
  if (isSliding || !swiperInstance.value) return

  const touch = e.touches?.[0]
  if (!touch) return

  const container = e.currentTarget as HTMLElement
  const currentY = touch.clientY
  const diffY = currentY - touchStartY

  if (container.scrollTop <= 0 && diffY > 20) {
    isSliding = true
    swiperInstance.value.slidePrev()
    setTimeout(() => { isSliding = false }, 400)
  }
}

const onSlideChange = (swiper: any) => {
  if (swiper.activeIndex === 1) {
    isFirstScreen.value = false
    showAnimation.value = false
    requestAnimationFrame(() => {
      showAnimation.value = true
    })
  } else {
    isFirstScreen.value = true
    showAnimation.value = false
  }
}

const albumImages = [
  {
    url: '/album/人物/think.webp',
    description: '当时刚刚中考完特地换了张头像...'
  },
  {
    url: '/album/人物/play.webp',
    description: '第一次研学在外面住...'
  },
  {
    url: '/album/动漫/超燃.webp',
    description: '燃到起鸡皮疙瘩'
  },
  {
    url: '/album/动漫/黑色五叶草.webp',
    description: '99'
  },
  {
    url: '/album/动漫/来自深渊.webp',
    description: '为何人必须创造价值后才被重视'
  },
  {
    url: '/album/动漫/video.webp',
    description: '创造一个和平的国度吧'
  },
  {
    url: '/album/动漫/蕾姆.webp',
    description: '好久不见'
  },
]
</script>

<style scoped>
/* ========= 全局背景 & 布局 ========= */
.app-flex {
  position: relative;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
}

.app-flex::before,
.app-flex::after {
  transition: opacity 0.4s ease;
}

.app-flex > :not(.splash-screen):not(.navbar) {
  position: relative;
  z-index: 2;
}

.app-flex--scrolled::before,
.app-flex--scrolled::after {
  opacity: 0;
  pointer-events: none;
}

.wave-container {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 5;
  overflow: hidden;
  line-height: 0;
}

.waves {
  position: relative;
  width: 100%;
  height: 8vh;
  min-height: 120px;
  max-height: 150px;
}

.parallax>use {
  animation: move-forever 25s cubic-bezier(0.55, 0.5, 0.45, 0.5) infinite;
}

.parallax>use:nth-child(1) {
  animation-delay: -2s;
  animation-duration: 7s;
}

.parallax>use:nth-child(2) {
  animation-delay: -3s;
  animation-duration: 10s;
}

.parallax>use:nth-child(3) {
  animation-delay: -4s;
  animation-duration: 13s;
}

.parallax>use:nth-child(4) {
  animation-delay: -5s;
  animation-duration: 20s;
}

@keyframes move-forever {
  0% {
    transform: translate3d(-90px, 0, 0);
  }

  100% {
    transform: translate3d(85px, 0, 0);
  }
}

.fullpage-swiper {
  width: 100%;
  height: 100vh;
  height: 100dvh;
}

.fullpage-swiper .swiper-slide {
  height: 100vh;
  height: 100dvh;
}

/* 固定背景图（全屏） */
.app-flex::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  background-image: url('@/assets/木叶创立.webp');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  z-index: 0;
}

/* 固定遮罩层 */
.app-flex::after {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1;
}

.fullpage-swiper {
  position: relative;
  z-index: 2;
}

/* ========= 第一屏：Hero Section ========= */
.hero-section {
  position: relative;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: default;
}

/* ========= 第二屏：大屏饱满大气布局 ========= */
.scrollable-content {
  height: 100vh;
  height: 100dvh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  background-color: #FAF7F2;
  overflow-x: hidden; /* 防止超大落叶掠出屏幕右边界时偶然出现横向微幅抖动 */
  display: flex;
  flex-direction: column;
}

.main-body {
  flex: 1 0 auto;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  /* 上下留白收紧一档：第二屏内容总高约 971px（左列 883 + 上下留白 88），
     比改造前的约 1031px 矮 60px，常见 1080P 窗口里也能一屏放下 */
  padding: 68px 4% 20px 4%;
  padding-top: calc(68px + env(safe-area-inset-top, 0px));
  padding-bottom: calc(20px + env(safe-area-inset-bottom, 0px));
}

/* 1. 整体总宽度：从 1148px 放大到 1360px，铺满大屏视野 */
.two-columns {
  display: flex;
  justify-content: center;
  gap: 36px;
  max-width: 1360px;     /* 👈 告别小气，显著拉宽 */
  width: 100%;
  /* 高度交给内容自己决定：两列高度本来就相等（见下方相册 344px 的取值），
     多余空间留在整块外侧，绝不再塞进卡片之间的间隙里 */
  margin: auto auto;     /* 垂直居中 */
}

/* 2. 左侧列：调宽到 360px */
.left-column {
  width: 360px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 22px;
}

/* 3. 右侧列：整体撑开 */
.right-column {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* 4. 顶部相册与天气：高度拉高到 280px */
.top-row {
  display: flex;
  gap: 20px;
  align-items: stretch;
}

.album-container {
  width: 620px;          /* 👈 相册加宽到 620px */
  flex: 0 0 620px;
  max-width: 100%;
  border-radius: 18px;
  overflow: hidden;
}

.album-container :deep(.swiper),
.album-container :deep(.swiper-slide),
.album-container :deep(.image-slider),
.album-container :deep(img) {
  width: 100% !important;
  height: 100% !important;
  object-fit: cover !important;
  display: block;
}

.weather-card-comp {
  width: 320px;     
  flex: 0 0 320px;
  align-self: stretch;
}

/* 桌面端：相册去掉内部 1em 外边距，高度取 344px（620×344 ≈ 1.8:1）。
   这个高度是“配平值”：左列 346+22+333+22+160 = 883px，
   右列 344+18+430+18+72 = 882px —— 两列自然高度相等、底边天然对齐，
   所以任何一列都不需要再靠拉大间距去凑高度（移动端仍保持 16:9） */
@media (min-width: 901px) {
  .album-container :deep(.slider-wrapper) {
    margin: 0;
  }

  .album-container :deep(.slide) {
    aspect-ratio: 620 / 344;
  }
}

/* 5. 文章区域 */
.articles-section {
  width: 100%;
}

/* ========= 滚动箭头 ========= */
.arrow.bounce {
  position: absolute;
  bottom: 120px;
  left: 50%;
  margin-left: -20px;
  width: 40px;
  height: 40px;
  background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4NCjwhLS0gR2VuZXJhdG9yOiBBZG9iZSBJbGx1c3RyYXRvciAxNi4wLjAsIFNWRyBFeHBvcnQgUGx1Zy1JbiAuIFNWRyBWZXJzaW9uOiA2LjAwIEJ1aWxkIDApICAtLT4NCjwhRE9DVFlQRSBzdmcgUFVCTElDICItLy9XM0MvL0RURCBTVkcgMS4xLy9FTiIgImh0dHA6Ly93d3cudzMub3JnL0dyYXBoaWNzL1NWRy8xLjEvRFREL3N2ZzExLmR0ZCI+DQo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IiB3aWR0aD0iNTEycHgiIGhlaWdodD0iNTEycHgiIHZpZXdCb3g9IjAgMCA1MTIgNTEyIiBlbmFibGUtYmFja2dyb3VuZD0ibmV3IDAgMCA1MTIgNTEyIiB4bWw6c3BhY2U9InByZXNlcnZlIj4NCjxwYXRoIGZpbGw9IiNGRkZGRkYiIGQ9Ik0yOTMuNzUxLDQ1NS44NjhjLTIwLjE4MSwyMC4xNzktNTMuMTY1LDE5LjkxMy03My42NzMtMC41OTVsMCwwYy0yMC41MDgtMjAuNTA4LTIwLjc3My01My40OTMtMC41OTQtNzMuNjcyICBsMTg5Ljk5OS0xOTBjMjAuMTc4LTIwLjE3OCw1My4xNjQtMTkuOTEzLDczLjY3MiwwLjU5NWwwLDBjMjAuNTA4LDIwLjUwOSwyMC43NzIsNTMuNDkyLDAuNTk1LDczLjY3MUwyOTMuNzUxLDQ1NS44Njh6Ii8+DQo8cGF0aCBmaWxsPSIjRkZGRkZGIiBkPSJNMjIwLjI0OSw0NTUuODY4YzIwLjE4LDIwLjE3OSw1My4xNjQsMTkuOTEzLDczLjY3Mi0wLjU5NWwwLDBjMjAuNTA5LTIwLjUwOCwyMC43NzQtNTMuNDkzLDAuNTk2LTczLjY3MiAgbC0xOTAtMTkwYy0yMC4xNzgtMjAuMTc4LTUzLjE2NC0xOS45MTMtNzMuNjcxLDAuNTk1bDAsMGMtMjAuNTA4LDIwLjUwOS0yMC43NzIsNTMuNDkyLTAuNTk1LDczLjY3MUwyMjAuMjQ5LDQ1NS44Njh6Ii8+DQo8L3N2Zz4=);
  background-size: contain;
  background-repeat: no-repeat;
  z-index: 10;
  animation: bounce 2s infinite;
}

@keyframes bounce {

  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }

  40% {
    transform: translateY(-30px);
  }

  60% {
    transform: translateY(-15px);
  }
}


/* ========== 平板及移动端适配 ========== */
@media (max-width: 900px) {
  /* 优化：从左右并排改为上下堆叠结构 */
  .two-columns {
    flex-direction: column;
    gap: 24px;
  }

  .left-column,
  .right-column,
  .album-container,
  .weather-card-comp,
  .articles-section {
    width: 100% !important;
    max-width: 100%;
  }

  /* 关键修复：PC 端的 flex: 0 0 620px / 320px 在竖向堆叠后会变成“高度”，
     会把相册撑到 620px 高、天气撑到 320px 高，从而在相册下方、天气上方留下大片空白。
     这里必须把主轴基准改回 auto，让它们按内容（相册 16:9）各自撑开 */
  .album-container {
    flex: 0 0 auto;
    height: auto;
  }

  .weather-card-comp {
    flex: 0 0 auto;
    height: 280px;
  }

  .top-row {
    flex-direction: column;
    /* 优化：相册和天气模块在移动端上下排列 */
    gap: 20px;
    margin-bottom: 24px;
  }

  .arrow.bounce {
    bottom: calc(40px + env(safe-area-inset-bottom, 0px));
    /* 提升箭头高度，避免被底部控制栏/手势条挡住 */
  }
}

/* ========== 小屏手机极简适配 ========== */
@media (max-width: 900px) {
  .app-flex::before {
    background-image: url('@/assets/斩首大刀.webp');
  }

  .main-body {
    /* 54px 导航栏 + 安全区 + 呼吸留白 */
    padding: 70px 16px 40px 16px;
    padding-top: calc(70px + env(safe-area-inset-top, 0px));
    padding-bottom: calc(40px + env(safe-area-inset-bottom, 0px));
    scrollbar-gutter: stable;
    min-height: 100vh;
    min-height: 100dvh;
    box-sizing: border-box;
  }

  .two-columns {
    flex-direction: column;
    gap: 18px;
  }

  .left-column {
    width: 100%;
  }

  .right-column {
    width: 100%;
    min-height: 60vh;
    min-height: 60dvh;
  }
}
</style>
