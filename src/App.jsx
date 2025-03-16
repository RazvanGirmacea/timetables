import React, { useState, useEffect, useRef } from 'react'
import Confetti from 'react-confetti'
import { 
  FaCalculator, 
  FaChartBar, 
  FaPlay, 
  FaStopwatch, 
  FaTrophy, 
  FaCheckCircle, 
  FaTimesCircle,
  FaTrash,
  FaMedal
} from 'react-icons/fa'
import { 
  updatePerformance, 
  getProblemStats, 
  getAllProblemStats,
  resetPerformanceData 
} from './performance-tracker'

// Add the generateProblem function
function generateProblem() {
  const num1 = Math.floor(Math.random() * 12) + 1
  const num2 = Math.floor(Math.random() * 12) + 1
  return {
    num1,
    num2,
    answer: num1 * num2
  }
}

function AchievementProgressBar({ averageTime }) {
  // Define achievement levels based on average time
  const levels = [
    { name: 'Beginner', maxTime: 10, color: '#3498db' },
    { name: 'Intermediate', maxTime: 5, color: '#2ecc71' },
    { name: 'Expert', maxTime: 2, color: '#e74c3c' }
  ]

  // Determine current achievement level
  const currentLevel = levels.find(level => averageTime <= level.maxTime) || levels[0]
  
  // Calculate progress percentage
  const progressPercentage = Math.min(
    (averageTime / currentLevel.maxTime) * 100, 
    100
  )

  return (
    <div className="achievement-progress-container">
      <h3>
        <FaMedal /> Achievement Level: {currentLevel.name}
      </h3>
      <div 
        className="achievement-progress-bar" 
        style={{
          width: '100%',
          backgroundColor: '#f0f0f0',
          borderRadius: '10px',
          overflow: 'hidden'
        }}
      >
        <div 
          style={{
            width: `${100 - progressPercentage}%`,
            height: '20px',
            backgroundColor: currentLevel.color,
            transition: 'width 0.5s ease-in-out'
          }}
        />
      </div>
      <p>
        Aim for {currentLevel.maxTime} seconds or less per question 
        to reach the next level!
      </p>
    </div>
  )
}

