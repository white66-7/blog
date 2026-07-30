<template>
  <div class="album-page-wrapper">
    <!-- ==================== 1. 顶部导航栏 ==================== -->
    <Navbar :transparent="isFirstScreen" />

    <!-- ==================== 2. 全局固定返回按钮 ==================== -->
    <transition name="fade">
      <button 
        v-if="currentAlbum" 
        class="fixed-back-btn back-btn-simple" 
        @click="returnToIndex"
      >
        <svg height="16" width="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
          <path d="M874.690416 495.52477c0 11.2973-9.168824 20.466124-20.466124 20.466124l-604.773963 0 188.083679 188.083679c7.992021 7.992021 7.992021 20.947078 0 28.939099-4.001127 3.990894-9.240455 5.996574-14.46955 5.996574-5.239328 0-10.478655-1.995447-14.479783-5.996574l-223.00912-223.00912c-3.837398-3.837398-5.996574-9.046027-5.996574-14.46955 0-5.433756 2.159176-10.632151 5.996574-14.46955l223.019353-223.029586c7.992021-7.992021 20.957311-7.992021 28.949332 0 7.992021 8.002254 7.992021 20.957311 0 28.949332l-188.073446 188.073446 604.753497 0C865.521592 475.058646 874.690416 484.217237 874.690416 495.52477z"></path>
        </svg>
        <span>返回相册集</span>
      </button>
    </transition>

    <!-- ==================== 3. 全屏书本展示区 ==================== -->
    <div class="book-scene-container">
      
      <!-- 左侧翻页按钮 -->
      <button 
        class="nav-btn prev-btn" 
        @click="prevPage" 
        :class="{ 'hidden': flippedCount === 0 }"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
      </button>

      <!-- 右侧翻页按钮 -->
      <button 
        class="nav-btn next-btn" 
        @click="nextPage" 
        :class="{ 'hidden': flippedCount >= maxFlipped }"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
      </button>

      <div class="book-scene">
        <div class="book-wrapper">
          <div class="book bound">
            <!-- pageWrapper：定位在右半区，承载所有纸张 -->
            <div class="pages" ref="pagesRef" :key="currentAlbum ? currentAlbum.id : 'index'">
              <!-- 一张纸 = front(右页正面) + back(左页背面) -->
              <div 
                v-for="(sheet, index) in sheets" 
                :key="index"
                ref="pageRefs"
                class="page"
                :data-index="index"
                :style="{ pointerEvents: 'none' }"
              >
                <!-- ==================== 正面（右页） ==================== -->
                <div class="page-face front" :style="{ pointerEvents: isFrontVisible(index) ? 'auto' : 'none' }">
                  <!-- 留白页 -->
                  <div v-if="sheet.front.type === 'blank'" class="page-content blank-content">
                    <div class="texture-overlay"></div>
                  </div>
                  <!-- 相册集/相片 列表网格页 -->
                  <div v-else-if="sheet.front.type === 'grid-list'" class="page-content grid-page">
                    <div 
                      v-for="(item, i) in sheet.front.items" 
                      :key="i" 
                      class="polaroid-in-book" 
                      :class="{ 'album-card': !currentAlbum }"
                      @click="!currentAlbum ? selectAlbum(item) : null"
                    >
                      <div class="photo" @click="currentAlbum ? openLightbox(item) : null">
                        <img :src="item.url || item.cover" class="real-image" />
                        <div class="dust"></div><div class="scratches"></div>
                        <div v-if="!currentAlbum" class="click-hint">点击翻阅</div>
                      </div>
                      <div class="caption-handwritten">
                        {{ item.title }}
                        <span v-if="!currentAlbum" class="album-count">[{{ item.photos.length }}张]</span>
                      </div>
                    </div>
                    <div class="page-number">{{ index * 2 }}</div>
                  </div>
                  <div class="page-fold-right"></div>
                </div>

                <!-- ==================== 背面（左页） ==================== -->
                <div class="page-face back" :style="{ pointerEvents: isBackVisible(index) ? 'auto' : 'none' }">
                  <!-- 留白页 -->
                  <div v-if="sheet.back.type === 'blank'" class="page-content blank-content">
                    <div class="texture-overlay"></div>
                  </div>
                  <!-- 相册集/相片 列表网格页 -->
                  <div v-else-if="sheet.back.type === 'grid-list'" class="page-content grid-page">
                    <div 
                      v-for="(item, i) in sheet.back.items" 
                      :key="i" 
                      class="polaroid-in-book" 
                      :class="{ 'album-card': !currentAlbum }"
                      @click="!currentAlbum ? selectAlbum(item) : null"
                    >
                      <div class="photo" @click="currentAlbum ? openLightbox(item) : null">
                        <img :src="item.url || item.cover" class="real-image" />
                        <div class="dust"></div><div class="scratches"></div>
                        <div v-if="!currentAlbum" class="click-hint">点击翻阅</div>
                      </div>
                      <div class="caption-handwritten">
                        {{ item.title }}
                        <span v-if="!currentAlbum" class="album-count">[{{ item.photos.length }}张]</span>
                      </div>
                    </div>
                    <div class="page-number">{{ index * 2 + 1 }}</div>
                  </div>
                  <div class="page-fold-left"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ==================== 4. 图片全屏放大弹窗 ==================== -->
    <transition name="zoom">
      <div v-if="selectedPhoto" class="lightbox" @click="closeLightbox">
        <button class="lightbox-close" @click="closeLightbox">×</button>
        <div class="lightbox-content" @click.stop>
          <div class="polaroid large-polaroid">
            <div class="photo large-photo">
              <img :src="selectedPhoto.url" class="real-image-large" />
              <div class="dust"></div><div class="scratches"></div>
            </div>
            <div class="caption">{{ selectedPhoto.title }}</div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, watch } from 'vue'
