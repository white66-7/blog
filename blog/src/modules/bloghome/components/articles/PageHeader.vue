<template>
  <div class="hero-fullscreen">
  <div class="page-header">
    <div class="header-left">
      <h1 class="case-title">
        <!-- 第一行：一路向北的 -->
        <span class="char-wrapper animate__animated animate__fadeInUp" style="animation-delay: 0s">
          <span class="r r1">一</span>
        </span>
        <span class="char-wrapper animate__animated animate__fadeInUp" style="animation-delay: 0.12s">
          <span class="r r2">路</span>
        </span>
        <span class="char-wrapper animate__animated animate__fadeInUp" style="animation-delay: 0.24s">
          <span class="r r3">向</span>
        </span>
        <span class="char-wrapper animate__animated animate__fadeInUp" style="animation-delay: 0.36s">
          <span class="r r4">北</span>
        </span>
        <span class="char-wrapper animate__animated animate__fadeInUp" style="animation-delay: 0.48s">
          <span class="r r5">的</span>
        </span>

        <!-- 换行断点 -->
        <span class="line-break"></span>

        <!-- 第二行：杂谈 -->
        <span class="char-wrapper animate__animated animate__fadeInUp" style="animation-delay: 0.60s">
          <span class="r r6">杂</span>
        </span>
        <span class="char-wrapper animate__animated animate__fadeInUp" style="animation-delay: 0.72s">
          <span class="r r7">谈</span>
        </span>

        <!-- 副标题 -->
        <span class="r-sub animate__animated animate__fadeIn" style="animation-delay: 1s"
          >对于真正的学习,我仍抱有敬畏之心</span
        >
      </h1>
    </div>

    <div class="header-right">
      <div class="mask animate__animated animate__fadeInLeft" style="animation-delay: 1.2s">
        <div class="magenta_overlay"></div>
        <img class="test" src="/covers/game.webp" alt="" />
      </div>
    </div>
  </div>

  <div class="tape-wrapper">
    <div class="tape-track">
      <!-- 第一组 -->
      <span class="tape-item">全栈</span>
      <span class="tape-item">前端</span>
      <span class="tape-item">大学</span>
      <span class="tape-item">反思</span>
      <span class="tape-item">后端</span>
      <span class="tape-item">动漫</span>
      <!-- 第二组（无缝衔接） -->
      <span class="tape-item">全栈</span>
      <span class="tape-item">前端</span>
      <span class="tape-item">大学</span>
      <span class="tape-item">反思</span>
      <span class="tape-item">后端</span>
      <span class="tape-item">动漫</span>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
</script>

<style>
/* ===== 引入外部样式 ===== */
@import url('https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css');
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@600;900&display=swap');

/* ===== CSS 变量与基础重置 ===== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

:root {
  --c-bg: oklch(96% 0.005 90);
  --c-fg: oklch(15% 0 0);
  --c-line: oklch(15% 0 0);
  --c-accent: oklch(88% 0.22 125);
  --ff-display: "Archivo Black", ui-sans-serif, system-ui, sans-serif;
  --bw: 1px;
  --s-3: 0.75rem;
}

body {
  background: #1e1a16;
  min-height: 100vh;
  overflow-x: hidden;
  font-family: 'Times New Roman', serif;
}
.hero-fullscreen {
  min-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  justify-content: center;   /* 垂直居中标题区 */
}
/* ===== 页面头部 ===== */
.page-header {
  display: flex;
  flex-direction: row;
  gap: 60px;               
  max-width: 1300px;       
  margin: 0 auto;
  align-items: center;
}

/* 左侧标题区 */
.header-left {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 20px 0;
}

.case-title {
  font-family: "Noto Serif SC", serif;
  display: flex;
  flex-wrap: wrap;          /* 允许换行 */
  line-height: 1.3;
  color: #1a1410;
  margin: 0 0 16px 0;
  align-items: baseline;
  gap: 0.5em 0.9em;
}

/* 用于强制换行的元素 */
.line-break {
  width: 100%;
  display: block;
}

/* 动画包裹器 */
.char-wrapper {
  display: inline-block;
}

/* 单个字的样式 */
.case-title .r {
  display: inline-block;
  margin-right: 0.3em;
  background: #f4ecd8;
  color: #111;
  padding: 0.05em 0.12em;
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 900;
  box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.2);
  white-space: nowrap;
  transition: transform 0.3s ease;
}

.case-title .r:hover {
  transform: translateY(-4px) rotate(0deg);
  box-shadow: 4px 6px 12px rgba(0, 0, 0, 0.25);
}

