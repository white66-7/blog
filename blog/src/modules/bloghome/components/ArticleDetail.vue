<template>
  <!-- 引入自定义导航栏，非透明模式 -->
  <Navbar :transparent="false" />
  <button class="back-btn" @click="$router.back()">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
      stroke-linecap="round" stroke-linejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
    返回
  </button>
  <div class="article-page" v-if="article">
    <main>
      <div class="content" ref="contentRef">
        <!-- 全幅封面图（出血至屏幕边缘） -->
        <div class="hero-image">
          <img :src="article.cover" alt="cover" />
        </div>

        <h1 class="article-title">{{ article.title }}</h1>
        <div class="meta">
          <span>{{ article.date }}</span>
        </div>

        <!-- 标签放在标题下方左侧 -->
        <div class="tags" v-if="article.tags.length">
          <span class="tag" v-for="tag in article.tags" :key="tag">{{ tag }}</span>
        </div>

        <!-- 正文 -->
        <div class="markdown-body" v-html="renderedContent"></div>
      </div>
      <aside class="toc" v-if="headings.length">
        <div class="toc__header">
          <!-- 你提供的 SVG 图标 -->
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 80 80">
            <path d="M0 0h80v80H0z" fill="none" />
            <g fill="none" fill-rule="evenodd" clip-rule="evenodd">
              <path fill="#219653"
                d="M48.56 20.477A19.402 19.402 0 0 1 74.97 34.4h-9.6l-4.4-4.4l-4.402 4.401H44.775A66 66 0 0 0 42.279 26h-1.215a19.4 19.4 0 0 1 7.496-5.523" />
              <path fill="#f2994a" d="M35.622 34.66A65.54 65.54 0 0 1 29 68h14.618a66.18 66.18 0 0 0-.812-40.525z" />
              <path fill="#219653"
                d="M31.41 13.477A19.402 19.402 0 0 0 5 27.4h9.599L19 23l3.738 3.738a19.41 19.41 0 0 1 17.03-1.068a19.4 19.4 0 0 1 3.17 1.672l-.059.06h.09a19.4 19.4 0 0 0-11.56-13.925" />
              <path fill="#219653"
                d="M14.419 36.17a19.4 19.4 0 0 1 28.52-8.828L29.102 41.179h-6.224v6.224L16.09 54.19a19.4 19.4 0 0 1-1.672-18.02" />
            </g>
          </svg>
          <span class="toc__title">目录</span>
        </div>
        <a v-for="(h, i) in headings" :key="i" class="toc__item" :class="{ 'toc__item--active': activeHeading === i }"
          :style="{ paddingLeft: h.level === 2 ? '24px' : '12px' }" @click.prevent="scrollToHeading(i)">
          {{ h.text }}
        </a>
      </aside>
    </main>
  </div>

  <div class="not-found" v-else>
    <p>文章未找到</p>
  </div>
</template>


<!-- 第二部分：替换你原来的 script setup -->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, onBeforeRouteLeave } from 'vue-router'
import MarkdownIt from 'markdown-it'
import { articles } from '@/date/articles'
import type { Article } from '@/date/articles'
import Navbar from '@/modules/bloghome/components/load.vue'
import { articleScrollCache } from '@/router/index'

const md = new MarkdownIt({ html: true })
const route = useRoute()
const article = ref<Article | null>(null)
const renderedContent = computed(() => (article.value ? md.render(article.value.content) : ''))

const contentRef = ref<HTMLElement | null>(null)
const headings = ref<{ text: string; level: number; el: HTMLElement }[]>([])
const activeHeading = ref(-1)

function buildHeadings() {
  if (!contentRef.value) return
  const els = contentRef.value.querySelectorAll('.markdown-body h1, .markdown-body h2')
  headings.value = Array.from(els).map(el => ({
    text: (el as HTMLElement).textContent || '',
    level: el.tagName === 'H1' ? 1 : 2,
    el: el as HTMLElement
  }))
}

function scrollToHeading(index: number) {
  const h = headings.value[index]
  if (!h) return
  const top = h.el.getBoundingClientRect().top + window.scrollY - 80
  window.scrollTo({ top, behavior: 'smooth' })
}

function handleScroll() {
  if (headings.value.length === 0) return
  const midline = window.innerHeight / 2
  let active = -1
  headings.value.forEach((h, i) => {
    const rect = h.el.getBoundingClientRect()
    if (rect.top <= midline) active = i
  })
  activeHeading.value = active
}

