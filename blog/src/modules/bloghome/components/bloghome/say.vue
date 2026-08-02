<template>
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
  { id: 1, content: '终于在今天把首页的代码写完了,网页上线了', date: '2026-06-14 22:36' },
  { id: 2, content: '第一篇文章拖到现在也是写完了', date: '2026-06-16 23:09' },
  { id: 3, content: '等我写完十篇文章就好好写个文章详细界面', date: '2026-06-20 16:56' },
  { id: 4, content: '过完端午马上期末有点焦虑啊', date: '2026-06-22 17:50' },
  { id: 5, content: '搬宿舍好累啊', date: '2026-06-25 22:05' },
  { id: 6, content: '终于考完了可以开始爽玩了', date: '2026-07-01 12:48' },
  { id: 7, content: '参加了趟ACM,圆了高中时候的一个梦', date: '2026-07-06 17:21' },
  { id: 8, content: '到千灯了', date: '2026-07-07 22:06' },
  { id: 9, content: '不知道为啥,我很喜欢打雷下雨的天气,非常解压', date: '2026-07-20 19:41' },
  { id: 10, content: '我老弟竟然有秘密瞒着我', date: '2026-07-26 20:47' },
  { id: 11, content: '感觉快要写吐了', date: '2026-08-01 17:37' },
  { id: 12, content: '火影退游了', date: '2026-08-02 13:41' },
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
    timer = window.setInterval(pickRandomSay, 5000)
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
  width: 100%;
  max-width: 420px;
  margin: 0 auto;
  transition: 0.25s ease;
}

.stack:hover {
  transform: rotate(4deg);
}
.stack:hover .card:before {
  transform: translatey(-2%) rotate(-4deg);
}
.stack:hover .card:after {
  transform: translatey(2%) rotate(4deg);
}

/* ----- 卡片本体 ----- */
.card {
  height: 160px; 
  border: 1px solid rgba(0, 0, 0, 0.14);
  border-radius: 16px;
  background-color: #fff;
  position: relative;
  padding: 5% 5% 15% 5%;
  display: flex;
  flex-direction: column;
  transition: 0.15s ease;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
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
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 16px;
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
  font-size: 25px;
  font-family: 'ShangShouJiangHuShuFa';
  font-weight: normal;
  letter-spacing: 1px;
  color: #2C2C2C;
}

.say-header svg {
  color: #d4a373;
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
  font-family: 'YouSheBiaoTiHei', '优设标题黑', sans-serif;
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
  font-family: 'YouSheBiaoTiHei', '优设标题黑', sans-serif;
  color: #555;
}

/* 切换动画 */
.slide-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.slide-fade-leave-active {
  transition: all 0.3s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(10px);
  opacity: 0;
}

/* 减弱动效 */
@media (prefers-reduced-motion: reduce) {
  .stack,
  .card,
  .card:before,
  .card:after {
    transition: none !important;
    transform: none !important;
  }
  .slide-fade-enter-active,
  .slide-fade-leave-active {
    transition: none !important;
  }
  .slide-fade-enter-from,
  .slide-fade-leave-to {
    transform: none;
  }
}
</style>