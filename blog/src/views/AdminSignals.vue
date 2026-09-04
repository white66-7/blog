<!-- src/modules/bloghome/views/AdminSignals.vue -->
<template>
  <div class="admin-wrapper">
    <div v-if="!isLogin" class="auth-card">
      <div class="auth-header">
        <h3>管理后台验证</h3>
        <p class="auth-sub">输入密码进行身份核验</p>
      </div>

      <form class="auth-form" @submit.prevent="handleLogin">
        <input 
          v-model="adminKey" 
          type="password" 
          placeholder="请输入管理密钥..."
          class="clean-input"
          autofocus
          required
        />
        
        <span v-if="errorTip" class="error-tip">{{ errorTip }}</span>

        <button type="submit" class="submit-btn" :disabled="isLoading">
          {{ isLoading ? '验证中...' : '进入后台 ↗' }}
        </button>
      </form>
    </div>

    <!-- 2. 已验证：极简审核操作台 -->
    <div v-else class="console-box">
      <!-- 顶栏控制条 -->
      <div class="top-bar">
        <div class="title-group">
          <h2>待审核留言</h2>
          <span class="count-badge">{{ list.length }}</span>
        </div>

        <div class="top-actions">
          <button class="icon-btn" @click="fetchList" :disabled="isLoading" title="刷新列表">
            {{ isLoading ? '...' : '刷新 ⟳' }}
          </button>
          <button class="icon-btn logout" @click="handleLogout" title="退出管理">
            退出
          </button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="list.length === 0 && !isLoading" class="empty-state">
        <span class="empty-icon">✓</span>
        <p>暂无待审核项</p>
      </div>

      <!-- 留言列表 -->
      <TransitionGroup name="item-fade" tag="div" class="signal-list">
        <div v-for="item in list" :key="item._id" class="signal-card">
          <div class="card-main">
            <div class="meta-line">
              <span class="sender-name">{{ item.source }}</span>
              <span class="meta-divider">/</span>
              <span class="meta-text">{{ item.date }}</span>
              <span v-if="item.clientIp" class="meta-ip">IP: {{ item.clientIp }}</span>
              <span v-if="item.freq" class="meta-freq">{{ item.freq }}</span>
            </div>
            
            <p class="message-content smiley-font">{{ item.message }}</p>
          </div>

          <!-- 操作按钮区 -->
          <div class="card-actions">
            <button 
              class="action-btn approve" 
              @click="review(item._id, 'approved')"
              :disabled="actionLoadingId === item._id"
            >
              通过
            </button>
            <button 
              class="action-btn reject" 
              @click="review(item._id, 'rejected')"
              :disabled="actionLoadingId === item._id"
            >
              拒绝
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const adminKey = ref(localStorage.getItem('ADMIN_KEY') || '')
const isLogin = ref(false)
const isLoading = ref(false)
const errorTip = ref('')
const list = ref([])
const actionLoadingId = ref('')

// 登录验证：只有接口 100% 成功返回才允许进入
const handleLogin = async () => {
  const key = adminKey.value.trim()
  if (!key) {
    errorTip.value = '请输入密钥'
    return
  }

  isLoading.value = true
  errorTip.value = ''

  try {
    const res = await fetch('/api/signals', {
      headers: { 'x-admin-token': key }
    })
    const data = await res.json()

    if (res.ok && data.success) {
      // 密码正确：保存至本地并放行
      localStorage.setItem('ADMIN_KEY', key)
      list.value = data.data || []
      isLogin.value = true
    } else {
      // 密码错误：坚决不放行！
      errorTip.value = data.error || '密钥核验失败'
      localStorage.removeItem('ADMIN_KEY')
      isLogin.value = false
    }
  } catch (e) {
    errorTip.value = '网络连接异常，请稍后再试'
    isLogin.value = false
  } finally {
    isLoading.value = false
  }
}

// 刷新列表
const fetchList = async () => {
  if (!adminKey.value) return
  isLoading.value = true
  try {
    const res = await fetch('/api/signals', {
      headers: { 'x-admin-token': adminKey.value }
    })
    const data = await res.json()
    if (res.ok && data.success) {
      list.value = data.data || []
    } else {
      handleLogout()
    }
  } catch (e) {
    // 静默失败
  } finally {
    isLoading.value = false
  }
}

// 审核操作 (通过 / 拒绝)
const review = async (id, status) => {
  actionLoadingId.value = id
  try {
    const res = await fetch('/api/signals', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': adminKey.value
      },
      body: JSON.stringify({ id, status })
    })
    const data = await res.json()
    if (data.success) {
      // 成功后从前端列表动画移除
      list.value = list.value.filter(item => item._id !== id)
    } else {
      alert(data.error || '操作失败')
    }
  } catch (e) {
    alert('网络请求失败')
  } finally {
    actionLoadingId.value = ''
  }
}

