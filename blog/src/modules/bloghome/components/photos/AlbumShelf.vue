<template>
  <div class="vasari-shelf-container" @pointerdown="onPointerDown" @pointermove="onPointerMove" @pointerup="onPointerUp"
    @pointercancel="onPointerUp" @wheel.prevent="onWheel">
    <!-- 地面柔和漫反射环境光阴影 -->
    <div class="shelf-ground-shadow" aria-hidden="true"></div>

    <!-- 3D 弧形舞台 -->
    <div class="shelf-stage">
      <!-- 注意：位置 / 层级 / 遮罩由动画循环直接写进 DOM（见 applyLayout），
           所以这里不再绑定 :style，只登记元素引用 -->
      <div v-for="(album, index) in albums" :key="album.id || index" :ref="(el) => setSlotRef(el, index)"
        class="book-slot" :class="{
          'is-center': index === activeIndex,
          'is-side': index !== activeIndex,
          'is-open': index === activeIndex && isOpen
        }" @click="onBookClick(album, index)" @mouseenter="hoveredIndex = index" @mouseleave="hoveredIndex = -1">
        <!-- 3D 实体书盒 -->
        <div class="book-box" :style="{ '--theme-color': themeOf(index).paper, '--ink': themeOf(index).ink }">

          <!-- 设计思路：书脊 = 封面同一张纸。纸色、墨色取自封面，
               再把封面里最有代表性的一小块画面"裁"到书脊上。 -->
          <div class="box-spine" :style="{
            '--paper': themeOf(index).paper,
            '--ink': themeOf(index).ink
          }">

            <SpineArt :motif="themeOf(index).motif" />

            <!-- 书名：按插画留白错落排版 -->
            <div class="spine-title-wrap" :class="`motif-${themeOf(index).motif || 'default'}`">
              <span class="spine-title">{{ album.title }}</span>
            </div>


            <!-- 景深阴影遮罩（透明度由 --shade 控制） -->
            <span class="spine-shade"></span>
          </div>

          <!-- 封底：书盒的最后一面。右侧的书转过去后，朝向中间的就是它，
               纸色、颗粒、景深遮罩都与书脊一致。 -->
          <div class="box-back" aria-hidden="true">
            <span class="spine-shade"></span>
          </div>

          <!-- 展开热区：书打开时覆盖整个翻开的范围，避免光标一动就合上。
               只在 is-open 时接收鼠标，平时不会挡住旁边的书。 -->
          <div class="book-hit" @click.stop></div>

          <!-- 正面翻页书体 -->
          <figure class="book">
            <!-- 封面层 -->
            <ul class="hardcover_front">
              <!-- 封面正面 -->
              <li>
                <img :src="album.cover" alt="cover" class="cover-img" @error="onImgError">
                <div class="cover-overlay"></div>
                <div class="vertical-title">
                  <span v-for="(part, i) in splitIntoColumns(album.title, 2)" :key="i" class="title-column">
                    {{ part }}
                  </span>
                </div>
                <span class="cover-shade"></span>
              </li>
              <!-- 翻开后的左扉页 -->
              <li>
                <div class="mini-photos-wrapper">
                  <div v-for="(photo, pIdx) in getPagePhotos(album.photos, 0)" :key="pIdx" class="mini-polaroid">
                    <div class="mini-img-box">
                      <img :src="getPhotoSrc(photo)" class="mini-img" decoding="async" />
                    </div>
                    <span v-if="photo.title" class="mini-title">{{ photo.title }}</span>
                  </div>
                </div>
              </li>
            </ul>

            <!-- 内页 -->
            <ul class="page">
              <li v-for="pageIndex in 5" :key="pageIndex">
                <div class="mini-photos-wrapper">
                  <div v-for="(photo, pIdx) in getPagePhotos(album.photos, pageIndex)" :key="pIdx"
                    class="mini-polaroid">
                    <div class="mini-img-box">
                      <img :src="getPhotoSrc(photo)" class="mini-img" decoding="async" />
                    </div>
                    <span v-if="photo.title" class="mini-title">{{ photo.title }}</span>
                  </div>
                </div>
              </li>
            </ul>
          </figure>

          <!-- 底部接触投影 -->
          <div class="box-shadow"></div>
        </div>
      </div>
    </div>

    <!-- 底部信息控制器 -->
    <div class="shelf-controls" v-if="currentAlbum">
      <button class="vasari-arrow" @click.stop="prevAlbum" title="上一个">
        <svg width="24" height="12" viewBox="0 0 24 12" fill="none" stroke="currentColor" stroke-width="1.3">
          <path d="M6 1L1 6l5 5M1 6h23" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>

      <div class="active-album-meta" @click.stop="$emit('select-album', currentAlbum)">
        <h2 class="meta-title">{{ currentAlbum.title }}</h2>
        <h2 class="meta-num">{{ currentCount }}张</h2>
      </div>

      <button class="vasari-arrow" @click.stop="nextAlbum" title="下一个">
        <svg width="24" height="12" viewBox="0 0 24 12" fill="none" stroke="currentColor" stroke-width="1.3">
          <path d="M18 1l5 5-5 5M23 6H0" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import SpineArt from './spines/SpineArt.vue';

