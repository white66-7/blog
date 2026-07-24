# 个人博客网站（全栈）

> 从零开始手搓的个人博客网站，**Vue 3 前端** + **Spring Boot 后端**。  
> 前端集成了音乐、文章、项目等等模块；后端提供 GitHub 数据 API 支持。  
> 代码还在完善中

---
## 🏗️ 项目架构
```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Vue 3 前端（SPA）                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      页面路由结构 (Vue Router)                      │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │                                                                     │    │
│  │  /                   → BlogHome (博客首页)                         │    │
│  │   ├── 贡献日历 + 个人简介                                          │    │
│  │   └── 文章列表预览                                                 │    │
│  │                                                                     │    │
│  │  /photos            → PhotoShow (照片展示)                         │    │
│  │                                                                     │    │
│  │  /projects          → Github (GitHub 项目展示)                    │    │
│  │                                                                     │    │
│  │  /articles          → MainArticle (文章列表)                       │    │
│  │                                                                     │    │
│  │  /article/:id       → ArticleDetail (文章详情)                     │    │
│  │   └── markdown-it + highlight.js 渲染                              │    │
│  │                                                                     │    │
│  │  /player            → MusicPlayer (音乐播放器 - 嵌套路由)          │    │
│  │   ├── /player/songs      → SongsView (歌曲列表)                    │    │
│  │   └── /player/playlists  → PlaylistsView (播放列表)               │    │
│  │                                                                     │    │
│  │  /about             → About (关于页面)                             │    │
│  │                                                                     │    │
│  │  /qq                → QqContact (QQ 联系方式)                      │    │
│  │  /wechat            → WechatContact (微信联系方式)                 │    │
│  │                                                                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                       状态管理 (Pinia)                             │    │
│  │  userStore / musicStore / articleStore                             │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      HTTP 请求层 (Axios)                           │    │
│  │  ├── /api/contributions   → 贡献日历数据                           │    │
│  │  ├── /api/user-stats      → 用户统计信息                           │    │
│  │  └── /api/commits-timeline → 提交记录时间线                        │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         Spring Boot 后端（REST API）                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    Controller 层（接收请求）                        │    │
│  │  ContributionController                                             │    │
│  │  ├── GET /api/contributions      → 贡献日历                        │    │
│  │  ├── GET /api/user-stats         → 用户统计                        │    │
│  │  └── GET /api/commits-timeline   → 提交记录时间线                   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                      │                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    Service 层（业务逻辑）                           │    │
│  │  GitHubService                                                      │    │
│  │  ├── fetchContributions()  → 调用 GitHub GraphQL API              │    │
│  │  ├── fetchUserStats()      → 调用 GitHub REST API                │    │
│  │  └── saveCommits()         → 持久化到 H2 数据库                   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                      │                                     │
│          ┌───────────────────────────┼───────────────────────────┐         │
│          ▼                           ▼                           ▼         │
│  ┌───────────────┐           ┌───────────────┐           ┌───────────────┐ │
│  │  Repository   │           │  RestTemplate │           │  H2 数据库    │ │
│  │  (JPA操作)    │           │  (GitHub API) │           │  (本地文件)   │ │
│  └───────────────┘           └───────────────┘           └───────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
                          ┌───────────────────────┐
                          │   GitHub REST /       │
                          │   GraphQL API         │
                          └───────────────────────┘
```

---

## ✨ 功能特性

### 前端（Vue 3）

- 📝 **文章展示**：支持 Markdown 渲染 + 代码高亮
- 🎵 **音乐播放器**：基于 `music-metadata` 解析音频文件
- 📊 **GitHub 贡献日历**：从后端 API 获取数据并展示绿墙
- 🎨 **动画交互**：GSAP 驱动的页面动效
- 🖼️ **轮播展示**：Swiper 实现的图片/内容轮播
- 📱 **响应式设计**：适配不同屏幕尺寸
- 🔗 **路由管理**：Vue Router 实现 SPA 导航

### 后端（Spring Boot）

- 📅 **贡献日历 API**：获取 GitHub 用户贡献热力图数据
- 📊 **用户统计 API**：查询公开仓库数、粉丝数、账号创建时间
- 💾 **提交记录持久化**：将 Commit 数据存入 H2 数据库，支持时间线查询
- 🗄️ **H2 文件数据库**：数据持久化到本地，重启不丢失

---

## 🛠️ 技术栈

### 前端

| 类别 | 技术 |
|------|------|
| **框架** | Vue 3.5.32 |
| **构建工具** | Vite 8.0.8 |
| **语言** | TypeScript 6.0.0 |
| **状态管理** | Pinia 3.0.4 |
| **路由** | Vue Router 5.1.0 |
| **HTTP 请求** | Axios 1.18.1 |
| **CSS 框架** | Animate.css + Sass |
| **Markdown 渲染** | markdown-it + highlight.js |
| **动画引擎** | GSAP 3.15.0 |
| **轮播组件** | Swiper 12.2.0 |
| **音乐元数据** | music-metadata 11.14.0 |
| **贡献日历** | github-calendar 2.3.4 |

