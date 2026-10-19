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
                <Say class="say-card-comp"
                  :class="[showAnimation && 'animate__animated animate__fadeInLeft animate__delay-1s']"
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
  padding: 72px 4% 20px 4%;
  padding-top: calc(72px + env(safe-area-inset-top, 0px));
  padding-bottom: calc(20px + env(safe-area-inset-bottom, 0px));
}

/* 两列主布局  */
.two-columns {
  --ui-scale: 0.90;

  --max-w: calc(1440px * var(--ui-scale));
  --left-w: calc(360px * var(--ui-scale));
  --col-gap: calc(32px * var(--ui-scale));
  --top-gap: calc(20px * var(--ui-scale));
  --block-gap: calc(18px * var(--ui-scale));

  --weather-w: calc(320px * var(--ui-scale));
  --top-h: clamp(calc(300px * var(--ui-scale)), calc(35vh * var(--ui-scale)), calc(380px * var(--ui-scale)));

  --article-side: calc(320px * var(--ui-scale));
  --article-gap: calc(20px * var(--ui-scale));
  --article-row: clamp(calc(190px * var(--ui-scale)), calc(21.3vh * var(--ui-scale)), calc(232px * var(--ui-scale)));

  display: flex;
  justify-content: center;
  align-items: stretch;
  gap: var(--col-gap);
  max-width: var(--max-w);
  width: 100%;
  margin: auto;
}

.left-column {
  width: var(--left-w);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: calc(22px * var(--ui-scale));
}

.right-column {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--block-gap);
}

.top-row {
  display: flex;
  gap: var(--top-gap);
  align-items: stretch;
  height: var(--top-h);
  flex: 0 0 auto;
}

.album-container {
  flex: 1 1 auto;
  width: auto;
  min-width: 0;
  max-width: 100%;
  border-radius: 18px;
  overflow: hidden;
}

.weather-card-comp {
  width: var(--weather-w);
  flex: 0 0 var(--weather-w);
  height: 100%;
  align-self: stretch;
}

/* 相册：去掉组件自带的外边距，桌面端让轮播填满顶行高度 */
.album-container :deep(.slider-wrapper) {
  margin: 0;
  height: 100%;
  border-radius: inherit;
}

@media (min-width: 1181px) {
  .album-container :deep(.slider-viewport),
  .album-container :deep(.slider-inner) {
    height: 100%;
  }

  .album-container :deep(.slide) {
    height: 100%;
    aspect-ratio: auto;
  }

  /* 左列最后一张“随心一说”吃掉两列高度差，底边自然对齐，不额外拉大卡片间隙 */
  .say-card-comp {
    flex: 1 1 auto;
    min-height: calc(160px * var(--ui-scale));
    display: flex;
  }

  .say-card-comp :deep(.stack) {
    width: 100%;
    max-width: 100%;
    height: 100%;
    margin: 0;
    display: flex;
  }

  .say-card-comp :deep(.stack .card) {
    flex: 1;
    height: auto;
    min-height: calc(160px * var(--ui-scale));
  }
}

/* 文章区域 */
.articles-section {
  width: 100%;
}

/* 滚动箭头 */
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


/* ========== 平板 / 竖屏：两列改为单列 ========== */
@media (max-width: 1180px) {
  .two-columns {
    flex-direction: column;
    gap: 20px;
  }

  .left-column,
  .right-column,
  .articles-section {
    width: 100%;
    min-width: 0;
  }

  .left-column {
    max-width: 440px;
    margin: 0 auto;
  }

  .right-column {
    max-width: 900px;
    margin: 0 auto;
  }

  .two-columns {
    --article-side: 290px;
    --article-gap: 16px;
    --article-row: 190px;
  }

  /* 顶行不再写死高度，让相册按 16:9 自然撑开 */
  .top-row {
    height: auto;
  }

  .album-container {
    flex: 1 1 auto;
    width: auto;
    min-width: 0;
  }

  .weather-card-comp {
    flex: 0 0 280px;
    width: 280px;
    height: 280px;
    align-self: auto;
  }

  /* 平板宽度下“随心一说”不要拉成一整条 */
  .say-card-comp :deep(.stack) {
    max-width: 520px;
    margin: 0 auto;
  }
}

/* ========== 手机：上下堆叠 ========== */
@media (max-width: 900px) {
  .app-flex::before {
    background-image: url('@/assets/斩首大刀.webp');
  }

  .main-body {
    /* 54px 导航栏 + 安全区 + 呼吸留白 */
    padding: 70px 16px 40px 16px;
    padding-top: calc(70px + env(safe-area-inset-top, 0px));
    padding-bottom: calc(40px + env(safe-area-inset-bottom, 0px));
    min-height: 100vh;
    min-height: 100dvh;
    box-sizing: border-box;
  }

  .two-columns {
    gap: 18px;
  }

  .left-column {
    gap: 18px;
  }

  .top-row {
    flex-direction: column;
    gap: 20px;
  }

  .album-container,
  .weather-card-comp {
    flex: 0 0 auto;
    width: 100%;
    max-width: 100%;
  }

  .album-container {
    height: auto;
  }

  .weather-card-comp {
    height: 280px;
  }

  .say-card-comp :deep(.stack) {
    max-width: 100%;
  }

  .arrow.bounce {
    bottom: calc(40px + env(safe-area-inset-bottom, 0px));
    /* 提升箭头高度，避免被底部控制栏/手势条挡住 */
  }
}

/* ========== 矮桌面：收紧一档，避免必须滚动才能看完第二屏 ========== */
@media (min-width: 1181px) and (max-height: 920px) {
  .main-body {
    padding-top: calc(66px + env(safe-area-inset-top, 0px));
    padding-bottom: calc(8px + env(safe-area-inset-bottom, 0px));
  }

  /* 宽度继续沿用 --ui-scale，只把高度微调到刚好占满矮屏。
     这样 1440×900 和 1704×986 下卡片宽度、间距、文章高度基本一致，
     不会因为窗口高度跨过 920px 就突然“变大”。 */
  .two-columns {
    --col-gap: calc(32px * var(--ui-scale));
    --block-gap: calc(18px * var(--ui-scale));
    --top-h: 310px;
    --article-side: calc(320px * var(--ui-scale));
    --article-gap: calc(20px * var(--ui-scale));
    --article-row: 195px;
  }

  .left-column {
    gap: calc(22px * var(--ui-scale));
  }
}
</style>
