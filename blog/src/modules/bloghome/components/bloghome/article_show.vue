<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

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
const goToArticle = (id: number) => {
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

const displayArticles = computed(() => {
  const list: any[] = []
  if (firstArticle.value) list.push({ ...firstArticle.value, layout: 'horizontal' })
  if (secondArticle.value) list.push({ ...secondArticle.value, layout: 'vertical' })
  if (thirdArticle.value) list.push({ ...thirdArticle.value, layout: 'reverse-horizontal' })
  return list
})

onMounted(() => {
  initArticles()
  startTimer2()
  setTimeout(() => startTimer3(), 4000)
})

onUnmounted(() => {
  stopTimer2()
  stopTimer3()
})
</script>

<template>
  <div class="articles-section">
    <!-- 将原来的 div.articles-grid 改为 TransitionGroup，保留 grid 布局 -->
    <TransitionGroup
      tag="div"
      name="article-list"
      class="articles-grid"
    >
      <div
        v-for="(article, index) in displayArticles"
        :key="article.id"
        :class="['card', article.layout]"
        @click="goToArticle(article.id)"
        @mouseenter="index === 1 ? stopTimer2() : index === 2 ? stopTimer3() : undefined"
        @mouseleave="index === 1 ? startTimer2() : index === 2 ? startTimer3() : undefined"
      >
        <img :src="article.cover" class="card__img" />
        <div class="card__content">
          <div class="card__title">{{ article.title }}</div>
          <div class="card__date">{{ article.date }}</div>
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

<style scoped>
.articles-section {
  margin-top: 20px;
  font-family: 'Microsoft YaHei', 'PingFang SC', 'Heiti SC', sans-serif;
  font-weight: 700;
}

/* ---------- Grid 基础 ---------- */
.articles-grid {
  display: grid;
  grid-auto-flow: row dense;
  grid-template-columns: repeat(3, 256px);
  grid-auto-rows: 196px;
  gap: 16px;
  justify-content: start;
  position: relative; /* 为绝对定位的离开卡片提供定位上下文 */
}

/* ---------- 卡片通用 ---------- */
.card {
  display: flex;
  height: 100%;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
   box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08);
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  cursor: pointer;
  will-change: transform, opacity; /* 优化动画性能 */
}
.card:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 0 8px 24px rgba(0, 0, 0, 0.12);
}

/* ---------- 横向卡片 (第一篇) ---------- */
.card.horizontal {
  flex-direction: row;
  grid-row: span 1;
  grid-column: span 2;
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
  grid-row: span 2;
  grid-column: span 1;
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
  grid-row: span 1;
  grid-column: span 2;
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
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 6px;
  line-height: 1.3;
  color: #1a1a1a;
}
.card__date {
  font-size: 12px;
  color: #999;
  margin-bottom: 8px;
}
.card__excerpt {
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
  font-weight: 600;
  font-family: 'SimHei', 'Microsoft YaHei', sans-serif;
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