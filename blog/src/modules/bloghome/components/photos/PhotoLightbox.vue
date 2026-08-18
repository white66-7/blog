<template>
  <transition name="zoom">
    <div class="lightbox" @click="$emit('close')">
      <!-- 右上角关闭按钮 -->
      <button class="lightbox-close" @click="$emit('close')">×</button>
      
      <!-- 弹窗内容区，阻止点击事件冒泡导致关闭 -->
      <div class="lightbox-content" @click.stop>
        
        <!-- 核心：拍立得大相片框 -->
        <div class="polaroid large-polaroid">
          <div class="photo large-photo">
            <!-- 视频播放器：支持播放控制条、自动播放与循环 -->
            <video
              v-if="isVideo(photo)"
              :src="photo.url"
              class="real-image-large"
              controls
              autoplay
              playsinline
            ></video>

            <!-- 真实图片 -->
            <img v-else :src="photo.url" class="real-image-large" />

            <!-- 老照片特效图层：灰尘与划痕（已设置 pointer-events: none 不会遮挡视频控制栏） -->
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
const props = defineProps({
  photo: {
    type: Object,
    required: true
  }
})
defineEmits(['close'])

// 判断是否为视频
const isVideo = (item) => {
  if (!item) return false
  if (item.type === 'video') return true
  if (typeof item.url === 'string') {
    return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(item.url)
  }
  return false
}
</script>

<style scoped>
/* 引入手写字体 */
@import url(https://fonts.googleapis.com/css?family=Rock+Salt:400);

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
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  cursor: zoom-out !important; /* 鼠标变成缩小放大镜 */
}

.lightbox-close {
  position: absolute;
  top: 30px;
  right: 40px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  color: white;
  font-size: 22px;
  line-height: 1;
  cursor: pointer !important;
  transition: all 0.35s ease;
  z-index: 10;
}
.lightbox-close:hover {
  transform: rotate(90deg);
  background: #fff;
  color: #333;
  border-color: #fff;
}

/* ==================== 拍立得相纸样式 ==================== */
.large-polaroid { 
  background: white;
  width: auto; 
  max-width: 90vw; 
  /* 上左右留窄边，底部留宽边写字 */
  padding: 15px 15px 25px 15px;
  box-shadow: 0 18px 40px rgba(0,0,0,0.55);
  border-radius: 2px;
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
}

/* 兼容图片与视频共用尺寸与质感滤镜 */
.real-image-large { 
  display: block;
  max-width: 85vw; 
  max-height: 75vh; /* 留出底部文字和相框边距空间，防止超出屏幕 */
  object-fit: contain; 
  /* 偏黄复古滤镜 */
  filter: contrast(1.05) sepia(0.12); 
  outline: none;
}

/* ==================== 手写标题 ==================== */
.caption { 
  font-family: 'Rock Salt', cursive, 'Microsoft YaHei'; 
  text-align: center; 
  margin-top: 15px; 
  font-size: 18px; 
  color: #333; 
}

/* ==================== 老照片特效：灰尘与划痕 ==================== */
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
  pointer-events: none; /* 保证能穿透点击视频播放器控制条 */
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

/* ==================== 弹窗缩放动画 ==================== */
.zoom-enter-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.zoom-leave-active {
  transition: all 0.25s ease;
}
.zoom-enter-from,
.zoom-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>