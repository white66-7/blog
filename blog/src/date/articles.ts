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
  content: string   // 新增：Markdown 正文
}


export const articles: Article[] = [
  {
    id: 1,
    title: '对网页设计回调设计的理解 ',
    type: '无',
    date: '2026-06-15',
    readTime: '无',
    excerpt: '无',
    tags: ['vue3', '前端'],
    cover: '',
    layout: 'horizontal',
    content:` # 对网页设计回调设计的理解<br>老实说非常难受啊
    
    #什么意思
    
    达瓦达瓦`,
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
    cover: '',
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