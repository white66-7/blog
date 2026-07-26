<template>
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
        <div class="hero-image">
          <img :src="article.cover" alt="cover" />
        </div>
        <h1 class="article-title">{{ article.title }}</h1>
        <div class="meta">
          <span>{{ article.date }}</span>
        </div>
        <div class="tags" v-if="article.tags.length">
          <span class="tag" v-for="tag in article.tags" :key="tag">{{ tag }}</span>
        </div>
        <div class="markdown-body" v-html="renderedContent" @click="handleMarkdownClick"></div>
      </div>
    </main>
  </div>
  <div class="not-found" v-else>
    <p>文章未找到</p>
  </div>

  <div class="elastic-sidebar" :class="{ 'is-open': isOpen }">
    <svg class="sidebar-svg" :viewBox="`0 0 350 ${svgHeight}`" preserveAspectRatio="none">
      <path class="s-path" fill="#e3e9ef" :d="currentPath" @mousedown="startDrag" @touchstart="startDrag" />
    </svg>

    <!-- ==== 新增：提示文字 ==== -->
<transition name="hint-fade">
  <div class="sidebar-hint-text" v-show="showHintText">
    目录
  </div>
</transition>
    <!-- ====================================== -->

    <div class="sidebar-content" :class="{ 'active': isOpen }">
      <div class="toc__header">
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
      
      <div class="toc-list">
        <a v-for="(h, i) in headings" :key="i" class="toc__item" :class="{ 'toc__item--active': activeHeading === i }"
          :style="{ paddingLeft: (h.level - 1) * 12 + 'px', fontSize: (20 - h.level * 2) + 'px' }"
          @click.prevent="handleTocClick(i)">
          {{ h.text }}
        </a>
      </div>
    </div>
  </div>

  <Teleport to="body">
    <div v-if="previewVisible" class="lightbox-overlay" @click="closePreview">
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
import 'animate.css'

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
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24"><path fill="currentColor" d="M6.6 11.397c0-2.726 0-4.089.843-4.936c.844-.847 2.201-.847 4.917-.847h2.88c2.715 0 4.073 0 4.916.847c.844.847.844 2.21.844 4.936v4.82c0 2.726 0 4.089-.844 4.936c-.843.847-2.201.847-4.916.847h-2.88c-2.716 0-4.073 0-4.917-.847s-.843-2.21-.843-4.936z"/><path fill="currentColor" d="M4.172 3.172C3 4.343 3 6.229 3 10v2c0 3.771 0 5.657 1.172 6.828c.617.618 1.433.91 2.62 1.048c-.192-.84-.192-1.996-.192-3.66v-4.819c0-2.726 0-4.089.843-4.936c.844-.847 2.201-.847 4.917-.847h2.88c1.652 0 2.8 0 3.638.19c-.138-1.193-.43-2.012-1.05-2.632C16.657 2 14.771 2 11 2S5.343 2 4.172 3.172" opacity=".5"/></svg>
          <span class="copy-tips">已复制</span>
        </button>
      </div>
      <div class="editor-content"><pre><code class="hljs ${hljsLang}">${highlightedCode}</code></pre></div>
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
      setTimeout(() => btn.classList.remove('copied'), 2000)
    } catch (err) {
      alert('您的浏览器不支持自动复制，请手动复制。')
    }
  }
}

const route = useRoute()
const article = ref<Article | null>(null)

function addSpacing(text: string): string {
  if (!text) return ''
  return text.replace(/([\u4e00-\u9fa5])([a-zA-Z0-9])/g, '$1 $2').replace(/([a-zA-Z0-9])([\u4e00-\u9fa5])/g, '$1 $2')
}

const renderedContent = computed(() => {
  if (!article.value) return ''
  return md.render(addSpacing(article.value.content))
})

const contentRef = ref<HTMLElement | null>(null)
const headings = ref<{ text: string; level: number }[]>([])
let headingElements: HTMLElement[] = []
const activeHeading = ref(-1)

watch(() => renderedContent.value, async (newVal) => {
  if (!newVal) return
  await nextTick()
  if (!contentRef.value) return
  const els = contentRef.value.querySelectorAll('.markdown-body h1, .markdown-body h2, .markdown-body h3')
  headingElements = Array.from(els) as HTMLElement[]
  headings.value = headingElements.map(el => ({
    text: el.textContent || '',
    level: Number(el.tagName.charAt(1))
  }))
  handleScroll()
}, { immediate: true })

