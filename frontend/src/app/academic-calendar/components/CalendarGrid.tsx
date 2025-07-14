import { Calendar } from "lucide-react"
import React from "react"
import CalendarHeader from "./CalendarHeader"

interface AcademicEvent {
  id: number
  title: string
  description: string
  startDate: string
  endDate?: string
  category: string
  priority: string
  daysLeft?: number
  icon?: string
}

interface CalendarGridProps {
  currentDate: Date
  selectedDate: Date | null
  filteredEvents: AcademicEvent[]
  darkMode: boolean
  isMobile: boolean
  isLoading: boolean
  notificationSettings: Set<number>
  cardClasses: string
  isPastEvent: (event: AcademicEvent) => boolean
  getCategoryColor: (category: string) => string
  getPriorityColor: (priority: string) => string
  getCategoryColorForSelected: (category: string) => string
  setSelectedDate: (date: Date | null) => void
  goToPreviousMonth: () => void
  goToNextMonth: () => void
  goToToday: () => void
  toggleNotification: (id: number, title: string) => void
}

export default function CalendarGrid({
  currentDate,
  selectedDate,
  filteredEvents,
  darkMode,
  isMobile,
  isLoading,
  notificationSettings,
  cardClasses,
  isPastEvent,
  getCategoryColor,
  getPriorityColor,
  getCategoryColorForSelected,
  setSelectedDate,
  goToPreviousMonth,
  goToNextMonth,
  goToToday,
  toggleNotification
}: CalendarGridProps) {
  // 캘린더 유틸리티 함수들
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay()) // 주의 첫째 날까지 포함
    
    const days = []
    const currentDay = new Date(startDate)
    
    // 6주 분량의 날짜 생성 (42일)
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDay))
      currentDay.setDate(currentDay.getDate() + 1)
    }
    
    return days
  }

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return filteredEvents.filter(event => {
      const eventStart = event.startDate
      const eventEnd = event.endDate || event.startDate
      return dateStr >= eventStart && dateStr <= eventEnd
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSameMonth = (date: Date, month: Date) => {
    return date.getMonth() === month.getMonth() && date.getFullYear() === month.getFullYear()
  }

  const days = getDaysInMonth(currentDate)
  const dayNames = ["일", "월", "화", "수", "목", "금", "토"]

  return (
    <div className="space-y-6">
      {/* 캘린더 헤더 */}
      <CalendarHeader
        currentDate={currentDate}
        darkMode={darkMode}
        onPrevMonth={goToPreviousMonth}
        onNextMonth={goToNextMonth}
        onToday={goToToday}
      />

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map((day, index) => (
          <div
            key={day}
            className={`p-3 text-center text-sm font-semibold ${
              index === 0 
                ? "text-red-500" 
                : index === 6 
                  ? "text-blue-500" 
                  : darkMode ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* 캘린더 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((day, index) => {
          const dayEvents = getEventsForDate(day)
          const isCurrentMonth = isSameMonth(day, currentDate)
          const isTodayDate = isToday(day)
          const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString()

          return (
            <div
              key={index}
              onClick={() => setSelectedDate(day)}
              className={`min-h-[80px] sm:min-h-[100px] lg:min-h-[120px] p-1 sm:p-2 rounded-lg sm:rounded-xl border-2 transition-all duration-300 cursor-pointer hover:scale-[1.02] ${
                isSelected
                  ? "border-blue-500 bg-blue-50/90 dark:bg-gray-800/90 dark:border-blue-400"
                  : isTodayDate
                    ? "border-blue-300 bg-blue-25 dark:bg-blue-900/10"
                    : darkMode
                      ? "border-gray-700/50 bg-gray-800/30 hover:bg-gray-700/50"
                      : "border-gray-200/50 bg-white/50 hover:bg-gray-50"
              } ${!isCurrentMonth && "opacity-40"}`}
            >
              {/* 날짜 */}
              <div className={`text-xs sm:text-sm font-semibold mb-1 sm:mb-2 ${
                isTodayDate
                  ? "text-blue-600 dark:text-blue-400"
                  : index % 7 === 0
                    ? "text-red-500"
                    : index % 7 === 6
                      ? "text-blue-500"
                      : isSelected && darkMode
                        ? "text-gray-100"
                        : darkMode ? "text-gray-300" : "text-gray-700"
              }`}>
                {day.getDate()}
              </div>

              {/* 일정들 */}
              <div className="space-y-0.5 sm:space-y-1">
                {dayEvents.slice(0, isMobile ? 2 : 3).map((event) => {
                  const isPast = isPastEvent(event)
                  return (
                    <div
                      key={event.id}
                      className={`px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium truncate transition-all duration-300 hover:scale-105 ${
                        isPast
                          ? 'bg-gray-400/30 text-gray-500 border border-gray-400/30 line-through opacity-60'
                          : isSelected && darkMode
                            ? getCategoryColorForSelected(event.category)
                            : getCategoryColor(event.category)
                      }`}
                      title={`${event.title}${isPast ? ' (완료됨)' : ''}`}
                    >
                      <span className={`mr-1 text-xs ${isPast ? 'grayscale' : ''}`}>{event.icon}</span>
                      <span className="hidden sm:inline">{event.title}</span>
                      <span className="sm:hidden">{event.title.slice(0, 6)}...</span>
                    </div>
                  )
                })}
                {dayEvents.length > (isMobile ? 2 : 3) && (
                  <div className={`px-1 sm:px-2 py-0.5 sm:py-1 rounded text-xs font-medium ${
                    isSelected && darkMode
                      ? "bg-gray-600 text-gray-200 border border-gray-500"
                      : darkMode 
                        ? "bg-gray-600 text-gray-300" 
                        : "bg-gray-200 text-gray-700"
                  }`}>
                    +{dayEvents.length - (isMobile ? 2 : 3)}개
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* 선택된 날짜의 일정 상세 */}
      {selectedDate && (
        <div className={`${cardClasses} rounded-2xl p-6 mt-6`}>
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-xl font-bold">
              {selectedDate.getFullYear()}년 {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 일정
            </h4>
            <button
              onClick={() => setSelectedDate(null)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>
          
          {getEventsForDate(selectedDate).length > 0 ? (
            <div className="space-y-3">
              {getEventsForDate(selectedDate).map((event) => {
                const isPast = isPastEvent(event)
                return (
                  <div
                    key={event.id}
                    className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-md ${
                      isPast 
                        ? darkMode ? 'bg-gray-800/20 border-gray-700/30 opacity-70' : 'bg-gray-100/50 border-gray-300/30 opacity-70'
                        : darkMode ? 'bg-gray-700/30 border-gray-600/50' : 'bg-gray-50/50 border-gray-200/50'
                    }`}
                  >
                    {isPast && (
                      <div className="flex items-center mb-3">
                        <span className="px-3 py-1 bg-gray-500/20 text-gray-500 rounded-full text-xs font-medium border border-gray-400/30">
                          ✓ 완료된 일정
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3 flex-wrap px-1">
                          <span className={`text-xl flex-shrink-0 ${isPast ? 'grayscale' : ''}`}>{event.icon}</span>
                          <h5 className={`font-semibold text-base ${isPast ? 'text-gray-500 line-through' : ''}`}>{event.title}</h5>
                          <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                            isPast 
                              ? 'bg-gray-400/20 text-gray-500 border border-gray-400/30'
                              : getCategoryColor(event.category)
                          }`}>
                            {event.category}
                          </span>
                          <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                            isPast 
                              ? 'bg-gray-400/20 text-gray-500 border border-gray-400/30'
                              : getPriorityColor(event.priority)
                          }`}>
                            {event.priority}
                          </span>
                        </div>
                        <p className={`text-sm mb-3 px-1 leading-relaxed ${isPast ? 'opacity-50' : 'opacity-75'}`}>{event.description}</p>
                        <div className={`flex items-center text-sm px-1 ${isPast ? 'opacity-40' : 'opacity-60'}`}>
                          <Calendar className="h-4 w-4 mr-1" />
                          <span>
                            {new Date(event.startDate).toLocaleDateString('ko-KR')}
                            {event.endDate && ` ~ ${new Date(event.endDate).toLocaleDateString('ko-KR')}`}
                          </span>
                          {isPast && (
                            <span className="ml-3 font-medium text-gray-500">
                              • 완료됨
                            </span>
                          )}
                        </div>
                      </div>
                      <button 
                        onClick={() => toggleNotification(event.id, event.title)}
                        className={`py-2 px-4 ${
                          isPast 
                            ? 'bg-gray-400/50 text-gray-600 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transform hover:scale-105'
                        } rounded-xl hover:shadow-lg transition-all duration-300 text-sm ${
                          isLoading ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        disabled={isLoading || isPast}
                      >
                        {isPast ? "완료된 일정" : isLoading ? "설정 중..." : notificationSettings.has(event.id) ? "알림 해제" : "알림 설정"}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 px-4 text-gray-500">
              이 날에는 일정이 없습니다.
            </div>
          )}
        </div>
      )}
    </div>
  )
} 