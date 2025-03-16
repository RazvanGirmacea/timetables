import React from 'react'
import { Trophy } from 'lucide-react'
import { BestTime } from '../App'

interface TimesTableProps {
  bestTimes: BestTime[]
}

const TimesTable: React.FC<TimesTableProps> = ({ bestTimes }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center">
        <Trophy className="w-6 h-6 mr-3 text-yellow-500" /> 
        Best Multiplication Times
      </h2>
      {bestTimes.length === 0 ? (
        <div className="text-center text-gray-500">
          Complete a test to see your best times!
        </div>
      ) : (
        <table className="w-full">
          <thead>
            <tr className="bg-blue-50">
              <th className="p-3 text-left">Multiplication</th>
              <th className="p-3 text-right">Time (seconds)</th>
              <th className="p-3 text-right">Attempts</th>
            </tr>
          </thead>
          <tbody>
            {bestTimes.map((timeEntry) => (
              <tr key={timeEntry.problem} className="border-b hover:bg-blue-50">
                <td className="p-3">{timeEntry.problem}</td>
                <td className="p-3 text-right">{timeEntry.time}</td>
                <td className="p-3 text-right">{timeEntry.attempts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default TimesTable
