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
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@600;900&display=swap');

/* ===== 标题样式 ===== */
.case-title {
  font-family: "Noto Serif SC", serif;
  line-height: 1.2;
  color: #1a1410;
  margin: 0;
  display: block; 
}
.case-title .r {
  display: inline-block;
  background: #f4ecd8;
  color: #111;
  padding: 0 0.09em;
  font-size: clamp(1.8rem, 4.5vw, 3.2rem);
  font-weight: 900;
  box-shadow: 2px 2px 0 rgba(0, 0, 0, 0.3);
  white-space: nowrap;
}
.r1 { transform: rotate(-5deg); }
.r2 { transform: rotate(3deg); background: #111; color: #f4ecd8; }
.r3 { transform: rotate(-2deg); }
.r4 { transform: rotate(4deg); }
.r5 { transform: rotate(-3deg); background: #a01818; color: #fff; }
.r6 { transform: rotate(2deg); }
.r7 { transform: rotate(-4deg); }
.r-sub {
  display: block;
  width: 100%;
  font-family: "Noto Serif SC", serif;
  font-size: clamp(0.75rem, 1.8vw, 1rem);
  color: #3d2710;
  letter-spacing: 0.15em;
  margin-top: 0.4rem;
  font-weight: 600;
  opacity: 0.9;
}

/* ===== 整体布局（简化） ===== */
.page-header {
  max-width: 950px;
  margin: 0 auto 30px;
}
.header-left {
  display: flex;
  align-items: center;
  min-height: 120px;
}

/* ===== 移动端适配 ===== */
@media (max-width: 768px) {
  .header-left { min-height: auto; }
  .case-title .r { font-size: clamp(1.6rem, 6vw, 2.4rem); }
}
</style>