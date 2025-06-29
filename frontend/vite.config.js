import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://sonalikaj.onrender.com',
        changeOrigin: true,
        secure: true,
      },
    },
  },
})
