<template>
  <div class="app-flex">
    <Navbar :transparent="isFirstScreen"/>
    <swiper
      :modules="modules"
      :direction="'vertical'"
      :slidesPerView="1"
      :speed="600"
      :mousewheel="{ forceToAxis: true, releaseOnEdges: true }"
      @swiper="onSwiperInit"
      @slideChange="onSlideChange"
      class="fullpage-swiper"
      :noSwipingClass="'scrollable-content'"
    >
      <!-- 第一屏 -->
      <swiper-slide class="slide-hero">
        <div class="hero-section">
          <TextEffect />
          <div class="arrow bounce"></div>
          <div class="wave-container">
            <!-- 假设这里是你原来的波浪 SVG -->
          </div>
        </div>
      </swiper-slide>

      <!-- 第二屏 -->
      <swiper-slide class="slide-main">
        <div class="scrollable-content">
          <div class="main-body" ref="mainBody">
            <div class="two-columns">
              <!-- 左侧：卡片列（information + player） -->
              <aside class="left-column">
                <Information class="info-card" />
                <player class="sticky-card" />
              </aside>

              <!-- 右侧：相册、天气、文章列表 -->
              <div class="right-column">
                <div class="top-row">
                  <div class="album-container">
                    <ImageSlider :images="albumImages" />
                  </div>
                  <WeatherCard address="武汉" class="weather-card-comp" />
                </div>
                <div class="articles-section">
                  <ArticleShow :articles="paginatedArticles" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </swiper-slide>
    </swiper>
  </div>
</template>

<script setup lang="ts">
import Information from '@/modules/bloghome/components/information.vue';
import player from '@/modules/bloghome/components/music.vue'
import TextEffect from '@/modules/bloghome/components/text.vue'
import Navbar from '@/modules/bloghome/components/load.vue'
import { ref, onMounted, computed } from 'vue'
import ImageSlider from '@/modules/bloghome/components/image.vue'
import ArticleShow from '@/modules/bloghome/components/article_show.vue'
import WeatherCard from '@/modules/bloghome/components/weatherCard.vue'
import { articles as articleData } from '@/date/articles'
import { useLibraryStore } from '@/stores/libraryStore'
import { useAudioStore } from '@/stores/audioStore'

import { Swiper, SwiperSlide } from 'swiper/vue'
import { Mousewheel, Pagination } from 'swiper/modules'

import 'swiper/css'
import 'swiper/css/mousewheel'
import 'swiper/css/pagination'

import img1 from '@/assets/home.webp'
import img2 from '@/assets/think.webp'
import img3 from '@/assets/play.webp'
import img4 from '@/assets/myself.webp'
import img5 from '@/assets/myself2.webp'
import img6 from '@/assets/party.webp'
import img7 from '@/assets/classmates.webp'
import img8 from '@/assets/school.webp'

const mainBody = ref<HTMLElement | null>(null)
const libraryStore = useLibraryStore()
const audioStore = useAudioStore()
const modules = [Mousewheel, Pagination]
const articles = ref(articleData)
const isFirstScreen = ref(true)
const swiperInstance = ref<any>(null)
let touchStartY = 0
let isSliding = false

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
    mainBody.value?.classList.add('visible')
    isFirstScreen.value = false 
  } else {
    mainBody.value?.classList.remove('visible')
    isFirstScreen.value = true  
  }
}

onMounted(async () => {
  await libraryStore.loadDate()
  audioStore.restoreFromLocalStorage()
  if (audioStore.curIdx === -1 && libraryStore.filteredList.length > 0) {
    const targetIdx = libraryStore.filteredList[0]?._globalIdx || 0
    await audioStore.loadSongByIndex(targetIdx)
  } 
  else if (audioStore.curIdx !== -1 && !audioStore.currentAudioUrl) {
    await audioStore.loadSongByIndex(audioStore.curIdx)
  }
  else if (audioStore.curIdx !== -1 && audioStore.currentAudioUrl) {
    audioStore.syncToElement()
  }
})

const paginatedArticles = computed(() => {
  return articles.value.slice(0, 3) 
})

const albumImages = [
  { url: img2, description: `当时刚刚中考完特地换了张头像,之后就再也没换过 挑了好久因为当时觉得头像是一件很重要的事情 最后冥冥之中选了这张的特写` },
  { url: img3, description: `第一次研学在外面住，一直爽玩到一两点 第二天全睡死过去了`},
  { url: img7, description: `一排我高中的同学，几乎全做过同桌，都是好人啊 可惜似乎以后不会再有交集了`},
  { url: img4, description: `给朋友拍的照片` },
]
</script>

<style scoped>
/* ========= 全局背景 & 布局 ========= */
.app-flex {
  position: relative;
  width: 100%;
  /* 优化：移动端使用 dvh 防止底部工具栏遮挡 */
  height: 100vh; 
  height: 100dvh; 
  overflow: hidden;
  background-color: #000;
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

/* 确保所有子元素在遮罩上面 */
.app-flex > * {
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

/* ========= 第二屏：可滚动内容 ========= */
.scrollable-content {
  height: 100vh;
  height: 100dvh;
  overflow-y: auto;
  /* 强化移动端触控顺滑度 */
  -webkit-overflow-scrolling: touch; 
  overscroll-behavior: contain; /* 防止滚动链穿透到外层 */

  /* 毛玻璃效果 */
  background: rgba(255, 255, 255, 0.08);     
  backdrop-filter: blur(20px) saturate(180%); 
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.15); 
  box-shadow: 0 0 30px rgba(0, 0, 0, 0.1);  
}

.main-body {
  display: block;
  /* PC端默认间距：上80px，右5%，下60px，左270px (避开左侧导航) */
  padding: 80px 5% 60px 270px;
  box-sizing: border-box;
}

.two-columns {
  display: flex;
  gap: 40px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 左侧粘性栏 */
.left-column {
  width: 320px;
  flex-shrink: 0;
  display: flex;          
  flex-direction: column;  
  gap: 20px;            
}

/* 右侧内容区 */
.right-column {
  flex: 1;
  min-width: 0; 
}

.top-row {
  display: flex;
  gap: 16px;             
  align-items: stretch;
  margin-bottom: 48px;
}

.album-container {
  width: 500px;
  max-width: 100%;
  flex-shrink: 0;
}

.weather-card-comp {
  width: 280px;           
  flex: 0 0 auto;  
  align-self: stretch; 
}

.articles-section {
  width: 100%;
}


/* ========= 滚动箭头 ========= */
.arrow.bounce {
  position: absolute;
  bottom: 20px;         
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
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-30px); }
  60% { transform: translateY(-15px); }
}


/* ========== 平板及移动端适配 ========== */
@media (max-width: 900px) {
  .main-body {
    /* 优化：取消 PC 端 270px 的左边距，使内容居中显示 */
    padding: 80px 5% 40px 5%;   
  }

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

  .top-row {
    flex-direction: column; /* 优化：相册和天气模块在移动端上下排列 */
    gap: 20px;
    margin-bottom: 24px;
  }

  .arrow.bounce {
    bottom: 40px; /* 提升箭头高度，避免被底部控制栏挡住 */
  }
}

/* ========== 小屏手机极简适配 ========== */
@media (max-width: 480px) {
  .main-body {
    /* 进一步压缩左右边距，给内容留出更多空间 */
    padding: 60px 4% 30px 4%;
  }

  .two-columns {
    gap: 16px;
  }
  
  .top-row {
    gap: 16px;
  }
  
  /* 确保文章在极窄屏幕上不会越界 */
  .articles-section {
    overflow-x: hidden;
  }
}
</style>
