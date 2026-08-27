<!-- src/modules/bloghome/components/about/skills.vue -->
<template>
  <div
    class="skill-group animate__animated animate__fadeIn"
    :style="{ animationDelay: `${index * 0.2}s` }"
  >
    <div class="skill-group-title">{{ group.title }}</div>
    <div class="skill-tags">
      <span
        class="skill-tag animate__animated animate__fadeIn"
        v-for="(item, i) in group.items"
        :key="item"
        :style="{ animationDelay: `${index * 0.2 + (i + 1) * 0.08}s` }"
      >
        {{ item }}
      </span>
    </div>
  </div>
</template>

<script setup>
import 'animate.css'
defineProps({
  group: { type: Object, required: true },
  index: { type: Number, default: 0 }
})
</script>

<style scoped>
.skill-group {
  padding: 14px 0;
  border-radius: 8px;
  transition: 0.25s;
}

.skill-group-title {
  display: flex;
  align-items: center;
  margin-bottom: 14px;
  font-size: 17px;
  font-family: 'YouSheBiaoTiHei', '优设标题黑', sans-serif;
  font-weight: normal;
  letter-spacing: 2px;
  color: #D1D5DB;
}

.skill-group-title::after {
  content: "";
  flex: 1;
  height: 1px;
  margin-left: 14px;
  background: linear-gradient(to right, rgba(255, 255, 255, 0.15), transparent);
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

/* 太空暗岩玻璃胶囊标签 */
.skill-tag {
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  padding: 6px 14px;
  font-size: 13px;
  font-family: 'YouSheBiaoTiHei', '优设标题黑', sans-serif;
  font-weight: normal;
  color: #E2E4E9;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  cursor: default;
  backdrop-filter: blur(8px);
  transition: all 0.25s ease;
}

.skill-tag:hover {
  background: rgba(255, 255, 255, 0.18);
  color: #FFFFFF;
  border-color: rgba(255, 255, 255, 0.35);
  transform: translateY(-2px) scale(1.06);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4), 0 0 10px rgba(255, 255, 255, 0.2);
}
</style>