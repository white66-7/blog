<template>
  <div class="container">
    <canvas ref="canvasRef" class="snow-canvas"></canvas>

    <!-- 三行逐行动画 -->
    <h1>
      <span>做点</span>
      <span>真正</span>
      <span>想做的</span>
    </h1>

    <!-- 装饰动画：光速飞船 -->
    <div class="hero-loader" aria-hidden="true">
      <div class="speeder">
        <span><span></span><span></span><span></span><span></span></span>
        <div class="base">
          <span></span>
          <div class="face"></div>
        </div>
      </div>
      <div class="longfazers"><span></span><span></span><span></span><span></span></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onActivated, onBeforeUnmount, onDeactivated, onMounted, ref } from 'vue'

interface SnowOptions {
  radius: [number, number]
  speed: [number, number]
  wind: [number, number]
}

interface SnowParams {
  x: number
  y: number
  radius: number
  speed: number
  wind: number
  opacity: number
  isResized: boolean
}

type SnowItemInstance = ReturnType<typeof createSnowItem>

// 轻盈自然的下落配置
const defaultOptions: SnowOptions = {
  radius: [0.6, 2.2],
  speed: [0.4, 1.2],
  wind: [-0.3, 0.5],
}

const rand = (min: number, max: number) => min + Math.random() * (max - min)

// 安全获取有效尺寸，防止容器隐藏时 offset 变 0 导致坐标坍塌
function getSafeSize(canvas: HTMLCanvasElement) {
  const width = canvas.offsetWidth || window.innerWidth || 375
  const height = canvas.offsetHeight || window.innerHeight || 667
  return { width, height }
}

function createSnowItem(canvas: HTMLCanvasElement, opts?: Partial<SnowOptions>) {
  const options: SnowOptions = { ...defaultOptions, ...opts }
  const { radius, speed, wind } = options
  const { width, height } = getSafeSize(canvas)

  const params: SnowParams = {
    x: rand(0, width),
    // 刚打开页面时直接铺满全屏（包括导航栏区域 0~60px 里直接就有雪花在飘）
    y: rand(0, height),
    radius: rand(radius[0], radius[1]),
    speed: rand(speed[0], speed[1]),
    wind: rand(wind[0], wind[1]),
    opacity: rand(0.18, 0.65), // 景深半透明，不抢视觉焦点
    isResized: false,
  }

  const ctx = canvas.getContext('2d') as CanvasRenderingContext2D

  const updateData = () => {
    const { width: w } = getSafeSize(canvas)
    params.x = rand(0, w)
    params.y = rand(-15, 0)
  }

  const resized = () => {
    params.isResized = true
  }

  const draw = () => {
    ctx.beginPath()
    ctx.arc(params.x, params.y, params.radius, 0, 2 * Math.PI)
    ctx.fillStyle = `rgba(255, 255, 255, ${params.opacity})`
    ctx.fill()
    ctx.closePath()
  }

  const translate = () => {
    params.y += params.speed
    params.x += params.wind
  }

  const onDown = () => {
    const { width: w, height: h } = getSafeSize(canvas)
    if (params.y < h) return

    if (params.isResized) {
      updateData()
      params.isResized = false
    } else {
      // 触底刷新：从导航栏顶端边缘（-15px 到 0px）无缝滑落，直接穿透透明导航栏
      params.y = rand(-15, 0)
      params.x = rand(0, w)
    }
  }

  const update = () => {
    translate()
    onDown()
  }

  return { update, resized, draw, params }
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
let raf = 0
let isRunning = false
let onResize: (() => void) | null = null
const snowflakes: SnowItemInstance[] = []

const update = () => {
  for (const el of snowflakes) el.update()
}

const draw = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const { width, height } = getSafeSize(canvas)
  ctx.clearRect(0, 0, width, height)
  for (const el of snowflakes) el.draw()
}

const resize = () => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  // 尺寸大于 0 时才更新画布物理尺寸，防止被后台 0 覆盖
  if (canvas.offsetWidth > 0 && canvas.offsetHeight > 0) {
    ctx.canvas.width = canvas.offsetWidth
    ctx.canvas.height = canvas.offsetHeight
    for (const el of snowflakes) el.resized()
  }
}

const loop = () => {
  if (!isRunning) return
  if (canvasRef.value && canvasRef.value.offsetWidth > 0) {
    draw()
    update()
  }
  raf = requestAnimationFrame(loop)
}

const startAnimation = () => {
  if (isRunning) return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  isRunning = true
  loop()
}

