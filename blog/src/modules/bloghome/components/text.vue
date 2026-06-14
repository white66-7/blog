<template>
<div class="container">
  <h1>
    <span>我的</span>
    <span>愿望是</span>
    <span>世界和平</span>
  </h1>
  <h2>
    <span>做点</span>
    <span>真正</span>
    <span>想做的</span>
  </h2>
</div>
</template>

<script setup lang="ts">
</script>

<style scoped lang="scss">
$primary-color: transparent;
$secondary-color: #ffe221;
$tertiary-color: #ffffff;
$total: 12s;
.container {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  position: relative;
}

h1, h2 {
  font-size: 75px;
  text-transform: uppercase;
  margin: 0;
  padding: 0;
  text-align: center;

  span {
    width: 100%;
    float: left;
    color: $tertiary-color;
    -webkit-clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 80%);
    clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 80%);
    transform: translateY(-50px);
    opacity: 0;
    animation-timing-function: ease;
    animation-duration: $total;
    animation-iteration-count: infinite;
    animation-fill-mode: forwards;

    &:last-child {
      color: $secondary-color;
    }
  }
}

h1 span:nth-child(1) { animation-name: s1w1; }
h1 span:nth-child(2) { animation-name: s1w2; }
h1 span:nth-child(3) { animation-name: s1w3; }

h2 {
  top: 0;
  position: absolute;
  span:nth-child(1) { animation-name: s2w1; }
  span:nth-child(2) { animation-name: s2w2; }
  span:nth-child(3) { animation-name: s2w3; }
}

/* ═══ 时间轴 (14s) ═══
   0%─5%    木叶创立 露出
   4%─9%    崴特の 露出
   8%─13%   个人博客 露出
   13%─25%  第一句完整展示
   25%─31%  第一句消失
   35%─40%  做点真正 露出
   39%─44%  想做的 露出
   43%─48%  事情 露出
   48%─60%  第二句完整展示
   60%─66%  第二句消失
   66%─100% 静默
   ═════════════════ */

@keyframes s1w1 {
  0%        { transform: translateY(-50px); opacity: 0; -webkit-clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 80%); clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 80%); }
  6%        { transform: translateY(0); opacity: 1; -webkit-clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 15%); clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 15%); }
  29%       { transform: translateY(0); opacity: 1; -webkit-clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 15%); clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 15%); }
  36%, 100% { transform: translateY(50px); opacity: 0; -webkit-clip-path: polygon(100% 0, 100% -0%, 0 100%, 0 100%); clip-path: polygon(100% 0, 100% -0%, 0 100%, 0 100%); }
}

@keyframes s1w2 {
  0%, 5%    { transform: translateY(-50px); opacity: 0; -webkit-clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 80%); clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 80%); }
  11%       { transform: translateY(0); opacity: 1; -webkit-clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 15%); clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 15%); }
  29%       { transform: translateY(0); opacity: 1; -webkit-clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 15%); clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 15%); }
  36%, 100% { transform: translateY(50px); opacity: 0; -webkit-clip-path: polygon(100% 0, 100% -0%, 0 100%, 0 100%); clip-path: polygon(100% 0, 100% -0%, 0 100%, 0 100%); }
}

@keyframes s1w3 {
  0%, 9%    { transform: translateY(-50px); opacity: 0; -webkit-clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 80%); clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 80%); }
  15%       { transform: translateY(0); opacity: 1; -webkit-clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 15%); clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 15%); }
  29%       { transform: translateY(0); opacity: 1; -webkit-clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 15%); clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 15%); }
  36%, 100% { transform: translateY(50px); opacity: 0; -webkit-clip-path: polygon(100% 0, 100% -0%, 0 100%, 0 100%); clip-path: polygon(100% 0, 100% -0%, 0 100%, 0 100%); }
}

@keyframes s2w1 {
  0%, 41%   { transform: translateY(-50px); opacity: 0; -webkit-clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 80%); clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 80%); }
  47%       { transform: translateY(0); opacity: 1; -webkit-clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 15%); clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 15%); }
  70%       { transform: translateY(0); opacity: 1; -webkit-clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 15%); clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 15%); }
  79%, 100% { transform: translateY(50px); opacity: 0; -webkit-clip-path: polygon(100% 0, 100% -0%, 0 100%, 0 100%); clip-path: polygon(100% 0, 100% -0%, 0 100%, 0 100%); }
}

@keyframes s2w2 {
  0%, 46%   { transform: translateY(-50px); opacity: 0; -webkit-clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 80%); clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 80%); }
  52%       { transform: translateY(0); opacity: 1; -webkit-clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 15%); clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 15%); }
  70%       { transform: translateY(0); opacity: 1; -webkit-clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 15%); clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 15%); }
  79%, 100% { transform: translateY(50px); opacity: 0; -webkit-clip-path: polygon(100% 0, 100% -0%, 0 100%, 0 100%); clip-path: polygon(100% 0, 100% -0%, 0 100%, 0 100%); }
}

@keyframes s2w3 {
  0%, 50%   { transform: translateY(-50px); opacity: 0; -webkit-clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 80%); clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 80%); }
  56%       { transform: translateY(0); opacity: 1; -webkit-clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 15%); clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 15%); }
  70%       { transform: translateY(0); opacity: 1; -webkit-clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 15%); clip-path: polygon(100% 0, 100% 100%, 0 100%, 0 15%); }
  79%, 100% { transform: translateY(50px); opacity: 0; -webkit-clip-path: polygon(100% 0, 100% -0%, 0 100%, 0 100%); clip-path: polygon(100% 0, 100% -0%, 0 100%, 0 100%); }
}
</style>