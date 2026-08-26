<template>
  <div class="intro-box">
    <!-- Header -->
    <div class="section-label">open source</div>
    <div class="timeline-header">
      <h2 class="journey-title">COMMITS JOURNEY</h2>
    </div>

    <!-- 可滚动区域 -->
    <div class="timeline-scroll-area">
      <!-- ===== 骨架加载图：数据未成功之前始终显示 ===== -->
      <div v-if="loading" class="timeline skeleton-timeline">
        <div class="timeline-line skeleton-line"></div>
        <!-- 模拟三个年份区块 -->
        <div v-for="n in 3" :key="'sk-year-' + n" class="year-section">
          <h3 class="year-title skeleton-year"></h3>
          <div
            v-for="m in (n === 1 ? 2 : 1)"
            :key="'sk-month-' + n + '-' + m"
            class="month-section"
          >
            <div class="month-indicator">
              <div class="month-label skeleton-month"></div>
              <div class="event-dot skeleton-dot"></div>
            </div>
            <ul class="event-list">
              <li
                v-for="k in (m === 1 ? 3 : 2)"
                :key="k"
                class="event-item skeleton-event"
              >
                <span
                  class="skeleton-text"
                  :style="{ width: `${60 + k * 12}%` }"
                ></span>
                <span class="repo-tag skeleton-tag"></span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 真实时间线（仅在数据获取成功且非空时显示） -->
      <div v-else-if="groupedTimeline.length" class="timeline">
        <div class="timeline-line"></div>

        <section
          v-for="yearGroup in groupedTimeline"
          :key="yearGroup.year"
          class="year-section"
        >
          <h3 class="year-title">{{ yearGroup.year }}</h3>

          <section
            v-for="monthGroup in yearGroup.months"
            :key="monthGroup.month"
            class="month-section"
          >
            <div class="month-indicator">
              <div class="month-label">{{ getShortMonth(monthGroup.month) }}</div>
              <div class="event-dot"></div>
            </div>

            <ul class="event-list">
              <li
                v-for="(event, idx) in monthGroup.events"
                :key="`${event.timestamp}-${idx}`"
                class="event-item"
                :class="{
                  'animate__animated animate__fadeInUp': animatedItems.has(
                    `${event.timestamp}-${idx}`
                  )
                }"
                :data-event-id="`${event.timestamp}-${idx}`"
              >
                <span class="commit-text">{{ event.text }}</span>
                <span class="repo-tag">
                  <span class="tag-text">{{ event.repoName }}</span>
                </span>
              </li>
            </ul>
          </section>
        </section>
      </div>

      <!-- 仅在成功获取但数据为空时显示此提示（几乎不会出现） -->
      <p v-else class="empty-timeline">No commits found yet.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, nextTick, onBeforeUnmount } from 'vue'

interface RawCommit {
  commitDate: string
  message: string
  repoName: string
}

interface TimelineEvent {
  id: string
  timestamp: number
  year: number
  month: number
  text: string
  repoName: string
}

interface MonthGroup {
  month: number
  events: TimelineEvent[]
}

interface YearGroup {
  year: number
  months: MonthGroup[]
}

const API_URL = '/api/commits-timeline'
const TIMELINE_CACHE_KEY = 'cyber_github_timeline'
const CACHE_TTL = 60 * 60 * 1000 // 缓存 1 小时，切页面秒开无需等待

const timeline = ref<TimelineEvent[]>([])
const loading = ref<boolean>(true)
const animatedItems = ref<Set<string>>(new Set())
let observer: IntersectionObserver | null = null

const getShortMonth = (monthNum: number) => {
  const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
  return months[monthNum - 1] || monthNum
}

