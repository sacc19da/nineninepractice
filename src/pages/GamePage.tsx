import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Footer from '../components/Footer'

// 遊戲題目類型定義
interface GameQuestion {
  id: number
  multiplicand: number
  multiplier: number
  result: number
}

// 泡泡遊戲類型定義
interface Bubble {
  id: number
  value: number
  x: number
  y: number
  isCorrect: boolean
  isPopped: boolean
}

// 遊戲頁面組件
function GamePage() {
  const [currentGame, setCurrentGame] = useState<string | null>(null)
  
  // 連線配對遊戲狀態
  const [matchingGame, setMatchingGame] = useState<{
    questions: GameQuestion[]
    answers: number[]
    selectedQuestion: number | null
    selectedAnswer: number | null
    matchedPairs: number[]
    score: number
    totalPairs: number
    isDragging: boolean
    dragStart: { x: number, y: number } | null
    dragEnd: { x: number, y: number } | null
    dragType: 'question' | 'answer' | null
    dragIndex: number | null
    connections: Array<{ from: number, to: number, isCorrect: boolean }>
  } | null>(null)
  const matchingSvgRef = useRef<SVGSVGElement | null>(null)
  
  // 新：泡泡模式固定位置（避免重疊），只在重排時換位置，不換內容
  const BUBBLE_POSITIONS = [
    { x: 15, y: 20 }, { x: 35, y: 20 }, { x: 55, y: 20 }, { x: 75, y: 20 },
    { x: 15, y: 40 }, { x: 35, y: 40 }, { x: 55, y: 40 }, { x: 75, y: 40 },
    { x: 15, y: 60 }, { x: 35, y: 60 }, { x: 55, y: 60 }, { x: 75, y: 60 },
    { x: 15, y: 80 }, { x: 35, y: 80 }, { x: 55, y: 80 }, { x: 75, y: 80 }
  ] as const
  const BUBBLE_COUNT = 8

  // 單一 timeout 控制器，避免多個排程造成狀態回滾
  const bubbleRegenTimeoutRef = useRef<number | null>(null)

  // 泡泡遊戲狀態
  const [bubbleGame, setBubbleGame] = useState<{
    currentQuestion: GameQuestion | null
    bubbles: Bubble[]
    score: number
    timeLeft: number
    isGameActive: boolean
    level: number
    wrongAttempts: number
    currentQuestionWrongAttempts: number
    phase?: 'playing' | 'transition'
  } | null>(null)

  // 追蹤最新泡泡遊戲狀態（避免閉包舊值造成流程卡住）
  const bubbleGameRef = useRef(bubbleGame)
  useEffect(() => {
    bubbleGameRef.current = bubbleGame
  }, [bubbleGame])

  // 生成連線配對遊戲（確保不重複）
  const startMatchingGame = () => {
    const questions: GameQuestion[] = []
    const answers: number[] = []
    const usedCombinations = new Set<string>()
    
    // 生成6個不重複的乘法題目
    let attempts = 0
    const maxAttempts = 1000
    
    while (questions.length < 6 && attempts < maxAttempts) {
      const multiplicand = Math.floor(Math.random() * 9) + 1
      const multiplier = Math.floor(Math.random() * 9) + 1
      const combination = `${multiplicand}x${multiplier}`
      
      if (!usedCombinations.has(combination)) {
        usedCombinations.add(combination)
        const result = multiplicand * multiplier
        
        questions.push({
          id: questions.length,
          multiplicand,
          multiplier,
          result
        })
        answers.push(result)
      }
      attempts++
    }
    
    // 打亂答案順序
    const shuffledAnswers = [...answers].sort(() => Math.random() - 0.5)
    
    setMatchingGame({
      questions,
      answers: shuffledAnswers,
      selectedQuestion: null,
      selectedAnswer: null,
      matchedPairs: [],
      score: 0,
      totalPairs: 6,
      isDragging: false,
      dragStart: null,
      dragEnd: null,
      dragType: null,
      dragIndex: null,
      connections: []
    })
    setCurrentGame('matching')
  }

  // 處理連線配對選擇（簡化版）
  const handleMatchingSelection = (type: 'question' | 'answer', index: number) => {
    if (!matchingGame) return

    if (type === 'question') {
      // 如果已經選中了這個問題，取消選擇
      if (matchingGame.selectedQuestion === index) {
        setMatchingGame({ ...matchingGame, selectedQuestion: null })
      } else {
        // 選擇這個問題
        setMatchingGame({ ...matchingGame, selectedQuestion: index })
        
        // 如果已經選中了答案，嘗試配對
        if (matchingGame.selectedAnswer !== null) {
          checkMatching(index, matchingGame.selectedAnswer)
        }
      }
    } else {
      // 如果已經選中了這個答案，取消選擇
      if (matchingGame.selectedAnswer === index) {
        setMatchingGame({ ...matchingGame, selectedAnswer: null })
      } else {
        // 選擇這個答案
        setMatchingGame({ ...matchingGame, selectedAnswer: index })
        
        // 如果已經選中了問題，嘗試配對
        if (matchingGame.selectedQuestion !== null) {
          checkMatching(matchingGame.selectedQuestion, index)
        }
      }
    }
  }

  // 檢查配對（簡化版）
  const checkMatching = (questionIndex: number, answerIndex: number) => {
    if (!matchingGame) return

    const question = matchingGame.questions[questionIndex]
    const selectedAnswer = matchingGame.answers[answerIndex]

    if (question.result === selectedAnswer) {
      // 配對成功
      const newMatchedPairs = [...matchingGame.matchedPairs, questionIndex, answerIndex + 6]
      const newScore = matchingGame.score + 1
      const newConnections = [...matchingGame.connections, { from: questionIndex, to: answerIndex, isCorrect: true }]
      
      setMatchingGame({
        ...matchingGame,
        matchedPairs: newMatchedPairs,
        score: newScore,
        selectedQuestion: null,
        selectedAnswer: null,
        connections: newConnections
      })

      // 檢查是否完成所有配對
      if (newScore === matchingGame.totalPairs) {
        setTimeout(() => {
          alert(`🎉 恭喜！你完成了所有配對！得分：${newScore}/${matchingGame.totalPairs}`)
          setCurrentGame(null)
          setMatchingGame(null)
        }, 500)
      }
    } else {
      // 配對失敗
      const newConnections = [...matchingGame.connections, { from: questionIndex, to: answerIndex, isCorrect: false }]
      setMatchingGame({
        ...matchingGame,
        selectedQuestion: null,
        selectedAnswer: null,
        connections: newConnections
      })

      // 1秒後清除錯誤連線
      setTimeout(() => {
        setMatchingGame(prev => prev ? {
          ...prev,
          connections: prev.connections.filter(conn => conn.isCorrect)
        } : null)
      }, 1000)
    }
  }

  // ● 把手拖曳開始
  const handleDotMouseDown = (e: React.MouseEvent, type: 'question' | 'answer', index: number) => {
    if (!matchingGame) return
    const dotRect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const svgRect = matchingSvgRef.current?.getBoundingClientRect()
    const startX = svgRect ? dotRect.left + dotRect.width / 2 - svgRect.left : dotRect.left + dotRect.width / 2
    const startY = svgRect ? dotRect.top + dotRect.height / 2 - svgRect.top : dotRect.top + dotRect.height / 2
    setMatchingGame({
      ...matchingGame,
      isDragging: true,
      dragStart: { x: startX, y: startY },
      dragEnd: { x: startX, y: startY },
      dragType: type,
      dragIndex: index
    })
    e.preventDefault()
  }

  // 全域 mousemove/mouseup 追蹤拖曳
  useEffect(() => {
    const onMove = (ev: MouseEvent) => {
      if (!matchingGame?.isDragging) return
      const svgRect = matchingSvgRef.current?.getBoundingClientRect()
      const x = svgRect ? ev.clientX - svgRect.left : ev.clientX
      const y = svgRect ? ev.clientY - svgRect.top : ev.clientY
      setMatchingGame(prev => prev ? { ...prev, dragEnd: { x, y } } : prev)
    }
    const onUp = (ev: MouseEvent) => {
      if (!matchingGame?.isDragging) return
      const elements = document.elementsFromPoint(ev.clientX, ev.clientY)
      const target = elements.find(el => el.classList?.contains('match-dot')) as HTMLElement | undefined
      if (target && matchingGame.dragType && matchingGame.dragIndex !== null) {
        const targetType = (target.dataset.type as 'question' | 'answer')
        const targetIndex = parseInt(target.dataset.index || '0', 10)
        if (matchingGame.dragType !== targetType) {
          if (matchingGame.dragType === 'question') {
            checkMatching(matchingGame.dragIndex, targetIndex)
          } else {
            checkMatching(targetIndex, matchingGame.dragIndex)
          }
        }
      }
      setMatchingGame(prev => prev ? {
        ...prev,
        isDragging: false,
        dragStart: null,
        dragEnd: null,
        dragType: null,
        dragIndex: null
      } : prev)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
  }, [matchingGame?.isDragging])

  // 取得●中心點（轉為 SVG 座標）
  const getDotCenter = (type: 'question' | 'answer', index: number): { x: number; y: number } | null => {
    const svgRect = matchingSvgRef.current?.getBoundingClientRect()
    const el = document.querySelector(`.match-dot[data-type="${type}"][data-index="${index}"]`) as HTMLElement | null
    if (!svgRect || !el) return null
    const r = el.getBoundingClientRect()
    return {
      x: r.left + r.width / 2 - svgRect.left,
      y: r.top + r.height / 2 - svgRect.top
    }
  }

  // 產生不重複錯誤值
  const generateWrongValues = (count: number, exclude: number) => {
    const vals = new Set<number>()
    while (vals.size < count) {
      const v = Math.floor(Math.random() * 81) + 1 // 1..81
      if (v !== exclude) vals.add(v)
    }
    return Array.from(vals)
  }

  // 將未被戳破的泡泡重新洗牌位置（不變更數值與正確性）
  const reshuffleUnpoppedPositions = () => {
    setBubbleGame(prev => {
      if (!prev) return prev
      const active = prev.bubbles.filter(b => !b.isPopped)
      const popped = prev.bubbles.filter(b => b.isPopped)

      // 隨機抽取位置並指派給仍存在的泡泡
      const shuffled = [...BUBBLE_POSITIONS].sort(() => Math.random() - 0.5)
      const assignedActive = active.map((b, i) => ({ ...b, x: shuffled[i].x, y: shuffled[i].y }))
      return { ...prev, bubbles: [...assignedActive, ...popped] }
    })
  }

  // 開始／下一題（泡泡）
  const startBubbleGame = (nextLevel?: number, carryScore?: number) => {
    // 先清掉等待中的重排
    if (bubbleRegenTimeoutRef.current) {
      window.clearTimeout(bubbleRegenTimeoutRef.current)
      bubbleRegenTimeoutRef.current = null
    }

    const level = nextLevel ?? bubbleGame?.level ?? 1
    const multiplicand = Math.floor(Math.random() * 9) + 1
    const multiplier = Math.floor(Math.random() * 9) + 1
    const result = multiplicand * multiplier

    const wrongValues = generateWrongValues(BUBBLE_COUNT - 1, result)
    const values = [result, ...wrongValues]

    // 初始位置指派（前 BUBBLE_COUNT 個位置）
    const positions = [...BUBBLE_POSITIONS].sort(() => Math.random() - 0.5)

    const bubbles: Bubble[] = values.map((v, i) => ({
      id: i,
      value: v,
      isCorrect: v === result,
      isPopped: false,
      x: positions[i].x,
      y: positions[i].y
    }))

    setBubbleGame({
      currentQuestion: { id: 0, multiplicand, multiplier, result },
      bubbles,
      score: carryScore ?? bubbleGame?.score ?? 0,
      timeLeft: bubbleGame?.timeLeft ?? 30,
      isGameActive: true,
      level,
      wrongAttempts: bubbleGame?.wrongAttempts ?? 0,
      currentQuestionWrongAttempts: 0,
      phase: 'playing'
    })
    setCurrentGame('bubble')
  }

  // 點擊泡泡（以最新快照計算，避免在 updater 內做副作用）
  const handleBubbleClick = (bubbleId: number) => {
    const snapshot = bubbleGameRef.current
    if (!snapshot || !snapshot.isGameActive || snapshot.phase === 'transition') return

    const target = snapshot.bubbles.find(b => b.id === bubbleId)
    if (!target || target.isPopped) return

    // 先清除等待中的重排，之後視情況再排
    const clearPendingRegen = () => {
      if (bubbleRegenTimeoutRef.current) {
        window.clearTimeout(bubbleRegenTimeoutRef.current)
        bubbleRegenTimeoutRef.current = null
      }
    }

    // 建立新的泡泡陣列（戳破被點擊的）
    const updatedBubbles = snapshot.bubbles.map(b => (
      b.id === bubbleId ? { ...b, isPopped: true } : b
    ))

    if (target.isCorrect) {
      // 正確：依錯誤次數給分，進入過渡並在 900ms 後換題
      const award = snapshot.currentQuestionWrongAttempts < 2 ? 10 : 0
      const newScore = Math.max(0, snapshot.score + award)
      const nextLevel = snapshot.level + 1
      clearPendingRegen()

      setBubbleGame(prev => prev ? {
        ...prev,
        bubbles: updatedBubbles,
        score: newScore,
        isGameActive: false,
        phase: 'transition'
      } : prev)

      setTimeout(() => {
        if (nextLevel <= 5) {
          startBubbleGame(nextLevel, newScore)
        } else {
          alert(`🎉 恭喜完成所有關卡！總分：${newScore}`)
          setCurrentGame(null)
          setBubbleGame(null)
        }
      }, 900)
    } else {
      // 錯誤：扣 5 分、累計錯誤，700ms 後僅重排未破泡泡位置
      setBubbleGame(prev => prev ? {
        ...prev,
        bubbles: updatedBubbles,
        score: Math.max(0, prev.score - 5),
        wrongAttempts: prev.wrongAttempts + 1,
        currentQuestionWrongAttempts: prev.currentQuestionWrongAttempts + 1
      } : prev)

      clearPendingRegen()
      bubbleRegenTimeoutRef.current = window.setTimeout(() => {
        reshuffleUnpoppedPositions()
        bubbleRegenTimeoutRef.current = null
      }, 700)
    }
  }

  // 組件卸載時清理任何 pending 的重排
  useEffect(() => {
    return () => {
      if (bubbleRegenTimeoutRef.current) {
        window.clearTimeout(bubbleRegenTimeoutRef.current)
        bubbleRegenTimeoutRef.current = null
      }
    }
  }, [])

  // 闖關冒險遊戲狀態
  const [adventureGame, setAdventureGame] = useState<{
    currentLevel: number
    questions: GameQuestion[]
    currentQuestionIndex: number
    score: number
    lives: number
    isGameActive: boolean
  } | null>(null)

  // 限時挑戰遊戲狀態
  const [timedGame, setTimedGame] = useState<{
    questions: GameQuestion[]
    currentQuestionIndex: number
    score: number
    timeLeft: number
    isGameActive: boolean
  } | null>(null)

  // 記憶遊戲狀態
  const [memoryGame, setMemoryGame] = useState<{
    cards: Array<{ id: number, value: string, isFlipped: boolean, isMatched: boolean, pairId: number, cardType: 'expr' | 'ans' }>
    flippedCards: number[]
    score: number
    moves: number
    isGameActive: boolean
  } | null>(null)

  // 開始闖關冒險遊戲
  const generateAdventureQuestions = (level: number): GameQuestion[] => {
    const questions: GameQuestion[] = []
    const usedCombinations = new Set<string>()
    const questionCount = 5 + level * 2
    let attempts = 0
    const maxAttempts = 1000
    while (questions.length < questionCount && attempts < maxAttempts) {
      const multiplicand = Math.floor(Math.random() * 9) + 1
      const multiplier = Math.floor(Math.random() * 9) + 1
      const combination = `${multiplicand}x${multiplier}`
      if (!usedCombinations.has(combination)) {
        usedCombinations.add(combination)
        questions.push({
          id: questions.length,
          multiplicand,
          multiplier,
          result: multiplicand * multiplier
        })
      }
      attempts++
    }
    return questions
  }

  const startAdventureGame = (level: number = 1, carryScore: number = 0, carryLives: number = 3) => {
    setAdventureGame({
      currentLevel: level,
      questions: generateAdventureQuestions(level),
      currentQuestionIndex: 0,
      score: carryScore,
      lives: carryLives,
      isGameActive: true
    })
    setCurrentGame('adventure')
  }

  // 開始限時挑戰遊戲
  const startTimedGame = () => {
    const questions: GameQuestion[] = []
    const usedCombinations = new Set<string>()
    
    // 生成20題
    let attempts = 0
    const maxAttempts = 1000
    
    while (questions.length < 20 && attempts < maxAttempts) {
      const multiplicand = Math.floor(Math.random() * 9) + 1
      const multiplier = Math.floor(Math.random() * 9) + 1
      const combination = `${multiplicand}x${multiplier}`
      
      if (!usedCombinations.has(combination)) {
        usedCombinations.add(combination)
        questions.push({
          id: questions.length,
          multiplicand,
          multiplier,
          result: multiplicand * multiplier
        })
      }
      attempts++
    }
    
    setTimedGame({
      questions,
      currentQuestionIndex: 0,
      score: 0,
      timeLeft: 120, // 2分鐘
      isGameActive: true
    })
    setCurrentGame('timed')
  }

  // 開始記憶遊戲
  const startMemoryGame = () => {
    const cards: Array<{ id: number, value: string, isFlipped: boolean, isMatched: boolean, pairId: number, cardType: 'expr' | 'ans' }> = []
    const usedCombinations = new Set<string>()
    
    // 生成8對卡片（16張）
    let attempts = 0
    const maxAttempts = 1000
    
    while (cards.length < 16 && attempts < maxAttempts) {
      const multiplicand = Math.floor(Math.random() * 9) + 1
      const multiplier = Math.floor(Math.random() * 9) + 1
      const combination = `${multiplicand}x${multiplier}`
      
      if (!usedCombinations.has(combination)) {
        usedCombinations.add(combination)
        const result = multiplicand * multiplier
        
        const pairId = cards.length // 暫存使用，稍後打亂無影響
        // 添加算式卡片
        cards.push({
          id: cards.length,
          value: `${multiplicand}×${multiplier}`,
          isFlipped: false,
          isMatched: false,
          pairId,
          cardType: 'expr'
        })
        // 添加答案卡片
        cards.push({
          id: cards.length,
          value: result.toString(),
          isFlipped: false,
          isMatched: false,
          pairId,
          cardType: 'ans'
        })
      }
      attempts++
    }
    
    // 打亂卡片順序
    const shuffledCards = cards.sort(() => Math.random() - 0.5)
    
    setMemoryGame({
      cards: shuffledCards,
      flippedCards: [],
      score: 0,
      moves: 0,
      isGameActive: true
    })
    setCurrentGame('memory')
  }

  // 泡泡遊戲計時器（僅在 playing 期間遞減）
  useEffect(() => {
    if (!bubbleGame || !bubbleGame.isGameActive) return
    const timer = window.setTimeout(() => {
      setBubbleGame(prev => {
        if (!prev) return prev
        if (prev.timeLeft > 0) return { ...prev, timeLeft: prev.timeLeft - 1 }
        // 時間到
        alert(`⏰ 時間到！得分：${prev.score}`)
        setCurrentGame(null)
        return null
      })
    }, 1000)
    return () => clearTimeout(timer)
  }, [bubbleGame?.isGameActive, bubbleGame?.timeLeft])

  // 限時挑戰遊戲計時器
  useEffect(() => {
    if (!timedGame || !timedGame.isGameActive) return
    
    const timer = window.setTimeout(() => {
      if (timedGame.timeLeft > 0) {
        setTimedGame({
          ...timedGame,
          timeLeft: timedGame.timeLeft - 1
        })
      } else {
        // 時間到
        alert(`⏰ 時間到！總得分：${timedGame.score}`)
        setCurrentGame(null)
        setTimedGame(null)
      }
    }, 1000)
    
    return () => clearTimeout(timer)
  }, [timedGame?.timeLeft, timedGame?.isGameActive])

  return (
    <div className="max-w-6xl mx-auto">
      {/* 頁面標題 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl font-bold text-white mb-4">🎮 乘法遊戲</h1>
        <p className="text-white/80 text-lg">選擇遊戲模式，邊玩邊學乘法</p>
      </motion.div>

      {/* 連線配對遊戲 */}
      {currentGame === 'matching' && matchingGame && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">🔗 連線配對遊戲</h2>
            <p className="text-gray-600">點擊左邊的乘法算式，再點擊右邊的正確答案來配對</p>
            <div className="text-lg font-bold text-primary-600 mt-2">
              得分: {matchingGame.score} / {matchingGame.totalPairs}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
            {/* 連線畫布 */}
            <svg ref={matchingSvgRef} className="absolute inset-0 w-full h-full pointer-events-none z-10">
              {/* 拖曳中的線（px 座標）*/}
              {matchingGame.isDragging && matchingGame.dragStart && matchingGame.dragEnd && (
                <line
                  x1={matchingGame.dragStart.x}
                  y1={matchingGame.dragStart.y}
                  x2={matchingGame.dragEnd.x}
                  y2={matchingGame.dragEnd.y}
                  stroke="#3B82F6"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                />
              )}
              {/* 已選擇的連線 */}
              {matchingGame.selectedQuestion !== null && matchingGame.selectedAnswer !== null && (() => {
                const from = getDotCenter('question', matchingGame.selectedQuestion)
                const to = getDotCenter('answer', matchingGame.selectedAnswer)
                if (!from || !to) return null
                return (
                  <line
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke="#3B82F6"
                    strokeWidth="3"
                    strokeDasharray="5,5"
                    className="animate-pulse"
                  />
                )
              })()}
              
              {/* 已配對的連線 */}
              {matchingGame.connections.map((connection, index) => {
                const from = getDotCenter('question', connection.from)
                const to = getDotCenter('answer', connection.to)
                if (!from || !to) return null
                return (
                  <line
                    key={index}
                    x1={from.x}
                    y1={from.y}
                    x2={to.x}
                    y2={to.y}
                    stroke={connection.isCorrect ? "#10B981" : "#EF4444"}
                    strokeWidth="3"
                    className={connection.isCorrect ? "" : "animate-pulse"}
                  />
                )
              })}
            </svg>

            {/* 左邊：乘法算式（●在右）*/}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">乘法算式</h3>
              <div className="space-y-3">
                {matchingGame.questions.map((question, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleMatchingSelection('question', index)}
                      disabled={matchingGame.matchedPairs.includes(index)}
                      data-index={index}
                      className={`question-item flex-1 p-4 rounded-xl text-lg font-bold transition-all cursor-pointer text-left ${
                        matchingGame.matchedPairs.includes(index)
                          ? 'bg-green-100 text-green-700 border-2 border-green-300'
                          : matchingGame.selectedQuestion === index
                          ? 'bg-primary-100 text-primary-700 border-2 border-primary-300 shadow-lg'
                          : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {question.multiplicand} × {question.multiplier} = ?
                    </motion.button>
                    <button
                      className="match-dot w-5 h-5 rounded-full bg-gray-400 hover:bg-primary-500 focus:outline-none"
                      data-type="question"
                      data-index={index}
                      onMouseDown={(e) => handleDotMouseDown(e, 'question', index)}
                      aria-label="拖曳連線"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 右邊：答案選項（●在左）*/}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 text-center">答案選項</h3>
              <div className="space-y-3">
                {matchingGame.answers.map((answer, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <button
                      className="match-dot w-5 h-5 rounded-full bg-gray-400 hover:bg-primary-500 focus:outline-none"
                      data-type="answer"
                      data-index={index}
                      onMouseDown={(e) => handleDotMouseDown(e, 'answer', index)}
                      aria-label="拖曳連線"
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleMatchingSelection('answer', index)}
                      disabled={matchingGame.matchedPairs.includes(index + 6)}
                      data-index={index + 6}
                      className={`answer-item flex-1 p-4 rounded-xl text-lg font-bold transition-all cursor-pointer ${
                        matchingGame.matchedPairs.includes(index + 6)
                          ? 'bg-green-100 text-green-700 border-2 border-green-300'
                          : matchingGame.selectedAnswer === index
                          ? 'bg-primary-100 text-primary-700 border-2 border-primary-300 shadow-lg'
                          : 'bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {answer}
                    </motion.button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 返回按鈕 */}
          <div className="text-center mt-8">
            <button
              onClick={() => {
                setCurrentGame(null)
                setMatchingGame(null)
              }}
              className="btn-secondary"
            >
              返回遊戲選擇
            </button>
          </div>
        </motion.div>
      )}

      {/* 泡泡遊戲 */}
      {currentGame === 'bubble' && bubbleGame && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">🫧 數字泡泡遊戲</h2>
            <p className="text-gray-600">點擊正確答案的泡泡</p>
            <div className="flex justify-center gap-6 mt-4">
              <div className="text-lg font-bold text-primary-600">得分: {bubbleGame.score}</div>
              <div className="text-lg font-bold text-red-600">時間: {bubbleGame.timeLeft}s</div>
              <div className="text-lg font-bold text-purple-600">關卡: {bubbleGame.level}/5</div>
              <div className="text-lg font-bold text-orange-600">本題錯誤: {bubbleGame.currentQuestionWrongAttempts}次</div>
            </div>
          </div>

          <div className="text-center mb-8">
            <div className="text-4xl font-bold text-gray-800">
              {bubbleGame.currentQuestion?.multiplicand} × {bubbleGame.currentQuestion?.multiplier} = ?
            </div>
          </div>

          <div className="relative h-96 bg-gradient-to-b from-blue-50 to-blue-100 rounded-xl overflow-hidden">
            {bubbleGame.bubbles.map((bubble) => (
              <motion.button
                key={bubble.id}
                initial={{ scale: 0 }}
                animate={{ scale: bubble.isPopped ? 0 : 1 }}
                whileHover={{ scale: bubble.isPopped ? 0 : 1.1 }}
                whileTap={{ scale: bubble.isPopped ? 0 : 0.9 }}
                onClick={() => handleBubbleClick(bubble.id)}
                disabled={!bubbleGame.isGameActive || bubble.isPopped}
                className={`absolute w-16 h-16 rounded-full font-bold text-xl transition-all z-10 pointer-events-auto ${
                  bubble.isPopped
                    ? 'opacity-0'
                    : bubble.isCorrect && bubbleGame.currentQuestionWrongAttempts >= 2
                    ? 'bg-blue-400 hover:bg-blue-500 text-white shadow-lg animate-pulse border-4 border-blue-600'
                    : 'bg-gray-400 hover:bg-gray-500 text-white shadow-lg'
                }`}
                style={{ left: `${bubble.x}%`, top: `${bubble.y}%`, transform: `translate(-50%, -50%)` }}
              >
                {bubble.value}
              </motion.button>
            ))}
          </div>

          <div className="text-center mt-8">
            <button
              onClick={() => {
                setCurrentGame(null)
                setBubbleGame(null)
              }}
              className="btn-secondary"
            >
              返回遊戲選擇
            </button>
          </div>
        </motion.div>
      )}

      {/* 闖關冒險遊戲 */}
      {currentGame === 'adventure' && adventureGame && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">🏰 闖關冒險</h2>
            <p className="text-gray-600">通過關卡，挑戰越來越難的乘法題</p>
            <div className="flex justify-center gap-8 mt-4">
              <div className="text-lg font-bold text-primary-600">
                關卡: {adventureGame.currentLevel}
              </div>
              <div className="text-lg font-bold text-green-600">
                得分: {adventureGame.score}
              </div>
              <div className="text-lg font-bold text-red-600">
                生命: {adventureGame.lives} ❤️
              </div>
            </div>
          </div>

          {adventureGame.isGameActive && adventureGame.questions[adventureGame.currentQuestionIndex] && (
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-800 mb-8">
                {adventureGame.questions[adventureGame.currentQuestionIndex].multiplicand} × {adventureGame.questions[adventureGame.currentQuestionIndex].multiplier} = ?
              </div>
              
              <div className="flex justify-center">
                <input
                  type="number"
                  className="text-3xl font-bold text-center w-32 h-16 border-4 border-primary-300 rounded-xl focus:border-primary-500 focus:outline-none"
                  placeholder="?"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const target = e.target as HTMLInputElement
                      if (target.value) {
                        const userAnswer = parseInt(target.value)
                        const correctAnswer = adventureGame.questions[adventureGame.currentQuestionIndex].result
                        
                        if (userAnswer === correctAnswer) {
                          // 答對了
                          const newScore = adventureGame.score + 10
                          const newQuestionIndex = adventureGame.currentQuestionIndex + 1
                          
                          if (newQuestionIndex >= adventureGame.questions.length) {
                            // 完成當前關卡
                            alert(`🎉 恭喜通過第${adventureGame.currentLevel}關！`)
                            startAdventureGame(adventureGame.currentLevel + 1, newScore, adventureGame.lives)
                          } else {
                            setAdventureGame({
                              ...adventureGame,
                              score: newScore,
                              currentQuestionIndex: newQuestionIndex
                            })
                          }
                        } else {
                          // 答錯了
                          const newLives = adventureGame.lives - 1
                          if (newLives <= 0) {
                            // 遊戲結束
                            alert(`💔 遊戲結束！總得分：${adventureGame.score}`)
                            setCurrentGame(null)
                            setAdventureGame(null)
                          } else {
                            setAdventureGame({
                              ...adventureGame,
                              lives: newLives
                            })
                          }
                        }
                        target.value = ''
                      }
                    }
                  }}
                />
              </div>
              
              <button
                onClick={() => {
                  const input = document.querySelector('input') as HTMLInputElement
                  if (input && input.value) {
                    const userAnswer = parseInt(input.value)
                    const correctAnswer = adventureGame.questions[adventureGame.currentQuestionIndex].result
                    
                    if (userAnswer === correctAnswer) {
                      // 答對了
                      const newScore = adventureGame.score + 10
                      const newQuestionIndex = adventureGame.currentQuestionIndex + 1
                      
                        if (newQuestionIndex >= adventureGame.questions.length) {
                          // 完成當前關卡
                          alert(`🎉 恭喜通過第${adventureGame.currentLevel}關！`)
                          startAdventureGame(adventureGame.currentLevel + 1, newScore, adventureGame.lives)
                      } else {
                        setAdventureGame({
                          ...adventureGame,
                          score: newScore,
                          currentQuestionIndex: newQuestionIndex
                        })
                      }
                    } else {
                      // 答錯了
                      const newLives = adventureGame.lives - 1
                      if (newLives <= 0) {
                        // 遊戲結束
                        alert(`💔 遊戲結束！總得分：${adventureGame.score}`)
                        setCurrentGame(null)
                        setAdventureGame(null)
                      } else {
                        setAdventureGame({
                          ...adventureGame,
                          lives: newLives
                        })
                      }
                    }
                    input.value = ''
                  }
                }}
                className="mt-6 btn-primary"
              >
                提交答案
              </button>
            </div>
          )}

          {/* 返回按鈕 */}
          <div className="text-center mt-8">
            <button
              onClick={() => {
                setCurrentGame(null)
                setAdventureGame(null)
              }}
              className="btn-secondary"
            >
              返回遊戲選擇
            </button>
          </div>
        </motion.div>
      )}

      {/* 限時挑戰遊戲 */}
      {currentGame === 'timed' && timedGame && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">⏰ 限時挑戰</h2>
            <p className="text-gray-600">在限定時間內答對越多題目越好</p>
            <div className="flex justify-center gap-8 mt-4">
              <div className="text-lg font-bold text-primary-600">
                題目: {timedGame.currentQuestionIndex + 1}/{timedGame.questions.length}
              </div>
              <div className="text-lg font-bold text-green-600">
                得分: {timedGame.score}
              </div>
              <div className="text-lg font-bold text-red-600">
                時間: {timedGame.timeLeft}s
              </div>
            </div>
          </div>

          {timedGame.isGameActive && timedGame.questions[timedGame.currentQuestionIndex] && (
            <div className="text-center">
              <div className="text-4xl font-bold text-gray-800 mb-8">
                {timedGame.questions[timedGame.currentQuestionIndex].multiplicand} × {timedGame.questions[timedGame.currentQuestionIndex].multiplier} = ?
              </div>
              
              <div className="flex justify-center">
                <input
                  key={timedGame.currentQuestionIndex} // 加入key確保重新渲染
                  type="number"
                  className="text-3xl font-bold text-center w-32 h-16 border-4 border-primary-300 rounded-xl focus:border-primary-500 focus:outline-none"
                  placeholder="?"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const target = e.target as HTMLInputElement
                      if (target.value) {
                        const userAnswer = parseInt(target.value)
                        const correctAnswer = timedGame.questions[timedGame.currentQuestionIndex].result
                        
                        if (userAnswer === correctAnswer) {
                          // 答對了
                          const newScore = timedGame.score + 10
                          const newQuestionIndex = timedGame.currentQuestionIndex + 1
                          
                          if (newQuestionIndex >= timedGame.questions.length) {
                            // 完成所有題目
                            alert(`🎉 恭喜完成所有題目！總得分：${newScore}`)
                            setCurrentGame(null)
                            setTimedGame(null)
                          } else {
                            setTimedGame({
                              ...timedGame,
                              score: newScore,
                              currentQuestionIndex: newQuestionIndex
                            })
                          }
                        } else {
                          // 答錯了，僅前進題目，不重置其他狀態
                          const newQuestionIndex = timedGame.currentQuestionIndex + 1
                          if (newQuestionIndex >= timedGame.questions.length) {
                            alert(`⏰ 題目結束！總得分：${timedGame.score}`)
                            setCurrentGame(null)
                            setTimedGame(null)
                          } else {
                            setTimedGame({
                              ...timedGame,
                              currentQuestionIndex: newQuestionIndex
                            })
                          }
                        }
                        // 移除清空輸入框的操作，讓key變化處理
                      }
                    }
                  }}
                />
              </div>
              
              <button
                onClick={() => {
                  const inputs = document.querySelectorAll('input[type="number"]') as NodeListOf<HTMLInputElement>
                  const input = inputs[inputs.length - 1] // 取得最後一個輸入框
                  if (input && input.value) {
                    const userAnswer = parseInt(input.value)
                    const correctAnswer = timedGame.questions[timedGame.currentQuestionIndex].result
                    
                    if (userAnswer === correctAnswer) {
                      // 答對了
                      const newScore = timedGame.score + 10
                      const newQuestionIndex = timedGame.currentQuestionIndex + 1
                      
                      if (newQuestionIndex >= timedGame.questions.length) {
                        // 完成所有題目
                        alert(`🎉 恭喜完成所有題目！總得分：${newScore}`)
                        setCurrentGame(null)
                        setTimedGame(null)
                      } else {
                        setTimedGame({
                          ...timedGame,
                          score: newScore,
                          currentQuestionIndex: newQuestionIndex
                        })
                      }
                    } else {
                      // 答錯了，僅前進題目，不重置其他狀態
                      const newQuestionIndex = timedGame.currentQuestionIndex + 1
                      if (newQuestionIndex >= timedGame.questions.length) {
                        alert(`⏰ 題目結束！總得分：${timedGame.score}`)
                        setCurrentGame(null)
                        setTimedGame(null)
                      } else {
                        setTimedGame({
                          ...timedGame,
                          currentQuestionIndex: newQuestionIndex
                        })
                      }
                    }
                    // 移除清空輸入框的操作，讓key變化處理
                  }
                }}
                className="mt-6 btn-primary"
              >
                提交答案
              </button>
            </div>
          )}

          {/* 返回按鈕 */}
          <div className="text-center mt-8">
            <button
              onClick={() => {
                setCurrentGame(null)
                setTimedGame(null)
              }}
              className="btn-secondary"
            >
              返回遊戲選擇
            </button>
          </div>
        </motion.div>
      )}

      {/* 記憶遊戲 */}
      {currentGame === 'memory' && memoryGame && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl shadow-xl p-8"
        >
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">🧠 記憶遊戲</h2>
            <p className="text-gray-600">翻開卡片，記住乘法算式的答案</p>
            <div className="flex justify-center gap-8 mt-4">
              <div className="text-lg font-bold text-primary-600">
                得分: {memoryGame.score}
              </div>
              <div className="text-lg font-bold text-green-600">
                步數: {memoryGame.moves}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4 max-w-2xl mx-auto">
            {memoryGame.cards.map((card, index) => (
              <motion.button
                key={card.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (memoryGame.flippedCards.length < 2 && !card.isFlipped && !card.isMatched) {
                    const newFlippedCards = [...memoryGame.flippedCards, index]
                    const newCards = memoryGame.cards.map((c, i) => 
                      i === index ? { ...c, isFlipped: true } : c
                    )
                    
                    setMemoryGame({
                      ...memoryGame,
                      cards: newCards,
                      flippedCards: newFlippedCards
                    })
                    
                    // 檢查是否配對（必須為同一 pairId，且一張是算式、一張是答案）
                    if (newFlippedCards.length === 2) {
                      const [firstIndex, secondIndex] = newFlippedCards
                      const firstCard = newCards[firstIndex]
                      const secondCard = newCards[secondIndex]
                      const isMatch = firstCard.pairId === secondCard.pairId && firstCard.cardType !== secondCard.cardType
                      
                      if (isMatch) {
                        // 配對成功
                        const matchedCards = newCards.map((c, i) => 
                          i === firstIndex || i === secondIndex ? { ...c, isMatched: true } : c
                        )
                        
                        setMemoryGame({
                          ...memoryGame,
                          cards: matchedCards,
                          flippedCards: [],
                          score: memoryGame.score + 10,
                          moves: memoryGame.moves + 1
                        })
                        
                        // 檢查是否完成所有配對
                        const allMatched = matchedCards.every(c => c.isMatched)
                        if (allMatched) {
                          setTimeout(() => {
                            alert(`🎉 恭喜完成記憶遊戲！總得分：${memoryGame.score + 10}`)
                            setCurrentGame(null)
                            setMemoryGame(null)
                          }, 500)
                        }
                      } else {
                        // 配對失敗，翻回卡片
                        setTimeout(() => {
                          const resetCards = newCards.map((c, i) => 
                            i === firstIndex || i === secondIndex ? { ...c, isFlipped: false } : c
                          )
                          
                          setMemoryGame({
                            ...memoryGame,
                            cards: resetCards,
                            flippedCards: [],
                            moves: memoryGame.moves + 1
                          })
                        }, 1000)
                      }
                    }
                  }
                }}
                disabled={card.isMatched}
                className={`w-20 h-20 rounded-xl font-bold text-lg transition-all ${
                  card.isMatched
                    ? 'bg-green-100 text-green-700 border-2 border-green-300'
                    : card.isFlipped
                    ? 'bg-primary-100 text-primary-700 border-2 border-primary-300'
                    : 'bg-gray-200 text-gray-600 border-2 border-gray-300 hover:bg-gray-300'
                }`}
              >
                {card.isFlipped || card.isMatched ? card.value : '?'}
              </motion.button>
            ))}
          </div>

          {/* 返回按鈕 */}
          <div className="text-center mt-8">
            <button
              onClick={() => {
                setCurrentGame(null)
                setMemoryGame(null)
              }}
              className="btn-secondary"
            >
              返回遊戲選擇
            </button>
          </div>
        </motion.div>
      )}

      {/* 遊戲選擇 */}
      {!currentGame && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* 連線配對遊戲 */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl p-6 cursor-pointer"
            onClick={startMatchingGame}
          >
            <div className="text-center">
              <div className="text-4xl mb-4">🔗</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">連線配對</h3>
              <p className="text-gray-600 text-sm mb-4">
                將乘法算式與正確答案連線配對
              </p>
              <div className="bg-gradient-to-r from-blue-400 to-blue-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                開始遊戲
              </div>
            </div>
          </motion.div>

          {/* 數字泡泡遊戲 */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl p-6 cursor-pointer"
            onClick={() => startBubbleGame()}
          >
            <div className="text-center">
              <div className="text-4xl mb-4">🫧</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">數字泡泡</h3>
              <p className="text-gray-600 text-sm mb-4">
                點擊正確的數字泡泡來回答乘法題
              </p>
              <div className="bg-gradient-to-r from-green-400 to-green-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                開始遊戲
              </div>
            </div>
          </motion.div>

          {/* 闖關遊戲 */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl p-6 cursor-pointer"
            onClick={() => startAdventureGame()}
          >
            <div className="text-center">
              <div className="text-4xl mb-4">🏰</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">闖關冒險</h3>
              <p className="text-gray-600 text-sm mb-4">
                通過不同關卡，挑戰越來越難的乘法題
              </p>
              <div className="bg-gradient-to-r from-purple-400 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                開始遊戲
              </div>
            </div>
          </motion.div>

          {/* 限時挑戰 */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl p-6 cursor-pointer"
            onClick={startTimedGame}
          >
            <div className="text-center">
              <div className="text-4xl mb-4">⏰</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">限時挑戰</h3>
              <p className="text-gray-600 text-sm mb-4">
                在限定時間內答對越多題目越好
              </p>
              <div className="bg-gradient-to-r from-red-400 to-red-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                開始遊戲
              </div>
            </div>
          </motion.div>

          {/* 記憶遊戲 */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl p-6 cursor-pointer"
            onClick={startMemoryGame}
          >
            <div className="text-center">
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">記憶遊戲</h3>
              <p className="text-gray-600 text-sm mb-4">
                翻開卡片，記住乘法算式的答案
              </p>
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                開始遊戲
              </div>
            </div>
          </motion.div>

          {/* 競賽模式 - 隱藏 */}
          {/*
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl p-6 cursor-pointer"
            onClick={startCompetitionGame}
          >
            <div className="text-center">
              <div className="text-4xl mb-4">🏆</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">競賽模式</h3>
              <p className="text-gray-600 text-sm mb-4">
                與其他玩家競賽，看誰答題最快
              </p>
              <div className="bg-gradient-to-r from-pink-400 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-medium">
                開始遊戲
              </div>
            </div>
          </motion.div>
          */}
        </motion.div>
      )}

      {/* 遊戲說明 */}
      {!currentGame && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 bg-white/10 backdrop-blur-sm rounded-2xl p-6"
        >
          <h3 className="text-xl font-bold text-white mb-4">🎯 遊戲說明</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white/90">
            <div>
              <h4 className="font-bold mb-2">🎮 遊戲特色</h4>
              <ul className="text-sm space-y-1">
                <li>• 多種遊戲模式，適合不同學習階段</li>
                <li>• 即時回饋，快速了解對錯</li>
                <li>• 漸進式難度，循序漸進學習</li>
                <li>• 有趣的動畫效果，提升學習興趣</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-2">🏆 學習目標</h4>
              <ul className="text-sm space-y-1">
                <li>• 熟練掌握99乘法表</li>
                <li>• 提高計算速度和準確性</li>
                <li>• 培養數學思維能力</li>
                <li>• 建立學習數學的信心</li>
              </ul>
            </div>
          </div>
        </motion.div>
      )}
      <Footer />
    </div>
  )
}

export default GamePage
