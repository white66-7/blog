<template>
  <div 
    class="site-age-box" 
    ref="boxRef"
    :style="{
      '--glow-x': glowX,
      '--glow-y': glowY,
      '--glow-transition': transitionSpeed
    }"
    @mouseenter="handleMouseEnter"
    @mousemove="handleMouseMove"
    @mouseleave="handleMouseLeave"
  >
    <span class="text" v-for="(char, index) in chars" :key="index"
      :style="{ animationDelay: `${index * 0.05}s` }"
    >{{ char }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'

// --- 网站运行时间逻辑 ---
const launchDate = new Date('2026-06-14')
const days = computed(() => {
  const now = new Date()
  const diffTime = now.getTime() - launchDate.getTime()
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
})

const text = computed(() => `网站已上线 ${days.value} 天`)
const chars = computed(() => text.value.split(''))

// --- 动态光晕交互逻辑 ---
const boxRef = ref<HTMLElement | null>(null)
const glowX = ref('50%')
const glowY = ref('50%')
const transitionSpeed = ref('2s')
let randomTimer: number | null = null

const moveRandomly = () => {
  const randomX = Math.floor(Math.random() * 80) + 10
  const randomY = Math.floor(Math.random() * 80) + 10
  glowX.value = `${randomX}%`
  glowY.value = `${randomY}%`
}

const startRandomMovement = () => {
  transitionSpeed.value = '2.5s'
  moveRandomly()
  randomTimer = window.setInterval(moveRandomly, 2500)
}

const stopRandomMovement = () => {
  if (randomTimer) {
    clearInterval(randomTimer)
    randomTimer = null
  }
}

const handleMouseEnter = () => {
  stopRandomMovement()
  transitionSpeed.value = '0.15s'
}

const handleMouseMove = (e: MouseEvent) => {
  if (!boxRef.value) return
  const rect = boxRef.value.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  glowX.value = `${x}px`
  glowY.value = `${y}px`
}

const handleMouseLeave = () => {
  startRandomMovement()
}

onMounted(() => {
  startRandomMovement()
})

onUnmounted(() => {
  stopRandomMovement()
})
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
  
  /* 🌟 核心改动：仅改这两行让它拉满 960px 宽度，其余全部保持你的原设计 */
  width: 100%;
  box-sizing: border-box;
  min-width: unset;
  
  /* 你的原本原汁原味样式 */
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

/* 柔和暖光晕（保持原样） */
.site-age-box::before {
  content: '';
  position: absolute;
  left: var(--glow-x);
  top: var(--glow-y);
  width: 140px;
  height: 140px;
  margin: -70px 0 0 -70px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(255, 200, 130, 0.5), rgba(255, 200, 130, 0) 70%);
  filter: blur(24px);
  pointer-events: none;
  transition: left var(--glow-transition) ease-out, top var(--glow-transition) ease-out;
  animation: glowBreath 3.5s ease-in-out infinite;
  z-index: 0;
}

@keyframes glowBreath {
  0%, 100% { opacity: 0.4; transform: scale(0.9); }
  50%      { opacity: 0.85; transform: scale(1.15); }
}

.text {
  z-index: 1;
  display: inline-block;
  font-family: 'Orbitron', 'YouSheBiaoTiHei', '优设标题黑', sans-serif;
  font-size: 32px;
  font-weight: normal;
  letter-spacing: 1px;
  color: #2C2C2C;
  white-space: pre;
  opacity: 0;
  transform: translateY(6px);
  animation: charPop 0.5s ease-out forwards;
}

@keyframes charPop {
  to { opacity: 1; transform: translateY(0); }
}

/* 减弱动效 */
@media (prefers-reduced-motion: reduce) {
  .site-age-box::before,
  .text {
    animation: none !important;
  }
  .site-age-box::before {
    transition: none !important;
  }
  .text {
    opacity: 1;
    transform: none;
  }
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