// 分组计算
const groupedTimeline = computed<YearGroup[]>(() => {
  if (!timeline.value.length) return []
  const sorted = [...timeline.value].sort((a, b) => b.timestamp - a.timestamp)
  const result: YearGroup[] = []
  let currentYearGroup: YearGroup | null = null
  let currentMonthGroup: MonthGroup | null = null

  sorted.forEach(event => {
    if (!currentYearGroup || currentYearGroup.year !== event.year) {
      currentYearGroup = { year: event.year, months: [] }
      result.push(currentYearGroup)
      currentMonthGroup = null
    }
    if (!currentMonthGroup || currentMonthGroup.month !== event.month) {
      currentMonthGroup = { month: event.month, events: [] }
      currentYearGroup.months.push(currentMonthGroup)
    }
    currentMonthGroup.events.push(event)
  })
  return result
})

function formatCommits(commits: RawCommit[]): TimelineEvent[] {
  return commits.map((commit, index) => {
    const dateObj = new Date(commit.commitDate)
    const timestamp = isNaN(dateObj.getTime()) ? Date.now() : dateObj.getTime()
    const fullMessage = commit.message || 'Update code'
    const commitTitle = fullMessage.split('\n')[0] || 'Update code'
    return {
      id: `${timestamp}-${index}`,
      timestamp,
      year: dateObj.getFullYear() || new Date().getFullYear(),
      month: dateObj.getMonth() + 1 || 1,
      text: commitTitle,
      repoName: commit.repoName || 'repo'
    }
  })
}

async function fetchCommitsTimeline() {
  // 1. 优先读取 1 小时本地缓存
  try {
    const raw = localStorage.getItem(TIMELINE_CACHE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed?.savedAt && Date.now() - parsed.savedAt < CACHE_TTL && Array.isArray(parsed.data) && parsed.data.length > 0) {
        timeline.value = parsed.data
        loading.value = false
        await nextTick()
        setupObserver()
        return
      }
    }
  } catch { /* 忽略缓存错误 */ }

  // 2. 缓存失效时请求云函数接口
  try {
    const res = await fetch(API_URL)
    if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
    const commits: RawCommit[] = await res.json()
    
    if (Array.isArray(commits) && commits.length > 0) {
      const events = formatCommits(commits)
      timeline.value = events
      try {
        localStorage.setItem(TIMELINE_CACHE_KEY, JSON.stringify({ savedAt: Date.now(), data: events }))
      } catch { }
      await nextTick()
      setupObserver()
    }
  } catch (err) {
    console.error('[GitHub Timeline] 获取失败:', err)
  } finally {
    // ✅ 关键修复：无论成功还是返回空，都必须关闭骨架屏！
    loading.value = false
  }
}

function setupObserver() {
  if (observer) observer.disconnect()
  const items = document.querySelectorAll('.event-item[data-event-id]')
  if (items.length === 0) return

  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = (entry.target as HTMLElement).dataset.eventId
        if (id && !animatedItems.value.has(id)) {
          animatedItems.value.add(id)
          animatedItems.value = new Set(animatedItems.value)
        }
        observer?.unobserve(entry.target)
      }
    })
  }, { threshold: 0.1 })

  items.forEach(item => observer?.observe(item))
}

onMounted(() => {
  fetchCommitsTimeline()
})

onBeforeUnmount(() => {
  if (observer) observer.disconnect()
})
</script>

<style scoped>
/* ========== 原有样式（无任何改动） ========== */
.intro-box {
  font-family: 'Inter', sans-serif;
  color: #1A1814;
  height: 500px;
  display: flex;
  flex-direction: column;
  padding-top: 20px;
  background-color: #FAF7F2;
}

.section-label {
  font-size: 12px;
  letter-spacing: 0.2em;
  color: #0047FF;
  margin: 0 1.5rem 1rem;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}
.section-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #D8D2C8;
  max-width: 60px;
}
.timeline-header {
  text-align: left;
  padding: 0 1.5rem 1.5rem;
  flex-shrink: 0;
}
.journey-title {
  font-family: 'Fraunces', serif;
  font-size: 1.8rem;
  font-weight: 400;
  color: #161411;
  margin: 0;
}

