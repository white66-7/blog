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
            <!-- 真实图片 -->
            <img :src="photo.url" class="real-image-large" />
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
defineProps({
  photo: {
    type: Object,
    required: true
  }
})
defineEmits(['close'])
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
  background: rgba(0, 0, 0, 0.85); 
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
  background: none; 
  border: none; 
  color: white; 
  font-size: 40px; 
  cursor: pointer !important; 
  transition: transform 0.3s;
}
.lightbox-close:hover {
  transform: scale(1.2);
}

/* ==================== 拍立得相纸样式 (还原原版) ==================== */
.large-polaroid { 
  background: white;
  width: auto; 
  max-width: 95vw; 
  /* 上左右留窄边，底部留宽边写字 */
  padding: 15px 15px 40px 15px; 
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  border-radius: 2px;
  cursor: default; 
}

.large-photo { 
  height: auto !important; 
  background: #1a1a1a; 
  position: relative; 
  overflow: hidden; 
}

.real-image-large { 
  display: block;
  max-width: 100%; 
  max-height: 85vh; 
  object-fit: contain; 
  /* 偏黄复古滤镜 */
  filter: contrast(1.1) sepia(0.15); 
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
  opacity: 0.5; 
  z-index: 3; 
  pointer-events: none; 
}

/* ==================== 弹窗缩放动画 ==================== */
.zoom-enter-active,
.zoom-leave-active {
  transition: all 0.3s ease;
}
.zoom-enter-from,
.zoom-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>