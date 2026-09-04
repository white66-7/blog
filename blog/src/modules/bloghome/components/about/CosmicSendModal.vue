<!-- src/modules/bloghome/components/about/CosmicSendModal.vue -->
<template>
  <Teleport to="body">
    <!-- 1. 独立暗黑遮罩：平滑淡入淡出，不随弹窗卡片缩放晃动 -->
    <Transition name="backdrop-fade">
      <div 
        v-if="modelValue" 
        class="modal-backdrop" 
        @click="handleClose"
      ></div>
    </Transition>

    <!-- 2. 弹窗主体：进入采用 animate__bounceIn，退出采用 animate__fadeOut -->
    <Transition
      enter-active-class="animate__animated animate__bounceIn"
      leave-active-class="animate__animated animate__fadeOut"
    >
      <div 
        v-if="modelValue" 
        class="modal-wrapper"
        @click.self="handleClose"
      >
        <div class="modal-card">
          <!-- 顶栏 -->
          <div class="modal-header">
            <span class="modal-title">留言</span>
            <button class="close-btn" @click="handleClose" title="关闭 (ESC)">
              <svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="1.8" fill="none">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- 表单主体 -->
          <form class="modal-form" @submit.prevent="submitSignal">
            <input 
              ref="sourceInputRef"
              v-model="form.source" 
              type="text" 
              placeholder="你的昵称" 
              maxlength="12"
              class="clean-input"
              autocomplete="off"
              required
            />

            <div class="textarea-wrapper">
              <textarea 
                v-model="form.message" 
                rows="3" 
                placeholder="留下一句想说的话..." 
                maxlength="40"
                class="clean-textarea smiley-font"
                required
              ></textarea>
              <span class="word-counter">{{ form.message.length }}/40</span>
            </div>

            <!-- 底栏 -->
            <div class="modal-footer">
              <span class="status-tip" :class="{ error: isError }">{{ tipText }}</span>
              <button type="submit" class="submit-btn" :disabled="isSubmitting">
                {{ isSubmitting ? '提交中...' : '发送' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, reactive, watch, nextTick, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue'])

const sourceInputRef = ref(null)
const isSubmitting = ref(false)
const isError = ref(false)
const tipText = ref('留言审核后可见')

const form = reactive({
  source: '',
  message: ''
})

// 打开弹窗自动聚焦输入框，提升操作灵敏度
watch(() => props.modelValue, (val) => {
  if (val) {
    nextTick(() => {
      sourceInputRef.value?.focus()
    })
  }
})

const handleClose = () => {
  emit('update:modelValue', false)
}

const onKeyDown = (e) => {
  if (e.key === 'Escape' && props.modelValue) handleClose()
}

const submitSignal = async () => {
  if (isSubmitting.value) return
  isSubmitting.value = true
  isError.value = false
  tipText.value = '提交中...'

  try {
    const res = await fetch('/api/signals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })
    const data = await res.json()

    if (data.success) {
      // 核心改动：立即关闭弹窗，零延迟秒关
      handleClose()

      // 退出动画（约250ms）结束后在幕后静默清空表单
      setTimeout(() => {
        form.source = ''
        form.message = ''
        tipText.value = '留言审核后可见'
      }, 300)
    } else {
      isError.value = true
      tipText.value = data.error || '提交失败'
    }
  } catch (err) {
    isError.value = true
    tipText.value = '网络连接失败'
  } finally {
    isSubmitting.value = false
  }
}

onMounted(() => window.addEventListener('keydown', onKeyDown))
onUnmounted(() => window.removeEventListener('keydown', onKeyDown))
</script>

<style scoped>
/* 还原原生光标，防止主页全局 cursor: none 导致输入找不到鼠标 */
.modal-wrapper,
.modal-wrapper * {
  cursor: auto !important;
}

.submit-btn,
.close-btn {
  cursor: pointer !important;
}

.clean-input,
.clean-textarea {
  cursor: text !important;
}

.smiley-font {
  font-family: 'Smiley Sans', 'SmileySans-Oblique', '得意黑', sans-serif;
  letter-spacing: 0.04em;
}

/* ================= 解决迟钝的关键：动画提速 ================= */
/* 覆盖 Animate.css 原本拖泥带水的 1s 默认时长 */
.animate__bounceIn {
  --animate-duration: 0.38s !important;
  animation-duration: 0.38s !important;
}

.animate__fadeOut {
  --animate-duration: 0.22s !important;
  animation-duration: 0.22s !important;
}

/* 独立遮罩层 */
.modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 99998;
  background: rgba(8, 9, 11, 0.68);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.backdrop-fade-enter-active,
.backdrop-fade-leave-active {
  transition: opacity 0.22s ease;
}
.backdrop-fade-enter-from,
.backdrop-fade-leave-to {
  opacity: 0;
}

/* 浮动容器 */
.modal-wrapper {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  pointer-events: auto;
}

/* 卡片主体 */
.modal-card {
  width: 100%;
  max-width: 320px;
  background: #141518;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.7);
  padding: 18px 20px;
  box-sizing: border-box;
}

/* 顶栏 */
.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.modal-title {
  font-size: 14px;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
}

.close-btn {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.3);
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s ease, transform 0.1s ease;
}

.close-btn:hover {
  color: rgba(255, 255, 255, 0.85);
}

.close-btn:active {
  transform: scale(0.88);
}

/* 表单输入 */
.modal-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.clean-input,
.clean-textarea {
  width: 100%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  padding: 8px 11px;
  color: #ffffff;
  font-size: 13px;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.15s, background 0.15s;
}

.clean-input::placeholder,
.clean-textarea::placeholder {
  color: rgba(255, 255, 255, 0.25);
  font-size: 12px;
}

.clean-input:focus,
.clean-textarea:focus {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.35);
}

.textarea-wrapper {
  position: relative;
}

.clean-textarea {
  resize: none;
  padding-bottom: 22px;
  font-size: 14px;
}

.word-counter {
  position: absolute;
  right: 8px;
  bottom: 6px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.25);
  font-family: ui-monospace, SFMono-Regular, monospace;
  pointer-events: none;
}

/* 底栏 */
.modal-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
}

.status-tip {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.3);
}

.status-tip.error {
  color: #ff6b6b;
}

/* 提交按钮 */
.submit-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.85);
  padding: 5px 14px;
  border-radius: 5px;
  font-size: 12px;
  outline: none;
  transition: all 0.15s ease;
}

.submit-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.5);
  color: #ffffff;
}

.submit-btn:active:not(:disabled) {
  transform: scale(0.93);
}

.submit-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed !important;
}
</style>