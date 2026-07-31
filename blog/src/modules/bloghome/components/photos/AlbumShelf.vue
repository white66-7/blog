<template>
  <div class="album-shelf-container">

    <div class="books-grid">
      <div v-for="(album, index) in albums" :key="album.id" class="book-item" :class="'book-position-' + index">
        <!-- 点击整本书触发事件 -->
        <figure class='book' @click="$emit('select-album', album)">
          <!-- Front Cover -->
          <ul class='hardcover_front'>
            <li>
              <img :src="album.cover" alt="" width="100%" height="100%">
            </li>
            <li></li>
          </ul>
          <!-- Pages (移除了按钮，保留书页结构) -->
          <ul class='page'>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
          </ul>
          <!-- Back Cover -->
          <ul class='hardcover_back'>
            <li></li>
            <li></li>
          </ul>
          <!-- Spine -->
          <ul class='book_spine'>
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
    required: true
  }
})
defineEmits(['select-album'])
</script>

<style scoped>
/* ==================== 基础与排版 ==================== */
.album-shelf-container {
  width: 100%;
  min-height: 100vh;
  padding-top: 60px;
  overflow-y: auto;
  overflow-x: hidden;
  font-family: 'Lato', 'Microsoft YaHei', sans-serif;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 网格容器 */
.books-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  /* 两列 */
  gap: 40px 60px;
  max-width: 800px;
  width: 100%;
  padding: 0 20px;
}

/* 每个书本项 */
.book-item {
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

/* 手动控制位置，实现错落感 */
.book-position-0 {
  grid-column: 1;
  /* 第一个放左列 */
}

.book-position-1 {
  grid-column: 2;
  /* 第二个放右列 */
}

.book-position-2 {
  grid-column: 1 / -1;
  /* 第三个占满整行，居中 */
  justify-self: center;
}

.book-position-3 {
  grid-column: 1;
  /* 第四个放左列 */
}

/* ==================== 3D 书本核心样式 ==================== */
.book {
  position: relative;
  width: 160px;
  height: 220px;
  perspective: 1000px;
  transform-style: preserve-3d;
  cursor: pointer;
  /* 鼠标变为手型，暗示可点击 */
}

ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

a {
  color: #2c3e50;
  text-decoration: none;
}

/* 移除原来的按钮样式，不再需要 */
/* .btn 相关样式已删除 */

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
  box-shadow: inset 0px -1px 2px rgba(50, 50, 50, 0.1), inset -1px 0px 1px rgba(150, 150, 150, 0.2);
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

/* 覆盖原本的 default 光标，保持 pointer */
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
  position: absolute;
  top: 0;
  left: 0;
}

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
  z-index: 10;
}

.page>li {
  width: 100%;
  height: 100%;
  transform-origin: left center;
  transition-property: transform;
  transition-timing-function: ease;
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

/* 悬浮打开动画 */
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

/* ==================== 响应式 ==================== */
@media screen and (max-width: 600px) {
  .books-grid {
    grid-template-columns: 1fr;
    gap: 30px;
    max-width: 300px;
  }

  .book-position-2 {
    grid-column: 1;
    justify-self: center;
  }

  .shelf-title {
    font-size: 2.2rem;
    margin-bottom: 40px;
  }
}
</style>