<template>
  <div class="simple-weather">
    <div class="weather-icon">{{ weatherIcon }}</div>
    <div class="weather-temp">{{ temp }}°C</div>
    <div class="weather-desc">{{ weatherDesc }}</div>
    <div class="weather-date">{{ formattedDate }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const temp = ref('--')
const weatherDesc = ref('加载中...')
const weatherIcon = ref('☁️')
const formattedDate = ref('')

async function fetchWeather() {
  try {
    // 获取地理位置
    const pos = await new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject)
    })
    const lat = pos.coords.latitude
    const lon = pos.coords.longitude
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true&timezone=auto`)
    const data = await res.json()
    const current = data.current_weather
    temp.value = Math.round(current.temperature)
    const code = current.weathercode
    // 根据天气代码设置描述和图标
    if (code === 0) { weatherDesc.value = '晴天'; weatherIcon.value = '☀️' }
    else if (code === 1 || code === 2 || code === 3) { weatherDesc.value = '多云'; weatherIcon.value = '⛅' }
    else if (code >= 45 && code <= 48) { weatherDesc.value = '雾'; weatherIcon.value = '🌫️' }
    else if ((code >= 51 && code <= 67) || (code >= 80 && code <= 99)) { weatherDesc.value = '雨'; weatherIcon.value = '🌧️' }
    else if (code >= 71 && code <= 77) { weatherDesc.value = '雪'; weatherIcon.value = '❄️' }
    else { weatherDesc.value = '未知天气'; weatherIcon.value = '🌈' }
  } catch (err) {
    console.error('天气获取失败', err)
    weatherDesc.value = '获取失败'
    weatherIcon.value = '❓'
  }
  // 更新日期
  const now = new Date()
  formattedDate.value = now.toLocaleDateString('zh-CN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
}

onMounted(fetchWeather)
</script>

<style scoped>
.simple-weather {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  padding: 20px 16px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  height: 100%;            /* 关键：填满父容器高度 */
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
  backdrop-filter: blur(4px);
}
.weather-icon {
  font-size: 56px;
}
.weather-temp {
  font-size: 32px;
  font-weight: bold;
  margin: 8px 0 4px;
}
.weather-desc {
  font-size: 16px;
  color: #555;
}
.weather-date {
  font-size: 12px;
  color: #999;
  margin-top: 12px;
}
</style>