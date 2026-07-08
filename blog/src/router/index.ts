import { createRouter, createWebHistory } from 'vue-router'

export const articleScrollCache = new Map<number, number>()

const routes = [
  {
    path: '/',
    name: 'blog',
    // 懒加载：只有访问该路由时，才会下载对应的代码包
    component: () => import('@/views/bloghome.vue')
  },
  {
    path:'/photos',
    name: 'photo-show',
    component: () => import('@/modules/bloghome/components/photos/photo.vue')
  },
  {
    path:'/projects',
    name: 'github',
    component: () => import('@/modules/bloghome/components/projects/github.vue')
  },
  {
    path: '/qq',
    name: 'qq-contact',
    component: () => import('@/modules/bloghome/views/qq.vue')
  },
  {
    path: '/wechat',
    name: 'wechat-contact',
    component: () => import('@/modules/bloghome/views/wechat.vue')
  },
  {
    path: '/player',
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