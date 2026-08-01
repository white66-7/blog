<template>
  <div class="album-page-wrapper">
    <Navbar :transparent="isFirstScreen" />

    <!-- 全局返回按钮 (进入相册内部时显示) -->
    <transition name="fade">
      <button v-if="currentAlbum" class="fixed-back-btn" @click="returnToShelf">
        <svg height="16" width="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
          <path
            d="M874.690416 495.52477c0 11.2973-9.168824 20.466124-20.466124 20.466124l-604.773963 0 188.083679 188.083679c7.992021 7.992021 7.992021 20.947078 0 28.939099-4.001127 3.990894-9.240455 5.996574-14.46955 5.996574-5.239328 0-10.478655-1.995447-14.479783-5.996574l-223.00912-223.00912c-3.837398-3.837398-5.996574-9.046027-5.996574-14.46955 0-5.433756 2.159176-10.632151 5.996574-14.46955l223.019353-223.029586c7.992021-7.992021 20.957311-7.992021 28.949332 0 7.992021 8.002254 7.992021 20.957311 0 28.949332l-188.073446 188.073446 604.753497 0C865.521592 475.058646 874.690416 484.217237 874.690416 495.52477z">
          </path>
        </svg>
        <span>返回书架</span>
      </button>
    </transition>

    <!-- ================= 视口切换区 ================= -->
    <div class="view-container">

      <!-- 视图 A：相册书架 (没有选中相册时显示) -->
      <AlbumShelf v-if="!currentAlbum" :albums="albumsData" @select-album="handleSelectAlbum" />

      <!-- 视图 B：原版 3D 翻页书本 (选中相册时显示该相册的相片) -->
      <BookScene v-else :sheets="sheets" :cover="currentAlbum.cover" @open-photo="handleOpenPhoto" />

    </div>

    <!-- ================= 照片详情独立弹窗 ================= -->
    <PhotoLightbox v-if="selectedPhoto" :photo="selectedPhoto" @close="selectedPhoto = null" />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import Navbar from '@/modules/bloghome/components/load.vue'

import AlbumShelf from './AlbumShelf.vue'
import BookScene from './BookScene.vue'
import PhotoLightbox from './PhotoLightbox.vue'

import cover1 from '@/assets/cover/help.webp'
import cover2 from '@/assets/cover/videos.webp'
import cover3 from '@/assets/cover/view.webp'
import cover4 from '@/assets/cover/friend.webp'


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
    cover: cover1,
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
    cover: cover2,
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
    cover: cover3,
    photos: [
      { title: '高考结束的小区门口', url: view1 },
      { title: '期末周的图书馆', url: view2 },
      { title: '我的老家', url: view3 },
    ]
  },
  {
    id: 'holiday',
    title: '大一暑假',
    cover: cover4,
    photos: [
      { title: '不是说7月这几天要硬抗台风吗', url: holiday1 },
      { title: '极其奢侈的一顿晚餐', url: holiday2 },
      { title: 'skill生的图,效果一般', url: holiday3 },
    ]
  }
]
const isFirstScreen = ref(false)
const currentAlbum = ref(null)
const selectedPhoto = ref(null)

// 将选中的相册内的照片，转化为双页书本的数据结构
const sheets = computed(() => {
  if (!currentAlbum.value) return []

  const photos = currentAlbum.value.photos
  // 每页放 2 张照片
  const pages = []
  for (let i = 0; i < photos.length; i += 2) {
    pages.push({ type: 'grid-list', items: photos.slice(i, i + 2) })
  }

  // 每 2 页合并为一张纸 (front, back)
  const result = []
  for (let i = 0; i < pages.length; i += 2) {
    result.push({
      front: pages[i],
      back: pages[i + 1] || { type: 'blank' }
    })
  }
  return result
})

const handleSelectAlbum = (album) => {
  currentAlbum.value = album
}

const returnToShelf = () => {
  currentAlbum.value = null
}

const handleOpenPhoto = (photo) => {
  selectedPhoto.value = photo
}
</script>

<style scoped>
.album-page-wrapper {
  position: relative;
  width: 100%;
  min-height: 100vh;
  background-color: #FAF7F2;
  overflow: hidden;
}

.view-container {
  width: 100%;
  height: 100%;
}

.fixed-back-btn {
  position: fixed;
  top: 90px;
  left: 40px;
  width: 120px;
  height: 3em;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border-radius: 4px;
  border: none;
  z-index: 1000;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  transition: all 0.3s;
  font-weight: bold;
  color: #333;
}

.fixed-back-btn svg {
  margin-right: 5px;
  transition: transform 0.3s;
}

.fixed-back-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2);
}

.fixed-back-btn:hover svg {
  transform: translateX(-4px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>