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
    excerpt: '基础知识 常用网站总结  网页样式及动画思路 vue3的基本应用',
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
## 网页的基础设计
当我一开始写网站时，我头皮发麻，一是我没有找到main函数入口，之前写的所有程序，都是在main函数中循环，触发设定的退出if结束程序，触发你的某些if走向不同的运行道路。但是网页的运行给我一种多线程错觉，即网页在同一时间能够处理多件事情，这几乎颠覆我的代码思路。

那么真的有那么玄幻吗，其实并非。这里引入一个概念，浏览器引擎是有监视器的，鼠标点击操作，滚轮划动，以及网页加载，网页卸载都是能被监视到的，main函数不过是换了一种形式，运用监视器在加载网页时触发main函数。至于多线程这回事我实在是难以讲明白,但是我觉得当你想明白时，你就已经明白了。
## vue框架的核心设计
vue3框架究竟做了什么改善呢，打个比方，起始的框架是整体的，像是用线编织一个人偶，当你要改动一处时，往往你是需要拆开一大部分，在存在的部分上重新开始织，而vue3框架的时分散的，像是用乐高搭这个人偶，搭好腿,手,头等等，再搭在一起,如果改动就可以把手拆下来单独重新改，改好后再装回去。另外，以前写两个网页是需要两个html文件的，代码更是臭上加臭。而vue3则大为不同。

为了实现这些目的，就需要牵扯出vue3的响应式设计和路由设计，

`
  },
  {
    id: 2,
    title: '无',
    type: '无',
    date: '2026-06-15',
    readTime: '无',
    excerpt: '无',
    tags: ['', ''],
    cover: '',
    layout: 'vertical',      // 纵向卡片
       content:`   `,
  },
  {
    id: 3,
    title: '无',
    type: '无',
    date: '2026-06-15',
    readTime: '无',
    excerpt: '无',
    tags: ['', ''],
    cover: '/covers/left.webp',
    layout: 'reverse-horizontal',  // 反向横向
       content:`   `,
  },
  {
    id: 4,
    title: '无',
    type: '无',
    date: '2026-06-15',
    readTime: '无',
    excerpt: '无',
    tags: ['', ''],
    cover: '',
    layout: 'horizontal',    // 新增：横向卡片
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
    layout: 'vertical',    // 新增：横向卡片
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
    layout: 'reverse-horizontal',    // 新增：横向卡片
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