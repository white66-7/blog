<template>
  <div class="skill-group">
    <div class="skill-group-title">
      {{ group.title }}
    </div>

    <div class="skill-tags">
      <span v-for="item in group.items" :key="item" class="skill-tag">
        {{ item }}
      </span>
    </div>
  </div>
</template>

<script setup>
defineProps({
  group: {
    type: Object,
    required: true,
  }
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
  font-size: 14px;
  font-weight: 600;
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
  align-items: center;
  justify-content: center;
  padding: 7px 14px;
  font-size: 13px;
  font-weight: 600;
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
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, .12);
}
</style>