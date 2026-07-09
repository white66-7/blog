<template>
  <!-- 全局路由出口 -->
  <router-view v-slot="{ Component }">
    <!-- 缓存首页、音乐播放器、文章列表页 -->
    <keep-alive include="BlogHome,MusicPlayer,MainArticle">
      <component :is="Component" />
    </keep-alive>
  </router-view>

  <!-- 全局开场动画 -->
  <Teleport to="body">
    <SplashScreen v-if="showGlobalSplash" @finish="onSplashFinish" />
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import SplashScreen from '@/views/begin.vue'
import { useLibraryStore } from '@/stores/libraryStore'
import { useAudioStore } from '@/stores/audioStore'

const showGlobalSplash = ref(true)

const onSplashFinish = () => {
  showGlobalSplash.value = false
}

onMounted(async () => {
  const libraryStore = useLibraryStore()
  const audioStore = useAudioStore()
  
  await libraryStore.loadDate()
  audioStore.restoreFromLocalStorage()
  
  if (audioStore.curIdx === -1 && libraryStore.filteredList.length > 0) {
    const targetIdx = libraryStore.filteredList[0]?._globalIdx || 0
    await audioStore.loadSongByIndex(targetIdx)
  }
  else if (audioStore.curIdx !== -1 && !audioStore.currentAudioUrl) {
    await audioStore.loadSongByIndex(audioStore.curIdx)
  }
  else if (audioStore.curIdx !== -1 && audioStore.currentAudioUrl) {
    audioStore.syncToElement()
  }
})
</script>

<style>
/* ... 你的全局样式保持不变 ... */
</style>
<style>
:root {
  --neon-cyan: #00f3ff;
  --neon-pink: #ff00ff;
  --neon-purple: #bc13fe;
  --bg-dark: #07070a;
  --bg-panel: #0e0e14;
  --panel-border: rgba(0, 243, 255, 0.08);
  --text-main: #e0e0e8;
  --text-dim: #6b6b8a;
  --font-mono: 'Courier New', Courier, 'SF Mono', Monaco, monospace;
}
* { margin: 0; padding: 0; box-sizing: border-box; user-select: none;
 scroll-snap-type: y proximity;}
body {
  background: var(--bg-dark);
  color: var(--text-main);
  font-family: var(--font-mono);
  min-height: 100vh;
}
@font-face {
  font-family: 'YouSheBiaoTiHei';
  src: url('/text/YouSheBiaoTiHei-2.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'ShangShouJiangHuShuFa';
  src: url('/text/No.289-ShangShouJiangHuShuFaTi-2.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: 'ZiTiGuanJiaKaiTi';
  src: url('/text/ZiTiGuanJiaKaiTi-1.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
#app {
  width: 100%;
}
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(0, 243, 255, 0.25); border-radius: 3px; }
body, html, #app, .app-flex, .hero-section,
.hero-section * {
  cursor: default !important;
}

.hero-section a,
.hero-section button,
.hero-section [role="button"],
.hero-section input[type="submit"] {
  cursor: pointer !important;
}
</style>
