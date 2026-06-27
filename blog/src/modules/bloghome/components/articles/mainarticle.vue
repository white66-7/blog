<script lang="ts">
// 记忆芯片
let globalSavedPage = 1
let globalSavedScroll = 0
</script>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { articles as allArticles } from '@/date/articles'
import Navbar from '@/modules/bloghome/components/load.vue'
import SearchRecentCard from '@/modules/bloghome/components/articles/search_article.vue'
import DonutChart from '@/modules/bloghome/components/articles/DonutChart.vue'
import RecommendedArticles from '@/modules/bloghome/components/articles/RecommendedArticles.vue'

const router = useRouter()
const scrollRef = ref<HTMLElement | null>(null)
const searchKeyword = ref('')

// ===== 分页逻辑 =====
const currentPage = ref(globalSavedPage)
const pageSize = ref(6)


watch(currentPage, (newPage) => {
  globalSavedPage = newPage
})

watch(searchKeyword, () => {
  currentPage.value = 1
  scrollToTop()
})

const sortedArticles = computed(() =>
  [...allArticles].sort((a, b) => {
    const timeA = a.date ? new Date(a.date).getTime() : 0
    const timeB = b.date ? new Date(b.date).getTime() : 0
    return timeB - timeA
  })
)

const recommendList = computed(() =>
  sortedArticles.value.filter(article => [1].includes(article.id))
)

// 搜索过滤也基于排序后的数据
const filteredArticles = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  if (!kw) return sortedArticles.value
  return sortedArticles.value.filter(article =>
    article.title.toLowerCase().includes(kw) ||
    article.excerpt?.toLowerCase().includes(kw) ||
    article.tags?.some(tag => tag.toLowerCase().includes(kw)) ||
    article.type?.toLowerCase().includes(kw)
  )
})

const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredArticles.value.slice(start, start + pageSize.value)
})


const totalPages = computed(() => Math.ceil(filteredArticles.value.length / pageSize.value) || 1)

const onSearch = (query: string) => {
  searchKeyword.value = query
  currentPage.value = 1
  scrollToTop()
}

const scrollToTop = () => {
  if (scrollRef.value) scrollRef.value.scrollTo({ top: 0, behavior: 'smooth' })
}

const goToPage = (page: number) => {
  currentPage.value = page
  scrollToTop()
}

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    scrollToTop()
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    scrollToTop()
  }
}

const goToArticle = (id: number) => {
  router.push(`/article/${id}`)
}

// ===== 滚动记忆 =====
onBeforeRouteLeave((to, from, next) => {
  if (scrollRef.value) globalSavedScroll = scrollRef.value.scrollTop
  next()
})

onMounted(async () => {
  await nextTick()
  if (scrollRef.value && globalSavedScroll > 0) {
    scrollRef.value.scrollTop = globalSavedScroll
  }
})
</script>

<template>
  <div class="app-page-wrapper">
    <Navbar :transparent="false" />
    <div class="scrollable-content" ref="scrollRef">
      <div class="main-body">
        <div class="page-header">
          <h1 class="title">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 512 512">
              <path d="M0 0h512v512H0z" fill="none" />
              <path fill="currentColor"
                d="M204 240H68a36 36 0 0 1-36-36V68a36 36 0 0 1 36-36h136a36 36 0 0 1 36 36v136a36 36 0 0 1-36 36m240 0H308a36 36 0 0 1-36-36V68a36 36 0 0 1 36-36h136a36 36 0 0 1 36 36v136a36 36 0 0 1-36 36M204 480H68a36 36 0 0 1-36-36V308a36 36 0 0 1 36-36h136a36 36 0 0 1 36 36v136a36 36 0 0 1-36 36m240 0H308a36 36 0 0 1-36-36V308a36 36 0 0 1 36-36h136a36 36 0 0 1 36 36v136a36 36 0 0 1-36 36" />
            </svg>
            全部文章
            <span class="count-info">
              共{{ filteredArticles.length }}篇
            </span>
          </h1>
        </div>
        <!-- 主布局：左列（饼图+搜索卡片） + 右列（文章列表+分页） -->
        <div class="two-column-layout">
          <!-- 左侧列 -->
          <div class="left-column">
<SearchRecentCard v-model="searchKeyword" class="search-card" />
<RecommendedArticles :articles="recommendList" />
            <div class="card chart-card">
              <DonutChart :articles="allArticles" />
            </div>
          </div>

          <!-- 右侧列 -->
          <div class="right-column">
            <!-- 文章列表 -->
            <div class="articles-container">
              <div v-for="(article, index) in paginatedArticles" :key="article.id"
                :class="['card', index % 2 === 0 ? 'horizontal' : 'reverse-horizontal']"
                @click="goToArticle(article.id)">
                <img v-if="article.cover" :src="article.cover" class="card__img" />
                <div v-else class="card__img placeholder-img">暂无封面</div>
                <div class="card__content">
                  <div class="card__title">{{ article.title }}</div>
                  <div class="card__date">{{ article.date }}</div>
                  <div class="card__excerpt">{{ article.excerpt }}</div>
                  <div class="card__tags">
                    <span v-for="tag in article.tags" :key="tag" class="tag">
                      <i class="fa fa-tag"></i> {{ tag || '未知' }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 分页 -->
            <div class="pagination" v-if="totalPages > 1">
              <button class="page-btn" :disabled="currentPage === 1" @click="prevPage">上一页</button>
              <div class="page-numbers">
                <button v-for="page in totalPages" :key="page"
                  :class="['page-num-btn', { active: currentPage === page }]" @click="goToPage(page)">{{ page
                  }}</button>
              </div>
              <button class="page-btn" :disabled="currentPage === totalPages" @click="nextPage">下一页</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ========= 全局布局 ========= */
.app-page-wrapper {
  position: relative;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  background-color: #000;
}

.app-page-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('@/assets/木叶创立.webp');
  background-size: cover;
  background-position: center;
  z-index: 0;
}

