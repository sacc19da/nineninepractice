import { useState } from 'react'
import { motion } from 'framer-motion'
import Footer from '../components/Footer'

// 99乘法表數據生成函數
const generateMultiplicationTable = () => {
  const table = []
  for (let i = 1; i <= 9; i++) {
    const row = []
    for (let j = 1; j <= 9; j++) {
      row.push({
        multiplicand: i,
        multiplier: j,
        result: i * j,
        id: `${i}-${j}`
      })
    }
    table.push(row)
  }
  return table
}

// 學習頁面組件
function StudyPage() {
  const [selectedCell, setSelectedCell] = useState<string | null>(null)
  // 預設分組清單
  const [viewMode, setViewMode] = useState<'horizontal' | 'list'>('list')
  const multiplicationTable = generateMultiplicationTable()

  // 處理單元格點擊
  const handleCellClick = (cellId: string) => {
    setSelectedCell(cellId === selectedCell ? null : cellId)
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* 頁面標題 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-4">📚 99乘法表學習</h1>
        <p className="text-white/80 text-lg">點擊任何數字來查看詳細的乘法算式</p>
      </motion.div>

      {/* 控制面板 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8"
      >
        <div className="flex flex-wrap items-center justify-center gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-white font-medium">顯示模式：</span>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                viewMode === 'list'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              分組清單
            </button>
            <button
              onClick={() => setViewMode('horizontal')}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                viewMode === 'horizontal'
                  ? 'bg-primary-500 text-white'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              表格模式
            </button>
          </div>
        </div>
      </motion.div>

      {/* 乘法表顯示區域 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl shadow-xl p-6 overflow-x-auto"
      >
        {/* 表格模式 (橫式) */}
        {viewMode === 'horizontal' && (
          <div className="min-w-max">
            {/* 表頭 */}
            <div className="grid grid-cols-10 gap-1 mb-2">
              <div className="w-16 h-16 flex items-center justify-center font-bold text-gray-600 bg-gray-100 rounded-lg">
                ×
              </div>
              {Array.from({ length: 9 }, (_, i) => (
                <div key={i} className="w-16 h-16 flex items-center justify-center font-bold text-white bg-primary-500 rounded-lg">
                  {i + 1}
                </div>
              ))}
            </div>

            {/* 乘法表內容 */}
            {multiplicationTable.map((row, rowIndex) => (
              <div key={rowIndex} className="grid grid-cols-10 gap-1 mb-1">
                {/* 行標題 */}
                <div className="w-16 h-16 flex items-center justify-center font-bold text-white bg-primary-500 rounded-lg">
                  {rowIndex + 1}
                </div>
                
                {/* 乘法結果 */}
                {row.map((cell) => (
                  <motion.div
                    key={cell.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCellClick(cell.id)}
                    className={`number-cell cursor-pointer ${
                      selectedCell === cell.id ? 'ring-4 ring-primary-400 shadow-lg' : ''
                    }`}
                  >
                    {cell.result}
                  </motion.div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* 分組清單模式 (1x1=1...9x9=81) */}
        {viewMode === 'list' && (
          <div className="space-y-8">
            {Array.from({ length: 9 }, (_, i) => (
              <div key={i} className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-2xl font-bold text-primary-600 mb-6 text-center">
                  {i + 1} 的乘法表
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {Array.from({ length: 9 }, (_, j) => {
                    const multiplicand = i + 1
                    const multiplier = j + 1
                    const result = multiplicand * multiplier
                    const cellId = `${multiplicand}-${multiplier}`
                    return (
                      <motion.div
                        key={cellId}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleCellClick(cellId)}
                        className={`p-3 rounded-xl cursor-pointer transition-all text-center font-bold text-lg ${
                          selectedCell === cellId 
                            ? 'bg-primary-100 text-primary-700 border-2 border-primary-300 shadow-lg' 
                            : 'bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 border border-gray-200'
                        }`}
                      >
                        {multiplicand} × {multiplier} = {result}
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* 選中單元格的詳細信息 */}
      {selectedCell && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 bg-white rounded-2xl shadow-xl p-6"
        >
          <div className="text-center">
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              📖 乘法算式詳解
            </h3>
            {(() => {
              const [multiplicand, multiplier] = selectedCell.split('-').map(Number)
              const result = multiplicand * multiplier
              return (
                <div className="space-y-4">
                  <div className="text-6xl font-bold text-primary-600">
                    {multiplicand} × {multiplier} = {result}
                  </div>
                  <div className="text-gray-600">
                    <p className="text-lg">
                      {multiplicand} 乘以 {multiplier} 等於 {result}
                    </p>
                    <p className="text-sm mt-2">
                      這表示 {multiplicand} 個 {multiplier} 相加的結果
                    </p>
                  </div>
                </div>
              )
            })()}
          </div>
        </motion.div>
      )}

      {/* 學習提示 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 bg-white/10 backdrop-blur-sm rounded-2xl p-6"
      >
        <h3 className="text-xl font-bold text-white mb-4">💡 學習小貼士</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/90">
          <div>
            <h4 className="font-bold mb-2">🎯 記憶技巧</h4>
            <p>乘法表是對稱的，記住一半就能記住全部！</p>
          </div>
          <div>
            <h4 className="font-bold mb-2">⏰ 練習建議</h4>
            <p>每天練習10分鐘，比一次練習1小時更有效！</p>
          </div>
        </div>
      </motion.div>
      <Footer />
    </div>
  )
}

export default StudyPage



