<template>
  <div class="weather-card-wrapper" ref="wrapperRef">
    <!-- 1. 底层背光层：带静态遮罩，左侧被相邻组件挡住，向右、上、下自然漫射 -->
    <svg id="weather-back" class="svg-layer back-layer" ref="backSvgRef">
      <defs>
        <!-- 放射光晕渐变 -->
        <radialGradient id="SVGID_1_" cx="0" cy="0" r="320.8304" gradientUnits="userSpaceOnUse">
          <stop offset="0" style="stop-color:#FFDE17;stop-opacity:0.85" />
          <stop offset="0.55" style="stop-color:#FFF200;stop-opacity:0.3" />
          <stop offset="1" style="stop-color:#FFF200;stop-opacity:0" />
        </radialGradient>

        <!-- 关键：静态遮罩层，x="-20" 正好对应相册右边缘，物理阻挡左侧多余辉光 -->
        <clipPath id="glow-block-clip">
          <rect x="-20" y="-600" width="3000" height="2000" />
        </clipPath>
      </defs>
    </svg>

    <!-- 2. 核心卡片层：带有圆角与裁切 -->
    <div class="weather-card" :data-type="weatherType" ref="cardRef">
      <!-- 详情层：温度、描述、日期与地区切换 -->
      <div class="details">
        <div class="left">
          <div class="temp" ref="tempRef">{{ temp }}<span>°C</span></div>
          <div class="desc" ref="descRef">{{ weatherDesc }}</div>
        </div>
        <div class="right">
          <div class="date">{{ formattedDate }}</div>
          <div class="address-box">
            <span class="address">{{ currentAddress }}</span>
            <span class="change-btn" @click.stop="changeaddress" title="切换地区">
              <svg ref="changeIconRef" xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
                <path d="M0 0h24v24H0z" fill="none" />
                <path fill="currentColor"
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10s10-4.48 10-10S17.52 2 12 2m.91 16.15a.5.5 0 0 1-.85-.35V17H12c-1.28 0-2.56-.49-3.54-1.46a5 5 0 0 1-1.14-5.3c.19-.51.86-.64 1.24-.25c.22.22.27.54.17.82c-.46 1.24-.2 2.68.8 3.68c.7.7 1.62 1.03 2.54 1.01v-.94c0-.45.54-.67.85-.35l1.62 1.62c.2.2.2.51 0 .71zm2.53-4.13a.78.78 0 0 1-.17-.82c.46-1.24.2-2.68-.8-3.68c-.7-.7-1.62-1.04-2.53-1.02v.94c0 .45-.54.67-.85.35L9.46 8.18c-.2-.2-.2-.51 0-.71l1.62-1.62a.5.5 0 0 1 .85.35v.81c1.3-.02 2.61.45 3.6 1.45a5 5 0 0 1 1.14 5.3c-.19.52-.85.65-1.23.26" />
              </svg>
            </span>
          </div>
        </div>
      </div>

      <!-- 卡片内部 SVG -->
      <svg id="weather-inner" class="svg-layer inner-layer" ref="innerSvgRef">
        <defs>
          <path id="leaf-path"
            d="M41.9,56.3l0.1-2.5c0,0,4.6-1.2,5.6-2.2c1-1,3.6-13,12-15.6c9.7-3.1,19.9-2,26.1-2.1c2.7,0-10,23.9-20.5,25c-7.5,0.8-17.2-5.1-17.2-5.1L41.9,56.3z" />
        </defs>
      </svg>
    </div>

    <!-- 3. 表层破框层：大号落叶一路穿行并飞出屏幕极右侧 -->
    <svg id="weather-outer" class="svg-layer outer-layer" ref="outerSvgRef"></svg>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import Snap from 'snapsvg-cjs'
import { gsap } from 'gsap'

const props = withDefaults(defineProps<{
  address?: string
}>(), {
  address: '武汉'
})

// --- DOM 引用 ---
const wrapperRef = ref<HTMLElement | null>(null)
const cardRef = ref<HTMLElement | null>(null)
const innerSvgRef = ref<SVGElement | null>(null)
const backSvgRef = ref<SVGElement | null>(null)
const outerSvgRef = ref<SVGElement | null>(null)
const descRef = ref<HTMLElement | null>(null)
const tempRef = ref<HTMLElement | null>(null)
const changeIconRef = ref<SVGElement | null>(null)

