<template>
  <div class="info-card">
    <!-- 头像 -->
    <div class="avatar-wrapper">
      <!-- 骨架层 -->
      <div :class="['skeleton-avatar', { 'skeleton-hidden': avatarLoaded }]"></div>
      <!-- 真实头像 -->
      <img class="avatar" :class="{ 'avatar-visible': avatarLoaded }" src="@/assets/me.webp" loading="lazy" alt="头像"
        @load="avatarLoaded = true" @error="avatarLoaded = true" />
    </div>
    <!-- 昵称 -->
    <div class="name">一路向北</div>
    <!-- 分割线 -->
    <div class="divider"></div>
    <!-- 签名 -->
    <div class="bio">认准的方向,就坚定一些</div>
    <!-- 社交图标 -->
    <ul class="wrapper">
      <a href="https://github.com/white66-7" target="_blank" class="icon github">
        <span class="tooltip">GitHub</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="1.4em" height="1.4em" viewBox="0 0 24 24">
          <path d="M0 0h24v24H0z" fill="none" />
          <path fill="currentColor"
            d="M12 2.247a10 10 0 0 0-3.162 19.487c.5.088.687-.212.687-.475c0-.237-.012-1.025-.012-1.862c-2.513.462-3.163-.613-3.363-1.175a3.64 3.64 0 0 0-1.025-1.413c-.35-.187-.85-.65-.013-.662a2 2 0 0 1 1.538 1.025a2.137 2.137 0 0 0 2.912.825a2.1 2.1 0 0 1 .638-1.338c-2.225-.25-4.55-1.112-4.55-4.937a3.9 3.9 0 0 1 1.025-2.688a3.6 3.6 0 0 1 .1-2.65s.837-.262 2.75 1.025a9.43 9.43 0 0 1 5 0c1.912-1.3 2.75-1.025 2.75-1.025a3.6 3.6 0 0 1 .1 2.65a3.87 3.87 0 0 1 1.025 2.688c0 3.837-2.338 4.687-4.562 4.937a2.37 2.37 0 0 1 .674 1.85c0 1.338-.012 2.413-.012 2.75c0 .263.187.575.687.475A10.005 10.005 0 0 0 12 2.247" />
        </svg>
      </a>
      <a href="https://steamcommunity.com/profiles/76561199887390241/" target="_blank" class="icon Steam">
        <span class="tooltip">Steam</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 16 16">
          <path d="M0 0h16v16H0z" fill="none" />
          <g fill="currentColor">
            <path
              d="M.329 10.333A8.01 8.01 0 0 0 7.99 16C12.414 16 16 12.418 16 8s-3.586-8-8.009-8A8.006 8.006 0 0 0 0 7.468l.003.006l4.304 1.769A2.2 2.2 0 0 1 5.62 8.88l1.96-2.844l-.001-.04a3.046 3.046 0 0 1 3.042-3.043a3.046 3.046 0 0 1 3.042 3.043a3.047 3.047 0 0 1-3.111 3.044l-2.804 2a2.223 2.223 0 0 1-3.075 2.11a2.22 2.22 0 0 1-1.312-1.568L.33 10.333Z" />
            <path
              d="M4.868 12.683a1.715 1.715 0 0 0 1.318-3.165a1.7 1.7 0 0 0-1.263-.02l1.023.424a1.261 1.261 0 1 1-.97 2.33l-.99-.41a1.7 1.7 0 0 0 .882.84Zm3.726-6.687a2.03 2.03 0 0 0 2.027 2.029a2.03 2.03 0 0 0 2.027-2.029a2.03 2.03 0 0 0-2.027-2.027a2.03 2.03 0 0 0-2.027 2.027m2.03-1.527a1.524 1.524 0 1 1-.002 3.048a1.524 1.524 0 0 1 .002-3.048" />
          </g>
        </svg>
      </a>
      <a href="https://space.bilibili.com/674047951" target="_blank" class="icon bilibili">
        <span class="tooltip">Bilibili</span>
        <svg viewBox="0 0 24 24" height="1.2em" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373z" />
        </svg>
      </a>
      <a href="https://user.qzone.qq.com/3061690367" target="_blank" class="icon QQ">
        <span class="tooltip">QQ</span>
        <svg xmlns="http://www.w3.org/2000/svg" width="1.2em" height="1.2em" viewBox="0 0 24 24">
          <path d="M0 0h24v24H0z" fill="none" />
          <path fill="currentColor"
            d="M21.395 15.035a40 40 0 0 0-.803-2.264l-1.079-2.695c.001-.032.014-.562.014-.836C19.526 4.632 17.351 0 12 0S4.474 4.632 4.474 9.241c0 .274.013.804.014.836l-1.08 2.695a39 39 0 0 0-.802 2.264c-1.021 3.283-.69 4.643-.438 4.673c.54.065 2.103-2.472 2.103-2.472c0 1.469.756 3.387 2.394 4.771c-.612.188-1.363.479-1.845.835c-.434.32-.379.646-.301.778c.343.578 5.883.369 7.482.189c1.6.18 7.14.389 7.483-.189c.078-.132.132-.458-.301-.778c-.483-.356-1.233-.646-1.846-.836c1.637-1.384 2.393-3.302 2.393-4.771c0 0 1.563 2.537 2.103 2.472c.251-.03.581-1.39-.438-4.673" />
        </svg>
      </a>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const avatarLoaded = ref(false)
