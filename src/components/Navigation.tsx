import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'

// 導航項目配置
const navItems = [
  { path: '/', label: '首頁', icon: '🏠' },
  { path: '/study', label: '學習', icon: '📚' },
  { path: '/practice', label: '練習', icon: '✏️' },
  { path: '/exam', label: '考試', icon: '📝' },
  { path: '/game', label: '遊戲', icon: '🎮' },
]

// 導航欄組件
function Navigation() {
  const location = useLocation() // 獲取當前頁面路徑

  return (
    <nav className="bg-white/90 backdrop-blur-sm shadow-lg border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* 網站標題 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center space-x-2"
          >
            <span className="text-2xl">🧮</span>
            <h1 className="text-xl font-bold text-gray-800 font-comic">
              99乘法練習
            </h1>
          </motion.div>

          {/* 導航選單 */}
          <div className="hidden md:flex space-x-1">
            {navItems.map((item, index) => (
              <motion.div
                key={item.path}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    location.pathname === item.path
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* 手機版選單按鈕 */}
          <div className="md:hidden">
            <button className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100">
              <span className="text-xl">☰</span>
            </button>
          </div>
        </div>

        {/* 手機版導航選單 */}
        <div className="md:hidden pb-4">
          <div className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  location.pathname === item.path
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navigation

