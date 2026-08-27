<template>
  <div class="articles-section">
    <TransitionGroup tag="div" name="article-list" class="articles-grid">
      <div v-for="(article, index) in displayArticles" :key="article.id" :class="['card', article.layout]"
        @click="goToArticle(article.id)"
        @mouseenter="onCardEnter(index)"
        @mouseleave="onCardLeave(index)">
        <img :src="article.cover" class="card__img" />
        <div class="card__content">
          <div class="card__title">{{ article.title }}</div>
          <div class="card__date">{{ article.date }}</div>
          <div class="card__views">
            <svg xmlns="http://www.w3.org/2000/svg" width="1.1em" height="1.1em" viewBox="0 0 24 24" class="view-icon">
              <path d="M0 0h24v24H0z" fill="none" />
              <path fill="currentColor"
                d="M12 9a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3m0 8a5 5 0 0 1-5-5a5 5 0 0 1 5-5a5 5 0 0 1 5 5a5 5 0 0 1-5 5m0-12.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5" />
            </svg>

            <!-- 1. 加载中：微型流光胶囊骨架 -->
            <span v-if="articleViews[article.id] === undefined" class="skeleton-views-pill"></span>

            <!-- 2. 加载完毕：数字平滑淡入 -->
            <span v-else class="views-num-text">
              {{ articleViews[article.id] }}
            </span>
          </div>
          <div class="card__excerpt">{{ article.excerpt }}</div>
          <div class="card__tags">
            <span v-for="tag in article.tags" :key="tag" class="tag">
              <i class="fa fa-tag"></i> {{ tag }}
            </span>
          </div>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, watch, onMounted, onActivated, onUnmounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { prefetchArticleDetail } from '@/modules/bloghome/utils/prefetch'

const props = defineProps<{
  articles: Array<{
    id: number
    title: string
    type: string
    date: string
    readTime: string
    excerpt: string
    tags: string[]
    cover: string
  }>
}>()

const router = useRouter()

