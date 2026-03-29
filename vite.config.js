import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/surf-trivia-game/',
  define: {
    __BUILD_VERSION__: JSON.stringify(
      `v1.${Math.floor(Date.now() / 1000)}`
    ),
    __BUILD_DATE__: JSON.stringify(new Date().toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    })),
  },
})
