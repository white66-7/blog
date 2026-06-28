<template>
  <router-view v-slot="{ Component }">
    <keep-alive include="BlogHome">
      <component :is="Component" />
    </keep-alive>
  </router-view>
  <audio ref="audioRef" />
</template>

<style>
/* ========== 白天主题（默认） ========== */
:root {
  /* 原有变量（保留，但值改为白天模式） */
  --neon-cyan: #00f3ff;
  --neon-pink: #ff00ff;
  --neon-purple: #bc13fe;
  --bg-dark: #fdf0f0;          
  --bg-panel: #ffffff;        
  --panel-border: rgba(0, 0, 0, 0.08);
  --text-main: #1a1a1a;        
  --text-dim: #6b6b8a;
  --font-mono: 'Courier New', Courier, 'SF Mono', Monaco, monospace;

  --bg-body: #fdf0f0;
  --bg-card: #ffffff;
  --text-primary: #1a1a1a;
  --text-secondary: #444444;
  --border-light: rgba(0, 0, 0, 0.06);
  --shadow-color: rgba(0, 0, 0, 0.1);
  --glass-bg: rgba(255, 255, 255, 0.08);
  --glass-blur: blur(20px);
  --overlay-color: rgba(0, 0, 0, 0.45);
  --nav-bg: rgba(255, 255, 255, 0.9);
  --nav-text: #000000;
  --nav-border: rgba(0, 0, 0, 0.06);
  --tag-bg: #ffffff;
  --tag-text: #000000;
  --placeholder-bg: #eee;
}

/* ========== 黑夜主题 ========== */
[data-theme="dark"] {
  /* 原有变量（黑夜值） */
  --neon-cyan: #00f3ff;
  --neon-pink: #ff00ff;
  --neon-purple: #bc13fe;
  --bg-dark: #07070a;          /* 深色背景 */
  --bg-panel: #0e0e14;         /* 深色面板 */
  --panel-border: rgba(0, 243, 255, 0.08);
  --text-main: #e0e0e8;        /* 浅色文字 */
  --text-dim: #6b6b8a;

  /* 新变量（黑夜值） */
  --bg-body: #0a0a0f;
  --bg-card: #1e1e2a;
  --text-primary: #e0e0e8;
  --text-secondary: #a0a0b8;
  --border-light: rgba(255, 255, 255, 0.08);
  --shadow-color: rgba(0, 0, 0, 0.6);
  --glass-bg: rgba(0, 0, 0, 0.4);
  --glass-blur: blur(20px);
  --overlay-color: rgba(0, 0, 0, 0.7);
  --nav-bg: rgba(10, 10, 20, 0.9);
  --nav-text: #e0e0e8;
  --nav-border: rgba(255, 255, 255, 0.08);
  --tag-bg: #2a2a3a;
  --tag-text: #c0c0d0;
  --placeholder-bg: #2a2a3a;
}

/* ========== 全局样式 ========== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  user-select: none;
  scroll-snap-type: y proximity;
}

body {
  background: var(--bg-dark);   /* 使用变量，白天/黑夜自动切换 */
  color: var(--text-main);      /* 使用变量 */
  font-family: var(--font-mono);
  min-height: 100vh;
  transition: background 0.3s ease, color 0.3s ease; /* 平滑过渡 */
}

#app {
  width: 100%;
}

::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: rgba(0, 243, 255, 0.25);
  border-radius: 3px;
}

body, html, #app, .app-flex, .hero-section,
.hero-section * {
  cursor: default !important;
}

/* 允许真正的交互元素显示手型 */
.hero-section a,
.hero-section button,
.hero-section [role="button"],
.hero-section input[type="submit"] {
  cursor: pointer !important;
}
</style>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAudioStore } from '@/stores/audioStore'

const audioRef = ref<HTMLAudioElement>()
const audioStore = useAudioStore()

onMounted(() => {
  audioStore.setAudioElement(audioRef.value ?? null)
})
</script>