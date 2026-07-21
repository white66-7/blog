<template>
  <div class="github-section">
    <!-- 左侧简介 -->
    <div class="intro-side">
      <IntroSection />
    </div>

    <!-- 右侧统计卡片 + 贡献墙 -->
    <div class="content-side">
      <!-- 统计卡片 -->
      <div class="stats-card">
        <div class="stats-grid">
          <!-- 贡献次数卡片 -->
          <div class="stat-box">
            <div class="stat-num">
              <Transition name="fade" mode="out-in">
                <div v-if="loadingContrib" key="loading" class="dot-spinner">
                  <div class="dot-spinner__dot"></div>
                  <div class="dot-spinner__dot"></div>
                  <div class="dot-spinner__dot"></div>
                  <div class="dot-spinner__dot"></div>
                  <div class="dot-spinner__dot"></div>
                  <div class="dot-spinner__dot"></div>
                  <div class="dot-spinner__dot"></div>
                  <div class="dot-spinner__dot"></div>
                </div>
                <span v-else key="loaded" class="stat-value">{{ totalContributions }}</span>
              </Transition>
            </div>
            <div class="stat-label">贡献次数</div>
          </div>
          <!-- 项目总数卡片保持不变 -->
          <div class="stat-box">
            <div class="stat-num">{{ publicRepos }}</div>
            <div class="stat-label">项目总数</div>
          </div>
        </div>
      </div>

      <!-- 贡献墙 -->
      <div class="wall-wrapper">
        <div class="section-label wall-title">GITHUB CONTRIBUTIONS</div>
        <div class="contrib-container">
          <Transition name="fade" mode="out-in">
            <div v-if="!hasData" key="skeleton" class="skeleton-grid">
              <div v-for="row in 7" :key="row" class="skeleton-row">
                <div v-for="col in 30" :key="col" class="skeleton-cell"></div>
              </div>
            </div>
            <div v-else key="content" class="contrib-grid">
              <div v-for="(row, rowIdx) in contributionGrid" :key="rowIdx" class="contrib-row">
                <div v-for="(count, colIdx) in row" :key="colIdx" class="contrib-cell" :class="getLevelClass(count)"
                  :title="`${count} contribution${count !== 1 ? 's' : ''}`"></div>
              </div>
            </div>
          </Transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import IntroSection from './introduce.vue'
import 'animate.css';

const API_URL = 'http://localhost:8080/api/contributions'
const GITHUB_USERNAME = 'white66-7'
const WEEKS_TO_SHOW = 30

const weeksData = ref([])
const publicRepos = ref(0)
const loadingContrib = ref(true)
const loadingStats = ref(true)
let refreshTimer = null

const hasData = computed(() => weeksData.value.length > 0)

const totalContributions = computed(() => {
  if (!weeksData.value.length) return 0
  let sum = 0
  weeksData.value.forEach(week => {
    week.contributionDays.forEach(day => {
      sum += day.contributionCount
    })
  })
  return sum
})

const recentWeeks = computed(() => weeksData.value.slice(-WEEKS_TO_SHOW))

const contributionGrid = computed(() => {
  const weeks = recentWeeks.value
  if (!weeks.length) return []
  const rows = Array.from({ length: 7 }, () => [])
  weeks.forEach(week => {
    week.contributionDays.forEach((day, idx) => {
      if (idx < 7) rows[idx].push(day.contributionCount)
    })
  })
  return rows
})

function getLevelClass(count) {
  if (count === 0) return ''
  if (count <= 3) return 'l1'
  if (count <= 6) return 'l2'
  if (count <= 9) return 'l3'
  return 'l4'
}

async function fetchContributions() {
  try {
    const res = await fetch(API_URL)
    if (!res.ok) throw new Error(`Server responded with ${res.status}`)
    const data = await res.json()
    if (!data.weeks || !Array.isArray(data.weeks)) throw new Error('Invalid data format')
    weeksData.value = data.weeks
    loadingContrib.value = false   // 数据获取成功后关闭加载状态
  } catch (err) {
    if (!hasData.value) console.error('[Contribution Wall] Failed:', err)
  }
}

