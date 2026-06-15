<template>
  <div class="article-page" v-if="article">
    <!-- 顶部返回按钮（固定） -->
    <button class="back-btn" @click="$router.back()">← 返回</button>

    <main>
      <!-- 左侧固定进度线 -->
      <aside class="timeline" ref="timelineRef">
        <div class="line-bg"></div>
        <div class="line-progress" ref="progressRef"></div>
        <!-- 动态生成的圆点会插入这里 -->
      </aside>

      <!-- 右侧文章区域 -->
      <article class="content" ref="contentRef">
        <h1 class="article-title">{{ article.title }}</h1>
        <div class="meta">
          <span>{{ article.date }}</span>
          <span>· {{ article.readTime }}</span>
          <span>· {{ article.type }}</span>
        </div>
        <img v-if="article.cover" :src="article.cover" class="cover" />
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
import { articles } from '@/date/articles' // 路径请改为你的实际位置
import type { Article } from '@/date/articles'

const md = new MarkdownIt()
const route = useRoute()
const article = ref<Article | null>(null)
const renderedContent = computed(() => article.value ? md.render(article.value.content) : '')

// DOM 引用
const timelineRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)
const progressRef = ref<HTMLElement | null>(null)

// 动态圆点数组（DOM 元素）
let dots: HTMLElement[] = []
let cleanupScroll: () => void

// 生成圆点
function createDots() {
  if (!contentRef.value || !timelineRef.value) return
  const h1s = contentRef.value.querySelectorAll('h1')
  // 清除旧点
  dots.forEach(d => d.remove())
  dots = []

  h1s.forEach((h1) => {
    const dot = document.createElement('div')
    dot.className = 'dot'
    // 使用 data 属性存储对应的标题元素，避免 any
    dot.dataset.targetIndex = String(dots.length) // 或者存储标题文本
    timelineRef.value!.appendChild(dot)
    dots.push(dot)
  })
  updateDotPositions()
}

function updateDotPositions() {
  if (!contentRef.value) return
  const h1s = Array.from(contentRef.value.querySelectorAll('h1')) // 转为数组，方便使用 forEach
  dots.forEach((dot, i) => {
    const h1 = h1s[i] // 由于 dots 和 h1s 一一对应，我们直接取
    if (h1) { // 防御性检查
      const rect = h1.getBoundingClientRect()
      const top = rect.top + window.scrollY
      dot.style.top = `${top}px`
    }
  })
}

// 滚动处理
function handleScroll() {
  if (!contentRef.value || !progressRef.value) return
  const h1s = contentRef.value.querySelectorAll('h1')
  const viewportHeight = window.innerHeight
  const midline = viewportHeight / 2
  let activeIndex = -1

  h1s.forEach((h1, index) => {
    const rect = h1.getBoundingClientRect()
    if (rect.top <= midline) {
      activeIndex = index
    }
  })

  // 更新圆点激活状态
  dots.forEach((dot, i) => {
    dot.classList.toggle('active', i === activeIndex)
  })

  // 更新进度条高度
  const contentEl = contentRef.value!
  const articleTop = contentEl.getBoundingClientRect().top + window.scrollY
  const articleHeight = contentEl.offsetHeight
  const scrollY = window.scrollY
  let progress = (scrollY - articleTop + 200) / (articleHeight - viewportHeight) // 加200提前开始
  progress = Math.max(0, Math.min(1, progress))
  progressRef.value.style.height = `${progress * 100}%`
}

// 窗口大小改变时重新计算圆点位置
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

  // 绑定事件
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
/* 非 scoped 样式：因为圆点是动态生成的，无法使用 scoped */
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
</style>

<style scoped>
.article-page {
  min-height: 100vh;
  background: #f5f5f5;
  position: relative;
  z-index: 10;
}

.back-btn {
  position: fixed;
  top: 20px;
  left: 20px;
  background: white;
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  cursor: pointer;
  z-index: 20;
  font-size: 14px;
}

.back-btn:hover {
  transform: translateX(-3px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

main {
  display: flex;
  position: relative;
}

/* ---------- 左侧进度线 ---------- */
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

/* ---------- 右侧文章 ---------- */
.content {
  margin-left: 150px;
  padding: 80px 60px;
  max-width: 800px;
  width: 100%;
  background: white;
  min-height: 100vh;
  box-shadow: -5px 0 20px rgba(0,0,0,0.02);
}

.article-title {
  font-size: 2.5em;
  margin-bottom: 0.2em;
}

.meta {
  color: #888;
  font-size: 14px;
  margin-bottom: 2em;
  display: flex;
  gap: 12px;
}

.cover {
  width: 100%;
  border-radius: 12px;
  margin-bottom: 2em;
}

.markdown-body {
  line-height: 1.8;
  font-size: 16px;
}

/* 确保 h1 有足够间距，方便观察点 */
.markdown-body :deep(h1) {
  margin: 2em 0 0.8em;
  font-size: 2em;
}

.markdown-body :deep(p) {
  margin-bottom: 1.2em;
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

.tags {
  margin-top: 3em;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.tag {
  background: #f0f0f0;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  color: #555;
}

.not-found {
  text-align: center;
  margin-top: 200px;
  color: #999;
}
</style>