function TimesPage() {
  const [problemStats, setProblemStats] = useState([])
  const [sortConfig, setSortConfig] = useState({ 
    key: 'attempts', 
    direction: 'desc' 
  })

  useEffect(() => {
    // Fetch all problem stats when component mounts
    const stats = getAllProblemStats()
    const statsArray = Object.entries(stats).map(([problem, data]) => ({
      problem,
      ...data
    }))
    setProblemStats(statsArray)
  }, [])

  // Sorting function
  const sortedStats = [...problemStats].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1
    }
    return 0
  })

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }))
  }

  return (
    <div className="times-page">
      <h2><FaChartBar /> Performance Tracker</h2>
      {problemStats.length === 0 ? (
        <p>No performance data available. Start a test to track your progress!</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th onClick={() => handleSort('problem')}>Problem</th>
              <th onClick={() => handleSort('bestTime')}>Best Time</th>
              <th onClick={() => handleSort('attempts')}>Attempts</th>
              <th onClick={() => handleSort('incorrectAttempts')}>Incorrect</th>
            </tr>
          </thead>
          <tbody>
            {sortedStats.map((stat, index) => (
              <tr key={index}>
                <td>{stat.problem}</td>
                <td>{stat.bestTime || 'N/A'} sec</td>
                <td>{stat.attempts}</td>
                <td>{stat.incorrectAttempts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <button 
        onClick={() => resetPerformanceData()} 
        className="btn btn-danger"
      >
        <FaTrash /> Reset Performance Data
      </button>
    </div>
  )
}

function App() {
  const [questionSet, setQuestionSet] = useState(10)
  const [currentProblem, setCurrentProblem] = useState(generateProblem())
  const [userAnswer, setUserAnswer] = useState('')
  const [score, setScore] = useState(0)
  const [currentQuestion, setCurrentQuestion] = useState(1)
  const [feedback, setFeedback] = useState('')
  const [timer, setTimer] = useState(0)
  const [isTestRunning, setIsTestRunning] = useState(false)
  const [totalTime, setTotalTime] = useState(0)
  const [incorrectAnswers, setIncorrectAnswers] = useState(0)
  const [problemStats, setProblemStats] = useState({})
  const [currentPage, setCurrentPage] = useState('home')
  const inputRef = useRef(null)
  const timerRef = useRef(null)

  // Start test with specified number of questions
  const startTest = (numQuestions) => {
    setQuestionSet(numQuestions)
    setCurrentQuestion(1)
    setScore(0)
    setTotalTime(0)
    setIncorrectAnswers(0)
    setIsTestRunning(true)
    setCurrentProblem(generateProblem())
    setUserAnswer('')
    setFeedback('')
    
    // Start timer
    timerRef.current = setInterval(() => {
      setTimer(prevTimer => prevTimer + 1)
    }, 1000)
  }

  // Handle answer submission
  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Convert user answer to number and check correctness
    const parsedAnswer = parseInt(userAnswer, 10)
    const isCorrect = parsedAnswer === currentProblem.answer

    // Update performance tracking
    const problemKey = `${currentProblem.num1}x${currentProblem.num2}`
    updatePerformance(problemKey, timer, isCorrect)

    // Update score and feedback
    if (isCorrect) {
      setScore(prevScore => prevScore + 1)
      setFeedback(`Correct! ${currentProblem.num1} × ${currentProblem.num2} = ${currentProblem.answer}`)
    } else {
      setIncorrectAnswers(prev => prev + 1)
      setFeedback(`Incorrect. ${currentProblem.num1} × ${currentProblem.num2} = ${currentProblem.answer}`)
    }

    // Update total time
    setTotalTime(prevTotal => prevTotal + timer)

    // Move to next question or end test
    if (currentQuestion < questionSet) {
      setCurrentQuestion(prev => prev + 1)
      setCurrentProblem(generateProblem())
      setUserAnswer('')
      setTimer(0)
    } else {
      // End test when all questions are answered
      endTest()
    }
  }

  // End the test
  const endTest = () => {
    // Stop the timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    
    setIsTestRunning(false)
    setTimer(0)
  }

  const averageTimePerQuestion = isTestRunning ? 0 : (totalTime / questionSet).toFixed(2)
  const accuracy = isTestRunning ? 0 : (((questionSet - incorrectAnswers) / questionSet) * 100).toFixed(2)

  // Rest of the component remains the same as in the previous version
  const renderContent = () => {
    switch(currentPage) {
      case 'times':
        return <TimesPage />
      case 'home':
      default:
        return (
          <div className="home-container">
            <div className="main-content">
              {!isTestRunning ? (
                <div>
                  <h1><FaCalculator /> Multiplication Master</h1>
                  <div>
                    {[5, 10, 20, 50].map(num => (
                      <button 
                        key={num}
                        className="btn btn-primary" 
                        onClick={() => startTest(num)}
                      >
                        <FaPlay /> {num} Questions
                      </button>
                    ))}
                  </div>
                  
                  {totalTime > 0 && (
                    <div className="metrics">
                      <div className="metric">
                        <FaStopwatch /> Total Time: {totalTime} sec
                      </div>
                      <div className="metric">
                        <FaTrophy /> Avg Time/Q: {averageTimePerQuestion} sec
                      </div>
                      <div className="metric">
                        <FaChartBar /> Accuracy: {accuracy}%
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <h2>Question {currentQuestion} of {questionSet}</h2>
                  <div className="question-container">
                    <span>{currentProblem.num1}</span>
                    <span>×</span>
                    <span>{currentProblem.num2}</span>
                    <span>=</span>
                    <form onSubmit={handleSubmit}>
                      <input
                        ref={inputRef}
                        type="number"
                        className="answer-input"
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        onKeyDown={(e) => {
                          // Explicitly handle Enter key
                          if (e.key === 'Enter') {
                            handleSubmit(e)
                          }
                        }}
                        required
                        autoFocus
                      />
                    </form>
                  </div>
                  
                  <div className="metrics">
                    <div className="metric">
                      <FaStopwatch /> Time: {timer} sec
                    </div>
                    <div className="metric">
                      <FaTrophy /> Score: {score}/{questionSet}
                    </div>
                    {problemStats.bestTime > 0 && (
                      <div className="metric">
                        <FaChartBar /> Best Time: {problemStats.bestTime} sec
                      </div>
                    )}
                  </div>
                  
                  {feedback && (
                    <div className={`feedback ${feedback.includes('Correct') ? 'feedback-correct' : 'feedback-incorrect'}`}>
                      {feedback.includes('Correct') ? <FaCheckCircle /> : <FaTimesCircle />} {feedback}
                    </div>
                  )}
                  
                  <button 
                    className="btn btn-primary" 
                    onClick={endTest}
                  >
                    End Test
                  </button>
                </div>
              )}
            </div>
            {!isTestRunning && totalTime > 0 && (
              <AchievementProgressBar averageTime={parseFloat(averageTimePerQuestion)} />
            )}
          </div>
        )
    }
  }

  return (
    <div className="app-container">
      {renderContent()}
      
      {!isTestRunning && totalTime > 0 && (
        <Confetti 
          width={window.innerWidth} 
          height={window.innerHeight} 
        />
      )}

      {!isTestRunning && (
        <div className="page-links">
          <button 
            className="btn btn-link"
            onClick={() => setCurrentPage('home')}
          >
            Home
          </button>
          <button 
            className="btn btn-link"
            onClick={() => setCurrentPage('times')}
          >
            Times
          </button>
        </div>
      )}
    </div>
  )
}

export default App