const props = defineProps({
  albums: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['select-album']);

//  状态 
let currentS = 0;
let openT = 0;   // 0 合上 → 1 完全展开，平滑过渡，用来给两侧的书让位

const targetT = ref(0);
const activeIndex = ref(0);
const hoveredIndex = ref(-1);
const isDragging = ref(false);

// 展开状态：书停稳、没在拖拽、光标在当前书上 → 打开
const settled = ref(true);
const isOpen = computed(() => settled.value && hoveredIndex.value === activeIndex.value);

const spineThemes = {
  custom: { paper: '#F2F3F6', ink: '#2F3F63', motif: 'hand' },
  persons: { paper: '#F6F1EF', ink: '#3B2F2E', motif: 'swing' },
  views: { paper: '#F1F2EE', ink: '#2C372F', motif: 'lake' },
  holiday: { paper: '#F8F6F0', ink: '#262626', motif: 'ink' },
  game: { paper: '#F4F2ED', ink: '#2D2A26', motif: 'sword' },
};
// 新增相册没配主题时用素纸 + 无插画
const fallbackTheme = { paper: '#F8F6F0', ink: '#2B2724', motif: null };

function themeOf(index) {
  const album = props.albums[index];
  return (album && spineThemes[album.id]) || fallbackTheme;
}


const currentCount = computed(() => {
  const photos = currentAlbum.value?.photos;
  return Array.isArray(photos) ? photos.length : 0;
});

const currentAlbum = computed(() => props.albums[activeIndex.value] || null);

const config = ref({
  H: 330,
  d: 196,
  ws: 42,
  gap: 38,
  U: 780,
  P: 1400,
  og: 62,
});

const updateConfig = () => {
  const isMobile = window.innerWidth <= 768;
  config.value = {
    H: isMobile ? 240 : 330,
    d: isMobile ? 148 : 196,
    ws: isMobile ? 32 : 42,
    gap: isMobile ? 20 : 38,
    U: isMobile ? 440 : 780,
    P: 1400,
    og: isMobile ? 36 : 62,
  };
};

function smoothstep(x) {
  const t = Math.max(0, Math.min(1, x));
  return t * t * (3 - 2 * t);
}

function B(r) {
  if (Math.abs(r) < 1) {
    return (r + Math.sin(Math.PI * r) / Math.PI) / 2;
  }
  return r >= 1 ? 0.5 : -0.5;
}

// 书脊可见度（正视时平滑隐于封面背后，绝无破面）
const spineOpacity = (absR) => {
  if (absR < 0.08) return 0;
  if (absR < 0.35) return (absR - 0.08) / 0.27;
  return 1;
};

//  直接写 DOM 的布局 
// 每帧只改 transform / z-index 和两个 CSS 变量（--shade、--spine-o），
// 不走 Vue 渲染，也不会重新 diff 那几十张图片和 SVG
const slotEls = [];
const lifts = [];   // 侧面书被悬停时的上抬量（px，带缓动）
const setSlotRef = (el, i) => { slotEls[i] = el || null; };

function applyLayout() {
  const { ws, d, gap, U, P, H, og } = config.value;

  for (let i = 0; i < props.albums.length; i++) {
    const el = slotEls[i];
    if (!el) continue;

    const r = i - currentS;
    const absR = Math.abs(r);
    const o = smoothstep(1 - absR);

    // ★ 关键修复：外侧书采用渐进级数补偿（多叠一本，多以 1.25 次方外推抵消透视压缩）
    const extraSteps = Math.max(0, absR - 1);
    const progressive = extraSteps > 0 ? (extraSteps * og + Math.pow(extraSteps, 1.25) * 18) : 0;
    const outer = Math.sign(r) * progressive;

    const u = r * (ws + gap) + (d - ws + 2.2 * gap) * B(r) + outer;
    const sc = 1 / (1 + Math.pow(Math.abs(u) / U, 1.6));
    const k = 1 / sc;

    // 展开让位逻辑保持不变
    let shift = 0;
    if (openT > 0.001) {
      const f = d / 196;
      const s = Math.max(-1, Math.min(1, r * 2));
      const mid = 78 * f, left = -125 * f, right = 62 * f;
      const target = s < 0 ? mid + (left - mid) * -s : mid + (right - mid) * s;
      shift = openT * target;
    }

    const x = u + shift;
    const z = P * (1 - k) + o * 75;
    const y = H * 0.42 * (1 - sc) * 0.36 - (lifts[i] || 0);

    // 关键优化：左侧书角度微调为 81deg
    const leftAngle = 81;
    const rightAngle = 96;
    const rotateY = (1 - o) * (r < 0 ? leftAngle : rightAngle);

    el.style.transform =
      `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, ${z.toFixed(2)}px) rotateY(${rotateY.toFixed(2)}deg)`;
    el.style.zIndex = Math.round(2000 + z + o * 100);
    el.style.setProperty('--shade', ((1 - o) * 0.2).toFixed(3));
    el.style.setProperty('--spine-o', spineOpacity(absR).toFixed(3));
  }
}

//  动画循环 
let animId = 0;
let lastTime = 0;

const kick = () => {
  if (animId) return;
  lastTime = performance.now();
  animId = requestAnimationFrame(tick);
};

function tick(now) {
  const dt = Math.min((now - lastTime) / 1000, 0.05);
  lastTime = now;
  let busy = isDragging.value;

  // 位置：足够接近就直接吸附，不再指数拖尾（之前要拖约 5 秒才真正停下）
  const diff = targetT.value - currentS;
  if (Math.abs(diff) < 0.0008) {
    currentS = targetT.value;
  } else {
    currentS += diff * (1 - Math.exp(-(isDragging.value ? 20 : 7.2) * dt));
    busy = true;
  }

  const nearest = Math.max(0, Math.min(props.albums.length - 1, Math.round(currentS)));
  if (nearest !== activeIndex.value) {
    activeIndex.value = nearest;
  }

  // 书还在滑动 / 正在拖拽时不展开，避免滑过的书被误触发
  const nowSettled = !isDragging.value && Math.abs(targetT.value - currentS) < 0.03;
  if (nowSettled !== settled.value) settled.value = nowSettled;

  // 展开进度
  const openGoal = isOpen.value ? 1 : 0;
  if (openT !== openGoal) {
    openT += (openGoal - openT) * (1 - Math.exp(-5.5 * dt));
    if (Math.abs(openGoal - openT) < 0.001) openT = openGoal;
    else busy = true;
  }

  // 侧面书被悬停时微微抬起
  for (let i = 0; i < props.albums.length; i++) {
    const goal = hoveredIndex.value === i && Math.abs(i - currentS) > 0.4 ? 22 : 0;
    const cur = lifts[i] || 0;
    if (Math.abs(goal - cur) > 0.05) {
      lifts[i] = cur + (goal - cur) * (1 - Math.exp(-14 * dt));
      busy = true;
    } else {
      lifts[i] = goal;
    }
  }

  applyLayout();
  animId = busy ? requestAnimationFrame(tick) : 0;
}

// 任何会影响动画的状态一变，就唤醒循环
watch([targetT, isDragging, hoveredIndex, isOpen], kick);

//  拖拽与点击手势 
const dragStartX = ref(0);
const dragStartT = ref(0);
const pointerMovedDistance = ref(0);

const onPointerDown = (e) => {
  if (e.target.closest('.shelf-controls')) return;
  isDragging.value = true;
  dragStartX.value = e.clientX;
  dragStartT.value = targetT.value;
  pointerMovedDistance.value = 0;
};

const onPointerMove = (e) => {
  if (!isDragging.value) return;
  const dx = e.clientX - dragStartX.value;
  pointerMovedDistance.value = Math.abs(dx);

  const unit = config.value.ws + config.value.gap;
  const nextT = dragStartT.value - dx / unit;
  targetT.value = Math.max(-0.35, Math.min(props.albums.length - 0.65, nextT));
};

const onPointerUp = () => {
  if (!isDragging.value) return;
  isDragging.value = false;
  targetT.value = Math.max(0, Math.min(props.albums.length - 1, Math.round(targetT.value)));
};

const onBookClick = (album, index) => {
  if (pointerMovedDistance.value > 6) return;
  if (index === activeIndex.value) {
    emit('select-album', album);
  } else {
    targetT.value = index;
  }
};

let wheelTimer = null;
const onWheel = (e) => {
  const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
  const unit = config.value.ws + config.value.gap;
  targetT.value = Math.max(0, Math.min(props.albums.length - 1, targetT.value + (delta / unit) * 0.45));

  if (wheelTimer) clearTimeout(wheelTimer);
  wheelTimer = setTimeout(() => {
    targetT.value = Math.round(targetT.value);
    wheelTimer = null;
  }, 140);
};

const prevAlbum = () => {
  targetT.value = Math.max(0, Math.round(targetT.value) - 1);
};

const nextAlbum = () => {
  targetT.value = Math.min(props.albums.length - 1, Math.round(targetT.value) + 1);
};

const onKeyDown = (e) => {
  if (e.key === 'ArrowLeft') prevAlbum();
  if (e.key === 'ArrowRight') nextAlbum();
  if (e.key === 'Enter' && currentAlbum.value) {
    emit('select-album', currentAlbum.value);
  }
};

//  初始化 / 生命周期 
function resetToCenter() {
  const n = props.albums.length;
  if (!n) return;
  const mid = Math.floor(n / 2);
  activeIndex.value = mid;
  targetT.value = mid;
  currentS = mid;
  lifts.length = 0;
}
resetToCenter();

// 空闲时把展开会用到的照片逐张预解码，
// 避免书滑到中心那一刻才解码十几张图造成卡顿
function warmPhotos() {
  const srcs = props.albums
    .flatMap((a) => (a.photos || []).slice(0, 12).map(getPhotoSrc))
    .filter(Boolean);
  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 60));
  const next = () => {
    const src = srcs.shift();
    if (!src) return;
    const im = new Image();
    im.src = src;
    (im.decode ? im.decode() : Promise.resolve()).catch(() => { }).finally(() => idle(next));
  };
  idle(next);
}

