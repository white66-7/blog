<template>
  <div class="home-page">
    <Navbar :transparent="false" />
    <div class="graphic-card">
        <div class="text animate__animated animate__fadeIn" style="animation-delay: 0.3s">
             <h1>我的技术栈</h1>
        </div>
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
		<path fill="#ebebeb" d="m53.753 102.651l2.862 31.942h71.481v-31.942zM128.095 38H48l2.904 31.942h77.191zm0 180.841v-33.233l-.14.037l-35.574-9.605l-2.274-25.476H58.042l4.475 50.154l65.431 18.164z" />
		<path fill="#fff" d="m167.318 134.593l-3.708 41.426l-35.625 9.616v33.231l65.483-18.148l.48-5.397l7.506-84.092l.779-8.578L208 38h-80.015v31.942h45.009l-2.906 32.709h-42.103v31.942z" />
	</g>
</svg>
      </div>
      <!-- <div class="icon-node n-l2 float-anim-alt">
      </div> -->

      <div class="icon-node n-l3 float-anim-alt">
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 8 8">
	<path d="M0 0h8v8H0z" fill="none" />
	<path fill="currentColor" d="m1 7l3 1l3-1l1-7H0m3 1v5H1.5L1 4l1 1V1m2 0h3v1H5v1h1.5L6 6H4V5h1V4H4" />
</svg>

      </div>

      <div class="icon-node n-r1 float-anim-alt">
<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 256 256">
	<path d="M0 0h256v256H0z" fill="none" />
	<g fill="none">
		<rect width="256" height="256" fill="#e14e1d" rx="60" />
		<path fill="#fff" d="m48 38l8.61 96.593h110.71l-3.715 41.43l-35.646 9.638l-35.579-9.624l-2.379-26.602H57.94l4.585 51.281l65.427 18.172l65.51-18.172l8.783-98.061H85.824l-2.923-32.71h122.238L208 38z" />
		<path fill="#ebebeb" d="M128 38H48l8.61 96.593H128v-31.938H85.824l-2.923-32.71H128zm0 147.647l-.041.014l-35.579-9.624l-2.379-26.602H57.94l4.585 51.281l65.427 18.172l.049-.014z" />
	</g>
</svg>
      </div>
      <!-- <div class="icon-node n-r2 float-anim">
      </div> -->
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
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navbar from '@/modules/bloghome/components/load.vue';

// 注册 ScrollTrigger 插件
gsap.registerPlugin(ScrollTrigger);

onMounted(() => {
  // ─── 1. GSAP 初始动画 ──────────────────────────
  const tl = gsap.timeline();

  // SVG 线条绘制动画准备
  const paths = document.querySelectorAll('.line-path');
  paths.forEach((path) => {
    const length = path.getTotalLength();
    gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
  });

  tl.from('.gsap-fade', { opacity: 0, duration: 1, ease: 'power2.out' })
    .from(
      '.gsap-scale',
      { scale: 0, opacity: 0, duration: 1.2, ease: 'back.out(1.2)' },
      '-=0.8'
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
      '-=0.6'
    )
    .to(
      '.line-path',
      {
        strokeDashoffset: 0,
        duration: 1.5,
        ease: 'power2.inOut',
        stagger: { amount: 0.5, from: 'center' },
      },
      '-=0.4'
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
      '-=1.2'
    )
    .from(
      '.gsap-slide-up',
      { y: 40, opacity: 0, duration: 0.8, ease: 'power3.out' },
      '-=0.8'
    );

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
    });
  });

  gsap.utils.toArray('.float-anim-alt').forEach((node, i) => {
    gsap.to(node, {
      y: '+=8',
      rotation: '-2',
      duration: 2.8 + i * 0.2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      delay: i * 0.15,
    });
  });

  gsap.to('.float-slow', {
    y: '-=5',
    duration: 2,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut',
  });

  // ─── 3. 节点悬停交互 ──────────────────────────
  const nodes = document.querySelectorAll('.icon-node');
  nodes.forEach((node) => {
    node.addEventListener('mouseenter', () => {
      gsap.to(node, {
        scale: 1.15,
        duration: 0.3,
        ease: 'back.out(2)',
        overwrite: 'auto',
      });
    });
    node.addEventListener('mouseleave', () => {
      gsap.to(node, {
        scale: 1,
        duration: 0.3,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    });
  });

  // ─── 4. 滚动视差（ScrollTrigger） ──────────────
  gsap.to('.graphic-container', {
    y: 50,
    ease: 'none',
    scrollTrigger: {
      trigger: '.home-page',
      start: 'top top',
      end: 'bottom top',
      scrub: 1,
    },
  });
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');

:root {
  --bg-gradient: linear-gradient(180deg, #f0f4f8 0%, #ffffff 100%);
  --text-dark: #222;
  --text-light: #888;
  --clay-dark-bg: #2a2a2a;
  --clay-shadow-out: 10px 15px 25px rgba(0, 0, 0, 0.15), -5px -5px 15px rgba(255, 255, 255, 0.8);
  --clay-shadow-in: inset 2px 2px 5px rgba(255, 255, 255, 0.15), inset -2px -2px 5px rgba(0, 0, 0, 0.5);
  --brain-glow: drop-shadow(0 10px 15px rgba(255, 100, 100, 0.2));
}

body {
  background: var(--bg-gradient);
  color: var(--text-dark);
  min-height: 120vh; 
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-x: hidden;
}

.home-page {
  background: #f0f0f0;
  min-height: 120vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow-x: hidden;
  padding-top: 20px;
}

.graphic-card {
  box-sizing: border-box;
  width: 860px;          
  height: 500px;
  margin: 80px auto;    
  background: rgba(217, 217, 217, 0.58);
  border: 1px solid white;
  box-shadow: 12px 17px 51px rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(6px);
  border-radius: 17px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
}
.text{
    color:#000000;
    font-size: 24px;
}
.graphic-container {
  position: relative;
  width: 100%;
  max-width: 800px;
  height: 450px;
  margin: 0;   
  display: flex;
  justify-content: center;
  align-items: center;
}


/* ===== 同心圆 ===== */
.circles {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
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

.avatar-wrapper {
  position: relative;
  z-index: 10;
  width: 68px;
  height: 68px;
  border-radius: 50%;
  cursor: default; /* 不再可点击上传 */
  filter: var(--brain-glow);
  box-shadow: var(--clay-shadow-out), var(--clay-shadow-in);
  border: 2px solid rgba(255, 255, 255, 0.15);
  overflow: hidden;
  background: #2a2a2a;
  flex-shrink: 0;
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
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: none;
}
.line-path {
  fill: none;
  stroke: #333;      /* 深灰色线条，在浅色背景上清晰可见 */
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

.icon-node:hover {
  border-color: rgba(255, 255, 255, 0.3);
}
.icon-node svg {
  width: 32px;
  height: 32px;
}

/* 节点位置 */
.n-l1 { top: 20%; left: 15%; }
.n-l2 { top: 50%; left: 10%; transform: translateY(-50%); }
.n-l3 { bottom: 20%; left: 15%; }
.n-r1 { top: 20%; right: 15%; }
.n-r2 { top: 50%; right: 10%; transform: translateY(-50%); font-family: serif; }
.n-r3 { bottom: 20%; right: 15%; }

.logo-text { font-size: 16px; letter-spacing: -0.5px; }


/* ===== 工具类 ===== */
.float-slow { will-change: transform; }
</style>