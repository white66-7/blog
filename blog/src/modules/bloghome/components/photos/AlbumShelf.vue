<template>
  <div class="album-shelf-container">
    <ul class="align">
      <li v-for="(album, index) in albums" :key="album.id">
        <figure class='book'>        
          <!-- Front Cover -->        
          <ul class='hardcover_front'>
            <li>
              <img :src="album.cover" alt="" width="100%" height="100%">
              <!-- 动态添加徽章 -->
              <span v-if="index === 0" class="ribbon bestseller">HOT</span>
              <span v-if="index === 1" class="ribbon new">NEW</span>
            </li>
            <li></li>
          </ul>        
          <!-- Pages -->        
          <ul class='page'>
            <li></li>
            <li>
              <!-- 点击打开相册 -->
              <a class="btn" href="#" @click.prevent="$emit('select-album', album)">翻阅相册</a>
            </li>
            <li></li>
            <li></li>
            <li></li>
          </ul>        
          <!-- Back Cover -->        
          <ul class='hardcover_back'>
            <li></li>
            <li></li>
          </ul>
          <!-- Spine (书脊) -->
          <ul class='book_spine'>
            <li></li>
            <li></li>
          </ul>
          <!-- 描述文字 -->
          <figcaption>
            <h1>{{ album.title }}</h1>
            <span>共 {{ album.photos.length }} 张照片</span>
            <p>在这个相册中，记录了关于“{{ album.title }}”的精彩瞬间，点击左侧书本内的按钮即可翻阅全部相片。</p>
          </figcaption>
        </figure>
      </li>
    </ul>  
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
  padding-top: 100px; /* 给顶部导航留出空间 */
  overflow-y: auto;
  overflow-x: hidden;
  font-family: 'Lato', 'Microsoft YaHei', sans-serif;
}

