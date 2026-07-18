<template>
  <div class="home-page">
    <Navbar :transparent="false" />
    <div class="text animate__animated animate__fadeIn" style="animation-delay: 0.3s">
      <h1>我的技术栈</h1>
    </div>
<div class="content-wrapper">
  <TechStackCard />

  <div class="skill-sections">
<SkillGroup v-for="(group, index) in skillGroups"
            :key="group.title"
            :group="group"
            :index="index" />
  </div>
</div>
  <Textshow />
  <div class="">
  <Comments />
  
  </div>
  </div>
</template>

<script setup>
import Navbar from '@/modules/bloghome/components/load.vue'
import TechStackCard from '@/modules/bloghome/components/about/info.vue'
import SkillGroup from '@/modules/bloghome/components/about/skills.vue'  
import Textshow from '@/modules/bloghome/components/about/text.vue'
import Comments from '@/modules/bloghome/components/about/comments.vue'

const skillGroups = [
  {
    title: '前端',
    items: ['Vue', 'JavaScript', 'Css', 'Html']
  },
  {
    title: '后端',
    items: ['Node.js','SpringBoot(学习中)']
  },
  {
    title: '数据库',
    items: ['MySQL(学习中)']
  },
  {
    title: '工具',
    items: ['Git', 'VS Code','IDEA']
  },
  {
    title: '其他',
    items: ['DaVinci Resolve','Photoshop', ]
  }
]
</script>

<style scoped>
@font-face {
  font-family: 'YouSheBiaoTiHei';
  src: url('/text/YouSheBiaoTiHei-2.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
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
.text h1 {
  font-family: 'YouSheBiaoTiHei', '优设标题黑', sans-serif;
  font-weight: normal;
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
    gap:6px;
}

@media (max-width: 900px) {
  .home-page {
    padding-top: 20px;
  }
  
  .content-wrapper {
    /* 🚀 关键修复1：必须先声明 flex，下面的 column 才会生效 */
    display: flex; 
    flex-direction: column;
    align-items: center;
    width: 100%;
    
    /* 🚀 关键修复2：重置 PC 端的错位 margin 和 gap */
    margin-top: 0; 
    row-gap: 40px; /* 卡片和下面文字的上下间距 */
    padding: 0 16px;
    box-sizing: border-box;
    transform: none; /* 取消手机端不需要的 Y 轴偏移 */
  }
  
  .skill-sections {
    width: 100%;
    max-width: 500px;
  }
}
</style>