<template>
  <section id="projects">
    <div class="projects-header">
      <div>
        <div class="section-label">Selected Work</div>
        <div class="projects-title">作品集<br /><span>&一路向北</span></div>
      </div>
      <div class="projects-count">{{ projects.length }} Projects</div>
    </div>
    <div id="project-list" @mousemove="movePreview">
      <div
        v-for="(project, index) in projects"
        :key="project.id"
        class="project-item"
        :class="hasAnimated ? '' : 'animate__animated animate__fadeInUp animate__fast'"
        :style="hasAnimated ? {} : { animationDelay: `${index * 0.15}s` }"
        @mouseenter="showPreview(project)"
        @mouseleave="hidePreview"
      >
        <div class="project-num">{{ String(project.id).padStart(2, '0') }}</div>
        <div class="project-info">
          <div class="project-name">{{ project.title }}</div>
          <div class="project-desc">{{ project.description }}</div>
        </div>
        <div class="project-tech">
          <span v-for="tag in project.tags" :key="tag" class="tech-badge">{{ tag }}</span>
        </div>
        <a :href="project.link" target="_blank" class="project-link">
          View
          <svg width="14" height="14" viewBox="0 0 14 14">
            <path d="M1 13L13 1M13 1H4M13 1V10" stroke="currentColor" stroke-width="1.5" />
          </svg>
        </a>
      </div>
    </div>

    <!-- 悬浮预览容器：拆分为定位层与动画层，零延迟跟手 -->
    <div
      class="project-preview-wrapper"
      :style="{
        transform: `translate3d(${mousePos.x}px, ${mousePos.y}px, 0)`
      }"
    >
      <img
        class="project-preview-img"
        :class="{ 'is-active': isPreviewActive }"
        :src="currentPoster"
        alt="Preview Poster"
      />
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import 'animate.css'

const rawProjects = ref([
  {
    id: 1,
    title: '火影忍者',
    description: '基于 C++ ，引入 SFML 与 Box2D 库开发的简陋小游戏',
    poster: '/project/vs.webp',
    link: 'https://github.com/white66-7/Naruto-battle-game',
    tags: ['C++', 'SFML', 'Box2D']
  },
  {
    id: 2,
    title: '音乐播放器',
    description: '基于css + javascript + html开发,Electron打包的图形化程序',
    poster: '/project/music.webp',
    link: 'https://github.com/white66-7/music_app',
    tags: ['JavaScript', 'Electron', 'CSS', 'HTML']
  },
  {
    id: 3,
    title: '博客-前端',
    description: '基于 Vue3 框架开发的前端',
    poster: '/project/blog.webp',
    link: 'https://github.com/white66-7/blog',
    tags: ['Vue3', 'JavaScript', 'CSS']
  },
  {
    id: 4,
    title: '博客-后端',
    description: '基于 SpringBoot 框架开发的后端',
    poster: '/project/boot.webp',
    link: 'https://github.com/white66-7/java-backend',
    tags: ['SpringBoot', 'Java', 'IDEA']
  },
  {
    id: 5,
    title: '桌面美化工具',
    description: '一个鼠标左键双击后隐藏桌面快捷图标工具',
    poster: '/project/click.webp',
    link: 'https://github.com/white66-7/DesktopHelper42',
    tags: ['Python', 'tkinter', 'pynput', 'pystray']
  }
])

const projects = computed(() => {
  return [...rawProjects.value]
    .reverse()
    .map((project, index) => ({
      ...project,
      id: index + 1
    }))
})

// ========== 1. 图片预加载：解决弱网海报显示延迟/错位 ==========
onMounted(() => {
  rawProjects.value.forEach((item) => {
    if (item.poster) {
      const img = new Image()
      img.src = item.poster
    }
  })
})

// ========== 2. 悬浮与坐标跟踪 ==========
const currentPoster = ref('')
const isPreviewActive = ref(false)
const mousePos = ref({ x: 0, y: 0 })

// 动画记忆
const ANIM_KEY = 'projects-animated'
const hasAnimated = ref(!!sessionStorage.getItem(ANIM_KEY))
if (!hasAnimated.value) {
  sessionStorage.setItem(ANIM_KEY, '1')
}

