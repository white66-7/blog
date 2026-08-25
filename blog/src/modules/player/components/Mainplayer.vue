<template>
  <div class="main">
    <div class="sys-line">SYNTHWAVE</div>

    <div class="content">
      <div class="left-col">
        <div class="disc-box">
          <img
            class="disc"
            :class="{ spin: !audioStore.paused }"
            :src="audioStore.currentCoverUrl || defaultCover"
            alt="cover"
          />
          <div class="disc-ring"></div>
        </div>
      </div>

      <div class="right-col">
        <LyricView />
      </div>
    </div>

    <div class="bottom-bar">
      <div class="bb-now">
        <div class="bb-name">{{ audioStore.currentSong?.name || 'NO SIGNAL' }}</div>
        <div class="bb-artist">{{ audioStore.currentSong?.artist || 'System Idle' }}</div>
      </div>

      <div class="bb-center">
        <div class="ctrls">
          <button class="cbtn" :class="{ on: audioStore.isShuffle }" @click="audioStore.toggleMode('shuffle')">⇄</button>
          <button class="cbtn" @click="audioStore.prev()">◄◄</button>
          <button class="cbtn" @click="audioStore.togglePlay()">
            <div class="container">
              <svg
                v-if="audioStore.paused"
                class="play"
                xmlns="http://www.w3.org/2000/svg"
                height="1em"
                viewBox="0 0 384 512"
              >
                <path
                  d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80V432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"
                />
              </svg>
              <svg
                v-else
                class="pause"
                xmlns="http://www.w3.org/2000/svg"
                height="1em"
                viewBox="0 0 320 512"
              >
                <path
                  d="M48 64C21.5 64 0 85.5 0 112V400c0 26.5 21.5 48 48 48H80c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H48zm192 0c-26.5 0-48 21.5-48 48V400c0 26.5 21.5 48 48 48h32c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48H240z"
                />
              </svg>
            </div>
          </button>
          <button class="cbtn" @click="audioStore.next()">►►</button>
          <button class="cbtn" :class="{ on: audioStore.isLoop }" @click="audioStore.toggleMode('loop')">↻</button>
        </div>

        <div class="prog">
          <span class="tm">{{ fmt(audioStore.currentTime) }}</span>
          <div
            class="bar-wrap"
            :class="{ dragging }"
            @pointerdown="onSeekStart"
          >
            <div class="bar-fill" :style="{ width: displayPercent + '%' }"></div>
          </div>
          <span class="tm">{{ fmt(audioStore.duration) }}</span>
        </div>
      </div>

      <div class="bb-right">
        <div class="vol">
          <span>◖</span>
          <div class="vbar" @click="onSetVolume">
            <div class="vfill" :style="{ width: audioStore.volume * 100 + '%' }"></div>
          </div>
          <span>◗</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAudioStore } from '@/stores/audioStore'
import defaultCoverImg from '@/assets/music.png'
import LyricView from './LyricView.vue'

const audioStore = useAudioStore()
const defaultCover = defaultCoverImg