import Navbar from '@/modules/bloghome/components/load.vue'
import 'animate.css'
import gsap from 'gsap'

import photo1 from '@/assets/album/动漫/超燃.webp'
import photo2 from '@/assets/album/动漫/沉思.webp'
import photo3 from '@/assets/album/动漫/黑色五叶草.webp'
import photo4 from '@/assets/album/动漫/进击的巨人.webp'
import photo5 from '@/assets/album/动漫/来自深渊.webp'
import photo6 from '@/assets/album/动漫/圆梦.webp'
import photo7 from '@/assets/album/动漫/佐助与鼬.webp'
import photo8 from '@/assets/album/动漫/eye.webp'
import photo9 from '@/assets/album/动漫/video.webp'


import view1 from '@/assets/album/风景/高考结束的小区门口.webp'
import view2 from '@/assets/album/风景/library.webp'
import view3 from '@/assets/album/风景/home.webp'


import img1 from '@/assets/album/人物/朋友.webp'
import img2 from '@/assets/album/人物/研学.webp'
import img3 from '@/assets/album/人物/dji.webp'
import img4 from '@/assets/classmates.webp'

import holiday1 from '@/assets/album/暑假/tree.webp'
import holiday2 from '@/assets/album/暑假/晚餐.webp'
import holiday3 from '@/assets/album/暑假/jpg.webp'
// ========== 2. 手动构建相册数据 ==========
const albumsData = [
  {
    id: 'custom',
    title: '动漫',
    cover: photo6,
    photos: [
      { title: '沉思', url: photo2 },
      { title: '圆梦', url: photo6 },
      { title: '佐助与鼬', url: photo7 },
      { title: '黑色五叶草-一部非常惊艳的战斗番', url: photo3 },
      { title: '进击的巨人', url: photo4 },
      { title: '燃到起鸡皮疙瘩', url: photo1 },
      { title: '来自深渊-黄金乡', url: photo5 },
      { title: '一双全是你的眼睛', url: photo8 },
      { title: '慢节奏的异世界好番', url: photo9 },
    ]
  },
  {
    id: 'persons',
    title: '人物',
    cover: img2,
    photos: [
      { title: '研学', url: img2 },
      { title: '高中同学们', url: img4 },
      { title: '给朋友拍的照片', url: img1 },
      { title: '在旧宿舍的最后一晚', url: img3 },
    ]
  },
  {
    id: 'views',
    title: '风景',
    cover: view1,
    photos: [
      { title: '高考结束的小区门口', url: view1 },
      { title: '期末周的图书馆', url: view2 },
      { title: '我的老家', url: view3 },
    ]
  },
  {
    id: 'holiday',
    title: '大一暑假',
    cover: holiday1,
    photos: [
      { title: '不是说7月这几天要硬抗台风吗', url: holiday1 },
      { title: '极其奢侈的一顿晚餐', url: holiday2 },
      { title: 'skill生的图,效果一般', url: holiday3 },
    ]
  }
]
// ================= 状态控制 =================
const isFirstScreen = ref(false) 
const currentAlbum = ref(null)      
const flippedCount = ref(0)         // 已翻纸张数（双页模型）
const isAnimating = ref(false)      
const selectedPhoto = ref(null)     

