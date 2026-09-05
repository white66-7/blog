import { createRouter, createWebHistory } from 'vue-router'

// 💡 导出文章滚动位置缓存（保持原样）
export const articleScrollCache = new Map<number, number>()

const routes = [
  {
    path: '/',
    name: 'blog',
    //  1. 首页动态懒加载
    component: () => import('@/views/bloghome.vue')
  },
  // router/index.ts
  {
    path: '/sys-console-9273', 
    name: 'AdminSignals',
    component: () => import('@/views/AdminSignals.vue')
  },
  {
    path: '/photos',
    name: 'photo-show',
    //  2. 相册模块动态懒加载（相册里的大图绝不会拖慢首屏）
    component: () => import('@/modules/bloghome/components/photos/photo.vue')
  },
  {
    path: '/projects',
    name: 'github',
    //  3. GitHub 开源项目页懒加载
    component: () => import('@/modules/bloghome/components/projects/projects.vue')
  },
  {
    path: '/player',
    //  4. 音乐播放器及其子视图按需加载
    component: () => import('@/views/music-player.vue'),
    children: [
      { path: 'songs', component: () => import('@/modules/player/components/songsview.vue') },
      { path: 'playlists', component: () => import('@/modules/player/components/Playlistsview.vue') },
      { path: '', redirect: '/player/playlists' }
    ]
  },
  {
    path: '/articles',
    name: 'mainarticle',
    //  5. 文章列表页懒加载
    component: () => import('@/modules/bloghome/components/articles/mainarticle.vue')
  },
  {
    path: '/article/:id',
    name: 'ArticleDetail',
    component: () => import('@/modules/bloghome/components/articles/ArticleDetail.vue')
  },
  {
    path: '/about',
    name: 'about',
    //  7. 关于页懒加载
    component: () => import('@/modules/bloghome/components/about/about.vue')
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.name === 'ArticleDetail') {
      const id = Number(to.params.id)
      const cachedY = articleScrollCache.get(id)

      if (cachedY !== undefined) {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({ top: cachedY, behavior: 'instant' as const })
          }, 0)
        })
      }
      return { top: 0 }
    }
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0, behavior: 'smooth' }
  }
})

export default router