// ==================== 浏览量体系（与文章列表页 mainarticle.vue 一致） ====================
const getPreloadedViews = (): Record<number, number> => {
  try {
    const raw = sessionStorage.getItem('preloaded_views')
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

const articleViews = ref<Record<number, number | undefined>>(getPreloadedViews())

// 💡 带时间戳请求，彻底防止浏览器缓存 GET 请求
const fetchViewsForArticles = async (articles: any[]) => {
  if (!articles || articles.length === 0) return

  const ids = articles.map(a => a.id).join(',')
  try {
    const res = await axios.get(`/api/views?ids=${ids}&_t=${Date.now()}`)
    const remoteViews = res.data.views || {}

    articles.forEach(a => {
      articleViews.value[a.id] = remoteViews[a.id] ?? remoteViews[String(a.id)] ?? 0
    })
  } catch (err) {
    console.warn('[Views] 获取阅读量失败:', err)
    articles.forEach(a => {
      if (articleViews.value[a.id] === undefined) {
        articleViews.value[a.id] = 0
      }
    })
  }
}

const goToArticle = (id: number) => {
  // 💡 点击进入详情页时前端立即乐观 +1，提供极致流畅体验
  if (typeof articleViews.value[id] === 'number') {
    articleViews.value[id]! += 1
  }
  router.push(`/article/${id}`)
}


const firstArticle = computed(() =>
  props.articles.find(a => a.id === 1) ?? props.articles[0] ?? null
)

const secondArticle = ref<typeof firstArticle.value>(null)
const thirdArticle = ref<typeof firstArticle.value>(null)

const poolForRotation = computed(() => {
  if (!firstArticle.value) return props.articles
  return props.articles.filter(a => a.id !== firstArticle.value!.id && a.title !== '无')
})

function getRandomArticle(excludeId?: number): typeof firstArticle.value {
  let pool = poolForRotation.value
  if (excludeId != null) {
    pool = pool.filter(a => a.id !== excludeId)
  }
  if (pool.length === 0) return null
  return pool[Math.floor(Math.random() * pool.length)] ?? null
}

function initArticles() {
  const a2 = getRandomArticle()
  secondArticle.value = a2
  const a3 = getRandomArticle(a2?.id)
  thirdArticle.value = a3
}

function rotateSecond() {
  const excludeIds = [
    firstArticle.value?.id,
    secondArticle.value?.id,
    thirdArticle.value?.id,
  ].filter(Boolean) as number[]

  let pool = poolForRotation.value.filter(a => !excludeIds.includes(a.id))
  if (pool.length === 0) pool = poolForRotation.value
  if (pool.length === 0) return
  secondArticle.value = pool[Math.floor(Math.random() * pool.length)] ?? null
}

function rotateThird() {
  const excludeIds = [
    firstArticle.value?.id,
    secondArticle.value?.id,
    thirdArticle.value?.id,
  ].filter(Boolean) as number[]

  let pool = poolForRotation.value.filter(a => !excludeIds.includes(a.id))
  if (pool.length === 0) pool = poolForRotation.value
  if (pool.length === 0) return
  thirdArticle.value = pool[Math.floor(Math.random() * pool.length)] ?? null
}

let timer2: number | null = null
let timer3: number | null = null

function startTimer2() {
  if (!timer2) timer2 = window.setInterval(rotateSecond, 8000)
}
function stopTimer2() {
  if (timer2) { clearInterval(timer2); timer2 = null }
}
function startTimer3() {
  if (!timer3) timer3 = window.setInterval(rotateThird, 8000)
}
function stopTimer3() {
  if (timer3) { clearInterval(timer3); timer3 = null }
}

// 💡 鼠标进入：先预取详情页 chunk（点击跳转零延迟），同时暂停该卡片的自动轮换
function onCardEnter(index: number) {
  prefetchArticleDetail()
  if (index === 1) stopTimer2()
  else if (index === 2) stopTimer3()
}

function onCardLeave(index: number) {
  if (index === 1) startTimer2()
  else if (index === 2) startTimer3()
}

const displayArticles = computed(() => {
  const list: any[] = []
  if (firstArticle.value) list.push({ ...firstArticle.value, layout: 'horizontal' })
  if (secondArticle.value) list.push({ ...secondArticle.value, layout: 'vertical' })
  if (thirdArticle.value) list.push({ ...thirdArticle.value, layout: 'reverse-horizontal' })
  return list
})

// 💡 首页卡片固定 3 张：轮换 / 首次挂载 / 从详情页返回，都静默拉取最新阅读量
watch(displayArticles, (list) => {
  fetchViewsForArticles(list)
}, { immediate: true })

onActivated(() => {
  fetchViewsForArticles(displayArticles.value)
})

onMounted(() => {
  initArticles()
  startTimer2()
  setTimeout(() => startTimer3(), 4000)
  // 进入主页即预取详情页 chunk，首次点击也不卡
  prefetchArticleDetail()
})

onUnmounted(() => {
  stopTimer2()
  stopTimer3()
})
</script>

<style scoped>
.articles-section {
  margin-top: 0;
}

/* ---------- Grid 基础 ---------- */
.articles-grid {
  display: grid;
  grid-auto-flow: row dense;
  grid-template-columns: repeat(3, 256px);
  grid-auto-rows: 196px;
  gap: 16px;
  justify-content: center;
  position: relative;
  /* 为绝对定位的离开卡片提供定位上下文 */
}

/* ---------- 卡片通用 ---------- */
.card {
  display: flex;
  height: 100%;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: #fff;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  cursor: pointer;
  will-change: transform, opacity;
  /* 优化动画性能 */
}

.card:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* ---------- 横向卡片 (第一篇) ---------- */
.card.horizontal {
  flex-direction: row;
  grid-column: 1 / 3;
  grid-row: 1;
}

.card.horizontal .card__img {
  width: 50%;
  height: 100%;
  object-fit: cover;
}

.card.horizontal .card__content {
  width: 50%;
  padding: 12px;
}

/* ---------- 纵向卡片 (第二篇) ---------- */
.card.vertical {
  flex-direction: column;
  grid-column: 3;
  grid-row: 1 / 3;
}

.card.vertical .card__img {
  width: 100%;
  height: auto;
  aspect-ratio: 256 / 196;
  object-fit: cover;
}

.card.vertical .card__content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px;
}

/* ---------- 反向横向卡片 (第三篇) ---------- */
.card.reverse-horizontal {
  flex-direction: row-reverse;
  grid-column: 1 / 3;
  grid-row: 2;
}

.card.reverse-horizontal .card__img {
  width: 50%;
  height: 100%;
  object-fit: cover;
}

.card.reverse-horizontal .card__content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 12px;
  width: 50%;
  box-sizing: border-box;
}

