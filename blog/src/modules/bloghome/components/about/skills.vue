
<template>
<div class="skill-group animate__animated animate__fadeIn"
     :style="{ animationDelay: `${index * 0.3}s` }">
  <div class="skill-group-title">{{ group.title }}</div>
  <div class="skill-tags">
    <span class="skill-tag animate__animated animate__fadeIn"
          v-for="(item, i) in group.items"
          :key="item"
          :style="{ animationDelay: `${index * 0.3 + (i + 1) * 0.1}s` }">
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
  padding: 18px 0px;
  border-radius: 8px;
  transition: .25s;
}


.skill-group-title {
  display: flex;
  align-items: center;
  margin-bottom: 18px;
  font-size: 18px;
  font-family: 'YouSheBiaoTiHei', '优设标题黑', sans-serif;
  font-weight: normal;
  letter-spacing: 2px;
  color: #6F6A63;
}

.skill-group-title::after {
  content: "";
  flex: 1;
  height: 1px;
  margin-left: 14px;
  background: rgba(0, 0, 0, .08);
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.skill-tag {
  display: flex;
  position: relative;
  align-items: center;
  justify-content: center;
  padding: 7px 14px;
  font-size: 13px;
  font-family: 'YouSheBiaoTiHei', '优设标题黑', sans-serif;
  font-weight: normal;
  color: #3C3935;
  background: #EEE7DA;
  border-radius: 5px;
  border: none;
  cursor: default;
  transition:
    background .25s,
    color .25s,
    transform .25s,
    box-shadow .25s;
}

.skill-tag:hover {
  background: #222;
  color: #fff;
  transform: scale(1.15);                
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.18); 
}
</style>