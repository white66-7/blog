<!-- src/modules/bloghome/views/Home.vue -->
<template>
  <div class="home-page">
        <!-- 导航栏悬浮在顶部 -->
    <Navbar :transparent="false" class="page-navbar" />
    <!-- 顶部 3D 宇宙封面背景 -->
    <CosmicScene />
    <!-- 技术栈内容区 -->
    <div class="text animate__animated animate__fadeIn" style="animation-delay: 0.3s">
      <h1>我的技术栈</h1>
      <span class="sub-text">TECH STACK & SKILLS</span>
    </div>

    <div class="content-wrapper">
      <TechStackCard />
      <div class="skill-sections">
        <SkillGroup
          v-for="(group, index) in skillGroups"
          :key="group.title"
          :group="group"
          :index="index"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import Navbar from '@/modules/bloghome/components/load.vue'
import TechStackCard from '@/modules/bloghome/components/about/info.vue'
import SkillGroup from '@/modules/bloghome/components/about/skills.vue'
import CosmicScene from '@/modules/bloghome/components/about/CosmicScene.vue'

const skillGroups = [
  {
    title: '前端',
    items: ['Vue', 'JavaScript', 'Css', 'Html']
  },
  {
    title: '后端',
    items: ['Node.js', 'SpringBoot(学习中)']
  },
  {
    title: '数据库',
    items: ['MySQL(学习中)']
  },
  {
    title: '工具',
    items: ['Git', 'VS Code', 'IDEA']
  },
  {
    title: '其他',
    items: ['DaVinci Resolve', 'Photoshop']
  }
]
</script>

<style scoped>
.home-page {
  /* 与宇宙深空背景底色 100% 一致 */
  background: #101114;
  min-height: 100vh;
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-x: hidden;
  padding-top: 0;
  padding-bottom: 90px;
  box-sizing: border-box;
}


.text {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
  margin-bottom: 30px;
  z-index: 2;
}

.text h1 {
  margin: 0;
  font-size: 28px;
  font-family: 'YouSheBiaoTiHei', '优设标题黑', sans-serif;
  font-weight: normal;
  color: #FFFFFF;
  letter-spacing: 2px;
  text-shadow: 0 0 20px rgba(255, 255, 255, 0.35);
}

.sub-text {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.25em;
  color: rgba(255, 255, 255, 0.35);
  margin-top: 6px;
}

.content-wrapper {
  display: grid;
  grid-template-columns: 700px 360px;
  justify-content: center;
  align-items: center;
  column-gap: 80px;
  z-index: 2;
}

.skill-sections {
  width: 360px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

@media (max-width: 900px) {
  .content-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    margin-top: 0;
    row-gap: 40px;
    padding: 0 16px;
    box-sizing: border-box;
  }

  .skill-sections {
    width: 100%;
    max-width: 500px;
  }
}
</style>