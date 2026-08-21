<template>
  <div class="home-page">
    <Navbar :transparent="false" />
    <div class="text animate__animated animate__fadeIn" style="animation-delay: 0.3s">
      <h1>我的技术栈</h1>
    </div>
    <div class="content-wrapper">
      <TechStackCard />
      <div class="skill-sections">
        <SkillGroup v-for="(group, index) in skillGroups" :key="group.title" :group="group" :index="index" />
      </div>
    </div>
    <Clock />
  </div>
</template>

<script setup>
import Navbar from '@/modules/bloghome/components/load.vue'
import TechStackCard from '@/modules/bloghome/components/about/info.vue'
import SkillGroup from '@/modules/bloghome/components/about/skills.vue'
import Clock from '@/modules/bloghome/components/about/clock.vue'

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
    items: ['DaVinci Resolve', 'Photoshop',]
  }
]
</script>

<style scoped>
.home-page {
  background: #FAF7F2;
  min-height: 100vh;
  max-width: none;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-x: hidden;
  padding-top: 20px;
}

.text {
  color: #000;
  font-size: 24px;
  margin-top: 80px;
  margin-bottom: 20px;
}

.text h1 {
  font-family: 'YouSheBiaoTiHei', '优设标题黑', sans-serif;
  font-weight: normal;
}

.content-wrapper {
  display: grid;
  transform: translateY(-15px);
  grid-template-columns: 700px 360px;
  justify-content: center;
  align-items: center;
  column-gap: 80px;
  margin-top: -80px;
}

.skill-sections {
  width: 360px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

@media (max-width: 900px) {
  .home-page {
    padding-top: 20px;
  }

  .content-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
    margin-top: 0;
    row-gap: 40px;
    padding: 0 16px;
    box-sizing: border-box;
    transform: none;
  }

  .skill-sections {
    width: 100%;
    max-width: 500px;
  }
}
</style>