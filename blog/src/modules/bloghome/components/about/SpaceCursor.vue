<!-- src/modules/bloghome/components/about/SpaceCursor.vue -->
<template>
  <div v-show="isVisible" class="space-cursor-layer">
    <div ref="shipRef" class="ship-wrapper">
      <!-- 双发等离子冷焰（严密对齐喷口） -->
      <div class="thrusters-group">
        <div ref="thrusterLeft" class="thruster-plume left">
          <div class="plume-core"></div>
        </div>
        <div ref="thrusterRight" class="thruster-plume right">
          <div class="plume-core"></div>
        </div>
      </div>

      <!-- 《星际穿越》Ranger 漫游者号机身 -->
      <svg class="ship-svg" viewBox="0 0 44 60" fill="none">
        <!-- 主机翼与机身背部（钛灰装甲） -->
        <path d="M22 6L37 42L33 50L25 48L22 49L19 48L11 50L7 42L22 6Z" fill="#181A1F" stroke="#4A4E57" stroke-width="0.8" stroke-linejoin="round"/>
        
        <!-- 升力体多面折线 -->
        <path d="M22 6L29 38L22 47L15 38L22 6Z" fill="#242831" stroke="#383C46" stroke-width="0.6"/>
        <path d="M22 6L22 47" stroke="#606674" stroke-width="0.7" opacity="0.6"/>

        <!-- 深黑驾驶舱风挡 -->
        <polygon points="22,14 24.5,21 19.5,21" fill="#0A0C10" stroke="#4FD1C5" stroke-width="0.5" stroke-opacity="0.6"/>
        
        <!-- 机体装甲板接缝 -->
        <line x1="14" y1="36" x2="8" y2="41" stroke="#3A3E48" stroke-width="0.6"/>
        <line x1="30" y1="36" x2="36" y2="41" stroke="#3A3E48" stroke-width="0.6"/>
        <line x1="18" y1="28" x2="13" y2="34" stroke="#2F333B" stroke-width="0.5"/>
        <line x1="26" y1="28" x2="31" y2="34" stroke="#2F333B" stroke-width="0.5"/>

        <!-- 双发金属喷管 -->
        <rect x="13.5" y="48.5" width="4" height="2" rx="0.5" fill="#323640" stroke="#5A606E" stroke-width="0.5"/>
        <rect x="26.5" y="48.5" width="4" height="2" rx="0.5" fill="#323640" stroke="#5A606E" stroke-width="0.5"/>

        <!-- 极简航行指示冷点 -->
        <circle cx="22" cy="6" r="0.8" fill="#FFFFFF"/>
        <circle cx="7.5" cy="42" r="0.6" fill="#94A3B8"/>
        <circle cx="36.5" cy="42" r="0.6" fill="#94A3B8"/>
      </svg>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const isVisible = ref(false)
const shipRef = ref(null)
const thrusterLeft = ref(null)
const thrusterRight = ref(null)

// 坐标变量
let mouseX = -100
let mouseY = -100
let prevFrameX = -100
let prevFrameY = -100
let shipX = -100
let shipY = -100

// 航向与物理平滑
let shipAngle = 0
let targetAngle = 0
let smoothVx = 0
let smoothVy = 0
let smoothSpeed = 0
let rafId = null

const onMouseMove = (e) => {
  if (!isVisible.value) {
    isVisible.value = true
    mouseX = e.clientX
    mouseY = e.clientY
    prevFrameX = e.clientX
    prevFrameY = e.clientY
    shipX = e.clientX
    shipY = e.clientY
  } else {
    mouseX = e.clientX
    mouseY = e.clientY
  }
}

const onMouseOver = (e) => {
  if (!shipRef.value) return
  const isInteractive = !!e.target.closest('button, a, .interactive-beacon, .icon-node, .skill-tag')
  shipRef.value.classList.toggle('is-locked', isInteractive)
}

const onMouseLeave = () => {
  isVisible.value = false
}

