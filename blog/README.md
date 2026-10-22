# music-player

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Type Support for `.vue` Imports in TS

TypeScript cannot handle type information for `.vue` imports by default, so we replace the `tsc` CLI with `vue-tsc` for type checking. In editors, we need [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) to make the TypeScript language service aware of `.vue` types.

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

## Redis 缓存（可选）

Vercel 的 Serverless Function 是无状态的，实例随时会创建/销毁，因此缓存不能放在函数内存里。
本项目通过 **Upstash 官方 SDK（`@upstash/redis`，内部走 HTTP REST）** 访问 Redis，
而不是 ioredis 这类 TCP 长连接：每条命令都是一次独立 HTTPS 请求，不会出现连接池耗尽或冷启动握手的问题。
客户端每次调用时新建（REST 客户端本身不持有长连接，构造成本接近于零），不在模块级缓存实例。

### 配置方式

在 Vercel 控制台给项目添加环境变量（Production / Preview / Development 都建议加）：

| 变量 | 说明 |
| --- | --- |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis REST Token |
| `KV_REST_API_URL` / `KV_REST_API_TOKEN` | 使用 Vercel KV 时的等价变量 |
| `REDIS_KEY_PREFIX` | 缓存键前缀，默认 `blog`，多环境共用时可隔离 |
| `REDIS_TIMEOUT_MS` | 单条命令超时，默认 `1200` 毫秒 |
| `CACHE_DISABLED` | 设为 `true` 可临时关闭全部缓存 |

最省事的方式是在 Vercel 项目的 **Storage / Marketplace** 里创建一个 Upstash Redis 并 Connect 到项目，
平台会自动注入 REST URL 和 Token；也可以手动 `vercel env add` 后重新部署。

> 未配置这些变量时，所有缓存函数会安静地跳过，接口行为和以前完全一致，不会报错。

> 延迟小贴士：Upstash 数据库区域尽量选在 Vercel Function 同区域（不配置时函数默认 `iad1`），
> 跨区域会让每条 Redis 命令多出 100ms 以上，缓存的意义就被抵消了。

### 缓存了哪些数据

| 接口 | 缓存键 | 时长 | 失效方式 |
| --- | --- | --- | --- |
| `GET /api/views` | `views:all:v1` | 120s | 浏览量 +1 时写穿更新 |
| `GET /api/commits-timeline` | `commits:timeline:v1` | 600s | `/api/sync-commits` 同步完成后主动删除 |
| `GET /api/contributions` | `github:contributions:v1` | 1800s | 到期自动失效（空结果不缓存） |
| `GET /api/weather` | `weather:<lat>:<lon>` | 600s | 到期自动失效 |
| `GET /api/signals`（访客） | `signals:approved:v1` | 60s | 管理员审核后主动删除 |
| `POST /api/signals` | `ratelimit:signals:<ipHash>` | 60s | 固定窗口限流 |

静态图片、音频、Markdown 等资源本身仍由前端 `public/` 目录直接托管，不经过 Redis；
Redis 只缓存 MongoDB 查询结果和第三方接口结果，用来降低数据库压力与接口延迟。

