<template>
  <div class="container">
    <!-- “保持进步” 使用图片背景动画 -->
    <div class="content">
      <span class="animated-text">保持进步</span>
    </div>

    <!-- 三行逐行动画（下方） -->
    <h1>
      <span>去做</span>
      <span>你真正</span>
      <span>想做的</span>
    </h1>
  </div>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
$secondary-color: #ffe221;
$tertiary-color: #ffffff;

.container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
  background: transparent;
  margin: 0;
  padding: 0;
}

/* ===== “保持进步” 使用图片背景动画 ===== */
.content {
  margin-top: 80px;
}

.animated-text {
  font: 700 4.6em/1 "Oswald", "Microsoft YaHei", sans-serif;
  letter-spacing: 4px;
  padding: 0.25em 0 0.325em;
  display: block;
  margin: 0 auto;
  text-shadow: 0 0 80px rgba(255, 255, 255, 0.5);

  /* 使用图片背景 */
  background: url(https://i.ibb.co/RDTnNrT/animated-text-fill.png) repeat-y;
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;

  /* ✅ 改为 80s，与原示例一致 */
  -webkit-animation: aitf 80s linear infinite;
  -webkit-transform: translate3d(0, 0, 0);
  -webkit-backface-visibility: hidden;
}

@-webkit-keyframes aitf {
  0%   { background-position: 0% 50%; }
  100% { background-position: 100% 50%; }
}

/* ===== 三行逐行动画（不变） ===== */
h1 {
  font-size: 75px;
  margin: 10px 0 0;
  padding: 0;
  text-align: center;
  font-family: 'Cabin Condensed', sans-serif;

  span {
    width: 100%;
    float: left;
    color: $tertiary-color;
    -webkit-clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 80%);
    clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 80%);
    transform: translateY(-50px);
    opacity: 0;
    animation-timing-function: ease;
    animation-duration: 6.8s;
    animation-iteration-count: infinite;
    animation-fill-mode: forwards;

    &:last-child {
      color: $secondary-color;
    }
  }
}

h1 span:nth-child(1) { animation-name: w1; }
h1 span:nth-child(2) { animation-name: w2; }
h1 span:nth-child(3) { animation-name: w3; }

/* 逐行动画关键帧 */
@keyframes w1 {
  0%        { transform: translateY(-50px); opacity: 0; clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 80%); }
  10%       { transform: translateY(0); opacity: 1; clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 15%); }
  59%       { transform: translateY(0); opacity: 1; clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 15%); }
  71%, 100% { transform: translateY(50px); opacity: 0; clip-path: polygon(100% 0, 100% -0%, 0 100%, 0 100%); }
}
@keyframes w2 {
  0%, 8%    { transform: translateY(-50px); opacity: 0; clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 80%); }
  18%       { transform: translateY(0); opacity: 1; clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 15%); }
  59%       { transform: translateY(0); opacity: 1; clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 15%); }
  71%, 100% { transform: translateY(50px); opacity: 0; clip-path: polygon(100% 0, 100% -0%, 0 100%, 0 100%); }
}
@keyframes w3 {
  0%, 16%   { transform: translateY(-50px); opacity: 0; clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 80%); }
  26%       { transform: translateY(0); opacity: 1; clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 15%); }
  59%       { transform: translateY(0); opacity: 1; clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 15%); }
  71%, 100% { transform: translateY(50px); opacity: 0; clip-path: polygon(100% 0, 100% -0%, 0 100%, 0 100%); }
}

/* 响应式 */
@media (max-width: 768px) {
  .animated-text {
    font-size: 2.5em;
  }
  h1 {
    font-size: 40px;
    margin-top: 20px;
  }
}
</style>