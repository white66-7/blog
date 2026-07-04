<!-- src/modules/bloghome/components/TechStackCard.vue -->
<template>
  <div ref="cardRef" class="graphic-card">
    <!-- 主图形容器 -->
    <div class="graphic-container">
      <!-- 同心圆 -->
      <div class="circles gsap-scale"></div>

      <!-- SVG 连线（仅保留 3 条） -->
      <svg class="lines-svg" viewBox="0 0 800 450">
        <!-- 保留的三条线 -->
        <!-- <path class="line-path" d="M 400 225 C 250 225, 180 225, 120 225" /> -->
        <!-- <path class="line-path" d="M 400 225 C 550 225, 620 225, 680 225" /> -->
        <path class="line-path" d="M 400 225 C 550 225, 600 120, 640 120" />

        <!-- 注释掉的旧线（可取消注释恢复） -->
        <path class="line-path" d="M 400 225 C 250 225, 200 120, 160 120" />
        <path class="line-path" d="M 400 225 C 250 225, 200 330, 160 330" />
        <path class="line-path" d="M 400 225 C 550 225, 600 330, 640 330" />

        <!-- 添加新线参考（终点坐标）：
          n-l1(160,120)  n-l2(120,225)  n-l3(160,330)
          n-r1(640,120)  n-r2(680,225)  n-r3(640,330)
        -->
      </svg>

      <!-- 圆形头像（固定图片，无上传功能） -->
      <div class="avatar-wrapper gsap-pop float-slow">
        <img src="@/assets/me.jpg" alt="头像" />
      </div>

      <!-- 6 个粘土节点 -->
      <div class="icon-node n-l1 float-anim">
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256">
          <path d="M0 0h256v256H0z" fill="none" />
          <g fill="none">
            <rect width="256" height="256" fill="#0277bd" rx="60" />
            <path
              fill="#ebebeb"
              d="m53.753 102.651l2.862 31.942h71.481v-31.942zM128.095 38H48l2.904 31.942h77.191zm0 180.841v-33.233l-.14.037l-35.574-9.605l-2.274-25.476H58.042l4.475 50.154l65.431 18.164z"
            />
            <path
              fill="#fff"
              d="m167.318 134.593l-3.708 41.426l-35.625 9.616v33.231l65.483-18.148l.48-5.397l7.506-84.092l.779-8.578L208 38h-80.015v31.942h45.009l-2.906 32.709h-42.103v31.942z"
            />
          </g>
        </svg>
      </div>
      <!-- <div class="icon-node n-l2 float-anim-alt"></div> -->

      <div class="icon-node n-l3 float-anim-alt">
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 8 8">
          <path d="M0 0h8v8H0z" fill="none" />
          <path
            fill="currentColor"
            d="m1 7l3 1l3-1l1-7H0m3 1v5H1.5L1 4l1 1V1m2 0h3v1H5v1h1.5L6 6H4V5h1V4H4"
          />
        </svg>
      </div>

      <div class="icon-node n-r1 float-anim-alt">
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256">
          <path d="M0 0h256v256H0z" fill="none" />
          <g fill="none">
            <rect width="256" height="256" fill="#e14e1d" rx="60" />
            <path
              fill="#fff"
              d="m48 38l8.61 96.593h110.71l-3.715 41.43l-35.646 9.638l-35.579-9.624l-2.379-26.602H57.94l4.585 51.281l65.427 18.172l65.51-18.172l8.783-98.061H85.824l-2.923-32.71h122.238L208 38z"
            />
            <path
              fill="#ebebeb"
              d="M128 38H48l8.61 96.593H128v-31.938H85.824l-2.923-32.71H128zm0 147.647l-.041.014l-35.579-9.624l-2.379-26.602H57.94l4.585 51.281l65.427 18.172l.049-.014z"
            />
          </g>
        </svg>
      </div>
      <!-- <div class="icon-node n-r2 float-anim"></div> -->
      <div class="icon-node n-r3 float-anim-alt">
        <svg xmlns="http://www.w3.org/2000/svg" width="1.16em" height="1em" viewBox="0 0 256 221">
          <path d="M0 0h256v221H0z" fill="none" />
          <path fill="#41b883" d="M204.8 0H256L128 220.8L0 0h97.92L128 51.2L157.44 0z" />
          <path fill="#41b883" d="m0 0l128 220.8L256 0h-51.2L128 132.48L50.56 0z" />
          <path fill="#35495e" d="M50.56 0L128 133.12L204.8 0h-47.36L128 51.2L97.92 0z" />
        </svg>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// 注册 ScrollTrigger 插件
