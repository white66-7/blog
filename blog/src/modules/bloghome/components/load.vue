<template>
  <nav 
    class="navbar" 
    :class="{ 
      'navbar--transparent': transparent,
      'navbar--hidden': !isVisible 
    }"
  >
    <div class="navbar__left" @click="$router.push('/')">
      <svg viewBox="0 0 120 20" class="wave-svg">
        <defs>
          <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="5%" stop-color="#FF4500"/>
            <stop offset="95%" stop-color="#FF0000"/>
          </linearGradient>
          <pattern id="wave" x="0" y="0" width="120" height="20" patternUnits="userSpaceOnUse">
            <path id="wavePath" d="M-40 9 Q-30 7 -20 9 T0 9 T20 9 T40 9 T60 9 T80 9 T100 9 T120 9 V20 H-40z" fill="url(#gradient)">
              <animateTransform
                attributeName="transform"
                begin="0s"
                dur="1.5s"
                type="translate"
                from="0,0"
                to="40,0"
                repeatCount="indefinite" 
              />
            </path>
          </pattern>
        </defs>
        <text text-anchor="middle" x="60" y="15" font-size="17" font-family="Microsoft YaHei, sans-serif" font-weight="bold" fill="green">第三训练场</text>
        <text text-anchor="middle" x="60" y="15" font-size="17" font-family="Microsoft YaHei, sans-serif" font-weight="bold" fill="url(#wave)" fill-opacity="0.9">第三训练场</text>
        <text text-anchor="middle" x="60" y="15" font-size="17" font-family="Microsoft YaHei, sans-serif" font-weight="bold" fill="url(#gradient)" fill-opacity="0.1">第三训练场</text>
      </svg>
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 32 32" class="nav-icon">
        <path d="M0 0h32v32H0z" fill="none" />
        <g fill="none">
          <path fill="#D3D3D3" d="M4.45 6.52a.47.47 0 0 1-.35-.15c-.2-.2-.2-.51 0-.71C6.47 3.3 9.61 2 12.96 2c1.23 0 2.46.18 3.63.54a.5.5 0 0 1 .33.62c-.08.27-.36.42-.62.33A11.8 11.8 0 0 0 12.96 3C9.88 3 6.98 4.2 4.81 6.38c-.1.1-.23.14-.36.14" />
          <path fill="#D3D3D3" d="M2.5 16.48c-.28 0-.5-.22-.5-.5C2 9.94 6.92 5.02 12.96 5.02c.28 0 .5.22.5.5s-.22.5-.5.5C7.47 6.02 3 10.49 3 15.98c0 .28-.22.5-.5.5m19.81 0c0 .28.22.5.5.5c1.49 0 2.92-.45 4.13-1.31A7.2 7.2 0 0 0 30 9.78c0-.27-.22-.5-.5-.5s-.5.22-.5.5c0 2.02-.99 3.91-2.63 5.08a6.2 6.2 0 0 1-3.56 1.12c-.28 0-.5.22-.5.5" />
          <path fill="#00D26A" d="M28 6.43V4.48l-.69.52h-5.35c-4.17 0-7.55 3.53-7.55 7.7v.43c0 .47.38.85.85.85h5.19A7.55 7.55 0 0 0 28 6.43M5 18.88v-2.87L6 17h7.89c6.15 0 11.14 4.99 11.14 11.14v.63c0 .69-.56 1.25-1.25 1.25h-7.64C9.99 30.02 5 25.03 5 18.88" />
          <path fill="#008463" d="M18.67 11.35a.514.514 0 0 1-.69-.21a.5.5 0 0 1 .2-.69l8.08-4.41c.44-.25.72-.71.72-1.22V2.53c0-.28.23-.51.51-.51s.51.23.51.51v2.3c0 .88-.48 1.68-1.25 2.11zm.08 14.77q.18.09.36.09c.26 0 .52-.14.65-.39c.2-.37.06-.82-.3-1.02l-11.9-6.5a2.05 2.05 0 0 1-1.06-1.79v-3.38c0-.41-.34-.75-.75-.75s-.75.34-.75.75v3.38c0 1.3.71 2.49 1.85 3.11z" />
        </g>
      </svg>
    </div>
    <div class="navbar__right">
      <router-link to="/" class="navbar__item">
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
          <path d="M0 0h24v24H0z" fill="none" />
          <path fill="currentColor" d="M4 19v-9q0-.475.213-.9t.587-.7l6-4.5q.525-.4 1.2-.4t1.2.4l6 4.5q.375.275.588.7T20 10v9q0 .825-.588 1.413T18 21h-3q-.425 0-.712-.288T14 20v-5q0-.425-.288-.712T13 14h-2q-.425 0-.712.288T10 15v5q0 .425-.288.713T9 21H6q-.825 0-1.412-.587T4 19" />
        </svg>
        <span>主页</span>
      </router-link>
      <router-link to="/articles" class="navbar__item">
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
          <path d="M0 0h24v24H0z" fill="none" />
          <path fill="currentColor" d="M5 21q-.825 0-1.412-.587T3 19V5q0-.825.588-1.412T5 3h14q.825 0 1.413.588T21 5v14q0 .825-.587 1.413T19 21zm2-4h7v-2H7zm0-4h10v-2H7zm0-4h10V7H7z" />
        </svg>
        <span>文章</span>
      </router-link>
      <router-link to="/photos" class="navbar__item">
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 56 56">
          <path d="M0 0h56v56H0z" fill="none" />
          <path fill="currentColor" d="M7.715 49.574h40.57c4.899 0 7.36-2.437 7.36-7.265V13.69c0-4.828-2.461-7.265-7.36-7.265H7.715C2.84 6.426.355 8.84.355 13.69v28.62c0 4.851 2.485 7.265 7.36 7.265m10.218-21c-3.187 0-5.789-2.601-5.789-5.789c0-3.164 2.602-5.789 5.79-5.789c3.164 0 5.765 2.625 5.765 5.79c0 3.187-2.601 5.788-5.766 5.788M7.762 45.801c-2.25 0-3.633-1.36-3.633-3.657v-1.43l7.195-6.28c1.031-.914 2.156-1.383 3.211-1.383c1.125 0 2.32.469 3.352 1.43l4.5 4.03l11.18-9.937c1.171-1.031 2.46-1.5 3.773-1.5c1.289 0 2.625.492 3.75 1.524l10.78 9.984v3.61c0 2.25-1.405 3.609-3.632 3.609Z" />
        </svg>
        <span>相册</span>
      </router-link>
      <router-link to="/projects" class="navbar__item">
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
          <path d="M0 0h24v24H0z" fill="none" />
          <path fill="currentColor" d="M13 9V3.5L18.5 9M6 2c-1.11 0-2 .89-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" />
        </svg>
        <span>项目</span>
      </router-link>
      <router-link to="/about" class="navbar__item">
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
          <path d="M0 0h24v24H0z" fill="none" />
          <path fill="currentColor" d="M13 9h-2V7h2m0 10h-2v-6h2m-1-9A10 10 0 0 0 2 12a10 10 0 0 0 10 10a10 10 0 0 0 10-10A10 10 0 0 0 12 2" />
        </svg>
        <span>关于</span>
      </router-link>
    </div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// 接收父组件传递过来的属性（比如用来判断是否在第一屏）
