import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  root: 'apps/web',
  publicDir: '../../public',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./apps/web/src', import.meta.url)),
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:4317',
    },
  },
  build: {
    outDir: '../../dist/web',
    emptyOutDir: true,
  },
})