// --- 数据变量 ---
const temp = ref('--')
const weatherDesc = ref('加载中...')
const formattedDate = ref('')
const weatherType = ref('sun')

// 地区列表与索引配置
const addresslist = [
  { name: '武汉', lat: 30.508522, lon: 114.332928 },
  { name: '千灯', lat: 32.32, lon: 120.87 },
  { name: '樟树', lat: 27.4907, lon: 115.42 },
]

const initialIdx = addresslist.findIndex(item => item.name === props.address)
const addressindex = ref(initialIdx !== -1 ? initialIdx : 0)
const currentAddress = ref(addresslist[addressindex.value]?.name ?? '武汉')

// --- 尺寸信息 ---
let cardWidth = 320
let cardHeight = 280

// --- Snap.svg 实例与分层 ---
let innerSVG: Snap.Paper = null!
let backSVG: Snap.Paper = null!
let outerSVG: Snap.Paper = null!

let weatherContainer3: Snap.Paper = null! // 远景雨
let cloud3Group: Snap.Paper = null!
let weatherContainer2: Snap.Paper = null! // 中景雨
let cloud2Group: Snap.Paper = null!
let weatherContainer1: Snap.Paper = null! // 近景雨、雪、小落叶、闪电
let cloud1Group: Snap.Paper = null!

let innerRainHolder1: Snap.Paper = null!
let innerRainHolder2: Snap.Paper = null!
let innerRainHolder3: Snap.Paper = null!
let innerSnowHolder: Snap.Paper = null!
let innerLeafHolder: Snap.Paper = null!
let innerLightningHolder: Snap.Paper = null!

// 外部破框层
let outerLeafHolder: Snap.Paper = null!
let outerSplashHolder: Snap.Paper = null!

let sun: Snap.Element = null!
let sunburst: Snap.Element = null!
let sunburstGroup: Snap.Paper = null!

// --- 动画状态与粒子池 ---
let clouds: any[] = []
let rain: any[] = []
let leafs: any[] = []
let snow: any[] = []
let lightningTimeout: ReturnType<typeof setTimeout> | null = null
let currentWeather: { type: string } = { type: 'sun' }
let tickId: number = 0
let tickCount = 0
let fetchRequestId = 0

// 物理模拟参数
const settings = {
  windSpeed: 2,
  rainCount: 0,
  leafCount: 0,
  snowCount: 0,
  cloudHeight: 85,
  cloudSpace: 24,
  cloudArch: 40,
  renewCheck: 10,
  splashBounce: 80
}

const weatherNames: Record<string, string> = {
  snow: 'Snow',
  wind: 'Windy',
  rain: 'Rain',
  thunder: 'Storms',
  sun: 'Sunny'
}

const CACHE_TTL = 30 * 60 * 1000

function currentCacheKey(): string {
  const loc = addresslist[addressindex.value]
  return `cyber_weather_${loc?.lat ?? 0}_${loc?.lon ?? 0}`
}

function loadWeatherFromCache(): boolean {
  try {
    const raw = localStorage.getItem(currentCacheKey())
    if (!raw) return false
    const cached = JSON.parse(raw)
    if (!cached || typeof cached.fetchedAt !== 'number') return false
    if (Date.now() - cached.fetchedAt > CACHE_TTL) return false

    currentAddress.value = addresslist[addressindex.value]?.name ?? '武汉'
    updateWithTextTransition(cached.desc ?? 'Unknown', cached.temp ?? '--')
    formattedDate.value = cached.date ?? ''
    changeWeather(cached.type ?? 'sun')
    return true
  } catch {
    return false
  }
}

function saveWeatherToCache(): void {
  try {
    localStorage.setItem(currentCacheKey(), JSON.stringify({
      fetchedAt: Date.now(),
      temp: temp.value,
      desc: weatherDesc.value,
      type: weatherType.value,
      date: formattedDate.value,
    }))
  } catch { /* 忽略 */ }
}

