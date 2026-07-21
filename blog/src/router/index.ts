import { createRouter, createWebHistory } from 'vue-router'
import BlogHome from '@/views/bloghome.vue'
import PhotoShow from '@/modules/bloghome/components/photos/photo.vue'
import Github from '@/modules/bloghome/components/projects/projects.vue'
import QqContact from '@/modules/bloghome/views/qq.vue'
import WechatContact from '@/modules/bloghome/views/wechat.vue'
import MusicPlayer from '@/views/music-player.vue'
import SongsView from '@/modules/player/components/songsview.vue'
import PlaylistsView from '@/modules/player/components/Playlistsview.vue'
import MainArticle from '@/modules/bloghome/components/articles/mainarticle.vue'
import ArticleDetail from '@/modules/bloghome/components/articles/ArticleDetail.vue'
import About from '@/modules/bloghome/components/about/about.vue'

export const articleScrollCache = new Map<number, number>()

const routes = [
  {
    path: '/',
    name: 'blog',
    component: BlogHome
  },
  {
    path:'/photos',
    name: 'photo-show',
    component: PhotoShow
  },
  {
    path:'/projects',
    name: 'github',
    component: Github
  },
  {
    path: '/qq',
    name: 'qq-contact',
    component: QqContact
  },
  {
    path: '/wechat',
    name: 'wechat-contact',
    component: WechatContact
  },
  {
    path: '/player',
    component: MusicPlayer,
    children: [
      { path: 'songs', component: SongsView },
      { path: 'playlists', component: PlaylistsView },
      { path: '', redirect: '/player/playlists' }
    ]
  },
  {
    path: '/articles',
    name: 'mainarticle',
    component: MainArticle
  },
  {
    path: '/article/:id',
    name: 'ArticleDetail',
    component: ArticleDetail
  },
  {
    path: '/about',
    name: 'about',
    component: About
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