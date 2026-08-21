# 一路向北的站点 — 个人博客

> 从零开始的个人博客 SPA，** Vue 3 + Spring Boot **实现。
> 包含音乐播放、文章、照片、GitHub 展示等模块。

---

## 项目架构

```text
┌─────────────────────────────────────────────────────────────┐
│                   Vue 3 前端（SPA）                          │
│                                                             │
│  /                    → BlogHome  博客首页                    │
│  /photos              → photo     照片展示                    │
│  /projects            → projects  GitHub 项目展示              │
│  /articles            → mainarticle  文章列表                  │
│  /article/:id         → ArticleDetail 文章详情                │
│                         (markdown-it + highlight.js)        │
│  /player              → MusicPlayer（嵌套路由）                │
│   ├── /player/songs       → 歌曲列表                          │
│   └── /player/playlists   → 播放列表（默认跳转）                │
│  /about               → About  关于页面                        │
└─────────────────────────────────────────────────────────────┘
```
---
## 功能特性

- 文章展示：Markdown 渲染（markdown-it）+ 代码高亮（highlight.js），支持阅读位置记忆（滚动缓存）
- 音乐播放器：基于 music-metadata 解析音频元数据与封面，支持列表/随机/循环模式、音量、进度、本地存储回放
- GitHub 展示：贡献日历（自绘绿墙）+ 用户统计（公开仓库数）
- 动画交互：GSAP 驱动的页面动效 + SnapSVG 图形绘制
- 照片/相册：相册书架 + 灯箱浏览 + 视频兼容
- 加载屏：手写书法 SVG 开场动画（含朱砂印章 + 菊花 Loader）
- 趣味组件：短暂番茄钟等其他小功能
- 响应式设计：适配不同屏幕尺寸
- SPA 路由：Vue Router + keep-alive 页面缓存（首页/播放器/文章列表）

---

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | Vue 3 | ^3.5.32 |
| 构建工具 | Vite | ^8.0.8 |
| 语言 | TypeScript | ~6.0.0 |
| 状态管理 | Pinia | ^3.0.4 |
| 路由 | Vue Router | ^5.1.0 |
| HTTP 请求 | Axios | ^1.18.1 |
| CSS | Sass (sass-embedded) + animate.css | ^1.100.0 |
| Markdown 渲染 | markdown-it | ^14.3.0 |
| 代码高亮 | highlight.js | ^11.11.1 |
| 动画引擎 | GSAP | ^3.15.0 |
| 图形绘制 | SnapSVG (snapsvg-cjs) | ^0.0.6 |
| 轮播组件 | Swiper | ^12.2.0 |
| 音乐元数据 | music-metadata | ^11.14.0 |

---

## 项目结构

```text
vue-frontend/
└── blog/                         # Vue 3 前端
    ├── src/
    │   ├── assets/               # 图片、相册、字体等静态资源
    │   ├── config/song.ts        # 歌曲配置
    │   ├── date/                 # 文章数据（md/*.md + articles.ts）
    │   ├── modules/              # 业务模块
    │   │   ├── bloghome/         # 首页模块（文章/照片/项目/关于）
    │   │   │   └── components/
    │   │   │       ├── articles/ # 文章列表 + 详情 + 搜索
    │   │   │       ├── photos/   # 相册书架 + 灯箱
    │   │   │       ├── projects/ # GitHub 贡献墙 + 统计
    │   │   │       └── about/    # 关于页（技能/时钟/信息）
    │   │   └── player/           # 音乐播放器模块
    │   │       ├── components/   # 播放器界面 / 侧边栏 / 歌曲 / 播放列表
    │   │       └── utils/        # 封面提取 / 本地数据库 / 格式化
    │   ├── router/index.ts       # 路由配置
    │   ├── stores/               # Pinia store（audio / library）
    │   ├── views/                # 顶层视图（首页 / 播放器 / 加载屏）
    │   ├── App.vue
    │   └── main.ts
    ├── index.html
    ├── vite.config.ts
    ├── tsconfig.json
    └── package.json
```

---

## 本地开发

```bash
cd blog
npm install
npm run dev        # 开发服务器
npm run build      # 生产构建 → dist/
npm run preview    # 预览构建产物
npm run type-check # vue-tsc 类型检查
```

---

## 自动化部署（GitHub Actions）

推送 main 分支后自动构建 blog/，并通过 SSH 将 blog/dist/ 同步到宝塔服务器、修正权限：

- actions/checkout@v4、actions/setup-node@v4（Node 20）
- 构建：npm install && npm run build
- 部署：easingthemes/ssh-deploy@main 同步到 SERVER_PATH
- 权限：appleboy/ssh-action@v1 设置 www:www 及 755/644 权限

所需 Secrets：SSH_PRIVATE_KEY、SERVER_IP、SERVER_USER、SERVER_PATH

---

## License

MIT License