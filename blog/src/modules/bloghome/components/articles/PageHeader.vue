<template>
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
        <span class="r-sub">对于真正的学习,要抱有敬畏之心</span>
      </h1>
    </div>
    <div class="header-right">
      <div class="mask">
        <div class="magenta_overlay"></div>   <!-- 这层就是粉红/蓝色遮罩 -->
        <img class="test" src="/messages/1/1.webp" alt="">
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
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
  line-height: 1.3;
  color: #1a1410;
  margin: 0 0 16px 0;
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.15em 0.25em;
}

.case-title .r {
  display: inline-block;
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