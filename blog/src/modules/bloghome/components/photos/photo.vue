<template>
  <div class="album-page-wrapper">
    <!-- ==================== 1. 顶部导航栏 ==================== -->
    <Navbar :transparent="isFirstScreen" />

    <!-- ==================== 2. 滚动内容区（毛玻璃效果） ==================== -->
    <div class="scrollable-content">
      <div class="gallery-container">
        <!-- 视图 A：相册列表与相片列表的切换 -->
        <!-- 【已修改】使用 animate.css 控制出现和消失的动画 -->
        <transition 
 appear
  mode="out-in"
  enter-active-class="animate__animated animate__fadeIn fast-enter"
  leave-active-class="animate__animated animate__fadeOut fast-leave"
>
          <div v-if="!currentAlbum" key="album-list">
            <header class="page-title">
              <div class="title-wrapper">
                <svg class="title-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M0 0h24v24H0z" fill="none" />
                  <g fill="none" fill-rule="evenodd">
                    <path
                      d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
                    <path fill="currentColor"
                      d="M5 3a3 3 0 0 0-3 3v10a2 2 0 0 0 2 2V6a1 1 0 0 1 1-1h14a2 2 0 0 0-2-2zm0 5a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v11.333a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2zm15 0H7v7.848L10.848 12a1.25 1.25 0 0 1 1.768 0l3.241 3.24l.884-.883a1.25 1.25 0 0 1 1.768 0L20 15.848zm-2 3a1.5 1.5 0 1 1-3 0a1.5 1.5 0 0 1 3 0" />
                  </g>
                </svg>
                <h1>相册</h1>
              </div>
            </header>

            <main class="photo-wall">
              <div class="album-stack" v-for="album in processedAlbums" :key="album.id" @click="openAlbum(album)"
                :style="album.style">
                <div class="polaroid">
                  <div class="photo">
                    <img :src="album.cover" class="real-image" />
                    <div class="dust"></div>
                    <div class="scratches"></div>
                  </div>
                  <div class="caption">
                    <span class="album-name">{{ album.title }}</span>
                    <span class="album-count">[{{ album.photos.length }} 张]</span>
                  </div>
                </div>
              </div>
            </main>
             
          </div>

          <!-- 视图 B：具体相片列表 (当选定相册时显示) -->
          <div v-else key="photo-list">
            <header class="page-title album-detail-header">
              <!-- 简洁返回按钮 -->
              <button class="back-btn-simple" @click="closeAlbum">
                <svg height="16" width="16" xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1024 1024">
                  <path
                    d="M874.690416 495.52477c0 11.2973-9.168824 20.466124-20.466124 20.466124l-604.773963 0 188.083679 188.083679c7.992021 7.992021 7.992021 20.947078 0 28.939099-4.001127 3.990894-9.240455 5.996574-14.46955 5.996574-5.239328 0-10.478655-1.995447-14.479783-5.996574l-223.00912-223.00912c-3.837398-3.837398-5.996574-9.046027-5.996574-14.46955 0-5.433756 2.159176-10.632151 5.996574-14.46955l223.019353-223.029586c7.992021-7.992021 20.957311-7.992021 28.949332 0 7.992021 8.002254 7.992021 20.957311 0 28.949332l-188.073446 188.073446 604.753497 0C865.521592 475.058646 874.690416 484.217237 874.690416 495.52477z">
                  </path>
                </svg>
                <span>Back</span>
              </button>
            </header>
            <transition
    appear
    enter-active-class="animate__animated animate__bounceIn fast-enter"
    leave-active-class="animate__animated animate__fadeOut fast-leave"
  >
            <main class="photo-wall">
              <div class="polaroid" v-for="photo in currentAlbum.photos" :key="photo.id" :style="photo.style"
                @click="openLightbox(photo)">
                <div class="photo">
                  <img :src="photo.url" class="real-image" />
                  <div class="dust"></div>
                  <div class="scratches"></div>
                </div>
                <div class="caption">{{ photo.title }}</div>
              </div>
            </main>
            </transition>
          </div>
        </transition>
      </div>
    </div>

    <!-- ==================== 3. 图片全屏放大弹窗 ==================== -->
    <transition name="zoom">
      <div v-if="selectedPhoto" class="lightbox" @click="closeLightbox">
        <button class="lightbox-close" @click="closeLightbox">×</button>
        <div class="lightbox-content" @click.stop>
          <div class="polaroid large-polaroid">
            <div class="photo large-photo">
              <img :src="selectedPhoto.url" class="real-image-large" />
              <div class="dust"></div>
              <div class="scratches"></div>
            </div>
            <div class="caption">{{ selectedPhoto.title }}</div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import Navbar from '@/modules/bloghome/components/load.vue'