function scrollToHeading(index: number) {
  const el = headingElements[index]
  if (!el) return
  const top = el.getBoundingClientRect().top + window.scrollY - 80
  window.scrollTo({ top, behavior: 'smooth' })
}

function handleTocClick(index: number) {
  scrollToHeading(index)
  if (isOpen.value) closeSidebar()
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

const svgHeight = ref(window.innerHeight > 70 ? window.innerHeight - 70 : 800)

const easings = {
  smallElastic: function (t: number, b: number, c: number, d: number) {
    let ts = (t /= d) * t
    let tc = ts * t
    return b + c * (33 * tc * ts + -106 * ts * ts + 126 * tc + -67 * ts + 15 * t)
  },
  inCubic: function (t: number, b: number, c: number, d: number) {
    let tc = (t /= d) * t * t
    return b + c * (tc)
  }
}

const START_BASE = 40
const OPEN_BASE = 280
const ANIM_TIME = 1200
const FRAME = 1000 / 60

const currentBaseX = ref(START_BASE)
const currentArcX = ref(0)
const currentDir = ref(1)

const currentPath = computed(() => {
  const h = svgHeight.value
  const arc = Math.abs(currentArcX.value) 
  return `M0,0 ${currentBaseX.value},0 a${arc},${h / 2} 0 1,${currentDir.value} 0,${h} L0,${h}`
})

let animating = ref(false)
let isOpen = ref(false)
let animationFrameId = 0
let hintTimeoutId: ReturnType<typeof setTimeout> | null = null
let stayTimeoutId: ReturnType<typeof setTimeout> | null = null // ==== 新增：用于控制停留时间的定时器 ====
const hasInteracted = ref(false)
const showHintText = ref(false)

function animatePath(
  targetBase: number,
  targetArc: number,
  time: number,
  easingFunc: keyof typeof easings,
  callback?: () => void
) {
  cancelAnimationFrame(animationFrameId)
  const steps = Math.floor(time / FRAME)
  let step = 0
  const startBase = currentBaseX.value
  const startArc = currentArcX.value
  const diffBase = targetBase - startBase
  const diffArc = targetArc - startArc

  function tick() {
    step++
    currentBaseX.value = easings[easingFunc](step, startBase, diffBase, steps)
    currentArcX.value = easings[easingFunc](step, startArc, diffArc, steps)
    currentDir.value = currentArcX.value >= 0 ? 1 : 0

    if (step >= steps) {
      currentBaseX.value = targetBase
      currentArcX.value = targetArc
      if (callback) callback()
    } else {
      animationFrameId = requestAnimationFrame(tick)
    }
  }
  animationFrameId = requestAnimationFrame(tick)
}

function playHintAnimation() {
  if (hasInteracted.value || isOpen.value) return
  animating.value = true
  
  showHintText.value = true 

  animatePath(65, 15, 1200, 'smallElastic', () => {
    if (hasInteracted.value) {
       showHintText.value = false 
       return
    }
    
    // ==== 修改：弹出动画结束后，不立刻收回，而是等待 1500 毫秒 ====
    stayTimeoutId = setTimeout(() => {
      // 停留期间如果用户操作了，就中断后续操作
      if (hasInteracted.value) return 

      showHintText.value = false 
      
      animatePath(START_BASE, 0, 1600, 'smallElastic', () => {
        animating.value = false
        if (!hasInteracted.value && !isOpen.value) {
          // 收缩完毕后，等待 1500 毫秒后再次循环弹出
          hintTimeoutId = setTimeout(playHintAnimation, 1500)
        }
      })
    }, 1500) // <-- 这里的 1500 就是目录展开和文字停留在屏幕上的时间，可以根据喜好修改（比如改成 2000 即2秒）
  })
}

let startMouseX = 0
let diffX = 0

function startDrag(e: MouseEvent | TouchEvent) {
  hasInteracted.value = true
  showHintText.value = false 
  
  // ==== 修改：清除所有的定时器 ====
  if (hintTimeoutId) clearTimeout(hintTimeoutId)
  if (stayTimeoutId) clearTimeout(stayTimeoutId) // 清除停留定时器
  
  cancelAnimationFrame(animationFrameId)
  animating.value = false
  if (isOpen.value) return

  if ('touches' in e) {
    startMouseX = e.touches[0]?.pageX ?? 0
  } else {
    startMouseX = (e as MouseEvent).pageX
  }

  document.addEventListener('mousemove', onDragMove)
  document.addEventListener('touchmove', onDragMove, { passive: false })
  document.addEventListener('mouseup', onDragEnd)
  document.addEventListener('touchend', onDragEnd)
}

function onDragMove(e: MouseEvent | TouchEvent) {
  let pageX = 0
  if ('touches' in e) {
    pageX = e.touches[0]?.pageX ?? 0
  } else {
    pageX = (e as MouseEvent).pageX
  }
  diffX = startMouseX - pageX
  if (diffX < 0) diffX = 0
  if (diffX > 350) diffX = 350
  currentArcX.value = Math.floor(diffX / 2)
  currentDir.value = 1
}

function onDragEnd() {
  document.removeEventListener('mousemove', onDragMove)
  document.removeEventListener('touchmove', onDragMove)
  document.removeEventListener('mouseup', onDragEnd)
  document.removeEventListener('touchend', onDragEnd)

  if (animating.value || !diffX) return
  if (diffX < 40) {
    animatePath(START_BASE, 0, ANIM_TIME, 'smallElastic')
  } else {
    openSidebar()
  }
}

function openSidebar() {
  if (animating.value || isOpen.value) return
  animating.value = true
  animatePath(OPEN_BASE, 0, ANIM_TIME, 'smallElastic', () => {
    isOpen.value = true
    animating.value = false
    setTimeout(() => document.addEventListener('click', closeSidebarOutside), 100)
  })
}

function closeSidebar() {
  if (animating.value || !isOpen.value) return
  animating.value = true
  isOpen.value = false
  document.removeEventListener('click', closeSidebarOutside)
  setTimeout(() => {
    animatePath(125, -100, ANIM_TIME / 1.5, 'inCubic', () => {
      animatePath(START_BASE, 0, ANIM_TIME * 1.33, 'smallElastic', () => {
        animating.value = false
        diffX = 0
      })
    })
  }, 200)
}

function closeSidebarOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (target.closest('.elastic-sidebar')) return
  closeSidebar()
}

