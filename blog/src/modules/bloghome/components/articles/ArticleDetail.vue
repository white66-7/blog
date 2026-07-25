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
        
        <!-- 1. 封面（最大视觉） -->
        <div class="hero-image">
          <img :src="article.cover" alt="cover" />
        </div>

        <!-- 2. 标题（第二视觉） -->
        <h1 class="article-title">{{ article.title }}</h1>
        
        <!-- 3. 日期（辅助） -->
        <div class="meta">
          <span>{{ article.date }}</span>
        </div>

        <!-- 4. 标签 -->
        <div class="tags" v-if="article.tags.length">
          <span class="tag" v-for="tag in article.tags" :key="tag">{{ tag }}</span>
        </div>

        <!-- 5. 正文 -->
        <div class="markdown-body" v-html="renderedContent" @click="handleMarkdownClick"></div>
      </div>
      
      <!-- 右侧悬浮目录 -->
      <aside class="toc" v-if="headings.length">
        <div class="toc__header">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 80 80">
            <path d="M0 0h80v80H0z" fill="none" />
            <g fill="none" fill-rule="evenodd" clip-rule="evenodd">
              <path fill="#219653" d="M48.56 20.477A19.402 19.402 0 0 1 74.97 34.4h-9.6l-4.4-4.4l-4.402 4.401H44.775A66 66 0 0 0 42.279 26h-1.215a19.4 19.4 0 0 1 7.496-5.523" />
              <path fill="#f2994a" d="M35.622 34.66A65.54 65.54 0 0 1 29 68h14.618a66.18 66.18 0 0 0-.812-40.525z" />
              <path fill="#219653" d="M31.41 13.477A19.402 19.402 0 0 0 5 27.4h9.599L19 23l3.738 3.738a19.41 19.41 0 0 1 17.03-1.068a19.4 19.4 0 0 1 3.17 1.672l-.059.06h.09a19.4 19.4 0 0 0-11.56-13.925" />
              <path fill="#219653" d="M14.419 36.17a19.4 19.4 0 0 1 28.52-8.828L29.102 41.179h-6.224v6.224L16.09 54.19a19.4 19.4 0 0 1-1.672-18.02" />
            </g>
          </svg>
          <span class="toc__title">目录</span>
        </div>
        <a v-for="(h, i) in headings" 
          :key="i" 
          class="toc__item" 
          :class="{ 'toc__item--active': activeHeading === i }"  
          :style="{ paddingLeft: (h.level - 1) * 12 + 'px',
                    fontSize: (20 - h.level * 2) + 'px'
          }" 
          @click.prevent="scrollToHeading(i)">
          {{ h.text }}
        </a>
      </aside>
    </main>
  </div>

  <div class="not-found" v-else>
    <p>文章未找到</p>
  </div>
  
  <Teleport to="body">
    <div
      v-if="previewVisible"
      class="lightbox-overlay"
      @click="closePreview"
    >
      <img :src="previewSrc" class="lightbox-image" />
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import axios from 'axios'  
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRoute, onBeforeRouteLeave } from 'vue-router'
import MarkdownIt from 'markdown-it'

import hljs from 'highlight.js'
import 'highlight.js/styles/vs2015.css'

import { articles } from '@/date/articles'
import type { Article } from '@/date/articles'
import Navbar from '@/modules/bloghome/components/load.vue'
import { articleScrollCache } from '@/router/index'

// --- Markdown 配置保持不变 ---
const md = new MarkdownIt({ html: true })
md.renderer.rules.fence = function (tokens, idx) {
  const token = tokens[idx]
  if (!token) return ''

  const code = token.content || ''
  const rawLang = (token.info || '').trim()
  
  const displayLang = rawLang.toUpperCase() || 'CODE'

  let hljsLang = rawLang.toLowerCase()
  if (hljsLang === 'c++') hljsLang = 'cpp'
  else if (hljsLang === 'c#') hljsLang = 'csharp'
  else if (hljsLang === 'vue') hljsLang = 'xml' 

  let highlightedCode = ''
  if (hljsLang && hljs.getLanguage(hljsLang)) {
    try {
      highlightedCode = hljs.highlight(code, { language: hljsLang, ignoreIllegals: true }).value
    } catch (__) {
      highlightedCode = md.utils.escapeHtml(code)
    }
  } else {
    highlightedCode = md.utils.escapeHtml(code)
  }

  return `
    <div class="code-editor">
      <div class="header">
        <span class="title">${displayLang}</span>
        <button class="copy-btn" data-code="${encodeURIComponent(code)}" title="复制代码">
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
            <path d="M0 0h24v24H0z" fill="none" />
            <path fill="currentColor" d="M6.6 11.397c0-2.726 0-4.089.843-4.936c.844-.847 2.201-.847 4.917-.847h2.88c2.715 0 4.073 0 4.916.847c.844.847.844 2.21.844 4.936v4.82c0 2.726 0 4.089-.844 4.936c-.843.847-2.201.847-4.916.847h-2.88c-2.716 0-4.073 0-4.917-.847s-.843-2.21-.843-4.936z" />
            <path fill="currentColor" d="M4.172 3.172C3 4.343 3 6.229 3 10v2c0 3.771 0 5.657 1.172 6.828c.617.618 1.433.91 2.62 1.048c-.192-.84-.192-1.996-.192-3.66v-4.819c0-2.726 0-4.089.843-4.936c.844-.847 2.201-.847 4.917-.847h2.88c1.652 0 2.8 0 3.638.19c-.138-1.193-.43-2.012-1.05-2.632C16.657 2 14.771 2 11 2S5.343 2 4.172 3.172" opacity=".5" />
          </svg>
          <span class="copy-tips">已复制</span>
        </button>
      </div>
      <div class="editor-content">
        <pre><code class="hljs ${hljsLang}">${highlightedCode}</code></pre>
      </div>
    </div>
  `
}

