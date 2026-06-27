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
import SearchRecentCard from '@/modules/bloghome/components/search_article.vue'

import * as d3 from 'd3'
import gsap from 'gsap'

const router = useRouter()
const scrollRef = ref<HTMLElement | null>(null)

// ===== 分页逻辑 =====
const currentPage = ref(globalSavedPage) 
const pageSize = ref(6)

watch(currentPage, (newPage) => {
  globalSavedPage = newPage
})

const totalPages = computed(() => Math.ceil(allArticles.length / pageSize.value) || 1)

const paginatedArticles = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return allArticles.slice(start, start + pageSize.value)
})

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
  setTimeout(() => {
    drawDonutChart()
  }, 100)
})

function drawDonutChart() {
  const container = d3.select('#donut-chart');
  if (container.empty()) return;
  container.html('');

  const width = (container.node() as HTMLElement).clientWidth || 400;
  const height = width;
  const radius = Math.min(width, height) / 2;
  const innerRadius = radius * 0.35;
  const outerRadius = radius - 10;

  // 数据准备
  const typeMap = new Map<string, number>();
  allArticles.forEach(article => {
    const t = article.type || '未分类';
    typeMap.set(t, (typeMap.get(t) || 0) + 1);
  });
  const data = Array.from(typeMap, ([label, value]) => ({ label, value }));
  const total = allArticles.length;

  // 颜色方案
  const nvd3Colors = ['#965251', '#00b3ca', '#7dd0b6', '#e38690', '#ead98b'];
  const extraColors = ['#f39c12', '#8e44ad', '#2ecc71', '#e67e22', '#3498db'];
  const allColors = [...nvd3Colors, ...extraColors];
  const colorScale = d3.scaleOrdinal<string>()
    .domain(data.map(d => d.label))
    .range(allColors.slice(0, data.length));

  const svg = container
    .append('svg')
    .attr('width', '100%')
    .attr('height', width)
    .attr('viewBox', `0 0 ${width} ${height}`)
    .append('g')
    .attr('transform', `translate(${width / 2},${height / 2})`);

  const pie = d3.pie<any>().value(d => d.value).sort(null);
  const arc = d3.arc<any>().innerRadius(innerRadius).outerRadius(outerRadius);
  const hoverArc = d3.arc<any>().innerRadius(innerRadius).outerRadius(outerRadius + 5);

  // ---- 绘制扇形并添加 hover 事件 ----
  svg.selectAll('path')
    .data(pie(data))
    .enter().append('path')
    .attr('d', arc)
    .attr('fill', (d: any) => colorScale(d.data.label))
    .attr('stroke', 'rgba(255,255,255,0.2)')   // 正常描边保留
    .attr('stroke-width', 1.5)
    .style('cursor', 'pointer')
    .on('mouseover', function(event, d: any) {
      const brighterColor = d3.color(colorScale(d.data.label))?.brighter(0.5)?.toString() || colorScale(d.data.label);
      d3.select(this)
        .transition()
        .duration(200)
        .attr('d', hoverArc(d))
        .attr('fill', brighterColor)
        // 删除了白色描边设置，保持和正常状态一致或不做更改
        // .attr('stroke', '#ffffff')  // 已删除
        // .attr('stroke-width', 3)    // 已删除
        ;
    })
    .on('mouseout', function(event, d: any) {
      d3.select(this)
        .transition()
        .duration(200)
        .attr('d', arc(d))
        .attr('fill', colorScale(d.data.label))
        .attr('stroke', 'rgba(255,255,255,0.2)')  // 恢复正常描边
        .attr('stroke-width', 1.5);
    });

  // ---- 内部标签：只显示分类名，不显示百分比 ----
  svg.selectAll('.label')
    .data(pie(data))
    .enter().append('text')
    .attr('transform', (d: any) => {
      const pos = arc.centroid(d);
      return `translate(${pos[0]}, ${pos[1]})`;
    })
    .attr('text-anchor', 'middle')
    .attr('dy', '0.35em')
    .style('fill', '#fff')
    .style('font-size', '14px')
    .style('font-weight', '500')
    .style('font-family', 'Microsoft YaHei, PingFang SC, Heiti SC, sans-serif')
    .style('text-shadow', '0 1px 4px rgba(0,0,0,0.6)')
    .text((d: any) => d.data.label);   // 只显示分类名，不再拼接百分比

  // ---- 中心文字（固定不变） ----
  svg.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '-.35em')
    .style('fill', '#fff')
    .style('font-size', '22px')
    .style('font-weight', '300')
    .style('font-family', 'Microsoft YaHei, PingFang SC, Heiti SC, sans-serif')
    .text('文章分类');

  svg.append('text')
    .attr('text-anchor', 'middle')
    .attr('dy', '1.2em')
    .style('fill', '#aaa')
    .style('font-size', '16px')
    .style('font-family', 'Microsoft YaHei, PingFang SC, Heiti SC, sans-serif')
    .text(`${total} 篇`);

  // GSAP 动画
  gsap.from('#donut-chart svg', {
    duration: 0.8,
    rotation: -120,
    scale: 0,
    opacity: 0,
    ease: 'power2.out'
  });
}
</script>