async function fetchUserStats() {
  try {
    const res = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}`)
    if (!res.ok) throw new Error('Failed to fetch user stats')
    const data = await res.json()
    publicRepos.value = data.public_repos ?? 0
  } catch (err) {
    console.error('[GitHub Stats] Failed:', err)
    publicRepos.value = 0
  } finally {
    loadingStats.value = false
  }
}

onMounted(() => {
  fetchContributions()
  fetchUserStats()
  refreshTimer = setInterval(fetchContributions, 10 * 60 * 1000)
})

onUnmounted(() => {
  if (refreshTimer) clearInterval(refreshTimer)
})
</script>

<style scoped>
/* ===== 原有布局样式全部保留 ===== */
.github-section {
  display: flex;
  gap: 4rem;
  padding: 5rem 3rem;
  background: #FAF7F2;
  color: #1A1814;
  width: 100%;
  margin: 0 auto;
  align-items: flex-start;
}

.intro-side {
  flex: 1;
  min-width: 280px;
}

.content-side {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2.5rem;
  margin-top: 70px;
}

@media (max-width: 768px) {
  .github-section {
    flex-direction: column;
    padding: 3rem 1.5rem;
    gap: 2rem;
  }

  .intro-side,
  .content-side {
    flex: none;
    width: 100%;
  }
}

.section-label {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  letter-spacing: 0.2em;
  color: #0047FF;
  margin-bottom: 20px;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #D8D2C8;
  max-width: 60px;
}

.stats-card {
  width: 100%;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  background: rgba(0, 0, 0, 0.05);
}

.stat-box {
  padding: 1.8rem 2rem;
  background: #f9f9f9;
  transition: background 0.2s;
}

.stat-box:hover {
  background: rgba(0, 71, 255, 0.08);
}

.stat-num {
  font-family: 'Fraunces', serif;
  font-size: 2.5rem;
  font-weight: 300;
  color: #0047FF;
  line-height: 1;
  min-height: 2.5rem;
  /* 固定高度，防止切换跳动 */
  display: flex;
  align-items: center;
  /* 垂直居中 */
}

.stat-value {
  font-family: 'Fraunces', serif;
  font-size: 2.5rem;
  font-weight: 300;
  color: #0047FF;
  line-height: 1;
}

.stat-label {
  font-family: 'DM Mono', monospace;
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #6B6560;
  margin-top: 0.5rem;
}

/* ===== 贡献墙样式 ===== */
.wall-wrapper {
  width: 100%;
}

.wall-title {
  margin-bottom: 20px;
}

.wall-title::after {
  display: none;
}

.contrib-container {
  position: relative;
  min-height: 130px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.contrib-grid {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.contrib-row {
  display: flex;
  gap: 3px;
}

.contrib-cell {
  width: 16px;
  height: 16px;
  border-radius: 2px;
  background: rgba(0, 0, 0, 0.06);
  transition: transform 0.15s ease;
}

.contrib-cell:hover {
  transform: scale(1.35);
  z-index: 2;
}

.l1 {
  background: rgba(0, 71, 255, 0.2);
}

.l2 {
  background: rgba(0, 71, 255, 0.4);
}

.l3 {
  background: rgba(0, 71, 255, 0.65);
}

.l4 {
  background: rgba(0, 71, 255, 0.9);
}

/* 骨架屏 */
.skeleton-grid {
  display: flex;
  flex-direction: column;
  gap: 2px;
  position: relative;
  overflow: hidden;
}

.skeleton-grid::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent 0%, rgba(0, 71, 255, 0.2) 40%, rgba(0, 71, 255, 0.3) 50%, rgba(0, 71, 255, 0.2) 60%, transparent 100%);
  animation: skeleton-shine 1.5s ease-in-out infinite;
}

.skeleton-row {
  display: flex;
  gap: 3px;
}

.skeleton-cell {
  width: 16px;
  height: 16px;
  border-radius: 2px;
  background-color: #b0b0b0;
  animation: breathe 1.8s ease-in-out infinite alternate;
}

@keyframes breathe {
  from {
    opacity: 0.6;
    transform: scale(0.95);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes skeleton-shine {
  0% {
    transform: translateX(-100%);
  }

  100% {
    transform: translateX(100%);
  }
}

/* Vue Transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-to,
.fade-leave-from {
  opacity: 1;
}

/* ===== 点状旋转加载动画 ===== */
.dot-spinner {
  --uib-size: 2.2rem;
  --uib-speed: 0.9s;
  --uib-color: #0047FF;
  width: var(--uib-size);
  height: var(--uib-size);
  position: relative;
}

.dot-spinner__dot {
  position: absolute;
  top: 0;
  left: 0;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
  width: 100%;
}

.dot-spinner__dot::before {
  content: '';
  height: 20%;
  width: 20%;
  border-radius: 50%;
  background-color: var(--uib-color);
  transform: scale(0);
  opacity: 0.5;
  animation: pulse0112 calc(var(--uib-speed) * 1.111) ease-in-out infinite;
  box-shadow: 0 0 20px rgba(18, 31, 53, 0.3);
}

.dot-spinner__dot:nth-child(2) {
  transform: rotate(45deg);
}

.dot-spinner__dot:nth-child(2)::before {
  animation-delay: calc(var(--uib-speed) * -0.875);
}

.dot-spinner__dot:nth-child(3) {
  transform: rotate(90deg);
}

.dot-spinner__dot:nth-child(3)::before {
  animation-delay: calc(var(--uib-speed) * -0.75);
}

.dot-spinner__dot:nth-child(4) {
  transform: rotate(135deg);
}

.dot-spinner__dot:nth-child(4)::before {
  animation-delay: calc(var(--uib-speed) * -0.625);
}

.dot-spinner__dot:nth-child(5) {
  transform: rotate(180deg);
}

.dot-spinner__dot:nth-child(5)::before {
  animation-delay: calc(var(--uib-speed) * -0.5);
}

.dot-spinner__dot:nth-child(6) {
  transform: rotate(225deg);
}

.dot-spinner__dot:nth-child(6)::before {
  animation-delay: calc(var(--uib-speed) * -0.375);
}

.dot-spinner__dot:nth-child(7) {
  transform: rotate(270deg);
}

.dot-spinner__dot:nth-child(7)::before {
  animation-delay: calc(var(--uib-speed) * -0.25);
}

.dot-spinner__dot:nth-child(8) {
  transform: rotate(315deg);
}

.dot-spinner__dot:nth-child(8)::before {
  animation-delay: calc(var(--uib-speed) * -0.125);
}

@keyframes pulse0112 {

  0%,
  100% {
    transform: scale(0);
    opacity: 0.5;
  }

  50% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>