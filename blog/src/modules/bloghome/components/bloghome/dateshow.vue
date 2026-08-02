<template>
  <div class="site-age-box">
    <span class="text" v-for="(char, index) in chars" :key="index">{{ char }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const launchDate = new Date('2026-06-14')
const days = computed(() => {
  const now = new Date()
  const diffTime = now.getTime() - launchDate.getTime()
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
})

const text = computed(() => `网站已上线 ${days.value} 天`)
const chars = computed(() => text.value.split(''))
</script>

<style scoped>
.site-age-box {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin: 0 auto;
  padding: 0 2rem;
  height: 4.5rem;
  width: fit-content;
  min-width: 40rem;
  border-radius: 5rem;
  background-color: #FFFDF6;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='.08'/%3E%3C/svg%3E");
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  cursor: default;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.site-age-box:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.text {
  z-index: 2;
  font-family: 'YouSheBiaoTiHei', '优设标题黑', sans-serif;
  font-size: 32px;
  font-weight: normal;
  letter-spacing: 1px;
  color: #2C2C2C;
  white-space: pre;
}

@media (max-width: 768px) {
  .site-age-box {
    min-width: unset;
    max-width: 92vw;
    height: auto;
    padding: 0.7rem 1.2rem;
    margin: 0 auto;
    border-radius: 3rem;
  }

  .text {
    font-size: 22px;
    letter-spacing: 0.5px;
    white-space: pre-wrap;
    line-height: 1.3;
  }
}
</style>