async function handleCopy(e: MouseEvent) {
  const target = e.target as HTMLElement
  const btn = target.closest('.copy-btn') as HTMLElement
  if (!btn) return

  const codeStr = btn.getAttribute('data-code')
  if (codeStr) {
    try {
      await navigator.clipboard.writeText(decodeURIComponent(codeStr))
      btn.classList.add('copied')
      setTimeout(() => {
        btn.classList.remove('copied')
      }, 2000)
    } catch (err) {
      console.error('复制失败', err)
      alert('您的浏览器不支持自动复制，请手动复制。')
    }
  }
}

const route = useRoute()
const article = ref<Article | null>(null)

function addSpacing(text: string): string {
  if (!text) return ''
  return text
    .replace(/([\u4e00-\u9fa5])([a-zA-Z0-9])/g, '$1 $2')
    .replace(/([a-zA-Z0-9])([\u4e00-\u9fa5])/g, '$1 $2')
}

const renderedContent = computed(() => {
  if (!article.value) return ''
  const spacedContent = addSpacing(article.value.content)
  return md.render(spacedContent)
})

const contentRef = ref<HTMLElement | null>(null)

// 🌟 优化 1：去掉 DOM 对象，只存轻量级的数据用于视图渲染
const headings = ref<{ text: string; level: number }[]>([])
// 单独用一个普通数组存 DOM 节点，避免 Vue 响应式代理 DOM 造成的性能卡顿
let headingElements: HTMLElement[] = []
const activeHeading = ref(-1)

// 🌟 优化 2：使用 watch 监听内容变化，实现瞬间渲染
watch(() => renderedContent.value, async (newVal) => {
  if (!newVal) return
  await nextTick() // 等待 v-html 将真实 DOM 渲染完毕
  if (!contentRef.value) return

  const els = contentRef.value.querySelectorAll('.markdown-body h1, .markdown-body h2, .markdown-body h3')
  headingElements = Array.from(els) as HTMLElement[]
  
  headings.value = headingElements.map(el => ({
    text: el.textContent || '',
    level: Number(el.tagName.charAt(1)) 
  }))

  handleScroll() // 立即初始化一下高亮状态
}, { immediate: true })

function scrollToHeading(index: number) {
  const el = headingElements[index] // 从普通数组取 DOM
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - 80
  window.scrollTo({ top, behavior: 'smooth' })
}

function handleScroll() {
  if (headingElements.length === 0) return
  const midline = window.innerHeight / 2
  let active = -1
  headingElements.forEach((el, i) => {
    const rect = el.getBoundingClientRect()
    if (rect.top <= midline) active = i
  })
  activeHeading.value = active
}

let cleanupScroll: () => void = () => {}

onBeforeRouteLeave((to, from, next) => {
  const currentId = Number(route.params.id)
  articleScrollCache.set(currentId, window.scrollY || document.documentElement.scrollTop)
  next()
})

onMounted(() => {
  const id = Number(route.params.id)
  article.value = articles.find(a => a.id === id) || null

  // 🌟 优化 3：不要 await 接口请求，让它在后台异步执行，不阻塞 UI 渲染
  axios.post(`http://localhost:8080/api/views/${id}/increment`).catch(err => {
    console.error('❌ 增加浏览量失败', err)
  })

  window.addEventListener('scroll', handleScroll)
  cleanupScroll = () => {
    window.removeEventListener('scroll', handleScroll)
  }

  const savedHeight = articleScrollCache.get(id) || 0
  if (savedHeight > 0) {
    requestAnimationFrame(() => {
      window.scrollTo(0, savedHeight)
    })
  }
})

