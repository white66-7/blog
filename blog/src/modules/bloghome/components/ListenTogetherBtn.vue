<template>
  <div class="listen-together-wrapper">
    <!-- 导航栏上的主按钮 -->
    <button class="listen-btn" @click="handleClick">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 36 36"
        width="36px"
        height="36px"
      >
        <rect width="36" height="36" x="0" y="0" fill="#fdd835"></rect>
        <path
          fill="#e53935"
          d="M38.67,42H11.52C11.27,40.62,11,38.57,11,36c0-5,0-11,0-11s1.44-7.39,3.22-9.59 c1.67-2.06,2.76-3.48,6.78-4.41c3-0.7,7.13-0.23,9,1c2.15,1.42,3.37,6.67,3.81,11.29c1.49-0.3,5.21,0.2,5.5,1.28 C40.89,30.29,39.48,38.31,38.67,42z"
        ></path>
        <path
          fill="#b71c1c"
          d="M39.02,42H11.99c-0.22-2.67-0.48-7.05-0.49-12.72c0.83,4.18,1.63,9.59,6.98,9.79 c3.48,0.12,8.27,0.55,9.83-2.45c1.57-3,3.72-8.95,3.51-15.62c-0.19-5.84-1.75-8.2-2.13-8.7c0.59,0.66,3.74,4.49,4.01,11.7 c0.03,0.83,0.06,1.72,0.08,2.66c4.21-0.15,5.93,1.5,6.07,2.35C40.68,33.85,39.8,38.9,39.02,42z"
        ></path>
        <path
          fill="#212121"
          d="M35,27.17c0,3.67-0.28,11.2-0.42,14.83h-2C32.72,38.42,33,30.83,33,27.17 c0-5.54-1.46-12.65-3.55-14.02c-1.65-1.08-5.49-1.48-8.23-0.85c-3.62,0.83-4.57,1.99-6.14,3.92L15,16.32 c-1.31,1.6-2.59,6.92-3,8.96v10.8c0,2.58,0.28,4.61,0.54,5.92H10.5c-0.25-1.41-0.5-3.42-0.5-5.92l0.02-11.09 c0.15-0.77,1.55-7.63,3.43-9.94l0.08-0.09c1.65-2.03,2.96-3.63,7.25-4.61c3.28-0.76,7.67-0.25,9.77,1.13 C33.79,13.6,35,22.23,35,27.17z"
        ></path>
        <path
          fill="#01579b"
          d="M17.165,17.283c5.217-0.055,9.391,0.283,9,6.011c-0.391,5.728-8.478,5.533-9.391,5.337 c-0.913-0.196-7.826-0.043-7.696-5.337C9.209,18,13.645,17.32,17.165,17.283z"
        ></path>
        <path
          fill="#212121"
          d="M40.739,37.38c-0.28,1.99-0.69,3.53-1.22,4.62h-2.43c0.25-0.19,1.13-1.11,1.67-4.9 c0.57-4-0.23-11.79-0.93-12.78c-0.4-0.4-2.63-0.8-4.37-0.89l0.1-1.99c1.04,0.05,4.53,0.31,5.71,1.49 C40.689,24.36,41.289,33.53,40.739,37.38z"
        ></path>
        <path
          fill="#81d4fa"
          d="M10.154,20.201c0.261,2.059-0.196,3.351,2.543,3.546s8.076,1.022,9.402-0.554 c1.326-1.576,1.75-4.365-0.891-5.267C19.336,17.287,12.959,16.251,10.154,20.201z"
        ></path>
        <path
          fill="#212121"
          d="M17.615,29.677c-0.502,0-0.873-0.03-1.052-0.069c-0.086-0.019-0.236-0.035-0.434-0.06 c-5.344-0.679-8.053-2.784-8.052-6.255c0.001-2.698,1.17-7.238,8.986-7.32l0.181-0.002c3.444-0.038,6.414-0.068,8.272,1.818 c1.173,1.191,1.712,3,1.647,5.53c-0.044,1.688-0.785,3.147-2.144,4.217C22.785,29.296,19.388,29.677,17.615,29.677z M17.086,17.973 c-7.006,0.074-7.008,4.023-7.008,5.321c-0.001,3.109,3.598,3.926,6.305,4.27c0.273,0.035,0.48,0.063,0.601,0.089 c0.563,0.101,4.68,0.035,6.855-1.732c0.865-0.702,1.299-1.57,1.326-2.653c0.051-1.958-0.301-3.291-1.073-4.075 c-1.262-1.281-3.834-1.255-6.825-1.222L17.086,17.973z"
        ></path>
        <path
          fill="#e1f5fe"
          d="M15.078,19.043c1.957-0.326,5.122-0.529,4.435,1.304c-0.489,1.304-7.185,2.185-7.185,0.652 C12.328,19.467,15.078,19.043,15.078,19.043z"
        ></path>
      </svg>
      <span class="now">Go!</span>
      <span class="play">一起听</span>
    </button>

    <!-- 弹窗（通过 Teleport 挂载到 body） -->
    <Teleport to="body">
      <Transition name="modal-fade">
        <div v-if="isOpen" class="modal-overlay" @click.self="closeModal">
          <div class="modal-card">
            <!-- 弹窗顶部 -->
            <div class="modal-header">
              <div class="modal-title">
                <span class="modal-dot" :class="{ 'offline': !isListening }"></span>
                <span>{{ isListening ? '一起听音乐' : '当前不在听歌 💤' }}</span>
              </div>
              <button class="modal-close" @click="closeModal" aria-label="关闭">✕</button>
            </div>

            <!-- 弹窗主体 -->
            <div class="modal-body">
              <!-- 加载中 -->
              <div v-if="loading" class="state-container">
                <div class="spinner"></div>
                <p>正在获取音乐状态...</p>
              </div>

              <!-- 接口报错 -->
              <div v-else-if="errorMsg" class="state-container error">
                <p>{{ errorMsg }}</p>
                <button class="retry-btn" @click="fetchMusicState">重新加载</button>
              </div>

              <!-- 正常内容 -->
              <div v-else class="content-container">
                <!-- 状态 1：正在一起听 -->
                <template v-if="isListening">
                  <p class="content-tips">复制后打开网易云 / 汽水音乐等自动识别：</p>
                  <div class="text-box">
                    {{ musicContent }}
                  </div>
                </template>

                <!-- 状态 2：站长未开启或已下线 -->
                <template v-else>
                  <div class="empty-box">
                    <div class="empty-icon">🎧</div>
                    <p class="empty-title">站长暂时没在听歌哦</p>
                    <span class="empty-desc">下次开启一起听时再来玩吧 ~</span>
                  </div>
                </template>
              </div>
            </div>

            <!-- 弹窗底部操作区（仅在有音乐播放时呈现） -->
            <div class="modal-footer" v-if="!loading && !errorMsg && isListening">
              <button
                class="copy-btn"
                :class="{ 'copied': isCopied }"
                @click="copyContent"
              >
                <span>{{ isCopied ? '✓ 已复制到剪贴板' : '一键复制口令' }}</span>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['click'])

