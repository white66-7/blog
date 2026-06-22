<template>
  <div class="projects-page">
    <Navbar :transparent="isFirstScreen" />
    
    <div class="scrollable-content">
      <!-- 1. GitHub 贡献图区域 -->
      <section class="calendar-section">
        <div class="card-glass">
          <div id="github-calendar" class="calendar">
            <div class="loading-text">正在对接white66-7的仓库</div>
          </div>
        </div>
      </section>
    </div>

  </div>
</template>

<script setup>
import { onMounted, nextTick } from 'vue'
import GitHubCalendar from 'github-calendar'
import Navbar from '@/modules/bloghome/components/load.vue'

const GITHUB_USERNAME = 'white66-7' 

onMounted(() => {
  nextTick(() => {
    GitHubCalendar("#github-calendar", GITHUB_USERNAME, {
      responsive: true,
      tooltips: true,
      summary_text: '检测到过去一年的代码活动'
    }).catch(err => {
      document.querySelector('.loading-text').innerText = '信号拦截失败，请检查网络'
    })
  })
})
</script>

<style>
/* 引入官方基础样式适配 */
@import "github-calendar/dist/github-calendar-responsive.css";
.projects-page {
  position: relative;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  background-color: #000;
}

.projects-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('@/assets/木叶创立.webp');
  background-size: cover;
  background-position: center;
  z-index: 0;
}

.projects-page::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.45);
  z-index: 1;
}

/* ==================== 2. 全屏玻璃罩 + 独立滚动区 ==================== */
.scrollable-content {
  position: relative;
  z-index: 2; 
  height: 100vh;
  height: 100dvh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px) saturate(180%);
  -webkit-backdrop-filter: blur(20px) saturate(180%); 
}

/* ==================== 3. 贡献图容器样式 ==================== */
.calendar-section {
  max-width: 900px;
  margin: 0 auto;
  padding: 100px 20px 40px; 
}
.card-glass {
  background: #e0e0e0; /* 新拟态特有的灰底色 */
  border-radius: 30px; /* 大圆角 */
  padding: 30px 24px; /* 增加一点内边距让内容呼吸 */
  /* 双重阴影：右下角深色阴影，左上角纯白高光 */
  box-shadow: inset 5px 5px 10px #bebebe,
              inset -5px -5px 10px #ffffff;
  color: #24292f !important;
  border: none; /* 去掉之前的边框 */
  transition: all 0.3s ease; /* 加个平滑过渡 */
}
/* ==================== 4. GitHub Calendar 组件覆盖样式 ==================== */
.calendar,
#github-calendar {
  min-height: auto !important;
  border: none !important; 
}

#github-calendar .border.py-2.graph-before-activity-overview {
  margin-bottom: 0 !important;
  border: none !important; 
  padding-bottom: 5px !important; 
}

/* 修复绿墙格子颜色 */
#github-calendar .ContributionCalendar-day[data-level="0"] { 
  fill: #ebedf0 !important; 
  background-color: #ebedf0 !important; 
  outline: 1px solid rgba(27, 31, 35, 0.06) !important; 
}
#github-calendar .ContributionCalendar-day[data-level="1"] { 
  fill: #9be9a8 !important; 
  background-color: #9be9a8 !important; 
}
#github-calendar .ContributionCalendar-day[data-level="2"] { 
  fill: #40c463 !important; 
  background-color: #40c463 !important; 
}
#github-calendar .ContributionCalendar-day[data-level="3"] { 
  fill: #30a14e !important; 
  background-color: #30a14e !important; 
}
#github-calendar .ContributionCalendar-day[data-level="4"] { 
  fill: #216e39 !important; 
  background-color: #216e39 !important; 
}

/* 隐藏无关元素 */
#github-calendar a[href*="year-link"],
#github-calendar a.show-on-focus {
  display: none !important;
}
#github-calendar .contrib-column {
  display: none !important;
}
#github-calendar div:has(> .contrib-column),
#github-calendar .d-flex.flex-column.flex-md-row {
  display: none !important;
}
#github-calendar .contrib-footer,
#github-calendar .js-calendar-graph {
  border-bottom: none !important;
  padding-bottom: 0 !important;
  margin-bottom: 0 !important;
}

/* 修复文字颜色 */
#github-calendar svg text.ContributionCalendar-label {
  fill: #57606a !important; 
  font-weight: 500 !important;
}
#github-calendar .color-fg-muted,
#github-calendar .text-muted {
  color: #57606a !important;
  font-weight: 500 !important;
}
#github-calendar .sr-only {
  display: none !important;
}
/* ==================== 5. 移动端适配 ==================== */
@media (max-width: 768px) {
  .card-glass {
    padding: 16px;
    border-radius: 20px; 
    box-shadow: 8px 8px 16px #bebebe,
               -8px -8px 16px #ffffff;
  }
}
</style>