gsap.registerPlugin(ScrollTrigger)

const cardRef = ref(null)

onMounted(() => {
  // ─── 1. GSAP 初始动画 ──────────────────────────
  

  // SVG 线条绘制动画准备
  const paths = document.querySelectorAll('.line-path')
  paths.forEach((path) => {
    const length = path.getTotalLength()
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length })
  })
  const tl = gsap.timeline()
  tl.from(
      '.gsap-scale',
      { scale: 0, opacity: 0, duration: 1.2, ease: 'back.out(1.2)' },
      '-=0.8',
    )
    .from(
      '.gsap-pop',
      {
        scale: 0,
        rotation: -30,
        opacity: 0,
        duration: 0.8,
        ease: 'back.out(2)',
      },
      '-=0.6',
    )
    .to(
      '.line-path',
      {
        strokeDashoffset: 0,
        duration: 1.5,
        ease: 'power2.inOut',
        stagger: { amount: 0.5, from: 'center' },
      },
      '-=0.4',
    )
    .from(
      '.icon-node',
      {
        scale: 0,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'back.out(1.5)',
      },
      '-=1.2',
    )
  // ─── 2. 持续浮动动画 ──────────────────────────
  gsap.utils.toArray('.float-anim').forEach((node, i) => {
    gsap.to(node, {
      y: '-=8',
      rotation: '2',
      duration: 2.5 + i * 0.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: i * 0.1,
    })
  })

  gsap.utils.toArray('.float-anim-alt').forEach((node, i) => {
    gsap.to(node, {
      y: '+=8',
      rotation: '-2',
      duration: 2.8 + i * 0.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: i * 0.15,
    })
  })

  gsap.to('.float-slow', {
    y: '-=5',
    duration: 2,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  })

  // ─── 3. 节点悬停交互 ──────────────────────────
  const nodes = document.querySelectorAll('.icon-node')
  nodes.forEach((node) => {
    node.addEventListener('mouseenter', () => {
      gsap.to(node, {
        scale: 1.15,
        duration: 0.3,
        ease: 'back.out(2)',
        overwrite: 'auto',
      })
    })
    node.addEventListener('mouseleave', () => {
      gsap.to(node, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: 'auto',
      })
    })
  })

  // ─── 4. 滚动视差（ScrollTrigger） ──────────────
  gsap.to('.graphic-container', {
    y: 50,
    ease: 'none',
    scrollTrigger: {
      trigger: cardRef.value,
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
    },
  })
})
</script>

<style scoped>
/* 1. 最外层卡片：彻底放弃固定宽度，改为自适应 */
.graphic-card {
  width: 100%; 
  max-width: 860px; /* PC 端最大宽度 */
  margin: 40px auto; 
  padding: 0 16px; /* 保证两边永远有留白 */
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  overflow: hidden; /* 防止任何子元素溢出撑爆屏幕 */
}

/* 2. 画布容器：保持 16:9 比例 */
.graphic-container {
  position: relative;
  width: 100%;
  max-width: 800px;
  aspect-ratio: 16 / 9;
  margin: 0 auto;
}

