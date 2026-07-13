<template>
  <div class="hero-fullscreen">
    <div class="page-header">
      <div class="header-left">
        <h1 class="case-title">
          <!-- 第一行：一路向北的 -->
          <!-- 动态绑定：仅在第一次载入时加入 animate__ 相关的类名 -->
          <span :class="['char-wrapper', playAnimation ? 'animate__animated animate__fadeInUp' : '']" style="animation-delay: 0s">
            <span class="r r1">一</span>
          </span>
          <span :class="['char-wrapper', playAnimation ? 'animate__animated animate__fadeInUp' : '']" style="animation-delay: 0.12s">
            <span class="r r2">路</span>
          </span>
          <span :class="['char-wrapper', playAnimation ? 'animate__animated animate__fadeInUp' : '']" style="animation-delay: 0.24s">
            <span class="r r3">向</span>
          </span>
          <span :class="['char-wrapper', playAnimation ? 'animate__animated animate__fadeInUp' : '']" style="animation-delay: 0.36s">
            <span class="r r4">北</span>
          </span>
          <span :class="['char-wrapper', playAnimation ? 'animate__animated animate__fadeInUp' : '']" style="animation-delay: 0.48s">
            <span class="r r5">的</span>
          </span>

          <!-- 换行断点 -->
          <span class="line-break"></span>

          <!-- 第二行：杂谈 -->
          <span :class="['char-wrapper', playAnimation ? 'animate__animated animate__fadeInUp' : '']" style="animation-delay: 0.60s">
            <span class="r r6">杂</span>
          </span>
          <span :class="['char-wrapper', playAnimation ? 'animate__animated animate__fadeInUp' : '']" style="animation-delay: 0.72s">
            <span class="r r7">谈</span>
          </span>

          <!-- 副标题 -->
          <span :class="['r-sub', playAnimation ? 'animate__animated animate__fadeIn' : '']" style="animation-delay: 0.9s"
            >对于真正的学习,我仍抱有敬畏之心</span
          >
        </h1>
        <div :class="['hero-meta', playAnimation ? 'animate__animated animate__fadeIn' : '']" style="animation-delay:1.2s">
          <div class="meta-divider"></div>
          <div :class="['meta-row', playAnimation ? 'animate__animated animate__slideInDown' : '']" style="animation-delay: 1.3s">
            <div class="meta-item">
              <span class="meta-label">最近更新</span>
              <span class="meta-value"> {{ latestDate }}</span>
            </div>

            <div class="meta-dot"></div>

            <div class="meta-item">
              <span class="meta-label">所有文章</span>
              <span class="meta-value">{{ totalArticles }} 篇</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="header-right">
        <div :class="['mask', playAnimation ? 'animate__animated animate__fadeInLeft' : '']" style="animation-delay: 1.2s">
          <div class="magenta_overlay"></div>
          <img class="test" src="/covers/game.webp" alt="" />
        </div>
      </div>
    </div>

    <div :class="['tape-wrapper', playAnimation ? 'animate__animated animate__fadeIn' : '']" style="animation-delay: 1.4s">
      <div class="category-bar ">
        <div
          class="category-item"
          v-for="item in categoryStats"
          :key="item.name"
        >
          <span class="name">{{ item.name }}</span>
          <span class="count">{{ item.count }} 篇</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// 记忆芯片：PageHeader的独占全局变量，确保跨路由保留唯一状态
let headerHasAnimated = false
export default {
  name: 'PageHeader'
}
</script>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { articles } from '@/date/articles'

const playAnimation = ref(!headerHasAnimated)

onMounted(() => {
  // 💡 核心修改：不但要拦截下次，还要在本次播放完毕后(3秒后)把 class 扒掉
  if (!headerHasAnimated) {
    headerHasAnimated = true // 标记已经播过
    setTimeout(() => {
      playAnimation.value = false // 3秒后移除 DOM 上的所有动画类名
    }, 3000) 
  }
})

const totalArticles = computed(() => articles.length)

const latestDate = computed(() => {
  if (!articles.length) return ''

  return articles.reduce((latest, article) => {
    return new Date(article.date) > new Date(latest.date)
      ? article
      : latest
  }).date
})

