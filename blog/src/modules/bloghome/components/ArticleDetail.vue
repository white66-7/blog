<template>
  <div class="article-page" v-if="article">
    <button class="back-btn" @click="$router.back()">← 返回</button>

    <main>
      <aside class="timeline" ref="timelineRef">
        <div class="line-bg"></div>
        <div class="line-progress" ref="progressRef"></div>
      </aside>

      <article class="content" ref="contentRef">
        <!-- 全幅封面图（出血至屏幕边缘） -->
        <div class="hero-image">
          <img src="/covers/upper.webp" alt="封面图" />
        </div>

        <h1 class="article-title">{{ article.title }}</h1>
        <div class="meta">
          <span>{{ article.date }}</span>
        </div>

        <div class="markdown-body" v-html="renderedContent"></div>
        <div class="tags">
          <span v-for="tag in article.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </article>
    </main>
  </div>
  <div v-else class="not-found">文章未找到</div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import MarkdownIt from 'markdown-it'
import { articles } from '@/date/articles'
import type { Article } from '@/date/articles'

const md = new MarkdownIt({ html: true })
const route = useRoute()
const article = ref<Article | null>(null)
const renderedContent = computed(() => article.value ? md.render(article.value.content) : '')

const timelineRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)
const progressRef = ref<HTMLElement | null>(null)

let dots: HTMLElement[] = []
let cleanupScroll: () => void

function createDots() {
  if (!contentRef.value || !timelineRef.value) return
  const headings = contentRef.value.querySelectorAll('.markdown-body h1, .markdown-body h2')
  dots.forEach(d => d.remove())
  dots = []

  headings.forEach((heading) => {
    const dot = document.createElement('div')
    dot.className = 'dot'
    dot.dataset.targetIndex = String(dots.length)
    timelineRef.value!.appendChild(dot)
    dots.push(dot)
  })
  updateDotPositions()
}

function updateDotPositions() {
  if (!contentRef.value) return
  const headings = Array.from(contentRef.value.querySelectorAll('.markdown-body h1, .markdown-body h2'))
  dots.forEach((dot, i) => {
    const heading = headings[i]
    if (heading) {
      const rect = heading.getBoundingClientRect()
      const top = rect.top + window.scrollY
      dot.style.top = `${top}px`
    }
  })
}

function handleScroll() {
  if (!contentRef.value || !progressRef.value) return
  const headings = contentRef.value.querySelectorAll('.markdown-body h1, .markdown-body h2')
  const viewportHeight = window.innerHeight
  const midline = viewportHeight / 2
  let activeIndex = -1

  headings.forEach((heading, index) => {
    const rect = heading.getBoundingClientRect()
    if (rect.top <= midline) {
      activeIndex = index
    }
  })

  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === activeIndex)
  })

  const contentEl = contentRef.value!
  const articleTop = contentEl.getBoundingClientRect().top + window.scrollY
  const articleHeight = contentEl.offsetHeight
  const scrollY = window.scrollY
  let progress = (scrollY - articleTop + 200) / (articleHeight - viewportHeight)
  progress = Math.max(0, Math.min(1, progress))
  progressRef.value.style.height = `${progress * 100}%`
}

function handleResize() {
  updateDotPositions()
  handleScroll()
}

onMounted(async () => {
  const id = Number(route.params.id)
  article.value = articles.find(a => a.id === id) || null

  await nextTick()
  createDots()
  handleScroll()

  const throttledScroll = () => requestAnimationFrame(handleScroll)
  window.addEventListener('scroll', throttledScroll, { passive: true })
  window.addEventListener('resize', handleResize)

  cleanupScroll = () => {
    window.removeEventListener('scroll', throttledScroll)
    window.removeEventListener('resize', handleResize)
  }
})

onUnmounted(() => {
  cleanupScroll?.()
})
</script>

<style>
/* 非 scoped 样式：dot 和正文图片居中 */
.timeline .dot {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 15px;
  height: 15px;
  border: 4px solid #ccc;
  border-radius: 50%;
  background: #fff;
  z-index: 10;
  transition: border-color 0.3s, transform 0.3s;
}

.timeline .dot.active {
  border-color: #2c3e50;
  animation: pulse 0.25s ease;
}

