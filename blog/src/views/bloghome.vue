<template>
  <div class="app-flex">
    <!-- 第一屏：大标题 + 背景图 -->
    <div class="hero-section">

      <TextEffect />
<div class="arrow bounce">
</div>
      <div class="wave-container"> <svg class="waves" xmlns="http://www.w3.org/2000/svg"
          xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 24 150 28" preserveAspectRatio="none"
          shape-rendering="auto">
          <defs>
            <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s 58 18 88 18 58-18 88-18 58 18 88 18 v44h-352z" />
          </defs>
<g class="parallax">
  <use xlink:href="#gentle-wave" x="48" y="0" fill="rgba(255,252,250,0.9)" />
  <use xlink:href="#gentle-wave" x="48" y="3" fill="rgba(255,248,245,0.7)" />
  <use xlink:href="#gentle-wave" x="48" y="5" fill="rgba(255,242,240,0.5)" />
  <use xlink:href="#gentle-wave" x="48" y="7" fill="#fdf0f0" />
</g>
        </svg></div>
    </div>

    <!-- 第二屏：白色内容区 -->
    <div class="main-body" ref="mainBody">
      <!-- 改用双栏网格布局，替代绝对定位 -->
      <div class="two-columns">
        <!-- 左侧：卡片列（information + player） -->
        <aside class="left-column">
          <Information class="info-card" />
          <player class="sticky-card" />
        </aside>

    <div class="right-column">
    <div class="top-row">
      <div class="album-container">
        <ImageSlider :images="albumImages" />
      </div>
       <WeatherCard address="武汉" class="weather-card-comp" />
    </div>
    <div class="articles-section">
      <ArticleShow :articles="paginatedArticles" />
        <div class="pagination" v-if="totalPages > 1">
    <button :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">
      上一页
    </button>
    <span
      v-for="page in totalPages"
      :key="page"
      :class="{ active: page === currentPage }"
      @click="goToPage(page)"
    >
      {{ page }}
    </span>
    <button :disabled="currentPage >= totalPages" @click="goToPage(currentPage + 1)">
      下一页
    </button>
  </div>
    </div>
  </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Information from '@/modules/bloghome/components/information.vue';
import player from '@/modules/bloghome/components/music.vue'
import TextEffect from '@/modules/bloghome/components/text.vue'
import { ref, onMounted, onUnmounted,computed } from 'vue'
import ImageSlider from '@/modules/bloghome/components/image.vue'
import ArticleShow from '@/modules/bloghome/components/article_show.vue'
import WeatherCard from '@/modules/bloghome/components/weatherCard.vue'
import { articles as articleData } from '@/date/articles'


import img1 from '@/assets/home.webp'
import img2 from '@/assets/think.webp'
import img3 from '@/assets/play.webp'
import img4 from '@/assets/myself.webp'
import img5 from '@/assets/myself2.webp'
import img6 from '@/assets/party.webp'
import img7 from '@/assets/classmates.webp'
import img8 from '@/assets/school.webp'
const cardsWrapper = ref<HTMLElement | null>(null)
const mainBody = ref<HTMLElement | null>(null)
const articles = ref(articleData)
const handleScroll = () => {
  if (!mainBody.value) return
  const rect = mainBody.value.getBoundingClientRect()
  if (rect.top < window.innerHeight) {
    mainBody.value.classList.add('visible')
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
  handleScroll()
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
const currentPage = ref(1)
const pageSize = ref(6) // 每页 6 篇

const totalPages = computed(() => Math.ceil(articles.value.length / pageSize.value))

const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return articles.value.slice(start, start + pageSize.value)
})

function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const albumImages = [
  {
    url: img2, description: `当时刚刚中考完特地换了张头像,之后就再也没换过
   挑了好久因为当时觉得头像是一件很重要的事情
   最后冥冥之中选了这张的特写` },
  {
    url: img3, description: `第一次研学在外面住，一直爽玩到一两点
    第二天全睡死过去了`},
  {
    url: img7, description: `一排我高中的同学，几乎全做过同桌，都是好人啊
    可惜似乎以后不会再有交集了`},
  { url: img4, description: `给朋友拍的照片` },
]
</script>

