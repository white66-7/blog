<script lang="ts">
// 第一部分：记忆芯片
let globalSavedPage = 1
let globalSavedScroll = 0
</script>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRouter, onBeforeRouteLeave } from 'vue-router'
import { articles as allArticles } from '@/date/articles' 
import Navbar from '@/modules/bloghome/components/load.vue'

import * as d3 from 'd3'
import $ from 'jquery'
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

// 恢复原来的上一页 / 下一页方法
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

// ===== 核心：彻底修复 TypeScript 报错的颜色函数 =====
function ColorLuminance(hex: string | null | undefined, lum: number): string {
  let c = String(hex || "000000").replace(/[^0-9a-f]/gi, "");
  
  if (c.length < 6) {
    const r = c.charAt(0) || "0";
    const g = c.charAt(1) || "0";
    const b = c.charAt(2) || "0";
    c = r + r + g + g + b + b;
  }

  lum = lum || 0;
  let rgb = "#";
  
  for (let i = 0; i < 3; i++) {
    const sub = c.substring(i * 2, i * 2 + 2);
    let val = parseInt(sub, 16);
    val = Math.round(Math.min(Math.max(0, val + (val * lum)), 255));
    const finalHex = val.toString(16);
    rgb += ("00" + finalHex).slice(-2);
  }
  
  return rgb;
}

// ===== 滚动记忆与初始化 =====
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
    drawPieChart()
  }, 100)
})

// ===== 饼图绘制逻辑 =====
function drawPieChart() {
  const container = document.getElementById('pieChart')
  if (!container) return

  let width = container.clientWidth
  if (width <= 0) width = 350 
  
  const typeMap = new Map<string, { count: number; titles: string[] }>()
  allArticles.forEach(article => {
    const t = article.type || '未分类'
    if (!typeMap.has(t)) typeMap.set(t, { count: 0, titles: [] })
    const group = typeMap.get(t)!
    group.count++
    group.titles.push(article.title)
  })

  const data = Array.from(typeMap, ([type, group]) => ({
    Title: type,
    Amount: group.count,
    Description: group.titles.map(title => `<div class="pie-list-item"># ${title}</div>`).join('')
  }))

  container.innerHTML = ''
  const radius = (width - 20) / 2
  const innerRadius = 80 
  const total = allArticles.length

  const color = d3.scaleOrdinal<string>()
    .domain(data.map(d => d.Title))
    .range(['#2BDFBB', '#DF2B4F', '#EE6617', '#FFBF00', '#423E6E', '#E24161', '#9C27B0'])

  const arc = d3.arc().outerRadius(radius - 10).innerRadius(innerRadius)
  const arcOver = d3.arc().outerRadius(radius + 5).innerRadius(innerRadius)
  const labelArc = d3.arc().outerRadius((radius + innerRadius) / 2).innerRadius((radius + innerRadius) / 2)
  const pie = d3.pie<any>().sort(null).value(d => d.Amount)

  const svg = d3.select('#pieChart').append('svg')
    .attr('width', '100%')
    .attr('height', width)
    .attr('viewBox', `0 0 ${width} ${width}`)
    .append('g')
    .attr('transform', `translate(${width/2},${width/2})`)

  const updatePanel = (d: any) => {
    const percentage = Math.round((d.data.Amount / total) * 1000) / 10
    $('#segmentTitle').html(`${d.data.Title} - ${percentage}%`)
    $('#segmentText').html(d.data.Description)
    $('.pie-panel').css({
      'background-color': ColorLuminance(color(d.data.Title), -0.5),
      'border-color': color(d.data.Title)
    })
  }

  let prevSegment: any = null
  let buttonToggle = true

  const paths = svg.selectAll('path')
    .data(pie(data))
    .enter().append('path')
    .attr('d', arc as any)
    .style('fill', d => color(d.data.Title))
    .style('cursor', 'pointer')
    .on('click', function(this: any, event: any, d: any) {
      if (!buttonToggle) return
      buttonToggle = false
      setTimeout(() => { buttonToggle = true }, 1100)

      const sliceDirection = 90
      const angle = sliceDirection - ((d.startAngle * (180 / Math.PI)) + ((d.endAngle - d.startAngle) * (180 / Math.PI) / 2))
      svg.transition().duration(1000).attr('transform', `translate(${width/2},${width/2}) rotate(${angle})`)
      
      if (prevSegment) d3.select(prevSegment).transition().attr('d', arc as any)
      prevSegment = this
      d3.select(this).transition().duration(1000).attr('d', arcOver as any)

      const tl = gsap.timeline()
      tl.to('.pie-content-wrapper', { duration: 0.3, rotationX: 90, opacity: 0, onComplete: () => updatePanel(d) })
        .to('.pie-panel', { duration: 0.3, scale: 0.95, opacity: 0.8 })
        .to('.pie-panel', { duration: 0.3, scale: 1, opacity: 1, ease: 'back.out(1.7)' })
        .to('.pie-content-wrapper', { duration: 0.3, rotationX: 0, opacity: 1 })
    })

  svg.selectAll('.pie-label')
    .data(pie(data))
    .enter().append('text')
    .attr('dy', '.35em')
    .style('text-anchor', 'middle')
    .style('fill', '#fff')
    .style('font-size', '12px')
    .style('pointer-events', 'none')
    .attr('transform', (d: any) => `translate(${labelArc.centroid(d)})`)
    .text(d => d.data.Amount > 0 ? d.data.Title : '')

  gsap.from('#pieChart', { duration: 0.8, rotation: -120, scale: 0, opacity: 0, ease: 'power2.out' })

  setTimeout(() => {
    const firstSlice = paths.filter((d, i) => i === 0)
    if (!firstSlice.empty()) {
      const d = firstSlice.datum()
      const angle = 90 - ((d.startAngle * (180 / Math.PI)) + ((d.endAngle - d.startAngle) * (180 / Math.PI) / 2))
      svg.attr('transform', `translate(${width/2},${width/2}) rotate(${angle})`)
      d3.select(firstSlice.node()).attr('d', arcOver as any)
      prevSegment = firstSlice.node()
      updatePanel(d)
    }
  }, 600)
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

        <!-- 饼图对齐区域（保持不变） -->
        <div class="pie-section-container">
          <div id="pieChart"></div>
          <div class="pie-text-panel">
            <div class="pie-panel">
              <div class="pie-content-wrapper">
                <h1 id="segmentTitle">档案同步中...</h1>
                <div id="segmentText">请选择扇区区块...</div>
              </div>
            </div>
          </div>
        </div>

        <!-- 文章卡片列表：已恢复为原来的样式 -->
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

        <!-- 分页按钮（恢复为 prevPage / nextPage） -->
        <div class="pagination" v-if="totalPages > 1">
          <button class="page-btn" :disabled="currentPage === 1" @click="prevPage">
            上一页
          </button>
          <div class="page-numbers">
            <button 
              v-for="page in totalPages" :key="page"
              :class="['page-num-btn', { active: currentPage === page }]"
              @click="goToPage(page)"
            >{{ page }}</button>
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
/* ========= 饼图区域样式（保持不变） ========= */
.pie-section-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 50px;
  margin-bottom: 50px;
  min-height: 400px;
}

