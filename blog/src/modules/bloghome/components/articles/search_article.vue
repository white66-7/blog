<template>
  <div class="card">
    <!-- 搜索标题 -->
    <div class="search-header">
      <span class="search-label">
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 16 16">
          <path d="M0 0h16v16H0z" fill="none" />
          <path fill="currentColor" d="M10.823 11.883a5.5 5.5 0 1 1 1.06-1.06l2.897 2.897a.75.75 0 1 1-1.06 1.06zM11.5 7.5a4 4 0 1 0-8 0a4 4 0 0 0 8 0" />
        </svg>
        搜索
      </span>
    </div>

    <!-- 搜索框 -->
    <form class="form" @submit.prevent="handleSearch">
      <button type="button" @click="handleSearch">
        <svg width="17" height="16" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="search">
          <path d="M7.667 12.667A5.333 5.333 0 107.667 2a5.333 5.333 0 000 10.667zM14.334 14l-2.9-2.9" stroke="currentColor" stroke-width="1.333" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <input 
        class="input" 
        placeholder="search" 
        required 
        type="text"
        v-model="searchQuery"
      />
      <button class="reset" type="reset" @click="clearSearch">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  modelValue: string
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'search', query: string): void            
}>()

const searchQuery = computed({
  get: () => props.modelValue,
  set: (val) => {
    emit('update:modelValue', val)             
  }
})

const handleSearch = () => {
  emit('search', props.modelValue)
}

const clearSearch = () => {
  emit('update:modelValue', '')
  emit('search', '')
}
</script>


<style scoped>
.card {
  box-sizing: border-box;
  width: 100%;
  height: auto;          
  min-height: auto;
  background: rgba(217, 217, 217, 0.58);
  border: 1px solid white;
  box-shadow: 12px 17px 51px rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(6px);
  border-radius: 17px;
  text-align: center;
  cursor: pointer;
  transition: all 0.5s;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: flex-start;
  user-select: none;
  font-weight: bolder;
  color: black;
  padding: 20px;
}

.card:hover {
  border: 1px solid black;
  transform: scale(1.05);
}

.card:active {
  transform: scale(0.95) rotateZ(1.7deg);
}

/* ======= 搜索标题栏（黑线分隔） ======= */
.search-header {
  display: flex;
  align-items: center;
  padding-bottom: 10px;
  margin-bottom: 16px;
  border-bottom: 1px solid #000;  /* 黑色分隔线 */
}

.search-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
  font-weight: 600;
  color: #000;
}

.search-label svg {
  font-size: 18px;
}

/* ======= 搜索框新样式 ======= */
.form {
  --timing: 0.3s;
  --width-of-input: 100%;
  --height-of-input: 40px;
  --border-height: 2px;
  --input-bg: #fff;
  --border-color: #2f2ee9;
  --border-radius: 30px;
  --after-border-radius: 1px;
  position: relative;
  width: var(--width-of-input);
  height: var(--height-of-input);
  display: flex;
  align-items: center;
  padding-inline: 0.8em;
  border-radius: var(--border-radius);
  transition: border-radius 0.5s ease;
  background: var(--input-bg, #fff);
}

.form button {
  border: none;
  background: none;
  color: #8b8ba7;
}

.input {
  font-size: 0.9rem;
  background-color: transparent;
  width: 100%;
  height: 100%;
  padding-inline: 0.5em;
  padding-block: 0.7em;
  border: none;
}

/* 下划线动画（聚焦时出现） */
.form:before {
  content: "";
  position: absolute;
  background: var(--border-color);
  transform: scaleX(0);
  transform-origin: center;
  width: 100%;
  height: var(--border-height);
  left: 0;
  bottom: 0;
  border-radius: 1px;
  transition: transform var(--timing) ease;
}

.form:focus-within {
  border-radius: var(--after-border-radius);
}

.input:focus {
  outline: none;
}

.form:focus-within:before {
  transform: scale(1);
}

/* 重置按钮（清空输入） */
.reset {
  border: none;
  background: none;
  opacity: 0;
  visibility: hidden;
}

/* 当输入框有内容时显示清除按钮 */
.input:not(:placeholder-shown) ~ .reset {
  opacity: 1;
  visibility: visible;
}

.form svg {
  width: 17px;
  margin-top: 3px;
}
</style>