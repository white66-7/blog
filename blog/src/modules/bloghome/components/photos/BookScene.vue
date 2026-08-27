<template>
  <div
    class="book-scene-container animate__animated animate__fadeIn"
    style="animation-delay: 0.3s; animation-duration: 1.5s;"
  >
    <!-- 3D 书本场景 -->
    <div class="book-scene">
      <div class="book-wrapper">
        <div class="book bound">
          <div class="pages">
            <BookPage
              v-for="(sheet, index) in sheets"
              :key="index"
              :ref="el => { if (el && el.$el) pageRefs[index] = el.$el }"
              :sheet="sheet"
              :index="index"
              :is-front-visible="isFrontVisible(index)"
              :is-back-visible="isBackVisible(index)"
              :is-animating="isAnimating"
              @open-photo="$emit('open-photo', $event)"
            />
          </div>
        </div>

        <!-- 左右边缘厚度块 -->
        <div 
          class="page-block block-right" 
          :style="{ 
            width: rightEdgeWidth + 'px', 
            opacity: rightEdgeProgress > 0.1 ? 0.9 : 0 
          }"
        ></div>
        <div 
          class="page-block block-left"  
          :style="{ 
            width: leftEdgeWidth + 'px', 
            opacity: leftEdgeProgress > 0.1 ? 0.9 : 0 
          }"
        ></div>
      </div>
    </div>

    <!-- 底部控制条 -->
    <BookControls
      :active-index="activePageIndex"
      :max-pages="maxFlipped"
      :is-animating="isAnimating"
      @prev="prevPage"
      @next="nextPage"
      @go-to="goToPage"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import gsap from 'gsap'
import BookPage from './BookPage.vue'
import BookControls from './BookControls.vue'

const props = defineProps({
  sheets: { type: Array, required: true },
  cover: { type: String, default: '' }
})

defineEmits(['open-photo'])

const pageRefs = ref([])
const PAGE_STEP = 4
const flippedCount = ref(0)
const activePageIndex = ref(0)
const isAnimating = ref(false)

const leftEdgeProgress = ref(0)
const rightEdgeProgress = ref(0)

const maxFlipped = computed(() => props.sheets.length)
const totalEdgeWidth = computed(() => props.sheets.length ? Math.min(8, Math.max(4, props.sheets.length * 1.2)) : 0)
const leftEdgeWidth = computed(() => maxFlipped.value ? totalEdgeWidth.value * (leftEdgeProgress.value / maxFlipped.value) : 0)
const rightEdgeWidth = computed(() => maxFlipped.value ? totalEdgeWidth.value * (rightEdgeProgress.value / maxFlipped.value) : 0)

const isFrontVisible = (index) => index === flippedCount.value
const isBackVisible = (index) => index === flippedCount.value - 1

const updateEdgesByAngle = (pageIndex, rotationY) => {
  const r = Math.abs(rotationY)
  const pRight = Math.max(0, Math.min(1, r / 4))
  const rightContribution = 1 - Math.pow(pRight, 2)
  const pLeft = Math.max(0, Math.min(1, (r - 176) / 4))
  const leftContribution = Math.pow(pLeft, 2)
  leftEdgeProgress.value = pageIndex + leftContribution
  rightEdgeProgress.value = (maxFlipped.value - 1 - pageIndex) + rightContribution
}

const initPages = () => {
  flippedCount.value = 0
  activePageIndex.value = 0
  isAnimating.value = false
  leftEdgeProgress.value = 0
  rightEdgeProgress.value = maxFlipped.value 

  const validPages = pageRefs.value.filter(Boolean)
  if (validPages.length === 0) return

  const total = validPages.length
  validPages.forEach((pageEl, index) => {
    gsap.killTweensOf(pageEl)
    const shadowFront = pageEl.querySelector('.shadow-front')
    const shadowBack = pageEl.querySelector('.shadow-back')
    if (shadowFront) gsap.set(shadowFront, { opacity: 0 })
    if (shadowBack) gsap.set(shadowBack, { opacity: 0 })

    gsap.set(pageEl, {
      rotationY: 0,
      rotationX: 0,
      rotationZ: 0,
      z: (total - index) * PAGE_STEP,
      zIndex: total - index,
      transformOrigin: "left center",
      force3D: true
    })
  })
}

