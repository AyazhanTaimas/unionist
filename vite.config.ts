import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

const port = Number(process.env.PORT ?? process.env.VITE_PORT ?? 5173)
const apiTarget = process.env.VITE_DEV_API_TARGET ?? 'http://localhost:8000'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port,
    allowedHosts: true,
    proxy: {
      '/api': {
        target: apiTarget,
        changeOrigin: true,
      },
    },
  },
})
