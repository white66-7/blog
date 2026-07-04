<template>
      <section class="about-section">
  <div class="about-container">
    <h2 class="about-title">About Me</h2>

    <p class="about-text">
      我是一名大学生,目前用 Vue3框架进行开发。目前的技术水平不高哦。
      设计思路是在兼顾简约与创造力的前提下,展现出个性化的美感。
      空闲时间喜欢玩法环,空洞等游戏,除此之外还爱看异世界番剧。
    </p>
  </div>
</section>
</template>
<script setup>
</script>
<style scoped>
.about-section{
    width:100%;
    margin-top:-30px;
    align-self: flex-start;     
    padding-left: 220px;          
}
.about-container{
    max-width:1200px;
    margin:0 auto;
}

.about-title{
    font-size:52px;
    font-weight:800;
    color:#2C2C2C;
    margin:0 0 28px;
    line-height:1;
}

.about-text{

    width:min(1100px,100%);

    font-size:30px;

    line-height:1.8;

    color:#6E6E6E;

    font-weight:400;
}
</style>