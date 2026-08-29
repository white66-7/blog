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

// ========== 2. 手动构建相册数据 ==========
const albumsData = [
  {
    id: 'custom',
    title: '动漫',
    cover: '/album/photo_covers/help.webp',
    photos: [
      { title: '鹿丸', url: '/album/动漫/沉思.webp' },
      { title: '这算圆梦吧', url: '/album/动漫/圆梦.webp' },
      { title: '佐助与鼬', url: '/album/动漫/佐助与鼬.webp' },
      { title: '黑色五叶草-战斗番', url: '/album/动漫/黑色五叶草.webp' },
      { title: '进击的巨人', url: '/album/动漫/进击的巨人.webp' },
      { title: '燃到起鸡皮疙瘩', url: '/album/动漫/超燃.webp' },
      { title: '来自深渊-黄金乡', url: '/album/动漫/来自深渊.webp' },
      { title: 'RE0', url: '/album/动漫/eye.webp' },
      { title: '慢节奏的异世界番', url: '/album/动漫/video.webp' },
      { title: '相反的你和我', url: '/album/动漫/pair.webp' },
      { title: '中二病也要谈恋爱', url: '/album/动漫/阿玛天纳斯.webp' },
      { title: '通往夏天的隧道', url: '/album/动漫/向日葵.webp' },
      { title: '败了', url: '/album/动漫/战败.webp' },
    ]
  },
  {
    id: 'persons',
    title: '人物',
    cover: '/album/photo_covers/videos.webp',
    photos: [
      { title: '研学', url: '/album/人物/研学.webp' },
      { title: '高中同学们', url: '/album/人物/classmates.webp' },
      { title: '给朋友拍的照片', url: '/album/人物/朋友.webp' },
      { title: '在旧宿舍的最后一晚', url: '/album/人物/dji.webp' },
      { title: '过去', url: '/album/人物/student.webp' },
      { title: '或许是未来', url: '/album/人物/adult.webp' },
      { title: '三人成行', url: '/album/人物/三人成行.mp4', cover: '/album/人物/三人成行封面.webp' },
      { title: '三人成行 • 附', url: '/album/人物/三人成行2.mp4', cover: '/album/人物/三人成行2封面.webp' },
    ]
  },
  {
    id: 'views',
    title: '风景',
    cover: '/album/photo_covers/view.webp',
    photos: [
      { title: '高考结束的小区门口', url: '/album/风景/高考结束的小区门口.webp' },
      { title: '期末周的图书馆', url: '/album/风景/library.webp' },
      { title: '乡村', url: '/album/风景/home.webp' },
      { title: '风起云涌', url: '/album/风景/十字路口.webp' },
      { title: '少见的星空', url: '/album/风景/星空.webp' },
      { title: '清晨的破晓', url: '/album/风景/破晓.webp' },
      { title: '这构图蛮舒服', url: '/album/风景/经典构图.webp' },
      { title: 'NO SEVICE', url: '/album/风景/mountain.webp' },
      { title: '这我真心觉得特别好看', url: '/album/风景/真心好看.webp' },
      { title: '这云神似Deepseek', url: '/album/风景/云.webp' },
      { title: '不愧是上海', url: '/album/风景/上海.mp4', cover: '/album/风景/上海封面.webp' },
      { title: '孤独的一颗树', url: '/album/风景/孤独的树.mp4', cover: '/album/风景/孤独的树封面.webp' },
      { title: '拍到彩虹了', url: '/album/风景/彩虹.webp' },
    ]
  },
  {
    id: 'holiday',
    title: '大一暑假',
    cover: '/album/photo_covers/friend.webp',
    photos: [
      { title: '不是说7月这几天要硬抗台风吗', url: '/album/暑假/tree.webp' },
      { title: '极其奢侈的一顿晚餐', url: '/album/暑假/晚餐.webp' },
      { title: '初中吃到现在的羊肉面', url: '/album/暑假/初中吃到现在的羊肉面.webp' },
      { title: '暑假和朋友一起去看的电影', url: '/album/暑假/failure man.webp' },
      { title: '细长的足节虫', url: '/album/暑假/足节虫.webp' },
      { title: '特写：蜻蜓', url: '/album/暑假/蜻蜓.webp' },
      { title: '上海教堂旁的图书馆', url: '/album/暑假/图书馆.webp' },
      { title: '早有耳闻的徐家汇篮球场', url: '/album/暑假/篮球.webp' },
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