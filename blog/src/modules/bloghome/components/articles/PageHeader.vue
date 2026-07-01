<template>
  <!-- 原有头部区域 -->
  <div class="page-header">
    <div class="header-left">
      <h1 class="case-title">
        <span class="r r1">一</span>
        <span class="r r2">路</span>
        <span class="r r3">向</span>
        <span class="r r4">北</span>
        
        <span class="r r5">的</span>
        <br>
        <span class="r r6">杂</span>
        <span class="r r7">谈</span>
        <span class="r-sub">对于真正的学习,我认为还是要抱有些许敬畏之心</span>
      </h1>
    </div>
    <div class="header-right">
      <div class="mask">
        <div class="magenta_overlay"></div>
        <img class="test" src="/messages/1/1.webp" alt="">
      </div>
    </div>
  </div>

  <div class="marquee" aria-hidden="true">
    <div class="marquee__track">
      <span>大学</span><span class="dot">●</span>
      <span>前端</span><span class="dot">●</span>
      <span>复盘</span><span class="dot">●</span>
      <span>动漫</span><span class="dot">●</span>
      <span>后端</span><span class="dot">●</span>
      <span>大学</span><span class="dot">●</span>
      <span>前端</span><span class="dot">●</span>
      <span>复盘</span><span class="dot">●</span>
      <span>Web &amp; Interaction</span><span class="dot">●</span>
      <span>动漫</span><span class="dot">●</span>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style>

:root {
  --c-bg: oklch(96% 0.005 90);
  --c-fg: oklch(15% 0 0);
  --c-line: oklch(15% 0 0);
  --c-accent: oklch(88% 0.22 125);
  --ff-display: "Archivo Black", ui-sans-serif, system-ui, sans-serif;
  --bw: 1px;
  --s-3: 0.75rem;
}

.marquee {
  width: 100vw;
  margin-left: calc(-50vw + 50%);
  border-block: var(--bw) solid var(--c-line);
  background: var(--c-fg);
  color: var(--c-bg);
  margin-bottom: 4rem;
  overflow: hidden;
  white-space: nowrap;
  font-family: var(--ff-display);
  font-size: clamp(1.5rem, 4cqi, 3rem);
  text-transform: uppercase;
  letter-spacing: -0.02em;
  padding: var(--s-3) 0;
}
.marquee__track {
  display: inline-block;
  animation: marquee 40s linear infinite;
  padding-left: 100%;
}

.marquee__track span {
  padding-inline: 0.5em;
}

.marquee__track span.dot {
  color: var(--c-accent);
}

@keyframes marquee {
  to {
    transform: translateX(-100%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .marquee__track {
    animation: none;
  }
}


@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@600;900&display=swap');

/* ===== 整体容器 ===== */
.page-header {
  display: flex;
  flex-direction: row;
  gap: 48px;  /* 左右间距 */
  max-width: 1100px;
  margin: 0 auto 40px;
  align-items: center;  /* 垂直居中 */
}

/* ===== 左侧标题区 ===== */
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
  line-height: 1.3;
  color: #1a1410;
  margin: 0 0 16px 0;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.5em 0.90em;
}

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

.r1 { transform: rotate(-3deg); }
.r2 { transform: rotate(2deg); background: #111; color: #f4ecd8; }
.r3 { transform: rotate(-1deg); }
.r4 { transform: rotate(3deg); }
.r5 { transform: rotate(-2deg); background: #a01818; color: #fff; }
.r6 { transform: rotate(1deg); }
.r7 { transform: rotate(-3deg); }

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

/* ===== 右侧图片区 ===== */
.header:nth-of-type(2) {
  flex: 0 0 420px;  /* 固定宽度 */
  display: flex;
  justify-content: center;
  align-items: center;
}

/* ===== 图片遮罩容器 ===== */
.mask {
  width: 100%;
  max-width: 420px;
  aspect-ratio: 1;  /* 保持正方形 */
  mask-image: url('https://i.imgur.com/HM8w3eQ.png');
  mask-size: cover;
  mask-repeat: no-repeat;
  overflow: hidden;
  transition: transform 0.4s ease;
}

.mask:hover {
  transform: scale(1.02);
}

/* ===== 图片本身 ===== */
.test {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

/* 叠加层样式保留（如果需要） */
.blue_overlay, .yellow_overlay, .magenta_overlay {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
  opacity: .75;
  z-index: 99999;
  mix-blend-mode: normal;
}

.magenta_overlay {
  background-color: #3d2710 !important;
}

/* ===== 移动端适配 ===== */
@media (max-width: 900px) {
  .page-header {
    flex-direction: column;  /* 改为上下排列 */
    gap: 32px;
  }
  
  .header-left {
    align-items: center;
    text-align: center;
  }
  
  .case-title {
    justify-content: center;
  }
  
  .header:nth-of-type(2) {
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