/* 各字的初始旋转角度 */
.r1 { transform: rotate(-3deg); }
.r2 { transform: rotate(2deg); background: #111; color: #f4ecd8; }
.r3 { transform: rotate(-1deg); }
.r4 { transform: rotate(3deg); }
.r5 { transform: rotate(-2deg); background: #a01818; color: #fff; }
.r6 { transform: rotate(1deg); }
.r7 { transform: rotate(-3deg); }

/* 副标题 */
.r-sub {
  display: block;
  width: 100%;
  font-family: "Noto Serif SC", serif;
  font-size: clamp(0.9rem, 2vw, 1.1rem);
  color: #3d2710;
  letter-spacing: 0.2em;
  margin-top: 12px;
  font-weight: 600;
  opacity: 0.85;
  line-height: 1.6;
}

/* 右侧图片区 */
.header-right {
  flex: 0 0 620px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.mask {
  width: 100%;
  max-width: 620px;
  aspect-ratio: 1;
  mask-image: url('/articles-cover/cover.webp');
  mask-size: cover;
  mask-repeat: no-repeat;
  overflow: hidden;
  transition: transform 0.4s ease;
  position: relative;      /* 为叠加层提供定位上下文 */
}

.mask:hover {
  transform: scale(1.02);
}

.test {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.magenta_overlay {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  background-color: #3d2710;
  opacity: 0.75;
  z-index: 2;
}


.tape-wrapper {
  margin-top: auto;  
  margin-bottom: 10vh;
  position: relative;
  width: 100vw;                
  margin-left: calc(-50vw + 50%);  
  left: 0;
  bottom: 0;
  z-index: 100;
  background: #dac8b0;
  color: #3e2c1b;
  animation: fadeInUpRotate 0.8s ease both;
  animation-delay: 1.3s;
  padding: 16px 0;
  border-top: 4px solid #6b4c2c;
  border-bottom: 4px solid #6b4c2c;
  box-shadow: 0 8px 30px rgba(0,0,0,0.6), inset 0 0 20px rgba(90,60,30,0.15);
  background-image: repeating-linear-gradient(0deg, rgba(180,150,110,0.07) 0px, rgba(180,150,110,0.07) 2px, transparent 2px, transparent 4px);
  overflow: hidden;
}

.tape-track {
  display: flex;
  /* 修复2：必须显式声明 nowrap，防止部分浏览器下 flex 子元素被挤压换行 */
  flex-wrap: nowrap;
  width: max-content;
  animation: scrollTape 14s linear infinite;
}

.tape-item {
  /* 修复3：转为 inline-flex 保证文本和内部伪元素在垂直方向绝对居中 */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-family: 'Times New Roman', 'Playfair Display', serif;
  font-weight: 700;
  font-size: clamp(1.8rem, 5vw, 3.5rem);
  white-space: nowrap;
  letter-spacing: 0.08em;
  padding: 0 4rem; /* 稍微减小 padding 让画面更紧凑 */
  text-shadow: 1px 1px 0 rgba(255,215,170,0.3);
  flex-shrink: 0;
  position: relative;
}

.tape-item::after {
  content: "◆";
  position: absolute;
  /* 修复4：精确定位。right:0 结合 translate(50%,-50%) 
     能让菱形极其完美地卡在两个元素的 padding 正中间，无论屏幕多大都不会偏 */
  right: 0;
  top: 50%;
  transform: translate(50%, -50%);
  color: #7a5a3a;
  font-size: 0.6em;
  opacity: 0.4;
}

@keyframes fadeInUpRotate {
  from {
    opacity: 0;
    transform: translateY(100px) rotate(-2deg);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotate(-2deg);
  }
}

@keyframes scrollTape {
  0%   { transform: translateX(0); }
  100% { transform: translateX(-50%); }
}

/* 悬浮暂停 */
.tape-wrapper:hover .tape-track {
  animation-play-state: paused;
}

/* 移动端适配保持不变 */
@media (max-width: 640px) {
  .tape-wrapper { padding: 8px 0; }
  .tape-item {
    font-size: clamp(1.2rem, 6vw, 1.8rem);
    padding: 0 1.2rem;
  }
}

/* ===== 移动端适配 ===== */
@media (max-width: 900px) {
  .page-header {
    flex-direction: column;
    gap: 32px;
  }
  .header-left {
    align-items: center;
    text-align: center;
  }
  .case-title {
    justify-content: center;
  }
  .header-right {
    flex: 0 0 auto;
    width: 100%;
    max-width: 320px;
    margin: 0 auto;
  }
  .mask {
    max-width: 320px;
  }
}


@media (max-width: 480px) {
  .case-title .r {
    font-size: clamp(1.6rem, 7vw, 2.4rem);
  }
  .r-sub {
    font-size: 0.85rem;
  }
}
</style>