// 状态定义
const isOpen = ref(false)
const loading = ref(false)
const isListening = ref(false)
const musicContent = ref('')
const errorMsg = ref('')
const isCopied = ref(false)

// 点击主按钮
const handleClick = (e) => {
  emit('click', e)
  openModal()
}

// 打开弹窗并调接口刷新最新状态
const openModal = () => {
  isOpen.value = true
  fetchMusicState()
}

// 关闭弹窗
const closeModal = () => {
  isOpen.value = false
  isCopied.value = false
}

// 请求 Vercel /api/music 获取当前状态
const fetchMusicState = async () => {
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await fetch('/api/music')
    if (!res.ok) throw new Error('网络请求异常')
    const data = await res.json()

    // 读取后端最新的状态和内容
    isListening.value = Boolean(data.isListening)
    musicContent.value = data.content || ''
  } catch (err) {
    errorMsg.value = '加载失败，请检查网络连接'
  } finally {
    loading.value = false
  }
}

// 一键复制逻辑
const copyContent = async () => {
  if (!musicContent.value) return
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(musicContent.value)
    } else {
      // 兼容不支持 clipboard API 的场景
      const textArea = document.createElement('textarea')
      textArea.value = musicContent.value
      textArea.style.position = 'fixed'
      textArea.style.opacity = '0'
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
    isCopied.value = true
    setTimeout(() => {
      isCopied.value = false
    }, 2200)
  } catch (err) {
    alert('复制失败，请手动长按文本复制')
  }
}
</script>

<style scoped>
.listen-together-wrapper {
  display: inline-flex;
}

/* ===== 按钮本身样式 ===== */
.listen-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 38px;
  padding: 0 14px 0 0;
  color: white;
  text-shadow: 2px 2px rgb(116, 116, 116);
  text-transform: uppercase;
  cursor: pointer;
  border: solid 2px black;
  font-family: '得意黑', sans-serif;
  letter-spacing: 1px;
  font-weight: 600;
  font-size: 15px;
  background-color: hsl(49deg 98% 60%);
  border-radius: 50px;
  position: relative;
  overflow: hidden;
  transition: all 0.5s ease;
  flex-shrink: 0;
  user-select: none;
}

