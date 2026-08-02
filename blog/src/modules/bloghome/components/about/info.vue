<!-- src/modules/bloghome/components/TechStackCard.vue -->
<template>
  <div ref="cardRef" class="graphic-card">
    <div class="graphic-container">
      <!-- 同心圆 -->
      <div class="circles gsap-scale"></div>

      <!-- SVG 连线：带有顺时针星系旋转弧度的贝塞尔曲线 -->
      <svg class="lines-svg" viewBox="0 0 800 450">
        <!-- 1. 正上 -->
        <path class="line-path" d="M 400 225 Q 450 142 400 36" />
        <!-- 2. 右上 -->
        <path class="line-path" d="M 400 225 Q 550 220 650 150" />
        <!-- 3. 右下 -->
        <path class="line-path" d="M 400 225 Q 450 320 560 350" />
        <!-- 4. 左下 -->
        <path class="line-path" d="M 400 225 Q 350 320 240 350" />
        <!-- 5. 左上 -->
        <path class="line-path" d="M 400 225 Q 250 220 150 150" />
      </svg>

      <!-- 圆形头像 -->
      <div class="avatar-wrapper gsap-pop float-slow">
        <img src="@/assets/me.webp" alt="头像" />
      </div>

      <!-- 1号卫星：正上方 (例如 CSS3) -->
      <div class="icon-node n-1 float-anim">
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256">
          <path d="M0 0h256v256H0z" fill="none" />
          <g fill="none">
            <rect width="256" height="256" fill="#0277bd" rx="60" />
            <path fill="#ebebeb" d="m53.753 102.651l2.862 31.942h71.481v-31.942zM128.095 38H48l2.904 31.942h77.191zm0 180.841v-33.233l-.14.037l-35.574-9.605l-2.274-25.476H58.042l4.475 50.154l65.431 18.164z" />
            <path fill="#fff" d="m167.318 134.593l-3.708 41.426l-35.625 9.616v33.231l65.483-18.148l.48-5.397l7.506-84.092l.779-8.578L208 38h-80.015v31.942h45.009l-2.906 32.709h-42.103v31.942z" />
          </g>
        </svg>
      </div>

      <!-- 2号卫星：右上 (例如 HTML5) -->
      <div class="icon-node n-2 float-anim-alt">
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256">
          <path d="M0 0h256v256H0z" fill="none" />
          <g fill="none">
            <rect width="256" height="256" fill="#e14e1d" rx="60" />
            <path fill="#fff" d="m48 38l8.61 96.593h110.71l-3.715 41.43l-35.646 9.638l-35.579-9.624l-2.379-26.602H57.94l4.585 51.281l65.427 18.172l65.51-18.172l8.783-98.061H85.824l-2.923-32.71h122.238L208 38z" />
            <path fill="#ebebeb" d="M128 38H48l8.61 96.593H128v-31.938H85.824l-2.923-32.71H128zm0 147.647l-.041.014l-35.579-9.624l-2.379-26.602H57.94l4.585 51.281l65.427 18.172l.049-.014z" />
          </g>
        </svg>
      </div>

      <!-- 3号卫星：右下 (例如 Vue) -->
      <div class="icon-node n-3 float-anim">
        <svg xmlns="http://www.w3.org/2000/svg" width="1.16em" height="1em" viewBox="0 0 256 221">
          <path d="M0 0h256v221H0z" fill="none" />
          <path fill="#41b883" d="M204.8 0H256L128 220.8L0 0h97.92L128 51.2L157.44 0z" />
          <path fill="#41b883" d="m0 0l128 220.8L256 0h-51.2L128 132.48L50.56 0z" />
          <path fill="#35495e" d="M50.56 0L128 133.12L204.8 0h-47.36L128 51.2L97.92 0z" />
        </svg>
      </div>

      <!-- 4号卫星：左下 (例如 Spring/Leaf) -->
      <div class="icon-node n-4 float-anim-alt">
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 8 8">
          <path d="M0 0h8v8H0z" fill="none" />
          <path fill="#6db33f" d="m1 7l3 1l3-1l1-7H0m3 1v5H1.5L1 4l1 1V1m2 0h3v1H5v1h1.5L6 6H4V5h1V4H4" />
        </svg>
      </div>

      <!-- 5号卫星：左上  -->
      <div class="icon-node n-5 float-anim">
<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256">
	<path d="M0 0h256v256H0z" fill="none" />
	<g fill="none">
		<rect width="256" height="256" fill="#f4f2ed" rx="60" />
		<path fill="#5fb832" d="M209.545 171.821c-24.615 32.797-77.198 21.726-110.91 23.318c0 0-5.968.332-11.979 1.322c0 0 2.273-.97 5.172-1.969c23.678-8.188 34.867-9.833 49.254-17.223c27.032-13.848 53.936-44.01 59.41-75.344c-10.29 30.136-41.583 56.073-70.077 66.605c-19.504 7.197-54.773 14.201-54.778 14.204c.016.025-1.406-.738-1.426-.755c-23.986-11.67-24.678-63.62 18.886-80.366c19.1-7.347 37.369-3.311 58.017-8.226c22.022-5.236 47.528-21.743 57.895-43.324c11.622 34.472 25.583 88.404.536 121.758m.428-132.44c-2.93 6.962-6.507 13.236-10.629 18.847C181.197 39.604 155.868 28 127.871 28C72.799 28 28 72.804 28 127.866c0 28.865 12.32 54.898 31.964 73.146l2.187 1.937c-3.652-2.978-4.213-8.341-1.253-11.997c2.978-3.657 8.346-4.224 12-1.262c3.664 2.968 4.222 8.345 1.256 12.007c-2.956 3.664-8.334 4.217-11.993 1.261l1.489 1.318c17.375 14.63 39.774 23.467 64.221 23.467c52.64 0 95.865-40.965 99.565-92.67c2.74-25.316-4.737-57.462-17.463-95.692" />
	</g>
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
.graphic-card {
  width: 100%; 
  max-width: 860px; /* PC 端最大宽度 */
  margin: 40px auto; 
  padding: 30px 16px; /* 保证两边永远有留白 */
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

.n-1 { top: 8%; left: 50%; margin-top: -32px; margin-left: -32px; }
.n-2 { top: 33.33%; left: 81.25%; margin-top: -32px; margin-left: -32px; }
.n-3 { top: 77.77%; left: 70%; margin-top: -32px; margin-left: -32px; }
.n-4 { top: 77.77%; left: 30%; margin-top: -32px; margin-left: -32px; }
.n-5 { top: 33.33%; left: 18.75%; margin-top: -32px; margin-left: -32px; }

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