const movePreview = (e) => {
  const previewWidth = 260
  const previewHeight = 160
  const offsetX = 25
  const offsetY = 25

  let targetX = e.clientX + offsetX
  let targetY = e.clientY + offsetY

  // 边界防溢出检测：防止窗口靠近屏幕右侧或下侧时图片被切断
  if (targetX + previewWidth > window.innerWidth) {
    targetX = e.clientX - previewWidth - 15
  }
  if (targetY + previewHeight > window.innerHeight) {
    targetY = e.clientY - previewHeight - 15
  }

  mousePos.value = { x: targetX, y: targetY }
}

const showPreview = (project) => {
  currentPoster.value = project.poster
  isPreviewActive.value = true
}

const hidePreview = () => {
  isPreviewActive.value = false
}
</script>

<style scoped>
#projects {
  width: 100%;
  padding: 5rem 3rem 0;
  background: #FAF7F2;
}

.projects-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 4rem;
}

.section-label {
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  letter-spacing: .2em;
  color: #0047FF;
  margin-bottom: 20px;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #D8D2C8;
  max-width: 60px;
}

.projects-title {
  font-family: 'ShangShouJiangHuShuFa';
  font-size: clamp(52px, 7vw, 96px);
  line-height: 0.9;
  letter-spacing: .05em;
  color: #161411;
}

.projects-title span {
  color: #8d857c;
  font-size: .75em;
}

.projects-count {
  font-family: monospace;
  font-size: 13px;
  color: #6B6560;
}

#project-list {
  width: 100%;
}

.project-item {
  display: grid;
  grid-template-columns: 80px 1fr 220px 120px;
  align-items: center;
  gap: 2rem;
  padding: 2rem 1rem;
  margin: 0 -2rem;
  border-bottom: 1px solid #D8D2C8;
  position: relative;
  transition: background .3s ease;
}

.project-item:hover {
  background: #F5F1EA;
}

.project-num {
  font-family: "IBM Plex Mono", "Courier Prime", monospace;
  font-size: 12px;
  letter-spacing: .22em;
  color: #8d857c;
}

.project-name {
  font-family: 'ShangShouJiangHuShuFa';
  font-size: 32px;
  color: #1A1814;
  margin-bottom: 10px;
}

.project-desc {
  max-width: 420px;
  font-weight: 600;
  font-family: 'WenQuanWeiMiHei';
  font-size: 12px;
  line-height: 1.8;
  color: #6B6560;
}

.project-tech {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.tech-badge {
  padding: 5px 12px;
  font-family: 'Inter', sans-serif;
  font-size: 10px;
  letter-spacing: .1em;
  text-transform: uppercase;
  color: #6B6560;
  font-weight: 500;
  border: 1px solid #D8D2C8;
}

.project-link {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 8px;
  color: #0047FF;
  text-transform: uppercase;
  font-family: 'Inter', sans-serif;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: .15em;
  text-decoration: none;
}

.project-link:hover {
  color: #1A1814;
}

/* ========== 预览框样式优化 ========== */
/* 容器只负责定位：开启 GPU 硬件加速，绝对无延时跟随 */
.project-preview-wrapper {
  position: fixed;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 9999;
  will-change: transform;
}

/* 图片内部负责淡入淡出与缩放，与位移解耦 */
.project-preview-img {
  width: 260px;
  height: 160px;
  object-fit: cover;
  border: 1px solid #D8D2C8;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.08);
  opacity: 0;
  transform: scale(0.9);
  transition: opacity 0.2s ease, transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
  display: block;
}

.project-preview-img.is-active {
  opacity: 1;
  transform: scale(1);
}

@media (max-width: 768px) {
  #projects {
    padding: 5rem 1.5rem;
  }

  .projects-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }

  .project-item {
    grid-template-columns: 40px 1fr;
  }

  .project-tech,
  .project-link {
    display: none;
  }

  .project-preview-wrapper {
    display: none;
  }

  .project-name {
    font-size: 24px;
  }
}
</style>