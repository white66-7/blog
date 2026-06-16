<script setup lang="ts">
const props = defineProps<{
  articles: Array<{
    id: number
    title: string
    type: string          // 保留字段，只是不展示
    date: string
    readTime: string      // 保留字段，只是不展示
    excerpt: string
    tags: string[]
    cover: string
    layout: string
  }>
}>()

import { useRouter } from 'vue-router'
const router = useRouter()
const goToArticle = (id: number) => {
  router.push(`/article/${id}`)
}
</script>

<template>
  <div class="articles-section">
    <div class="articles-grid">
      <div
        v-for="article in props.articles"
        :key="article.id"
        :class="['card', article.layout || 'vertical']"
        @click="goToArticle(article.id)"
      >
        <img :src="article.cover" class="card__img" />
        <div class="card__content">
          <!-- 已移除 type 展示 -->
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
    </div>
  </div>
</template>

<style scoped>
.articles-section {
  margin-top: 20px;
  font-family: 'Microsoft YaHei', 'PingFang SC', 'Heiti SC', sans-serif;
  font-weight: 700; /* 或 bold */
}

.articles-grid {
  display: grid;
  grid-auto-flow: row dense;
  grid-template-columns: repeat(3, 256px);
  grid-auto-rows: 196px;
  gap: 16px;
  justify-content: start;
}

.card {
  display: flex;
  height: 100%;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  cursor: pointer;
}
.card:hover {
  transform: scale(1.02);
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
}

/* 纵向卡片 */
/* 纵向卡片 */
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

/* 横向卡片 */
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

/* 反向横向卡片 */
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
  box-sizing: border-box;
}
.card.reverse-horizontal .card__tags {
  margin-top: auto;     
  align-self: flex-start; 
}
/* ====== 卡片内容区域 ====== */
.card__content {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 标题样式（改为黑色） */
.card__title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 6px;
  line-height: 1.3;
  color: #1a1a1a;        /* 新增：深黑色 */
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
}

.card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: auto;
}

/* ====== 新标签样式 ====== */
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
</style>