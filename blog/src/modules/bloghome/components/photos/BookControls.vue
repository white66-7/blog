<template>
  <div class="controls-bar">
    <!-- 上一页按钮 -->
    <button 
      class="ctrl-btn" 
      :class="{ 'disabled': activeIndex === 0 || isAnimating }" 
      :disabled="activeIndex === 0 || isAnimating"
      @click.stop="$emit('prev')"
      aria-label="Previous Page"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="15 18 9 12 15 6"></polyline>
      </svg>
    </button>

    <!-- 进度圆点 -->
    <div class="dots-wrapper">
      <div
        v-for="(_, i) in (maxPages + 1)"
        :key="i"
        class="dot-indicator"
        :class="{ 'active': activeIndex === i }"
        @click.stop="$emit('go-to', i)"
      ></div>
    </div>

    <!-- 下一页按钮 -->
    <button 
      class="ctrl-btn" 
      :class="{ 'disabled': activeIndex >= maxPages || isAnimating }" 
      :disabled="activeIndex >= maxPages || isAnimating"
      @click.stop="$emit('next')"
      aria-label="Next Page"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6"></polyline>
      </svg>
    </button>
  </div>
</template>

<script setup>
defineProps({
  activeIndex: { type: Number, required: true },
  maxPages: { type: Number, required: true },
  isAnimating: { type: Boolean, default: false }
})

defineEmits(['prev', 'next', 'go-to'])
</script>

<style scoped>
.controls-bar {
  position: fixed;
  bottom: 28px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 8px 18px;
  background-color: rgba(255, 252, 243, 0.82);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(220, 210, 190, 0.85);
  border-radius: 9999px;
  box-shadow: 
    0 10px 30px -4px rgba(0, 0, 0, 0.12),
    0 4px 12px -2px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  z-index: 100;
  user-select: none;
  transition: all 0.3s ease;
}

.controls-bar:hover {
  background-color: rgba(255, 253, 246, 0.95);
  box-shadow: 
    0 14px 36px -4px rgba(0, 0, 0, 0.16),
    0 6px 16px -2px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.ctrl-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: #4a453e;
  cursor: pointer;
  padding: 0;
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.ctrl-btn svg {
  width: 24px;
  height: 24px;
  transition: transform 0.2s ease;
}

.ctrl-btn:hover:not(.disabled) {
  background-color: rgba(0, 0, 0, 0.06);
  color: #1a1a1a;
  transform: scale(1.12);
}

.ctrl-btn:active:not(.disabled) {
  transform: scale(0.92);
}

.ctrl-btn.disabled {
  opacity: 0.2;
  cursor: not-allowed;
  transform: none;
}

.dots-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 90px;
  padding: 0 6px;
  height: 30px;
}

.dot-indicator {
  position: relative;
  height: 8px;
  width: 8px;
  border-radius: 9999px;
  background-color: rgba(74, 69, 62, 0.28);
  cursor: pointer;
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dot-indicator::after {
  content: '';
  position: absolute;
  top: -8px;
  bottom: -8px;
  left: -4px;
  right: -4px;
}

.dot-indicator:hover:not(.active) {
  background-color: rgba(74, 69, 62, 0.7);
  transform: scale(1.4);
  box-shadow: 0 0 8px rgba(74, 69, 62, 0.35);
}

.dot-indicator.active {
  width: 28px;
  background-color: #38322a;
  box-shadow: 0 2px 6px rgba(56, 50, 42, 0.25);
}

.dot-indicator.active:hover {
  transform: scale(1.06);
  background-color: #1a1815;
}

@media (max-width: 768px) {
  .controls-bar {
    bottom: 20px;
    padding: 6px 14px;
    gap: 10px;
  }
  .ctrl-btn {
    width: 36px;
    height: 36px;
  }
  .ctrl-btn svg {
    width: 20px;
    height: 20px;
  }
  .dot-indicator.active {
    width: 20px;
  }
}
</style>