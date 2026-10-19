import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  base: '/',
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  optimizeDeps: {
    exclude: ['mongodb', '@vercel/node', 'api'],
    // 👇 新增：阻止 Vite 依赖扫描时触碰 api 目录
    entries: ['index.html', '!api/**']
  },
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 5173,
    host: true,
    // 代理拦截 /api 请求
    proxy: {
      '/api': {
        target: 'http://localhost:3000', 
        changeOrigin: true
      }
    },
    //忽略 api 目录的热更新监听
    watch: {
      ignored: ['**/api/**']
    }
  },
  build: {
    sourcemap: false,
    assetsInlineLimit: 4096,
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      // 打包时把 api 当作外部依赖，绝不打包进去
      external: [/^\/api\//],
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('markdown-it') || id.includes('highlight.js')) {
              return 'vendor-markdown'
            }
            if (id.includes('vue') || id.includes('vue-router') || id.includes('pinia')) {
              return 'vendor-vue'
            }
            if (id.includes('axios')) {
              return 'vendor-utils'
            }
          }
        },
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: 'assets/[ext]/[name]-[hash].[ext]'
      }
    }
  }
})