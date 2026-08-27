<template>
  <transition name="zoom">
    <div class="lightbox" @click="handleClose">
      <!-- 右上角关闭按钮 -->
      <button class="lightbox-close" @click="handleClose">×</button>
      
      <!-- 弹窗内容区 -->
      <div class="lightbox-content" @click.stop>
        
        <!-- 核心：拍立得大相片框 -->
        <div class="polaroid large-polaroid">
          <div class="photo large-photo">
            <!-- 视频播放器：支持流式边下边播 + 缓冲等待转圈 -->
            <video
              v-if="isVideo(photo)"
              ref="videoEl"
              :src="photo.url"
              :poster="photo.cover"
              class="real-image-large"
              controls
              autoplay
              playsinline
              preload="auto"
              @waiting="isBuffering = true"
              @playing="isBuffering = false"
              @canplay="isBuffering = false"
            ></video>

            <!-- 真实图片 -->
            <img v-else :src="photo.url" class="real-image-large" />

            <!-- 视频缓冲等待中动画 -->
            <div v-if="isVideo(photo) && isBuffering" class="buffering-spinner">
              <div class="spinner-icon"></div>
              <span>加载中...</span>
            </div>

            <!-- 老照片特效图层：灰尘与划痕 -->
            <div class="dust"></div>
            <div class="scratches"></div>
          </div>
          <!-- 底部手写标题 -->
          <div class="caption">{{ photo.title }}</div>
        </div>

      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  photo: {
    type: Object,
    required: true
  }
})

const emit = defineEmits(['close'])

const videoEl = ref(null)
const isBuffering = ref(true)

const isVideo = (item) => {
  if (!item) return false
  if (item.type === 'video') return true
  if (typeof item.url === 'string') {
    return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(item.url)
  }
  return false
}

const handleClose = () => {
  if (videoEl.value) {
    videoEl.value.pause()
    videoEl.value.src = '' // 释放资源
  }
  emit('close')
}
</script>

<style scoped>
/* ==================== 遮罩层 ==================== */
.lightbox {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background:
    radial-gradient(ellipse at center, rgba(255, 240, 220, 0.06), rgba(0, 0, 0, 0) 55%),
    rgba(0, 0, 0, 0.82);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  cursor: zoom-out !important;
}

.lightbox-close {
  position: absolute;
  top: 30px;
  right: 40px;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  color: white;
  font-size: 24px;
  line-height: 1;
  cursor: pointer !important;
  transition: all 0.35s ease;
  z-index: 10;
}

.lightbox-close:hover {
  transform: rotate(90deg) scale(1.1);
  background: #fff;
  color: #333;
  border-color: #fff;
}

/* ==================== 拍立得相纸样式 ==================== */
.large-polaroid { 
  background: white;
  width: auto; 
  max-width: 90vw; 
  padding: 15px 15px 25px 15px;
  box-shadow: 0 20px 50px rgba(0,0,0,0.6);
  border-radius: 4px;
  cursor: default; 
}

.large-photo { 
  height: auto !important; 
  background: #1a1a1a; 
  position: relative; 
  overflow: hidden; 
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 2px;
}

.real-image-large { 
  display: block;
  max-width: 85vw; 
  max-height: 72vh;
  object-fit: contain; 
  filter: contrast(1.05) sepia(0.12); 
  outline: none;
  background: #000;
}

/* ==================== 缓冲加载动画 ==================== */
.buffering-spinner {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #ffffff;
  font-size: 13px;
  background: rgba(0, 0, 0, 0.65);
  padding: 12px 18px;
  border-radius: 8px;
  pointer-events: none;
  z-index: 5;
}

.spinner-icon {
  width: 24px;
  height: 24px;
  border: 3px solid rgba(255, 255, 255, 0.25);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ==================== 手写标题 ==================== */
.caption { 
  font-family: 'Comic Sans MS', 'Chalkboard SE', 'Bradley Hand', 'Segoe Script', cursive, 'Microsoft YaHei';
  text-align: center; 
  margin-top: 15px; 
  font-size: 18px; 
  color: #333; 
}

/* ==================== 老照片特效 ==================== */
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
  z-index: 3; 
  pointer-events: none;
}

.scratches { 
  position: absolute; 
  width: 100%; 
  height: 100%; 
  top: 0; 
  left: 0; 
  background: linear-gradient(45deg, transparent 45%, rgba(0,0,0,0.05) 46%, transparent 47%), 
              linear-gradient(-45deg, transparent 45%, rgba(0,0,0,0.05) 46%, transparent 47%); 
  background-size: 200px 200px; 
  opacity: 0.4; 
  z-index: 3; 
  pointer-events: none; 
}

/* ==================== 缩放进场动画 ==================== */
.zoom-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.zoom-leave-active {
  transition: all 0.25s ease;
}
.zoom-enter-from,
.zoom-leave-to {
  opacity: 0;
  transform: scale(0.88);
}
</style>