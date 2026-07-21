<template>
  <section id="projects">
    <div class="projects-header">
      <div>
        <div class="section-label">Selected Work</div>
        <div class="projects-title">作品集<br /><span>&一路向北</span></div>
      </div>
      <div class="projects-count">{{ projects.length }} Projects</div>
    </div>
    <div id="project-list">
<div
  v-for="(project, index) in projects"
  :key="project.id"
  class="project-item animate__animated animate__fadeInUp animate__fast"
  :style="{ animationDelay: `${index * 0.15}s` }"
  @mousemove="movePreview"
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
    <img ref="previewImage" class="project-preview" :src="currentPoster" />
  </section>
</template>

<script setup>
import { ref } from 'vue'
import 'animate.css'
const projects = ref([
  {
    id: 1,
    title: '火影忍者',
    description: '基于 C++ 开发，引入 SFML 与 Box2D 库的简陋小游戏，海报极其"照骗"',
    poster: '/project/vs.webp',
    link: 'https://github.com/white66-7/Naruto-battle-game',
    tags: ['C++', 'SFML', 'Box2D']
  },
  {
    id: 2,
    title: '博客前端',
    description: '基于 Vue3 框架开发的前端系统',
    poster: '/project/blog.webp',
    link: 'https://github.com/white66-7/blog',
    tags: ['Vue3', 'JavaScript', 'CSS']
  },
  {
    id: 3,
    title: '博客后端',
    description: '基于 SpringBoot 框架开发的后端系统',
    poster: '/project/blog.webp',
    link: 'https://github.com/white66-7/java-backend',
    tags: ['SpringBoot', 'Java', 'IDEA']
  }
])
const currentPoster = ref('')
const previewImage = ref(null)
const movePreview = (e) => {
  if (!previewImage.value) return
  previewImage.value.style.left = e.clientX + 30 + 'px'
  previewImage.value.style.top = e.clientY + 30 + 'px'
}
const showPreview = (project) => {
  currentPoster.value = project.poster
  if (previewImage.value) {
    previewImage.value.style.opacity = 1
    previewImage.value.style.transform = 'scale(1)'
  }
}
const hidePreview = () => {
  if (previewImage.value) {
    previewImage.value.style.opacity = 0
    previewImage.value.style.transform = 'scale(.9)'
  }
}
</script>

<style scoped>
#projects {
  width: 100%;
  padding: 5rem 3rem;
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
  /* 强制全大写 */
  display: flex;
  /* 让伪元素横线能对齐 */
  align-items: center;
  /* 垂直居中 */
  gap: 12px;
  /* 文字和横线的间距 */
}

.section-label::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #D8D2C8;
  /* 或你喜欢的颜色，比如 #0047FF 或 #6B6560 */
  max-width: 60px;
  /* 控制横线最长宽度 */
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
  transition: .3s;
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
  font-weight: 600px;
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

.project-preview {
  position: fixed;
  left: 0;
  top: 0;
  width: 260px;
  height: 160px;
  object-fit: cover;
  opacity: 0;
  pointer-events: none;
  z-index: 9999;
  transform: scale(.9);
  transition: opacity .25s ease, transform .25s ease;
  border: 1px solid #D8D2C8;
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

  .project-preview {
    display: none;
  }

  .project-name {
    font-size: 24px;
  }
}
</style>