const onResize = () => {
  updateConfig();
  applyLayout();
};

watch(() => props.albums, () => {
  resetToCenter();
  nextTick(applyLayout);
});

onMounted(() => {
  updateConfig();
  applyLayout();
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('resize', onResize);
  warmPhotos();
});

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId);
  animId = 0;
  if (wheelTimer) clearTimeout(wheelTimer);
  window.removeEventListener('keydown', onKeyDown);
  window.removeEventListener('resize', onResize);
});

//  工具函数 
function splitIntoColumns(str, colSize = 2) {
  if (!str) return [];
  const res = [];
  for (let i = 0; i < str.length; i += colSize) {
    res.push(str.slice(i, i + colSize));
  }
  return res;
}

function getPagePhotos(photos = [], pageIndex = 0) {
  if (!photos) return [];
  return photos.slice(pageIndex * 2, pageIndex * 2 + 2);
}

function getPhotoSrc(photo) {
  if (!photo) return '';
  return photo.thumb || photo.cover || photo.url || '';   // 数据里有缩略图字段就优先用
}

function onImgError(e) {
  e.target.style.opacity = '0';
}
</script>

<style scoped>
.vasari-shelf-container {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  user-select: none;
  touch-action: pan-y;
  perspective: 1400px;
  perspective-origin: 50% 48%;
  box-sizing: border-box;
  padding-top: 20px;
}

