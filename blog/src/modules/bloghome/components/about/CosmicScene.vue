<!-- src/modules/bloghome/components/about/CosmicScene.vue -->
<template>
  <div class="cosmic-hero-wrapper">
    <div class="cosmic-stage">
      <!-- Canvas 动态星芒与发光流星雨 -->
      <canvas ref="canvasRef" class="space-canvas"></canvas>

      <!-- 3D 核心主场景 -->
      <div class="scene-scaler">
        <div class="scene">
          <div class="sun"></div>
          <div class="planet"></div>
          <div class="planet-2"></div>
          <div class="planet-3"></div>
          <div class="planet-4"></div>
          <div class="planet-6"></div>
          
          <!-- 5号动态地貌木星（带 SVG 噪波流体滤镜） -->
          <div class="planet-5">
            <div class="structure-1"></div>
            <div class="structure-2"></div>
            <div class="structure-3"></div>
          </div>

          <!-- 3D 立方体基座 -->
          <div class="cuboid">
            <div class="top">
              <div class="outline"></div>
              <div class="outline"></div>
              <div class="outline"></div>
              <div class="outline"></div>
            </div>
            <div class="front"></div>
            <div class="right"></div>
          </div>

          <!-- 2D 融入式人物与倒影 -->
          <div class="character-container">
            <!-- 人物本体 -->
            <img 
              :src="characterImg" 
              alt="character" 
              class="character-body" 
            />
            <!-- 镜像倒影 -->
            <img 
              :src="characterImg" 
              alt="character reflection" 
              class="character-reflection" 
            />
          </div>
        </div>
      </div>

      <!-- 宇宙背景音播放按钮 -->
      <button
        class="audio-icon-button"
        :class="{ 'is-playing': isPlaying }"
        @click="toggleAudio"
        title="播放/暂停宇宙白噪音"
      >
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
        <div class="bar"></div>
      </button>
      <audio ref="audioRef" preload="none" loop :src="cosmicAudio"></audio>

      <!-- SVG 滤镜定义 -->
      <svg class="filter-svg" xmlns="http://www.w3.org/2000/svg">
        <filter id="planet-structure">
          <feTurbulence baseFrequency="0.195" />
          <feColorMatrix
            values="0 0 0 1 -9
                    0 0 0 9 -1.5
                    0 0 0 2 -6
                    0 0 0 0 1"
          />
        </filter>
      </svg>
    </div>

    <!-- 底部深空羽化渐变 -->
    <div class="bottom-dark-fade"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

import characterImg from '@/assets/about/person.webp'

import cosmicAudio from '@/assets/about/cosmic_dreams.mp3'

const canvasRef = ref(null)
const audioRef = ref(null)
const isPlaying = ref(false)
let animId = null