@keyframes pulse {
  0% { transform: translateX(-50%) scale(1); }
  50% { transform: translateX(-50%) scale(1.5); }
  100% { transform: translateX(-50%) scale(1); }
}

/* 正文内图片居中、圆角 */
.markdown-body img {
  display: block;
  margin: 1.5em auto;
  max-width: 100%;
  border-radius: 8px;
}
</style>

<style scoped>
/* 引入 Open Sans 字体（如不需要可移除） */
@import url('https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,700;1,300&display=swap');

.article-page {
  min-height: 100vh;
  background: #fef9e7;          /* 米黄色背景 */
  position: relative;
  z-index: 10;
  font-family: 'Open Sans', 'Microsoft YaHei', 'PingFang SC', sans-serif;
  font-weight: 400;              /* 全局正常粗细，标题单独加粗 */
}

.back-btn {
  position: fixed;
  top: 20px;
  left: 20px;
  background: white;
  border: none;
  padding: 10px 20px;
  border-radius: 45px;
  box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  z-index: 20;
  font-size: 14px;
  font-weight: 500;
  color: #000;
  transition: all 0.3s ease 0s;
  outline: none;
}

.back-btn:hover {
  background-color: #23c483;
  box-shadow: 0px 15px 20px rgba(46, 229, 157, 0.4);
  color: #fff;
  transform: translateY(-7px);
}

.back-btn:active {
  transform: translateY(-1px);
}

main {
  display: block;
  position: relative;
}

.timeline {
  position: fixed;
  left: 70px;
  top: 0;
  width: 30px;
  height: 100vh;
  z-index: 5;
}

.line-bg {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 100vh;
  background: #ccc;
  top: 0;
}

.line-progress {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 4px;
  height: 0%;
  background: #2c3e50;
  top: 0;
  transition: height 0.1s linear;
}

.content {
  margin: 0 auto;
  padding: 0 60px 80px;        /* 顶部 padding 为 0，让封面图贴顶 */
  max-width: 1200px;
  width: 100%;
  background: #fef9e7;          /* 卡片区域也米黄色 */
  min-height: 100vh;
  box-shadow: -5px 0 20px rgba(0,0,0,0.02);
}

/* ---------- 全幅封面图 ---------- */
.hero-image {
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
  width: 100vw;
  max-height: 350px;
  overflow: hidden;
  margin-bottom: 2.5em;
}

.hero-image img {
  width: 100%;
  height: auto;          /* 保持比例 */
  max-height: 350px;      /* 最高不超过 350px */
  object-fit: cover;
  display: block;
}

/* ---------- 文章主标题 ---------- */
.article-title {
  font-family: 'Open Sans', sans-serif;
  font-size: clamp(2rem, 4vw + 1rem, 6rem);
  font-weight: 700;
  text-align: center;
  margin: 0.5em 0 0.2em;
  color: #1a1a1a;
  line-height: 1.2;
}

.meta {
  color: #888;
  font-size: 14px;
  margin-bottom: 2em;
  display: flex;
  gap: 12px;
  justify-content: center;    /* 日期居中 */
}

/* ---------- Markdown 正文 ---------- */
.markdown-body {
  font-family: 'Open Sans', sans-serif;
  line-height: 1.8;
  font-size: clamp(1rem, 2.5vw, 1.3rem);
  color: #000;
  max-width: 90ch;             /* 限制行宽，方便阅读 */
  margin: 0 auto;              /* 居中文本块 */
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
  border-radius: 8px;
  overflow-x: auto;
}

.markdown-body :deep(blockquote) {
  border-left: 4px solid #ddd;
  padding-left: 16px;
  color: #666;
  margin: 1.5em 0;
}

/* ---------- 标签 ---------- */
.tags {
  margin-top: 3em;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;    /* 标签居中 */
}

.tag {
  background: #fff;
  color: #000;
  padding: 4px 14px;
  border-radius: 45px;
  font-size: 12px;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  box-shadow: 0px 8px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease 0s;
  cursor: default;
}

.tag:hover {
  background-color: #23c483;
  color: #fff;
  box-shadow: 0px 15px 20px rgba(46, 229, 157, 0.4);
  transform: translateY(-7px);
}

.tag:active {
  transform: translateY(-1px);
}

.not-found {
  text-align: center;
  margin-top: 200px;
  color: #999;
}
</style>