.listen-btn:active {
  transform: scale(0.92);
  transition: all 100ms ease;
}

.listen-btn svg {
  height: 100%;
  width: auto;
  transition: all 0.5s ease;
  z-index: 2;
}

.play {
  transition: all 0.5s ease;
  transition-delay: 300ms;
  white-space: nowrap;
}

.listen-btn:hover svg {
  transform: scale(3) translate(50%);
}

.now {
  position: absolute;
  left: 0;
  transform: translateX(-100%);
  transition: all 0.5s ease;
  z-index: 2;
  white-space: nowrap;
}

.listen-btn:hover .now {
  transform: translateX(12px);
  transition-delay: 300ms;
}

.listen-btn:hover .play {
  transform: translateX(200%);
  transition-delay: 300ms;
}

/* ===== 弹窗遮罩层 ===== */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  padding: 20px;
}

/* ===== 弹窗卡片 ===== */
.modal-card {
  width: 100%;
  max-width: 420px;
  background: #ffffff;
  border: 3px solid #212121;
  border-radius: 20px;
  box-shadow: 6px 6px 0px #212121;
  overflow: hidden;
  font-family: '得意黑', sans-serif;
  animation: popIn 0.28s cubic-bezier(0.18, 0.89, 0.32, 1.28);
}

@keyframes popIn {
  from {
    opacity: 0;
    transform: scale(0.88) translateY(12px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* 顶部栏 */
.modal-header {
  padding: 14px 18px;
  background: #fdfdfd;
  border-bottom: 2.5px solid #212121;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: bold;
  color: #212121;
}

.modal-dot {
  width: 11px;
  height: 11px;
  background-color: #00d26a; /* 默认在线绿灯 */
  border-radius: 50%;
  display: inline-block;
  border: 1.5px solid #212121;
  transition: background-color 0.3s;
}

.modal-dot.offline {
  background-color: #b0b0b0 !important; /* 离线灰灯 */
}

.modal-close {
  background: transparent;
  border: none;
  font-size: 18px;
  font-weight: bold;
  cursor: pointer;
  color: #666;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.modal-close:hover {
  background: #eee;
  color: #000;
}

/* 内容区 */
.modal-body {
  padding: 20px;
}

.content-tips {
  margin: 0 0 10px 0;
  font-size: 13px;
  color: #666;
}

.text-box {
  background: #f7f9fa;
  border: 2px dashed #a0a0a0;
  border-radius: 12px;
  padding: 14px;
  font-size: 14px;
  color: #212121;
  line-height: 1.6;
  max-height: 160px;
  overflow-y: auto;
  word-break: break-all;
  user-select: all;
}

/* 离线空状态展示 */
.empty-box {
  text-align: center;
  padding: 24px 10px;
  color: #666;
}

.empty-icon {
  font-size: 38px;
  margin-bottom: 8px;
}

.empty-title {
  margin: 0;
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.empty-desc {
  display: inline-block;
  margin-top: 6px;
  font-size: 13px;
  color: #999;
}

/* 加载中与错误反馈 */
.state-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 28px 0;
  color: #666;
  font-size: 14px;
}

.spinner {
  width: 28px;
  height: 28px;
  border: 3px solid #eee;
  border-top-color: hsl(49deg 98% 60%);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-bottom: 12px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.state-container.error {
  color: #e53935;
}

.retry-btn {
  margin-top: 10px;
  padding: 5px 14px;
  border: 2px solid #212121;
  background: #fff;
  border-radius: 8px;
  cursor: pointer;
  font-family: inherit;
  font-size: 13px;
  box-shadow: 2px 2px 0px #212121;
}

.retry-btn:active {
  transform: translate(1px, 1px);
  box-shadow: 1px 1px 0px #212121;
}

/* 底部操作区与复制按钮 */
.modal-footer {
  padding: 0 20px 20px 20px;
}

.copy-btn {
  width: 100%;
  height: 44px;
  background-color: hsl(49deg 98% 60%);
  border: 2.5px solid #212121;
  border-radius: 12px;
  box-shadow: 3px 3px 0px #212121;
  font-family: '得意黑', sans-serif;
  font-size: 16px;
  font-weight: bold;
  color: #212121;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.copy-btn:hover {
  transform: translate(-1px, -1px);
  box-shadow: 4px 4px 0px #212121;
}

.copy-btn:active {
  transform: translate(2px, 2px);
  box-shadow: 1px 1px 0px #212121;
}

.copy-btn.copied {
  background-color: #00d26a;
  color: white;
}

/* 弹窗渐隐过渡效果 */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.22s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
</style>