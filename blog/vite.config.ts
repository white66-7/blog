import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  base: '/', // 显式指定根路径基准，避免子路由解析异常
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'react-native-fs': path.resolve(__dirname, 'react-native-fs-shim.js')
    },
  },
  optimizeDeps: {
    exclude: ['mongodb', '@vercel/node']
  },
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
    host: true
  },
  build: {
    // 1. 关闭生产环境 sourcemap，大幅降低打包体积
    sourcemap: false,
    // 2. 只有小于 4KB 的微型小图标才转为 base64，防止大图撑爆 JS
    assetsInlineLimit: 4096,
    // 3. 提升单包超限报警阈值到 1500KB
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // 💡 核心性能分包策略（Chunk Splitting）
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // ① 把最笨重、体积最大的 Markdown 解析与语法高亮彻底剥离出首屏！
            // 只有当用户真正点击进入文章详情页时，浏览器才会按需下载它
            if (id.includes('markdown-it') || id.includes('highlight.js')) {
              return 'vendor-markdown'
            }
            // ② 把 Vue 全家桶单独打包，充分利用浏览器长期持久缓存
            if (id.includes('vue') || id.includes('vue-router') || id.includes('pinia')) {
              return 'vendor-vue'
            }
            // ③ 网络请求与工具库
            if (id.includes('axios')) {
              return 'vendor-utils'
            }
          }
        },
        // 规整输出目录，带有 hash 保证版本更新无缓存冲突
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    }
  }
})