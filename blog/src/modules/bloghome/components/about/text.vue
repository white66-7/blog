<template>
      <section class="about-section">
  <div class="about-container">
    <h2 class="about-title">About Me</h2>

    <p class="about-text">
      我是一名大学生,目前在用Vue3框架进行开发。目前的技术水平不高。
      设计思路是在兼顾简约与创造力的前提下,展现出个性化的美感。<br>
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
    font-family: 'YouSheBiaoTiHei';
    font-weight: normal;
    color:#2C2C2C;
    margin:0 0 28px;
    line-height:1;
}

.about-text{
    width:min(1100px,100%);
    font-size:30px;
    line-height:1.8;
    color:#6E6E6E;
    font-family: 'ZiTiGuanJiaKaiTi';
    font-weight: normal;
}
/* 移动端 / 平板适配 */
@media (max-width: 900px) {
  .about-section {
    padding-left: 30px; /* 取消 220px 的巨大留白 */
    padding-right: 30px;
    margin-top: 40px; /* 改为正数，和上面的卡片拉开距离，避免重叠 */
    box-sizing: border-box;
  }
  .about-title { font-size: 36px; margin-bottom: 20px; text-align: center; } /* 手机端标题居中更好看 */
  .about-text { font-size: 18px; line-height: 1.6; width: 100%; text-align: center; } /* 正文稍微缩小并居中 */
}

/* 极小屏幕手机适配 */
@media (max-width: 480px) {
  .about-section { padding-left: 20px; padding-right: 20px; margin-top: 20px; }
  .about-title { font-size: 28px; margin-bottom: 16px; }
  .about-text { font-size: 15px; }
  
  /* 关键：隐藏你的 <br> 标签。手机屏幕窄，会自动换行，保留 <br> 会导致排版断句很奇怪 */
  .about-text br { display: none; } 
}
</style>