<!-- src/modules/bloghome/views/AdminSignals.vue -->
<template>
  <div class="admin-container">
    <div class="admin-card">
      <div class="header">
        <h2>留言审核后台</h2>
        <button v-if="isLogin" class="btn-refresh" @click="fetchList">刷新 ⟳</button>
      </div>

      <!-- 1. 未登录：输入管理员密钥 -->
      <div v-if="!isLogin" class="login-box">
        <input 
          v-model="adminKey" 
          type="password" 
          placeholder="请输入管理员密钥 (ADMIN_SECRET)"
          class="key-input"
          @keyup.enter="handleLogin"
        />
        <button class="btn-primary" @click="handleLogin">进入后台</button>
      </div>

      <!-- 2. 已登录：待审核列表 -->
      <div v-else class="list-box">
        <div v-if="list.length === 0" class="empty-tip">
          暂无待审核留言 (当前全网一片祥和)
        </div>

        <div v-for="item in list" :key="item._id" class="signal-item">
          <div class="info">
            <div class="item-meta">
              <span class="name">{{ item.source }}</span>
              <span class="time">{{ item.date }}</span>
              <span class="ip" v-if="item.clientIp">({{ item.clientIp }})</span>
            </div>
            <div class="message">{{ item.message }}</div>
          </div>

          <div class="actions">
            <button class="btn-approve" @click="review(item._id, 'approved')">通过</button>
            <button class="btn-reject" @click="review(item._id, 'rejected')">拒绝</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const adminKey = ref(localStorage.getItem('ADMIN_KEY') || '')
const isLogin = ref(false)
const list = ref([])

const handleLogin = () => {
  if (!adminKey.value.trim()) return alert('请输入密钥')
  localStorage.setItem('ADMIN_KEY', adminKey.value)
  isLogin.value = true
  fetchList()
}

const fetchList = async () => {
  try {
    const res = await fetch('/api/signals', {
      headers: { 'x-admin-token': adminKey.value }
    })
    const data = await res.json()
    if (data.success) {
      list.value = data.data
    } else {
      alert('获取失败，可能是密钥错误')
      isLogin.value = false
    }
  } catch (e) {
    alert('网络异常')
  }
}

const review = async (id, status) => {
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
      // 审核成功，直接从当前列表中移除该条
      list.value = list.value.filter(item => item._id !== id)
    } else {
      alert(data.error || '操作失败')
    }
  } catch (e) {
    alert('请求失败')
  }
}

onMounted(() => {
  if (adminKey.value) {
    isLogin.value = true
    fetchList()
  }
})
</script>

<style scoped>
.admin-container {
  min-height: 100vh;
  background: #101114;
  color: #fff;
  display: flex;
  justify-content: center;
  padding: 40px 16px;
  box-sizing: border-box;
}

.admin-card {
  width: 100%;
  max-width: 650px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.header h2 {
  font-size: 20px;
  margin: 0;
}

.login-box {
  display: flex;
  gap: 12px;
}

.key-input {
  flex: 1;
  background: #191a1f;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 10px 14px;
  color: #fff;
  border-radius: 6px;
  outline: none;
}

.list-box {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.signal-item {
  background: #18191e;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 14px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.item-meta {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
  margin-bottom: 6px;
}

.name {
  color: #7ef1b2;
  font-weight: 600;
  margin-right: 8px;
}

.message {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.9);
}

.actions {
  display: flex;
  gap: 8px;
}

button {
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  border: none;
  transition: opacity 0.2s;
}

button:hover {
  opacity: 0.85;
}

.btn-primary { background: #3b82f6; color: #fff; }
.btn-refresh { background: #26272e; color: #ccc; }
.btn-approve { background: #10b981; color: #fff; }
.btn-reject { background: #ef4444; color: #fff; }
.empty-tip { text-align: center; color: rgba(255, 255, 255, 0.3); padding: 40px 0; }
</style>