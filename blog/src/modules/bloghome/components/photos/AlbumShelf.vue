<template>
  <div class="album-shelf-container">
    <div class="books-grid">
      <div 
        v-for="(album, index) in albums" 
        :key="album.id" 
        class="book-item" 
        :class="[
          'book-position-' + index,
          'animate__animated',
          'animate__flipInX'
        ]" 
        :style="{ animationDelay: index * 0.2 + 's' }"
      >
        <figure class="book" @click="$emit('select-album', album)">
          <!-- ==================== 封面 ==================== -->
          <ul class="hardcover_front">
            <!-- 外侧：封面图 + 竖排标题 -->
            <li>
              <img :src="album.cover" alt="" width="100%" height="100%">
              <div class="vertical-title">
                <span v-for="(part, i) in splitIntoColumns(album.title, 2)" :key="i" class="title-column">
                  {{ part }}
                </span>
              </div>
            </li>
            <!-- 封面内侧：翻开后的左扉页（展示第 1、2 张照片，pageIndex 为 0） -->
            <li>
              <div class="mini-photos-wrapper">
                <div 
                  v-for="(photo, pIdx) in getPagePhotos(album.photos, 0)" 
                  :key="pIdx" 
                  class="mini-polaroid"
                >
                  <div class="mini-img-box">
                    <img 
                      :src="getPhotoSrc(photo)" 
                      class="mini-img" 
                      loading="lazy"
                      @load="$event.target.classList.add('is-loaded')" 
                      @error="$event.target.style.opacity = '0'" 
                    />
                  </div>
                  <span v-if="photo.title" class="mini-title">{{ photo.title }}</span>
                </div>
              </div>
            </li>
          </ul>

          <!-- ==================== 内页（第 1~5 页，展示后续照片） ==================== -->
          <ul class="page">
            <li v-for="pageIndex in 5" :key="pageIndex">
              <div class="mini-photos-wrapper">
                <div 
                  v-for="(photo, pIdx) in getPagePhotos(album.photos, pageIndex)" 
                  :key="pIdx" 
                  class="mini-polaroid"
                >
                  <div class="mini-img-box">
                    <img 
                      :src="getPhotoSrc(photo)" 
                      class="mini-img" 
                      loading="lazy"
                      @load="$event.target.classList.add('is-loaded')" 
                      @error="$event.target.style.opacity = '0'" 
                    />
                  </div>
                  <span v-if="photo.title" class="mini-title">{{ photo.title }}</span>
                </div>
              </div>
            </li>
          </ul>

          <!-- ==================== 封底 + 书脊 ==================== -->
          <ul class="hardcover_back">
            <li></li>
            <li></li>
          </ul>
          <ul class="book_spine">
            <li></li>
            <li></li>
          </ul>
        </figure>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  albums: {
    type: Array,
    required: true,
  },
});
defineEmits(['select-album']);

// 竖排文本分割
function splitIntoColumns(str, colSize = 2) {
  if (!str) return [];
  const result = [];
  for (let i = 0; i < str.length; i += colSize) {
    result.push(str.slice(i, i + colSize));
  }
  return result;
}

// 获取每一页展示的照片（每页分配 2 张）
function getPagePhotos(photos = [], pageIndex = 0) {
  if (!photos) return [];
  const start = pageIndex * 2;
  return photos.slice(start, start + 2);
}

// 获取图片展示路径（视频优先取 cover 封面）
function getPhotoSrc(photo) {
  if (!photo) return '';
  return photo.cover || photo.url || '';
}
</script>

<style scoped>
.album-shelf-container {
  width: 100%;
  min-height: 100vh;
  padding-top: 44px;
  padding-bottom: 64px;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.books-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin-top: 50px;
  gap: 30px 44px;
  max-width: 720px;
  width: 100%;
  padding: 0 20px;
}

