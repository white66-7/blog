<template>
  <div class="album-shelf-container">
    <div class="books-grid">
      <div v-for="(album, index) in albums" :key="album.id" class="book-item" :class="'book-position-' + index">
        <figure class="book" @click="$emit('select-album', album)">
          <!-- ==================== 封面 ==================== -->
          <ul class="hardcover_front">
            <!-- 外侧：封面图 -->
<li>
  <img :src="album.cover" alt="" width="100%" height="100%">
  <!-- 新增：竖排标题 -->
  <div class="vertical-title">
    <span 
      v-for="(part, i) in splitIntoColumns(album.title, 2)" 
      :key="i"
      class="title-column"
    >{{ part }}</span>
  </div>
</li>
            <!-- 内侧：翻开后的左侧页，骨架屏 -->
            <li>
              <!-- <div class="skeleton-wrapper">
                <div class="skeleton-block"></div>
                <div class="skeleton-block"></div>
              </div> -->
            </li>
          </ul>

          <!-- ==================== 内页（五页全部加骨架屏） ==================== -->
          <ul class="page">
            <li v-for="n in 5" :key="n">
              <div class="skeleton-wrapper">
                <div class="skeleton-block"></div>
                <div class="skeleton-block"></div>
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

// 将字符串按每列字符数分割成数组
function splitIntoColumns(str, colSize = 2) {
  const result = [];
  for (let i = 0; i < str.length; i += colSize) {
    result.push(str.slice(i, i + colSize));
  }
  return result;
}
</script>

<style scoped>
.album-shelf-container {
  width: 100%;
  min-height: 100vh;
  padding-top: 60px;
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
  gap: 40px 60px;
  max-width: 800px;
  width: 100%;
  padding: 0 20px;
}

.book-item {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.book-position-0 {
  grid-column: 1;
}

.book-position-1 {
  grid-column: 2;
}

.book-position-2 {
  grid-column: 1 / -1;
  justify-self: center;
}

.book-position-3 {
  grid-column: 1;
}

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
  background: #fffbec;
}

.hardcover_back li:first-child {
  background: #fffbec;
}

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

