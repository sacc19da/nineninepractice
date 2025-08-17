
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 動態設定 base 路徑：本地為 /，部署自動抓 repo 名稱
const repoName = process.env.GITHUB_REPOSITORY?.split('/')[1] || '';
const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  base: isProd && repoName ? `/${repoName}/` : '/',
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  }
})

