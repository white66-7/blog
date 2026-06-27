<template>
  <div class="card">
    <!-- 搜索框（新样式） -->
    <div class="group">
      <svg class="icon" aria-hidden="true" viewBox="0 0 24 24">
        <g>
          <path d="M21.53 20.47l-3.66-3.66C19.195 15.24 20 13.214 20 11c0-4.97-4.03-9-9-9s-9 4.03-9 9 4.03 9 9 9c2.215 0 4.24-.804 5.808-2.13l3.66 3.66c.147.146.34.22.53.22s.385-.073.53-.22c.295-.293.295-.767.002-1.06zM3.5 11c0-4.135 3.365-7.5 7.5-7.5s7.5 3.365 7.5 7.5-3.365 7.5-7.5 7.5-7.5-3.365-7.5-7.5z"/>
        </g>
      </svg>
      <input
        type="search"
        class="input"
        placeholder="Search"
        v-model="searchQuery"
      />
      <button v-if="searchQuery" class="clear-btn" @click="searchQuery = ''">✕</button>
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

// 按日期降序排列
const sortedArticles = computed(() => {
  return [...allArticles].sort((a, b) => (a.date > b.date ? -1 : 1))
})

// 搜索结果：搜索时过滤，否则显示最近三篇
const filteredArticles = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()
  if (!query) {
    return sortedArticles.value.slice(0, 3)
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
/* ======= 外壳：你提供的 .card 样式 ======= */
.card {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  min-height: 400px;
  background: rgba(217, 217, 217, 0.58);
  border: 1px solid white;
  box-shadow: 12px 17px 51px rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(6px);
  border-radius: 17px;
  text-align: center;
  cursor: pointer;
  transition: all 0.5s;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  user-select: none;
  font-weight: bolder;
  color: black;
  padding: 20px;
}

.card:hover {
  border: 1px solid black;
  transform: scale(1.05);
}

.card:active {
  transform: scale(0.95) rotateZ(1.7deg);
}

/* ======= 搜索框（你提供的新样式） ======= */
.group {
  display: flex;
  line-height: 28px;
  align-items: center;
  position: relative;
  width: 100%;               /* 改为100%，让输入框填满卡片宽度 */
  margin-bottom: 16px;
}

.input {
  height: 40px;
  line-height: 28px;
  padding: 0 1rem;
  width: 100%;
  padding-left: 2.5rem;
  border: 2px solid transparent;
  border-radius: 8px;
  outline: none;
  background-color: #D9E8D8;
  color: #0d0c22;
  box-shadow: 0 0 5px #C1D9BF, 0 0 0 10px #f5f5f5eb;
  transition: .3s ease;
  font-weight: 500;
}

.input::placeholder {
  color: #777;
}

.input:focus {
  border-color: #0d0c22;
  box-shadow: 0 0 8px #C1D9BF, 0 0 0 10px #f5f5f5eb;
}

.icon {
  position: absolute;
  left: 1rem;
  fill: #777;
  width: 1rem;
  height: 1rem;
  pointer-events: none;
}

/* ======= 清除按钮（仿照图标位置，置于右侧） ======= */
.clear-btn {
  position: absolute;
  right: 0.8rem;
  background: none;
  border: none;
  font-size: 18px;
  color: #777;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
  transition: color 0.2s;
}
.clear-btn:hover {
  color: #0d0c22;
}

/* ======= 文章列表 ======= */
.result-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-right: 4px;
  text-align: left;
}

.result-list::-webkit-scrollbar {
  width: 4px;
}
.result-list::-webkit-scrollbar-track {
  background: transparent;
}
.result-list::-webkit-scrollbar-thumb {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 4px;
}

.article-item {
  padding: 10px 14px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(4px);
  cursor: pointer;
  transition: background 0.2s, transform 0.15s;
}
.article-item:hover {
  background: rgba(255, 255, 255, 0.4);
  transform: translateX(4px);
}

.item-title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: #000;
}

.item-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);
  font-weight: 500;
}
.item-type {
  background: rgba(0, 0, 0, 0.08);
  padding: 0 10px;
  border-radius: 20px;
  color: rgba(0, 0, 0, 0.7);
}

.empty-tip {
  text-align: center;
  color: rgba(0, 0, 0, 0.4);
  padding: 30px 0;
  font-size: 14px;
  font-weight: 500;
}
</style>