### 后端

| 组件 | 说明 |
|------|------|
| **框架** | Spring Boot 4.1.0 |
| **语言** | Java 17 |
| **构建工具** | Maven |
| **Web 层** | Spring MVC |
| **HTTP 客户端** | RestTemplate + WebFlux |
| **ORM** | Spring Data JPA |
| **数据库** | H2（文件模式：`./data/blog`） |

---

## 📦 核心依赖

### 前端（`blog/package.json`）

| 依赖 | 用途 |
|------|------|
| `vue` | 前端核心框架 |
| `vite` | 极速构建工具 |
| `pinia` | 轻量状态管理 |
| `vue-router` | 页面路由导航 |
| `axios` | API 请求（调用后端） |
| `markdown-it` | Markdown → HTML 解析 |
| `highlight.js` | 代码语法高亮 |
| `gsap` | 高级动画效果 |
| `swiper` | 触摸滑动轮播 |
| `music-metadata` | 音频文件元数据读取 |
| `github-calendar` | GitHub 贡献日历组件 |

### 后端（`demo/pom.xml`）

| 依赖 | 用途 |
|------|------|
| `spring-boot-starter-web` | Web 应用核心 |
| `spring-boot-starter-data-jpa` | JPA / Hibernate 持久化 |
| `spring-boot-starter-webflux` | 响应式支持（WebClient） |
| `h2` | H2 文件数据库 |

---

## 📁 项目结构
```text
project/
├── blog/                                    # Vue 3 前端
│   ├── src/
│   │   ├── api/
│   │   │   └── github.ts                    # 后端 API 调用
│   │   ├── assets/                          # 静态资源
│   │   │   ├── fonts/                       # 字体文件
│   │   │   ├── images/                      # 图片资源
│   │   │   └── styles/                      # 全局样式
│   │   ├── components/                      # 公共组件
│   │   ├── modules/                         # 业务模块
│   │   │   ├── bloghome/                    # 博客首页模块
│   │   │   │   ├── components/
│   │   │   │   │   ├── articles/
│   │   │   │   │   │   ├── mainarticle.vue     # /articles
│   │   │   │   │   │   └── ArticleDetail.vue   # /article/:id
│   │   │   │   │   ├── photos/
│   │   │   │   │   │   └── photo.vue           # /photos
│   │   │   │   │   ├── projects/
│   │   │   │   │   │   └── projects.vue        # /projects
│   │   │   │   │   └── about/
│   │   │   │   │       └── about.vue           # /about
│   │   │   │   └── views/
│   │   │   │       ├── bloghome.vue            # /
│   │   │   │       ├── qq.vue                  # /qq
│   │   │   │       └── wechat.vue              # /wechat
│   │   │   └── player/                      # 音乐播放器模块
│   │   │       ├── components/
│   │   │       │   ├── songsview.vue           # /player/songs
│   │   │       │   └── Playlistsview.vue       # /player/playlists
│   │   │       └── views/
│   │   │           └── music-player.vue        # /player (父路由)
│   │   ├── router/
│   │   │   └── index.ts                     # 路由配置（已提供）
│   │   ├── stores/                          # Pinia 状态管理
│   │   │   ├── userStore.ts
│   │   │   ├── musicStore.ts
│   │   │   └── articleStore.ts
│   │   ├── types/                           # TypeScript 类型定义
│   │   ├── App.vue
│   │   └── main.ts
│   ├── public/
│   ├── .env.development
│   ├── .env.production
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
│
├── demo/                                    # Spring Boot 后端
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   │   └── com/example/demo/
│   │   │   │       ├── DemoApplication.java
│   │   │   │       ├── controller/
│   │   │   │       │   └── ContributionController.java
│   │   │   │       ├── service/
│   │   │   │       │   └── GitHubService.java
│   │   │   │       ├── repository/
│   │   │   │       │   └── GithubCommitRepository.java
│   │   │   │       ├── entity/
│   │   │   │       │   └── GithubCommit.java
│   │   │   │       └── model/
│   │   │   │           └── ContributionCalendar.java
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   ├── data/
│   │   └── blog.mv.db
│   └── pom.xml
│
├── .github/workflows/
│   └── deploy.yml
├── .gitignore
└── README.md
```
🚀 本地开发
1. 启动后端（Spring Boot）
```bash
cd demo
mvn spring-boot:run
```

2. 启动前端（Vue 3）
```bash
cd blog
npm install
npm run dev
```

目前仅向服务器推送前端代码，网页呈现骨架屏
## 🤖 自动化部署
本项目已配置 GitHub Actions 持续集成/部署（CI/CD）工作流，推送代码后自动完成构建并同步至服务器。

配置文件位于 `.github/workflows/deploy.yml`：