let cleanupScroll: () => void = () => { }

onBeforeRouteLeave((to, from, next) => {
  const currentId = Number(route.params.id)
  articleScrollCache.set(currentId, window.scrollY || document.documentElement.scrollTop)
  next()
})

onMounted(() => {
  window.addEventListener('resize', () => {
    svgHeight.value = window.innerHeight > 70 ? window.innerHeight - 70 : 800
  })
  hintTimeoutId = setTimeout(playHintAnimation, 1500)
  const id = Number(route.params.id)
  article.value = articles.find(a => a.id === id) || null
  axios.post(`http://localhost:8080/api/views/${id}/increment`).catch(() => { })
  window.addEventListener('scroll', handleScroll)
  cleanupScroll = () => { window.removeEventListener('scroll', handleScroll) }
  const savedHeight = articleScrollCache.get(id) || 0
  if (savedHeight > 0) {
    requestAnimationFrame(() => window.scrollTo(0, savedHeight))
  }
})

onUnmounted(() => {
  cleanupScroll?.()
  document.removeEventListener('click', closeSidebarOutside)
  if (hintTimeoutId) clearTimeout(hintTimeoutId)
  if (stayTimeoutId) clearTimeout(stayTimeoutId) // 清理停留定时器
  cancelAnimationFrame(animationFrameId)
})

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
  background: #ececec !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  border-bottom: none !important;
  box-shadow: none !important;
}
</style>

<style scoped>
.elastic-sidebar {
  position: fixed;
  top: 0px;
  right: 0;
  width: 350px;
  height: 100vh;
  z-index: 90;
  pointer-events: none;
}
.sidebar-svg {
  position: absolute;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  transform: scaleX(-1);
  overflow: visible;
}
.s-path {
  cursor: grab;
  pointer-events: auto;
  background: #e3e9ef;
  filter: drop-shadow(-10px 0px 20px rgba(0, 0, 0, 0.15));
}
.s-path:active {
  cursor: grabbing;
}
/* 文字的基础样式 */
.sidebar-hint-text {
  position: absolute;
  top: 50%;
  right: 18px; /* 距离右侧的距离 */
  /* 显式声明 X 和 Y，防止冲突 */
  transform: translateY(-50%) translateX(0); 
  font-family: 'YouSheBiaoTiHei', sans-serif;
  font-size: 16px;
  color: #219653;
  writing-mode: vertical-rl;
  letter-spacing: 4px;
  pointer-events: none;
  z-index: 10;
}

