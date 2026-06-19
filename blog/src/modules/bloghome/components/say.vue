<template>
  <!-- 堆叠卡片容器，悬浮暂停定时器 -->
  <div class="stack" @mouseenter="stopAutoPlay" @mouseleave="startAutoPlay">
    <div class="card">
      <!-- 聊天气泡图标 + 标题 -->
      <div class="say-header">
        <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 512 512">
          <path d="M0 0h512v512H0z" fill="none" />
          <path fill="currentColor" d="M254.156 56.938c-64.144 0-122.393 19.17-165.03 50.718c-42.64 31.547-69.845 76.01-69.845 125.5c0 49.492 27.207 93.952 69.845 125.5c6.388 4.727 13.13 9.164 20.188 13.313l-12.657 95.905l90.594-65.75c21.226 4.708 43.67 7.25 66.906 7.25c64.144 0 122.362-19.17 165-50.72C461.794 327.11 489 282.65 489 233.156c0-49.49-27.206-93.95-69.844-125.5c-42.638-31.546-100.856-50.718-165-50.718M157 274.438c12.69 0 23 10.276 23 22.968c0 12.69-10.31 23-23 23s-22.97-10.31-22.97-23s10.28-22.97 22.97-22.97zm96.844 0c12.69 0 22.97 10.276 22.97 22.968c-.002 12.69-10.28 23-22.97 23s-23-10.31-23-23s10.31-22.97 23-22.97zm99.844 0c12.69 0 22.968 10.276 22.968 22.968c0 12.69-10.278 23-22.97 23c-12.69 0-22.998-10.31-22.998-23s10.31-22.97 23-22.97z" />
        </svg>
        <h3>随心一说</h3>
      </div>

      <!-- 说说内容区（保留过渡动画） -->
      <div class="say-content-wrapper">
        <Transition name="slide-fade" mode="out-in">
          <div :key="currentIndex" class="say-body">
            <p class="content">“{{ currentSay?.content ?? '' }}”</p>
            <div class="date-container">
              <span class="date-line"></span>
              <span class="date-text">{{ currentSay?.date ?? '' }}</span>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const saysList = [
  { id: 1, content: '终于在今天把首页的代码写完了', date: '2026-06-15 22:36' },
  { id: 2, content: '完成第一篇技术性文章', date: '2026-06-18 23:09' },
  { id: 3, content: '等我写完十篇文章就好好写一个文章管理仓库', date: '2026-06-20 16:56' },
]

const currentIndex = ref(0)
const currentSay = computed(() => saysList[currentIndex.value] ?? saysList[0])

let timer: number | null = null

const pickRandomSay = () => {
  if (saysList.length <= 1) return
  let nextIndex = currentIndex.value
  while (nextIndex === currentIndex.value) {
    nextIndex = Math.floor(Math.random() * saysList.length)
  }
  currentIndex.value = nextIndex
}

const startAutoPlay = () => {
  if (!timer) {
    timer = window.setInterval(pickRandomSay, 10000)
  }
}

const stopAutoPlay = () => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

onMounted(() => {
  startAutoPlay()
})

onUnmounted(() => {
  stopAutoPlay()
})
</script>

<style scoped>
/* ----- 堆叠卡片容器 ----- */
.stack {
  width: 90%;
  max-width: 420px;
  margin: 0 auto;
  transition: 0.25s ease;
  font-family: 'SimHei', 'Microsoft YaHei', '黑体', sans-serif;
}

.stack:hover {
  transform: rotate(5deg);
}
.stack:hover .card:before {
  transform: translatey(-2%) rotate(-4deg);
}
.stack:hover .card:after {
  transform: translatey(2%) rotate(4deg);
}

/* ----- 卡片本体 ----- */
.card {
  aspect-ratio: 3 / 2;
  border: 3px solid #333;
  background-color: #fff;
  position: relative;
  padding: 5% 5% 15% 5%;
  display: flex;
  flex-direction: column;
  transition: 0.15s ease;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); 
  color: #1a1a1a;
}

/* 卡片背后两层重叠效果 */
.card:before,
.card:after {
  content: "";
  display: block;
  position: absolute;
  height: 100%;
  width: 100%;
  border: 3px solid #333;
  background-color: #fff;
  transform-origin: center center;
  z-index: -1;
  transition: 0.15s ease;
  top: 0;
  left: 0;
}

.card:before {
  transform: translatey(-2%) rotate(-6deg);
}

.card:after {
  transform: translatey(2%) rotate(6deg);
}

/* ----- 内部元素 ----- */
.say-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  position: relative;
  z-index: 1;
}

.say-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 1px;
  color: #1a1a1a;
}

.say-header svg {
  color: #23c483;
  flex-shrink: 0;
}

.say-content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  z-index: 1;
}

.say-body {
  width: 100%;
}

.content {
  margin: 0 0 10px 0;
  font-size: 14.5px;
  line-height: 1.6;
  font-weight: 400;
  letter-spacing: 0.5px;
  color: #333;
  display: -webkit-box;
  -webkit-line-clamp: 4;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-clamp: 4;
}

.date-container {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 8px;
  opacity: 0.6;
}

.date-line {
  height: 1px;
  width: 20px;
  background-color: #666;
}

.date-text {
  font-size: 12px;
  font-family: monospace, sans-serif;
  color: #555;
}

/* 切换动画保持不变 */
.slide-fade-enter-active {
  transition: all 0.4s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(10px);
  opacity: 0;
}
</style>