<template>
  <div class="app-page-wrapper">
    <Navbar :transparent="false" />
    <div class="scrollable-content" ref="scrollRef">
      <div class="main-body">
        <div class="page-header">
          <h1 class="title">
            <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
              <path d="M0 0h24v24H0z" fill="none" />
              <path fill="currentColor" d="M7 9V7h14v2zm0 4v-2h14v2zm0 4v-2h14v2zM4 9q-.425 0-.712-.288T3 8t.288-.712T4 7t.713.288T5 8t-.288.713T4 9m0 4q-.425 0-.712-.288T3 12t.288-.712T4 11t.713.288T5 12t-.288.713T4 13m0 4q-.425 0-.712-.288T3 16t.288-.712T4 15t.713.288T5 16t-.288.713T4 17" />
            </svg>
            全部文章
          </h1>
        </div>

        <!-- 甜甜圈图（居中，无右侧面板） -->
        <div class="pie-section-container">
          <div id="donut-chart" class="donut-chart-container"></div>
          <SearchRecentCard class="search-card" />
        </div>

        <!-- 文章卡片列表 -->
        <div class="articles-container">
          <div 
            v-for="(article, index) in paginatedArticles" 
            :key="article.id" 
            :class="['card', index % 2 === 0 ? 'horizontal' : 'reverse-horizontal']"
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

        <!-- 分页 -->
        <div class="pagination" v-if="totalPages > 1">
          <button class="page-btn" :disabled="currentPage === 1" @click="prevPage">上一页</button>
          <div class="page-numbers">
            <button 
              v-for="page in totalPages" :key="page"
              :class="['page-num-btn', { active: currentPage === page }]"
              @click="goToPage(page)"
            >{{ page }}</button>
          </div>
          <button class="page-btn" :disabled="currentPage === totalPages" @click="nextPage">下一页</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 不再引入 nvd3 的 CSS */

/* ========= 甜甜圈图容器（居中） ========= */
.pie-section-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 50px;
  min-height: 400px;
  max-width: 1000px;
}
.donut-chart-container {
  width: 100%;
  max-width: 450px;
}
.donut-chart-container svg {
  width: 100%;
  height: auto;
}

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
  display: flex;
  align-items: center;
  gap: 10px;
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

/* 横排 */
.card.horizontal {
  flex-direction: row;
}
/* 反向横排 */
.card.reverse-horizontal {
  flex-direction: row-reverse;
}

/* 图片和内容的通用比例 */
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
  line-clamp: 3;
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
  .card.horizontal,
  .card.reverse-horizontal {
    flex-direction: column !important;
  }
  .card.horizontal .card__img,
  .card.reverse-horizontal .card__img {
    width: 100%;
    height: 180px;
  }
  .pie-section-container {
    max-width: 100%;
    flex-direction: column;
  }
  .donut-chart-container {
    max-width: 100%;
  }
  .card.horizontal .card__content,
  .card.reverse-horizontal .card__content {
    width: 100%;
    padding: 16px;
  }
  .page-numbers { display: none; }
}
</style>