<template>
  <div class="page">
    <!-- 正面（右页） -->
    <div class="page-face front" :class="{ 'face-active': isFrontVisible }">
      <div class="dynamic-shadow shadow-front"></div>
      <div v-if="sheet.front.type === 'blank'" class="page-content blank-content"></div>
      <div v-else class="page-content grid-page">
        <div
          v-for="(photo, i) in sheet.front.items"
          :key="i"
          class="polaroid-in-book"
          :class="{ 'clickable': isFrontVisible && !isAnimating }"
          @click.stop="isFrontVisible && !isAnimating ? $emit('open-photo', photo) : null"
        >
          <div class="photo">
            <!-- 统一用 img 展示：视频展示 photo.cover，图片展示 photo.url -->
            <img 
              :src="isVideo(photo) ? (photo.cover || photo.url) : photo.url" 
              class="real-image" 
              loading="lazy"
            />

            <!-- 视频角标（胶片+播放标志） -->
            <div v-if="isVideo(photo)" class="video-badge">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" fill="currentColor"/>
              </svg>
            </div>
            <div class="dust"></div>
            <div class="scratches"></div>
          </div>
          <div class="caption-handwritten">{{ photo.title }}</div>
        </div>
        <div class="page-number">{{ index * 2 }}</div>
      </div>
    </div>

    <!-- 背面（左页） -->
    <div class="page-face back" :class="{ 'face-active': isBackVisible }">
      <div class="dynamic-shadow shadow-back"></div>
      <div v-if="sheet.back.type === 'blank'" class="page-content blank-content"></div>
      <div v-else class="page-content grid-page">
        <div
          v-for="(photo, i) in sheet.back.items"
          :key="i"
          class="polaroid-in-book"
          :class="{ 'clickable': isBackVisible && !isAnimating }"
          @click.stop="isBackVisible && !isAnimating ? $emit('open-photo', photo) : null"
        >
          <div class="photo">
            <!-- 统一用 img 展示 -->
            <img 
              :src="isVideo(photo) ? (photo.cover || photo.url) : photo.url" 
              class="real-image" 
              loading="lazy"
            />

            <!-- 视频角标 -->
            <div v-if="isVideo(photo)" class="video-badge">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" fill="currentColor"/>
              </svg>
            </div>
            <div class="dust"></div>
            <div class="scratches"></div>
          </div>
          <div class="caption-handwritten">{{ photo.title }}</div>
        </div>
        <div class="page-number">{{ index * 2 + 1 }}</div>
      </div>
      <div class="page-fold-left"></div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  sheet: { type: Object, required: true },
  index: { type: Number, required: true },
  isFrontVisible: { type: Boolean, default: false },
  isBackVisible: { type: Boolean, default: false },
  isAnimating: { type: Boolean, default: false }
})

defineEmits(['open-photo'])

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
/* 保持原有样式，以下为更新的高亮播放角标样式 */
.page {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  transform-origin: 0% 50% 0px !important;
  will-change: transform;
  pointer-events: none;
}

.page-face {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  box-sizing: border-box;
  backface-visibility: hidden;
  pointer-events: none;
  background-color: #f7f5ef;
  background-image:
    linear-gradient(rgba(255, 255, 255, .55), rgba(255, 255, 255, .55)),
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='.1'/%3E%3C/svg%3E");
}

.front {
  border-radius: 0 4px 4px 0;
  box-shadow: inset 1px 0 2px rgba(0, 0, 0, 0.04);
}

.front::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  width: min(42px, 16%);
  background: linear-gradient(to right, rgba(50, 35, 20, 0.16) 0%, rgba(50, 35, 20, 0.04) 55%, transparent 100%);
  pointer-events: none;
  z-index: 15;
  mix-blend-mode: multiply;
}

.back {
  transform: rotateY(180deg);
  border-radius: 4px 0 0 4px;
  box-shadow: inset -1px 0 2px rgba(0, 0, 0, 0.04);
}

.back::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  width: min(42px, 16%);
  background: linear-gradient(to left, rgba(50, 35, 20, 0.16) 0%, rgba(50, 35, 20, 0.04) 55%, transparent 100%);
  pointer-events: none;
  z-index: 15;
  mix-blend-mode: multiply;
}

.dynamic-shadow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 20;
  opacity: 0;
  border-radius: inherit;
  mix-blend-mode: multiply;
}

.shadow-front {
  background: linear-gradient(to right, rgba(40, 30, 20, 0.45) 0%, rgba(60, 45, 30, 0.15) 40%, rgba(0, 0, 0, 0.3) 100%);
}

.shadow-back {
  background: linear-gradient(to left, rgba(40, 30, 20, 0.45) 0%, rgba(60, 45, 30, 0.15) 40%, rgba(0, 0, 0, 0.3) 100%);
}

.page-content {
  width: 100%;
  height: 100%;
  padding: 20px;
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.grid-page {
  justify-content: space-evenly;
  padding: 20px;
}

.blank-content {
  background: linear-gradient(180deg, #fbf8f1 0%, #f5f0e4 100%);
}

.page-fold-left {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  border-right: 1px solid #ddd;
  border-bottom: 1px solid #ddd;
  box-shadow: 5px 5px 10px rgba(221, 221, 221, 0.6);
  pointer-events: none;
}

.polaroid-in-book {
  position: relative;
  width: 75%;
  height: 42%;
  padding: 12px 12px 18px 12px;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s, box-shadow 0.3s, z-index 0.3s;
  display: flex;
  flex-direction: column;
  pointer-events: none;
}

.polaroid-in-book:nth-child(odd) { transform: rotate(-2deg); }
.polaroid-in-book:nth-child(even) { transform: rotate(1.5deg); }

.polaroid-in-book.clickable {
  pointer-events: auto;
  cursor: zoom-in;
}

.polaroid-in-book.clickable:hover {
  transform: scale(1.05) rotate(0deg);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  z-index: 10;
}

.polaroid-in-book .photo {
  flex-grow: 1;
  min-height: 0;
  position: relative;
  overflow: hidden;
  background: #1a1a1a;
  pointer-events: none;
}

.video-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  z-index: 6;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.65);
  backdrop-filter: blur(4px);
  border-radius: 50%;
  color: #ffffff;
  pointer-events: none;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}

.video-badge svg {
  width: 18px;
  height: 18px;
  margin-left: 2px;
}

.caption-handwritten {
  font-family: 'Comic Sans MS', 'Chalkboard SE', 'Marker Felt', 'KaiTi', cursive;
  text-align: center;
  margin-top: 10px;
  font-size: 14px;
  color: #333;
  pointer-events: none;
}

.page-number {
  position: absolute;
  bottom: 20px;
  font-family: 'Playfair Display', serif;
  font-weight: bold;
  opacity: 0.5;
  pointer-events: none;
}

.front .page-number { right: 30px; }
.back .page-number { left: 30px; }

.real-image {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  filter: contrast(1.08) sepia(0.12);
  pointer-events: none;
}

.dust {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background-image:
    radial-gradient(#000 1px, transparent 1px),
    radial-gradient(#000 1px, transparent 1px);
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
  background:
    linear-gradient(45deg, transparent 45%, rgba(0, 0, 0, 0.05) 46%, transparent 47%),
    linear-gradient(-45deg, transparent 45%, rgba(0, 0, 0, 0.05) 46%, transparent 47%);
  background-size: 200px 200px;
  opacity: 0.5;
  z-index: 3;
  pointer-events: none;
}

@media (max-width: 768px) {
  .polaroid-in-book {
    width: 90%;
    padding: 6px 6px 12px 6px;
  }
}
</style>