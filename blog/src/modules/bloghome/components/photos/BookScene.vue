<template>
  <div class="book-scene-container">
    
    <!-- 左翻页按钮 -->
    <button class="nav-btn prev-btn" @click.stop="prevPage" :class="{ 'hidden': flippedCount === 0 }">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
    </button>

    <!-- 右翻页按钮 -->
    <button class="nav-btn next-btn" @click.stop="nextPage" :class="{ 'hidden': flippedCount >= maxFlipped }">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
    </button>

    <!-- 所有的书本层级全部通过 CSS 屏蔽了点击，唯独开放了激活的相纸 -->
    <div class="book-scene">
      <div class="book-wrapper">
        <div class="book bound">
          <div class="pages">
            
            <div 
              v-for="(sheet, index) in sheets" 
              :key="index"
              :ref="el => { if (el) pageRefs[index] = el }"
              class="page"
            >
              <!-- ==================== 正面（右页） ==================== -->
              <div class="page-face front" :class="{ 'face-active': isFrontVisible(index) }">
                <div v-if="sheet.front.type === 'blank'" class="page-content blank-content"></div>
                
                <div v-else class="page-content grid-page">
                  <div 
                    v-for="(photo, i) in sheet.front.items" :key="i" 
                    class="polaroid-in-book"
                    :class="{ 'clickable': isFrontVisible(index) }"
                    @click.stop="isFrontVisible(index) ? $emit('open-photo', photo) : null"
                  >
                    <div class="photo">
                      <img :src="photo.url" class="real-image" />
                      <div class="dust"></div><div class="scratches"></div>
                    </div>
                    <div class="caption-handwritten">{{ photo.title }}</div>
                  </div>
                  <div class="page-number">{{ index * 2 }}</div>
                </div>
                <div class="page-fold-right"></div>
              </div>

              <!-- ==================== 背面（左页） ==================== -->
              <div class="page-face back" :class="{ 'face-active': isBackVisible(index) }">
                <div v-if="sheet.back.type === 'blank'" class="page-content blank-content"></div>
                
                <div v-else class="page-content grid-page">
                  <div 
                    v-for="(photo, i) in sheet.back.items" :key="i" 
                    class="polaroid-in-book"
                    :class="{ 'clickable': isBackVisible(index) }"
                    @click.stop="isBackVisible(index) ? $emit('open-photo', photo) : null"
                  >
                    <div class="photo">
                      <img :src="photo.url" class="real-image" />
                      <div class="dust"></div><div class="scratches"></div>
                    </div>
                    <div class="caption-handwritten">{{ photo.title }}</div>
                  </div>
                  <div class="page-number">{{ index * 2 + 1 }}</div>
                </div>
                <div class="page-fold-left"></div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import gsap from 'gsap'

const props = defineProps({
  sheets: { type: Array, required: true }
})
const emit = defineEmits(['open-photo'])

const pageRefs = ref([])
const flippedCount = ref(0)
const isAnimating = ref(false)
const FLIP_DURATION = 1.0 

const maxFlipped = computed(() => props.sheets.length)

const isFrontVisible = (index) => index === flippedCount.value
const isBackVisible = (index) => index === flippedCount.value - 1

const initPages = () => {
  const validPages = pageRefs.value.filter(el => el != null)
  if (validPages.length === 0) return
  
  const total = validPages.length
  validPages.forEach((pageEl, index) => {
    gsap.killTweensOf(pageEl)
    gsap.set(pageEl, { 
      rotationY: 0, 
      z: (total - index) * 2, 
      zIndex: total - index, 
      force3D: true 
    })
  })
  flippedCount.value = 0
}

const nextPage = () => {
  if (isAnimating.value || flippedCount.value >= maxFlipped.value) return
  isAnimating.value = true
  
  const index = flippedCount.value
  const pageEl = pageRefs.value[index]
  if (!pageEl) { isAnimating.value = false; return; }

  gsap.to(pageEl, {
    rotationY: -180, 
    z: (index + 1) * 2, 
    zIndex: index + 1,
    duration: FLIP_DURATION, 
    ease: 'power2.inOut',
    onComplete: () => { isAnimating.value = false }
  })
  flippedCount.value++
}

