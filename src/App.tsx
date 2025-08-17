import { Routes, Route } from 'react-router-dom'
import { motion } from 'framer-motion'
import Navigation from './components/Navigation'
import HomePage from './pages/HomePage'
import StudyPage from './pages/StudyPage'
import PracticePage from './pages/PracticePage'
import ExamPage from './pages/ExamPage'
import GamePage from './pages/GamePage'

// 這是我們應用的主要組件
// 使用 React Router 來管理不同的頁面
function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500">
      {/* 導航欄組件 */}
      <Navigation />
      
      {/* 主要內容區域 */}
      <main className="container mx-auto px-4 py-8">
        <Routes>
          {/* 首頁路由 */}
          <Route path="/" element={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <HomePage />
            </motion.div>
          } />
          
          {/* 學習頁面路由 */}
          <Route path="/study" element={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <StudyPage />
            </motion.div>
          } />
          
          {/* 練習頁面路由 */}
          <Route path="/practice" element={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <PracticePage />
            </motion.div>
          } />
          
          {/* 考試頁面路由 */}
          <Route path="/exam" element={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <ExamPage />
            </motion.div>
          } />
          
          {/* 遊戲頁面路由 */}
          <Route path="/game" element={
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <GamePage />
            </motion.div>
          } />
        </Routes>
      </main>
    </div>
  )
}

export default App