let cleanupScroll: () => void

onBeforeRouteLeave((to, from, next) => {
  const currentId = Number(route.params.id)
  articleScrollCache.set(currentId, window.scrollY || document.documentElement.scrollTop)
  next()
})

onMounted(async () => {
  const id = Number(route.params.id)
  article.value = articles.find(a => a.id === id) || null

  await nextTick()
  buildHeadings()
  handleScroll()

  const savedHeight = articleScrollCache.get(id) || 0

  const throttledScroll = () => requestAnimationFrame(handleScroll)
  window.addEventListener('scroll', throttledScroll, { passive: true })
  cleanupScroll = () => {
    window.removeEventListener('scroll', throttledScroll)
  }
})

onUnmounted(() => {
  cleanupScroll?.()
})
</script>

<style>
/* 引入字体 */
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,700;1,300&display=swap');

/* 正文内图片居中、圆角 */
.markdown-body img {
  display: block;
  margin: 1.5em auto;
  max-width: 100%;
  border-radius: 8px;
}

/* 覆盖导航栏背景，使其与文章详情页的新拟态风格一致 */
.navbar {
  background: #e0e0e0 !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  border-bottom: none !important;
  box-shadow: none !important;
}
</style>

<style scoped>
.article-page {
  min-height: 100vh;
  background: #e0e0e0;
  position: relative;
  z-index: 10;
  font-family: 'Open Sans', 'Microsoft YaHei', 'PingFang SC', sans-serif;
  font-weight: 400;
  padding-top: 1px;
  /* 避免外边距合并，确保顶部背景色完整 */
}

main {
  display: flex;
  position: relative;
}

.content {
  margin: 0 auto 0;
  padding: 0 60px 80px;
  max-width: 1000px;
  width: 100%;
  background: #e0e0e0;
  min-height: calc(100vh - 140px);
  border-radius: 0 0 30px 30px;
  box-shadow: 15px 15px 30px #bebebe, -15px -15px 30px #ffffff;
  overflow: visible;
}

/* ---------- 全幅封面图 ---------- */
.hero-image {
  position: relative;
  left: 50%;
  margin-left: -50vw;
  width: 100vw;
  max-height: 350px;
  overflow: hidden;
  margin-bottom: 2em;
  border-radius: 0;
}

.hero-image img {
  width: 100%;
  height: auto;
  max-height: 350px;
  object-fit: cover;
  display: block;
}

.article-title {
  font-family: 'Open Sans', sans-serif;
  font-size: clamp(2rem, 4vw + 1rem, 6rem);
  font-weight: 700;
  text-align: center;
  margin: 0.5em 0 0.2em;
  color: #1a1a1a;
  line-height: 1.2;
  position: relative;
  z-index: 1;
}

