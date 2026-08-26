import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  base: '/', // 👈 显式指定根路径基准，避免任何子路由解析异常
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
  }
})