const prevPage = () => {
  if (isAnimating.value || flippedCount.value <= 0) return
  isAnimating.value = true
  
  const index = flippedCount.value - 1
  const pageEl = pageRefs.value[index]
  const total = pageRefs.value.filter(Boolean).length
  if (!pageEl) { isAnimating.value = false; return; }

  gsap.to(pageEl, {
    rotationY: 0, 
    z: (total - index) * 2, 
    zIndex: total - index,
    duration: FLIP_DURATION, 
    ease: 'power2.inOut',
    onComplete: () => { isAnimating.value = false }
  })
  flippedCount.value--
}

watch(() => props.sheets, () => {
  pageRefs.value = [] 
  nextTick(() => { initPages() })
}, { immediate: true })
</script>

<style scoped>
@import url(https://fonts.googleapis.com/css?family=Crimson+Text:400,700|Playfair+Display:400,700|Rock+Salt:400);

.book-scene-container {
  --book-w: min(36vw, calc((100vh - 120px) / 1.35));
  --book-h: calc(var(--book-w) * 1.35);
  --page-color: #fdfbf7;
  position: relative; z-index: 2; height: 100vh; display: flex; justify-content: center; align-items: center;
  background: rgba(255, 255, 255, 0.05); backdrop-filter: blur(20px) saturate(180%);
}

.nav-btn {
  position: absolute; top: 50%; transform: translateY(-50%); width: 60px; height: 60px; border-radius: 50%;
  background: rgba(255, 255, 255, 0.9); border: 1px solid rgba(0,0,0,0.05); box-shadow: 0 4px 15px rgba(0,0,0,0.1);
  display: flex; justify-content: center; align-items: center; z-index: 1000; cursor: pointer; transition: all 0.3s ease; color: #333;
}
.nav-btn:hover { background: #fff; box-shadow: 0 6px 20px rgba(0,0,0,0.15); transform: translateY(-50%) scale(1.1); }
.nav-btn svg { width: 30px; height: 30px; }
.prev-btn { left: 5%; } .next-btn { right: 5%; }
.nav-btn.hidden { opacity: 0; pointer-events: none; transform: translateY(-50%) scale(0.8); }

/* ================= 核心修复 1：全链路屏蔽 3D 容器的事件拦截 ================= */
.book-scene, .book-wrapper, .book, .pages, .page, .page-face, .page-content { 
  pointer-events: none; 
}

.book-scene { perspective: 250vw; width: calc(var(--book-w) * 2); height: var(--book-h); }
.book-wrapper { position: relative; width: 100%; height: 100%; }
.book-wrapper::before { content: ''; position: absolute; top: -15px; bottom: -15px; left: -15px; right: -15px; background-color: #5c3012; background-image: radial-gradient(circle, rgba(0,0,0,0) 40%, rgba(0,0,0,0.5) 100%); border-radius: 6px; box-shadow: inset 4px 4px 10px rgba(255,255,255,0.1), 0 20px 40px rgba(0,0,0,0.5); z-index: -1; }
.book-wrapper::after { content: ''; position: absolute; top: -15px; bottom: -15px; left: 50%; transform: translateX(-50%); width: 60px; background: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.3) 46%, rgba(0,0,0,0.7) 49%, rgba(0,0,0,0.8) 50%, rgba(0,0,0,0.7) 51%, rgba(0,0,0,0.3) 54%, transparent 100%); z-index: 100; pointer-events: none; }
.book.bound { width: 100%; height: 100%; transform: rotateX(8deg); transform-style: preserve-3d; }
.pages { position: absolute; top: 0; left: 50%; width: 50%; height: 100%; transform-style: preserve-3d; }
.page { position: absolute; top: 0; left: 0; width: 100%; height: 100%; transform-style: preserve-3d; transform-origin: left center; }
.page-face { position: absolute; top: 0; left: 0; width: 100%; height: 100%; overflow: hidden; box-sizing: border-box; backface-visibility: hidden; background-color: var(--page-color); background-image: radial-gradient(circle, rgba(0,0,0,0) 60%, rgba(0,0,0,0.03) 100%); }

.front { border-radius: 0 4px 4px 0; box-shadow: inset 2px 0 5px rgba(0,0,0,0.1); }
.back { transform: rotateY(180deg); border-radius: 4px 0 0 4px; box-shadow: inset -2px 0 5px rgba(0,0,0,0.1); }
.page-fold-right { position: absolute; top: 0; right: 0; width: 0; height: 0; border-left: 1px solid #ddd; border-bottom: 1px solid #ddd; box-shadow: -5px 5px 10px rgba(221,221,221,0.6); pointer-events: none; }
.page-fold-left { position: absolute; top: 0; left: 0; width: 0; height: 0; border-right: 1px solid #ddd; border-bottom: 1px solid #ddd; box-shadow: 5px 5px 10px rgba(221,221,221,0.6); pointer-events: none; }
.page-content { width: 100%; height: 100%; padding: 20px; position: relative; box-sizing: border-box; display: flex; flex-direction: column; align-items: center; justify-content: center; overflow: hidden; }
.grid-page { justify-content: space-evenly; padding: 20px; }


/* ================= 核心修复 2：强行撑开物理 Hit Box ================= */
.polaroid-in-book { 
  position: relative; 
  width: 75%; 
  height: 42%; /* 废弃容易塌缩的 flex，直接给定物理高度 */
  padding: 12px 12px 18px 12px; 
  background: white; 
  box-shadow: 0 4px 12px rgba(0,0,0,0.15); transition: transform 0.3s, box-shadow 0.3s, z-index 0.3s; 
  display: flex; flex-direction: column; 
  pointer-events: none; /* 默认不允许点击，防止幽灵遮挡 */
}
.polaroid-in-book:nth-child(odd) { transform: rotate(-2deg); }
.polaroid-in-book:nth-child(even) { transform: rotate(1.5deg); }

/* 只有处于当前激活可见的面上的照片，才允许被点击 */
.polaroid-in-book.clickable {
  pointer-events: auto;
  cursor: zoom-in;
}
.polaroid-in-book.clickable:hover { transform: scale(1.05) rotate(0deg); box-shadow: 0 8px 25px rgba(0,0,0,0.2); z-index: 10; } 

.polaroid-in-book .photo { flex-grow: 1; min-height: 0; position: relative; overflow: hidden; background: #1a1a1a; pointer-events: none; }
.caption-handwritten { font-family: 'Rock Salt', cursive, 'Microsoft YaHei'; text-align: center; margin-top: 10px; font-size: 14px; color: #333; pointer-events: none; }
.page-number { position: absolute; bottom: 20px; font-family: 'Playfair Display', serif; font-weight: bold; opacity: 0.5; pointer-events: none; }
.front .page-number { right: 30px; }
.back .page-number { left: 30px; }

.real-image { width: 100%; height: 100%; object-fit: cover; filter: contrast(1.1) sepia(0.15); pointer-events: none; }
.photo::before { content: ""; position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(120deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.4) 32%, rgba(255,255,255,0) 35%); animation: shine 4s infinite; z-index: 2; pointer-events: none; }
.dust { position: absolute; width: 100%; height: 100%; top: 0; left: 0; background-image: radial-gradient(#000 1px, transparent 1px), radial-gradient(#000 1px, transparent 1px); background-size: 50px 50px; background-position: 0 0, 25px 25px; opacity: 0.05; z-index: 3; pointer-events: none; }
.scratches { position: absolute; width: 100%; height: 100%; top: 0; left: 0; background: linear-gradient(45deg, transparent 45%, rgba(0,0,0,0.05) 46%, transparent 47%), linear-gradient(-45deg, transparent 45%, rgba(0,0,0,0.05) 46%, transparent 47%); background-size: 200px 200px; opacity: 0.5; z-index: 3; pointer-events: none; }
@keyframes shine { 0% { transform: translateX(-100%) rotate(120deg); } 20%, 100% { transform: translateX(100%) rotate(120deg); } }

@media (max-width: 768px) {
  .book-scene-container { --book-w: min(45vw, calc((100vh - 100px) / 1.4)); --book-h: calc(var(--book-w) * 1.4); }
  .nav-btn { width: 40px; height: 40px; }
  .nav-btn svg { width: 20px; height: 20px; }
  .prev-btn { left: 2%; } .next-btn { right: 2%; }
  .polaroid-in-book { width: 90%; padding: 6px 6px 12px 6px; }
}
</style>