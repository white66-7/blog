import { createRouter, createWebHistory } from 'vue-router'
import Bloghome from '@/views/bloghome.vue'
import musicPlayer from '@/views/music-player.vue'
import SongsView from '@/modules/player/components/songsview.vue'
import PlaylistsView from '@/modules/player/components/Playlistsview.vue'
import QQContact from '@/modules/bloghome/views/qq.vue'
import WechatContact from '@/modules/bloghome/views/wechat.vue'
import mainarticle from '@/modules/bloghome/components/mainarticle.vue'
import Photos from '@/modules/bloghome/components/photo.vue'


const ArticleDetail = () => import('@/modules/bloghome/components/ArticleDetail.vue')

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
    if (savedPosition) {
      return savedPosition 
    } else {
      return { top: 0 } 
    }
  }
})

export default router