const stopAnimation = () => {
  isRunning = false
  cancelAnimationFrame(raf)
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return

  // 初始化 65 颗雪花
  snowflakes.length = 0
  for (let i = 0; i < 65; i++) {
    snowflakes.push(createSnowItem(canvas))
  }

  onResize = resize
  window.addEventListener('resize', resize)
  resize()
  startAnimation()
})

// Keep-Alive 激活：切回此页面时唤醒并校验散布
onActivated(() => {
  resize()
  const canvas = canvasRef.value
  if (canvas) {
    const { width, height } = getSafeSize(canvas)
    for (const item of snowflakes) {
      if (item.params.x < 10) {
        item.params.x = rand(0, width)
        item.params.y = rand(0, height)
      }
    }
  }
  startAnimation()
})

// Keep-Alive 离开：切到其他页面时停止动画，防止后台空转把坐标全累加到左上角
onDeactivated(() => {
  stopAnimation()
})

onBeforeUnmount(() => {
  stopAnimation()
  if (onResize) window.removeEventListener('resize', onResize)
  onResize = null
})
</script>

<style scoped lang="scss">
$secondary-color: #ffe221;
$tertiary-color: #ffffff;

.container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  background: transparent;
  margin: 0;
  padding: 0;
}

.snow-canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

/* ===== 三行逐行动画 ===== */
h1 {
  position: relative;
  z-index: 1;
  font-size: 75px;
  margin: 10px 0 0;
  padding: 0;
  text-align: center;
  font-family: 'YouSheBiaoTiHei', '优设标题黑', sans-serif;
  font-weight: normal;

  span {
    display: block;
    width: 100%;
    color: $tertiary-color;
    -webkit-clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 80%);
    clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 80%);
    transform: translateY(-50px);
    opacity: 0;
    animation-timing-function: ease;
    animation-duration: 8s;
    animation-iteration-count: infinite;
    animation-fill-mode: forwards;

    &:last-child {
      color: $secondary-color;
    }
  }
}

h1 span:nth-child(1) { animation-name: w1; }
h1 span:nth-child(2) { animation-name: w2; }
h1 span:nth-child(3) { animation-name: w3; }

/* ===== 装饰动画：光速飞船 ===== */
.hero-loader {
  position: relative;
  z-index: 1;
  margin-top: 44px;
  width: 300px;
  height: 90px;
}

.speeder {
  position: absolute;
  top: 50%;
  left: 50%;
  margin-left: -50px;
  animation: speeder 0.4s linear infinite;
}

/* 尾部小柄 */
.speeder > span {
  height: 5px;
  width: 35px;
  background: rgba(255, 255, 255, 0.85);
  position: absolute;
  top: -19px;
  left: 60px;
  border-radius: 2px 10px 1px 0;
}

/* 主体：喷射三角 + 圆头 + 尾翼 */
.base span {
  position: absolute;
  width: 0;
  height: 0;
  border-top: 6px solid transparent;
  border-right: 100px solid #ffffff;
  border-bottom: 6px solid transparent;
  filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.5));
}
.base span:before {
  content: "";
  height: 22px;
  width: 22px;
  border-radius: 50%;
  background: #ffffff;
  position: absolute;
  right: -110px;
  top: -16px;
}
.base span:after {
  content: "";
  position: absolute;
  width: 0;
  height: 0;
  border-top: 0 solid transparent;
  border-right: 55px solid #ffffff;
  border-bottom: 16px solid transparent;
  top: -16px;
  right: -98px;
}

/* 机头 */
.face {
  position: absolute;
  height: 12px;
  width: 20px;
  background: #ffffff;
  border-radius: 20px 20px 0 0;
  transform: rotate(-40deg);
  right: -125px;
  top: -15px;
}
.face:after {
  content: "";
  height: 12px;
  width: 12px;
  background: #ffffff;
  right: 4px;
  top: 7px;
  position: absolute;
  transform: rotate(40deg);
  transform-origin: 50% 50%;
  border-radius: 0 0 0 2px;
}

/* 尾部短光条 */
.speeder > span > span:nth-child(1),
.speeder > span > span:nth-child(2),
.speeder > span > span:nth-child(3),
.speeder > span > span:nth-child(4) {
  width: 30px;
  height: 1px;
  background: rgba(255, 255, 255, 0.85);
  position: absolute;
  animation: fazer1 0.2s linear infinite;
}
.speeder > span > span:nth-child(2) { top: 3px; animation: fazer2 0.4s linear infinite; }
.speeder > span > span:nth-child(3) { top: 1px; animation: fazer3 0.4s linear infinite; animation-delay: -1s; }
.speeder > span > span:nth-child(4) { top: 4px; animation: fazer4 1s linear infinite; animation-delay: -1s; }