const goToPage = (targetIndex) => {
  if (isAnimating.value || targetIndex === flippedCount.value) return
  if (targetIndex < 0 || targetIndex > maxFlipped.value) return

  activePageIndex.value = targetIndex
  isAnimating.value = true

  const total = pageRefs.value.filter(Boolean).length
  const fromIndex = flippedCount.value
  const toIndex = targetIndex
  const isForward = toIndex > fromIndex
  const numPages = Math.abs(toIndex - fromIndex)

  const isSingle = numPages === 1
  const pageDuration = isSingle ? 0.9 : Math.max(0.38, 0.65 - numPages * 0.03)
  const staggerDelay = isSingle ? 0 : Math.max(0.045, 0.38 / numPages)

  const tl = gsap.timeline({
    onComplete: () => {
      for (let i = 0; i < total; i++) {
        const el = pageRefs.value[i]
        if (!el) continue
        const isFlipped = i < toIndex
        gsap.set(el, {
          rotationY: isFlipped ? -180 : 0,
          z: isFlipped ? (i + 1) * PAGE_STEP : (total - i) * PAGE_STEP,
          zIndex: isFlipped ? i + 1 : total - i
        })
      }
      flippedCount.value = toIndex
      leftEdgeProgress.value = toIndex
      rightEdgeProgress.value = maxFlipped.value - toIndex
      isAnimating.value = false
    }
  })

  for (let step = 0; step < numPages; step++) {
    const i = isForward ? fromIndex + step : fromIndex - 1 - step
    const el = pageRefs.value[i]
    if (!el) continue

    const startTime = step * staggerDelay
    const shadowFront = el.querySelector('.shadow-front')
    const shadowBack = el.querySelector('.shadow-back')
    const endZ = isForward ? (i + 1) * PAGE_STEP : (total - i) * PAGE_STEP

    tl.set(el, { zIndex: total + 50 + step }, startTime)
    tl.to(el, {
      rotationY: isForward ? -180 : 0,
      duration: pageDuration,
      ease: isSingle ? "power2.inOut" : "power1.inOut",
      onUpdate: () => {
        if (step === numPages - 1) {
          updateEdgesByAngle(i, gsap.getProperty(el, "rotationY"))
        }
      }
    }, startTime)
    tl.to(el, { z: endZ, duration: pageDuration, ease: "linear" }, startTime)

    if (shadowFront && shadowBack) {
      if (isForward) {
        tl.fromTo(shadowFront, { opacity: 0 }, { opacity: 0.4, duration: pageDuration * 0.45, ease: "power1.in" }, startTime)
        tl.to(shadowFront, { opacity: 0, duration: 0.05 }, startTime + pageDuration * 0.45)
        tl.fromTo(shadowBack, { opacity: 0.4 }, { opacity: 0, duration: pageDuration * 0.55, ease: "power1.out" }, startTime + pageDuration * 0.45)
      } else {
        tl.fromTo(shadowBack, { opacity: 0 }, { opacity: 0.4, duration: pageDuration * 0.45, ease: "power1.in" }, startTime)
        tl.to(shadowBack, { opacity: 0, duration: 0.05 }, startTime + pageDuration * 0.45)
        tl.fromTo(shadowFront, { opacity: 0.4 }, { opacity: 0, duration: pageDuration * 0.55, ease: "power1.out" }, startTime + pageDuration * 0.45)
      }
    }
  }
}

const nextPage = () => goToPage(activePageIndex.value + 1)
const prevPage = () => goToPage(activePageIndex.value - 1)

let lastLength = -1
watch(() => props.sheets, (newSheets) => {
  if (newSheets.length === lastLength) return
  lastLength = newSheets.length
  pageRefs.value = []
  leftEdgeProgress.value = 0
  rightEdgeProgress.value = newSheets.length
  nextTick(() => { initPages() })
}, { immediate: true })
</script>

<style scoped>
.book-scene-container {
  --book-w: min(32vw, calc((100vh - 220px) / 1.35));
  --book-h: calc(var(--book-w) * 1.35);
  position: relative;
  z-index: 2;
  height: 100vh;
  padding-top: 40px;
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  background: radial-gradient(ellipse at 50% 42%, rgba(255, 246, 226, 0.55), rgba(255, 255, 255, 0.06) 60%, transparent 75%);
}

.book-scene {
  position: relative;
  perspective: clamp(800px, calc(var(--book-w) * 1.8), 1600px);
  width: calc(var(--book-w) * 2);
  height: var(--book-h);
  pointer-events: none;
}

.book-scene::after {
  content: '';
  position: absolute;
  bottom: -16px;
  left: 50%;
  transform: translateX(-50%);
  width: 72%;
  height: 16px;
  background: radial-gradient(ellipse, rgba(0, 0, 0, 0.18), transparent 70%);
  filter: blur(3px);
  pointer-events: none;
  z-index: 0;
}

.book-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  isolation: isolate;
  pointer-events: none;
}

.book.bound {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  transform: rotateX(8deg);
  transform-style: preserve-3d;
  pointer-events: none;
}

.book.bound::before {
  content: '';
  position: absolute;
  inset: -15px;
  border-radius: 6px;
  transform: translateZ(-3px);
  background-color: #f6eeda;
  background-image:
    url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='.2'/%3E%3C/svg%3E"),
    radial-gradient(ellipse at center, #fffef9 0%, #fdf9ef 70%, #f7efda 100%);
  background-blend-mode: multiply;
}

.book-wrapper::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 3.5px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  background: linear-gradient(to right, transparent 0%, rgba(60, 45, 30, 0.08) 35%, rgba(60, 45, 30, 0.22) 50%, rgba(60, 45, 30, 0.08) 65%, transparent 100%);
  z-index: 2;
  pointer-events: none;
  mix-blend-mode: multiply;
}

.pages {
  position: absolute;
  top: 0;
  left: 50%;
  width: 50%;
  height: 100%;
  transform-style: preserve-3d;
  pointer-events: none;
}

.page-block {
  position: absolute;
  top: 2px;
  bottom: 3.5px;
  z-index: 5;
  pointer-events: none;
  background: repeating-linear-gradient(to right, #d9d2c0 0 1px, #efe9da 1px 2px, #fffdf6 2px 3px);
  box-shadow: inset 0 0 3px rgba(0, 0, 0, .18);
  opacity: 0.9;
}

.block-right {
  right: -2px;
  border-radius: 0 3px 3px 0;
}

.block-left {
  left: -2px;
  border-radius: 3px 0 0 3px;
  background: repeating-linear-gradient(to right, #fffdf6 0 1px, #efe9da 1px 2px, #d9d2c0 2px 3px);
}

@media (max-width: 768px) {
  .book-scene-container {
    --book-w: min(42vw, calc((100vh - 180px) / 1.4));
    --book-h: calc(var(--book-w) * 1.4);
    padding-top: 30px;
  }
  .page-block {
    display: none;
  }
}
</style>