// ── 文本转场动画 ──
function updateWithTextTransition(newDesc: string = 'Unknown', newTemp: string = '--') {
  const safeDesc = newDesc || 'Unknown'

  if (descRef.value) {
    gsap.to(descRef.value, {
      opacity: 0,
      x: -20,
      duration: 0.3,
      ease: 'power2.in',
      onComplete: () => {
        weatherDesc.value = safeDesc
        gsap.fromTo(descRef.value, { opacity: 0, x: 20 }, { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' })
      }
    })
  } else {
    weatherDesc.value = safeDesc
  }

  if (tempRef.value) {
    gsap.to(tempRef.value, {
      opacity: 0.3,
      scale: 0.94,
      duration: 0.25,
      onComplete: () => {
        temp.value = newTemp
        gsap.to(tempRef.value, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(1.4)' })
      }
    })
  } else {
    temp.value = newTemp
  }
}

// ── 获取真实天气 ──
async function fetchWeather() {
  const currentReqId = ++fetchRequestId
  if (loadWeatherFromCache()) return

  const loc = addresslist[addressindex.value]
  try {
    const url = `https://wttr.in/${loc?.lat},${loc?.lon}?format=j1`
    const res = await fetch(url)
    if (!res.ok) throw new Error('请求失败')
    const data = await res.json()

    if (currentReqId !== fetchRequestId) return

    const current = data.current_condition[0]
    const fetchedTemp = String(Math.round(parseFloat(current.temp_C)))
    const descEn = current.weatherDesc[0].value

    let type = 'wind'
    if (descEn.includes('Sunny') || descEn.includes('Clear')) type = 'sun'
    else if (descEn.includes('Rain')) type = 'rain'
    else if (descEn.includes('Snow')) type = 'snow'
    else if (descEn.includes('Thunder') || descEn.includes('Storm')) type = 'thunder'

    const nowText = weatherNames[type] ?? 'Unknown'
    updateWithTextTransition(nowText, fetchedTemp)

    const nowDate = new Date()
    formattedDate.value = nowDate.toLocaleDateString('en-US', {
      weekday: 'long', day: 'numeric', month: 'long'
    })

    changeWeather(type)
    saveWeatherToCache()
  } catch (err) {
    if (currentReqId !== fetchRequestId) return
    console.error('获取天气失败', err)
    updateWithTextTransition('Sunny', '24')
    changeWeather('sun')
  }
}

// ── 地区切换事件 ──
function changeaddress() {
  if (changeIconRef.value) {
    gsap.to(changeIconRef.value, {
      rotation: '+=360',
      duration: 0.6,
      ease: 'power2.out',
      transformOrigin: '50% 50%',
    })
  }

  addressindex.value = (addressindex.value + 1) % addresslist.length
  currentAddress.value = addresslist[addressindex.value]?.name ?? '武汉'

  temp.value = '--'
  weatherDesc.value = '加载中...'
  fetchWeather()
}

// ── 初始化 SVG 结构 ──
function initSVG() {
  if (!innerSvgRef.value || !cardRef.value || !backSvgRef.value || !outerSvgRef.value) return

  cardWidth = cardRef.value.clientWidth || 320
  cardHeight = cardRef.value.clientHeight || 280

  innerSVG = Snap(innerSvgRef.value)
  backSVG = Snap(backSvgRef.value)
  outerSVG = Snap(outerSvgRef.value)

  // 1. 底层背光层：使用静态遮罩组承载，确保自转时不影响遮挡边界
  sunburstGroup = backSVG.group().attr({
    clipPath: 'url(#glow-block-clip)'
  })

  const sunburstPathData = "M0,319.7c-18.6,0-37.3-1.6-55.5-4.8L-7.8,41.4c5.1,0.9,10.6,0.9,15.7,0L56,314.8C37.6,318,18.8,319.7,0,319.7z M-160.8,276.6c-32.5-18.8-61.3-42.9-85.5-71.6L-34,26.2c3.4,4.1,7.4,7.4,12,10.1L-160.8,276.6z M161.3,276.4L22.1,36.2 c4.5-2.6,8.6-6,12-10.1l212.6,178.5C222.5,233.4,193.8,257.6,161.3,276.4z M-302.5,108.3C-315.4,73-321.9,36-322-1.8l277.6-0.5 c0,5.3,0.9,10.4,2.7,15.2L-302.5,108.3z M302.6,107.8L41.8,12.8c1.7-4.7,2.6-9.7,2.6-14.9c0-0.3,0-0.6,0-1H322l0-1.3l0,1.9 C322,35.4,315.5,72.5,302.6,107.8z M-41.8-17.5l-261-94.5c12.8-35.4,31.6-68,55.8-96.9L-34.1-30.8C-37.5-26.8-40.1-22.3-41.8-17.5z M41.7-17.7c-1.8-4.8-4.4-9.3-7.8-13.3l212-179.2c24.3,28.8,43.3,61.3,56.3,96.6L41.7-17.7z M-22.2-40.8l-139.6-240 c32.7-19,68.1-32,105.2-38.6L-8-46.1C-13-45.2-17.8-43.4-22.2-40.8z M22-40.9c-4.4-2.6-9.2-4.3-14.2-5.1l47.1-273.6 c37.2,6.4,72.7,19.2,105.4,38L22-40.9z"
  sunburst = sunburstGroup.path(sunburstPathData).attr({
    fill: 'url(#SVGID_1_)',
    opacity: 0
  })

  // 2. 内部层级（严格遵循 3D 纵深遮挡）
  sun = innerSVG.circle(0, 0, 46).attr({ fill: '#F7ED47' })

  weatherContainer3 = innerSVG.group() // 远景雨
  cloud3Group = innerSVG.group()
  weatherContainer2 = innerSVG.group() // 中景雨
  cloud2Group = innerSVG.group()
  weatherContainer1 = innerSVG.group() // 近景雨、雪、小落叶、闪电
  cloud1Group = innerSVG.group()

  innerRainHolder3 = weatherContainer3.group()
  innerRainHolder2 = weatherContainer2.group()
  innerRainHolder1 = weatherContainer1.group()
  innerSnowHolder = weatherContainer1.group()
  innerLeafHolder = weatherContainer1.group()
  innerLightningHolder = weatherContainer1.group()

  // 3. 外部破框层：大落叶与外溢水花
  outerLeafHolder = outerSVG.group()
  outerSplashHolder = outerSVG.group()

  // 4. 构建三层云朵
  clouds = [
    { group: cloud1Group, offset: Math.random() * cardWidth },
    { group: cloud2Group, offset: Math.random() * cardWidth },
    { group: cloud3Group, offset: Math.random() * cardWidth }
  ]
  for (let i = 0; i < clouds.length; i++) drawCloud(clouds[i], i)

  // 5. 太阳与辉光中心严格锁定
  const centerX = cardWidth / 2
  const centerY = cardHeight / 2

  gsap.set(sun.node, { x: centerX, y: -100 })

  // 辉光置于卡片正中心，以自身的 50% 50% 原地自旋
  gsap.set(sunburst.node, {
    transformOrigin: "50% 50%",
    x: centerX,
    y: centerY,
    scale: 0.35,
    opacity: 0
  })

  gsap.to(sunburst.node, {
    rotation: 360,
    duration: 25,
    repeat: -1,
    ease: 'none',
    transformOrigin: "50% 50%"
  })
}

// ── 原版云朵算法：双拱贝塞尔曲线闭合 ──
function drawCloud(cloud: any, i: number) {
  const space = settings.cloudSpace * i
  const height = space + settings.cloudHeight
  const arch = height + settings.cloudArch + (Math.random() * settings.cloudArch)
  const width = cardWidth

  const points = [
    'M' + [-(width), 0].join(','),
    [width, 0].join(','),
    'Q' + [width * 2, height / 2].join(','),
    [width, height].join(','),
    'Q' + [width * 0.5, arch].join(','),
    [0, height].join(','),
    'Q' + [width * -0.5, arch].join(','),
    [-width, height].join(','),
    'Q' + [-(width * 2), height / 2].join(','),
    [-(width), 0].join(',')
  ]

  if (!cloud.path) cloud.path = cloud.group.path()
  cloud.path.attr({
    d: points.join(' '),
    fill: ['#efefef', '#E6E6E6', '#D5D5D5'][i] ?? '#efefef'
  })
}

// ── 原版高阶雨滴：3 层纵深与物理速度 ──
function makeRain() {
  const lineWidth = Math.random() * 3
  const isThunder = currentWeather.type === 'thunder'
  const lineLength = isThunder ? 36 : 14
  const x = Math.random() * (cardWidth - 40) + 20

  const layerIdx = 3 - Math.floor(lineWidth)
  const holders = [innerRainHolder1, innerRainHolder2, innerRainHolder3]
  const holder = holders[layerIdx - 1] || innerRainHolder1

  const strokeColors = isThunder
    ? ['#555555', '#6b6e76', '#8a8d96']
    : ['#3b68ff', '#527cff', '#7094ff']

  const line = holder.path(`M0,0 0,${lineLength}`).attr({
    fill: 'none',
    stroke: strokeColors[layerIdx - 1] ?? '#3b68ff',
    strokeWidth: Math.max(1, lineWidth),
    strokeLinecap: 'round',
    opacity: [1, 0.8, 0.5][layerIdx - 1] ?? 0.8
  })

  rain.push(line)
  const duration = isThunder ? 0.65 : 0.95

  gsap.fromTo(line.node,
    { x, y: -lineLength },
    {
      delay: Math.random() * 0.35,
      y: cardHeight,
      duration,
      ease: 'power2.in',
      onComplete: () => {
        gsap.killTweensOf(line.node)
        line.remove()
        rain = rain.filter(r => r.paper)
        if (lineWidth > 2 && (currentWeather.type === 'rain' || currentWeather.type === 'thunder')) {
          makeSplash(x, currentWeather.type)
        }
      }
    }
  )
}

// ── 外部溅射水花 ──
function makeSplash(x: number, type: string) {
  if (!outerSplashHolder) return
  const isThunder = type === 'thunder'
  const splashLength = isThunder ? 28 : 18
  const splashBounce = isThunder ? 110 : 85
  const splashDistance = 65
  const speed = isThunder ? 0.65 : 0.48
  const splashUp = 0 - (Math.random() * splashBounce)
  const randomX = ((Math.random() * splashDistance) - (splashDistance / 2))

  const points = [
    'M0,0',
    `Q${randomX},${splashUp}`,
    `${randomX * 2},${splashDistance}`
  ]

  const splash = outerSplashHolder.path(points.join(' ')).attr({
    fill: 'none',
    stroke: isThunder ? '#777777' : '#3b68ff',
    strokeWidth: 1.5,
    strokeLinecap: 'round'
  })

  const pathLength = Snap.path.getTotalLength(splash as any)
  splash.node.style.strokeDasharray = `${splashLength} ${pathLength}`
  const groundY = cardHeight - 2

  gsap.fromTo(splash.node,
    { strokeWidth: 2, y: groundY, x, opacity: 1, strokeDashoffset: splashLength },
    {
      strokeWidth: 0.2,
      strokeDashoffset: -pathLength,
      opacity: 0.8,
      duration: speed,
      ease: 'power1.out',
      onComplete: () => {
        gsap.killTweensOf(splash.node)
        splash.remove()
      }
    }
  )
}

// ── 原版雪花：重力分级与正弦晃动 ──
function makeSnow() {
  const scale = 0.4 + (Math.random() * 0.6)
  const x = 15 + Math.random() * (cardWidth - 30)
  const y = -10
  const endY = cardHeight + 15
  const flakeDuration = 3.5 + (1 - scale) * 4.5

  const flake = innerSnowHolder.circle(0, 0, 5).attr({
    fill: '#ffffff',
    opacity: 0.4 + scale * 0.55
  })
  snow.push(flake)

  gsap.fromTo(flake.node,
    { x, y, scale: 0 },
    {
      y: endY,
      scale,
      duration: flakeDuration,
      ease: 'none',
      onComplete: () => {
        gsap.killTweensOf(flake.node)
        flake.remove()
        snow = snow.filter(s => s.paper)
      }
    }
  )

  const wobble = 25 + Math.random() * 45
  gsap.to(flake.node, {
    x: x + (Math.random() > 0.5 ? wobble : -wobble),
    duration: 1.8 + Math.random() * 1.6,
    repeat: -1,
    yoyo: true,
    ease: 'sine.inOut'
  })
}

// ── 核心突破：大号落叶破框一路飞到屏幕极右侧 ──
function makeLeaf() {
  const scale = 0.5 + Math.random() * 0.5
  const isLargeOuterLeaf = scale > 0.72

  const areaY = cardHeight / 2
  const y = areaY + (Math.random() * areaY * 0.8)
  const colors = ['#76993E', '#4A5E23', '#6D632F', '#8CA83B']
  const color = colors[Math.floor(Math.random() * colors.length)] ?? '#76993E'

  const targetHolder = isLargeOuterLeaf ? outerLeafHolder : innerLeafHolder
  const newLeaf = (innerSVG.use('leaf-path') as Snap.Element).appendTo(targetHolder).attr({
    fill: color,
    opacity: isLargeOuterLeaf ? 0.95 : 0.85
  })
  leafs.push(newLeaf)

  // 计算距离浏览器屏幕极右侧的真实像素距离
  const cardRect = cardRef.value?.getBoundingClientRect()
  const cardLeft = cardRect ? cardRect.left : 0
  const screenWidth = typeof window !== 'undefined' ? window.innerWidth : 1920
  // 超出屏幕右边 120px 彻底离开视口
  const distToScreenRight = Math.max(cardWidth + 300, screenWidth - cardLeft + 120)

  const startX = isLargeOuterLeaf ? -30 : -70
  const endX = isLargeOuterLeaf ? distToScreenRight : (cardWidth + 50)
  
  // 贝塞尔波浪曲线计算：飞跃卡片时向上被风托起，飞出卡片后呈自然重力缓缓沉降
  const midX = isLargeOuterLeaf ? (cardWidth * 0.9 + Math.random() * 80) : (cardWidth * 0.45 + (Math.random() * 60 - 30))
  const midY = y - 40 - Math.random() * 45
  const endY = y + 50 + Math.random() * 80

  const duration = isLargeOuterLeaf ? (3.2 + Math.random() * 0.8) : (2.2 + Math.random() * 0.5)
  const startRot = Math.random() * 180
  const rotDelta = isLargeOuterLeaf ? (460 + Math.random() * 320) : (280 + Math.random() * 200)

  gsap.fromTo(newLeaf.node,
    { x: startX, y, rotation: startRot, scale: scale * 0.7 },
    {
      scale,
      rotation: startRot + rotDelta,
      duration,
      ease: 'none',
      keyframes: [
        { x: midX, y: midY, ease: 'sine.out', duration: duration * 0.38 },
        { x: endX, y: endY, ease: 'sine.in', duration: duration * 0.62 }
      ],
      onComplete: () => {
        gsap.killTweensOf(newLeaf.node)
        newLeaf.remove()
        leafs = leafs.filter(l => l.paper)
      }
    }
  )
}

// ── 原版雷暴：卡片震动 + 闪屏 + 折线电弧 ──
function startLightningTimer() {
  if (lightningTimeout) {
    clearTimeout(lightningTimeout)
    lightningTimeout = null
  }
  if (currentWeather.type === 'thunder') {
    lightningTimeout = setTimeout(lightning, 2000 + Math.random() * 4500)
  }
}

function lightning() {
  if (currentWeather.type !== 'thunder') return
  startLightningTimer()

  if (cardRef.value) {
    gsap.fromTo(cardRef.value,
      { y: -18 },
      { y: 0, duration: 0.7, ease: 'elastic.out(1.2, 0.3)' }
    )
  }

  const flash = innerSVG.rect(0, 0, cardWidth, cardHeight).attr({
    fill: '#ffffff',
    opacity: 0.45
  })
  gsap.to(flash.node, {
    opacity: 0,
    duration: 0.35,
    ease: 'power2.out',
    onComplete: () => flash.remove()
  })

  const pathX = 35 + Math.random() * (cardWidth - 70)
  const steps = 22
  const points = [`${pathX},0`]
  let currentX = pathX
  for (let i = 0; i < steps; i++) {
    currentX += (Math.random() * 24 - 12)
    const y = (cardHeight / steps) * (i + 1)
    points.push(`${currentX},${y}`)
  }

  const strike = innerLightningHolder.path('M' + points.join(' ')).attr({
    fill: 'none',
    stroke: '#ffffff',
    strokeWidth: 2.2 + Math.random() * 1.5,
    strokeLinecap: 'round',
    strokeLinejoin: 'round'
  })

  gsap.to(strike.node, {
    opacity: 0,
    duration: 0.8,
    ease: 'power3.out',
    onComplete: () => {
      gsap.killTweensOf(strike.node)
      strike.remove()
    }
  })
}

// ── 粒子与补间清理 ──
function cleanUpParticles(newType: string) {
  if (newType !== 'rain' && newType !== 'thunder') {
    rain.forEach(r => { if (r?.node) gsap.killTweensOf(r.node); r?.remove?.() })
    rain = []
    if (innerRainHolder1) innerRainHolder1.clear()
    if (innerRainHolder2) innerRainHolder2.clear()
    if (innerRainHolder3) innerRainHolder3.clear()
    if (outerSplashHolder) outerSplashHolder.clear()
    settings.rainCount = 0
  }

  if (newType !== 'wind') {
    leafs.forEach(l => { if (l?.node) gsap.killTweensOf(l.node); l?.remove?.() })
    leafs = []
    if (innerLeafHolder) innerLeafHolder.clear()
    if (outerLeafHolder) outerLeafHolder.clear()
    settings.leafCount = 0
  }

  if (newType !== 'snow') {
    snow.forEach(s => { if (s?.node) gsap.killTweensOf(s.node); s?.remove?.() })
    snow = []
    if (innerSnowHolder) innerSnowHolder.clear()
    settings.snowCount = 0
  }

  if (newType !== 'thunder') {
    if (lightningTimeout) {
      clearTimeout(lightningTimeout)
      lightningTimeout = null
    }
    if (innerLightningHolder) innerLightningHolder.clear()
    if (cardRef.value) {
      gsap.killTweensOf(cardRef.value)
      gsap.set(cardRef.value, { y: 0 })
    }
  }
}

// ── Tick 动画循环 ──
function tick() {
  tickCount++
  if (tickCount % settings.renewCheck === 0) {
    if (rain.length < settings.rainCount) makeRain()
    if (leafs.length < settings.leafCount) makeLeaf()
    if (snow.length < settings.snowCount) makeSnow()
  }

  for (let i = 0; i < clouds.length; i++) {
    if (currentWeather.type === 'sun') {
      if (clouds[i].offset > -(cardWidth * 1.5)) clouds[i].offset += settings.windSpeed / (i + 1)
      if (clouds[i].offset > cardWidth * 2.5) clouds[i].offset = -(cardWidth * 1.5)
      clouds[i].group.transform(`t${clouds[i].offset},0`)
    } else {
      clouds[i].offset += settings.windSpeed / (i + 1)
      if (clouds[i].offset > cardWidth) clouds[i].offset = 0 + (clouds[i].offset - cardWidth)
      clouds[i].group.transform(`t${clouds[i].offset},0`)
    }
  }

  tickId = requestAnimationFrame(tick)
}

// ── 天气切换控制 ──
function changeWeather(type: string) {
  currentWeather = { type }
  weatherType.value = type

  cleanUpParticles(type)

  const isThunder = type === 'thunder'
  const cloudFills = isThunder ? ['#9FA4AD', '#8B8E98', '#7B7988'] : ['#efefef', '#E6E6E6', '#D5D5D5']
  clouds.forEach((c, i) => {
    if (c.path) gsap.to(c.path.node, { attr: { fill: cloudFills[i] as string }, duration: 1.6 })
  })

  gsap.killTweensOf(settings)
  let targetWindSpeed = 2

  switch (type) {
    case 'wind':
      targetWindSpeed = 3.2
      settings.leafCount = 5
      break
    case 'sun':
      targetWindSpeed = 20
      break
    case 'rain':
      targetWindSpeed = 0.6
      settings.rainCount = 12
      break
    case 'thunder':
      targetWindSpeed = 0.5
      settings.rainCount = 65
      break
    case 'snow':
      targetWindSpeed = 0.5
      settings.snowCount = 40
      break
  }

  gsap.to(settings, { windSpeed: targetWindSpeed, duration: 2, ease: 'power2.inOut' })

  // 辉光只控制 scale 与 opacity，绝对不改动 x, y，确保原地漫射自旋
  if (type === 'sun') {
    gsap.to(sun.node, { x: cardWidth / 2, y: cardHeight / 2, duration: 2.2, ease: 'power2.inOut' })
    gsap.to(sunburst.node, { scale: 0.85, opacity: 0.85, duration: 2.2, ease: 'power2.inOut' })
  } else {
    gsap.to(sun.node, { x: cardWidth / 2, y: -100, duration: 1.6, ease: 'power2.inOut' })
    gsap.to(sunburst.node, { scale: 0.35, opacity: 0, duration: 1.6, ease: 'power2.inOut' })
  }

  startLightningTimer()
}

// 监听父组件传入的 address 改变
watch(() => props.address, (newAddr) => {
  if (!newAddr) return
  const idx = addresslist.findIndex(item => item.name === newAddr)
  if (idx !== -1 && idx !== addressindex.value) {
    addressindex.value = idx
    currentAddress.value = addresslist[idx]?.name ?? newAddr
    fetchWeather()
  }
})

// ── 生命周期 ──
onMounted(async () => {
  await nextTick()
  initSVG()
  tickId = requestAnimationFrame(tick)
  await fetchWeather()
})

onUnmounted(() => {
  cancelAnimationFrame(tickId)
  cleanUpParticles('none')
  if (cardRef.value) gsap.killTweensOf(cardRef.value)
  if (sun?.node) gsap.killTweensOf(sun.node)
  if (sunburst?.node) gsap.killTweensOf(sunburst.node)
  if (descRef.value) gsap.killTweensOf(descRef.value)
  if (tempRef.value) gsap.killTweensOf(tempRef.value)
  if (changeIconRef.value) gsap.killTweensOf(changeIconRef.value)
})
</script>

<style scoped>
/* 整个卡片外层包裹容器：允许溢出，为辉光与大落叶提供自由穿行空间 */
.weather-card-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 280px;
  overflow: visible !important;
}

/* 1. 底层背光层：与卡片对齐，带 clipPath 阻断左侧相册区域 */
.back-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
  overflow: visible !important;
}

/* 2. 核心卡片层：保留圆角与阴影 */
.weather-card {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 280px;
  border-radius: 18px;
  overflow: hidden;
  box-shadow: 0 10px 30px -6px rgba(0, 0, 0, 0.22);
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background-color: #DAE3FD;
  transition: background-color 2s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 2;
}

/* 经典背景色 */
.weather-card[data-type="thunder"] {
  background-color: #9FA4AD;
}
.weather-card[data-type="rain"] {
  background-color: #D8D8D8;
}
.weather-card[data-type="sun"] {
  background-color: #CCCCFF;
}
.weather-card[data-type="snow"] {
  background-color: #DCEAF9;
}
.weather-card[data-type="wind"] {
  background-color: #DAE3FD;
}

/* 卡片内部 SVG 背景遮罩 */
.inner-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.45) 50%, rgba(255, 255, 255, 0) 100%);
}

