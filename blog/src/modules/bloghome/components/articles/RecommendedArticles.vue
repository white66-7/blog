<template>
  <div class="recommend-card">
    <div class="recommend-header">
      <span class="recommend-title">
        <svg xmlns="http://www.w3.org/2000/svg" width="1.3em" height="1.3em" viewBox="0 0 24 24">
          <path d="M0 0h24v24H0z" fill="none" />
          <path fill="currentColor" d="M4 21h1V8H4c-1.1 0-2 .9-2 2v9c0 1.1.9 2 2 2M20 8h-6.61l1.12-3.37c.2-.61.1-1.28-.27-1.8c-.38-.52-.98-.83-1.62-.83h-.61c-.3 0-.58.13-.77.36L7.01 7.44V21h10.31a2 2 0 0 0 1.87-1.3l2.76-7.35c.04-.11.06-.23.06-.35v-2c0-1.1-.9-2-2-2Z" />
        </svg>
        自信之作
      </span>
    </div>

    <ul class="recommend-list">
      <li
        v-for="article in articles"
        :key="article.id"
        class="recommend-item"
        @click="goToArticle(article.id)"
      >
        <div class="item-content">
          <span class="item-title">{{ article.title }}</span>
          <span class="item-date">{{ article.date }}</span>
        </div>
        <svg class="item-arrow" viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

interface Article {
  id: number
  title: string
  date?: string
}

defineProps<{ articles: Article[] }>()

const router = useRouter()
const goToArticle = (id: number) => {
  router.push(`/article/${id}`)
}
</script>

<style scoped>
/* ===== 外层卡片：与文章卡片一致的白色半透明背景，高度自适应 ===== */
.recommend-card {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(0);
  transition: all 0.5s;
  
  width: 100%;
  height: auto;
  
  text-align: left;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  
  padding: 16px;
  gap: 12px;
  cursor: default;
  box-sizing: border-box;
}

.recommend-card:hover {
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  transform: translateY(-2px);
}

/* ===== 标题区域 ===== */
.recommend-header {
  display: flex;
  align-items: center;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.12);
}

.recommend-title {
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
  display: flex;
  align-items: center;
  gap: 8px;                 /* 图标与文字间距 */
}

/* 适配 SVG 图标：加大尺寸、禁止压缩 */
.recommend-title svg {
  flex-shrink: 0;           /* 空间不足时也不缩小 */
  width: 1.3em;             /* 比文字稍大，更醒目 */
  height: 1.3em;
  color: inherit;           /* 跟随 .recommend-title 的文字颜色 */
}

/* ===== 列表 ===== */
.recommend-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.recommend-item {
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  backdrop-filter: blur(4px);
  cursor: pointer;
  transition: all 0.25s;
  user-select: none;
  font-weight: 500;
  color: #1a1a1a;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  font-size: 14px;
}

.recommend-item:hover {
  background: rgba(255, 255, 255, 0.95);
  transform: scale(1.01);
  border-color: rgba(0, 0, 0, 0.15);
}

.item-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  flex: 1;
}

.item-title {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 14px;
  color: #1a1a1a;
}

.item-date {
  font-size: 11px;
  color: #888;
}

.item-arrow {
  flex-shrink: 0;
  color: #888;
  margin-left: 8px;
}
</style>