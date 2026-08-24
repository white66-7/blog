<template>
  <div class="album-page-wrapper">
    <Navbar :transparent="isFirstScreen" />

    <!-- 全局返回按钮 (进入相册内部时显示) -->
    <transition name="fade">
      <button v-if="currentAlbum" class="fixed-back-btn" @click="returnToShelf">
        <span>返回</span>
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
import photo10 from '@/assets/album/动漫/pair.webp'
import photo11 from '@/assets/album/动漫/阿玛天纳斯.webp'
import photo12 from '@/assets/album/动漫/向日葵.webp'
import photo13 from '@/assets/album/动漫/战败.webp'

import view1 from '@/assets/album/风景/高考结束的小区门口.webp'
import view2 from '@/assets/album/风景/library.webp'
import view3 from '@/assets/album/风景/home.webp'
import view4 from '@/assets/album/风景/十字路口.webp'
import view5 from '@/assets/album/风景/星空.webp'
import view6 from '@/assets/album/风景/破晓.webp'
import view7 from '@/assets/album/风景/经典构图.webp'
import view8 from '@/assets/album/风景/mountain.webp'
import view9 from '@/assets/album/风景/真心好看.webp'
import view10 from '@/assets/album/风景/云.webp'
import view11 from '@/assets/album/风景/上海.mp4'
import view12 from '@/assets/album/风景/孤独的树.mp4'
import view13 from '@/assets/album/风景/彩虹.webp'
// import view14 from '@/assets/album/风景'

import img1 from '@/assets/album/人物/朋友.webp'
import img2 from '@/assets/album/人物/研学.webp'
import img3 from '@/assets/album/人物/dji.webp'
import img4 from '@/assets/classmates.webp'
import img5 from '@/assets/album/人物/student.webp'
import img6 from '@/assets/album/人物/adult.webp'


import holiday1 from '@/assets/album/暑假/tree.webp'
import holiday2 from '@/assets/album/暑假/晚餐.webp'
import holiday3 from '@/assets/album/暑假/初中吃到现在的羊肉面.webp'
import holiday4 from '@/assets/album/暑假/failure man.webp'
import holiday5 from '@/assets/album/暑假/足节虫.webp'
import holiday6 from '@/assets/album/暑假/蜻蜓.webp'
import holiday7 from '@/assets/album/暑假/图书馆.webp'
import holiday8 from '@/assets/album/暑假/篮球.webp'
// import holiday6 from '@/assets/album/暑假'

// ========== 2. 手动构建相册数据 ==========
const albumsData = [
  {
    id: 'custom',
    title: '动漫',
    cover: cover1,
    photos: [
      { title: '鹿丸', url: photo2 },
      { title: '这算圆梦吧', url: photo6 },
      { title: '佐助与鼬', url: photo7 },
      { title: '黑色五叶草-战斗番', url: photo3 },
      { title: '进击的巨人', url: photo4 },
      { title: '燃到起鸡皮疙瘩', url: photo1 },
      { title: '来自深渊-黄金乡', url: photo5 },
      { title: 'RE0', url: photo8 },
      { title: '慢节奏的异世界番', url: photo9 },
      { title: '相反的你和我', url: photo10 },
      { title: '中二病也要谈恋爱', url: photo11 },
      { title: '通往夏天的隧道', url: photo12 },
      { title: '败了', url: photo13 },
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
      { title: '过去', url: img5},
      { title: '或许是未来', url: img6},
    ]
  },
  {
    id: 'views',
    title: '风景',
    cover: cover3,
    photos: [
      { title: '高考结束的小区门口', url: view1 },
      { title: '期末周的图书馆', url: view2 },
      { title: '乡村', url: view3 },
      { title: '风起云涌', url: view4 },
      { title: '少见的星空', url: view5 },
      { title: '清晨的破晓', url: view6 },
      { title: '这构图蛮舒服', url: view7 },
      { title: 'NO SEVICE', url: view8 },
      { title: '这我真心觉得特别好看', url: view9 },
      { title: '这云神似Deepseek', url: view10 },
      { title: '不愧是上海', url: view11 },
      { title: '孤独的一颗树', url: view12 },
      { title: '拍到彩虹了', url: view13 },
    ]
  },
  {
    id: 'holiday',
    title: '大一暑假',
    cover: cover4,
    photos: [
      { title: '不是说7月这几天要硬抗台风吗', url: holiday1 },
      { title: '极其奢侈的一顿晚餐', url: holiday2 },
      { title: '初中吃到现在的羊肉面', url: holiday3 },
      { title: '暑假和朋友一起去看的电影', url: holiday4 },
      { title: '细长的足节虫', url: holiday5 },
      { title: '特写：蜻蜓', url: holiday6 },
      { title: '上海教堂旁的图书馆', url: holiday7 },
      { title: '早有耳闻的徐家汇篮球场', url: holiday8 },
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
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='.12'/%3E%3C/svg%3E");
  overflow: hidden;
}

.album-page-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 62vh;
  background: radial-gradient(ellipse at 50% -10%, rgba(255, 244, 224, 0.65), transparent 62%);
  pointer-events: none;
  z-index: 0;
}

.view-container {
  position: relative;
  z-index: 1;
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