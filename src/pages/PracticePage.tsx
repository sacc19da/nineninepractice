import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Footer from '../components/Footer'

// 練習題目類型定義
interface Question {
  id: number
  multiplicand: number
  multiplier: number
  result: number
  userAnswer: string
  isCorrect: boolean | null
}

// 練習頁面組件
function PracticePage() {
  // 移除預設難度，僅保留自訂範圍
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [totalAnswered, setTotalAnswered] = useState(0)
  const [_isPracticeComplete, setIsPracticeComplete] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [feedback, setFeedback] = useState<{ text: string; color: 'green' | 'red' } | null>(null)
  const [customRange, setCustomRange] = useState({ 
    multiplicandMin: 1, 
    multiplicandMax: 9,
    multiplierMin: 1, 
    multiplierMax: 9 
  })
  const [awaitingNext, setAwaitingNext] = useState(false)

  // 生成隨機練習題（確保不重複），可傳入自訂範圍以避免非同步問題
  const generateQuestions = (range = customRange) => {
    const mMin = Math.max(1, Math.min(9, Math.min(range.multiplicandMin, range.multiplicandMax)))
    const mMax = Math.max(1, Math.min(9, Math.max(range.multiplicandMin, range.multiplicandMax)))
    const nMin = Math.max(1, Math.min(9, Math.min(range.multiplierMin, range.multiplierMax)))
    const nMax = Math.max(1, Math.min(9, Math.max(range.multiplierMin, range.multiplierMax)))

    const newQuestions: Question[] = []
    const usedCombinations = new Set<string>()
    let attempts = 0
    const maxAttempts = 1000

    while (newQuestions.length < 10 && attempts < maxAttempts) {
      const multiplicand = Math.floor(Math.random() * (mMax - mMin + 1)) + mMin
      const multiplier = Math.floor(Math.random() * (nMax - nMin + 1)) + nMin
      const combination = `${multiplicand}x${multiplier}`
      if (!usedCombinations.has(combination)) {
        usedCombinations.add(combination)
        newQuestions.push({
          id: newQuestions.length,
          multiplicand,
          multiplier,
          result: multiplicand * multiplier,
          userAnswer: '',
          isCorrect: null
        })
      }
      attempts++
    }
    return newQuestions
  }

  // 開始新的練習（使用當前 customRange）
  const startNewPractice = () => {
    const newQuestions = generateQuestions()
    setQuestions(newQuestions)
    setCurrentQuestionIndex(0)
    setTotalAnswered(0)
    setIsPracticeComplete(false)
    setShowResults(false)
    setFeedback(null)
    setAwaitingNext(false)
  }

  // 快速啟動（指定範圍）
  const startNewPracticeWith = (range: { multiplicandMin: number; multiplicandMax: number; multiplierMin: number; multiplierMax: number }) => {
    const newQuestions = generateQuestions(range)
    setCustomRange(range)
    setQuestions(newQuestions)
    setCurrentQuestionIndex(0)
    setTotalAnswered(0)
    setIsPracticeComplete(false)
    setShowResults(false)
    setFeedback(null)
    setAwaitingNext(false)
  }

  // 一鍵只練某段（固定第一個數字 n × 1..9）
  const quickFirst = (n: number) => {
    startNewPracticeWith({ multiplicandMin: n, multiplicandMax: n, multiplierMin: 1, multiplierMax: 9 })
  }
  // 一鍵只練某段（固定第二個數字 1..9 × n）
  const quickSecond = (n: number) => {
    startNewPracticeWith({ multiplicandMin: 1, multiplicandMax: 9, multiplierMin: n, multiplierMax: n })
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

    // 顯示本題正確答案（不論對錯，不計分）
    const correctText = `${currentQuestion.multiplicand} × ${currentQuestion.multiplier} = ${currentQuestion.result}`
    setFeedback({
      text: `你的答案：${answer}，正確答案：${correctText}`,
      color: isCorrect ? 'green' : 'red'
    })
    setTotalAnswered(totalAnswered + 1)
    // 進入等待下一題狀態，由使用者手動前進
    setAwaitingNext(true)
  }

  // 初始化練習（只在組件掛載時執行一次）
  useEffect(() => {
    if (questions.length === 0) {
      startNewPractice()
    }
  }, [])

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
        <h1 className="text-4xl font-bold text-white mb-4">✏️ 乘法練習</h1>
        <p className="text-white/80 text-lg">設定自訂練習範圍，練你不熟的區段</p>
      </motion.div>

      {/* 自訂範圍設定 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8"
      >
        <h3 className="text-xl font-bold text-white mb-4">設定練習範圍</h3>
        <div className="bg-white/10 rounded-xl p-4">
          <div className="space-y-4">
            {/* 第一個數字範圍 */}
            <div className="flex flex-wrap items-center gap-4 justify-center">
              <span className="text-white">第一個數字範圍：</span>
              <input
                type="tel"
                min="1"
                max="9"
                value={customRange.multiplicandMin}
                onChange={(e) => setCustomRange({ 
                  ...customRange, 
                  multiplicandMin: parseInt(e.target.value) || 1 
                })}
                className="w-16 px-2 py-1 rounded border text-center"
              />
              <span className="text-white">到</span>
              <input
                type="tel"
                min="1"
                max="9"
                value={customRange.multiplicandMax}
                onChange={(e) => setCustomRange({ 
                  ...customRange, 
                  multiplicandMax: parseInt(e.target.value) || 9 
                })}
                className="w-16 px-2 py-1 rounded border text-center"
              />
            </div>
            {/* 第二個數字範圍 */}
            <div className="flex flex-wrap items-center gap-4 justify-center">
              <span className="text-white">第二個數字範圍：</span>
              <input
                type="tel"
                min="1"
                max="9"
                value={customRange.multiplierMin}
                onChange={(e) => setCustomRange({ 
                  ...customRange, 
                  multiplierMin: parseInt(e.target.value) || 1 
                })}
                className="w-16 px-2 py-1 rounded border text-center"
              />
              <span className="text-white">到</span>
              <input
                type="tel"
                min="1"
                max="9"
                value={customRange.multiplierMax}
                onChange={(e) => setCustomRange({ 
                  ...customRange, 
                  multiplierMax: parseInt(e.target.value) || 9 
                })}
                className="w-16 px-2 py-1 rounded border text-center"
              />
            </div>
            {/* 開始練習按鈕 */}
            <div className="text-center">
              <button
                onClick={startNewPractice}
                className="px-6 py-3 bg-primary-500 text-white rounded-full hover:bg-primary-600 transition-colors font-bold"
              >
                開始練習
              </button>
            </div>

            {/* 快速選擇：只練某段 */}
            <div className="border-t border-white/20 pt-4">
              <h4 className="text-white font-medium mb-3 text-center">快速選擇</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 固定第一個數字 */}
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-white text-sm mb-2">固定第一個數字（n × 1..9）</div>
                  <div className="flex flex-wrap gap-2">
                    {[1,2,3,4,5,6,7,8,9].map(n => (
                      <button
                        key={`f-${n}`}
                        onClick={() => quickFirst(n)}
                        className="px-3 py-2 rounded-lg bg-primary-500 text-white hover:bg-primary-600 text-sm font-bold"
                      >
                        {n} 的段
                      </button>
                    ))}
                  </div>
                </div>
                {/* 固定第二個數字 */}
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="text-white text-sm mb-2">固定第二個數字（1..9 × n）</div>
                  <div className="flex flex-wrap gap-2">
                    {[1,2,3,4,5,6,7,8,9].map(n => (
                      <button
                        key={`s-${n}`}
                        onClick={() => quickSecond(n)}
                        className="px-3 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 text-sm font-bold"
                      >
                        × {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </motion.div>

      {/* 練習區域 */}
      {!showResults && questions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          {/* 進度條 */}
          <div className="mb-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>進度: {currentQuestionIndex + 1} / {questions.length}</span>
              {feedback && (
                <span className={feedback.color === 'green' ? 'text-green-600' : 'text-red-600'}>
                  {feedback.color === 'green' ? '✅ 答對了' : '❌ 再試一次'}
                </span>
              )}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <motion.div
                className="bg-primary-500 h-3 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
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
                    ref={(el) => {
                      // 使用 ref 來直接引用答案輸入框
                      if (el) {
                        (window as any).answerInput = el
                      }
                    }}
                    type="tel"
                    className="text-4xl font-bold text-center w-32 h-16 border-4 border-primary-300 rounded-xl focus:border-primary-500 focus:outline-none"
                    placeholder="?"
                    autoFocus
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        if (awaitingNext) return
                        const target = e.target as HTMLInputElement
                        if (target.value) {
                          handleAnswerSubmit(target.value)
                          target.value = ''
                        }
                      }
                    }}
                    disabled={awaitingNext}
                  />
                </div>

                {/* 快速答案按鈕 */}
                 <div className="mt-8 grid grid-cols-5 gap-2 max-w-md mx-auto">
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                    <button
                      key={digit}
                      onClick={() => {
                        if (awaitingNext) return
                        const input = (window as any).answerInput as HTMLInputElement
                        if (input) {
                          input.value = input.value + digit.toString()
                          input.focus() // 保持焦點在輸入框
                        }
                      }}
                      className="w-12 h-12 bg-gray-100 hover:bg-gray-200 rounded-lg font-bold text-xl transition-colors"
                      disabled={awaitingNext}
                    >
                      {digit}
                    </button>
                  ))}
                </div>

                {/* 提交按鈕 */}
                {!awaitingNext && (
                  <button
                    onClick={() => {
                      const input = (window as any).answerInput as HTMLInputElement
                      if (input && input.value) {
                        handleAnswerSubmit(input.value)
                        input.value = ''
                      }
                    }}
                    className="mt-6 btn-primary"
                  >
                    提交答案
                  </button>
                )}

                {/* 作答回饋：總是顯示正確答案 + 下一步控制 */}
                {feedback && (
                  <div className={`mt-4 text-lg font-bold ${feedback.color === 'green' ? 'text-green-600' : 'text-red-600'}`}>
                    {feedback.text}
                  </div>
                )}
                {awaitingNext && (
                  <div className="mt-4">
                    {currentQuestionIndex < questions.length - 1 ? (
                      <button
                        onClick={() => {
                          setCurrentQuestionIndex(currentQuestionIndex + 1)
                          setFeedback(null)
                          setAwaitingNext(false)
                          const input = (window as any).answerInput as HTMLInputElement
                          if (input) input.focus()
                        }}
                        className="btn-primary"
                      >
                        下一題
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setIsPracticeComplete(true)
                          setShowResults(true)
                          setFeedback(null)
                          setAwaitingNext(false)
                        }}
                        className="btn-primary"
                      >
                        看結果
                      </button>
                    )}
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          )}
        </motion.div>
      )}

      {/* 練習結果 */}
      {showResults && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-6">🎉 練習完成！</h2>

            {/* 重新開始按鈕 */}
            <button
              onClick={() => startNewPractice()}
              className="btn-primary text-lg"
            >
              再練習一次
            </button>
          </div>
        </motion.div>
      )}
      <Footer />
    </div>
  )
}

export default PracticePage