// 【新增】引入 Animate.css
import 'animate.css'

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
// import view3 from '@/assets/album/风景/高考结束的小区门口.webp'

import img1 from '@/assets/album/人物/朋友.webp'
import img2 from '@/assets/album/人物/研学.webp'
import img3 from '@/assets/album/人物/dji.webp'

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
      { title: '给朋友拍的照片', url: img1 },
      { title: '研学', url: img2 },
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
    ]
  }
]
const positions = [
  {x:-80,y:20,r:-8},
  {x:40,y:-10,r:6},
  {x:-30,y:40,r:-3},
  {x:70,y:10,r:8},
  {x:-60,y:-30,r:-6},
  {x:30,y:30,r:4},
]
// ==========生成随机样式==========
const getRandomStyle = () => ({
  transform: `rotate(${(Math.random() * 10 - 5).toFixed(1)}deg) translateY(${(Math.random() * 16 - 8).toFixed(1)}px)`,
  '--shine-delay': `${(Math.random() * 4).toFixed(2)}s`
})
const processedAlbums = ref(
  albumsData.map(album => ({
    ...album,
    style: getRandomStyle(),
    photos: album.photos.map((p, i) => ({
      ...p,
      id: `p-${i}`,
      style: getRandomStyle()
    }))
  }))
)

// ========== 其余逻辑不变 ==========
const currentAlbum = ref(null)
const selectedPhoto = ref(null)

const openAlbum = (album) => {
  currentAlbum.value = album
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
const closeAlbum = () => {
  currentAlbum.value = null
}
const openLightbox = (photo) => {
  selectedPhoto.value = photo
  document.body.style.overflow = 'hidden'
}
const closeLightbox = () => {
  selectedPhoto.value = null
  document.body.style.overflow = 'auto'
}

</script>

<style scoped>
/* ==================== 页面背景与遮罩（与文章列表页一致） ==================== */
.album-page-wrapper {
  position: relative;
  width: 100%;
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
  background-color:#f0f0f0;
}



/* 滚动内容区（毛玻璃效果） */
.scrollable-content {
  position: relative;
  z-index: 2;
  height: 100vh;
  height: 100dvh;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(20px) saturate(180%);
}

/* 内容容器 */
.gallery-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 80px 20px 60px;
}

/* ==================== Vue/Animate.css 动画速度优化 ==================== */
/* 出场动画稍微快一点，避免拖沓 */
.fast-enter {
  animation-duration: 0.8s !important;
}
/* 退场动画必须极快，这样出场动画才能瞬间接上 */
.fast-leave {
  animation-duration: 0.2s !important;
}

/* ==================== 以下为原有样式，保持不变 ==================== */
.page-title {
  text-align: start;
  margin-bottom: 50px;
  position: relative;
}

.page-title h1 {
  font-family: 'Microsoft YaHei', sans-serif;
  font-size: 32px;
  color: #fff;
  margin: 0 0 10px 0;
  letter-spacing: 2px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.page-title p {
  color: rgba(255, 255, 255, 0.8);
  font-size: 16px;
  margin: 0;
  font-style: italic;
}

.album-detail-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

/* 简洁返回按钮样式 */
.back-btn-simple {
  display: flex;
  height: 3em;
  width: 100px;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border-radius: 3px;
  letter-spacing: 1px;
  transition: all 0.2s linear;
  cursor: pointer;
  border: none;
  margin-bottom: 20px;
}

.back-btn-simple>svg {
  margin-right: 5px;
  margin-left: 5px;
  font-size: 20px;
  transition: all 0.4s ease-in;
}

.back-btn-simple:hover>svg {
  font-size: 1.2em;
  transform: translateX(-5px);
}

.back-btn-simple:hover {
  box-shadow: 9px 9px 33px #d1d1d1, -9px -9px 33px #ffffff;
  transform: translateY(-2px);
}

.photo-wall{
    position: relative;
    width:100%;
    min-height:800px;

    display:flex;
    flex-wrap:wrap;
    justify-content:center;
    align-items:flex-start;

    gap:70px 60px;

    padding:40px 0 120px;
}
/* 相册堆叠外观 */
.album-stack {
  position: relative;
  cursor: pointer;
  transition: transform 0.3s;
}
.album-stack:nth-child(2n){
    margin-top:80px;
}

.album-stack:nth-child(3n){
    margin-top:-30px;
}

.album-stack:nth-child(4n){
    margin-left:50px;
}
.album-stack::before,
.album-stack::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  z-index: -1;
  transition: all 0.3s;
}

.album-stack::before {
  transform: rotate(-5deg);
  top: 2px;
  left: -4px;
}

