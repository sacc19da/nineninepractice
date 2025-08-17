import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import './index.css'

// 這是 React 應用的入口點
// ReactDOM.createRoot 會將我們的 React 應用掛載到 HTML 中的 #root 元素
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* BrowserRouter 提供路由功能，讓我們的應用可以有多個頁面 */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
)

