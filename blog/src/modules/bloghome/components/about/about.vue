<!-- src/modules/bloghome/views/Home.vue -->
<template>
  <div class="home-page">
    <!-- 漫游者号飞船鼠标 -->
    <SpaceCursor />

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

    <CosmicSendModal v-model="isSendModalOpen" />

    <!-- ================= 极简底部收尾 ================= -->
    <div class="footer-simple">
      <button class="leave-btn" @click="handleMessageClick">
        留言 ↗
      </button>

      <a
        href="https://beian.miit.gov.cn/"
        target="_blank"
        rel="noopener noreferrer"
        class="icp-text"
      >
        赣ICP备2026017716号
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Navbar from '@/modules/bloghome/components/load.vue'
import TechStackCard from '@/modules/bloghome/components/about/info.vue'
import SkillGroup from '@/modules/bloghome/components/about/skills.vue'
import CosmicScene from '@/modules/bloghome/components/about/CosmicScene.vue'
import SpaceCursor from '@/modules/bloghome/components/about/SpaceCursor.vue'
import CosmicSendModal from '@/modules/bloghome/components/about/CosmicSendModal.vue'


const handleMessageClick = () => {
  isSendModalOpen.value = true // 修复：打开弹窗
}

const isSendModalOpen = ref(false)

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
  cursor: none;
  background: #101114;
  min-height: 100vh;
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-x: hidden;
  padding-top: 0;
  /* 适当收紧底部内边距，告别大片死黑留白 */
  padding-bottom: 40px;
  box-sizing: border-box;
}

:deep(*) {
  cursor: none !important;
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

/* ================= 极简底部：收紧间距，回归纯粹 ================= */
.footer-simple {
  margin-top: 36px; /* 间距大幅收紧，紧跟技术栈，不再脱节 */
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  z-index: 10;
}

/* 极简无实体、低侵入按钮 */
.leave-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  letter-spacing: 1.5px;
  padding: 6px 18px;
  border-radius: 6px;
  outline: none;
  transition: all 0.2s ease;
}

.leave-btn:hover {
  color: #FFFFFF;
  border-color: rgba(255, 255, 255, 0.45);
  background: rgba(255, 255, 255, 0.05);
}

/* 极简半透明单行备案号 */
.icp-text {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.25);
  text-decoration: none;
  font-family: ui-monospace, SFMono-Regular, monospace;
  letter-spacing: 0.05em;
  transition: color 0.2s ease;
}

.icp-text:hover {
  color: rgba(255, 255, 255, 0.6);
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

  .footer-simple {
    margin-top: 30px;
  }
}
</style>