.timeline-scroll-area {
  flex: 1;
  overflow-y: auto;
  padding: 0 1.5rem 2rem;
}
.timeline-scroll-area::-webkit-scrollbar { width: 6px; }
.timeline-scroll-area::-webkit-scrollbar-thumb { background-color: #D8D2C8; border-radius: 4px; }

.timeline { position: relative; }
.timeline-line {
  position: absolute;
  left: 45px;
  top: 0; bottom: 0;
  width: 2px;
  background: #D8D2C8;
}

.year-section { position: relative; }
.year-title {
  font-family: 'Fraunces', serif;
  font-size: 1.4rem;
  font-weight: 400;
  color: #161411;
  position: sticky;
  top: 0;
  background: linear-gradient(to bottom, #FAF7F2 80%, rgba(250,247,242,0));
  padding: 0.8rem 0 1rem 70px;
  margin: 0;
  z-index: 10;
}

.month-section {
  display: flex;
  align-items: flex-start;
  position: relative;
  margin-bottom: 2rem;
}
.month-indicator {
  position: sticky;
  top: 3.5rem;
  width: 70px;
  height: 24px;
  flex-shrink: 0;
  z-index: 5;
}
.month-label {
  position: absolute;
  left: 0;
  top: 2px;
  width: 35px;
  text-align: right;
  font-size: 0.8rem;
  font-weight: 600;
  color: #8C867D;
  letter-spacing: 0.05em;
}
.event-dot {
  position: absolute;
  left: 42px;
  top: 6px;
  width: 8px;
  height: 8px;
  background: #0047FF;
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(0,71,255,0.1);
}

.event-list {
  flex: 1;
  list-style: none;
  margin: 0;
  padding: 0;
}
.event-item {
  margin-bottom: 0.8rem;
  line-height: 1.6;
  color: #3b3a37;
  font-size: 0.95rem;
  word-break: break-word;
}
.event-item::before {
  content: '·';
  margin-right: 0.4rem;
  color: #D8D2C8;
  font-weight: bold;
}

/* 仓库标签 */
.repo-tag {
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
  margin-left: 0.5rem;
  padding: 0.3em 0.8em;    
  font-size: 0.65rem;            
  font-weight: 600;
  letter-spacing: 0.04em;
  background-color: white;
  text-transform: uppercase;
  color: #090909;
  cursor: default;
  border-radius: 8px;
  transition: all 0.3s ease;
  white-space: nowrap;
}
.repo-tag:hover{
  background-color: #080f9c7b;
}
.tag-text {
  position: relative;
  z-index: 1;
}

.loading-placeholder {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  padding: 3rem 0;
}
.loading-dot {
  width: 8px;
  height: 8px;
  background: #0047FF;
  border-radius: 50%;
  animation: pulse 1.4s infinite ease-in-out both;
}
.loading-dot:nth-child(1) { animation-delay: -0.32s; }
.loading-dot:nth-child(2) { animation-delay: -0.16s; }
.loading-dot:nth-child(3) { animation-delay: 0s; }
@keyframes pulse {
  0%, 80%, 100% { transform: scale(0.4); opacity: 0.5; }
  40% { transform: scale(1); opacity: 1; }
}

.skeleton-timeline {
  pointer-events: none;
}
.skeleton-line {
  background: #EAE5DE !important;
}
.skeleton-year {
  background: #EAE5DE !important;
  color: transparent !important;
  width: 60px;
  height: 1.2rem;
  border-radius: 4px;
  margin-left: 70px;
  padding: 0 !important;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}
.skeleton-month {
  background: #EAE5DE;
  color: transparent !important;
  width: 28px;
  height: 0.7rem;
  border-radius: 3px;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}
.skeleton-dot {
  background: #EAE5DE !important;
  box-shadow: none !important;
}
.skeleton-event {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.skeleton-text {
  display: inline-block;
  height: 0.8rem;
  background: #EAE5DE;
  border-radius: 4px;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
}
.skeleton-tag {
  width: 54px;
  height: 1.2rem;
  background: #EAE5DE !important;
  border-radius: 8px;
  animation: skeleton-pulse 1.5s ease-in-out infinite;
  margin-left: 0.5rem;
}

@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.8;
  }
}


</style>