const pagesRef = ref(null)
const pageRefs = ref([])

const FLIP_DURATION = 1.0 // GSAP 翻页时长（秒）

const ITEMS_PER_PAGE = 2 // 每页放置的项目数量

// ================= 工具函数：数组分块 =================
const chunkArray = (array, size) => {
  const result = []
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size))
  }
  return result
}

// ================= 原始网格页列表 =================
const bookPages = computed(() => {
  let pages = []
  
  if (!currentAlbum.value) {
    // 【模式1：相册集大纲】直接展示相册网格
    const chunks = chunkArray(albumsData, ITEMS_PER_PAGE)
    chunks.forEach(chunk => {
      pages.push({ type: 'grid-list', items: chunk })
    })
  } else {
    // 【模式2：具体相册内的相片】逐页展示照片
    const album = currentAlbum.value
    const chunks = chunkArray(album.photos, ITEMS_PER_PAGE)
    chunks.forEach(chunk => {
      pages.push({ type: 'grid-list', items: chunk })
    })
  }

  return pages
})

// ================= 双页模型：两两配对成纸张 =================
// 每张纸 front=右页, back=左页；翻过去后 back 朝上显示在左侧
const sheets = computed(() => {
  const pages = bookPages.value
  const result = []
  for (let i = 0; i < pages.length; i += 2) {
    result.push({
      front: pages[i],
      back: pages[i + 1] || { type: 'blank' } // 奇数页时背面留白
    })
  }
  return result
})

// 最大可翻纸张数（翻完即到末页）
const maxFlipped = computed(() => sheets.value.length)

// ================= 命中测试精确控制 =================
// .page 容器始终 pointer-events:none，杜绝翻转后 DOM 盒子的幽灵命中区
// 关键：backface-visibility:hidden 只隐藏视觉，不阻止命中测试！
// 所以必须只让"当前唯一可见的两个面"启用 pointer-events:auto，
// 其余所有面一律禁用，否则后层纸张的面会拦截点击。
const isFrontVisible = (index) => index === flippedCount.value
const isBackVisible = (index) => index === flippedCount.value - 1

// ================= GSAP 初始化：设置初始 rotationY 与层叠 =================
const initPages = () => {
  if (!pageRefs.value || pageRefs.value.length === 0) return
  
  const total = pageRefs.value.length
  
  pageRefs.value.forEach((pageEl, index) => {
    // preserve-3d 下 z-index 不可靠，用 translateZ 控制层叠
    // 未翻栈：索引越小越靠前（当前页在最上层）→ translateZ 越大
    gsap.set(pageEl, {
      rotationY: 0,
      z: (total - index) * 2,       // 每 2px 一层，避免 z-fighting
      force3D: true
    })
  })
  
  flippedCount.value = 0
}

