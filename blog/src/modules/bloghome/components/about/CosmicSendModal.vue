<!-- src/modules/bloghome/components/about/CosmicSendModal.vue -->
<template>
  <Teleport to="body">
    <Transition name="modal-fade">
      <div 
        v-if="modelValue" 
        class="modal-overlay"
        @click.self="handleClose"
      >
        <div class="modal-card">
          <!-- 极简顶栏 -->
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
import { ref, reactive, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false }
})
const emit = defineEmits(['update:modelValue'])

const isSubmitting = ref(false)
const isError = ref(false)
const tipText = ref('留言审核后可见')

const form = reactive({
  source: '',
  message: ''
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
      tipText.value = '留言成功'
      setTimeout(() => {
        form.source = ''
        form.message = ''
        tipText.value = '留言审核后可见'
        handleClose()
      }, 1000)
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
/* 还原原生鼠标，确保输入体验 */
.modal-overlay,
.modal-overlay * {
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

/* 遮罩背景 */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: rgba(8, 9, 11, 0.65);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

/* 极简卡片容器 */
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
  padding: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s ease;
}

.close-btn:hover {
  color: rgba(255, 255, 255, 0.85);
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
  transition: border-color 0.2s, background 0.2s;
}

.clean-input::placeholder,
.clean-textarea::placeholder {
  color: rgba(255, 255, 255, 0.25);
  font-size: 12px;
}

.clean-input:focus,
.clean-textarea:focus {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.3);
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

/* 按钮样式（与页面的极简线框风统一） */
.submit-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.85);
  padding: 5px 14px;
  border-radius: 5px;
  font-size: 12px;
  outline: none;
  transition: all 0.2s ease;
}

.submit-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.5);
  color: #ffffff;
}

.submit-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed !important;
}

/* 动效 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}

.modal-fade-enter-from .modal-card {
  transform: scale(0.97) translateY(4px);
}

.modal-fade-leave-to .modal-card {
  transform: scale(0.98);
}
</style>