defineProps({
  transparent: Boolean
})

// 控制导航栏显示/上移隐藏的状态
const isVisible = ref(true)
let timer = null

// 鼠标移动时的处理函数
const handleMouseMove = () => {
  // 只要鼠标动了，就立即显示导航栏
  if (!isVisible.value) {
    isVisible.value = true
  }
  
  // 清除上一次的定时器
  if (timer) clearTimeout(timer)
  
  // 重新开启 3 秒定时器
  timer = setTimeout(() => {
    isVisible.value = false
  }, 3000)
}

// 组件挂载时添加全局鼠标移动监听
onMounted(() => {
  window.addEventListener('mousemove', handleMouseMove)
  // 初始化时，默认开启一次定时器
  timer = setTimeout(() => {
    isVisible.value = false
  }, 3000)
})

// 组件销毁时移除监听，避免内存泄漏
onUnmounted(() => {
  window.removeEventListener('mousemove', handleMouseMove)
  if (timer) clearTimeout(timer)
})
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 60px;
  display: flex;
  align-items: center;
  color: #000000;
  justify-content: space-between;
  padding: 0 40px 0 0px;
  box-sizing: border-box;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  z-index: 100;
  /* 确保 transform 在过渡动画列表中 */
  transition: transform 0.4s ease, background 0.3s ease, backdrop-filter 0.3s ease, border-color 0.3s ease, color 0.3s ease;
}

/* 隐藏状态：鼠标静止 3 秒后上划隐藏整个组件 */
.navbar--hidden {
  transform: translateY(-100%);
}

.nav-icon {
  height: 28px;           
  width: auto;
  flex-shrink: 0;
  margin-left: -30px;
}

/* ===== 透明模式（第一屏） ===== */
/* 你原本的逻辑已完整保留 */
.navbar--transparent {
  background: transparent !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  border-bottom: none !important;
  color: white !important;
}

/* 在透明模式（第一屏）下隐藏右侧导航链接 */
.navbar--transparent .navbar__right {
  display: none;
}

.navbar--transparent .navbar__left {
  color: white !important;
}

.navbar__left {
  display: flex;
  align-items: center;
  height: 100%;
  cursor: pointer;
}

.wave-svg {
  height: 40px;
  width: auto;
  display: block;
}
.navbar__left:hover {
  color: #e05a5a;
}

/* ===== 右侧菜单：居中 ===== */
.navbar__right {
  display: flex;
  gap: 24px;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.navbar__item {
  display: flex;
  align-items: center;
  gap: 6px;
  color: inherit;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.5px;
  transition: color 0.2s;
  outline: none;
}

.navbar__item svg {
  width: 30px;
  height: auto;
  flex-shrink: 0;
}

.navbar__item span {
  white-space: nowrap;
  font-family: 'SimHei', 'Microsoft YaHei', sans-serif;
}

.navbar__item:focus-visible {
  outline: none;
  box-shadow: none; 
}

.navbar__item:hover,
.navbar__item.router-link-active {
  color: #e05a5a;
  border: none;
  outline: none;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .navbar {
    padding: 0 16px;
  }
  .navbar__item span {
    display: none;
  }
  .navbar__right {
    gap: 16px;
  }
}
</style>
