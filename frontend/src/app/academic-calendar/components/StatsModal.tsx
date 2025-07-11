import { Calendar, Clock, Bell, Star } from "lucide-react"
import React from "react"
import EventCard from "./EventCard"

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

interface StatsModalProps {
  modalType: 'all' | 'upcoming' | 'notifications' | 'important' | null
  statsData: {
    all: AcademicEvent[]
    upcoming: AcademicEvent[]
    notifications: AcademicEvent[]
    important: AcademicEvent[]
  }
  darkMode: boolean
  isLoading: boolean
  notificationSettings: Set<number>
  cardClasses: string
  isPastEvent: (event: AcademicEvent) => boolean
  getCategoryColor: (category: string) => string
  getPriorityColor: (priority: string) => string
  getCategoryIcon: (category: string) => React.ReactNode
  toggleNotification: (id: number, title: string) => void
  onClose: () => void
}

export default function StatsModal({
  modalType,
  statsData,
  darkMode,
  isLoading,
  notificationSettings,
  cardClasses,
  isPastEvent,
  getCategoryColor,
  getPriorityColor,
  getCategoryIcon,
  toggleNotification,
  onClose
}: StatsModalProps) {
  if (!modalType) return null

  const getModalConfig = () => {
    switch (modalType) {
      case 'all':
        return {
          icon: <Calendar className="w-6 h-6 mr-3 text-blue-600" />,
          title: "전체 일정"
        }
      case 'upcoming':
        return {
          icon: <Clock className="w-6 h-6 mr-3 text-orange-600" />,
          title: "임박한 일정"
        }
      case 'notifications':
        return {
          icon: <Bell className="w-6 h-6 mr-3 text-green-600" />,
          title: "알림 설정된 일정"
        }
      case 'important':
        return {
          icon: <Star className="w-6 h-6 mr-3 text-purple-600" />,
          title: "중요 일정"
        }
      default:
        return { icon: null, title: "" }
    }
  }

  const config = getModalConfig()
  const events = statsData[modalType] || []

  const getEmptyMessage = () => {
    switch (modalType) {
      case 'all': return "등록된 일정이 없습니다."
      case 'upcoming': return "임박한 일정이 없습니다."
      case 'notifications': return "알림 설정된 일정이 없습니다."
      case 'important': return "중요 일정이 없습니다."
      default: return "일정이 없습니다."
    }
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div 
        className={`${cardClasses} rounded-2xl p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto mx-4`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold flex items-center">
            {config.icon}
            {config.title}
            <span className="ml-3 text-sm font-normal opacity-60">
              ({events.length}개)
            </span>
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
            aria-label="모달 닫기"
          >
            ✕
          </button>
        </div>

        {/* 콘텐츠 */}
        {events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2">
            {events.map((event) => (
              <div key={event.id} className="relative">
                <EventCard
                  event={event}
                  isPast={isPastEvent(event)}
                  darkMode={darkMode}
                  isLoading={isLoading}
                  notificationSettings={notificationSettings}
                  getCategoryColor={getCategoryColor}
                  getPriorityColor={getPriorityColor}
                  getCategoryIcon={getCategoryIcon}
                  toggleNotification={toggleNotification}
                />
                
                {/* 알림 모달에서는 해제 버튼 오버라이드 */}
                {modalType === 'notifications' && (
                  <div className="absolute bottom-6 left-6 right-6">
                    <button 
                      onClick={() => toggleNotification(event.id, event.title)}
                      className={`w-full py-2 px-4 ${
                        isPastEvent(event) 
                          ? 'bg-gray-400/50 text-gray-600 cursor-not-allowed'
                          : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700'
                      } rounded-xl hover:shadow-lg transition-all duration-300 text-sm ${
                        isLoading ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={isLoading || isPastEvent(event)}
                    >
                      {isPastEvent(event) ? "완료된 일정" : isLoading ? "해제 중..." : "알림 해제"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 mx-auto mb-4 opacity-30">
              {config.icon}
            </div>
            <p className="text-lg opacity-60">
              {getEmptyMessage()}
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 