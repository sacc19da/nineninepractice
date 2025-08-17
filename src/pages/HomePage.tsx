import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

// 首頁組件 - 顯示歡迎訊息和功能導航
const HomePage: React.FC = () => {
  // 功能卡片資料
  const features = [
    {
      title: '學習乘法表',
      description: '熟悉九九乘法表，點擊查看詳細計算',
      icon: '📚',
      path: '/study',
      color: 'bg-gradient-to-br from-blue-400 to-blue-600'
    },
    {
      title: '練習模式',
      description: '選擇難度等級，練習乘法運算',
      icon: '✏️',
      path: '/practice',
      color: 'bg-gradient-to-br from-green-400 to-green-600'
    },
    {
      title: '考試測驗',
      description: '挑戰不同類型的考試，檢驗學習成果',
      icon: '📝',
      path: '/exam',
      color: 'bg-gradient-to-br from-purple-400 to-purple-600'
    },
    {
      title: '互動遊戲',
      description: '透過有趣的遊戲鞏固乘法概念',
      icon: '🎮',
      path: '/game',
      color: 'bg-gradient-to-br from-orange-400 to-orange-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-blue-100 to-purple-100 pb-8">
      {/* 主要內容區域 */}
      <div className="container mx-auto px-4 py-8">
        {/* 歡迎標題 */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-comic font-bold text-gray-800 mb-4">
            🎯 九九乘法學習樂園
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 font-rounded">
            讓我們一起快樂學習九九乘法吧！
          </p>
        </motion.div>

        {/* 功能卡片網格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.path}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link to={feature.path}>
                <div className={`${feature.color} rounded-2xl p-6 h-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2`}>
                  <div className="text-center">
                    <div className="text-4xl mb-4">{feature.icon}</div>
                    <h3 className="text-xl font-bold text-white mb-2 font-comic">
                      {feature.title}
                    </h3>
                    <p className="text-white/90 text-sm font-rounded">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* 鼓勵訊息 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center mt-12"
        >
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-3 font-comic">
              🌟 開始你的學習之旅
            </h2>
            <p className="text-gray-600 font-rounded">
              選擇上面的功能開始學習，每個模組都設計得很有趣，讓你在遊戲中掌握九九乘法！
            </p>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default HomePage;