/* 地面漫反射环境光阴影 */
.shelf-ground-shadow {
  position: absolute;
  top: 58%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: min(94vw, 1100px);
  height: 150px;
  background: radial-gradient(50% 50% at 50% 50%, rgba(32, 24, 16, 0.22) 0%, rgba(32, 24, 16, 0.05) 55%, transparent 75%);
  filter: blur(16px);
  pointer-events: none;
  z-index: 0;
}

/* 3D 舞台中心 */
.shelf-stage {
  position: relative;
  width: 0;
  height: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  transform-style: preserve-3d;
}

.book-slot {
  position: absolute;
  top: 0;
  left: 0;
  width: 0;
  height: 0;
  cursor: pointer;
  transform-style: preserve-3d;
  will-change: transform;
}

/* 3D 实体书盒 */
.book-box {
  position: absolute;
  top: -165px;
  left: -98px;
  width: 196px;
  height: 330px;
  transform-style: preserve-3d;

  --depth: 42px;
  --grain: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.1'/%3E%3C/svg%3E");

  /* 以厚度中心为转轴：封面在前 +depth/2，封底在后 -depth/2。
     左右两侧的书转过去时对称，不再整体偏向一边 */
  transform: translateZ(calc(var(--depth) / -2));
}

/* 书脊样式 */
.box-spine {
  position: absolute;
  top: 0;
  left: 0;
  width: calc(var(--depth) + 2px);
  /* 书脊厚度（宽）；多出的 2px 用来接住封面，避免白缝 */
  height: 100%;
  box-sizing: border-box;
  background-color: var(--paper, #F4F2ED);
  /* 纸张颗粒：和页面背景同一套噪点，让书脊像同一批纸 */
  background-image: var(--grain);

  /* 3D 空间翻折：从书盒左缘向前（+z）伸出 depth，正好接住封面和封底 */
  transform-origin: 0% 50%;
  transform: rotateY(-90deg);
  backface-visibility: hidden;
  opacity: var(--spine-o, 1);

  box-shadow:
    inset 0 0 0 1px rgba(30, 26, 22, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.5);
  border-radius: 2px 0 0 2px;
  overflow: hidden;
}

/* 中间那本书的书脊在封面背后，不接收鼠标 */
.book-slot.is-center .box-spine {
  pointer-events: none;
}

/* 硬壳书的"书槽"：靠近封面和封底各压一道细凹痕，再加上下两端的收边，
   这是书脊立体感最关键的两个细节 */
.box-spine::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 19;
  pointer-events: none;
  background:
    linear-gradient(90deg,
      transparent 0 9%,
      rgba(0, 0, 0, 0.20) 9% 11%,
      rgba(255, 255, 255, 0.55) 11% 13%,
      transparent 13% 87%,
      rgba(0, 0, 0, 0.20) 87% 89%,
      rgba(255, 255, 255, 0.55) 89% 91%,
      transparent 91%),
    linear-gradient(180deg,
      rgba(0, 0, 0, 0.18) 0%,
      transparent 2.5%,
      transparent 97.5%,
      rgba(0, 0, 0, 0.18) 100%);
}

