<div align="center">

# 一路向北

**基于 Vue 3 构建的个人博客**

[![Vue](https://img.shields.io/badge/Vue-3.5-4FC08D.svg?style=flat-square&logo=vuedotjs&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6.svg?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF.svg?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Pinia](https://img.shields.io/badge/Pinia-3.0-FFD859.svg?style=flat-square&logo=pinia&logoColor=black)](https://pinia.vuejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)

<p align="center">
  <a href="#项目概述">项目概述</a> •
  <a href="#功能特性">功能特性</a> •
  <a href="#路由架构">路由架构</a> •
  <a href="#技术栈">技术栈</a> •
  <a href="#本地开发">本地开发</a> •
</p>

---

</div>

## 项目概述

本项目是博客网页。前端基于 Vue 3 与 Vite 构建，后端通过 vercel 无服务器 typescript 函数部署

---

## 功能特性

### 文章
- **Markdown 引擎**：基于 `markdown-it` 解析排版，搭配 `highlight.js` 实现代码语法高亮。
- **记忆化**：缓存长文章的滚动浏览进度，返回时定位。

### 音乐播放
- **数据解析**：利用 `music-metadata` 自动提取音频文件的 ID3 标签与高清封面图。
- **播放控制**：顺序、循环、随机播放模式，具备进度拖拽、音量调节及本地历史回放能力。

### 动画
- **SVG 开场动画**：书法风 SVG 加载过渡。
- **流畅动效**：基于 GSAP 与 SnapSVG 驱动页面切换及图形动态绘制。
- **相册与灯箱**：相册书架，图片灯箱与视频格式兼容。
- **GitHub 生态联动**：贡献日历热力墙，后端拉取,展示肌肉。

### 架构与体验
- **状态与缓存**：基于 Pinia 状态管理与 `keep-alive` 实现的状态留存。
- **自适应设计**：移动端响应式布局适配。
---

## 路由架构

| 路由路径 | 对应组件 | 功能说明 |
| :--- | :--- | :--- |
| `/` | `BlogHome` | 博客主页 |
| `/articles` | `MainArticle` | 文章列表 |
| `/article/:id` | `ArticleDetail` | 文章内容详情页 |
| `/photos` | `Photo` | 媒体画廊 |
| `/projects` | `Projects` | GitHub 开源项目与贡献热力展示 |
| `/player` | `MusicPlayer` | 音乐播放器界面 |
| `/player/songs` | `SongList` | 歌曲曲库列表 |
| `/player/playlists` | `Playlist` | 播放歌单管理 |
| `/about` | `About` | 留言与个人 |

---

## 技术栈

| 分类 | 核心技术 / 依赖 | 说明 |
| :--- | :--- | :--- |
| **核心框架** | Vue 3 + TypeScript | Composition API 开发架构 |
| **构建工具** | Vite | 生产构建 |
| **状态与路由** | Pinia + Vue Router | 集中状态管理缓存控制 |
| **网络请求** | Axios | API 交互与拦截处理 |
| **样式与动效** | Sass + Animate.css + GSAP | 样式处理与高性能动画 |
| **图形与媒体** | SnapSVG + Swiper + Music-Metadata | 矢量绘图、滑动视差与音频解析 |
| **内容解析** | Markdown-it + Highlight.js | 文档渲染与多语言语法高亮 |

---

## 项目结构

```text
vue-frontend/
└── blog/
    ├── src/
    │   ├── assets/               # 静态资源（字体、图标、全局图片）
    │   ├── config/               # 媒体与全局配置文件
    │   ├── date/                 # 文章 Markdown 源文件与元数据
    │   ├── modules/              # 业务领域模块
    │   │   ├── bloghome/         # 首页模块
    │   │   │   └── components/
    │   │   │       ├── articles/ # 文章列表 / 详情 / 检索组件
    │   │   │       ├── photos/   # 画廊展示 / 灯箱预览组件
    │   │   │       ├── projects/ # 贡献热力图 / 数据统计组件
    │   │   │       └── about/    # 技能展示 / 独立时钟挂件
    │   │   └── player/           # 独立音乐播放器模块
    │   │       ├── components/   # 播放控制器 / 列表 / 侧栏
    │   │       └── utils/        # 封面解码 / 本地存储 / 格式化工具
    │   ├── router/               # 路由定义与导航拦截
    │   ├── stores/               # 全局 Pinia Store
    │   ├── views/                # 顶层视口与加载过渡页
    │   ├── App.vue               # 根组件
    │   └── main.ts               # 入口引导文件
    ├── vite.config.ts            # Vite 构建配置
    ├── tsconfig.json             # TypeScript 类型检查配置
    └── package.json
```

---

## 本地开发

### 环境准备
- Node.js 20+
- npm 或 pnpm

### 常用命令

```bash
# 进入前端项目目录
cd blog

# 安装依赖
npm install

# 启动本地开发服务（热重载）
npm run dev

# 执行 TypeScript 类型检查
npm run type-check

# 构建生产产物（输出至 dist 目录）
npm run build

# 本地预览生产构建产物
npm run preview
```
---

## 开源协议与版权声明

本项目基于 **非商业许可协议** 进行代码公开：

- **技术代码**：仅供个人技术研究与学习交流，**严禁任何商业盈利、二次售卖或商业使用**。
- **原创内容**：本博客内所有**文章、摄影与多媒体资源**均保留全部著作权，未经明确授权，禁止任何形式的抄袭、搬运与爬取。
- 详见完整许可：[LICENSE](LICENSE)。