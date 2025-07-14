import React from "react"
import { motion, AnimatePresence } from "framer-motion"

interface TimetableTableProps {
  timetable: any[]
  timetableMap: Map<string, string[]>
  DAYS_OF_WEEK: { value: string; label: string }[]
  HOURS: number[]
  isLoading: boolean
  handleGenerate: () => void
}

export default function TimetableTable({ timetable, timetableMap, DAYS_OF_WEEK, HOURS, isLoading, handleGenerate }: TimetableTableProps) {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md border border-white/50">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-900">📅 주간 시간표</h2>
        <motion.button
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGenerate}
          className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-2 px-4 rounded-lg font-semibold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading}
        >
          ✨ 자동 생성
        </motion.button>
      </div>
      <div className="overflow-x-auto rounded-lg">
        <table className="min-w-[600px] bg-transparent border-collapse text-sm">
          <thead>
            <tr>
              <th className="p-3 bg-gray-50/80 border-b border-gray-200 w-20 text-gray-700 font-semibold">시간</th>
              {DAYS_OF_WEEK.map((day) => (
                <th
                  key={day.value}
                  className="p-3 bg-gray-50/80 border-b border-gray-200 text-gray-700 font-semibold"
                >
                  {day.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((hour) => (
              <tr key={hour}>
                <td className="p-2 font-bold bg-gray-50/50 border-b border-gray-100">{hour}:00</td>
                {DAYS_OF_WEEK.map((day) => {
                  const key = `${day.value}-${hour}`
                  const slotSubjects = timetableMap.get(key) || []
                  return (
                    <td className="p-2 border-b border-gray-100 text-center" key={day.value}>
                      <AnimatePresence>
                        {slotSubjects.map((name, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 500, damping: 30 }}
                            className="rounded-md bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-2 py-1 text-xs mb-1 shadow-sm cursor-pointer"
                          >
                            {name}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {timetable.length === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-center py-8"
        >
          <motion.div
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-4xl mb-2"
          >
            📋
          </motion.div>
          <p className="text-gray-500 text-sm">시간표가 비어있습니다</p>
        </motion.div>
      )}
    </div>
  )
} 