/* 3. 同心圆：🚀 核心修复！改用 inset + margin，防止被 GSAP 动画吃掉居中效果 */
.circles {
  position: absolute;
  top: 0; bottom: 0; left: 0; right: 0; /* 上下左右全部贴边 */
  margin: auto; /* 浏览器自动计算完美居中 */
  width: 300px;
  height: 300px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.02);
  box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.05);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1;
}
.circles::before {
  content: '';
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.03);
  box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.05);
  position: absolute;
}
.circles::after {
  content: '';
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.04);
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.05);
  position: absolute;
}

/* 4. 头像中心：同样使用 inset + margin 完美居中 */
.avatar-wrapper {
  position: absolute;
  top: 0; bottom: 0; left: 0; right: 0;
  margin: auto; 
  z-index: 10;
  width: 170px;
  height: 170px;
  border-radius: 50%;
  cursor: default;
  filter: var(--brain-glow);
  box-shadow: var(--clay-shadow-out), var(--clay-shadow-in);
  border: 2px solid rgba(255, 255, 255, 0.15);
  overflow: hidden;
  background: #2a2a2a;
}
.avatar-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 50%;
}

/* ===== SVG 连线 ===== */
.lines-svg {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  z-index: 2;
  pointer-events: none;
}
.line-path {
  fill: none;
  stroke: #333;
  stroke-width: 1.5;
  stroke-linecap: round;
  opacity: 0.6;
}

/* ===== 粘土节点 ===== */
.icon-node {
  position: absolute;
  width: 64px;
  height: 64px;
  background: #000000 !important;
  border-radius: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: white;
  font-size: 24px;
  font-weight: 700;
  box-shadow: var(--clay-shadow-out), var(--clay-shadow-in);
  z-index: 5;
  cursor: pointer;
  transition: border-color 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.05);
}
.icon-node:hover { border-color: rgba(255, 255, 255, 0.3); }
.icon-node svg { width: 32px; height: 32px; }

/* 节点精准百分比定位 */
.n-l1 { top: 26.66%; left: 20%; margin-top: -32px; margin-left: -32px; }
.n-l3 { top: 73.33%; left: 20%; margin-top: -32px; margin-left: -32px; }
.n-r1 { top: 26.66%; left: 80%; margin-top: -32px; margin-left: -32px; }
.n-r3 { top: 73.33%; left: 80%; margin-top: -32px; margin-left: -32px; }

.logo-text { font-size: 16px; letter-spacing: -0.5px; }
.float-slow { will-change: transform; }

/* =========================================
   移动端自动缩放适配 (无需修改位置，自然等比缩小)
========================================= */
@media (max-width: 900px) {
.circles { width: 170px; height: 170px; }
  .circles::before { width: 110px; height: 110px; }
  .circles::after { width: 60px; height: 60px; }
  
  .avatar-wrapper { width: 56px; height: 56px; } /* 头像也对应稍微缩小一点点 */
  

  .icon-node { width: 44px; height: 44px; border-radius: 12px; }
  .icon-node svg { width: 22px; height: 22px; }
  
  /* 节点居中偏移值调整为移动端尺寸的一半 */
  .n-l1 { margin-top: -22px; margin-left: -22px; }
  .n-l3 { margin-top: -22px; margin-left: -22px; }
  .n-r1 { margin-top: -22px; margin-left: -22px; }
  .n-r3 { margin-top: -22px; margin-left: -22px; }

  /* 移动端关闭悬浮/浮动动画，节约性能 */
  .float-anim, .float-anim-alt { animation: none; }
  .icon-node:active { transform: scale(1.1); }
}

@media (max-width: 400px) {
  .icon-node { width: 36px; height: 36px; }
  .icon-node svg { width: 18px; height: 18px; }
  .n-l1 { margin-top: -18px; margin-left: -18px; }
  .n-l3 { margin-top: -18px; margin-left: -18px; }
  .n-r1 { margin-top: -18px; margin-left: -18px; }
  .n-r3 { margin-top: -18px; margin-left: -18px; }
}
</style>