.meta {
  color: #888;
  font-size: 14px;
  margin-bottom: 1em;
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* ---------- 标签移到标题下方左侧 ---------- */
.tags {
  margin: 0 0 2em 0;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-start;
  position: relative;
  z-index: 1;
}

.tag {
  background: #e0e0e0;
  color: #000;
  padding: 4px 14px;
  border-radius: 45px;
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  box-shadow: 4px 4px 8px #bebebe, -4px -4px 8px #ffffff;
  transition: all 0.3s ease;
  cursor: default;
}

.tag:hover {
  background-color: #23c483;
  color: #fff;
  box-shadow: 0px 15px 20px rgba(46, 229, 157, 0.4);
  transform: translateY(-7px);
}

.tag:active {
  box-shadow: inset 2px 2px 4px #bebebe, inset -2px -2px 4px #ffffff;
}

.markdown-body {
  font-family: 'Open Sans', sans-serif;
  line-height: 1.8;
  font-size: clamp(1rem, 2.5vw, 1.3rem);
  color: #000;
  max-width: 90ch;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.markdown-body :deep(h1) {
  font-family: 'Open Sans', sans-serif;
  font-weight: 700;
  font-size: clamp(1.8rem, 3vw + 1rem, 4rem);
  text-align: center;
  margin: 1.5em 0 0.5em;
  line-height: 1.3;
}

.markdown-body :deep(h2) {
  font-family: 'Open Sans', sans-serif;
  font-weight: 700;
  font-size: clamp(1.5rem, 2.5vw + 1rem, 3rem);
  margin: 0.6em 0 0.5em;
  line-height: 1.3;
}

.markdown-body :deep(p) {
  margin-bottom: 1.25rem;
}

.markdown-body :deep(pre) {
  background: #282c34;
  color: #abb2bf;
  padding: 20px;
  border-radius: 14px;
  overflow-x: auto;
  box-shadow: inset 4px 4px 8px #1a1e24, inset -4px -4px 8px #363c46;
}

.markdown-body :deep(blockquote) {
  border-left: 4px solid #bebebe;
  padding-left: 16px;
  color: #666;
  margin: 1.5em 0;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 0 12px 12px 0;
  padding: 12px 16px;
}

/* ---------- 左侧目录导航 ---------- */
.toc {
  position: fixed;
  right: 32px;
  top: 50%;
  transform: translateY(-50%);
  width: 260px;
  max-height: 75vh;
  overflow-y: auto;
  background: #e0e0e0;
  border-radius: 24px;
  padding: 24px 18px;
  box-shadow: 10px 10px 20px #bebebe, -10px -10px 20px #ffffff;
  z-index: 15;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

/* 目录头部 */
.toc__header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  padding: 0 4px;
}

.toc__header svg {
  flex-shrink: 0;
}

.toc__title {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

/* 目录项（新拟态凸起，无额外边框） */
.toc__item {
  position: relative;
  display: block;
  font-size: 14px;
  color: #212121;
  text-decoration: none;
  padding: 12px 20px;
  border-radius: 15px;
  background: #e0e0e0;
  font-weight: 500;
  overflow: hidden;
  z-index: 1;
  transition: color 0.25s ease;
  white-space: nowrap;
  text-overflow: ellipsis;
  transform: scale(1);
  transform-origin: center;
  /* 从中心点开始放大 */
  transition: all 0.3s ease-in-out;
  /* 让放大、变色、阴影都带上丝滑过渡 */
}

/* 绿色填充滑入效果 */
.toc__item::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 0;
  border-radius: 15px;
  background-color: #23c483;
  z-index: -1;
  transition: width 0.3s ease;
}

.toc__item:hover {
  color: #ffffff;
  transform: scale(1.10);
}

.toc__item:hover::before {
  width: 100%;
}

.toc__item--active {
  color: #e05a5a;
  font-weight: 700;
}

.not-found {
  text-align: center;
  margin-top: 200px;
  color: #999;
}
/* ---------- Markdown 超链接样式 (现代动画款) ---------- */
.markdown-body :deep(a) {
  color: #23c483; /* 使用你的标签悬浮主题绿 */
  text-decoration: none; /* 去掉默认丑陋的下划线 */
  font-weight: 600; /* 稍微加粗，使其在正文中更显眼 */
  position: relative;
  padding: 0 2px;
  transition: color 0.3s ease;
}

/* 自定义底部下划线 */
.markdown-body :deep(a)::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 2px; /* 下划线粗细 */
  bottom: -2px; /* 距离文字底部的距离 */
  left: 0;
  background-color: #23c483;
  transform: scaleX(0); /* 默认隐藏 */
  transform-origin: bottom right; 
  transition: transform 0.3s ease-out;
  border-radius: 2px;
}

/* 鼠标悬浮时的效果 */
.markdown-body :deep(a):hover {
  color: #1a9f68; /* 悬浮时文字颜色稍微加深 */
}

/* 悬浮时下划线从左向右展开 */
.markdown-body :deep(a):hover::after {
  transform: scaleX(1);
  transform-origin: bottom left;
}
.back-btn {
  position: fixed;
  top: 80px;
  left: 32px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: #e0e0e0;
  color: #1a1a1a;
  border: none;
  padding: 10px 20px;
  border-radius: 45px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  z-index: 20;
  box-shadow: 6px 6px 12px #bebebe, -6px -6px 12px #ffffff;
  transition: all 0.3s ease;
}

.back-btn:hover {
  box-shadow: inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff;
  color: #e05a5a;
}

.back-btn:active {
  transform: scale(0.96);
}

@media (max-width: 1200px) {
  .toc {
    display: none;
  }
}

@media (max-width: 768px) {
  .content {
    margin: 20px 12px;
    padding: 0 20px 60px;
    border-radius: 20px;
  }

  .hero-image {
    max-height: 200px;
    border-radius: 0;
  }

  .back-btn {
    top: 24px;
    left: 12px;
    padding: 8px 16px;
    font-size: 13px;
  }

  .hero-image img {
    max-height: 200px;
  }
}
</style>