import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Footer from '../components/Footer'

// 考試題目類型定義
interface ExamQuestion {
  id: number
  multiplicand: number
  multiplier: number
  result: number
  userAnswer: string
  isCorrect: boolean | null
}

// 考試配置
const examConfigs = [
  { name: '快速測驗', questions: 10, timeLimit: 300, color: 'from-green-400 to-green-600' },
  { name: '標準測驗', questions: 20, timeLimit: 600, color: 'from-blue-400 to-blue-600' },
  { name: '挑戰測驗', questions: 30, timeLimit: 900, color: 'from-purple-400 to-purple-600' }
]

// 考試頁面組件
function ExamPage() {
  const [_selectedExam, setSelectedExam] = useState<number | null>(null)
  const [questions, setQuestions] = useState<ExamQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [isExamStarted, setIsExamStarted] = useState(false)
  const [isExamComplete, setIsExamComplete] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [examStartTime, setExamStartTime] = useState<Date | null>(null)
  const [examEndTime, setExamEndTime] = useState<Date | null>(null)
  const [showCustomExam, setShowCustomExam] = useState(false)
  const [customExam, setCustomExam] = useState({
    questions: 15,
    timeLimit: 450,
    multiplicandMin: 1,
    multiplicandMax: 9,
    multiplierMin: 1,
    multiplierMax: 9
  })

  // 生成考試題目（確保不重複）
  const generateExamQuestions = (
    questionCount: number, 
    multiplicandMin: number = 1, 
    multiplicandMax: number = 9,
    multiplierMin: number = 1,
    multiplierMax: number = 9
  ) => {
    const examQuestions: ExamQuestion[] = []
    const usedCombinations = new Set<string>() // 用於追蹤已使用的組合
    
    let attempts = 0
    const maxAttempts = 1000 // 防止無限循環
    
    while (examQuestions.length < questionCount && attempts < maxAttempts) {
      const multiplicand = Math.floor(Math.random() * (multiplicandMax - multiplicandMin + 1)) + multiplicandMin
      const multiplier = Math.floor(Math.random() * (multiplierMax - multiplierMin + 1)) + multiplierMin
      
      // 檢查組合是否已使用過
      const combination = `${multiplicand}x${multiplier}`
      if (!usedCombinations.has(combination)) {
        usedCombinations.add(combination)
        examQuestions.push({
          id: examQuestions.length,
          multiplicand,
          multiplier,
          result: multiplicand * multiplier,
          userAnswer: '',
          isCorrect: null
        })
      }
      
      attempts++
    }
    
    return examQuestions
  }

  // 開始考試
  const startExam = (examIndex: number, useCustom = false) => {
    let config: { 
      questions: number, 
      timeLimit: number, 
      multiplicandMin: number, 
      multiplicandMax: number,
      multiplierMin: number,
      multiplierMax: number
    }
    
    if (useCustom) {
      config = customExam
    } else {
      const examConfig = examConfigs[examIndex]
      config = { 
        ...examConfig, 
        multiplicandMin: 1, 
        multiplicandMax: 9,
        multiplierMin: 1,
        multiplierMax: 9
      }
    }
    
    const examQuestions = generateExamQuestions(
      config.questions, 
      config.multiplicandMin, 
      config.multiplicandMax,
      config.multiplierMin,
      config.multiplierMax
    )
    
    setQuestions(examQuestions)
    setCurrentQuestionIndex(0)
    setScore(0)
    setTimeLeft(config.timeLimit)
    setIsExamStarted(true)
    setIsExamComplete(false)
    setShowResults(false)
    setExamStartTime(new Date())
    setSelectedExam(examIndex)
  }

  // 處理答案提交
  const handleAnswerSubmit = (answer: string) => {
    const currentQuestion = questions[currentQuestionIndex]
    const isCorrect = parseInt(answer) === currentQuestion.result
    
    // 更新當前題目
    const updatedQuestions = [...questions]
    updatedQuestions[currentQuestionIndex] = {
      ...currentQuestion,
      userAnswer: answer,
      isCorrect
    }
    setQuestions(updatedQuestions)
    
    // 更新分數
    if (isCorrect) {
      setScore(score + 1)
    }
    
    // 檢查是否完成所有題目
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      completeExam()
    }
  }

  // 完成考試
  const completeExam = () => {
    setIsExamComplete(true)
    setExamEndTime(new Date())
    setShowResults(true)
  }

  // 計時器效果
  useEffect(() => {
    let timer: number
    
    if (isExamStarted && !isExamComplete && timeLeft > 0) {
      timer = window.setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
    } else if (timeLeft === 0 && isExamStarted) {
      completeExam()
    }
    
    return () => {
      if (timer) clearTimeout(timer)
    }
  }, [timeLeft, isExamStarted, isExamComplete])

  // 格式化時間顯示
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // 計算考試用時
  const getExamDuration = () => {
    if (!examStartTime || !examEndTime) return 0
    return Math.round((examEndTime.getTime() - examStartTime.getTime()) / 1000)
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = questions.length > 0 ? (currentQuestionIndex / questions.length) * 100 : 0

  return (
    <div className="max-w-4xl mx-auto">
      {/* 頁面標題 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-4">📝 乘法考試</h1>
        <p className="text-white/80 text-lg">選擇考試類型或自定義考試，測試你的乘法能力</p>
      </motion.div>

      {/* 考試選擇 */}
      {!isExamStarted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 mb-8"
        >
          <h3 className="text-2xl font-bold text-white mb-6 text-center">選擇考試類型</h3>
          
          {/* 預設考試 */}
          <div className="mb-8">
            <h4 className="text-white font-medium mb-4">預設考試：</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {examConfigs.map((exam, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <button
                    onClick={() => startExam(index)}
                    className={`w-full p-6 rounded-2xl text-white font-bold transition-all bg-gradient-to-r ${exam.color} hover:shadow-xl`}
                  >
                    <div className="text-3xl mb-2">
                      {index === 0 ? '⚡' : index === 1 ? '📊' : '🏆'}
                    </div>
                    <div className="text-xl mb-2">{exam.name}</div>
                    <div className="text-sm opacity-90">
                      {exam.questions} 題 • {formatTime(exam.timeLimit)}
                    </div>
                  </button>
                </motion.div>
              ))}
            </div>
          </div>

          {/* 自定義考試 */}
          <div className="border-t border-white/20 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-medium">自定義考試：</h4>
              <button
                onClick={() => setShowCustomExam(!showCustomExam)}
                className="px-4 py-2 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
              >
                {showCustomExam ? '隱藏' : '顯示'}
              </button>
            </div>
            
            {showCustomExam && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-white/10 rounded-xl p-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        題目數量: {customExam.questions}
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="50"
                        value={customExam.questions}
                        onChange={(e) => setCustomExam({ ...customExam, questions: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        考試時間: {formatTime(customExam.timeLimit)}
                      </label>
                      <input
                        type="range"
                        min="60"
                        max="1800"
                        step="30"
                        value={customExam.timeLimit}
                        onChange={(e) => setCustomExam({ ...customExam, timeLimit: parseInt(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="space-y-4">
                    {/* 第一個數字範圍 */}
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">第一個數字範圍</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="tel"
                          min="1"
                          max="9"
                          value={customExam.multiplicandMin}
                          onChange={(e) => setCustomExam({ ...customExam, multiplicandMin: parseInt(e.target.value) || 1 })}
                          className="w-16 px-2 py-1 rounded border text-center"
                        />
                        <span className="text-white">到</span>
                        <input
                          type="tel"
                          min="1"
                          max="9"
                          value={customExam.multiplicandMax}
                          onChange={(e) => setCustomExam({ ...customExam, multiplicandMax: parseInt(e.target.value) || 9 })}
                          className="w-16 px-2 py-1 rounded border text-center"
                        />
                      </div>
                    </div>
                    
                    {/* 第二個數字範圍 */}
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">第二個數字範圍</label>
                      <div className="flex items-center space-x-2">
                        <input
                          type="tel"
                          min="1"
                          max="9"
                          value={customExam.multiplierMin}
                          onChange={(e) => setCustomExam({ ...customExam, multiplierMin: parseInt(e.target.value) || 1 })}
                          className="w-16 px-2 py-1 rounded border text-center"
                        />
                        <span className="text-white">到</span>
                        <input
                          type="tel"
                          min="1"
                          max="9"
                          value={customExam.multiplierMax}
                          onChange={(e) => setCustomExam({ ...customExam, multiplierMax: parseInt(e.target.value) || 9 })}
                          className="w-16 px-2 py-1 rounded border text-center"
                        />
                      </div>
                    </div>
                    
                    <button
                      onClick={() => startExam(-1, true)}
                      className="w-full px-6 py-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors font-bold"
                    >
                      開始自定義考試
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}

      {/* 考試進行中 */}
      {isExamStarted && !showResults && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {/* 考試資訊 */}
          <div className="flex justify-between items-center mb-6">
            <div className="text-sm text-gray-600">
              進度: {currentQuestionIndex + 1} / {questions.length}
            </div>
            <div className="text-sm text-gray-600">
              得分: {score} / {currentQuestionIndex}
            </div>
            <div className={`text-lg font-bold ${timeLeft <= 60 ? 'text-red-600' : 'text-gray-600'}`}>
              ⏰ {formatTime(timeLeft)}
            </div>
          </div>

          {/* 進度條 */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-8">
            <motion.div
              className="bg-primary-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>

          {/* 題目顯示 */}
          {currentQuestion && (
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQuestion.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="text-center"
              >
                <div className="text-6xl font-bold text-gray-800 mb-8">
                  {currentQuestion.multiplicand} × {currentQuestion.multiplier} = ?
                </div>
                
                {/* 答案輸入 */}
                <div className="flex justify-center">
                  <input
                    type="tel"
                    className="text-4xl font-bold text-center w-32 h-16 border-4 border-primary-300 rounded-xl focus:border-primary-500 focus:outline-none"
                    placeholder="?"
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const target = e.target as HTMLInputElement
                        if (target.value) {
                          handleAnswerSubmit(target.value)
                          target.value = ''
                        }
                      }
                    }}
                  />
                </div>

                {/* 快速答案按鈕 */}
                <div className="mt-8 grid grid-cols-5 gap-2 max-w-md mx-auto">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                    <button
                      key={digit}
                      onClick={() => {
                        const input = document.querySelector('input') as HTMLInputElement
                        if (input) {
                          input.value = input.value + digit.toString()
                        }
                      }}
                      className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-xl transition-colors"
                    >
                      {digit}
                    </button>
                  ))}
                </div>

                {/* 提交按鈕 */}
                <button
                  onClick={() => {
                    const input = document.querySelector('input') as HTMLInputElement
                    if (input && input.value) {
                      handleAnswerSubmit(input.value)
                      input.value = ''
                    }
                  }}
                  className="mt-6 btn-primary"
                >
                  提交答案
                </button>
              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>
      )}

      {/* 考試結果 */}
      {showResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">📊 考試結果</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-4 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">{score}</div>
                <div className="text-sm text-gray-600">正確題數</div>
              </div>
              <div className="bg-green-50 p-4 rounded-xl">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round((score / questions.length) * 100)}%
                </div>
                <div className="text-sm text-gray-600">正確率</div>
              </div>
              <div className="bg-purple-50 p-4 rounded-xl">
                <div className="text-2xl font-bold text-purple-600">
                  {formatTime(getExamDuration())}
                </div>
                <div className="text-sm text-gray-600">用時</div>
              </div>
            </div>

            {/* 成績評價 */}
            <div className="mb-8">
              {score === questions.length && (
                <div className="text-2xl text-green-600 font-bold">🏆 滿分！你是乘法大師！</div>
              )}
              {score >= questions.length * 0.9 && score < questions.length && (
                <div className="text-2xl text-blue-600 font-bold">🌟 優秀！表現很棒！</div>
              )}
              {score >= questions.length * 0.7 && score < questions.length * 0.9 && (
                <div className="text-2xl text-yellow-600 font-bold">👍 良好！繼續努力！</div>
              )}
              {score < questions.length * 0.7 && (
                <div className="text-2xl text-red-600 font-bold">📚 需要更多練習，加油！</div>
              )}
            </div>

            {/* 回顧清單 */}
            <div className="mt-8 text-left">
              <h3 className="text-xl font-bold text-gray-800 mb-4">作答回顧</h3>
              <div className="space-y-2">
                {questions.map((q, i) => (
                  <div key={q.id} className={`p-3 rounded-lg border ${q.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                    <div className="font-bold text-gray-800">
                      第 {i + 1} 題：{q.multiplicand} × {q.multiplier} = {q.result}
                    </div>
                    <div className="text-sm">
                      你的答案：<span className={q.isCorrect ? 'text-green-700 font-bold' : 'text-red-700 font-bold'}>{q.userAnswer || '未作答'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 重新考試按鈕 */}
            <button
              onClick={() => {
                setIsExamStarted(false)
                setShowResults(false)
                setSelectedExam(null)
              }}
              className="btn-primary text-lg"
            >
              再考一次
            </button>
          </div>
        </motion.div>
      )}
      <Footer />
    </div>
  )
}

export default ExamPage
