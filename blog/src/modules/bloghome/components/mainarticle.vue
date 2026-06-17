<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { articles as allArticles } from '@/date/articles'

// 引入你原有的顶部导航栏组件
import Navbar from '@/modules/bloghome/components/load.vue'

const router = useRouter()

// ===== 分页逻辑 =====
const currentPage = ref(1)
const pageSize = ref(6) // 根据需要调整每页显示的数量

const totalPages = computed(() => {
  return Math.ceil(allArticles.length / pageSize.value) || 1
})

const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return allArticles.slice(start, end)
})

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
}

const goToPage = (page: number) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

// 跳转文章详情
const goToArticle = (id: number) => {
  router.push(`/article/${id}`)
}
</script>

<template>
  <!-- 全局背景容器 -->
  <div class="app-page-wrapper">
    <!-- 导航栏 -->
    <Navbar :transparent="false" />

    <!-- 滚动内容区 -->
    <div class="scrollable-content">
      <div class="main-body">
        
        <!-- 页面标题 (SVG 图标 + 全部文章) -->
        <div class="page-header">
          <h1 class="title">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
              <path d="M0 0h24v24H0z" fill="none" />
              <path fill="currentColor" d="M7 9V7h14v2zm0 4v-2h14v2zm0 4v-2h14v2zM4 9q-.425 0-.712-.288T3 8t.288-.712T4 7t.713.288T5 8t-.288.713T4 9m0 4q-.425 0-.712-.288T3 12t.288-.712T4 11t.713.288T5 12t-.288.713T4 13m0 4q-.425 0-.712-.288T3 16t.288-.712T4 15t.713.288T5 16t-.288.713T4 17" />
            </svg>
            全部文章
          </h1>
        </div>

        <!-- 文章列表：使用 index 实现横排和反向横排交替 -->
        <div class="articles-container">
          <div 
            v-for="(article, index) in paginatedArticles" 
            :key="article.id" 
            :class="['card', index % 2 === 0 ? 'horizontal' : 'reverse-horizontal']"
            @click="goToArticle(article.id)"
          >
            <!-- 封面图 -->
            <img v-if="article.cover" :src="article.cover" class="card__img" />
            <div v-else class="card__img placeholder-img">暂无封面</div>

            <!-- 内容区 -->
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

        <!-- 底部分页栏 -->
        <div class="pagination" v-if="totalPages > 1">
          <button class="page-btn" :disabled="currentPage === 1" @click="prevPage">
            上一页
          </button>
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
          <button class="page-btn" :disabled="currentPage === totalPages" @click="nextPage">
            下一页
          </button>
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
/* ========= 全局背景保持与首页统一 ========= */
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
  top: 0; left: 0; width: 100%; height: 100%;
  background-image: url('@/assets/木叶创立.webp');
  background-size: cover;
  background-position: center;
  z-index: 0;
}
.app-page-wrapper::after {
  content: '';
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1;
}

/* ========= 滚动内容区 ========= */
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
  padding: 80px 5% 60px 270px;
  box-sizing: border-box;
  max-width: 1400px;
  margin: 0 auto;
}

/* ========= 页面头部 ========= */
.page-header {
  margin-bottom: 30px;
  color: #fff;
}
.page-header .title {
  font-size: 28px;
  margin: 0;
  display: flex; /* 让图标和文字完美对齐 */
  align-items: center;
  gap: 10px;     /* 图标和文字的间距 */
}

/* ========= 文章列表容器 ========= */
.articles-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  font-family: 'Microsoft YaHei', 'PingFang SC', 'Heiti SC', sans-serif;
  font-weight: 700;
  max-width: 1000px;
}

/* ========= 卡片基础样式 ========= */
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
  box-shadow: 0 8px 24px rgba(0,0,0,0.3);
}

/* 横排 (左图右文) */
.card.horizontal {
  flex-direction: row;
}

/* 反向横排 (右图左文) */
.card.reverse-horizontal {
  flex-direction: row-reverse;
}

/* 图片和内容的通用比例：图占40%，文占60% */
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
  padding: 20px;
  box-sizing: border-box;
}

/* ========= 卡片文字部分样式 ========= */
.card__title {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 8px;
  color: #1a1a1a;
}
.card__date {
  font-size: 12px;
  color: #666;
  margin-bottom: 12px;
}
.card__excerpt {
  font-size: 14px;
  color: #444;
  line-height: 1.5;
  margin-bottom: 12px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: auto;
  align-self: flex-start;
}
.tag {
  background: #fff;
  color: #000;
  padding: 4px 12px;
  border-radius: 45px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.08);
}

/* ========= 分页栏样式 ========= */
.pagination {
  max-width: 1000px;
  margin-top: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
}
.page-btn {
  padding: 8px 16px;
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
.page-numbers { display: flex; gap: 8px; }
.page-num-btn {
  width: 32px; height: 32px;
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
  .card { height: auto; }
  
  /* 移动端强制上下排列 */
  .card.horizontal,
  .card.reverse-horizontal {
    flex-direction: column !important;
  }
  .card.horizontal .card__img,
  .card.reverse-horizontal .card__img {
    width: 100%;
    height: 180px;
  }
  .card.horizontal .card__content,
  .card.reverse-horizontal .card__content {
    width: 100%;
    padding: 16px;
  }
  .page-numbers { display: none; }
}
</style>