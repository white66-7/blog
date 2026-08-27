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

          <!-- 3D 站立人物 -->
          <div class="human">
            <div class="neck"></div>
            <div class="head"></div>
            <div class="body">
              <div class="shoulder"></div>
              <div class="back"></div>
              <div class="hip"><div class="center"></div></div>
            </div>
            <div class="leg left"><div class="knee"></div><div class="lower"></div></div>
            <div class="leg right"><div class="knee"></div><div class="lower"></div></div>
            <div class="arm left"><div class="hand"></div></div>
            <div class="arm right"><div class="hand"></div></div>
          </div>

          <!-- 人物倒影 -->
          <div class="human shadow">
            <div class="neck"></div>
            <div class="head"></div>
            <div class="body">
              <div class="shoulder"></div>
              <div class="back"></div>
              <div class="hip"><div class="center"></div></div>
            </div>
            <div class="leg left"><div class="knee"></div><div class="lower"></div></div>
            <div class="leg right"><div class="knee"></div><div class="lower"></div></div>
            <div class="arm left"><div class="hand"></div></div>
            <div class="arm right"><div class="hand"></div></div>
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
      <audio ref="audioRef" loop src="https://assets.codepen.io/907471/cosmic_dreams.mp3"></audio>

      <!-- SVG 滤镜定义（恢复木星流体地质与星云滤镜） -->
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

  const handleResize = () => {
    if (!canvas) return
    dpr = window.devicePixelRatio || 1
    width = canvas.offsetWidth
    height = canvas.offsetHeight
    canvas.width = width * dpr
    canvas.height = height * dpr
    ctx.scale(dpr, dpr)
  }

  handleResize()
  window.addEventListener('resize', handleResize)

  const stars = Array.from({ length: 130 }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 1.5 + 0.4,
    baseAlpha: Math.random() * 0.5 + 0.2,
    speed: Math.random() * 0.02 + 0.005,
    phase: Math.random() * Math.PI * 2
  }))

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

  const render = () => {
    ctx.clearRect(0, 0, width, height)

    stars.forEach((s) => {
      s.phase += s.speed
      const alpha = s.baseAlpha + Math.sin(s.phase) * 0.25
      ctx.fillStyle = `rgba(255, 255, 255, ${Math.max(0.08, alpha)})`
      ctx.beginPath()
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2)
      ctx.fill()
    })

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
  transform: translateY(-10px);
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

/* 3D 站立人物 */
.human {
  position: absolute;
  display: grid;
  place-items: center;
  width: 70px;
  height: 160px;
  transform: translateY(112px);
  z-index: 111;
}

.human:not(.shadow) {
  filter: drop-shadow(0 0 16px rgba(255, 255, 255, 0.85));
}

.human > div { position: absolute; }

.human .head {
  background: white;
  width: 18px;
  height: 19px;
  border-radius: 50%;
  translate: 2px -68px;
  rotate: 355deg;
}

.human .head:before {
  content: "";
  position: absolute;
  background: white;
  width: 3px;
  height: 8px;
  border-radius: 50%;
  translate: 13px 4px;
  rotate: 136deg;
  animation: head-nose calc(var(--time) / 4) ease-in-out infinite;
}

.human .head:after {
  content: "";
  position: absolute;
  background: white;
  width: 12px;
  height: 10px;
  border-radius: 50%;
  translate: 5px 7px;
  rotate: 45deg;
  animation: head-chin calc(var(--time) / 4) ease-in-out infinite;
}

.human .neck {
  background: white;
  width: 9px;
  height: 17px;
  border-radius: 50%;
  translate: 2px -58px;
}

.human .neck:before {
  content: "";
  position: absolute;
  width: 3px;
  height: 17px;
  background: white;
  border-radius: 50%;
  translate: 7px 4px;
  rotate: 352deg;
}

.human .body { z-index: 11; }
.human .body > div { position: absolute; }

.human .body .shoulder:before {
  content: "";
  position: absolute;
  width: 15px;
  height: 6px;
  background: white;
  border-radius: 50%;
  translate: -12px -54px;
  rotate: 330deg;
}