onUnmounted(() => {
  cleanupScroll?.()
})

// --- 图片预览逻辑保持不变 ---
const previewVisible = ref(false)
const previewSrc = ref('')
const IMAGE_EXTENSIONS = /\.(webp|png|jpg|jpeg|gif|bmp|svg)$/i
function closePreview() { previewVisible.value = false }
function handleMarkdownClick(e: MouseEvent) {
  handleCopy(e)
  const link = (e.target as HTMLElement).closest('a')
  if (!link) return
  const href = link.getAttribute('href')
  if (href && IMAGE_EXTENSIONS.test(href)) {
    e.preventDefault()
    previewSrc.value = href
    previewVisible.value = true
  }
}
</script>

<style>
.markdown-body img {
  display: block;
  margin: 1.5em auto;
  max-width: 100%;
  border-radius: 8px;
}

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
  font-weight: 400;
  padding-top: 1px;
}

.article-page *,
.content *,
.markdown-body * {
  user-select: text !important;
  -webkit-user-select: text !important;
}

main {
  display: flex;
  position: relative;
}

.content {
  margin: 0 auto 0;
  padding: 0 60px 80px;
  max-width: 1200px;
  width: 100%;
  background: #e0e0e0;
  min-height: calc(100vh - 140px);
  border-radius: 0 0 30px 30px;
  box-shadow: 15px 15px 30px #bebebe, -15px -15px 30px #ffffff;
  overflow: visible;
}

/* ========================================================
   🌟 精准间距与排版 (封面 -> 标题 -> 日期 -> Tag -> 正文) 
   ======================================================== */

/* 1. 封面 */
.hero-image {
  position: relative;
  width: 100%;
  margin-top: 40px;
  margin-bottom: 40px; /* 距离下方标题: 40px */
  padding: 12px;
  background: #e0e0e0;
  border-radius: 24px;
  box-shadow: inset 8px 8px 16px #bebebe, inset -8px -8px 16px #ffffff;
  height: auto; 
  overflow: visible;
}

.hero-image img {
  width: 100%;
  height: auto !important;         /* 高度自适应，不裁剪 */
  max-height: none !important;     
  object-fit: contain !important;  
  display: block;
  border-radius: 12px;
  box-shadow: 4px 4px 8px rgba(0,0,0,0.1);
}

/* 2. 标题 */
.article-title {
  font-family: 'ShangShouJiangHuShuFa', sans-serif;
  font-size: clamp(2rem, 4vw + 1rem, 6rem);
  font-weight: normal;
  text-align: center;
  margin: 0 0 16px 0; /* 距离下方日期: 16px */
  color: #1a1a1a;
  line-height: 1.2;
  position: relative;
  z-index: 1;
}

/* 3. 日期 */
.meta {
  color: #888;
  font-size: 14px;
  font-family: 'ShangShouJiangHuShuFa', sans-serif;
  margin: 0 0 20px 0; /* 距离下方Tag: 20px */
  display: flex;
  gap: 12px;
  justify-content: center; /* 居中对齐 */
}

/* 4. 标签 */
.tags {
  margin: 0 0 40px 0; /* 距离下方正文: 40px */
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center; /* 与标题/日期保持居中对齐，更和谐 */
  position: relative;
  z-index: 1;
}

.tag {
  background: #e0e0e0;
  color: #000;
  padding: 4px 14px;
  border-radius: 45px;
  font-size: 18px;
  font-weight: 500;
  font-family: 'YouSheBiaoTiHei';
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

/* ======================================================== */

.markdown-body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", 'WenQuanWeiMiHei', sans-serif;
  line-height: 1.8;
  font-size: clamp(1rem, 2.5vw, 1.3rem);
  color: #000;
  max-width: 90ch;
  margin: 0 auto;
  position: relative;
  z-index: 1;
  letter-spacing: 0.02em;
  text-align: justify;
  text-justify: inter-ideograph;
  word-break: break-word;
}

.markdown-body :deep(h1) {
  font-family: 'ShangShouJiangHuShuFa';
  font-weight: normal;
  font-size: clamp(1.8rem, 3vw + 1rem, 4rem);
  text-align: center;
  margin: 1.5em 0 0.5em;
  line-height: 1.3;
}

.markdown-body :deep(h2) {
  font-family: 'ShangShouJiangHuShuFa';
  font-weight: normal;
  font-size: clamp(1.5rem, 2.5vw + 1rem, 3rem);
  margin: 0.6em 0 0.5em;
  line-height: 1.3;
}