/* 长速度线 */
.longfazers {
  position: absolute;
  width: 100%;
  height: 100%;
}
.longfazers span {
  position: absolute;
  height: 2px;
  width: 20%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.85));
}
.longfazers span:nth-child(1) { top: 20%; animation: lf 0.6s linear infinite; animation-delay: -5s; }
.longfazers span:nth-child(2) { top: 40%; animation: lf2 0.8s linear infinite; animation-delay: -1s; }
.longfazers span:nth-child(3) { top: 60%; animation: lf3 0.6s linear infinite; }
.longfazers span:nth-child(4) { top: 80%; animation: lf4 0.5s linear infinite; animation-delay: -3s; }

@keyframes speeder {
  0%   { transform: translate(2px, 1px) rotate(0deg); }
  10%  { transform: translate(-1px, -3px) rotate(-1deg); }
  20%  { transform: translate(-2px, 0px) rotate(1deg); }
  30%  { transform: translate(1px, 2px) rotate(0deg); }
  40%  { transform: translate(1px, -1px) rotate(1deg); }
  50%  { transform: translate(-1px, 3px) rotate(-1deg); }
  60%  { transform: translate(-1px, 1px) rotate(0deg); }
  70%  { transform: translate(3px, 1px) rotate(-1deg); }
  80%  { transform: translate(-2px, -1px) rotate(1deg); }
  90%  { transform: translate(2px, 1px) rotate(0deg); }
  100% { transform: translate(1px, -2px) rotate(-1deg); }
}
@keyframes fazer1 { 0% { left: 0; } 100% { left: -80px; opacity: 0; } }
@keyframes fazer2 { 0% { left: 0; } 100% { left: -100px; opacity: 0; } }
@keyframes fazer3 { 0% { left: 0; } 100% { left: -50px; opacity: 0; } }
@keyframes fazer4 { 0% { left: 0; } 100% { left: -150px; opacity: 0; } }
@keyframes lf  { 0% { left: 200%; } 100% { left: -200%; opacity: 0; } }
@keyframes lf2 { 0% { left: 200%; } 100% { left: -200%; opacity: 0; } }
@keyframes lf3 { 0% { left: 200%; } 100% { left: -100%; opacity: 0; } }
@keyframes lf4 { 0% { left: 200%; } 100% { left: -100%; opacity: 0; } }

/* 逐行动画关键帧 */
@keyframes w1 {
  0%        { transform: translateY(-50px); opacity: 0; clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 80%); }
  10%       { transform: translateY(0); opacity: 1; clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 15%); }
  59%       { transform: translateY(0); opacity: 1; clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 15%); }
  71%, 100% { transform: translateY(50px); opacity: 0; clip-path: polygon(100% 0, 100% -0%, 0 100%, 0 100%); }
}
@keyframes w2 {
  0%, 8%    { transform: translateY(-50px); opacity: 0; clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 80%); }
  18%       { transform: translateY(0); opacity: 1; clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 15%); }
  59%       { transform: translateY(0); opacity: 1; clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 15%); }
  71%, 100% { transform: translateY(50px); opacity: 0; clip-path: polygon(100% 0, 100% -0%, 0 100%, 0 100%); }
}
@keyframes w3 {
  0%, 16%   { transform: translateY(-50px); opacity: 0; clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 80%); }
  26%       { transform: translateY(0); opacity: 1; clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 15%); }
  59%       { transform: translateY(0); opacity: 1; clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 15%); }
  71%, 100% { transform: translateY(50px); opacity: 0; clip-path: polygon(100% 0, 100% -0%, 0 100%, 0 100%); }
}

@media (prefers-reduced-motion: reduce) {
  h1 span {
    animation: none !important;
    transform: none;
    opacity: 1;
    clip-path: none;
  }
  .snow-canvas {
    display: none;
  }
  .speeder,
  .speeder > span > span,
  .longfazers span {
    animation: none !important;
  }
}

@media (max-width: 768px) {
  h1 {
    font-size: 40px;
    margin-top: 20px;
  }
  .hero-loader {
    margin-top: 32px;
    transform: scale(0.75);
    transform-origin: top center;
  }
}
</style>