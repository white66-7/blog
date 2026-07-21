<template>
  <div class="projects-page">
    <Navbar :transparent="isFirstScreen" />
     <Fruit />
    <GitHubCalendar />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Navbar from '@/modules/bloghome/components/load.vue'
import GitHubCalendar from '@/modules/bloghome/components/projects/GitHubCalendar.vue'
import Fruit from '@/modules/bloghome/components/projects/fruits.vue'  // 确保路径正确

const isFirstScreen = ref(false)
</script>

<style scoped>
.projects-page {
  position: relative;
  width: 100%;
  background-color: #FAF7F2;
}
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
.calendar-section {
  margin: 0 auto;
  padding: 100px 20px 40px;
}
</style>