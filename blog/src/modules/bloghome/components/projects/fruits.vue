<template>
  <div class="project-showcase">
    <div class="section-header">
      <h2 class="header-title">我的项目</h2>
    </div>
    <div class="project-list">
      <div 
        v-for="project in projects" 
        :key="project.id" 
        class="card-container"
      >
        <!-- 底部虚线边框 -->
        <div class="card-border"></div>
        
        <!-- 主卡片 -->
        <a :href="project.link" target="_blank" class="card">
          <!-- 背景图片：默认完全显示，悬浮时变透明 -->
          <div class="card-bg" :style="{ backgroundImage: `url(${project.poster})` }"></div>
          
          <!-- 默认显示的标题：悬浮时向上滑出并消失 -->
          <p class="title-main">{{ project.title }}</p>
          
          <!-- 悬浮滑入的详情内容 -->
          <div class="card-content-hover">
            <p class="title-detail">{{ project.title }}</p>
            <p class="description">{{ project.description }}</p>
          </div>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const projects = ref([
    {
    id: 1,
    title: '火影忍者',
    description: '一款基于C++开发,引入SFML与Box2d库的简陋小游戏  海报极其"照骗"',
    poster: '/project/game.webp',
    link: 'https://github.com/white66-7/Naruto-battle-game'
  },
  {
    id: 2,
    title: '博客',
    description: '基于 Vue3 前端框架下的个人博客系统',
    poster: '/project/blog.webp', 
    link: 'https://github.com/white66-7/blog'
  },

])
</script>

<style scoped>

.section-header {
  width: 860px;
  display: flex;
  justify-content: flex-start;
  margin-top: 20px;
  margin-bottom: -10px;    /* 与下方卡片的间距 */
  color: #232323;         /* 使用和你卡片一致的深色 */
}

.header-title {
  font-size: 3rem;
  font-family: 'ShangShouJiangHuShuFa';
  font-weight: normal;
  margin: 0;
  letter-spacing: -1px;   /* 紧凑的字间距更有现代感 */
}

/* --- 原有列表样式保持不变 --- */
.project-list {
  display: grid;
  grid-template-columns: repeat(2, 400px);
  gap: 60px;
  justify-content: center;
  padding: 10px 40px 40px; /* 顶部间距微调 */
}

/* 容器布局：一行两个，固定宽度 */
.project-list {
  display: grid;
  grid-template-columns: repeat(2, 400px); /* 强制一行两个 */
  gap: 60px; /* 增大间距，显得更大气 */
  justify-content: center;
  padding: 40px;
}

.card-container {
  position: relative;
  width: 400px;
  height: 225px; /* 16:9 比例 */
}

/* 底部虚线背景层 */
.card-border {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  border: 2px dashed #232323;
  border-radius: 12px;
  z-index: 1;
}

/* 主卡片主体 */
.card {
  position: relative;
  width: 100%;
  height: 100%;
  background: #fff; /* 悬浮时显现的背景底色 */
  border-radius: 12px;
  color: #232323;
  padding: 30px;
  border: 2px solid #232323;
  transition: all .4s cubic-bezier(0.175, 0.885, 0.32, 1.2);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end; /* 标题默认在底部 */
  text-decoration: none;
  z-index: 2;
}

/* 背景图逻辑：默认不透明，Hover时变透明(0.1) */
.card-bg {
  position: absolute;
  top: 0; 
  left: 0; 
  width: 100%; 
  height: 100%;
  background-size: cover;
  background-position: center;
  opacity: 1; /* 默认完全可见 */
  transition: opacity .4s ease;
  z-index: -1;
}

/* 默认标题：加了一个简单的阴影增强在图片上的可读性 */
.title-main {
  font-family: 'YouSheBiaoTiHei';
  font-size: 1.6rem;
  margin: 0;
  color: #fff;
  text-shadow: 0 2px 10px rgba(0,0,0,0.5); /* 防止浅色图片看不清字 */
  transition: all .4s ease;
}

/* 悬浮状态 */
.card:hover {
  transform: translate(-12px, -12px);
  border-color: #5bc0eb;
}

.card:hover .card-bg {
  opacity: 0.1; /* 悬浮时图片变淡，露出底下的文字 */
}

/* 解决你提到的标题冲突：Hover时原标题向上滑出并消失 */
.card:hover .title-main {
  transform: translateY(-50px);
  opacity: 0;
}

/* 详情内容区域 */
.card-content-hover {
  position: absolute;
  inset: 0;
  padding: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transform: translateY(100px); /* 默认在下方隐藏 */
  transition: all .4s ease;
  opacity: 0;
}

.card:hover .card-content-hover {
  transform: translateY(0);
  opacity: 1;
}

.title-detail {
  font-family: 'YouSheBiaoTiHei';
  font-size: 1.5rem;
  margin: 0 0 10px 0;
  color: #232323;
}

.description {
  font-size: 14px;
  color: #444;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  font-family: 'WenQuanWeiMiHei';
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>