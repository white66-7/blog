<template>
  <!-- 全局路由出口 -->
  <router-view v-slot="{ Component }">
    <!-- 缓存首页、音乐播放器、文章列表页；过渡动画平滑切换。
         ⚠️ 不要加 mode="out-in"：Vue 3 已知 bug（vuejs/core#7956、vuejs/router#1655），
         从非缓存的详情页切回缓存的列表页时 enter 卡在 opacity:0，导致白屏 -->
    <transition name="page">
      <keep-alive include="BlogHome,MusicPlayer,MainArticle">
        <component :is="Component" />
      </keep-alive>
    </transition>
  </router-view>
  <audio ref="audioRef" style="display: none;"></audio>
  <!-- 全局开场动画：首次完整播放，路由切换时显示快速版 -->
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

// 路由切换加载屏：只有"首次访问某路由"才显示快速版 begin.vue，
// 再次访问已加载过的路由（chunk 已缓存）直接切换，不显示加载屏。
// 按 chunk 维度记录：用路由名 name，无 name 的路由（如 /player 子页）归到首个匹配路由 path
const visitedRoutes = new Set<string>()
let firstNavigation = true
router.beforeEach((to, from) => {
  if (firstNavigation || to.fullPath === from.fullPath) return
  const key = String(to.name ?? to.matched[0]?.path)
  if (visitedRoutes.has(key)) return
  splashMode.value = 'navigating'
  navCompleted.value = false
  showGlobalSplash.value = true
})
router.afterEach((to) => {
  visitedRoutes.add(String(to.name ?? to.matched[0]?.path))
  navCompleted.value = true
  firstNavigation = false
})

const audioRef = ref<HTMLAudioElement | null>(null)

onMounted(async () => {
  showGlobalSplash.value = true // 首次启动显示完整开场动画
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
* { margin: 0; padding: 0; box-sizing: border-box; user-select: none;
 scroll-snap-type: y proximity;}
body {
  background-color: #FAF7F2; 
  min-height: 100vh;
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

/* ========= 路由切换过渡动画 ========= */
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