.box-spine::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 20;
  pointer-events: none;
  background: linear-gradient(90deg,
      rgba(0, 0, 0, 0.20) 0%,
      rgba(0, 0, 0, 0.06) 9%,
      rgba(255, 255, 255, 0.18) 24%,
      rgba(255, 255, 255, 0.04) 42%,
      rgba(0, 0, 0, 0.03) 66%,
      rgba(0, 0, 0, 0.12) 88%,
      rgba(0, 0, 0, 0.22) 100%);
}

/*  封底  */
.box-back {
  position: absolute;
  inset: 0;
  background-color: var(--theme-color, #F4F2ED);
  background-image: var(--grain);
  transform: rotateY(180deg);
  backface-visibility: hidden;
  border-radius: 4px 2px 2px 4px;
  box-shadow: inset 0 0 0 1px rgba(30, 26, 22, 0.28);
  overflow: hidden;
}


.box-back::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 20;
  pointer-events: none;
  background: linear-gradient(90deg, rgba(0, 0, 0, 0.08), transparent 14%, transparent 86%, rgba(0, 0, 0, 0.22));
}


.book-hit {
  position: absolute;
  top: -8%;
  bottom: -8%;
  left: -115%;
  right: -5%;
  pointer-events: none;
}

.book-slot.is-open .book-hit {
  pointer-events: auto;
}



