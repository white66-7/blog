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


export const articles: Article[] = [
  {
    id: 1,
    title: '从零开始的进阶之路',
    type: 'reflict',
    date: '2026-06-15',
    readTime: '10 minutes',
    excerpt: '那是一个月黑风高的白天...',
    tags: ['vue3', '前端','网站构建'],
    cover: '/covers/img.webp',
    layout: 'horizontal',
    content:`
## 引言
这是我写好这个网页首页后的第一篇文章，可以说是热情程度最高的时候，因此置顶这篇带着饱满热情写的文章。

在写这个网页前其实我还写过另一个小网页，[点击显示](/messages/1/1.webp)。

原因呢就是当时一直用网易云，但是我呢又比较喜欢听周杰伦的稻香，晴天，搁浅等等，这就很矛盾。巧的是，某天刷b站刷到一个介绍html文档的视频，一闪而过的音乐播放界面瞬间给了我启发，后来我开始学这类知识，开始第一次写这类代码。

麻雀虽小，五脏俱全，虽然是一直被群嘲的localhost，但是初学者写起来也是蛮难的。因为它包含数据库交互，数据仓库管理，状态管理，状态刷新以及我认为最难理解的Preview对象。

后来我觉得那个播放器网页实在是不好维护，换句话说就是又臭又长。本着精益求精的想法，在recat和vue这两个框架中我选择了vue进行学习，老实说我上手很快，因为我发现vue的核心设计和C++的类与对象(面向对象编程)非常像，而我之前写的两个小游戏的基石就是类与对象。学完一些vue3基本的特性，我就想找个项目来练手，最后从零开始写了这个网页。
## 网页的初次尝试
当我一开始写网站时，我头皮发麻，一是我没有找到main函数入口，之前写的所有程序，都是在main函数中循环，触发设定的退出if结束程序，触发你的某些if走向不同的运行道路。但是网页的运行给我一种多线程错觉，即网页在同一时间能够处理多件事情，这几乎颠覆我的代码思路。

那么真的有那么玄幻吗，其实并非。这里引入一个概念，浏览器引擎是有监视器的，鼠标点击操作，滚轮划动，以及网页加载，网页卸载都是能被监视到的，main函数不过是换了一种形式，运用监视器在加载网页时触发main函数。至于多线程这回事我实在是难以讲明白,但是我觉得当你想明白时，你就已经明白了。
## vue框架的核心设计
vue3框架究竟做了什么改善呢，打个比方，起始的框架是整体的，像是用线编织一个人偶，当你要改动一处时，往往你是需要拆开一大部分，在剩余完善的部分重新开始织，而vue3框架的时分散的，像是用乐高搭这个人偶，搭好腿,手,头等等，再整合在一起,如果改动就可以把手拆下来单独重新改，改好后再装回去。另外，以前写两个网页是需要两个html文件的，代码更是臭上加臭。而vue3则利用组件式设计达到易维护，易修改的优势。

为了实现这些目的，就需要牵扯出vue3的响应式设计和路由设计，每个vue项目都有一个“路由器”用来管理不同的线路
\`\`\`javascript
import { createRouter, createWebHistory } from 'vue-router'
const routes = [
{
  path: '/',
  name: 'blog',
  component: Bloghome
},
{
  path: '/qq',
  name: 'qq-contact',
  component: QQContact
  },]
const router = createRouter({
  history: createWebHistory(),
  routes,
export default router
})
\`\`\`
其中path就是指具体的每条路径,compoent对应的就是组件,如果你要跳转网页那么他会自动切换你对应网页的组件呈现,而原来的组件一般都会被销毁,那么在这里我提个疑问以供思考，我的的音乐播放器是怎么做到在多个页面的跳转中实现歌曲不卡顿的呢，明明数据不是已经被销毁了吗，跳转回来的时候竟然如此丝滑，至于这个的原因，我想我会在下一篇具体讲解我这个网站的时候提及

那么什么是响应式设计呢，提两个最典型的特性，ref和computed,同时还不得不提数据特性paine,在原来的网页中，打个比方，歌曲点击下一首后，原来的网页通过监视器绑定，触发这个事件对应的函数，然后这个函数内部还得包含别的函数，比如渲染函数，销毁封面，总时间，作者，歌名后显示新的数据。相比之下,vue通过直接绑定html文档中的数据显示,
,用一个"形参"来代表显示数据，那么这个数据来源于哪里呢
是的，就是我之前提及的paine
\`\`\`javascript
import { defineStore } from 'pinia'
export const usePlayerStore = defineStore('player', () => {
  const currentSong = ref({ title: '稻香', id: 1 })
  function nextSong() { ... }
  return { currentSong, nextSong }
})

import { useLibraryStore } from '@/stores/libraryStore'
const libraryStore = useLibraryStore()
\`\`\`
通过导出一个形参usePlsyStore,这个形参包含return的所有内容,数据,处理函数,
然后这个对象在具体的组件中被导入后接着就被引用
\`\`\`html
 <div class="song-title">{{ currentSong.title }}</div>
 const currentSong = ref({
  title: '稻香',
  cover: '/covers/daoxiang.webp',
  id: 1
})
const currentLyrics = computed(() => {
  return currentSong.value.id
})
  function nextSong() {
  const next = getNextSong()
  currentSong.value = next
\`\`\`
当你点击按钮触发nextSong()后，currentSong的值被修改了，computed属性的currentLyrics检测到它依赖的currentSong 变了，自动重新计算，更新歌曲有关的显示
## 网页的基本布局
先简答介绍一下何为盒子模型,组件式的逻辑与这个具有强关联,在html文档中标明一个class属性,并且在css中引用他给他设计属性,而所谓的属性基础就是宽高，分为三层。第一层是内容区，显示你的文字，svg图标等等,第二层是内边距区,即padding,边界的一个外扩，当你想让按钮的可触面积变大时，想让字体在更大的可显示空间的时候,
一般都要使用他，第三层是外边，即是margin,标记距离下一个盒子模型的距离，当两个盒子模型并排的时候一个他们之间的间距不是外边距的相加，而是取两个之中更大的一个。而边框border则是纯纯的修饰性属性,相当于一个文字的描边
\`\`\`css
  .box-A {
  width: 100px;
  height: 40px;
  background-color: #007bff;
  color: white;
  padding: 20px 30px; 
  margin-bottom: 30px; 
  border-radius: 8px;
\`\`\`
接下来就是flex布局等等这个难点了,怎么设计一个网页的布局呢
}
`
  },
  {
    id: 2,
    title: '论新手写的第一个网页能有多shit',
    type: '吐槽',
    date: '2026-06-16',
    readTime: '2 minutes',
    excerpt: '记得5月末写完第一个网页时认为逻辑缜密,待到后来重新审视代码时发现其实漏洞摆出，一堆"幽灵数据"',
    tags: ['html', 'css','javascript'],
    cover: '/covers/boring.webp',
    layout: 'vertical',    
       content:`   `,
  },
  {
    id: 3,
    title: '浅谈如何实现借鉴比较好的前端组件设计',
    type: '技术',
    date: '2026-06-10',
    readTime: '5 minute',
    excerpt: '碰到比较好的代码如何改动放到自己的页面合适的位置,适配的大小,合适的布局呢?',
    tags: ['组件式设计', '前端'],
    cover: '/covers/left.webp',
    layout: 'reverse-horizontal', 
    content:``,
  },
  {
    id: 4,
    title: '压抑,我学生时代的写照',
    type: '自嘲',
    date: '2026-06-15',
    readTime: '3 minutes',
    excerpt: '每当我回想前19年,我总是陷入无尽的懊悔与无奈,因为每个错误的选择对当时我来说是必然选择的',
    tags: ['自传'],
    cover: '/covers/abdot.webp',
    layout: 'horizontal',
    content:`   `,
  },
    {
    id: 5,
    title: '无',
    type: '无',
    date: '2026-06-15',
    readTime: '无',
    excerpt: '无',
    tags: ['', ''],
    cover: '',
    layout: 'vertical',
       content:`   `,
  },
      {
    id: 6,
    title: '无',
    type: '无',
    date: '2026-06-15',
    readTime: '无',
    excerpt: '无',
    tags: ['', ''],
    cover: '',
    layout: 'reverse-horizontal',
       content:`   `,
  },
        {
    id: 7,
    title: '无',
    type: '无',
    date: '2026-06-15',
    readTime: '无',
    excerpt: '无',
    tags: ['', ''],
    cover: '',
    layout: 'horizontal',   // 新增：横向卡片
       content:`   `,
  },
]