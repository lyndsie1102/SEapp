import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: true,
    port: 5173,
    watch: {
      usePolling: true  // Needed for Docker
    },
    proxy: {
      '/search_images': {
        target: 'http://backend:5000',
        changeOrigin: true,
        rewrite: (path) => path,
      },
      '/search_audio': {
        target: 'http://backend:5000',
        changeOrigin: true,
        rewrite: (path) => path,
      }
    }
  },
})