/*  竖排书名自适应排版  */
.spine-title-wrap {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

/*  动漫  */
.spine-title-wrap.motif-hand {
  top: 44%;
  bottom: 18%;
}

/* 人物  */
.spine-title-wrap.motif-swing {
  top: 72%;
  bottom: 6%;
}

.spine-title-wrap.motif-swing .spine-title {
  font-size: 16px;
  letter-spacing: 0.22em;
}

/* 风光 */
.spine-title-wrap.motif-lake {
  top: 48%;
  bottom: 16%;
}

/* 水墨 */
.spine-title-wrap.motif-ink {
  top: 14%;
  bottom: 44%;
}

/* 游戏  */
.spine-title-wrap.motif-sword {
  top: 8%;
  bottom: 52%;
}

/* 默认兜底 */
.spine-title-wrap.motif-default {
  top: 20%;
  bottom: 35%;
}

.spine-title {
  writing-mode: vertical-rl;
  text-orientation: upright;
  font-family: "得意黑", "Shippori Mincho", "Noto Serif SC", serif;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.3em;
  color: var(--ink);
  line-height: 1;
}


/* 景深遮罩 */
.spine-shade,
.cover-shade {
  position: absolute;
  inset: 0;
  z-index: 25;
  background: #0E0C0A;
  opacity: var(--shade, 0);
  pointer-events: none;
}

/* 落地阴影 */
.box-shadow {
  position: absolute;
  bottom: -22px;
  left: 50%;
  transform: translateX(-50%);
  width: 88%;
  height: 20px;
  background: radial-gradient(ellipse at center,
      rgba(40, 28, 16, 0.42) 0%,
      rgba(40, 28, 16, 0.16) 45%,
      transparent 72%);
  pointer-events: none;
  transition: transform 0.3s ease;
}

.book-slot.is-center .box-shadow {
  transform: translateX(-50%) scale(1.23, 1.3);
}

/*  翻页书模型本体  */
.book {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
  margin: 0;
}

/*  关键修复 ： 用 visibility 而不是 display:none，换中心时不会触发整棵树重排 */
.book-slot.is-side .book {
  backface-visibility: hidden;
}

.book-slot.is-side .page {
  visibility: hidden;
}

ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.hardcover_front li:first-child {
  background: var(--theme-color, #F4F2ED);
  backface-visibility: hidden;
  position: relative;
  overflow: hidden;
  border-radius: 2px 4px 4px 2px;
  box-shadow: inset 0 0 0 1px rgba(30, 22, 14, 0.35);
}

.cover-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
}

.cover-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background:
    linear-gradient(90deg, rgba(20, 14, 8, 0.22), transparent 10%),
    linear-gradient(0deg, rgba(20, 14, 8, 0.18), transparent 35%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.15), transparent 25%);
}

.hardcover_front li:last-child {
  background: #FAF7F2;
}

.page>li {
  background: linear-gradient(to right, #ded8d0 0%, #fffdf8 100%);
  box-shadow: inset 0px -1px 2px rgba(50, 50, 50, 0.1),
    inset -1px 0px 1px rgba(150, 150, 150, 0.2);
  border-radius: 0px 4px 4px 0px;
}

.hardcover_front,
.hardcover_front li {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

.hardcover_front {
  transform-origin: 0 50%;
  /* 封面在书盒最前 */
  transform: translateZ(var(--depth));
  transition: transform 0.8s cubic-bezier(0.2, 0.8, 0.2, 1), z-index 0.6s;
  z-index: 100;
}

.hardcover_front li:first-child {
  transform: translateZ(2px);
}

.hardcover_front li:last-child {
  transform: rotateY(180deg) translateZ(2px);
}

/*  悬停翻页动效  */
.page,
.page>li {
  position: absolute;
  top: 0;
  left: 0;
  transform-style: preserve-3d;
}

.page {
  width: 100%;
  height: 98%;
  top: 1%;
  left: 3%;
  z-index: 50;
  /* 内页紧贴在封面背后 */
  transform: translateZ(calc(var(--depth) - 6px));
}

.page>li {
  width: 100%;
  height: 100%;
  transform-origin: left center;
  transition-property: transform;
  transition-timing-function: ease;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 8px 6px;
  box-sizing: border-box;
}

.page>li:nth-child(1) {
  transition-duration: 0.6s;
}

.page>li:nth-child(2) {
  transition-duration: 0.6s;
}

.page>li:nth-child(3) {
  transition-duration: 0.4s;
}

.page>li:nth-child(4) {
  transition-duration: 0.5s;
}

.page>li:nth-child(5) {
  transition-duration: 0.6s;
}

.book-slot.is-open .book>.hardcover_front {
  transform: translateZ(var(--depth)) rotateY(-145deg);
  z-index: 0;
}

.book-slot.is-open .book>.page li:nth-child(1) {
  transform: rotateY(-30deg);
  transition-duration: 1.5s;
}

.book-slot.is-open .book>.page li:nth-child(2) {
  transform: rotateY(-35deg);
  transition-duration: 1.8s;
}

.book-slot.is-open .book>.page li:nth-child(3) {
  transform: rotateY(-118deg);
  transition-duration: 1.6s;
}

.book-slot.is-open .book>.page li:nth-child(4) {
  transform: rotateY(-130deg);
  transition-duration: 1.4s;
}

.book-slot.is-open .book>.page li:nth-child(5) {
  transform: rotateY(-140deg);
  transition-duration: 1.2s;
}

.mini-photos-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  height: 100%;
  opacity: 0;
  transition: opacity 0.4s ease;
  pointer-events: none;
}

.book-slot.is-open .mini-photos-wrapper {
  opacity: 1;
  transition-delay: 0.15s;
}

.mini-polaroid {
  width: 118px;
  background: #ffffff;
  padding: 4px 4px 6px 4px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
  border-radius: 3px;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;
}

.mini-polaroid:nth-child(1) {
  transform: rotate(-1.5deg);
}

.mini-polaroid:nth-child(2) {
  transform: rotate(1.5deg);
}

.mini-img-box {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 2px;
  overflow: hidden;
  background: #edeae3;
}

.mini-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.mini-title {
  font-size: 8px;
  color: #555;
  margin-top: 3px;
  line-height: 1.1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 102px;
}

.vertical-title {
  position: absolute;
  top: 26px;
  left: 26px;
  z-index: 10;
  display: flex;
  gap: 4px;
  pointer-events: none;
}

.title-column {
  display: inline-block;
  writing-mode: vertical-rl;
  text-orientation: upright;
  font-family: "得意黑", "Shippori Mincho", "Noto Serif SC", serif;
  font-size: 19px;
  font-weight: 700;
  letter-spacing: 4px;
  color: #2D2721;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.6);
}

/*  底部信息栏与控制器  */
.shelf-controls {
  position: absolute;
  bottom: 46px;
  display: flex;
  align-items: center;
  gap: 36px;
  z-index: 30;
  pointer-events: auto;
}

.vasari-arrow {
  background: transparent;
  border: none;
  cursor: pointer;
  color: #1F3FB0;
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.25s ease;
  opacity: 0.85;
}

.vasari-arrow:hover {
  opacity: 1;
  transform: scale(1.18);
}

.vasari-arrow:active {
  transform: scale(0.92);
}

.active-album-meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  cursor: pointer;
  transition: transform 0.25s ease;
}

