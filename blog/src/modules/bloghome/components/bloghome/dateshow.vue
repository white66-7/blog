<template>
  <div class="site-age-box">
    <!-- 星空背景层 -->
    <div class="stars-container">
      <div class="stars"></div>
    </div>
    <!-- 发光光晕 -->
    <div class="glow">
      <div class="circle"></div>
      <div class="circle"></div>
    </div>
    <!-- 文字内容 -->
    <span class="text" v-for="(char, index) in chars" :key="index"
      :style="{ animationDelay: `${index * 0.08}s` }"
    >{{ char }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const launchDate = new Date('2026-06-14') // 网站上线日期，请按实际情况修改
const days = computed(() => {
  const now = new Date()
  const diffTime = now.getTime() - launchDate.getTime()
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
})

const text = computed(() => `该网站已存在 ${days.value} 天`)
const chars = computed(() => text.value.split(''))
</script>

<style scoped>
.site-age-box {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin: 25px auto 10px 0; 
  padding: 0 1.5rem;
  height: 6rem;
  width: fit-content;           /* 宽度自适应文字 */
  min-width: 50rem;             /* 保留一个最小宽度，保持美观 */
  border-radius: 5rem;
  background-image: linear-gradient(#212121, #212121),
    linear-gradient(
      137.48deg,
      #ffdb3b 10%,
      #fe53bb 45%,
      #8f51ea 67%,
      #0044ff 87%
    );
  background-origin: border-box;
  background-clip: padding-box, border-box;
  border: double 4px transparent;
  overflow: hidden;
  cursor: default;
  backdrop-filter: blur(1rem);
  animation: gradient_301 5s ease infinite;
  transition: transform 0.3s ease;
}

/* 文字样式 */
.text {
  z-index: 2;
  font-family: 'Microsoft YaHei', 'SimHei', sans-serif;
  font-size: 40px;
  font-weight: 600;
  letter-spacing: 1px;
  color: #ffffff;
  text-shadow: 0 0 4px white;
  white-space: pre;  /* 保留空格 */
}

/* 星空背景容器 */
.stars-container {
  position: absolute;
  z-index: -1;
  width: 100%;
  height: 100%;
  overflow: hidden;
  backdrop-filter: blur(1rem);
  border-radius: 5rem;
  transition: 0.5s;
}

.site-age-box:hover .stars-container {
  z-index: 1;
  background-color: #212121;
}

/* 星空粒子动画 */
.stars {
  position: relative;
  background: transparent;
  width: 200rem;
  height: 200rem;
}
.stars::after {
  content: "";
  position: absolute;
  top: -10rem;
  left: -100rem;
  width: 100%;
  height: 100%;
  animation: animStarRotate 90s linear infinite;
  background-image: radial-gradient(#ffffff 1px, transparent 1%);
  background-size: 50px 50px;
}
.stars::before {
  content: "";
  position: absolute;
  top: 0;
  left: -50%;
  width: 170%;
  height: 500%;
  animation: animStar 60s linear infinite;
  background-image: radial-gradient(#ffffff 1px, transparent 1%);
  background-size: 50px 50px;
  opacity: 0.5;
}

/* 光晕效果 */
.glow {
  position: absolute;
  display: flex;
  width: 12rem;
}
.circle {
  width: 100%;
  height: 30px;
  filter: blur(2rem);
  animation: pulse_3011 4s infinite;
  z-index: -1;
}
.circle:nth-of-type(1) {
  background: rgba(254, 83, 186, 0.636);
}
.circle:nth-of-type(2) {
  background: rgba(142, 81, 234, 0.704);
}

/* 边框渐变移动 */
@keyframes gradient_301 {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* 脉冲 */
@keyframes pulse_3011 {
  0% {
    transform: scale(0.75);
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
  }
  100% {
    transform: scale(0.75);
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
  }
}

/* 星空移动 */
@keyframes animStar {
  from { transform: translateY(0); }
  to { transform: translateY(-135rem); }
}
@keyframes animStarRotate {
  from { transform: rotate(360deg); }
  to { transform: rotate(0); }
}
@media (max-width: 768px) {
  .site-age-box {
    min-width: unset;                /* 移除桌面端 50rem 限制 */
    max-width: 92vw;                 /* 宽度自适应屏幕，保留少许边距 */
    height: auto;                    /* 高度随内容变化 */
    padding: 0.6rem 1rem;            /* 减小内边距 */
    margin: 20px auto 10px;          /* 移动端居中显示更佳，也可保留原左对齐 */
    border-radius: 3rem;             /* 圆角适当减小 */
  }

  .text {
    font-size: 22px;                 /* 缩小字体，保证在 375px 宽度下正常显示 */
    letter-spacing: 0.5px;
    white-space: pre-wrap;           /* 允许文字换行，避免溢出 */
    line-height: 1.3;
  }

  /* 星空粒子缩小尺寸，减少渲染开销 */
  .stars {
    width: 100rem;
    height: 100rem;
  }
  .stars::after,
  .stars::before {
    background-size: 30px 30px;
  }
  .stars::after {
    top: -5rem;
    left: -50rem;
  }
  .stars::before {
    left: -25%;
    width: 150%;
    height: 300%;
  }

  /* 光晕缩小 */
  .glow {
    width: 8rem;
  }
  .circle {
    height: 20px;
  }
}
</style>