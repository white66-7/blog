<script setup lang="ts">
import { ref, computed } from 'vue'
import DonutChart from './DonutChart.vue' 

// 接收主页面传来的数据
const props = defineProps<{
  totalCount: number
  articles: any[]  
}>()

// ===== 饼图卡片简介逻辑 =====
const activeCategory = ref('前端') 

// 【请在这里修改你的分类简介字典】
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

<template>
  <div class="page-header">
    <!-- 左侧：标题信息 -->
    <div class="header-left">
      <h1 class="title">全部文章</h1>
      <p class="subtitle">对学习还是要有一些敬畏之心</p>
      <div class="meta-info">
      </div>
    </div>
    
    <!-- 右侧：饼图及简介卡片 -->
    <div class="header-right">
      <div class="card chart-card">
        <!-- 饼图部分 -->
        <div class="chart-box">
          <DonutChart :articles="articles" @category-click="handleCategoryClick" />
        </div>
        
        <!-- 简介部分 -->
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

<style scoped>
/* 头部左右布局 */
.page-header {
  display: flex;
  justify-content: flex-start; 
  align-items: flex-start;
  max-width: 950px;
  margin: 0 auto 30px;
  color: #fff;
  gap: 80px; 
}
.header-left { flex: 1; }
.header-right { flex-shrink: 0; }

.page-header .title {
  font-size: 36px; font-weight: 700; margin: 0 0 8px 0;
  font-family: "Microsoft YaHei", "PingFang SC", sans-serif; letter-spacing: 1px;
}
.page-header .subtitle {
  font-size: 16px; font-weight: 400; color: rgba(255, 255, 255, 0.7);
  margin: 0 0 20px 0; font-family: "Microsoft YaHei", "PingFang SC", sans-serif;
}
.page-header .meta-info { display: flex; align-items: center; gap: 12px; }

.count-badge {
  display: inline-flex; align-items: center; padding: 6px 16px;
  background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 20px;
  font-size: 14px; font-weight: 500; color: rgba(255, 255, 255, 0.9);
}

/* 长方形卡片 */
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

/* 饼图容器 */
.chart-box {
  width: 218px; 
  height: 218px;
  flex-shrink: 0; 
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 文本简介容器 */
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

/* 动画 */
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
}
</style>