#pieChart {
  flex: 1;
  max-width: 450px;
}

.pie-text-panel {
  flex: 1.2;
}

.pie-panel {
  background-color: #0c0c0c;
  border: solid 2px #2BDFBB;
  border-radius: 12px;
  padding: 30px;
  min-height: 250px;
  display: flex;
  align-items: center;
  perspective: 1000px;
  transition: all 0.5s ease;
}

.pie-content-wrapper { width: 100%; color: #fff; }
#segmentTitle { font-size: 24px; text-align: center; margin-bottom: 15px; border-bottom: 1px solid #333; padding-bottom: 10px; }
#segmentText { font-size: 15px; line-height: 1.8; max-height: 200px; overflow-y: auto; }

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

/* ========= 文章列表容器（已恢复原样式） ========= */
.articles-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  font-family: 'Microsoft YaHei', 'PingFang SC', 'Heiti SC', sans-serif;
  font-weight: 700;          /* 原全局粗体 */
  max-width: 1000px;
}

/* ========= 卡片基础样式（原高度 200px，原背景/边框/圆角/动效） ========= */
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
  padding: 20px;            /* 原内边距 */
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
  font-weight: 600;         /* 原标签粗细 */
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.08);
}

/* ========= 分页栏样式（恢复原粗体） ========= */
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
  .card.horizontal .card__content,
  .card.reverse-horizontal .card__content {
    width: 100%;
    padding: 16px;
  }
  .page-numbers { display: none; }
}
</style>