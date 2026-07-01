<template>
  <div class="page-header">
    <!-- 左侧：独立标题组件 -->
    <div class="header-left">
      <h1 class="case-title">
        <span class="r r1">一</span>
        <span class="r r2">路</span>
        <span class="r r3">向</span>
        <span class="r r4">北</span>
        <span class="r r5">的</span>
        <span class="r r6">杂</span>
        <span class="r r7">谈</span>
        <span class="r-sub">对于真正的学习,要抱有敬畏之心</span>
      </h1>
    </div>
    
    <!-- 右侧：饼图及简介卡片（保持不变） -->
    <div class="header-right">
      <div class="card chart-card">
        <div class="chart-box">
          <DonutChart :articles="articles" @category-click="handleCategoryClick" />
        </div>
        <div class="info-box">
          <transition name="info-fade" mode="out-in">
            <div class="info-content" :key="activeCategory">
              <div class="info-header">
                <i class="fa fa-tag"></i> {{ activeCategory }}
              </div>
              <p class="info-desc">{{ currentCategoryDesc }}</p>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import DonutChart from './DonutChart.vue' 

const props = defineProps<{
  totalCount: number
  articles: any[]  
}>()

const activeCategory = ref('前端') 

const categoryDescriptions: Record<string, string> = {
  '前端': '前端三件套与vue技术栈下的一些文章,主要记录一下复用性高的组件和一些自以为的技巧',
  '动漫': '基本就是记录一下喜欢的动漫作品',
  '大学': '记录大学发生的一些印象深刻的事情',
  '反思': '对做的事情或是代码做复盘与反思'
}

const currentCategoryDesc = computed(() => {
  return categoryDescriptions[activeCategory.value] || '暂无该分类的详细介绍。'
})

const handleCategoryClick = (label: string) => {
  activeCategory.value = label
}
</script>

<style scoped>
/* ===== 独立标题组件样式（适配左侧空间） ===== */
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@600;900&display=swap');

.case-title {
  font-family: "Noto Serif SC", serif;
  line-height: 1.2;
  color: #1a1410;
  margin: 0;
  /* 适配左侧宽度：允许换行，左对齐 */
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.1em 0.2em;
}
.case-title .r {
  display: inline-block;
  background: #f4ecd8;
  color: #111;
  padding: 0 0.09em;
  /* 减小字号以适配较窄的左侧区域 */
  font-size: clamp(1.8rem, 4.5vw, 3.2rem);
  font-weight: 900;
  box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.3);
  white-space: nowrap;
}
.r1 { transform: rotate(-5deg); }
.r2 { transform: rotate(3deg); background: #111; color: #f4ecd8; }
.r3 { transform: rotate(-2deg); }
.r4 { transform: rotate(4deg); }
.r5 { transform: rotate(-3deg); background: #a01818; color: #fff; }
.r6 { transform: rotate(2deg); }
.r7 { transform: rotate(-4deg); }
.r-sub {
  display: block;
  width: 100%;          /* 强制独占一行 */
  font-family: "Noto Serif SC", serif;
  font-size: clamp(0.75rem, 1.8vw, 1rem);
  color: #3d2710;
  letter-spacing: 0.15em;
  margin-top: 0.4rem;
  font-weight: 600;
  opacity: 0.9;
}

/* ===== 原有布局样式（调整间距） ===== */
.page-header {
  display: flex;
  justify-content: flex-start; 
  align-items: flex-start;
  max-width: 950px;
  margin: 0 auto 30px;
  color: #fff;
  gap: 50px; /* 缩小间隙，让左侧有更多空间 */
}
.header-left {
  flex: 1;
  /* 让标题自动占满，且垂直居中 */
  display: flex;
  align-items: center;
  min-height: 120px;   /* 保持与右侧卡片高度协调 */
}
.header-right { flex-shrink: 0; }

/* 卡片样式（未变动） */
.chart-card {
  width: 540px; 
  min-height: 250px;
  padding: 16px;
  background: rgba(240, 240, 240, 0.85); 
  border: 1px solid white;
  box-shadow: 12px 17px 51px rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(12px);
  border-radius: 17px;
  display: flex;
  flex-direction: row;
  align-items: center;
  overflow: hidden;
  transition: box-shadow 0.3s ease, border 0.3s ease;
}
.chart-card:hover {
  border: 1px solid black;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
}
.chart-box {
  width: 218px; 
  height: 218px;
  flex-shrink: 0; 
  display: flex;
  align-items: center;
  justify-content: center;
}
.info-box {
  flex: 1;
  padding-left: 20px;
  margin-left: 16px;
  border-left: 1px solid rgba(0, 0, 0, 0.15); 
  display: flex;
  flex-direction: column;
  justify-content: center;
  font-family: "Microsoft YaHei", "PingFang SC", sans-serif;
  color: #1a1a1a;
  min-height: 120px; 
}
.info-content {
  display: flex;
  flex-direction: column;
}
.info-header {
  font-size: 18px; font-weight: bold; color: #23c483;
  margin-bottom: 12px; display: flex; align-items: center; gap: 8px;
}
.info-desc {
  font-size: 14px; line-height: 1.6; color: #333; margin: 0;
}
.info-fade-enter-active,
.info-fade-leave-active {
  transition: all 0.3s ease;
}
.info-fade-enter-from { opacity: 0; transform: translateY(10px); }
.info-fade-leave-to { opacity: 0; transform: translateY(-10px); }

/* 移动端适配 */
@media (max-width: 1024px) {
  .page-header { flex-direction: column; align-items: stretch; gap: 20px; }
}
@media (max-width: 768px) {
  .chart-card {
    width: 100% !important;
    max-width: 400px;
    margin: 0 auto;
    flex-direction: column;
    min-height: auto;
  }
  .chart-box { width: 200px; height: 200px; }
  .info-box {
    width: 100%; padding-left: 0; margin-left: 0; margin-top: 16px;
    padding-top: 16px; border-left: none; border-top: 1px solid rgba(0, 0, 0, 0.15); 
    align-items: center; text-align: center;
  }
  .header-left { min-height: auto; }
  .case-title .r { font-size: clamp(1.6rem, 6vw, 2.4rem); } /* 移动端再缩小 */
}
</style>