// ================= GSAP 翻页控制逻辑（双页翻转） =================
const nextPage = () => {
  if (isAnimating.value || flippedCount.value >= maxFlipped.value) return
  isAnimating.value = true
  
  const index = flippedCount.value
  const pageEl = pageRefs.value[index]
  
  if (!pageEl) {
    isAnimating.value = false
    return
  }
  
  // 翻过去：绕书脊向左翻转 180°
  // translateZ 降到已翻栈层（index+1，越近翻的越在上层）
  gsap.to(pageEl, {
    rotationY: -180,
    z: (index + 1) * 2,
    duration: FLIP_DURATION,
    ease: 'power2.inOut',
    force3D: true,
    onComplete: () => {
      isAnimating.value = false
    }
  })
  
  flippedCount.value++
}

const prevPage = () => {
  if (isAnimating.value || flippedCount.value <= 0) return
  isAnimating.value = true
  
  const index = flippedCount.value - 1
  const pageEl = pageRefs.value[index]
  const total = pageRefs.value.length
  
  if (!pageEl) {
    isAnimating.value = false
    return
  }
  
  // 翻回来：绕书脊向右翻转回 0°
  // translateZ 恢复为未翻栈层（total-index，索引越小越在上层）
  gsap.to(pageEl, {
    rotationY: 0,
    z: (total - index) * 2,
    duration: FLIP_DURATION,
    ease: 'power2.inOut',
    force3D: true,
    onComplete: () => {
      isAnimating.value = false
    }
  })
  
  flippedCount.value--
}

// ================= 监听数据变化，重新初始化 GSAP =================
watch([sheets, currentAlbum], () => {
  nextTick(() => {
    initPages()
  })
}, { flush: 'post' })

onMounted(() => {
  nextTick(() => {
    initPages()
  })
})

// ================= 交互动作 =================
const selectAlbum = (album) => {
  currentAlbum.value = album
  flippedCount.value = 0 // 进入相册，从第一张纸开始
}

const returnToIndex = () => {
  currentAlbum.value = null
  flippedCount.value = 0 // 回到相册集，从第一张纸开始
}

const openLightbox = (photo) => {
  selectedPhoto.value = photo
}

const closeLightbox = () => {
  selectedPhoto.value = null
}
</script>

<style scoped>
@import url(https://fonts.googleapis.com/css?family=Crimson+Text:400,700|Playfair+Display:400,700|Rock+Salt:400);

.album-page-wrapper {
  /* 双页书本：整本书宽度 = 单页宽度 * 2 */
  --book-w: min(36vw, calc((100vh - 120px) / 1.35));
  --book-h: calc(var(--book-w) * 1.35);
  --page-color: #fdfbf7;
  
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background-color: transparent; 
}

.book-scene-container {
  position: relative;
  z-index: 2;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px) saturate(180%);
}

/* ==================== 独立返回按钮 (左上角悬浮) ==================== */
.fixed-back-btn {
  position: absolute;
  top: 90px;
  left: 40px;
  display: flex; height: 3em; width: 140px; align-items: center; justify-content: center;
  background-color: #fff; border-radius: 4px; border: none; z-index: 1000;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15); cursor: pointer !important;
  font-family: "Microsoft YaHei", sans-serif; font-weight: bold;
  transition: all 0.3s;
}
.fixed-back-btn:hover { transform: translateY(-3px); box-shadow: 0 6px 15px rgba(0,0,0,0.2); }
.fixed-back-btn svg { margin-right: 5px; transition: transform 0.3s; }
.fixed-back-btn:hover svg { transform: translateX(-4px); }