ul { margin: 0; padding: 0; list-style: none; }
a { color: #2c3e50; text-decoration: none; }

.btn {
  display: inline-block;
  text-transform: uppercase;
  border: 2px solid #2c3e50;
  margin-top: 80px;  /* 调整按钮在书页中的位置 */
  font-size: 0.8em;
  font-weight: 700;
  padding: 0.3em 0.8em;
  text-align: center;
  transition: color 0.3s, border-color 0.3s;
}
.btn:hover { border-color: #16a085; color: #16a085; }

.align {
  clear: both;
  margin: 0 auto 20px;
  width: 100%;
  max-width: 1170px;
  text-align: center;
}
.align > li {
  width: 500px;
  min-height: 300px;
  display: inline-block;
  margin: 30px 20px 30px 30px;
  padding: 0 0 0 60px;
  vertical-align: top;
}

/* ==================== 3D 书本核心样式 ==================== */
.book {
  position: relative; width: 160px; height: 220px;
  perspective: 1000px; transform-style: preserve-3d;
}

.hardcover_front li:first-child { background-color: #eee; backface-visibility: hidden; }
.hardcover_front li:last-child { background: #fffbec; }
.hardcover_back li:first-child { background: #fffbec; }
.hardcover_back li:last-child { background: #fffbec; }
.book_spine li:first-child { background: #eee; }
.book_spine li:last-child { background: #333; }

.hardcover_front li:first-child:after, .hardcover_front li:first-child:before,
.hardcover_front li:last-child:after, .hardcover_front li:last-child:before,
.hardcover_back li:first-child:after, .hardcover_back li:first-child:before,
.hardcover_back li:last-child:after, .hardcover_back li:last-child:before,
.book_spine li:first-child:after, .book_spine li:first-child:before,
.book_spine li:last-child:after, .book_spine li:last-child:before {
  background: #999;
}

.page > li {
  background: linear-gradient(to right, #e1ddd8 0%, #fffbf6 100%);
  box-shadow: inset 0px -1px 2px rgba(50, 50, 50, 0.1), inset -1px 0px 1px rgba(150, 150, 150, 0.2);
  border-radius: 0px 5px 5px 0px;
}

.hardcover_front { transform: rotateY(-34deg) translateZ(8px); z-index: 100; }
.hardcover_back { transform: rotateY(-15deg) translateZ(-8px); }
.page li:nth-child(1) { transform: rotateY(-28deg); }
.page li:nth-child(2) { transform: rotateY(-30deg); }
.page li:nth-child(3) { transform: rotateY(-32deg); }
.page li:nth-child(4) { transform: rotateY(-34deg); }
.page li:nth-child(5) { transform: rotateY(-36deg); }

.hardcover_front, .hardcover_back, .book_spine, .hardcover_front li, .hardcover_back li, .book_spine li {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%; transform-style: preserve-3d;
}
.hardcover_front, .hardcover_back { transform-origin: 0% 100%; }
.hardcover_front { transition: all 0.8s ease, z-index 0.6s; }

.hardcover_front li:first-child { cursor: default; user-select: none; transform: translateZ(2px); }
.hardcover_front li:last-child { transform: rotateY(180deg) translateZ(2px); }
.hardcover_back li:first-child { transform: translateZ(2px); }
.hardcover_back li:last-child { transform: translateZ(-2px); }

.hardcover_front li:first-child:after, .hardcover_front li:first-child:before,
.hardcover_front li:last-child:after, .hardcover_front li:last-child:before,
.hardcover_back li:first-child:after, .hardcover_back li:first-child:before,
.hardcover_back li:last-child:after, .hardcover_back li:last-child:before,
.book_spine li:first-child:after, .book_spine li:first-child:before,
.book_spine li:last-child:after, .book_spine li:last-child:before {
  position: absolute; top: 0; left: 0;
}

.hardcover_front li:first-child:after, .hardcover_front li:first-child:before { width: 4px; height: 100%; }
.hardcover_front li:first-child:after { transform: rotateY(90deg) translateZ(-2px) translateX(2px); }
.hardcover_front li:first-child:before { transform: rotateY(90deg) translateZ(158px) translateX(2px); }
.hardcover_front li:last-child:after, .hardcover_front li:last-child:before { width: 4px; height: 160px; }
.hardcover_front li:last-child:after { transform: rotateX(90deg) rotateZ(90deg) translateZ(80px) translateX(-2px) translateY(-78px); }
.hardcover_front li:last-child:before { box-shadow: 0px 0px 30px 5px #333; transform: rotateX(90deg) rotateZ(90deg) translateZ(-140px) translateX(-2px) translateY(-78px); }

.hardcover_back li:first-child:after, .hardcover_back li:first-child:before { width: 4px; height: 100%; }
.hardcover_back li:first-child:after { transform: rotateY(90deg) translateZ(-2px) translateX(2px); }
.hardcover_back li:first-child:before { transform: rotateY(90deg) translateZ(158px) translateX(2px); }
.hardcover_back li:last-child:after, .hardcover_back li:last-child:before { width: 4px; height: 160px; }
.hardcover_back li:last-child:after { transform: rotateX(90deg) rotateZ(90deg) translateZ(80px) translateX(2px) translateY(-78px); }
.hardcover_back li:last-child:before { box-shadow: 10px -1px 80px 20px #666; transform: rotateX(90deg) rotateZ(90deg) translateZ(-140px) translateX(2px) translateY(-78px); }

.book_spine { transform: rotateY(60deg) translateX(-5px) translateZ(-12px); width: 16px; z-index: 0; }
.book_spine li:first-child { transform: translateZ(2px); }
.book_spine li:last-child { transform: translateZ(-2px); }
.book_spine li:first-child:after, .book_spine li:first-child:before { width: 4px; height: 100%; }
.book_spine li:first-child:after { transform: rotateY(90deg) translateZ(-2px) translateX(2px); }
.book_spine li:first-child:before { transform: rotateY(-90deg) translateZ(-12px); }
.book_spine li:last-child:after, .book_spine li:last-child:before { width: 4px; height: 16px; }
.book_spine li:last-child:after { transform: rotateX(90deg) rotateZ(90deg) translateZ(8px) translateX(2px) translateY(-6px); }
.book_spine li:last-child:before { box-shadow: 5px -1px 100px 40px rgba(0, 0, 0, 0.2); transform: rotateX(90deg) rotateZ(90deg) translateZ(-210px) translateX(2px) translateY(-6px); }

.page, .page > li { position: absolute; top: 0; left: 0; transform-style: preserve-3d; }
.page { width: 100%; height: 98%; top: 1%; left: 3%; z-index: 10; }
.page > li { width: 100%; height: 100%; transform-origin: left center; transition-property: transform; transition-timing-function: ease; }
.page > li:nth-child(1) { transition-duration: 0.6s; }
.page > li:nth-child(2) { transition-duration: 0.6s; }
.page > li:nth-child(3) { transition-duration: 0.4s; }
.page > li:nth-child(4) { transition-duration: 0.5s; }
.page > li:nth-child(5) { transition-duration: 0.6s; }

/* ==================== 悬浮打开动画 ==================== */
.book:hover > .hardcover_front { transform: rotateY(-145deg) translateZ(0); z-index: 0; }
.book:hover > .page li:nth-child(1) { transform: rotateY(-30deg); transition-duration: 1.5s; }
.book:hover > .page li:nth-child(2) { transform: rotateY(-35deg); transition-duration: 1.8s; }
.book:hover > .page li:nth-child(3) { transform: rotateY(-118deg); transition-duration: 1.6s; }
.book:hover > .page li:nth-child(4) { transform: rotateY(-130deg); transition-duration: 1.4s; }
.book:hover > .page li:nth-child(5) { transform: rotateY(-140deg); transition-duration: 1.2s; }

/* ==================== 装饰与文本 ==================== */
.ribbon {
  color: #fff; display: block; font-size: 0.7em; position: absolute; top: 11px; right: 1px;
  width: 40px; height: 20px; line-height: 20px; letter-spacing: 0.15em; text-align: center;
  transform: rotateZ(45deg) translateZ(1px); backface-visibility: hidden; z-index: 10;
}
.ribbon::before, .ribbon::after { position: absolute; top: -20px; width: 0; height: 0; border-top: 20px solid transparent; content: ""; }
.ribbon::before { left: -20px; border-left: 20px solid transparent; }
.ribbon::after { right: -20px; border-right: 20px solid transparent; }

/* SCSS 转化的 CSS */
.ribbon.new { background: #63c930; }
.ribbon.new:before, .ribbon.new:after { border-bottom: 20px solid #63c930; }
.ribbon.bestseller { background: #c0392b; }
.ribbon.bestseller:before, .ribbon.bestseller:after { border-bottom: 20px solid #c0392b; }

figcaption { padding-left: 40px; text-align: left; position: absolute; top: 0%; left: 160px; width: 310px; }
figcaption h1 { margin: 0; font-size: 1.5rem; color: #34495e; }
figcaption span { color: #16a085; padding: 0.6em 0 1em 0; display: block; font-weight: bold; }
figcaption p { color: #63707d; line-height: 1.5; font-size: 0.9rem; }

/* ==================== 响应式适配 ==================== */
@media screen and (max-width: 37.8125em) {
  .align > li { width: 100%; min-height: 440px; height: auto; padding: 0; margin: 0 0 30px 0; }
  .book { margin: 0 auto; }
  figcaption { text-align: center; width: 320px; top: 250px; padding-left: 0; left: -80px; font-size: 90%; }
}
</style>