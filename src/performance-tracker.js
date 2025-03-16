// Performance tracking using localStorage
export function updatePerformance(problem, time, isCorrect) {
  // Retrieve existing performance data
  const performanceData = JSON.parse(localStorage.getItem('multiplicationPerformance') || '{}')
  
  // Initialize problem data if not exists
  if (!performanceData[problem]) {
    performanceData[problem] = {
      bestTime: 0,
      attempts: 0,
      incorrectAttempts: 0
    }
  }
  
  // Update performance metrics
  const problemData = performanceData[problem]
  problemData.attempts++
  
  // Update best time (if it's first time or new time is better)
  if (problemData.bestTime === 0 || time < problemData.bestTime) {
    problemData.bestTime = time
  }
  
  // Track incorrect attempts
  if (!isCorrect) {
    problemData.incorrectAttempts++
  }
  
  // Save updated performance data
  localStorage.setItem('multiplicationPerformance', JSON.stringify(performanceData))
}

export function getProblemStats(problem) {
  const performanceData = JSON.parse(localStorage.getItem('multiplicationPerformance') || '{}')
  
  return performanceData[problem] || {
    bestTime: 0,
    attempts: 0,
    incorrectAttempts: 0
  }
}

export function getAllProblemStats() {
  return JSON.parse(localStorage.getItem('multiplicationPerformance') || '{}')
}

export function resetPerformanceData() {
  localStorage.removeItem('multiplicationPerformance')
}
