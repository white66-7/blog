<template>
  <!-- 全局路由出口 -->
  <router-view v-slot="{ Component }">
    <transition name="page">
      <keep-alive include="BlogHome,MusicPlayer,MainArticle">
        <component :is="Component" />
      </keep-alive>
    </transition>
  </router-view>
  <audio ref="audioRef" style="display: none;"></audio>
  <Teleport to="body">
    <SplashScreen
      v-if="showGlobalSplash"
      :mode="splashMode"
      :navigated="navCompleted"
      @finish="onSplashFinish"
    />
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SplashScreen from '@/views/begin.vue'
import { useLibraryStore } from '@/stores/libraryStore'
import { useAudioStore } from '@/stores/audioStore'
import { prefetchArticleDetail } from '@/modules/bloghome/utils/prefetch'

const router = useRouter()

// 全局开场动画：首次完整播放，路由切换时显示快速版
type SplashMode = 'initial' | 'navigating'

const showGlobalSplash = ref(false)

const splashMode = ref<SplashMode>('initial')
const navCompleted = ref(false)

const onSplashFinish = () => {
  showGlobalSplash.value = false
}

// 路由切换加载屏
const visitedRoutes = new Set<string>()
let firstNavigation = true

let splashTargetPath: string | null = null

router.beforeEach((to, from) => {
  if (firstNavigation || to.fullPath === from.fullPath) return
  const key = String(to.name ?? to.matched[0]?.path)
  if (visitedRoutes.has(key)) return
  splashTargetPath = to.fullPath
  splashMode.value = 'navigating'
  navCompleted.value = false
  showGlobalSplash.value = true
})
router.afterEach((to) => {
  visitedRoutes.add(String(to.name ?? to.matched[0]?.path))
  navCompleted.value = true
  firstNavigation = false
  splashTargetPath = null
})

// 路由导航失败
router.onError((error, to) => {
  if (splashTargetPath === to.fullPath) {
    console.warn('[路由导航失败]', error)
    navCompleted.value = true
    splashTargetPath = null
  }
})

const audioRef = ref<HTMLAudioElement | null>(null)

onMounted(async () => {
  // 首次启动显示完整开场动画
  showGlobalSplash.value = true 
  // 应用启动即预取文章详情页 chunk，消除"首次点击进详情页"的加载卡顿
  prefetchArticleDetail()
  const libraryStore = useLibraryStore()
  const audioStore = useAudioStore()
  
  if (audioRef.value) {
    audioStore.setAudioElement(audioRef.value)
  }
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
* { margin: 0; padding: 0; box-sizing: border-box; user-select: none; }
html {
  background-color: #FAF7F2;
}
body {
  background-color: #FAF7F2;
  min-height: 100vh;
  min-height: 100dvh;
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

/* 路由切换过渡动画 */
.page-enter-active,
.page-leave-active {
  transition: opacity 0.28s ease, transform 0.28s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(14px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-14px);
}

</style>