/* 3. 表层破框层：置于卡片上方且无裁切，大树叶飞舞掠出卡片直接飞向屏幕最右侧 */
.outer-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 3;
  overflow: visible !important;
}

/* 详情信息展示层 */
.details {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 16px 20px;
  color: #6d7582;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  z-index: 5;
  transition: color 2s ease;
  pointer-events: none;
}

.weather-card[data-type="thunder"] .details {
  color: #f0f0f0;
}

.right {
  text-align: right;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.date {
  margin: 3px 0;
  font-size: 13px;
  opacity: 0.85;
}

.address-box {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
  pointer-events: auto;
}

.address {
  font-size: 20px;
  font-weight: 500;
  opacity: 0.9;
}

.change-btn {
  color: rgba(55, 55, 183, 0.85);
  font-size: 22px;
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: transform 0.2s ease;
}

.weather-card[data-type="thunder"] .change-btn {
  color: #ffffff;
}

.change-btn:hover {
  transform: scale(1.15);
}

.desc {
  font-weight: 600;
  font-size: 20px;
  margin-top: 4px;
}

.temp {
  font-size: 54px;
  line-height: 50px;
  font-weight: 300;
  transform-origin: left bottom;
}

.temp span {
  font-size: 16px;
  line-height: 26px;
  vertical-align: top;
  margin-left: 4px;
}
</style>