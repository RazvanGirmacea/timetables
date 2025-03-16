import React, { useState, useEffect, useRef } from 'react'
import { Trash2, RefreshCw } from 'lucide-react'

interface MultiplicationTestProps {
  onUpdateBestTimes: (problem: string, time: number) => void
  onClearTimes: () => void
}

const QUESTION_OPTIONS = [5, 10, 15, 20]

const MultiplicationTest: React.FC<MultiplicationTestProps> = ({ 
  onUpdateBestTimes, 
  onClearTimes 
}) => {
  const [num1, setNum1] = useState(0)
  const [num2, setNum2] = useState(0)
  const [userAnswer, setUserAnswer] = useState('')
  const [score, setScore] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(10)
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [timer, setTimer] = useState(0)
  const [isTestRunning, setIsTestRunning] = useState(false)
  const [showConfirmClear, setShowConfirmClear] = useState(false)
  const [showQuestionCountModal, setShowQuestionCountModal] = useState(false)
  const [completedProblems, setCompletedProblems] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Generate multiplication problem
  const generateProblem = () => {
    const generateNumber = () => Math.floor(Math.random() * 11) + 2
    let first = generateNumber()
    let second = generateNumber()
    
    // Ensure we don't repeat problems
    let problemKey = `${first}x${second}`
    while (completedProblems.includes(problemKey)) {
      first = generateNumber()
      second = generateNumber()
      problemKey = `${first}x${second}`
    }
    
    setNum1(first)
    setNum2(second)
    return problemKey
  }

  // Start test
  const startTest = (questionCount?: number) => {
    // If a specific question count is provided, update total questions
    if (questionCount) {
      setTotalQuestions(questionCount)
    }

    setScore(0)
    setCurrentQuestion(1)
    setTimer(0)
    setIsTestRunning(true)
    setCompletedProblems([])
    
    // Generate first problem
    const firstProblem = generateProblem()
    setCompletedProblems([firstProblem])
    
    setShowQuestionCountModal(false)
    inputRef.current?.focus()
  }

  // Handle answer submission
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    
    const correctAnswer = num1 * num2
    const parsedAnswer = parseInt(userAnswer)
    const currentProblem = `${num1}x${num2}`

    // Check if answer is correct
    if (parsedAnswer === correctAnswer) {
      setScore(prev => prev + 1)
    }

    // Check if we've reached total questions
    if (currentQuestion < totalQuestions) {
      // Generate a new problem that hasn't been used before
      const newProblem = generateProblem()
      setCompletedProblems(prev => [...prev, newProblem])
      
      // Increment current question AFTER generating new problem
      setCurrentQuestion(prev => prev + 1)
      
      // Reset user answer
      setUserAnswer('')
    } else {
      // Test completed
      setIsTestRunning(false)
      onUpdateBestTimes(`${num1} × ${num2}`, timer)
    }
  }

  // Handle clearing times
  const handleClearTimes = () => {
    onClearTimes()
    setShowConfirmClear(false)
  }

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isTestRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isTestRunning])

  // Key press handler
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && isTestRunning) {
        handleSubmit()
      }
    }
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [isTestRunning, num1, num2, userAnswer])

  return (
    <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
      {/* Confirm Clear Modal */}
      {showConfirmClear && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">Clear Saved Times</h2>
            <p className="mb-4">Are you sure you want to delete all saved times?</p>
            <div className="flex justify-between">
              <button 
                onClick={() => setShowConfirmClear(false)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg mr-2"
              >
                Cancel
              </button>
              <button 
                onClick={handleClearTimes}
                className="bg-red-500 text-white px-4 py-2 rounded-lg"
              >
                Clear Times
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Question Count Selection Modal */}
      {showQuestionCountModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl">
            <h2 className="text-xl font-bold mb-4">Select Number of Questions</h2>
            <div className="grid grid-cols-2 gap-4">
              {QUESTION_OPTIONS.map(count => (
                <button 
                  key={count}
                  onClick={() => startTest(count)}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
                >
                  {count} Questions
                </button>
              ))}
              <button 
                onClick={() => setShowQuestionCountModal(false)}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-blue-600">Multiplication Master</h1>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => setShowConfirmClear(true)}
            className="text-red-500 hover:bg-red-50 p-2 rounded-full"
          >
            <Trash2 className="w-6 h-6" />
          </button>
          <button 
            onClick={() => setShowQuestionCountModal(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center"
          >
            <RefreshCw className="w-4 h-4 mr-2" /> Start Test
          </button>
        </div>
      </div>

      {isTestRunning ? (
        <div>
          <div className="text-center mb-6">
            <p className="text-2xl font-semibold">
              {num1} × {num2} = 
            </p>
            <form onSubmit={handleSubmit} className="mt-4">
              <input 
                ref={inputRef}
                type="number" 
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                className="text-center text-3xl w-full border-b-2 border-blue-500 focus:outline-none"
                autoFocus
              />
            </form>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p>Question: {currentQuestion}/{totalQuestions}</p>
              <p>Time: {timer} seconds</p>
            </div>
            <div className="text-right">
              <p>Score: {score}/{totalQuestions}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center">
          <p className="text-xl">Ready to test your multiplication skills?</p>
          <button 
            onClick={() => setShowQuestionCountModal(true)}
            className="mt-4 bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600"
          >
            Start Multiplication Test
          </button>
        </div>
      )}
    </div>
  )
}

export default MultiplicationTest