.album-stack::after {
  transform: rotate(4deg);
  top: 4px;
  left: 4px;
}

.album-stack:hover {
  transform: translateY(-10px) !important;
  z-index: 10;
}

.album-stack:hover::before {
  transform: rotate(-8deg) translate(-5px, 5px);
}

.album-stack:hover::after {
  transform: rotate(8deg) translate(5px, 5px);
}

.album-name {
  display: block;
  font-weight: bold;
  font-size: 15px;
}

.album-count {
  display: block;
  font-size: 12px;
  color: #888;
  margin-top: 4px;
  font-weight: normal;
}

/* 宝丽来卡片核心样式 */
.polaroid {
  width: 220px;
  padding: 10px 10px 20px 10px;
  background: #fff;
  cursor: pointer;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15), 0 4px 8px rgba(0, 0, 0, 0.15);
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.photo-wall .polaroid:hover {
  transform: translateY(-15px) scale(1.08) rotate(0deg) !important;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2), 0 15px 30px rgba(0, 0, 0, 0.15);
  z-index: 10;
}

.title-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.title-icon {
  width: 2em;
  height: auto;
  flex-shrink: 0;
  color: #fff;
}

.photo {
  width: 100%;
  height: 200px;
  position: relative;
  overflow: hidden;
  background: #1a1a1a;
}

.real-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: contrast(1.1) sepia(0.15);
}

.caption {
  font-family: "Courier New", Courier, monospace;
  text-align: center;
  margin-top: 12px;
  color: #333;
  font-size: 14px;
  font-weight: bold;
  opacity: 0.8;
}

/* 滤镜特效 */
.photo::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(120deg, rgba(255, 255, 255, 0) 30%, rgba(255, 255, 255, 0.4) 32%, rgba(255, 255, 255, 0) 35%);
  animation: shine 4s infinite;
  animation-delay: var(--shine-delay, 0s);
  z-index: 2;
  pointer-events: none;
}

.dust {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-image: radial-gradient(#000 1px, transparent 1px), radial-gradient(#000 1px, transparent 1px);
  background-size: 50px 50px;
  background-position: 0 0, 25px 25px;
  opacity: 0.05;
  pointer-events: none;
  z-index: 3;
}

.scratches {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: linear-gradient(45deg, transparent 45%, rgba(0, 0, 0, 0.05) 46%, transparent 47%) 0 0,
    linear-gradient(-45deg, transparent 45%, rgba(0, 0, 0, 0.05) 46%, transparent 47%) 0 0;
  background-size: 200px 200px;
  opacity: 0.5;
  pointer-events: none;
  z-index: 3;
}

@keyframes shine {
  0% { transform: translateX(-100%) rotate(120deg); }
  20%, 100% { transform: translateX(100%) rotate(120deg); }
}

/* Lightbox 全屏放大 (灯箱动画保持不变) */
.lightbox {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  cursor: zoom-out;
}

.lightbox-close {
  position: absolute;
  top: 30px;
  right: 40px;
  background: none;
  border: none;
  color: white;
  font-size: 40px;
  cursor: pointer;
  transition: transform 0.2s;
}

.lightbox-close:hover {
  transform: scale(1.2);
}

.lightbox-content {
  cursor: default;
}

.large-polaroid {
  width: auto;
  max-width: 95vw;
  padding: 15px 15px 40px 15px;
  cursor: default;
  transform: scale(1) !important;
  display: inline-block;
  box-sizing: border-box;
}

.large-photo {
  width: auto;
  height: auto !important;
  overflow: hidden;
  background: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
}

.large-photo::before {
  content: none;
}

.real-image-large {
  max-width: 100%;
  max-height: 85vh;
  display: block;
  object-fit: contain;
  filter: contrast(1.1) sepia(0.15);
}

.large-polaroid .caption {
  font-size: 20px;
  margin-top: 20px;
}

.zoom-enter-active,
.zoom-leave-active {
  transition: all 0.3s ease;
}
.zoom-enter-from,
.zoom-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* 移动端 */
@media (max-width: 768px) {
  .gallery-container { padding: 60px 16px 40px; }
  .photo-wall { grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 30px; }
  .polaroid { width: 160px; padding: 8px 8px 16px 8px; }
  .photo { height: 150px; }
  .lightbox-close { top: 10px; right: 15px; font-size: 32px; }
  .large-polaroid { width: auto; max-width: 96vw; padding: 8px 8px 28px 8px; }
  .large-photo { height: auto !important; }
  .real-image-large { width: 2000px; max-width: 100%; max-height: 75vh; object-fit: contain; }
  .large-polaroid .caption { font-size: 16px; margin-top: 10px; }
}
</style>