.human .body .shoulder:after {
  content: "";
  position: absolute;
  width: 15px;
  height: 6px;
  background: white;
  border-radius: 50%;
  translate: 5px -53px;
  rotate: 24deg;
}

.human .body .back {
  width: 15px;
  height: 46px;
  background: #fbfbfb;
  border-radius: 20%;
  translate: -2px -53px;
  rotate: 357deg;
}

.human .body .back:before {
  content: "";
  position: absolute;
  width: 32px;
  height: 17px;
  background: #fbfbfb;
  border-radius: 50%;
  translate: -15px 8px;
  rotate: 69deg;
  z-index: -1;
}

.human .body .back:after {
  content: "";
  position: absolute;
  width: 29px;
  height: 11px;
  background: #fbfbfb;
  border-radius: 50%;
  translate: 1px 12px;
  rotate: 96deg;
}

.human .body .hip .center {
  position: absolute;
  width: 18px;
  height: 20px;
  background: radial-gradient(white, #f5f5f5);
  border-radius: 39.6%;
  translate: -3px -33px;
  rotate: 267deg;
}

.human .body .hip:before {
  content: "";
  position: absolute;
  width: 18px;
  height: 24px;
  background: radial-gradient(white, #e7e4e4);
  border-radius: 46.5%;
  translate: -7px -27px;
  rotate: 8deg;
}

.human .body .hip:after {
  content: "";
  position: absolute;
  width: 15px;
  height: 24px;
  background: radial-gradient(white, #f6f5f5);
  border-radius: 41.1%;
  translate: 3px -24px;
  rotate: 161deg;
}

.human .leg.right {
  width: 12px;
  height: 32px;
  background: white;
  border-radius: 50%;
  translate: 13px 4px;
  rotate: 348deg;
}

.human .leg.right:after {
  content: "";
  position: absolute;
  width: 8px;
  height: 32px;
  background: white;
  border-radius: 50%;
  translate: 5px 2px;
  rotate: 13deg;
}

.human .leg.right .knee {
  position: absolute;
  height: 19px;
  width: 8px;
  background: white;
  border-radius: 39.6%;
  translate: 0px 24px;
  rotate: 15deg;
}

.human .leg.right .lower {
  position: absolute;
  height: 36px;
  width: 9px;
  background: white;
  border-radius: 50%;
  translate: -3px 26px;
  rotate: 15deg;
}

.human .leg.right .lower:before {
  content: "";
  position: absolute;
  width: 6px;
  height: 17px;
  background: white;
  border-radius: 67.8%;
  translate: 5px 29px;
  rotate: 66deg;
}

.human .leg.right .lower:after {
  content: "";
  position: absolute;
  width: 6px;
  height: 17px;
  background: white;
  border-radius: 27.8%;
  translate: 1px 25px;
  rotate: 0deg;
}

.human .leg.left {
  width: 12px;
  height: 32px;
  background: #ebe6e6;
  border-radius: 50%;
  translate: -3px 4px;
  rotate: 2deg;
  z-index: -1;
}

.human .leg.left:after {
  content: "";
  position: absolute;
  width: 8px;
  height: 32px;
  background: #ebe6e6;
  border-radius: 50%;
  translate: 5px 2px;
  rotate: 13deg;
}

.human .leg.left .knee {
  position: absolute;
  height: 19px;
  width: 8px;
  background: #dfdbdb;
  border-radius: 39.6%;
  translate: 0px 24px;
  rotate: 5deg;
}

.human .leg.left .lower {
  position: absolute;
  height: 36px;
  width: 9px;
  background: #e2dede;
  border-radius: 50%;
  translate: -1px 21px;
  rotate: 5deg;
}

.human .leg.left .lower:before {
  content: "";
  position: absolute;
  width: 6px;
  height: 17px;
  background: #dfdbdb;
  border-radius: 67.8%;
  translate: 5px 29px;
  rotate: 47deg;
}

.human .leg.left .lower:after {
  content: "";
  position: absolute;
  width: 6px;
  height: 17px;
  background: #dfdbdb;
  border-radius: 27.8%;
  translate: 1px 25px;
  rotate: 0deg;
}

.human .arm.right {
  position: absolute;
  width: 8px;
  height: 32px;
  background: white;
  border-radius: 27.8%;
  translate: 18px -34px;
  rotate: 346deg;
  animation: arm-right calc(var(--time) / 4) ease-in-out infinite;
}

.human .arm.right:before {
  content: "";
  position: absolute;
  width: 3px;
  height: 27px;
  background: white;
  border-radius: 27.8%;
  translate: 3px 23px;
  rotate: 6deg;
}

.human .arm.right:after {
  content: "";
  position: absolute;
  width: 4px;
  height: 24px;
  background: white;
  border-radius: 27.8%;
  translate: 1px 23px;
  rotate: 351deg;
}

.human .arm.right .hand {
  position: absolute;
  width: 3px;
  height: 9px;
  background: white;
  border-radius: 27.8%;
  translate: 3px 41px;
  rotate: 353deg;
}

.human .arm.right .hand:after {
  content: "";
  position: absolute;
  width: 5px;
  height: 6px;
  background: white;
  border-radius: 39.2%;
  translate: -2px 7px;
  rotate: 65deg;
}

.human .arm.left {
  width: 8px;
  height: 28px;
  background: white;
  border-radius: 59.8%;
  translate: -10px -38px;
  rotate: 359deg;
  z-index: -2;
  opacity: 0.85;
  animation: arm-left calc(var(--time) / 4) ease-in-out infinite;
}

.human .arm.left:before {
  content: "";
  position: absolute;
  width: 3px;
  height: 27px;
  background: white;
  border-radius: 27.8%;
  translate: 3px 20px;
  rotate: 6deg;
}

.human .arm.left:after {
  content: "";
  position: absolute;
  width: 4px;
  height: 24px;
  background: white;
  border-radius: 27.8%;
  translate: 2px 23px;
  rotate: 351deg;
}

.human .arm.left .hand {
  position: absolute;
  width: 3px;
  height: 9px;
  background: white;
  border-radius: 27.8%;
  translate: 3px 41px;
  rotate: 353deg;
}

.human .arm.left .hand:after {
  content: "";
  position: absolute;
  width: 5px;
  height: 6px;
  background: white;
  border-radius: 39.2%;
  translate: -1px 2px;
  rotate: 65deg;
}

.human.shadow {
  transform: scaleY(-1) translateY(-145px);
  opacity: 0.22;
  z-index: 0;
  mask: linear-gradient(to top, black 10%, transparent 35%);
}

.human.shadow .leg.left .lower:before,
.human.shadow .leg.right .lower:before {
  rotate: 102deg;
}

@keyframes head-nose {
  0%, 100% { translate: 13px 4px; }
  50% { translate: 11px 4px; }
}

@keyframes head-chin {
  0%, 100% { translate: 5px 7px; }
  50% { translate: 2px 7px; }
}

@keyframes arm-right {
  0%, 100% { rotate: 346deg; }
  50% { rotate: 350deg; }
}

@keyframes arm-left {
  0%, 100% { rotate: 359deg; }
  50% { rotate: 364deg; }
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

/* 5号木星：恢复 SVG 流体噪波地质结构 */
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

/* 播放按钮 */
.audio-icon-button {
  border: 1px solid rgba(255, 255, 255, 0.35);
  padding: 0.5rem;
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.45);
  position: absolute;
  right: 2rem;
  top: 2rem;
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

@media (max-width: 900px) {
  .cosmic-stage {
    height: 75vh;
    min-height: 520px;
  }
  .scene-scaler {
    transform: scale(0.82) translateY(-10px);
  }
  .audio-icon-button {
    right: 1.2rem;
    top: 1.2rem;
  }
}

@media (max-width: 550px) {
  .cosmic-stage {
    height: 68vh;
    min-height: 460px;
  }
  .scene-scaler {
    transform: scale(0.68) translateY(-10px);
  }
}
</style>