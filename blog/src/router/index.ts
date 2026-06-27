import { createRouter, createWebHistory } from 'vue-router'
import Bloghome from '@/views/bloghome.vue'
import musicPlayer from '@/views/music-player.vue'
import SongsView from '@/modules/player/components/songsview.vue'
import PlaylistsView from '@/modules/player/components/Playlistsview.vue'
import QQContact from '@/modules/bloghome/views/qq.vue'
import WechatContact from '@/modules/bloghome/views/wechat.vue'
import mainarticle from '@/modules/bloghome/components/articles/mainarticle.vue'
import Photos from '@/modules/bloghome/components/photos/photo.vue'
import projects from '@/modules/bloghome/components/projects/github.vue'

const ArticleDetail = () => import('@/modules/bloghome/components/articles/ArticleDetail.vue')

export const articleScrollCache = new Map<number, number>()

const routes = [
  {
    path: '/',
    name: 'blog',
    component: Bloghome
  },
  {
    path:'/photos',
    name: 'photo-show',
    component: Photos
  },
  {
    path:'/projects',
    name: 'github',
    component: projects
  },
  {
    path: '/qq',
    name: 'qq-contact',
    component: QQContact
  },
  {
    path: '/wechat',
    name: 'wechat-contact',
    component: WechatContact
  },
  {
    path: '/player',
    component: musicPlayer,
    children: [
      { path: 'songs', component: SongsView },
      { path: 'playlists', component: PlaylistsView },
      { path: '', redirect: '/player/playlists' }
    ]
  },
  {
    path: '/articles',
    name: 'mainarticle',
    component: mainarticle
  },
  {
    path: '/article/:id',
    name: 'ArticleDetail',
    component: ArticleDetail
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