/* 淡入淡出动画 */
.fade-enter-active, .fade-leave-active { transition: opacity 0.5s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* ==================== 左右专属导航按钮 ==================== */
.nav-btn {
  position: absolute; top: 50%; transform: translateY(-50%);
  width: 60px; height: 60px; border-radius: 50%; background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(0,0,0,0.05); box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  display: flex; justify-content: center; align-items: center; z-index: 1000;
  cursor: pointer !important; transition: all 0.3s ease; color: #333;
}
.nav-btn:hover { background: #fff; box-shadow: 0 6px 20px rgba(0,0,0,0.15); transform: translateY(-50%) scale(1.1); }
.nav-btn svg { width: 30px; height: 30px; }
.prev-btn { left: 5%; }
.next-btn { right: 5%; }
.nav-btn.hidden { opacity: 0; pointer-events: none; transform: translateY(-50%) scale(0.8); }

/* ==================== 3D 翻书区域（双页） ==================== */
.book-scene {
  perspective: 250vw;    /* 透视容器，放最外层最稳 */
  width: calc(var(--book-w) * 2);  /* 整本书宽度 */
  height: var(--book-h);
}

.book-wrapper {
  position: relative; width: 100%; height: 100%;
}

.book-wrapper::before {
  content: ''; position: absolute; top: -15px; bottom: -15px; left: -15px; right: -15px;
  background-color: #5c3012; 
  background-image: radial-gradient(circle, rgba(0,0,0,0) 40%, rgba(0,0,0,0.5) 100%);
  border-radius: 6px; box-shadow: inset 4px 4px 10px rgba(255,255,255,0.1), 0 20px 40px rgba(0,0,0,0.5);
  z-index: -1;
}

/* 中缝阴影 */
.book-wrapper::after {
  content: ''; position: absolute; top: -15px; bottom: -15px; left: 50%; transform: translateX(-50%);
  width: 60px;
  background: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 46%, rgba(0,0,0,0.7) 49%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0.7) 51%, rgba(0,0,0,0.3) 54%, transparent 100%);
  z-index: 100; pointer-events: none; 
}

.book.bound {
  width: 100%; height: 100%; transform: rotateX(8deg); transform-style: preserve-3d;
}

/* pageWrapper：定位在右半区，承载纸张堆叠 */
.pages {
  position: absolute;
  top: 0;
  left: 50%;
  width: 50%;           /* 单页宽度 */
  height: 100%;
  transform-style: preserve-3d;
}

/* ==================== 双页纸张模型 ==================== */
.page {
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transform-origin: left center;     /* 绕左边沿（书脊）翻转 */
  /* GSAP 控制 rotationY/zIndex，此处不设 transition 避免 CSS/GSAP 冲突 */
}

/* 两个面 */
.page-face {
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  backface-visibility: hidden;
  background-color: var(--page-color);
  background-image: radial-gradient(circle, rgba(0,0,0,0) 60%, rgba(0,0,0,0.03) 100%);
}

/* 正面（右页）：朝右展开，内侧（书脊侧）略暗 */
.front {
  border-radius: 0 4px 4px 0;
  box-shadow: inset 2px 0 5px rgba(0,0,0,0.1);
}

/* 背面（左页）：预先翻转，翻过去后朝上显示在左侧 */
.back {
  transform: rotateY(180deg);
  border-radius: 4px 0 0 4px;
  box-shadow: inset -2px 0 5px rgba(0,0,0,0.1);
}

/* 折角装饰 */
.page-fold-right {
  position: absolute; top: 0; right: 0;
  width: 0; height: 0;
  border-left: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
  box-shadow: -5px 5px 10px rgba(221,221,221,0.6);
  pointer-events: none;
}
.page-fold-left {
  position: absolute; top: 0; left: 0;
  width: 0; height: 0;
  border-right: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
  box-shadow: 5px 5px 10px rgba(221,221,221,0.6);
  pointer-events: none;
}

/* ==================== 页面内容排版 ==================== */
.page-content {
  width: 100%; height: 100%; padding: 20px; position: relative; box-sizing: border-box;
  display: flex; flex-direction: column; align-items: center; justify-content: center;
  overflow: hidden;
}

/* ========== 网格排版 (一页多图) ========== */
.grid-page {
  justify-content: space-evenly;
  padding: 20px;
}

.polaroid-in-book {
  width: 75%;
  padding: 8px 8px 16px 8px; background: white;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15); 
  transition: transform 0.3s, box-shadow 0.3s;
  flex: 1 1 0; min-height: 0; display: flex; flex-direction: column;
}

