import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    base: mode === 'production' ? '/' : '/',
    server: {
      host: true,
      port: 5173,
    },
    build: {
      outDir: '../static',
      emptyOutDir: true,
    }
  }
})
