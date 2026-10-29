import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://api.jantajournal.in',
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        target: 'https://api.jantajournal.in',
        changeOrigin: true,
        secure: false
      }
    }
  }
})