// 退出管理
const handleLogout = () => {
  localStorage.removeItem('ADMIN_KEY')
  adminKey.value = ''
  isLogin.value = false
  list.value = []
  errorTip.value = ''
}

// 挂载时如果已有 Key，静默尝试自动登录
onMounted(() => {
  if (adminKey.value) {
    handleLogin()
  }
})
</script>

<style scoped>
/* 还原系统鼠标 */
.admin-wrapper,
.admin-wrapper * {
  cursor: auto !important;
}

button {
  cursor: pointer !important;
}

.smiley-font {
  font-family: 'Smiley Sans', 'SmileySans-Oblique', '得意黑', sans-serif;
  letter-spacing: 0.04em;
}

/* 全局容器背景 */
.admin-wrapper {
  min-height: 100vh;
  background-color: #0f1013;
  color: #ededed;
  display: flex;
  justify-content: center;
  padding: 60px 20px;
  box-sizing: border-box;
}

/* ================= 1. 登录卡片 ================= */
.auth-card {
  width: 100%;
  max-width: 320px;
  margin-top: 80px;
  background: #141518;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  padding: 24px;
  box-shadow: 0 24px 48px -12px rgba(0, 0, 0, 0.8);
  height: fit-content;
}

.auth-header h3 {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 6px 0;
  color: #fff;
}

.auth-sub {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.35);
  margin: 0 0 18px 0;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.clean-input {
  width: 100%;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 9px 12px;
  color: #fff;
  font-size: 13px;
  outline: none;
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.clean-input:focus {
  border-color: rgba(255, 255, 255, 0.35);
}

.error-tip {
  font-size: 11px;
  color: #ff6b6b;
  line-height: 1.4;
}

.submit-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
  padding: 8px;
  border-radius: 6px;
  font-size: 12px;
  transition: all 0.2s;
}

.submit-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.16);
  border-color: rgba(255, 255, 255, 0.3);
}

/* ================= 2. 审核工作台 ================= */
.console-box {
  width: 100%;
  max-width: 580px;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.title-group {
  display: flex;
  align-items: center;
  gap: 10px;
}

.title-group h2 {
  font-size: 18px;
  font-weight: 500;
  margin: 0;
  letter-spacing: 0.5px;
}

.count-badge {
  font-size: 11px;
  font-family: monospace;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.6);
  padding: 2px 8px;
  border-radius: 12px;
}

.top-actions {
  display: flex;
  gap: 8px;
}

.icon-btn {
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.6);
  font-size: 11px;
  padding: 5px 12px;
  border-radius: 5px;
  transition: all 0.15s;
}

.icon-btn:hover {
  color: #fff;
  border-color: rgba(255, 255, 255, 0.3);
  background: rgba(255, 255, 255, 0.04);
}

.icon-btn.logout:hover {
  color: #ff7878;
  border-color: rgba(255, 120, 120, 0.3);
}

/* 列表卡片 */
.signal-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.signal-card {
  background: #141518;
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  transition: border-color 0.2s;
}

.signal-card:hover {
  border-color: rgba(255, 255, 255, 0.15);
}

.card-main {
  flex: 1;
  min-width: 0;
}

.meta-line {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.35);
  margin-bottom: 6px;
}

.sender-name {
  color: rgba(255, 255, 255, 0.85);
  font-weight: 500;
}

.meta-divider {
  color: rgba(255, 255, 255, 0.15);
}

.meta-ip, .meta-freq {
  font-family: monospace;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.25);
}

.message-content {
  margin: 0;
  font-size: 16px;
  color: #ffffff;
  line-height: 1.35;
  word-break: break-word;
}

/* 操作按钮 */
.card-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}

.action-btn {
  background: transparent;
  padding: 5px 12px;
  font-size: 11px;
  border-radius: 4px;
  border: 1px solid transparent;
  transition: all 0.15s ease;
}

.action-btn.approve {
  border-color: rgba(126, 241, 178, 0.2);
  color: #7ef1b2;
}

.action-btn.approve:hover:not(:disabled) {
  background: rgba(126, 241, 178, 0.12);
  border-color: #7ef1b2;
}

.action-btn.reject {
  border-color: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.4);
}

.action-btn.reject:hover:not(:disabled) {
  border-color: rgba(255, 107, 107, 0.4);
  color: #ff6b6b;
  background: rgba(255, 107, 107, 0.08);
}

.action-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed !important;
}

/* 空状态提示 */
.empty-state {
  text-align: center;
  padding: 60px 0;
  color: rgba(255, 255, 255, 0.25);
  font-size: 12px;
}

.empty-icon {
  display: inline-block;
  font-size: 20px;
  margin-bottom: 8px;
  color: rgba(255, 255, 255, 0.15);
}

/* 列表项移除动画 */
.item-fade-leave-active {
  transition: all 0.25s ease;
}

.item-fade-leave-to {
  opacity: 0;
  transform: translateX(12px);
}
</style>