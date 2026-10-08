import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Repo name on GitHub Pages: https://<user>.github.io/Dev-of-blood-donation/
const repoBase = process.env.VITE_BASE_PATH || '/Dev-of-blood-donation/'

export default defineConfig({
  base: repoBase,
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
