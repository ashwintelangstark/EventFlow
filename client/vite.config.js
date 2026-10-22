import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false
      },
      '/landing': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false,
        bypass: (req) => {
          if (req.url && req.url.endsWith('.mp4')) {
            return req.url;
          }
        }
      },
      '/static': {
        target: 'http://localhost:5001',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
