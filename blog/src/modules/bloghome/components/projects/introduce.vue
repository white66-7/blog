<template>
  <div class="intro-box">
    <!-- Header -->
    <div class="section-label">open source</div>
    <div class="timeline-header">
      <h2 class="journey-title">COMMITS JOURNEY</h2>
    </div>

    <!-- 可滚动区域 -->
    <div class="timeline-scroll-area">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-placeholder">
        <span class="loading-dot"></span>
        <span class="loading-dot"></span>
        <span class="loading-dot"></span>
      </div>

      <!-- 时间线 -->
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
                :class="{ 'animate__animated animate__fadeInUp': animatedItems.has(`${event.timestamp}-${idx}`) }"
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

      <p v-else class="empty-timeline">No commits found yet.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, onBeforeUnmount } from 'vue'

const API_URL = 'http://localhost:8080/api/commits-timeline'
const timeline = ref([])
const loading = ref(true)

// 存储已触发动画的事件 ID
const animatedItems = ref(new Set())

let observer = null

const getShortMonth = (monthNum) => {
  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
  return months[monthNum - 1] || monthNum
}

// 分组计算
const groupedTimeline = computed(() => {
  if (!timeline.value.length) return []
  const sorted = [...timeline.value].sort((a, b) => b.timestamp - a.timestamp)
  const result = []
  let currentYearGroup = null
  let currentMonthGroup = null
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

// 获取 commits 数据
async function fetchCommitsTimeline() {
  try {
    const res = await fetch(API_URL)
    if (!res.ok) throw new Error('Failed to fetch commits')
    const commits = await res.json()
    const events = commits.map(commit => {
      const dateObj = new Date(commit.commitDate)
      const fullMessage = commit.message || 'Update code'
      const commitTitle = fullMessage.split('\n')[0]
      return {
        timestamp: dateObj.getTime(),
        year: dateObj.getFullYear(),
        month: dateObj.getMonth() + 1,
        text: commitTitle,
        repoName: commit.repoName
      }
    })
    timeline.value = events
  } catch (err) {
    console.error('[GitHub Timeline] Failed:', err)
    timeline.value = []
  } finally {
    loading.value = false
    // 数据加载完后，等待 DOM 更新再启动观察器
    await nextTick()
    setupObserver()
  }
}

// 创建 Intersection Observer，监听 .event-item
function setupObserver() {
  // 清除旧的观察器
  if (observer) observer.disconnect()

  const items = document.querySelectorAll('.event-item[data-event-id]')
  if (items.length === 0) return

  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.dataset.eventId
        if (id && !animatedItems.value.has(id)) {
          animatedItems.value.add(id)
          // 触发响应式更新
          animatedItems.value = new Set(animatedItems.value)
        }
        // 动画只触发一次，停止观察该元素
        observer.unobserve(entry.target)
      }
    })
  }, { threshold: 0.1 })

  items.forEach(item => observer.observe(item))
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
</style>

<!-- 全局引入 animate.css（非 scoped） -->
<style>
@import url('https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css');
</style>