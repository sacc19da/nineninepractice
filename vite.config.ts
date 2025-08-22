
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 動態設定 base 路徑：本地為 /，部署為 /nineninepractice/
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'nineninepractice';
const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  base: isProd ? `/${repoName}/` : '/',
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
})

