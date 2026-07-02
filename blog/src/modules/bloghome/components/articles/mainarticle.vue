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
import PageHeader from '@/modules/bloghome/components/articles/PageHeader.vue'

import 'animate.css'

const router = useRouter()
const scrollRef = ref<HTMLElement | null>(null)
const articlesContainerRef = ref<HTMLElement | null>(null)
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

const scrollToTop = () => {
  if (scrollRef.value) scrollRef.value.scrollTo({ top: 0, behavior: 'smooth' })
}

const goToPage = (page: number) => {
  currentPage.value = page
  scrollToTop()
}
const prevPage = () => {
  if (currentPage.value > 1) { currentPage.value--; scrollToTop() }
}
const nextPage = () => {
  if (currentPage.value < totalPages.value) { currentPage.value++; scrollToTop() }
}
const goToArticle = (id: number) => {
  router.push(`/article/${id}`)
}

// ========= 滚动触发的弹跳动画逻辑 =========
const animatedIds = ref(new Set<number>())  // 已触发过动画的文章 ID
let observer: IntersectionObserver | null = null

// 当文章列表变化时，重置动画状态并重新观察卡片
watch(filteredArticles, async () => {
  animatedIds.value.clear()
  await nextTick()
  if (!articlesContainerRef.value) return

  // 断开旧的观察器
  observer?.disconnect()

  observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const card = entry.target as HTMLElement
          const id = Number(card.dataset.articleId)
          if (id && !animatedIds.value.has(id)) {
            animatedIds.value.add(id)
            observer?.unobserve(card)  // 只触发一次，向上滚动不再重复
          }
        }
      })
    },
    {
      threshold: 0.1, // 卡片 10% 进入视口即触发
    }
  )

  // 观察当前所有卡片
  const cards = articlesContainerRef.value.querySelectorAll('.card')
  cards.forEach(card => observer!.observe(card))
}, { immediate: true })

onBeforeRouteLeave((to, from, next) => {
  if (scrollRef.value) globalSavedScroll = scrollRef.value.scrollTop
  next()
})