<style>
/* ========= 全局背景 & 布局 ========= */
.app-flex {
  position: relative;
  width: 100%;
  min-height: 100vh;
  background-color: #000;
}

.hero-section {
  position: relative;
  /* 让波浪相对它定位 */
  width: 100%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: default;
  scroll-snap-align: start;
}

/* 固定背景图（全屏） */
.app-flex::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
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
  background: rgba(0, 0, 0, 0.45);
  z-index: 1;
}

/* 确保所有子元素在遮罩上面 */
.app-flex>* {
  position: relative;
  z-index: 2;
}

.main-body {
  display: block;
  padding: 80px 5% 60px 270px;
  background: #fdf0f0;
  scroll-snap-align: start;
}

.two-columns {
  display: flex;
  gap: 40px;
  max-width: 1400px;
  margin: 0 auto;
}

/* 右侧栏：自适应，内部相册 + 文章列表 */
.right-column {
  flex: 1;
  min-width: 0; /* 防止溢出 */
}
.top-row {
  display: flex;
  gap: 16px;             
  align-items: stretch;
  margin-bottom: 48px;
}
.weather-card-comp {
  width: 280px;           /* 设置固定宽度，例如 280px */
  flex: 0 0 auto;  
  align-self: stretch; 
}
/* 确保文章列表宽度与 top-row 一致 */
.articles-section {
  width: 100%;
}

/* 修复相册宽度 */
.album-container {
  width: 500px;
  max-width: 100%;
  flex-shrink: 0;
}

/* 左侧粘性效果 */
.left-column {
  width: 320px;
  flex-shrink: 0;
  display: flex;          
  flex-direction: column;  
  gap: 20px;            
}

/* ========= 波浪样式 ========= */
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
  height: 15vh;
  min-height: 100px;
  max-height: 150px;
}

.parallax>use {
  animation: move-forever 25s cubic-bezier(.55, .5, .45, .5) infinite;
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
 /* ========= 滚动箭头 ========= */
.arrow.bounce {
  position: absolute;
  bottom: 90px;         /* 放在波浪上方 */
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
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-30px);
  }
  60% {
    transform: translateY(-15px);
  }
}
/* ========== 移动端适配 ========== */
@media (max-width: 900px) {
  .main-body {
    padding: 40px 5% 40px 5%;   /* 去掉左边大间距，四周均匀留白 */
  }

  .two-columns {
    flex-direction: column;
    gap: 24px;
  }

  .left-column {
    width: 100%;                 /* 全宽 */
    flex-direction: column;      /* 堆叠 Information 和 Player */
  }

  .right-column {
    width: 100%;
  }

  .top-row {
    flex-direction: column;      /* 相册和天气上下排列 */
    gap: 16px;
  }

  .album-container {
    width: 100%;
  }

  .weather-card-comp {
    width: 100%;
    max-width: 100%;
  }

  .articles-section {
    width: 100%;
  }

  /* 文章网格已在全局改为 1 列，这里可微调 */
  .articles-grid {
    grid-template-columns: 1fr;
    grid-auto-rows: auto;
    gap: 16px;
  }

  /* 卡片在移动端强制垂直布局 */
  .card {
    grid-row: auto !important;
    grid-column: auto !important;
    flex-direction: column !important;
  }
  .card .card__img {
    width: 100% !important;
    height: auto !important;
    aspect-ratio: 16 / 9;
  }
  .card .card__content {
    width: 100% !important;
    padding: 12px;
  }

  /* 调整字体，防止过大 */
  .hero-section {
    height: 100vh; /* 保持全屏 */
  }
  .arrow.bounce {
    bottom: 70px;
  }
}

/* 更小屏幕（如手机竖屏）微调 */
@media (max-width: 480px) {
  .main-body {
    padding: 20px 4% 40px 4%;
  }

  .article-title {
    font-size: 1.8em;
  }

  .back-btn {
    top: 10px;
    left: 10px;
    padding: 8px 16px;
    font-size: 13px;
  }
}
</style>