import React, { useState, useEffect } from 'react'
import MultiplicationTest from './components/MultiplicationTest'
import TimesTable from './components/TimesTable'
import AchievementBar from './components/AchievementBar'
import { BookOpen, Target, Trophy } from 'lucide-react'

export interface BestTime {
  problem: string
  time: number
  attempts: number
}

function App() {
  const [activeTab, setActiveTab] = useState<'test' | 'times'>('test')
  const [bestTimes, setBestTimes] = useState<BestTime[]>([])

  // Load best times from localStorage on initial render
  useEffect(() => {
    const savedTimes = localStorage.getItem('multiplicationBestTimes')
    if (savedTimes) {
      setBestTimes(JSON.parse(savedTimes))
    }
  }, [])

  const handleUpdateBestTimes = (newProblem: string, newTime: number) => {
    const existingTimeIndex = bestTimes.findIndex(t => t.problem === newProblem)
    
    let updatedTimes: BestTime[]
    if (existingTimeIndex !== -1) {
      // Update existing problem time
      updatedTimes = bestTimes.map((time, index) => 
        index === existingTimeIndex 
          ? {
              problem: newProblem, 
              time: Math.min(time.time, newTime),
              attempts: time.attempts + 1
            }
          : time
      )
    } else {
      // Add new problem time
      updatedTimes = [
        ...bestTimes, 
        { problem: newProblem, time: newTime, attempts: 1 }
      ]
    }

    // Sort times from worst to best
    const sortedTimes = updatedTimes.sort((a, b) => b.time - a.time)
    
    // Save to localStorage
    localStorage.setItem('multiplicationBestTimes', JSON.stringify(sortedTimes))
    
    // Update state
    setBestTimes(sortedTimes)
  }

  const handleClearTimes = () => {
    // Remove from localStorage
    localStorage.removeItem('multiplicationBestTimes')
    
    // Clear state
    setBestTimes([])
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex">
      {/* Sidebar Navigation */}
      <div className="w-20 bg-white shadow-lg flex flex-col items-center py-8 space-y-6">
        <button 
          onClick={() => setActiveTab('test')}
          className={`p-3 rounded-lg ${activeTab === 'test' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
        >
          <Target className="w-6 h-6" />
        </button>
        <button 
          onClick={() => setActiveTab('times')}
          className={`p-3 rounded-lg ${activeTab === 'times' ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'}`}
        >
          <BookOpen className="w-6 h-6" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex">
        <div className="flex-grow p-8">
          {activeTab === 'test' ? (
            <MultiplicationTest 
              onUpdateBestTimes={handleUpdateBestTimes}
              onClearTimes={handleClearTimes}
            />
          ) : (
            <TimesTable bestTimes={bestTimes} />
          )}
        </div>

        {/* Achievement Bar */}
        <AchievementBar bestTimes={bestTimes} />
      </div>
    </div>
  )
}

export default App
