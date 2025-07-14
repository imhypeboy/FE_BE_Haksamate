import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"
import React from "react"

interface CalendarHeaderProps {
  currentDate: Date
  darkMode: boolean
  onPrevMonth: () => void
  onNextMonth: () => void
  onToday: () => void
}

export default function CalendarHeader({
  currentDate,
  darkMode,
  onPrevMonth,
  onNextMonth,
  onToday
}: CalendarHeaderProps) {
  const monthNames = [
    "1월","2월","3월","4월","5월","6월","7월","8월","9월","10월","11월","12월"
  ]

  return (
    <div className="flex items-center justify-between px-1">
      <div className="flex items-center gap-4">
        <h3 className="text-2xl font-bold">
          {currentDate.getFullYear()}년 {monthNames[currentDate.getMonth()]}
        </h3>
        <button
          onClick={onToday}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
            darkMode ? "bg-blue-600/20 text-blue-400 hover:bg-blue-600/30" : "bg-blue-100 text-blue-700 hover:bg-blue-200"}
          `}
        >
          오늘
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button
          aria-label="이전 달"
          onClick={onPrevMonth}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ChevronLeft />
        </button>
        <button
          aria-label="다음 달"
          onClick={onNextMonth}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  )
} 