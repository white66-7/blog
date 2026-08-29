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
import Fruit from '@/modules/bloghome/components/projects/fruits.vue'

const isFirstScreen = ref(false)
</script>

<style scoped>
.projects-page {
  position: relative;
  width: 100%;
  background-color: #FAF7F2;
}
</style>