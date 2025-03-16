import React from 'react'
import { Star } from 'lucide-react'
import { BestTime } from '../App'

interface AchievementBarProps {
  bestTimes: BestTime[]
}

const AchievementBar: React.FC<AchievementBarProps> = ({ bestTimes }) => {
  const calculateAverageTime = () => {
    return bestTimes.length > 0 
      ? bestTimes.reduce((sum, time) => sum + time.time, 0) / bestTimes.length 
      : 0
  }

  const averageTime = calculateAverageTime()

  const achievements = [
    { 
      title: 'Beginner', 
      maxTime: 8, 
      description: 'Just getting started!',
      color: 'bg-gray-300'
    },
    { 
      title: 'Improving', 
      maxTime: 6, 
      description: 'Making good progress',
      color: 'bg-green-300'
    },
    { 
      title: 'Advanced', 
      maxTime: 4.5, 
      description: 'Becoming a pro!',
      color: 'bg-blue-400'
    },
    { 
      title: 'Expert', 
      maxTime: 3, 
      description: 'Multiplication master!',
      color: 'bg-purple-500'
    },
    { 
      title: 'Genius', 
      maxTime: 2.5, 
      description: 'Incredible speed!',
      color: 'bg-yellow-400'
    }
  ]

  const currentAchievement = achievements
    .findLast(a => averageTime <= a.maxTime) || achievements[0]

  return (
    <div className="w-64 bg-white shadow-lg p-6 flex flex-col items-center">
      <h2 className="text-xl font-bold mb-6 flex items-center">
        <Star className="w-6 h-6 mr-2 text-yellow-500" />
        Achievement
      </h2>
      
      {bestTimes.length > 0 ? (
        <div className="w-full">
          <div className="mb-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{currentAchievement.title}</p>
            <p className="text-sm text-gray-500">{currentAchievement.description}</p>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
            <div 
              className={`h-4 rounded-full ${currentAchievement.color}`}
              style={{ 
                width: `${(averageTime / achievements[achievements.length - 1].maxTime) * 100}%` 
              }}
            ></div>
          </div>
          
          <div className="text-center">
            <p>Average Time: {averageTime.toFixed(2)} seconds</p>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500">
          Start a test to track your achievements!
        </div>
      )}
    </div>
  )
}

export default AchievementBar