.app-page-wrapper::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1;
}

.scrollable-content {
  position: relative;
  z-index: 2;
  height: 100vh;
  height: 100dvh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px) saturate(180%);
}

.main-body {
  padding: 80px 5% 60px 0px;
  box-sizing: border-box;
  max-width: 1400px;
  margin: 0 auto;
}

/* ========= 页面头部 ========= */
.page-header {
  max-width: 900px;
  margin: 0 auto;
  margin-bottom: 30px;
  color: #fff;
  position: relative;
}


.page-header .title {
  font-size: 28px;
  font-family: "Microsoft YaHei", "微软雅黑", "PingFang SC", sans-serif;
  margin: 0;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 14px;
}

.count-info {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-left: auto;
  font-size: 24px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.85);
  font-family: "Microsoft YaHei", "微软雅黑", "PingFang SC", sans-serif;
}

.count-info svg {
  width: 1.2em;
  height: auto;
  flex-shrink: 0;
}

/* ========= 两栏布局 ========= */
.two-column-layout {
  display: flex;
  gap: 30px;
  max-width: 900px;
  margin: 0 auto;
  align-items: flex-start;
}

.left-column {
  flex: 0 0 280px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
}

.right-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-height: 400px;
}

/* ========= 饼图卡片 ========= */
.chart-card {
  box-sizing: border-box;
  width: 100%;
  /* 填满左侧列宽度（280px） */
  min-height: 280px;
  /* 固定高度，也可用 height: 280px */
  background: rgba(217, 217, 217, 0.58);
  border: 1px solid white;
  box-shadow: 12px 17px 51px rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(6px);
  border-radius: 17px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  /* 让饼图不贴边 */
  transition: all 0.5s;
  cursor: default;
  /* 饼图不需要鼠标手型，可改回 default */
}

.chart-card:hover {
  border: 1px solid black;
  transform: scale(1.02);
  /* 悬停时轻微放大 */
}

.chart-card:active {
  transform: scale(0.98);
}

/* 饼图容器填满卡片 */
.chart-card .donut-chart-container {
  width: 100%;
  height: 100%;
  min-height: unset;
  /* 覆盖组件内部的 min-height: 400px */
}

/* 确保 SVG 自适应 */
.chart-card .donut-chart-container svg {
  width: 100%;
  height: auto;
  display: block;
}


.search-card {
  flex: 1;
  min-height: 50px;
}

/* ========= 文章列表容器 ========= */
.articles-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  font-family: 'Microsoft YaHei', 'PingFang SC', 'Heiti SC', sans-serif;
  font-weight: 700;
  flex: 1;
}

/* ========= 卡片基础样式（文章卡片） ========= */
.card {
  display: flex;
  height: 200px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  cursor: pointer;
}

.card:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.card.horizontal {
  flex-direction: row;
}

.card.reverse-horizontal {
  flex-direction: row-reverse;
}

.card.horizontal .card__img,
.card.reverse-horizontal .card__img {
  width: 40%;
  height: 100%;
  object-fit: cover;
}

.placeholder-img {
  width: 40%;
  background: #eee;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
}

.card.horizontal .card__content,
.card.reverse-horizontal .card__content {
  width: 60%;
  display: flex;
  flex-direction: column;
  padding: 16px;
  box-sizing: border-box;
}

.card__title {
  font-size: 16px;
  /* 字体稍小以适应窄列 */
  font-weight: 700;
  margin-bottom: 6px;
  color: #1a1a1a;
}

.card__date {
  font-size: 11px;
  color: #666;
  margin-bottom: 8px;
}

.card__excerpt {
  font-size: 13px;
  color: #444;
  line-height: 1.4;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  /* 减少行数 */
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: auto;
  align-self: flex-start;
}

.tag {
  background: #fff;
  color: #000;
  padding: 2px 10px;
  border-radius: 45px;
  font-size: 11px;
  font-weight: 600;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.08);
}

/* ========= 分页栏样式 ========= */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
}

.page-btn {
  padding: 6px 14px;
  border: none;
  background-color: #fff;
  color: #333;
  border-radius: 20px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s;
}

.page-btn:hover:not(:disabled) {
  background-color: #23c483;
  color: #fff;
}

.page-btn:disabled {
  background-color: rgba(255, 255, 255, 0.3);
  color: #999;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 6px;
}

.page-num-btn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: #fff;
  cursor: pointer;
  font-weight: bold;
}

.page-num-btn.active {
  background-color: #23c483;
  color: white;
}

/* ========= 移动端适配 ========= */
@media (max-width: 900px) {
  .main-body {
    padding: 80px 5% 40px 5%;
  }
}

@media (max-width: 768px) {
  .two-column-layout {
    flex-direction: column;
    /* 改为上下排列 */
    gap: 30px;
  }

  .left-column {
    flex: 0 0 auto;
    width: 100%;
    min-height: auto;
  }

  .right-column {
    width: 100%;
    min-height: auto;
  }

  .card {
    height: auto;
  }

  .card.horizontal,
  .card.reverse-horizontal {
    flex-direction: column !important;
  }

  .card.horizontal .card__img,
  .card.reverse-horizontal .card__img {
    width: 100%;
    height: 160px;
  }

  .card.horizontal .card__content,
  .card.reverse-horizontal .card__content {
    width: 100%;
    padding: 16px;
  }

  .page-numbers {
    display: none;
  }
}
</style>