</script>

<style scoped>
.info-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px 16px;
  border-radius: 16px;
  background: linear-gradient(135deg,
      rgba(200, 240, 220, 0.65),
      rgba(200, 220, 255, 0.6),
      rgba(255, 210, 200, 0.55));
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  width: 100%;
}

/* ===== 头像 ===== */
.avatar-wrapper {
  position: relative;
  /* 为骨架层提供定位基准 */
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 12px;
  overflow: hidden;
  padding: 0;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  flex-shrink: 0;
  margin-bottom: 4px;
}

/* 头像骨架层 */
.skeleton-avatar {
  position: absolute;
  inset: 0;
  z-index: 2;
  background: linear-gradient(90deg,
      #e0e0e0 25%,
      #f5f5f5 50%,
      #e0e0e0 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
  opacity: 1;
  transition: opacity 0.4s ease;
  border-radius: 12px;
  pointer-events: none;
}

.skeleton-hidden {
  opacity: 0;
}

/* 真实头像 */
.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border: none;
  opacity: 0;
  transition: opacity 0.4s ease;
}

.avatar-visible {
  opacity: 1;
}

/* 骨架动画定义（与其他组件统一） */
@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }

  100% {
    background-position: -200% 0;
  }
}

/* ===== 昵称 ===== */
.name {
  font-size: 18px;
  font-weight: normal;
  color: #1a1a1a;
  font-family: 'YouSheBiaoTiHei', '优设标题黑', sans-serif;
}

/* ===== 分割线 ===== */
.divider {
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  border-radius: 1px;
  margin: 4px 0;
}

/* ===== 签名 ===== */
.bio {
  font-size: 14px;
  color: #6b7280;
  text-align: center;
  font-family: 'YouSheBiaoTiHei', '优设标题黑', sans-serif;
}

/* ===== 社交图标 ===== */
.wrapper {
  display: inline-flex;
  list-style: none;
  height: auto;
  width: 100%;
  font-family: "Poppins", sans-serif;
  justify-content: center;
  margin-top: 2px;
}

.wrapper .icon {
  position: relative;
  background: #fff;
  border-radius: 50%;
  margin: 10px;
  width: 50px;
  height: 50px;
  font-size: 18px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  box-shadow: 0 10px 10px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  color: #1a1a1a;
  text-decoration: none;
}

.wrapper .tooltip {
  position: absolute;
  top: 0;
  font-size: 14px;
  background: #fff;
  color: #fff;
  padding: 5px 8px;
  border-radius: 5px;
  box-shadow: 0 10px 10px rgba(0, 0, 0, 0.1);
  opacity: 0;
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.wrapper .tooltip::before {
  position: absolute;
  content: "";
  height: 8px;
  width: 8px;
  background: #fff;
  bottom: -3px;
  left: 50%;
  transform: translate(-50%) rotate(45deg);
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.wrapper .icon:hover .tooltip {
  top: -45px;
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}

.wrapper .icon:hover span,
.wrapper .icon:hover .tooltip {
  text-shadow: 0px -1px 0px rgba(0, 0, 0, 0.1);
}

/* GitHub */
.wrapper .github:hover,
.wrapper .github:hover .tooltip,
.wrapper .github:hover .tooltip::before {
  background: #333;
  color: #fff;
}

/* Bilibili - 粉色背景 + 蓝色图标 */
.wrapper .bilibili:hover,
.wrapper .bilibili:hover .tooltip,
.wrapper .bilibili:hover .tooltip::before {
  background: #e8f0fe;
  color: #00a1d6;
}

/* Steam */
.wrapper .Steam:hover,
.wrapper .Steam:hover .tooltip,
.wrapper .Steam:hover .tooltip::before {
  background: #1b2838;
  /* Steam 深色背景 */
  color: #66c0f4;
  /* 明亮的蒸汽蓝图标 */
}

/* QQ */
.wrapper .QQ:hover,
.wrapper .QQ:hover .tooltip,
.wrapper .QQ:hover .tooltip::before {
  background: #12b7f5;
  color: #fff;
}

/* ===== 微信弹窗 ===== */
.wechat-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.wechat-content {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  text-align: center;
}

.wechat-content p {
  margin-bottom: 16px;
  font-size: 16px;
  color: #333;
}

.wechat-content button {
  padding: 8px 24px;
  border: none;
  border-radius: 6px;
  background: #07c160;
  color: #fff;
  cursor: pointer;
}
</style>