const toggleAudio = () => {
  if (!audioRef.value) return
  if (audioRef.value.paused) {
    audioRef.value.play()
    isPlaying.value = true
  } else {
    audioRef.value.pause()
    isPlaying.value = false
  }
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')

  let width = 0
  let height = 0
  let dpr = window.devicePixelRatio || 1

  let staticStars = []
  let twinklingStars = []

  // 初始化星空数据（按比例分布）
  const initStars = () => {
    // 1. 大量静态背景微星（450颗，静止不闪，构建深空星尘感）
    staticStars = Array.from({ length: 800 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 0.9 + 0.2, // 0.2px ~ 1.1px 的细微星点
      alpha: Math.random() * 0.45 + 0.1 // 0.1 ~ 0.55 的微弱明暗差
    }))

    // 2. 少量动态呼吸星（70颗，缓慢闪烁）
    twinklingStars = Array.from({ length: 150 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.3 + 0.6,
      baseAlpha: Math.random() * 0.4 + 0.3,
      speed: Math.random() * 0.02 + 0.008,
      phase: Math.random() * Math.PI * 2
    }))
  }

  const handleResize = () => {
    if (!canvas) return
    dpr = window.devicePixelRatio || 1
    width = canvas.offsetWidth
    height = canvas.offsetHeight
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)
    initStars()
  }

  handleResize()
  window.addEventListener('resize', handleResize)

  // 3. 动态流星类
  class ShootingStar {
    constructor() {
      this.reset()
    }
    reset() {
      this.x = Math.random() * width * 1.3
      this.y = Math.random() * (height * 0.5)
      this.len = Math.random() * 110 + 60
      this.speed = Math.random() * 7 + 7
      this.size = Math.random() * 1.4 + 0.8
      this.angle = (35 * Math.PI) / 180
      this.active = false
      this.wait = Math.random() * 180 + 30
    }
    update() {
      if (this.wait > 0) {
        this.wait--
        return
      }
      this.active = true
      this.x -= Math.cos(this.angle) * this.speed
      this.y += Math.sin(this.angle) * this.speed
      if (this.x < -100 || this.y > height + 100) {
        this.reset()
      }
    }
    draw(c) {
      if (!this.active) return
      const tailX = this.x + Math.cos(this.angle) * this.len
      const tailY = this.y - Math.sin(this.angle) * this.len
      const grad = c.createLinearGradient(this.x, this.y, tailX, tailY)
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)')
      grad.addColorStop(0.2, 'rgba(215, 230, 255, 0.7)')
      grad.addColorStop(1, 'rgba(255, 255, 255, 0)')

      c.save()
      c.beginPath()
      c.strokeStyle = grad
      c.lineWidth = this.size
      c.lineCap = 'round'
      c.moveTo(this.x, this.y)
      c.lineTo(tailX, tailY)
      c.stroke()
      c.restore()
    }
  }

  const shootingStars = Array.from({ length: 4 }, () => new ShootingStar())

  // 主渲染循环
  const render = () => {
    ctx.clearRect(0, 0, width, height)

    // A. 批量绘制静态星海（静止不闪，超高帧率）
    staticStars.forEach((s) => {
      ctx.fillStyle = `rgba(240, 243, 255, ${s.alpha})`
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
      ctx.fill()
    })

    // B. 绘制呼吸闪烁星
    twinklingStars.forEach((s) => {
      s.phase += s.speed
      const alpha = s.baseAlpha + Math.sin(s.phase) * 0.3
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.08, alpha)})`
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
      ctx.fill()
    })

    // C. 绘制流星雨
    shootingStars.forEach((star) => {
      star.update()
      star.draw(ctx)
    })

    animId = requestAnimationFrame(render)
  }
  render()

  onUnmounted(() => {
    if (animId) cancelAnimationFrame(animId)
    window.removeEventListener('resize', handleResize)
  })
})
</script>

<style scoped>
@property --moon-angle {
  syntax: "<angle>";
  initial-value: 0deg;
  inherits: true;
}

@property --space {
  syntax: "<length>";
  initial-value: 0px;
  inherits: true;
}

.cosmic-hero-wrapper {
  width: 100%;
  position: relative;
  background-color: #101114;
  overflow: hidden;
}

.cosmic-stage {
  --color-primary: rgba(220, 219, 219, 0.85);
  --time: 24s;

  width: 100%;
  height: 88vh;
  min-height: 600px;
  max-height: 960px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(circle at 50% 40%, #28292e 0%, #15161a 58%, #101114 100%);
  overflow: hidden;
  perspective: 1000px;
}

.filter-svg {
  position: absolute;
  width: 0;
  height: 0;
  pointer-events: none;
}

.space-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.bottom-dark-fade {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 140px;
  background: linear-gradient(to bottom, transparent 0%, rgba(16, 17, 20, 0.8) 70%, #101114 100%);
  pointer-events: none;
  z-index: 10;
}

.scene-scaler {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 3;
  transform: translateY(45px);
  transform-origin: center center;
  transition: transform 0.3s ease;
}
.scene {
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  animation: scene-zoom-in-out var(--time) ease-in-out infinite;
  transform-style: preserve-3d;
}

@keyframes scene-zoom-in-out {
  0%, 100% { transform: scale(0.96); }
  50% { transform: scale(1.03); }
}

/* 3D 浮空立方体基座 */
.cuboid {
  position: absolute;
  transform-style: preserve-3d;
  transform: rotateY(312deg) rotateX(350deg) rotateZ(10deg) translateY(130px);
  --size: 110px;
  --size-h: 55px;
  --size-h-n: -55px;
  z-index: 10;
}

.cuboid .top {
  width: var(--size);
  aspect-ratio: 1;
  background: linear-gradient(135deg, #e8dbdd, #989699);
  transform-style: preserve-3d;
  transform: rotateX(90deg) translateZ(var(--size-h-n));
  opacity: 0.95;
}

.cuboid .front {
  width: var(--size);
  aspect-ratio: 1 / 2;
  background: linear-gradient(#5f595d, transparent 70%);
  opacity: 0.55;
  transform: translateZ(var(--size-h));
  position: absolute;
}

.cuboid .right {
  width: var(--size);
  aspect-ratio: 1 / 2;
  background: linear-gradient(#5f595d 10%, transparent 90%);
  transform: translate3d(var(--size-h), 0, 0) rotateY(90deg);
  position: absolute;
  opacity: 0.7;
}

.cuboid .outline {
  position: absolute;
  width: var(--size);
  aspect-ratio: 1;
  border: 1px solid rgba(255, 255, 255, 0.75);
  translate: calc(-50% + var(--size-h)) calc(-50% + var(--size-h));
  padding: var(--space);
  --duration: 16s;
  animation: outline-animation var(--duration) 0s cubic-bezier(0.68, 0.27, 0.26, 0.91) infinite;
  opacity: 0;
  box-shadow: inset 0 0 8px rgba(255, 255, 255, 0.4), 0 0 8px rgba(255, 255, 255, 0.4);
  --initial-space: var(--size-h);
}

.cuboid .outline:nth-of-type(2) { animation-delay: 4s; }
.cuboid .outline:nth-of-type(3) { animation-delay: 8s; }
.cuboid .outline:nth-of-type(4) { animation-delay: 12s; }

@keyframes outline-animation {
  from {
    --space: var(--initial-space, 55px);
    opacity: 0;
  }
  10% { opacity: 0.35; }
  50% { opacity: 0.6; }
  80% { opacity: 0.05; }
  to {
    --space: calc(var(--initial-space, 55px) + 260px);
    opacity: 0;
    filter: blur(4px);
  }
}

/* ================= 2D 融入式人物样式 ================= */
.character-container {
  position: absolute;
  /* 调整人物站立在立方体正上方 */
  transform: translateY(168px);
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  pointer-events: none;
}

.character-body {
  width: 110px;          /* 适配基座比例的合适宽度 */
  height: auto;
  object-fit: contain;
  /* 去除刺眼纯白高光，做深空冷色弱光轮廓与自然压暗 */
  filter: brightness(0.9) contrast(1.05) drop-shadow(0 0 6px rgba(180, 205, 230, 0.25));
  user-select: none;
  /* 若原图朝向左侧，可通过加上 transform: scaleX(-1); 翻转向右 */
}

/* 人物在基座上的倒影效果 */
.character-reflection {
  width: 110px;
  height: auto;
  object-fit: contain;
  /* 垂直镜像倒影 */
  transform: scaleY(-1) translateY(4px);
  opacity: 0.22;
  /* 倒影向下自然渐隐消融与轻微模糊 */
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.8) 0%, transparent 60%);
  -webkit-mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.8) 0%, transparent 60%);
  filter: blur(1.5px) brightness(0.65);
}

/* 行星系 */
@keyframes moon-animation {
  0%, 100% { --moon-angle: 180deg; }
  50% { --moon-angle: 200deg; }
}

.sun {
  border-radius: 50%;
  width: 280px;
  height: 280px;
  background: radial-gradient(circle at 60% 60%, #ffffff, #eae0e2 60%, #c9c7c7 100%);
  position: absolute;
  transform: translateY(-280px);
  box-shadow: 0 0 100px rgba(255, 255, 255, 0.45), 0 0 180px rgba(255, 255, 255, 0.15);
  transform-style: preserve-3d;
}

.planet {
  border-radius: 50%;
  width: 200px;
  height: 200px;
  background: radial-gradient(90% 90% at 60% 55%, #252525, #2a2f33 52%, #ede9ea 62%), #ede9ea;
  position: absolute;
  --r: 160px;
  --y: calc(-140px + sin(var(--moon-angle)) * var(--r));
  --z: calc(cos(var(--moon-angle)) * var(--r) * -1);
  transform: translateY(var(--y)) translateX(130px) translateZ(var(--z));
  animation: moon-animation var(--time) ease-in-out infinite;
  box-shadow: 0 0 25px rgba(255, 255, 255, 0.15);
  transform-style: preserve-3d;
}

.planet-2 {
  transform-style: preserve-3d;
  border-radius: 50%;
  width: 150px;
  height: 150px;
  background: radial-gradient(90% 90% at 60% 55%, #e3e3e3, #d2c6c8 52%, #212528 62%, transparent 82%);
  position: absolute;
  --r: 30px;
  --y: calc(-330px + sin(var(--moon-angle)) * var(--r));
  --z: calc(cos(var(--moon-angle)) * var(--r) * 1);
  transform: translateY(var(--y)) translateX(-220px) translateZ(var(--z));
  animation: moon-animation var(--time) ease-in-out infinite;
}

.planet-3 {
  transform-style: preserve-3d;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  background: radial-gradient(90% 90% at 70% 50%, #eeeeee 16%, #b7aeb0 38%, #3c4144 52%, #2d3134 60%, transparent 82%);
  position: absolute;
  transform: translateY(-180px) translateX(-220px);
  opacity: 0.7;
}

.planet-4 {
  transform-style: preserve-3d;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  background: radial-gradient(90% 90% at 70% 50%, #d0d0d0, #b7aeb0 38%, #121415 52%, #131617 60%, transparent 82%);
  position: absolute;
  transform: translateY(-90px) translateX(-240px);
  opacity: 0.6;
}

/* 5号木星：SVG 流体噪波地质结构 */
.planet-5 {
  transform-style: preserve-3d;
  border-radius: 50%;
  width: 120px;
  height: 120px;
  background: radial-gradient(90% 90% at 30% 55%, #797777, #515051 52%, #212528 62%, transparent 82%);
  position: absolute;
  --r: 60px;
  --y: calc(-260px + sin(var(--moon-angle)) * var(--r));
  --z: calc(cos(var(--moon-angle)) * var(--r) * 1);
  transform: translateY(var(--y)) translateX(210px) translateZ(var(--z));
  clip-path: circle();
  overflow: hidden;
  animation: moon-animation var(--time) ease-in-out infinite;
}

.planet-5 .structure-1 {
  position: absolute;
  inset: -100px;
  filter: url(#planet-structure) saturate(0);
  mix-blend-mode: lighten;
  opacity: 0.4;
  transform: scale(3) translateX(10px);
  animation: move-to-left calc(var(--time) * 6) ease-in-out infinite;
}

.planet-5 .structure-2 {
  position: absolute;
  inset: -100px;
  filter: url(#planet-structure) saturate(0);
  mix-blend-mode: lighten;
  opacity: 0.5;
  transform: scale(5);
  animation: move-to-left calc(var(--time) * 6) ease-in-out infinite;
}

.planet-5 .structure-3 {
  position: absolute;
  inset: -100px;
  filter: url(#planet-structure) saturate(0);
  mix-blend-mode: lighten;
  opacity: 0.15;
  transform: scale(0.4) translateX(10px);
  animation: move-to-left calc(var(--time) * 6) ease-in-out infinite;
}

.planet-5::after {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at 10% 20%, transparent 30%, #171a1c 70%);
}

@keyframes move-to-left {
  0%, 100% { translate: 0 0; }
  50% { translate: -80px 0; }
}

.planet-6 {
  transform-style: preserve-3d;
  border-radius: 50%;
  width: 85px;
  height: 85px;
  background: radial-gradient(90% 90% at 30% 55%, #f3ecec, #7a7a7a 52%, #212528 72%, transparent);
  position: absolute;
  --r: 70px;
  --y: calc(-300px + sin(var(--moon-angle)) * var(--r));
  --z: calc(cos(var(--moon-angle)) * var(--r) * 1);
  transform: translateY(var(--y)) translateX(260px) translateZ(var(--z));
  animation: moon-animation var(--time) ease-in-out infinite;
  display: grid;
  place-items: center;
}

.planet-6::after {
  content: "";
  position: absolute;
  border-radius: 50%;
  width: 140px;
  height: 14px;
  border: 24px solid #43484c;
  box-shadow: inset 0 0 10px black;
  transform: rotate(25deg);
  mask: radial-gradient(circle at 50% -20%, transparent 30%, black);
  clip-path: ellipse(47% 22% at 50% 50%);
}

.audio-icon-button {
  border: 1px solid rgba(255, 255, 255, 0.35);
  padding: 0.5rem;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  position: absolute;
  right: 2rem;
  bottom: 2.2rem;
  top: auto;

  z-index: 4200;
  display: flex;
  gap: 0.15rem;
  align-items: center;
  justify-content: center;
  opacity: 0.75;
  cursor: pointer;
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.audio-icon-button:hover {
  opacity: 1;
  transform: scale(1.1);
  border-color: rgba(255, 255, 255, 0.9);
}

.audio-icon-button .bar {
  background: #ffffff;
  height: 1.2rem;
  width: 0.085rem;
  border-radius: 1px;
}

.audio-icon-button .bar:nth-of-type(1),
.audio-icon-button .bar:nth-of-type(5) { height: 0.4rem; }
.audio-icon-button .bar:nth-of-type(2),
.audio-icon-button .bar:nth-of-type(4) { height: 0.8rem; }

.audio-icon-button.is-playing .bar {
  animation: bar-dance 1s ease-in-out infinite alternate;
}
.audio-icon-button.is-playing .bar:nth-of-type(2) { animation-delay: 0.2s; }
.audio-icon-button.is-playing .bar:nth-of-type(3) { animation-delay: 0.4s; }
.audio-icon-button.is-playing .bar:nth-of-type(4) { animation-delay: 0.6s; }
.audio-icon-button.is-playing .bar:nth-of-type(5) { animation-delay: 0.8s; }

@keyframes bar-dance {
  from { transform: scaleY(0.3); }
  to { transform: scaleY(1.3); }
}

/* 针对较矮屏幕（如 13/14 寸笔记本或小高度窗口） */
@media (max-height: 850px) {
  .scene-scaler {
    transform: scale(0.85) translateY(40px);
  }
}
@media (max-height: 700px) {
  .scene-scaler {
    transform: scale(0.72) translateY(30px);
  }
}

/* 针对中屏幕（平板 / 平板竖屏 max-width: 900px） */
@media (max-width: 900px) {
  .cosmic-stage {
    height: 80vh;
    min-height: 560px;
  }
  .scene-scaler {
    /* 缩小比例的同时保持适当的下移，星球绝不破顶 */
    transform: scale(0.76) translateY(38px);
  }
  .audio-icon-button {
    right: 1.2rem;
    bottom: 1.5rem; /* 改为底部 */
    top: auto;
  }
}

/* 针对小屏幕（手机端 max-width: 600px） */
@media (max-width: 600px) {
  .cosmic-stage {
    height: 75vh;
    min-height: 500px;
  }
  .scene-scaler {
    transform: scale(0.6) translateY(30px);
  }
}

/* 针对超小屏幕手机（max-width: 400px） */
@media (max-width: 400px) {
  .cosmic-stage {
    min-height: 440px;
  }
  .scene-scaler {
    transform: scale(0.5) translateY(25px);
  }
}
</style>