/* === 自定义进出动画 === */
/* 进场和退场的过程（时间设置为 0.8s，配合弹动曲线） */
.hint-fade-enter-active,
.hint-fade-leave-active {
  /* 使用 cubic-bezier 让文字也带有一点点弹性感觉 */
  transition: opacity 0.8s ease, transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 进场前 和 退场后 的状态 */
.hint-fade-enter-from,
.hint-fade-leave-to {
  opacity: 0;
  /* 保持 Y轴居中不变，X轴向右偏移 30px（藏进屏幕右侧） */
  transform: translateY(-50%) translateX(30px);
}
.sidebar-content {
  position: absolute;
  top: 40px;
  right: 0;
  width: 280px;
  height: 100%;
  padding: 40px 20px;
  background: #edf2f7;
  opacity: 0;
  z-index: -1;
  overflow-y: auto;
  pointer-events: none;
  transition: opacity 200ms ease, transform 200ms ease;
  transform: translateX(20px);
}
.sidebar-content.active {
  opacity: 1;
  z-index: 2;
  transform: translateX(0);
  pointer-events: auto;
}
.sidebar-content::-webkit-scrollbar {
  display: none;
}
.toc__header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px dashed #bebebe;
}
.toc__title {
  font-family: 'YouSheBiaoTiHei';
  font-size: 24px;
  color: #1a1a1a;
}
.toc-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: 50px;
}
.toc__item {
  display: block;
  color: #212121;
  text-decoration: none;
  padding: 12px 15px;
  border-radius: 12px;
  font-family: 'YouSheBiaoTiHei';
  transition: all 0.3s ease;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  background: #edf2f7;
  box-shadow: 4px 4px 8px #bebebe, -4px -4px 8px #ffffff;
}
.toc__item:hover {
  background-color: #23c483;
  color: #1a1a1a;
  transform: translateX(-5px);
}
.toc__item--active {
  background-color: #23c483;
  color: #fff;
  box-shadow: inset 2px 2px 5px rgba(0, 0, 0, 0.15);
}
.article-page {
  min-height: 100vh;
  background: #ececec;
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
  max-width: 1400px;
  width: 100%;
  background: #fafafa;
  min-height: calc(100vh - 140px);
  border-radius: 0 0 30px 30px;
box-shadow: 0 0 30px rgba(0,0,0,0.08);
  overflow: visible;
}
.hero-image {
  position: relative;
  width: 100%;
  margin-top: 40px;
  margin-bottom: 40px;
  padding: 12px;
  background: #fafafa;
  border-radius: 24px;
  box-shadow: inset 8px 8px 16px #bebebe, inset -8px -8px 16px #ffffff;
  height: auto;
  overflow: visible;
}
.hero-image img {
  width: 100%;
  height: auto !important;
  max-height: none !important;
  object-fit: contain !important;
  display: block;
  border-radius: 12px;
  box-shadow: 4px 4px 8px rgba(0, 0, 0, 0.1);
}
.article-title {
  font-family: 'ShangShouJiangHuShuFa', sans-serif;
  font-size: clamp(2rem, 4vw + 1rem, 6rem);
  font-weight: normal;
  text-align: center;
  margin: 0 0 16px 0;
  color: #1a1a1a;
  line-height: 1.2;
  position: relative;
  z-index: 1;
}
.meta {
  color: #888;
  font-size: 14px;
  font-family: 'ShangShouJiangHuShuFa', sans-serif;
  margin: 0 0 20px 0;
  display: flex;
  gap: 12px;
  justify-content: center;
}
.tags {
  margin: 0 0 40px 0;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  position: relative;
  z-index: 1;
}
.tag {
  background: #ececec;
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
}
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
  background: #ececec;
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
.not-found {
  text-align: center;
  margin-top: 200px;
  color: #999;
}
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
    border-radius: 10px;
  }
  .back-btn {
    top: 80px;
    left: 12px;
    padding: 8px 16px;
    font-size: 13px;
  }
  .elastic-sidebar {
    top: 60px;
    height: calc(100vh - 60px);
  }
}
</style>