.card.reverse-horizontal .card__tags {
  margin-top: auto;
  align-self: flex-start;
}

/* ---------- 内容区通用 ---------- */
.card__content {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.card__title {
  font-size: 18px;
  font-weight: 400;
  font-family: 'YouSheBiaoTiHei', '优设标题黑', sans-serif;
  margin-bottom: 6px;
  line-height: 1.3;
  color: #1a1a1a;
}

.card__date {
  font-size: 12px;
  color: #999;
  font-family: 'YouSheBiaoTiHei', '优设标题黑', sans-serif;
  margin-bottom: 8px;
}

/* ---------- 浏览量展示（与文章列表页一致） ---------- */
.card__views {
  font-size: 12px;
  color: #999;
  font-family: 'YouSheBiaoTiHei', '优设标题黑', sans-serif;
  display: flex;
  align-items: center;
  gap: 5px;
  min-height: 16px;
  margin-bottom: 8px;
}

.view-icon {
  flex-shrink: 0;
  transition: transform 0.3s ease;
}

.card:hover .view-icon {
  transform: scale(1.15);
  color: #23c483;
}

/* 浏览量微型骨架流光胶囊 */
.skeleton-views-pill {
  display: inline-block;
  width: 26px;
  height: 12px;
  border-radius: 4px;
  background: linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%);
  background-size: 200% 100%;
  animation: views-shimmer 1.2s infinite linear;
}

@keyframes views-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* 浏览量数字平滑渐显 */
.views-num-text {
  display: inline-block;
  animation: numFadeIn 0.35s ease-out forwards;
}

@keyframes numFadeIn {
  from { opacity: 0; transform: translateY(2px); }
  to { opacity: 1; transform: translateY(0); }
}

.card__excerpt {
  font-family: 'YouSheBiaoTiHei', '优设标题黑', sans-serif;
  font-size: 13px;
  color: #555;
  line-height: 1.4;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 3;
}

.card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: auto;
}

.tag {
  background: #fff;
  color: #000;
  padding: 4px 14px;
  border-radius: 45px;
  font-size: 12px;
  font-weight: 500;
  font-family: 'YouSheBiaoTiHei', '优设标题黑', sans-serif;
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

/* ---------- 移动端适配 ---------- */
@media (max-width: 900px) {
  .articles-grid {
    grid-template-columns: 1fr;
    grid-auto-rows: auto;
    gap: 16px;
  }

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
}

/* ========== 文章切换动画 ========== */

/* 离开的卡片脱离文档流，防止布局跳动 */
.article-list-leave-active {
  position: absolute;
  opacity: 0;
}

/* 进入的初始状态 */
.article-list-enter-from {
  opacity: 0;
  transform: translateY(20px) scale(0.95);
  filter: blur(10px);
}

/* 离开的终点状态 */
.article-list-leave-to {
  opacity: 0;
  transform: translateY(-20px) scale(0.95);
  filter: blur(10px);
}

/* 过渡过程配置 */
.article-list-enter-active,
.article-list-leave-active {
  transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 列表项移动时的平滑过渡（位置变化时） */
.article-list-move {
  transition: transform 0.6s ease;
}
</style>