import { Calendar } from "lucide-react"
import React from "react"

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

interface EventCardProps {
  event: AcademicEvent
  isPast: boolean
  darkMode: boolean
  isLoading: boolean
  notificationSettings: Set<number>
  getCategoryColor: (category: string) => string
  getPriorityColor: (priority: string) => string
  getCategoryIcon: (category: string) => React.ReactNode
  toggleNotification: (id: number, title: string) => void
}

// Grid/List 공통 카드
export default function EventCard({
  event,
  isPast,
  darkMode,
  isLoading,
  notificationSettings,
  getCategoryColor,
  getPriorityColor,
  getCategoryIcon,
  toggleNotification
}: EventCardProps) {
  const containerClasses = isPast
    ? darkMode
      ? "bg-gray-800/20 border-gray-700/30 opacity-70"
      : "bg-gray-100/50 border-gray-300/30 opacity-70"
    : darkMode
      ? "bg-gray-700/30 border-gray-600/50"
      : "bg-gray-50/50 border-gray-200/50"

  return (
    <div
      className={`${containerClasses} backdrop-blur-sm p-6 rounded-2xl border hover:shadow-xl transition-all duration-300 hover:transform hover:scale-[1.02] group ${isPast ? "opacity-70" : ""}`}
    >
      {isPast && (
        <div className="flex items-center mb-3">
          <span className="px-3 py-1 bg-gray-500/20 text-gray-500 rounded-full text-xs font-medium border border-gray-400/30">
            ✓ 완료된 일정
          </span>
        </div>
      )}

      {/* 헤더 */}
      <div className="flex items-start justify-between mb-4 px-1">
        <div className="flex items-center flex-1 min-w-0">
          <span
            className={`text-3xl mr-4 flex-shrink-0 group-hover:scale-110 transition-transform duration-300 ${
              isPast ? "grayscale" : ""
            }`}
          >
            {event.icon}
          </span>
          <div className="flex-1 min-w-0">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-sm inline-flex items-center ${
                isPast ? "bg-gray-400/20 text-gray-500 border-gray-400/30" : getCategoryColor(event.category)
              }`}
            >
              {getCategoryIcon(event.category)}
              <span className="ml-2">{event.category}</span>
            </span>
          </div>
        </div>
        <span
          className={`px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-sm flex-shrink-0 ml-3 ${
            isPast ? "bg-gray-400/20 text-gray-500 border-gray-400/30" : getPriorityColor(event.priority)
          }`}
        >
          {event.priority}
        </span>
      </div>

      {/* 본문 */}
      <h3
        className={`text-lg font-bold mb-3 px-1 group-hover:text-blue-600 transition-colors duration-300 ${
          isPast ? "text-gray-500 line-through" : ""
        }`}
      >
        {event.title}
      </h3>
      <p
        className={`text-sm mb-4 px-1 line-clamp-2 leading-relaxed ${
          isPast ? "opacity-50" : "opacity-75"
        }`}
      >
        {event.description}
      </p>

      {/* 날짜 및 남은 일 */}
      <div className="flex items-center justify-between text-sm px-1">
        <div className={`flex items-center ${isPast ? "opacity-40" : "opacity-60"}`}>
          <Calendar className="h-4 w-4 mr-1" />
          <span>
            {new Date(event.startDate).toLocaleDateString("ko-KR")}
            {event.endDate && ` ~ ${new Date(event.endDate).toLocaleDateString("ko-KR")}`}
          </span>
        </div>
        {event.daysLeft !== undefined && !isPast && (
          <div
            className={`font-medium ${
              event.daysLeft <= 7
                ? "text-red-600"
                : event.daysLeft <= 30
                ? "text-orange-600"
                : "text-gray-600"
            }`}
          >
            {event.daysLeft > 0 ? `${event.daysLeft}일 남음` : "진행중"}
          </div>
        )}
        {isPast && <div className="font-medium text-gray-500">완료됨</div>}
      </div>

      {/* 버튼 */}
      <button
        onClick={() => toggleNotification(event.id, event.title)}
        disabled={isLoading || isPast}
        className={`w-full mt-4 py-2 px-4 ${
          isPast
            ? "bg-gray-400/50 text-gray-600 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transform hover:scale-[1.02]"
        } rounded-xl hover:shadow-lg transition-all duration-300 ${
          isLoading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isPast
          ? "완료된 일정"
          : isLoading
          ? "설정 중..."
          : notificationSettings.has(event.id)
          ? "알림 해제"
          : "알림 설정"}
      </button>
    </div>
  )
} 