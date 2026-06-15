<script setup lang="ts">
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
          <div class="card__type">{{ article.type }}</div>
          <div class="card__title">{{ article.title }}</div>
          <div class="card__date">{{ article.date }} · {{ article.readTime }}</div>
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
}
/* 如果不再需要 section-title 的样式，可以保留或删除，此处保留备用 */
.section-title {
  display: none; /* 隐藏而非删除，以防其他依赖 */
}

/* ========= 网格布局（仿参考） ========= */
.articles-grid {
  display: grid;
  grid-auto-flow: row dense;
  grid-template-columns: repeat(3, 256px);
  grid-auto-rows: 196px;
  gap: 16px;
  justify-content: start;
}

/* 卡片基础样式 */
.card {
  display: flex;
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
  width: 50%;
  padding: 12px;
}

/* 卡片内容区域 */
.card__content {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.card__type {
  font-variant: small-caps;
  letter-spacing: 1px;
  font-size: 12px;
  color: #ff6b6b;
  margin-bottom: 4px;
}
.card__title {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 6px;
  line-height: 1.3;
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
.tag {
  background: #f0f0f0;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 11px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #555;
}

/* 移动端适配：宽度不足时改为普通流式布局 */
@media (max-width: 900px) {
  .articles-grid {
    grid-template-columns: 1fr;
    grid-auto-rows: auto;
    gap: 20px;
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
    padding: 16px;
  }
}
</style>