/* 让相片在同一页里产生一些凌乱交错的真实感 */
.polaroid-in-book:nth-child(odd) { transform: rotate(-2deg); }
.polaroid-in-book:nth-child(even) { transform: rotate(1.5deg); }

.polaroid-in-book.album-card { cursor: pointer !important; }
.polaroid-in-book:hover { transform: scale(1.05) rotate(0deg); box-shadow: 0 8px 25px rgba(0,0,0,0.2); }

.polaroid-in-book .photo { 
  flex: 1 1 0; min-height: 0;
  position: relative; overflow: hidden; background: #1a1a1a; cursor: zoom-in !important;
}
.album-card .photo { cursor: pointer !important; }

.click-hint {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.4); color: white; display: flex; justify-content: center; align-items: center;
  font-size: 1.2rem; font-weight: bold; opacity: 0; transition: opacity 0.3s; z-index: 10; pointer-events: none;
}
.album-card:hover .click-hint { opacity: 1; }

.caption-handwritten {
  font-family: 'Rock Salt', cursive, 'Microsoft YaHei'; text-align: center; margin-top: 10px; font-size: 14px; color: #333;
}
.album-count { display: block; font-family: 'Playfair Display', serif; font-size: 12px; color: #888; margin-top: 5px; }

/* 页码 */
.page-number { position: absolute; bottom: 20px; font-family: 'Playfair Display', serif; font-weight: bold; opacity: 0.5; pointer-events: none; }
.front .page-number { right: 30px; }
.back .page-number { left: 30px; }

/* 滤镜动画 */
.real-image { width: 100%; height: 100%; object-fit: cover; filter: contrast(1.1) sepia(0.15); }
.photo::before { content: ""; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(120deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.4) 32%, rgba(255,255,255,0) 35%); animation: shine 4s infinite; z-index: 2; pointer-events: none; }
.dust { position: absolute; width: 100%; height: 100%; top: 0; left: 0; background-image: radial-gradient(#000 1px, transparent 1px), radial-gradient(#000 1px, transparent 1px); background-size: 50px 50px; background-position: 0 0, 25px 25px; opacity: 0.05; z-index: 3; pointer-events: none; }
.scratches { position: absolute; width: 100%; height: 100%; top: 0; left: 0; background: linear-gradient(45deg, transparent 45%, rgba(0,0,0,0.05) 46%, transparent 47%), linear-gradient(-45deg, transparent 45%, rgba(0,0,0,0.05) 46%, transparent 47%); background-size: 200px 200px; opacity: 0.5; z-index: 3; pointer-events: none; }
@keyframes shine { 0% { transform: translateX(-100%) rotate(120deg); } 20%, 100% { transform: translateX(100%) rotate(120deg); } }

/* ==================== Lightbox 全屏放大 ==================== */
.lightbox {
  position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  background: rgba(0, 0, 0, 0.85); backdrop-filter: blur(5px);
  display: flex; justify-content: center; align-items: center; z-index: 9999; cursor: zoom-out !important;
}
.lightbox-close { position: absolute; top: 30px; right: 40px; background: none; border: none; color: white; font-size: 40px; cursor: pointer !important; }
.large-polaroid { width: auto; max-width: 95vw; padding: 15px 15px 40px 15px; cursor: default; }
.large-photo { height: auto !important; background: transparent; }
.large-photo::before { content: none; }
.real-image-large { max-width: 100%; max-height: 85vh; object-fit: contain; filter: contrast(1.1) sepia(0.15); }

/* ==================== 移动端适配 ==================== */
@media (max-width: 768px) {
  .album-page-wrapper {
    --book-w: min(45vw, calc((100vh - 100px) / 1.4));
    --book-h: calc(var(--book-w) * 1.4);
  }
  .fixed-back-btn { top: 70px; left: 20px; width: 120px; font-size: 0.9rem; }
  .nav-btn { width: 40px; height: 40px; }
  .nav-btn svg { width: 20px; height: 20px; }
  .prev-btn { left: 2%; }
  .next-btn { right: 2%; }
  .polaroid-in-book { width: 90%; padding: 6px 6px 12px 6px; }
}
</style>
