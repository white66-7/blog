<template>
  <div class="intro-box">
    <div class="section-label">open source
    </div>
    <div class="intro-title">占位<br /><span>占位</span></div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.section-label {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  letter-spacing: 0.2em;
  color: #0047FF;
  margin-bottom: 20px;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #D8D2C8;
  max-width: 60px;
}

.intro-title {
  font-family: 'ShangShouJiangHuShuFa', serif;   /* 你的毛笔字体 */
  font-size: clamp(52px, 7vw, 96px);
  line-height: 0.9;
  letter-spacing: 0.05em;
  color: #161411;
}

.intro-title span {
  color: #8d857c;
  font-size: 0.75em;
}
</style>