.book-item {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

/* 书本落地阴影 */
.book-item::after {
  content: '';
  position: absolute;
  bottom: -14px;
  width: 70%;
  height: 14px;
  background: radial-gradient(ellipse, rgba(0, 0, 0, 0.16), transparent 70%);
  filter: blur(2px);
  transition: all 0.4s ease;
}

.book-item:hover::after {
  width: 60%;
  background: radial-gradient(ellipse, rgba(0, 0, 0, 0.24), transparent 70%);
  filter: blur(3px);
}

.book-position-0 { grid-column: 1; }
.book-position-1 { grid-column: 2; }
.book-position-2 {
  grid-column: 1 / -1;
  justify-self: center;
}
.book-position-3 { grid-column: 1; }

/* ==================== 3D 书本核心样式 ==================== */
.book {
  position: relative;
  width: 160px;
  height: 220px;
  perspective: 1000px;
  transform-style: preserve-3d;
  cursor: pointer;
}

ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.hardcover_front li:first-child {
  background-color: #eee;
  backface-visibility: hidden;
}

.hardcover_front li:last-child {
  background: #fdfaf2;
}

.hardcover_back li:first-child,
.hardcover_back li:last-child {
  background: #fffbec;
}

.book_spine li:first-child {
  background: #eee;
}

.book_spine li:last-child {
  background: #333;
}

.hardcover_front li:first-child:after,
.hardcover_front li:first-child:before,
.hardcover_front li:last-child:after,
.hardcover_front li:last-child:before,
.hardcover_back li:first-child:after,
.hardcover_back li:first-child:before,
.hardcover_back li:last-child:after,
.hardcover_back li:last-child:before,
.book_spine li:first-child:after,
.book_spine li:first-child:before,
.book_spine li:last-child:after,
.book_spine li:last-child:before {
  background: #999;
}

.page > li {
  background: linear-gradient(to right, #e1ddd8 0%, #fffbf6 100%);
  box-shadow:
    inset 0px -1px 2px rgba(50, 50, 50, 0.1),
    inset -1px 0px 1px rgba(150, 150, 150, 0.2);
  border-radius: 0px 5px 5px 0px;
}

.hardcover_front {
  transform: rotateY(-34deg) translateZ(8px);
  z-index: 100;
  transition: all 0.8s ease, z-index 0.6s;
}

.hardcover_back {
  transform: rotateY(-15deg) translateZ(-8px);
}

.page li:nth-child(1) { transform: rotateY(-28deg); }
.page li:nth-child(2) { transform: rotateY(-30deg); }
.page li:nth-child(3) { transform: rotateY(-32deg); }
.page li:nth-child(4) { transform: rotateY(-34deg); }
.page li:nth-child(5) { transform: rotateY(-36deg); }

.hardcover_front,
.hardcover_back,
.book_spine,
.hardcover_front li,
.hardcover_back li,
.book_spine li {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

.hardcover_front,
.hardcover_back {
  transform-origin: 0% 100%;
}

.hardcover_front li:first-child {
  cursor: pointer;
  user-select: none;
  transform: translateZ(2px);
}

.hardcover_front li:last-child {
  transform: rotateY(180deg) translateZ(2px);
}

.hardcover_back li:first-child { transform: translateZ(2px); }
.hardcover_back li:last-child { transform: translateZ(-2px); }

/* 书边厚度装饰 */
.hardcover_front li:first-child:after,
.hardcover_front li:first-child:before {
  width: 4px;
  height: 100%;
}
.hardcover_front li:first-child:after {
  transform: rotateY(90deg) translateZ(-2px) translateX(2px);
}
.hardcover_front li:first-child:before {
  transform: rotateY(90deg) translateZ(158px) translateX(2px);
}

.hardcover_front li:last-child:after,
.hardcover_front li:last-child:before {
  width: 4px;
  height: 160px;
}
.hardcover_front li:last-child:after {
  transform: rotateX(90deg) rotateZ(90deg) translateZ(80px) translateX(-2px) translateY(-78px);
}
.hardcover_front li:last-child:before {
  box-shadow: 0px 0px 30px 5px #333;
  transform: rotateX(90deg) rotateZ(90deg) translateZ(-140px) translateX(-2px) translateY(-78px);
}

.hardcover_back li:first-child:after,
.hardcover_back li:first-child:before {
  width: 4px;
  height: 100%;
}
.hardcover_back li:first-child:after {
  transform: rotateY(90deg) translateZ(-2px) translateX(2px);
}
.hardcover_back li:first-child:before {
  transform: rotateY(90deg) translateZ(158px) translateX(2px);
}

.hardcover_back li:last-child:after,
.hardcover_back li:last-child:before {
  width: 4px;
  height: 160px;
}
.hardcover_back li:last-child:after {
  transform: rotateX(90deg) rotateZ(90deg) translateZ(80px) translateX(2px) translateY(-78px);
}
.hardcover_back li:last-child:before {
  box-shadow: 10px -1px 80px 20px #666;
  transform: rotateX(90deg) rotateZ(90deg) translateZ(-140px) translateX(2px) translateY(-78px);
}

.book_spine {
  transform: rotateY(60deg) translateX(-5px) translateZ(-12px);
  width: 16px;
  z-index: 0;
}
.book_spine li:first-child { transform: translateZ(2px); }
.book_spine li:last-child { transform: translateZ(-2px); }
.book_spine li:first-child:after,
.book_spine li:first-child:before {
  width: 4px;
  height: 100%;
}
.book_spine li:first-child:after {
  transform: rotateY(90deg) translateZ(-2px) translateX(2px);
}
.book_spine li:first-child:before {
  transform: rotateY(-90deg) translateZ(-12px);
}
.book_spine li:last-child:after,
.book_spine li:last-child:before {
  width: 4px;
  height: 16px;
}
.book_spine li:last-child:after {
  transform: rotateX(90deg) rotateZ(90deg) translateZ(8px) translateX(2px) translateY(-6px);
}
.book_spine li:last-child:before {
  box-shadow: 5px -1px 100px 40px rgba(0, 0, 0, 0.2);
  transform: rotateX(90deg) rotateZ(90deg) translateZ(-210px) translateX(2px) translateY(-6px);
}

.page,
.page > li {
  position: absolute;
  top: 0;
  left: 0;
  transform-style: preserve-3d;
}

.page {
  width: 100%;
  height: 98%;
  top: 1%;
  left: 3%;
  z-index: 200;
}

.page > li {
  width: 100%;
  height: 100%;
  transform-origin: left center;
  transition-property: transform;
  transition-timing-function: ease;
}

/* 包含照片的页面 */
.hardcover_front li:last-child,
.page > li {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 8px 6px;
  box-sizing: border-box;
}

.page > li:nth-child(1) { transition-duration: 0.6s; }
.page > li:nth-child(2) { transition-duration: 0.6s; }
.page > li:nth-child(3) { transition-duration: 0.4s; }
.page > li:nth-child(4) { transition-duration: 0.5s; }
.page > li:nth-child(5) { transition-duration: 0.6s; }

/* ==================== 书本翻开动画 ==================== */
.book:hover > .hardcover_front {
  transform: rotateY(-145deg) translateZ(0);
  z-index: 0;
}

.book:hover > .page li:nth-child(1) {
  transform: rotateY(-30deg);
  transition-duration: 1.5s;
}

.book:hover > .page li:nth-child(2) {
  transform: rotateY(-35deg);
  transition-duration: 1.8s;
}

.book:hover > .page li:nth-child(3) {
  transform: rotateY(-118deg);
  transition-duration: 1.6s;
}

.book:hover > .page li:nth-child(4) {
  transform: rotateY(-130deg);
  transition-duration: 1.4s;
}

.book:hover > .page li:nth-child(5) {
  transform: rotateY(-140deg);
  transition-duration: 1.2s;
}

/* ==================== 内页真实照片展示 ==================== */
.mini-photos-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

/* hover 展开时渐现照片 */
.book:hover .mini-photos-wrapper {
  opacity: 1;
  transition-delay: 0.15s;
}

.mini-polaroid {
  width: 114px;
  background: #ffffff;
  padding: 4px 4px 5px 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  border-radius: 3px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
}

.mini-polaroid:nth-child(1) {
  transform: rotate(-1.5deg);
}

.mini-polaroid:nth-child(2) {
  transform: rotate(1.5deg);
}

/* 核心：固定 16:9 照片比例盒子 + 弱网微光骨架底色 */
.mini-img-box {
  width: 100%;
  aspect-ratio: 16 / 9; /* 强制锁定 16:9 */
  border-radius: 2px;
  position: relative;
  overflow: hidden;
  background: #edeae3;
  background: linear-gradient(
    90deg,
    #edeae3 0%,
    #f7f4ed 50%,
    #edeae3 100%
  );
  background-size: 200% 100%;
  animation: miniShimmer 1.8s infinite linear;
}

/* 真实图片：撑满 16:9 盒子，cover 裁剪不变形，加载完成平滑淡入 */
.mini-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  opacity: 0;
  transition: opacity 0.4s ease-in-out;
}

.mini-img.is-loaded {
  opacity: 1;
}

@keyframes miniShimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.mini-title {
  font-size: 8px;
  color: #666;
  margin-top: 3px;
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100px;
  font-family: 'Comic Sans MS', 'Chalkboard SE', cursive, sans-serif;
}

/* ========== 封面左上角竖排标题 ========== */
.vertical-title {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;
  gap: 2px;
  pointer-events: none;
  z-index: 5;
}

.title-column {
  display: inline-block;
  writing-mode: vertical-rl;
  text-orientation: upright;
  font-family: 'ShangShouJiangHuShuFa', sans-serif;
  font-size: 15px;
  font-weight: normal;
  line-height: 1;
  letter-spacing: 2px;
  color: black;
  white-space: nowrap;
}

/* 响应式 */
@media screen and (max-width: 600px) {
  .books-grid {
    grid-template-columns: 1fr;
    gap: 24px;
    max-width: 280px;
  }

  .title-column {
    font-size: 10px;
    padding: 2px 1px;
  }

  .book-position-2 {
    grid-column: 1;
    justify-self: center;
  }

  .mini-polaroid {
    width: 92px;
    padding: 3px 3px 4px 3px;
  }
}
</style>