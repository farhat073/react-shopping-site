import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    postcss: './postcss.config.js',
    devSourcemap: true,
  },
  // Proxy only in development - production uses environment variables directly
  server: {
    proxy: {
      '/items': {
        target: process.env.VITE_DIRECTUS_URL || 'http://localhost:8055',
        changeOrigin: true,
        secure: false,
      },
      '/assets': {
        target: process.env.VITE_DIRECTUS_URL || 'http://localhost:8055',
        changeOrigin: true,
        secure: false,
      },
      '/auth': {
        target: process.env.VITE_DIRECTUS_URL || 'http://localhost:8055',
        changeOrigin: true,
        secure: false,
      },
      '/users': {
        target: process.env.VITE_DIRECTUS_URL || 'http://localhost:8055',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