.markdown-body :deep(p) {
  margin-bottom: 1.25rem;
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


/* ---------- 代码块样式 ---------- */
.markdown-body :deep(p code),
.markdown-body :deep(li code),
.markdown-body :deep(h1 code),
.markdown-body :deep(h2 code) {
  font-family: 'WenQuanWeiMiHei', monospace;
  background: rgba(0, 0, 0, 0.06);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.9em;
}

.markdown-body :deep(.code-editor) {
  max-width: 100%;
  background-color: #1e1e1e;
  box-shadow: 0px 4px 30px rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  padding: 2px;
  margin: 1.5em 0;
}

.markdown-body :deep(.code-editor .header) {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 8px 12px;
}

.markdown-body :deep(.code-editor .title) {
  font-family: Lato, 'Open Sans', sans-serif;
  font-weight: 900;
  font-size: 14px;
  letter-spacing: 1.57px;
  color: rgb(212, 212, 212);
}

.markdown-body :deep(.code-editor .copy-btn) {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #8b92a5;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  transition: all 0.2s ease;
  font-size: 20px;
}

.markdown-body :deep(.code-editor .copy-btn:hover) {
  background-color: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.markdown-body :deep(.code-editor .copy-btn:active) {
  transform: scale(0.9);
}

.markdown-body :deep(.code-editor .copy-btn.copied svg) {
  color: #23c483;
}

.markdown-body :deep(.code-editor .copy-btn .copy-tips) {
  position: absolute;
  right: 36px;
  font-size: 12px;
  font-family: sans-serif;
  color: #23c483;
  font-weight: bold;
  white-space: nowrap;
  opacity: 0;
  transform: translateX(10px);
  transition: all 0.3s ease;
  pointer-events: none;
}

.markdown-body :deep(.code-editor .copy-btn.copied .copy-tips) {
  opacity: 1;
  transform: translateX(0);
}

.markdown-body :deep(.code-editor .editor-content) {
  margin: 0 10px 10px;
}

.markdown-body :deep(.code-editor .editor-content pre) {
  background: transparent !important;
  margin: 0;
  padding: 10px 14px;
  overflow-x: auto;
  font-family: 'JetBrains Mono', 'Fira Code', Consolas, Monaco, 'Courier New', monospace !important;
  font-size: 0.95rem;
  line-height: 1.6;
  color: #d4d4d4; 
}

.markdown-body :deep(.code-editor .editor-content pre code.hljs) {
  background: transparent !important;
  padding: 0;
  font-family: inherit !important;
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
  font-family: 'YouSheBiaoTiHei';
  z-index: 15;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

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
  font-family: 'YouSheBiaoTiHei';
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  margin: 0;
}

.toc__item {
  position: relative;
  display: block;
  color: #212121;
  text-decoration: none;
  padding: 12px 20px;
  border-radius: 15px;
  background: #e0e0e0;
  font-weight: normal;
  overflow: hidden;
  z-index: 1;
  transition: color 0.25s ease;
  white-space: nowrap;
  text-overflow: ellipsis;
  transform: scale(1);
  transform-origin: center;
  transition: all 0.3s ease-in-out;
}

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
  font-weight: 700;
}

.not-found {
  text-align: center;
  margin-top: 200px;
  color: #999;
}

/* ---------- Markdown 超链接样式 (现代动画款) ---------- */
.markdown-body :deep(a) {
  color: #23c483; 
  text-decoration: none;
  font-weight: 700; 
  position: relative;
  padding: 0 2px;
  transition: color 0.3s ease;
}

.markdown-body :deep(a)::after {
  content: '';
  position: absolute;
  width: 100%;
  height: 2px;
  bottom: -2px;
  left: 0;
  background-color: #23c483;
  transform: scaleX(0);
  transform-origin: bottom right; 
  transition: transform 0.3s ease-out;
  border-radius: 2px;
}

.markdown-body :deep(a):hover {
  color: #1a9f68;
}

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
  font-family: 'YouSheBiaoTiHei';
  font-size: 16px;
  font-weight: normal;
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


.lightbox-overlay {
  position: fixed;
  z-index: 999;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  padding: 1em;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
}

.lightbox-image {
  max-width: 90vw;
  max-height: 90vh;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

@media (max-width: 1200px) {
  .toc {
    display: none;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .content {
    margin: 0 12px 20px;
    padding: 0 20px 60px;
    border-radius: 20px;
  }

  .hero-image {
    margin-top: 30px;
    padding: 8px;
    border-radius: 16px;
  }

  .hero-image img {
    height: auto !important;
    max-height: none !important;
    border-radius: 10px;
  }

  .back-btn {
    top: 80px;
    left: 12px;
    padding: 8px 16px;
    font-size: 13px;
  }
}
</style>