function fmt(t: number): string {
  if (!t || isNaN(t)) return '0:00'
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${m}:${s < 10 ? '0' : ''}${s}`
}

// ── 进度条拖动：拖动中只预览，松手才真正 seek，避免音频频繁跳变 ──
const dragging = ref(false)
const dragPercent = ref(0)

const displayPercent = computed(() =>
  dragging.value ? dragPercent.value : audioStore.progressPercent
)

function pctFromEvent(e: PointerEvent, el: HTMLElement): number {
  const rect = el.getBoundingClientRect()
  return Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
}

function onSeekStart(e: PointerEvent) {
  const wrap = e.currentTarget as HTMLElement
  dragPercent.value = pctFromEvent(e, wrap) * 100
  dragging.value = true
  wrap.setPointerCapture(e.pointerId)

  const onMove = (ev: PointerEvent) => {
    dragPercent.value = pctFromEvent(ev, wrap) * 100
  }
  const onUp = () => {
    dragging.value = false
    audioStore.seek(dragPercent.value / 100)
    wrap.removeEventListener('pointermove', onMove)
    wrap.removeEventListener('pointerup', onUp)
    wrap.removeEventListener('pointercancel', onUp)
  }
  wrap.addEventListener('pointermove', onMove)
  wrap.addEventListener('pointerup', onUp)
  wrap.addEventListener('pointercancel', onUp)
}

function onSetVolume(e: MouseEvent) {
  const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
  let vol = (e.clientX - rect.left) / rect.width
  vol = Math.min(1, Math.max(0, vol))
  audioStore.setVolume(vol)
}
</script>

<style scoped>
.main {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 0;
  position: relative;
  background-color: #07070a;
  background-image:
    linear-gradient(to bottom, rgba(7, 7, 10, 0.45), rgba(7, 7, 10, 0.75)),
    url('@/assets/2.gif');
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
  box-shadow: inset 0 0 150px rgba(7, 7, 10, 0.9);
}

.content {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  justify-content: center;
  gap: 56px;
  padding: 30px 56px;
}

.left-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.right-col {
  flex: 1;
  min-width: 0;
  max-width: 520px;
  display: flex;
}

.bottom-bar {
  height: 84px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 0 28px;
  background: rgba(14, 14, 20, 0.88);
  border-top: 1px solid rgba(0, 243, 255, 0.1);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.35);
}

.bb-now {
  width: 200px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.bb-name {
  font-size: .8rem;
  color: #e0e0e8;
  letter-spacing: 1px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bb-artist {
  font-size: .7rem;
  color: #6b6b8a;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.bb-center {
  flex: 1;
  max-width: 620px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.bb-right {
  width: 200px;
  min-width: 0;
  display: flex;
  justify-content: flex-end;
}

.sys-line {
  position: absolute;
  top: 15px;
  right: 10px;
  color: #6b6b8a;
  letter-spacing: 1.5px;
  opacity: .8;
  z-index: 2;
}

.disc-box {
  position: relative;
  width: 300px;
  height: 300px;
}

.disc {
  height: 100%;
  width: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(0, 243, 255, .35);
  box-shadow: 0 0 40px rgba(0, 243, 255, .15), inset 0 0 40px rgba(0, 0, 0, .6);
  animation: spin 24s linear infinite;
}

.disc.spin {
  animation-play-state: running;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.disc-ring {
  position: absolute;
  top: -8px;
  left: -8px;
  right: -8px;
  bottom: -8px;
  border-radius: 50%;
  border: 1px solid rgba(0, 243, 255, .08);
  box-shadow: 0 0 60px rgba(0, 243, 255, .06);
  pointer-events: none;
}

.prog {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
}

.prog .tm {
  font-size: .7rem;
  min-width: 36px;
  text-align: center;
  font-variant-numeric: tabular-nums;
}

.bar-wrap {
  flex: 1;
  background: rgba(255, 255, 255, .06);
  height: 4px;
  border-radius: 2px;
  position: relative;
  cursor: pointer;
  touch-action: none; /* 拖动时禁止触摸滚动，保证手指能平滑拖进度条 */
}
.bar-wrap.dragging {
  cursor: grabbing;
}

.bar-fill {
  height: 100%;
  width: 0%;
  border-radius: 2px;
  position: relative;
  background: linear-gradient(90deg, #00f3ff, #ff00ff);
  box-shadow: 0 0 8px rgba(0, 243, 255, .35);
}

.bar-fill::after {
  content: '';
  position: absolute;
  right: -5px;
  top: -4px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #00f3ff;
  box-shadow: 0 0 10px #00f3ff;
  opacity: 0;
  transition: .2s;
}

.bar-wrap:hover .bar-fill::after,
.bar-wrap.dragging .bar-fill::after {
  opacity: 1;
}

.ctrls {
  display: flex;
  align-items: center;
  gap: 18px;
}

.cbtn {
  background: none;
  border: none;
  color: #6b6b8a;
  cursor: pointer;
  font-size: 1.3rem;
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: .2s;
  font-family: inherit;
}

.cbtn.on {
  color: #00f3ff;
  text-shadow: 0 0 8px rgba(0, 243, 255, .5);
}

/* 底部播放条内：按钮更紧凑 */
.bottom-bar .cbtn {
  width: 42px;
  height: 42px;
  font-size: 1.2rem;
  border-radius: 999px; /* 全圆角：正方形下等价于正圆，改为胶囊形时可直接用此值 */
}

.bottom-bar .container {
  --size: 42px;
}

.container {
  --color: white;
  --size: 45px;
  width: var(--size);
  height: var(--size);
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  cursor: pointer;
  user-select: none;
}

.container .play,
.container .pause {
  position: absolute;
  width: 70%;
  height: auto;
  fill: var(--color);
  animation: keyframes-fill 0.3s;
}

@keyframes keyframes-fill {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.1);
  }
}

.vol {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  max-width: 160px;
}

.vol span {
  font-size: .75rem;
  color: #6b6b8a;
}

.vbar {
  flex: 1;
  height: 3px;
  background: rgba(255, 255, 255, .06);
  cursor: pointer;
  border-radius: 2px;
}

.vfill {
  height: 100%;
  width: 70%;
  background-color: #00f3ff;
  border-radius: 2px;
}
</style>