.page>li {
  background: linear-gradient(to right, #e1ddd8 0%, #fffbf6 100%);
  box-shadow:
    inset 0px -1px 2px rgba(50, 50, 50, 0.1),
    inset -1px 0px 1px rgba(150, 150, 150, 0.2);
  border-radius: 0px 5px 5px 0px;
}

.hardcover_front {
  transform: rotateY(-34deg) translateZ(8px);
  z-index: 100;
}

.hardcover_back {
  transform: rotateY(-15deg) translateZ(-8px);
}

.page li:nth-child(1) {
  transform: rotateY(-28deg);
}

.page li:nth-child(2) {
  transform: rotateY(-30deg);
}

.page li:nth-child(3) {
  transform: rotateY(-32deg);
}

.page li:nth-child(4) {
  transform: rotateY(-34deg);
}

.page li:nth-child(5) {
  transform: rotateY(-36deg);
}

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

.hardcover_front {
  transition: all 0.8s ease, z-index 0.6s;
}

.hardcover_front li:first-child {
  cursor: pointer;
  user-select: none;
  transform: translateZ(2px);
}

.hardcover_front li:last-child {
  transform: rotateY(180deg) translateZ(2px);
}

.hardcover_back li:first-child {
  transform: translateZ(2px);
}

.hardcover_back li:last-child {
  transform: translateZ(-2px);
}

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

.book_spine li:first-child {
  transform: translateZ(2px);
}

.book_spine li:last-child {
  transform: translateZ(-2px);
}

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
.page>li {
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

.page>li {
  width: 100%;
  height: 100%;
  transform-origin: left center;
  transition-property: transform;
  transition-timing-function: ease;
}

/* 所有包含内容的页面元素开启 flex 布局 */
.hardcover_front li:last-child,
.page>li {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 12px 10px;
  box-sizing: border-box;
}

.page>li:nth-child(1) {
  transition-duration: 0.6s;
}

.page>li:nth-child(2) {
  transition-duration: 0.6s;
}

.page>li:nth-child(3) {
  transition-duration: 0.4s;
}

.page>li:nth-child(4) {
  transition-duration: 0.5s;
}

.page>li:nth-child(5) {
  transition-duration: 0.6s;
}

/* ==================== 书本翻开动画 ==================== */
.book:hover>.hardcover_front {
  transform: rotateY(-145deg) translateZ(0);
  z-index: 0;
}

.book:hover>.page li:nth-child(1) {
  transform: rotateY(-30deg);
  transition-duration: 1.5s;
}

.book:hover>.page li:nth-child(2) {
  transform: rotateY(-35deg);
  transition-duration: 1.8s;
}

.book:hover>.page li:nth-child(3) {
  transform: rotateY(-118deg);
  transition-duration: 1.6s;
}

.book:hover>.page li:nth-child(4) {
  transform: rotateY(-130deg);
  transition-duration: 1.4s;
}

.book:hover>.page li:nth-child(5) {
  transform: rotateY(-140deg);
  transition-duration: 1.2s;
}

/* ==================== 骨架屏（全局） ==================== */
.skeleton-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  width: 100%;
  opacity: 0;
  transition: opacity 0.3s ease;
}

/* hover 书本时，所有页面的骨架屏都显示 */
.book:hover .skeleton-wrapper {
  opacity: 1;
  transition-delay: 0.15s;
}

.skeleton-block {
  width: 95px;
  height: 75px;
  border-radius: 8px;
  background: #e4e0d8;
  background-size: 200% 100%;
  animation: shimmer 2s ease-in-out infinite;
  position: relative;
  overflow: hidden;
}

@keyframes shimmer {
  0% {
    background: linear-gradient(110deg,
        #e4e0d8 25%,
        #e4e0d8 37%,
        #f7f4ee 45%,
        #fcfaf6 50%,
        #f7f4ee 55%,
        #e4e0d8 63%,
        #e4e0d8 75%);
    background-size: 200% 100%;
    background-position: 150% 0;
  }

  100% {
    background: linear-gradient(110deg,
        #e4e0d8 25%,
        #e4e0d8 37%,
        #f7f4ee 45%,
        #fcfaf6 50%,
        #f7f4ee 55%,
        #e4e0d8 63%,
        #e4e0d8 75%);
    background-size: 200% 100%;
    background-position: -50% 0;
  }
}

/* 给不同位置的骨架块设置波浪延迟（共 6 页 × 2 = 12 个块） */
.hardcover_front li:last-child .skeleton-block:nth-child(1) {
  animation-delay: 0s;
}

.hardcover_front li:last-child .skeleton-block:nth-child(2) {
  animation-delay: 0.2s;
}

.page>li:nth-child(1) .skeleton-block:nth-child(1) {
  animation-delay: 0.4s;
}

.page>li:nth-child(1) .skeleton-block:nth-child(2) {
  animation-delay: 0.6s;
}

.page>li:nth-child(2) .skeleton-block:nth-child(1) {
  animation-delay: 0.8s;
}

.page>li:nth-child(2) .skeleton-block:nth-child(2) {
  animation-delay: 1.0s;
}

.page>li:nth-child(3) .skeleton-block:nth-child(1) {
  animation-delay: 1.2s;
}

.page>li:nth-child(3) .skeleton-block:nth-child(2) {
  animation-delay: 1.4s;
}

.page>li:nth-child(4) .skeleton-block:nth-child(1) {
  animation-delay: 1.6s;
}

.page>li:nth-child(4) .skeleton-block:nth-child(2) {
  animation-delay: 1.8s;
}

.page>li:nth-child(5) .skeleton-block:nth-child(1) {
  animation-delay: 2.0s;
}

.page>li:nth-child(5) .skeleton-block:nth-child(2) {
  animation-delay: 2.2s;
}

/* ========== 封面左上角竖排标题 ========== */
.vertical-title {
  position: absolute;
  top: 20px;
  left: 20px;
  display: flex;               /* 横向排列各列 */
  gap: 2px;                    /* 列间距 */
  pointer-events: none;        /* 不阻挡点击 */
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
  color: black;                            /* 白色文字 */
  white-space: nowrap;
}

/* 响应式 */
@media screen and (max-width: 600px) {
  .books-grid {
    grid-template-columns: 1fr;
    gap: 30px;
    max-width: 300px;
  }
  
    .title-column {
    font-size: 10px;
    padding: 2px 1px;
  }
  .book-position-2 {
    grid-column: 1;
    justify-self: center;
  }

  .skeleton-block {
    width: 75px;
    height: 60px;
  }
}
</style>