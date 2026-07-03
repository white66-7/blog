<template>
  <div class="home-page">
    <Navbar :transparent="false" />
    <div class="text animate__animated animate__fadeIn" style="animation-delay: 0.3s">
      <h1>我的技术栈</h1>
    </div>
<div class="content-wrapper">
  <TechStackCard />

  <div class="skill-sections">
    <SkillGroup
      v-for="group in skillGroups"
      :key="group.title"
      :group="group"
    />
  </div>
</div>
  <Textshow />
  </div>
</template>

<script setup>
import Navbar from '@/modules/bloghome/components/load.vue'
import TechStackCard from '@/modules/bloghome/components/about/info.vue'
import SkillGroup from '@/modules/bloghome/components/about/skills.vue'  
import Textshow from '@/modules/bloghome/components/about/text.vue'
const skillGroups = [
  {
    title: '前端',
    items: ['Vue.js', 'JavaScript', 'Css', 'Html']
  },
  {
    title: '后端',
    items: ['Node.js']
  },
  {
    title: '服务器',
    items: ['Vercel']
  },
  {
    title: '工具',
    items: ['Git', 'VS Code']
  }
]
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');

.home-page {
  background: #FAF7F2;
  min-height: 100vh;
  max-width:none;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-x: hidden;
  padding-top: 20px;
}
.text{
  color:#000;
  font-size:24px;
  margin-top:80px;
  margin-bottom:20px;
}
.content-wrapper{
    display:grid;
    transform: translateY(-15px);
    grid-template-columns:700px 360px;
    justify-content:center;
    align-items:center;
    column-gap:80px;
    margin-top: -80px;
}
.skill-sections{
    width:360px;
    display:flex;
    flex-direction:column;
    gap:20px;
}

/* 响应式：小屏堆叠 */
@media (max-width: 900px) {
  .home-page {
    padding-top: 60px;
  }
  .content-wrapper {
    flex-direction: column;
    align-items: center;
  }
  .skill-sections {
    width: 100%;
    max-width: 500px;
  }
}
</style>