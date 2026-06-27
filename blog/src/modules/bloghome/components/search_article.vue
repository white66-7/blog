<template>
  <div class="search-recent-card">
    <!-- 搜索框 -->
    <div class="search-box">
      <i class="fa fa-search search-icon"></i>
      <input
        type="text"
        v-model="searchQuery"
        placeholder="搜索文章..."
        class="search-input"
      />
      <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''">
        <i class="fa fa-times"></i>
      </button>
    </div>

    <!-- 结果列表 -->
    <div class="result-list">
      <div v-if="filteredArticles.length === 0" class="empty-tip">
        {{ searchQuery ? '没有找到匹配的文章' : '暂无文章' }}
      </div>
      <div
        v-for="article in filteredArticles"
        :key="article.id"
        class="article-item"
        @click="goToArticle(article.id)"
      >
        <div class="item-title">{{ article.title }}</div>
        <div class="item-meta">
          <span class="item-date">{{ article.date }}</span>
          <span class="item-type">{{ article.type || '未分类' }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { articles as allArticles } from '@/date/articles'

const router = useRouter()
const searchQuery = ref('')

// 按日期降序排列（最新的在前）
const sortedArticles = computed(() => {
  return [...allArticles].sort((a, b) => (a.date > b.date ? -1 : 1))
})

// 搜索结果：若有搜索词则过滤，否则返回最近三篇
const filteredArticles = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) {
    return sortedArticles.value.slice(0, 3) // 最近三篇
  }
  return sortedArticles.value.filter(article =>
    article.title.toLowerCase().includes(query) ||
    article.excerpt?.toLowerCase().includes(query) ||
    article.tags?.some(tag => tag.toLowerCase().includes(query))
  )
})

const goToArticle = (id: number) => {
  router.push(`/article/${id}`)
}
</script>

<style scoped>
/* 卡片样式 – 匹配现有毛玻璃设计 */
.search-recent-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 20px;
  width: 100%;
  max-width: 320px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s;
  color: #fff;
  font-family: 'Microsoft YaHei', 'PingFang SC', 'Heiti SC', sans-serif;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 40px;
  padding: 0 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: border-color 0.2s;
}
.search-box:focus-within {
  border-color: rgba(255, 255, 255, 0.3);
}

.search-icon {
  color: rgba(255, 255, 255, 0.4);
  font-size: 16px;
  margin-right: 8px;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: #fff;
  font-size: 14px;
  padding: 10px 0;
  font-family: inherit;
}
.search-input::placeholder {
  color: rgba(255, 255, 255, 0.3);
}

.clear-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.3);
  cursor: pointer;
  font-size: 14px;
  padding: 4px 6px;
}
.clear-btn:hover {
  color: #fff;
}

.result-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 360px;
  overflow-y: auto;
}

.result-list::-webkit-scrollbar {
  width: 4px;
}
.result-list::-webkit-scrollbar-track {
  background: transparent;
}
.result-list::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.article-item {
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.04);
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}
.article-item:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateX(4px);
}

.item-title {
  font-size: 15px;
  font-weight: 600;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}
.item-type {
  background: rgba(255, 255, 255, 0.08);
  padding: 0 8px;
  border-radius: 20px;
  color: rgba(255, 255, 255, 0.7);
}

.empty-tip {
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
  padding: 20px 0;
  font-size: 14px;
}
</style>