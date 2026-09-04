<!-- src/modules/bloghome/components/about/CosmicSignalTerminal.vue -->
<template>
  <Teleport to="body">
    <!-- 1. 独立遮罩背景：柔和淡入淡出，不随弹窗缩放抖动 -->
    <Transition name="backdrop-fade">
      <div 
        v-if="modelValue" 
        class="terminal-backdrop" 
        @click="handleClose"
      ></div>
    </Transition>

    <!-- 2. 弹窗主体：与发送弹窗完全一致的 animate__bounceIn 弹跳与 animate__fadeOut 淡出 -->
    <Transition
      enter-active-class="animate__animated animate__bounceIn"
      leave-active-class="animate__animated animate__fadeOut"
    >
      <div 
        v-if="modelValue" 
        class="terminal-wrapper"
        @click.self="handleClose"
      >
        <!-- 全息浮空微窗 -->
        <div class="hud-widget">
          <!-- 顶部柔和星芒光晕 -->
          <div class="ambient-glow-top"></div>

          <!-- 顶栏：数字频段 + 关闭按钮 -->
          <div class="hud-header">
            <div class="signal-tag">
              <span class="pulse-beacon"></span>
              <span class="tech-num freq-value">{{ signalData?.freq || '0000.000MHz' }}</span>
            </div>

            <button class="hud-close-btn" @click="handleClose" title="关闭 (ESC)">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- 主体：得意黑正文 (Smiley Sans) -->
          <div class="hud-body">
            <p class="message-text smiley-font">{{ signalData?.message }}</p>
          </div>

          <!-- 底部：发信人与时间戳 -->
          <div class="hud-footer">
            <div class="sender-info">
              <span class="sender-icon">◇</span>
              <span class="sender-name smiley-font">{{ signalData?.source }}</span>
            </div>
            <div class="tech-num timestamp">{{ signalData?.date }}</div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  signalData: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue'])

const handleClose = () => {
  emit('update:modelValue', false)
}

const onKeyDown = (e) => {
  if (e.key === 'Escape' && props.modelValue) {
    handleClose()
  }
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>

<style scoped>
/* 还原原生光标，修复主页 cursor: none 带来的指针丢失 */
.terminal-wrapper,
.terminal-wrapper * {
  cursor: auto !important;
}

.hud-close-btn {
  cursor: pointer !important;
}

.smiley-font {
  font-family: 'Smiley Sans', 'SmileySans-Oblique', '得意黑', sans-serif;
  letter-spacing: 0.08em;
}

/* 科技感等宽数字 */
.tech-num {
  font-family: 'Orbitron', monospace;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.08em;
}

/* ================= 动画提速（与发送弹窗保持同款爽快节奏） ================= */
.animate__bounceIn {
  --animate-duration: 0.38s !important;
  animation-duration: 0.38s !important;
}

.animate__fadeOut {
  --animate-duration: 0.22s !important;
  animation-duration: 0.22s !important;
}

/* 独立半透明遮罩 */
.terminal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 99998;
  background: rgba(4, 5, 8, 0.65);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.backdrop-fade-enter-active,
.backdrop-fade-leave-active {
  transition: opacity 0.22s ease;
}
.backdrop-fade-enter-from,
.backdrop-fade-leave-to {
  opacity: 0;
}

/* 弹窗浮动居中容器 */
.terminal-wrapper {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  pointer-events: auto;
}

/* 全息浮空微窗主体 */
.hud-widget {
  --cyan-mint: #7ef1b2;

  position: relative;
  width: 100%;
  max-width: 310px;
  background: radial-gradient(100% 100% at 50% 0%, rgba(22, 25, 34, 0.9) 0%, rgba(12, 13, 18, 0.95) 100%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  box-shadow: 
    0 24px 48px -12px rgba(0, 0, 0, 0.8),
    0 0 30px -5px rgba(126, 241, 178, 0.08);
  padding: 1rem 1.35rem 0.95rem;
  box-sizing: border-box;
  overflow: hidden;
}

/* 顶部微光线 */
.ambient-glow-top {
  position: absolute;
  top: 0;
  left: 20%;
  right: 20%;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(126, 241, 178, 0.45), transparent);
  filter: blur(0.5px);
}

/* 顶栏 */
.hud-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.signal-tag {
  display: flex;
  align-items: center;
  gap: 7px;
}

.pulse-beacon {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--cyan-mint);
  box-shadow: 0 0 6px var(--cyan-mint);
  animation: pulse-ring 2.4s infinite ease-in-out;
}

@keyframes pulse-ring {
  0%, 100% { opacity: 0.35; transform: scale(0.9); }
  50% { opacity: 1; transform: scale(1.2); }
}

.freq-value {
  font-size: 0.75rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.92);
}

/* 关闭按钮及按压反馈 */
.hud-close-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.35);
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  transition: all 0.15s ease;
}

.hud-close-btn:hover {
  color: var(--cyan-mint);
  transform: scale(1.15);
}

.hud-close-btn:active {
  transform: scale(0.88);
}

/* 主体文字 */
.hud-body {
  padding: 1.15rem 0 1.25rem;
}

.message-text {
  margin: 0;
  font-size: 1.65rem;
  line-height: 1.25;
  color: #ffffff;
  text-shadow: 0 0 16px rgba(126, 241, 178, 0.3);
  word-break: break-word;
}

/* 底部信息 */
.hud-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sender-info {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sender-icon {
  color: var(--cyan-mint);
  font-size: 0.55rem;
  opacity: 0.75;
}

.sender-name {
  font-size: 0.88rem;
  color: rgba(255, 255, 255, 0.85);
}

.timestamp {
  font-size: 0.72rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.4);
}
</style>