const order = [
  '前端',
  '后端',
  '算法',
  '动漫',
  '大学',
  '复盘'
]

const categoryStats = computed(() => {
  return order.map(type => ({
    name: type,
    count: articles.filter(
      article => article.type === type
    ).length
  }))
})
</script>

<style scoped>
/* ===== CSS 变量与基础重置 ===== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
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
.header-left{
    flex:1;
    display:flex;
    flex-direction:column;
    justify-content:center;
    padding:20px 0;
    margin-bottom:0px;
}

.case-title {
  font-family: "ShangShouJiangHuShuFa", serif;
  display: flex;
  flex-wrap: wrap;         
  line-height: 1.3;
  color: #1a1410;
  margin: 0 0 16px 0;
  align-items: baseline;
  gap: 0.5em 0.9em;
}

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
  font-weight: normal;
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
  font-family: "ZiTiGuanJiaKaiTi", serif;
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
.hero-meta{
    margin-top:40px;
    width:480px;
}

.meta-divider{
    width:100%;
    height:1px;
    background:#d6c7b6;
    margin-bottom:22px;
}

.meta-row{
    display:flex;
    align-items:flex-start;
    gap:40px;
}

.meta-item{
    display:flex;
    flex-direction:column;
}

.meta-label{
    font-size:12px;
    letter-spacing:.22em;
    color:#8a7158;
    font-family: "Times New Roman", serif;
    text-transform:uppercase;
    margin-bottom:8px;
}

.meta-value{
    font-family:"Noto Serif SC";
    font-size:20px;
    font-weight:700;
    color:#2d1d12;
}

.meta-dot{
    width:1px;
    height:42px;
    background:#d8c8b5;
    margin-top:0;
}

.tape-wrapper{
    width:100vw;
    margin-left:calc(-50vw + 50%);
    margin-top:auto;
    margin-bottom:8vh;
    padding:24px 0;
    border-top:1px solid #c7b090;
    border-bottom:1px solid #c7b090;
    box-shadow: 0 8px 18px rgba(0,0,0,.08), inset 0 1px rgba(255,255,255,.4);
    background: linear-gradient(180deg, #efdfc7, #e7d2b3);
    background-image: radial-gradient(rgba(90,70,40,.03) 1px, transparent 1px);
    background-size:10px 10px;
}

.category-item{
    flex:1;
    display:flex;
    flex-direction:column;
    justify-content:center;
    align-items:center;
    position:relative;
    user-select:none;
    cursor:default;
}

.name{
    font-family:"Noto Serif SC";
    font-size:26px;
    font-weight:900;
    color:#2d1d12;
    letter-spacing:.03em;
}

.count{
    margin-top:4px;
    font-size:12px;
    color:#6b5441;
    letter-spacing:.15em;
}

.category-bar{
    max-width:1300px;
    margin:0 auto;
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap:20px;
}

/* 1. 平板 & 小屏笔记本 (max-width: 900px) */
@media (max-width: 900px) {
  .hero-fullscreen { padding-top: 40px; }
  .page-header { flex-direction: column; gap: 40px; }
  .header-left { align-items: center; text-align: center; padding: 0 20px; }
  .case-title { justify-content: center; }
  .hero-meta { width: 100%; max-width: 400px; margin-top: 30px; }
  .meta-row { justify-content: center; }
  .header-right { flex: 0 0 auto; width: 100%; max-width: 320px; margin: 0 auto; }
  .mask { max-width: 320px; }
}

/* 2. 大屏手机 (max-width: 640px) */
@media (max-width: 640px) {
  .tape-wrapper { padding: 20px 0; }
  .category-bar { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px 0px; padding: 0 10px; }
  .name { font-size: 20px; }
  .count { font-size: 11px; }
}

/* 3. 小屏手机 (max-width: 480px) */
@media (max-width: 480px) {
  .case-title .r { font-size: clamp(1.6rem, 8vw, 2.2rem); margin-bottom: 6px; }
  .r-sub { font-size: 0.85rem; margin-top: 8px; line-height: 1.5; }
  .mask { max-width: 260px; }
  .category-bar { grid-template-columns: repeat(2, 1fr); gap: 16px 0px; }
}
</style>