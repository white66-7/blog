export interface Article {
  id: number
  title: string
  type: string
  date: string
  readTime: string
  excerpt: string
  tags: string[]
  cover: string
  layout: string
  content: string   
}

import md1 from './md/1.md?raw'
import md2 from './md/2.md?raw'
import md3 from './md/3.md?raw'
import md4 from './md/4.md?raw'
import md5 from './md/5.md?raw'
import md7 from './md/7.md?raw'

export const articles: Article[] = [
  {
    id: 1,
    title: '从零开始的进阶之路',
    type: 'reflict',
    date: '2026-06-14',
    readTime: '10 minutes',
    excerpt: '那是一个月黑风高的白天...',
    tags: ['vue3', '前端','网站构建'],
    cover: '/covers/text.webp',
    layout: 'horizontal',
    content: md1
  },
  {
    id: 2,
    title: '论新手写的第一个网页能有多shit',
    type: '吐槽',
    date: '2026-06-16',
    readTime: '2 minutes',
    excerpt: '记得5月末写完第一个网页时认为逻辑缜密,甚至于发了个抖音,待到后来复盘时发现漏洞很多,这篇文章做个反省',
    tags: ['html', 'css','javascript'],
    cover: '/covers/game.webp',
    layout: 'vertical',    
       content:md2,
  },
  {
    id: 3,
    title: '浅谈如何实现实时天气动画组件设计',
    type: '技术',
    date: '2026-06-17',
    readTime: '5 minute',
    excerpt: '列出常用前端网站并浅谈实时天气组件',
    tags: ['组件式设计', '实时天气'],
    cover: '/covers/person.webp',
    layout: 'reverse-horizontal', 
    content:md3,
  },
  {
    id: 4,
    title: '浅谈如何实现相册组件设计',
    type: '技术',
    date: '2026-06-19',
    readTime: '5 minutes',
    excerpt: '承接上文,解析我的相册组件设计',
    tags: ['组件式设计', '相册展示'],
    cover: '/covers/left.webp',
    layout: 'horizontal',
    content:md4,
  },
    {
    id: 5,
    title: '双网页视图,页面深色遮罩与滚动优化',
    type: '技术',
    date: '2026-06-13',
    readTime: '10 minutes',
    excerpt: '浅谈一下波浪动画,页面深色遮罩,上下双页面和磁吸一般的滚动效果如何实现',
    tags: ['组件式设计', 'swiper'],
    cover: '/covers/animation.webp',
    layout: 'vertical',
    content:md5,
  },
      {
    id: 6,
    title: '举几个我最喜欢用到悬停动画效果如何实现',
    type: '技术',
    date: '2026-06-25',
    readTime: '3 minutes',
    excerpt: '这张记录几个我最喜欢的悬停效果,适合用在按钮或者想被注意到的地方',
    tags: ['css', 'animation','动画'],
    cover: '/covers/like.webp',
    layout: 'reverse-horizontal',
    content:`   `,
  },
        {
    id: 7,
    title: '看re0第四季十一集的感动瞬间',
    type: '动漫',
    date: '2026-06-20',
    readTime: '2 minutes',
    excerpt: 're0看到第十一集后发现,这季的人物刻画是真的生动深刻',
    tags: ['动漫', 're0'],
    cover: '/messages/7/re0.webp',
    layout: 'horizontal', 
       content:md7,
  },
]