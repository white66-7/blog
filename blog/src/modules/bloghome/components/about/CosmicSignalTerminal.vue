<!-- src/modules/bloghome/components/about/CosmicStars.vue -->
<template>
  <div class="stardust-layer" aria-hidden="true">
    <!-- 1. 铺底静态微星群（通过单元素 box-shadow 高性能渲染） -->
    <span class="dust dust-static"></span>

    <!-- 2. 动态呼吸闪烁的明亮星点（错开节奏与位置） -->
    <span class="dust dust-breathe dust-1"></span>
    <span class="dust dust-breathe dust-2"></span>
    <span class="dust dust-breathe dust-3"></span>
    <span class="dust dust-breathe dust-4"></span>
    <span class="dust dust-breathe dust-5"></span>
  </div>
</template>

<script setup>
</script>

<style scoped>
.stardust-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 0;
}

/* ================= 静态微星点阵 ================= */
.dust-static {
  position: absolute;
  top: 0;
  left: 0;
  width: 1.5px;
  height: 1.5px;
  border-radius: 50%;
  background: transparent;
  box-shadow:
    28px 18px 0 0 rgba(255, 255, 255, 0.4),
    64px 42px 0.5px 0 rgba(255, 255, 255, 0.25),
    112px 14px 0 0 rgba(255, 255, 255, 0.5),
    158px 60px 0 0 rgba(255, 255, 255, 0.28),
    206px 32px 0.5px 0 rgba(255, 255, 255, 0.35),
    248px 76px 0 0 rgba(255, 255, 255, 0.22),
    292px 20px 0 0 rgba(255, 255, 255, 0.45),
    336px 92px 0.5px 0 rgba(255, 255, 255, 0.26),
    370px 54px 0 0 rgba(255, 255, 255, 0.32),
    398px 108px 0 0 rgba(255, 255, 255, 0.24),
    52px 130px 0 0 rgba(255, 255, 255, 0.3),
    140px 160px 0.5px 0 rgba(255, 255, 255, 0.2),
    260px 145px 0 0 rgba(255, 255, 255, 0.28),
    340px 175px 0 0 rgba(255, 255, 255, 0.18),
    90px 210px 0 0 rgba(255, 255, 255, 0.24),
    310px 230px 0.5px 0 rgba(255, 255, 255, 0.2);
}

/* ================= 呼吸闪耀亮星 ================= */
.dust-breathe {
  position: absolute;
  border-radius: 50%;
  background: #ffffff;
  box-shadow: 0 0 6px rgba(180, 220, 255, 0.8), 0 0 12px rgba(94, 200, 240, 0.4);
  animation: star-breathe ease-in-out infinite alternate;
}

/* 各亮星的位置、大小、闪烁周期与延迟 */
.dust-1 {
  width: 2.5px;
  height: 2.5px;
  top: 18%;
  left: 22%;
  animation-duration: 4.2s;
  animation-delay: 0s;
}

.dust-2 {
  width: 2px;
  height: 2px;
  top: 36%;
  left: 58%;
  animation-duration: 5.6s;
  animation-delay: 1.4s;
}

.dust-3 {
  width: 3px;
  height: 3px;
  top: 15%;
  left: 78%;
  animation-duration: 3.8s;
  animation-delay: 0.7s;
}

.dust-4 {
  width: 2px;
  height: 2px;
  top: 72%;
  left: 35%;
  animation-duration: 4.8s;
  animation-delay: 2.1s;
}

.dust-5 {
  width: 2.5px;
  height: 2.5px;
  top: 65%;
  left: 82%;
  animation-duration: 6.2s;
  animation-delay: 0.3s;
}

/* 呼吸缩放与明暗光晕动画 */
@keyframes star-breathe {
  0% {
    opacity: 0.15;
    transform: scale(0.75);
    box-shadow: 0 0 2px rgba(180, 220, 255, 0.3);
  }
  100% {
    opacity: 1;
    transform: scale(1.2);
    box-shadow: 0 0 8px rgba(255, 255, 255, 0.9), 0 0 16px rgba(94, 200, 240, 0.6);
  }
}
</style>