.active-album-meta:hover {
  transform: translateY(-2px);
}


.meta-title {
  font-family: "得意黑", "Shippori Mincho", "Noto Serif SC", serif;
  font-size: 32px;
  font-weight: 700;
  color: #0F64B5;
  margin: 3px 0;
  letter-spacing: 0.08em;
  line-height: 1.1;
}

.active-album-meta:hover .meta-title {
  color: #0B4F8F;
}

.meta-num {
  font-family: "得意黑", "Shippori Mincho", "Noto Serif SC", serif;
  font-size: 12px;
  font-weight: 400;
  color: rgba(30, 51, 70, 0.62);
  margin: 0;
  letter-spacing: 0.18em;
  line-height: 1;
}

.vasari-arrow {
  background: transparent;
  border: none;
  cursor: pointer;
  color: rgba(30, 51, 70, 0.85);
  width: 44px;    /* 默认蓝墨 */
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    color 0.25s ease,
    transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.vasari-arrow:hover {
  color: #0F64B5;
  /* 悬停亮蓝 */
  transform: scale(1.18);
}

.vasari-arrow:active {
  transform: scale(0.92);
}

/* 键盘焦点环 */
.vasari-arrow:focus-visible,
.active-album-meta:focus-visible {
  outline: 2px solid #0F64B5;
  outline-offset: 3px;
  border-radius: 6px;
}

@media (max-width: 768px) {
  .vasari-shelf-container {
    perspective-origin: 50% 45%;
  }

  .book-box {
    top: -120px;
    left: -74px;
    width: 148px;
    height: 240px;
    --depth: 32px;
  }

  .spine-title {
    font-size: 13px;
    letter-spacing: 0.18em;
  }

  .spine-title-wrap.motif-swing .spine-title {
    font-size: 12px;
    letter-spacing: 0.15em;
  }

  .vertical-title {
    top: 16px;
    left: 16px;
  }

  .title-column {
    font-size: 15px;
    letter-spacing: 3px;
  }

  .mini-polaroid {
    width: 88px;
  }

  .shelf-controls {
    bottom: 26px;
    gap: 16px;
  }

  .meta-title {
    font-size: 24px;
  }
}
</style>