// 物理循环
const updateLoop = () => {
  if (shipRef.value && isVisible.value) {
    // 1. 先计算真实帧间位移速率
    const frameDist = Math.hypot(mouseX - prevFrameX, mouseY - prevFrameY)
    prevFrameX = mouseX
    prevFrameY = mouseY

    // 速度平滑滤波（划动时迅速起飞，停下时平缓收束）
    smoothSpeed += (frameDist - smoothSpeed) * 0.25

    // 2. 位置高精度跟手
    const rawVx = mouseX - shipX
    const rawVy = mouseY - shipY
    shipX += rawVx * 0.75
    shipY += rawVy * 0.75

    // 3. 方向低通滤波（彻底杜绝右滑抖动）
    smoothVx += (rawVx - smoothVx) * 0.2
    smoothVy += (rawVy - smoothVy) * 0.2
    const dirSpeed = Math.hypot(smoothVx, smoothVy)

    if (dirSpeed > 0.8) {
      targetAngle = (Math.atan2(smoothVy, smoothVx) * 180) / Math.PI + 90
    }

    // 4. 航向阻尼（机头掉头平滑度）
    let diff = (targetAngle - shipAngle) % 360
    if (diff > 180) diff -= 360
    if (diff < -180) diff += 360
    shipAngle += diff * 0.18

    // 5. 机尖锁定在绝对像素 (22px, 6px)
    shipRef.value.style.transform = `translate3d(${shipX - 22}px, ${shipY - 6}px, 0) rotate(${shipAngle}deg)`

    // 6. 【高亮尾焰控制】：常驻可见（静止时 0.8，划动时最高喷射到 2.8）
    if (thrusterLeft.value && thrusterRight.value) {
      const scaleY = Math.min(0.8 + smoothSpeed * 0.12, 2.8)
      const opacity = Math.min(0.7 + smoothSpeed * 0.03, 1.0)
      const plumeStyle = `scaleY(${scaleY})`
      
      thrusterLeft.value.style.transform = plumeStyle
      thrusterRight.value.style.transform = plumeStyle
      thrusterLeft.value.style.opacity = opacity
      thrusterRight.value.style.opacity = opacity
    }
  }

  rafId = requestAnimationFrame(updateLoop)
}

onMounted(() => {
  if (window.matchMedia('(pointer: coarse)').matches) return

  window.addEventListener('mousemove', onMouseMove, { passive: true })
  document.addEventListener('mouseover', onMouseOver, { passive: true })
  document.addEventListener('mouseleave', onMouseLeave)

  rafId = requestAnimationFrame(updateLoop)
})

onUnmounted(() => {
  window.removeEventListener('mousemove', onMouseMove)
  document.removeEventListener('mouseover', onMouseOver)
  document.removeEventListener('mouseleave', onMouseLeave)
  if (rafId) cancelAnimationFrame(rafId)
})
</script>

<style scoped>
.space-cursor-layer {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 99999;
  overflow: hidden;
}

.ship-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 44px;
  height: 60px;
  /* 严丝合缝锚定机尖中心 */
  transform-origin: 22px 6px;
  will-change: transform;
  pointer-events: none;
}

.ship-svg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 2; /* 机身在尾焰上方，喷管压住尾焰根部 */
  filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.85)) drop-shadow(0 0 2px rgba(255, 255, 255, 0.18));
  transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), filter 0.2s ease;
}

/* 双发等离子尾推容器 */
.thrusters-group {
  position: absolute;
  top: 49px; /* 精确贴紧机尾金属喷口 */
  left: 0;
  width: 100%;
  height: 20px;
  z-index: 1; /* 尾焰从机身下方喷出 */
  pointer-events: none;
}

/* 等离子光柱本体（外焰） */
.thruster-plume {
  position: absolute;
  width: 4px;
  height: 14px;
  border-radius: 1px 1px 4px 4px;
  /* 漫游者号标志性的纯白等离子核 + 冷蓝辉光 */
  background: linear-gradient(to bottom, #FFFFFF 0%, #38BDF8 30%, #0284C7 70%, transparent 100%);
  transform-origin: top center;
  transform: scaleY(0.8);
  opacity: 0.75;
  box-shadow: 0 0 6px #38bdf8, 0 0 12px rgba(56, 189, 248, 0.8);
  will-change: transform, opacity;
  display: flex;
  justify-content: center;
}

/* 核心极亮核（内焰） */
.plume-core {
  width: 1.5px;
  height: 60%;
  background: #FFFFFF;
  border-radius: 1px;
  box-shadow: 0 0 4px #FFFFFF;
}

/* 精准对齐左右喷管的水平坐标 */
.thruster-plume.left {
  left: 13.5px;
}

.thruster-plume.right {
  left: 26.5px;
}

/* 锁定/交互时机身微调 */
.ship-wrapper.is-locked .ship-svg {
  transform: scale(1.08);
  filter: drop-shadow(0 0 8px rgba(125, 211, 252, 0.7)) drop-shadow(0 2px 6px rgba(0, 0, 0, 0.9));
}
</style>