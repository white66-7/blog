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
        <svg width="17" height="16" fill="none" xmlns="http://www.w3.org/2000/svg">
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
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
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
  set: (val) => emit('update:modelValue', val)
})

const handleSearch = () => emit('search', props.modelValue)
const clearSearch = () => {
  emit('update:modelValue', '')
  emit('search', '')
}
</script>

<style scoped>
.card {
  box-sizing: border-box;
  width: 190px;
  height: 254px;
  background: rgba(240, 240, 240, 0.85);
  border: 1px solid white;
  box-shadow: 12px 17px 51px rgba(0, 0, 0, 0.22);
  backdrop-filter: blur(6px);
  border-radius: 17px;
  text-align: center;
  cursor: pointer;
  transition: all 0.5s;
  display: flex;
  flex-direction: column;     
  align-items: center;
  justify-content: center;
  user-select: none;
  font-weight: bolder;
  color: black;
  padding: 15px;               
}

/* 搜索标题 */
.search-header {
  display: flex;
  align-items: center;
  width: 100%;
  padding-bottom: 8px;
  margin-bottom: 12px;
  border-bottom: 1px solid #000;
}

.search-label {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  font-weight: 600;
  color: #000;
}

/* 搜索表单 */
.form {
  position: relative;
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  padding-inline: 0.8em;
  border-radius: 30px;
  background: #fff;
  transition: border-radius 0.3s;
}

.form button {
  border: none;
  background: none;
  color: #8b8ba7;
  display: flex;
  align-items: center;
}

.input {
  font-size: 0.85rem;
  background: transparent;
  width: 100%;
  height: 100%;
  padding-inline: 0.5em;
  padding-block: 0.7em;
  border: none;
  color: #000;
  outline: none;
}

/* 聚焦下划线 */
.form::before {
  content: "";
  position: absolute;
  background: #2f2ee9;
  transform: scaleX(0);
  transform-origin: center;
  width: 100%;
  height: 2px;
  left: 0;
  bottom: 0;
  border-radius: 1px;
  transition: transform 0.3s ease;
}

.form:focus-within::before {
  transform: scale(1);
}

.form:focus-within {
  border-radius: 1px;
}

/* 清除按钮 */
.reset {
  opacity: 0;
  visibility: hidden;
  transition: 0.2s;
}

.input:not(:placeholder-shown) ~ .reset {
  opacity: 1;
  visibility: visible;
}
</style>