onMounted(async () => {
  await nextTick()
  // 恢复滚动位置（如果之前有保存）
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
        
     <PageHeader
  v-if="currentPage === 1"
  :total-count="filteredArticles.length"
  :articles="allArticles"
/>

        <div class="content-full">
          <div class="animate__animated animate__fadeInUp" style="animation-delay: 1.40s">
  <SearchRecentCard v-model="searchKeyword" class="search-card" />
</div>
          <div 
            ref="articlesContainerRef"
            class="articles-container"
          >
            <div
              v-for="(article, index) in paginatedArticles"
              :key="article.id"
              :class="[
                'card',
                index % 2 === 0 ? 'horizontal' : 'reverse-horizontal',
                { 'animate__animated animate__bounceIn fast-enter': animatedIds.has(article.id) }
              ]"
              :data-article-id="article.id"
              @click="goToArticle(article.id)"
            >
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

          <div class="pagination" v-if="totalPages > 1">
            <button class="page-btn" :disabled="currentPage === 1" @click="prevPage">上一页</button>
            <div class="page-numbers">
              <button
                v-for="page in totalPages"
                :key="page"
                :class="['page-num-btn', { active: currentPage === page }]"
                @click="goToPage(page)"
              >
                {{ page }}
              </button>
            </div>
            <button class="page-btn" :disabled="currentPage === totalPages" @click="nextPage">下一页</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ========= 全局布局 ========= */
.app-page-wrapper {
  position: relative; width: 100%; height: 100vh; height: 100dvh;
  overflow: hidden; background-color:#f0f0f0;
  background-image:
radial-gradient(
rgba(120,90,60,.03) 1px,
transparent 1px
);
}

.scrollable-content {
  position: relative; z-index: 2; height: 100vh; height: 100dvh;
  overflow-y: auto; -webkit-overflow-scrolling: touch;
  background: rgba(255, 255, 255, 0.08); backdrop-filter: blur(20px) saturate(180%);
}

.main-body {
  padding: 80px 5% 60px 5%; box-sizing: border-box;
  max-width: 1400px; margin: 0 auto;
}

/* ========= 全宽内容区 ========= */
.content-full { max-width: 900px; margin: 0 auto; display: flex; flex-direction: column; gap: 20px; }
.search-card { width: 100%; height: auto; }

/* ========= 文章列表容器及卡片样式 ========= */
.articles-container { 
  display: flex; flex-direction: column; gap: 20px; 
  font-family: 'Microsoft YaHei', 'PingFang SC', 'Heiti SC', sans-serif; font-weight: 700; 
}

.fast-enter {
  animation-duration: 0.6s !important;
}

.articles-container .card { 
  height: 250px; display: flex; border: 1px solid rgba(255, 255, 255, 0.1); 
  background: rgba(255, 255, 255, 0.9); border-radius: 12px; overflow: hidden; 
  transition: transform 0.25s ease, box-shadow 0.25s ease; cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12), 0 4px 16px rgba(0, 0, 0, 0.08); 
}
.articles-container .card:hover { transform: scale(1.02); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3); }
.card.horizontal { flex-direction: row; }
.card.reverse-horizontal { flex-direction: row-reverse; }
.card.horizontal .card__img, .card.reverse-horizontal .card__img { width: 40%; height: 100%; object-fit: cover; }
.placeholder-img { width: 40%; background: #eee; display: flex; align-items: center; justify-content: center; color: #999; }
.card.horizontal .card__content, .card.reverse-horizontal .card__content { width: 60%; display: flex; flex-direction: column; padding: 16px; box-sizing: border-box; }
.card__title { font-size: 16px; font-weight: 700; margin-bottom: 6px; color: #1a1a1a; }
.card__date { font-size: 11px; color: #666; margin-bottom: 8px; }
.card__excerpt { font-size: 13px; color: #444; line-height: 1.4; margin-bottom: 8px; display: -webkit-box; -webkit-line-clamp: 2; line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.card__tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: auto; align-self: flex-start; }
.tag { background: #fff; color: #000; padding: 2px 10px; border-radius: 45px; font-size: 11px; font-weight: 600; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.08); }

.pagination { display: flex; justify-content: center; align-items: center; gap: 12px; padding: 10px 0; }
.page-btn { padding: 6px 14px; border: none; background-color: #fff; color: #333; border-radius: 20px; cursor: pointer; font-weight: bold; transition: all 0.3s; }
.page-btn:hover:not(:disabled) { background-color: #23c483; color: #fff; }
.page-btn:disabled { background-color: rgba(255, 255, 255, 0.3); color: #999; cursor: not-allowed; }
.page-numbers { display: flex; gap: 6px; }
.page-num-btn { width: 30px; height: 30px; border-radius: 50%; border: none; background: #fff; cursor: pointer; font-weight: bold; }
.page-num-btn.active { background-color: #23c483; color: white; }

.scrollable-content {
  overflow-x: hidden; 
  overflow-y: auto;  

}
.scrollable-content::-webkit-scrollbar:vertical {
  width: 0.5rem;
}
.scrollable-content::-webkit-scrollbar-track:vertical {
  background-color: brown;
}
.scrollable-content::-webkit-scrollbar-thumb:vertical {
  background-color: oklch(15% 0 0);
}

@media (max-width: 768px) {
  .main-body { padding: 80px 5% 40px 5%; }
  .articles-container .card { height: auto; }
  .card.horizontal, .card.reverse-horizontal { flex-direction: column !important; }
  .card.horizontal .card__img, .card.reverse-horizontal .card__img { width: 100%; height: 160px; }
  .card.horizontal .card__content, .card.reverse-horizontal .card__content { width: 100%; padding: 16px; }
  .page-numbers { display: none; }
}
</style>