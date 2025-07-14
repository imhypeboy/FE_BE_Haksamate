"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Bell, Clock, AlertTriangle, Filter, Star, GraduationCap, BookOpen, PartyPopper, Users, MapPin, Search, Sun, Moon, ChevronLeft, ChevronRight, Grid3x3, CalendarDays } from "lucide-react"
import Sidebar from "../sidebar/sidebar"
import { supabase } from "@/lib/supabaseClient"
import StatsCard from "./components/StatsCard"
import CalendarHeader from "./components/CalendarHeader"
import EventCard from "./components/EventCard"
import StatsModal from "./components/StatsModal"
import CalendarGrid from "./components/CalendarGrid"
import {useEvents}from "./hooks/useEvents"
import useResponsive from "./hooks/useResponsive"
import { ACADEMIC_EVENTS_RAW, type AcademicEventRaw } from "./data/academicEvents"

interface AcademicEvent extends AcademicEventRaw {
  daysLeft?: number
}

// 날짜 계산 유틸리티 함수
const calculateDaysLeft = (startDate: string): number => {
  const today = new Date()
  const eventDate = new Date(startDate)
  const diffTime = eventDate.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}



export default function AcademicCalendarPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string>("전체")
  const [showNotifications, setShowNotifications] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [darkMode, setDarkMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [viewMode, setViewMode] = useState<"grid" | "calendar">("grid")
  const [notificationSettings, setNotificationSettings] = useState<Set<number>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)
  
  // 캘린더 관련 상태
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const [modalType, setModalType] = useState<'all' | 'upcoming' | 'notifications' | 'important' | null>(null)

  const categories = ["전체", "성적", "수강신청", "시험", "축제", "공휴일", "등록", "실습", "개강", "졸업", "기타"]

  // 토스트 메시지 표시 함수
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }, [])

  // 알림 설정 토글 함수
  const toggleNotification = useCallback(async (eventId: number, eventTitle: string) => {
    setIsLoading(true)
    try {
      // 실제 API 호출을 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setNotificationSettings(prev => {
        const newSettings = new Set(prev)
        if (newSettings.has(eventId)) {
          newSettings.delete(eventId)
          showToast(`"${eventTitle}" 알림이 해제되었습니다`, 'info')
        } else {
          newSettings.add(eventId)
          showToast(`"${eventTitle}" 알림이 설정되었습니다`, 'success')
        }
        
        // localStorage에 저장
        localStorage.setItem('notificationSettings', JSON.stringify([...newSettings]))
        return newSettings
      })
    } catch (error) {
      showToast('알림 설정 중 오류가 발생했습니다', 'error')
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  // 실제 날짜 계산이 포함된 이벤트 데이터
  const academicEvents: AcademicEvent[] = useMemo(() => {
    return ACADEMIC_EVENTS_RAW.map(event => ({
      ...event,
      daysLeft: calculateDaysLeft(event.startDate)
    }))
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        router.push("/auth/login")
        return
      }
      setUserId(session.user.id)
    }
    checkAuth()
  }, [router])

  // 다크모드 localStorage 지원 추가
  useEffect(() => {
    try {
      const savedDarkMode = localStorage.getItem('darkMode')
      if (savedDarkMode !== null) {
        const parsed = JSON.parse(savedDarkMode)
        if (typeof parsed === "boolean") {
          setDarkMode(parsed)
        } else {
          throw new Error("Invalid value for darkMode")
        }
      } else {
        const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
        setDarkMode(prefersDark)
      }
    } catch (e) {
      console.warn("⚠️ localStorage darkMode 값 오류. 기본값으로 초기화합니다.", e)
      localStorage.removeItem("darkMode")
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      setDarkMode(prefersDark)
    }
  }, [])

  // 다크모드 토글 함수 개선
  const toggleDarkMode = useCallback(() => {
    setDarkMode(prev => {
      const newValue = !prev
      localStorage.setItem('darkMode', JSON.stringify(newValue))
      return newValue
    })
  }, [])

  // localStorage에서 알림 설정 복원
  useEffect(() => {
    const savedNotifications = localStorage.getItem('notificationSettings')
    if (savedNotifications) {
      try {
        const settings = JSON.parse(savedNotifications)
        setNotificationSettings(new Set(settings))
      } catch (error) {
        console.error('Failed to load notification settings:', error)
      }
    }
  }, [])



  // 모달 ESC 키 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setModalType(null)
        setSelectedDate(null)
      }
    }
    
    if (modalType || selectedDate) {
      document.addEventListener('keydown', handleEsc)
      return () => document.removeEventListener('keydown', handleEsc)
    }
  }, [modalType, selectedDate])

  // useEvents 훅 사용
  const { filteredEvents, upcomingEvents, isPastEvent, stats } = useEvents({
    events: academicEvents,
    selectedCategory,
    searchTerm,
    notificationSettings
  })

  // 통계 데이터 - useEvents에서 제공하는 stats 사용
  const statsData = useMemo(() => stats, [stats])
  
  // useResponsive 훅 사용
  const { isMobile } = useResponsive()

  const getPriorityColor = useCallback((priority: string) => {
    const colors = {
      높음: darkMode 
        ? "bg-red-900/30 text-red-300 border-red-700/50 backdrop-blur-sm"
        : "bg-red-50 text-red-700 border-red-200/50 backdrop-blur-sm",
      보통: darkMode
        ? "bg-amber-900/30 text-amber-300 border-amber-700/50 backdrop-blur-sm"
        : "bg-amber-50 text-amber-700 border-amber-200/50 backdrop-blur-sm",
      낮음: darkMode
        ? "bg-emerald-900/30 text-emerald-300 border-emerald-700/50 backdrop-blur-sm"
        : "bg-emerald-50 text-emerald-700 border-emerald-200/50 backdrop-blur-sm"
    }
    return colors[priority as keyof typeof colors] || colors.보통
  }, [darkMode])

  const getCategoryColor = useCallback((category: string) => {
    const colors = {
      성적: darkMode ? "bg-blue-900/30 text-blue-300 border-blue-700/50" : "bg-blue-50 text-blue-700 border-blue-200/50",
      수강신청: darkMode ? "bg-purple-900/30 text-purple-300 border-purple-700/50" : "bg-purple-50 text-purple-700 border-purple-200/50",
      시험: darkMode ? "bg-red-900/30 text-red-300 border-red-700/50" : "bg-red-50 text-red-700 border-red-200/50",
      축제: darkMode ? "bg-pink-900/30 text-pink-300 border-pink-700/50" : "bg-pink-50 text-pink-700 border-pink-200/50",
      공휴일: darkMode ? "bg-indigo-900/30 text-indigo-300 border-indigo-700/50" : "bg-indigo-50 text-indigo-700 border-indigo-200/50",
      등록: darkMode ? "bg-orange-900/30 text-orange-300 border-orange-700/50" : "bg-orange-50 text-orange-700 border-orange-200/50",
      실습: darkMode ? "bg-teal-900/30 text-teal-300 border-teal-700/50" : "bg-teal-50 text-teal-700 border-teal-200/50",
      개강: darkMode ? "bg-green-900/30 text-green-300 border-green-700/50" : "bg-green-50 text-green-700 border-green-200/50",
      졸업: darkMode ? "bg-yellow-900/30 text-yellow-300 border-yellow-700/50" : "bg-yellow-50 text-yellow-700 border-yellow-200/50",
      기타: darkMode ? "bg-gray-700/30 text-gray-300 border-gray-600/50" : "bg-gray-50 text-gray-700 border-gray-200/50"
    }
    return colors[category as keyof typeof colors] || colors.기타
  }, [darkMode])

  // 선택된 날짜에서 더 잘 보이는 색상 (다크모드용)
  const getCategoryColorForSelected = useCallback((category: string) => {
    const colors = {
      성적: "bg-blue-600 text-white border-blue-500",
      수강신청: "bg-purple-600 text-white border-purple-500",
      시험: "bg-red-600 text-white border-red-500",
      축제: "bg-pink-600 text-white border-pink-500",
      공휴일: "bg-indigo-600 text-white border-indigo-500",
      등록: "bg-orange-600 text-white border-orange-500",
      실습: "bg-teal-600 text-white border-teal-500",
      개강: "bg-green-600 text-white border-green-500",
      졸업: "bg-yellow-600 text-white border-yellow-500",
      기타: "bg-gray-600 text-white border-gray-500"
    }
    return colors[category as keyof typeof colors] || colors.기타
  }, [])



  const getCategoryIcon = useCallback((category: string) => {
    const icons = {
      성적: <Star className="w-4 h-4" />,
      수강신청: <BookOpen className="w-4 h-4" />,
      시험: <Clock className="w-4 h-4" />,
      축제: <PartyPopper className="w-4 h-4" />,
      공휴일: <Calendar className="w-4 h-4" />,
      등록: <Users className="w-4 h-4" />,
      실습: <MapPin className="w-4 h-4" />,
      개강: <Bell className="w-4 h-4" />,
      졸업: <GraduationCap className="w-4 h-4" />,
      기타: <Calendar className="w-4 h-4" />
    }
    return icons[category as keyof typeof icons] || icons.기타
  }, [])

  const themeClasses = darkMode 
    ? "bg-gray-900 text-gray-100" 
    : "bg-gradient-to-br from-blue-50 via-white to-purple-50 text-gray-900"

  const cardClasses = darkMode
    ? "bg-gray-800/50 backdrop-blur-md border-gray-700/50"
    : "bg-white/70 backdrop-blur-md border-white/50 shadow-xl shadow-blue-100/20"

  // 캘린더 네비게이션 함수들
  const goToPreviousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
    setSelectedDate(null)
  }



  return (
    <div className={`flex min-h-screen transition-all duration-300 ${themeClasses}`}>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 font-sans pb-12">
        {/* 토스트 메시지 */}
        {toast && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg backdrop-blur-md border transition-all duration-300 transform ${
            toast.type === 'success' 
              ? 'bg-green-500/90 text-white border-green-400/50' 
              : toast.type === 'error'
                ? 'bg-red-500/90 text-white border-red-400/50'
                : 'bg-blue-500/90 text-white border-blue-400/50'
          }`}>
            <div className="flex items-center">
              <span className="mr-2">
                {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}
              </span>
              <p className="font-medium">{toast.message}</p>
              <button
                onClick={() => setToast(null)}
                className="ml-3 text-white/70 hover:text-white transition-colors"
                aria-label="닫기"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        {/* 헤더 - 다크모드 토글만 */}
        <div className="flex justify-end p-4">
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-lg transition-all duration-300 ${
              darkMode 
                ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30" 
                : "bg-gray-200/80 text-gray-600 hover:bg-gray-300/80"
            }`}
            aria-label="다크모드 토글"
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>

        <div className="max-w-7xl mx-auto py-8 px-6 space-y-8">
          {/* 긴급 알림 - 조건 개선 */}
          {showNotifications && upcomingEvents.length > 0 && (
            <div 
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-md border border-white/20 shadow-2xl animate-spring-slide-in"
              style={{
                animation: 'spring-slide-in 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards'
              }}
            >
              <div className="absolute inset-0 bg-white/10 backdrop-blur-sm"></div>
              <div className="relative p-6 text-white">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4 backdrop-blur-sm">
                      <AlertTriangle className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold mb-2">🚨 긴급 알림</h2>
                      <p className="opacity-90 mb-4">30일 이내 중요한 학사 일정을 확인하세요!</p>
                      <div className="grid gap-3">
                        {upcomingEvents.map((event) => (
                          <div
                            key={event.id}
                            className="bg-white/15 backdrop-blur-sm p-4 rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-[1.02]"
                          >
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 px-2">
                              <div className="flex items-start sm:items-center flex-1 min-w-0">
                                <span className="text-2xl mr-4 flex-shrink-0">{event.icon}</span>
                                <div className="flex-1 min-w-0 pr-2">
                                  <div className="flex flex-wrap items-center gap-2 mb-2">
                                    <span className="font-semibold text-white break-words text-base">{event.title}</span>
                                    <span className="px-3 py-1 bg-white/30 backdrop-blur-sm rounded-lg text-xs font-medium text-white/90 border border-white/20 whitespace-nowrap">
                                      {event.category}
                                    </span>
                                  </div>
                                  <span className="text-sm text-white/80 block leading-relaxed">{event.description}</span>
                                </div>
                              </div>
                              <div className="flex-shrink-0 text-right sm:text-center">
                                <span className="text-sm bg-white/25 border border-white/30 px-4 py-2 rounded-full font-medium backdrop-blur-sm text-white inline-block">
                                  {event.daysLeft && event.daysLeft > 0 ? `${event.daysLeft}일 남음` : "진행중"}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/20 transition-all duration-300 focus:ring-2 focus:ring-white/50 focus:outline-none"
                    aria-label="긴급 알림 닫기"
                  >
                    ✕
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 빈 상태 처리 개선 */}
          {showNotifications && upcomingEvents.length === 0 && (
            <div className={`${cardClasses} rounded-2xl p-6 text-center`}>
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <span className="text-2xl">😌</span>
              </div>
              <h3 className="text-lg font-semibold mb-2">모든 일정이 여유롭습니다</h3>
              <p className="text-sm opacity-70">30일 이내에 임박한 중요 일정이 없습니다.</p>
            </div>
          )}

          {/* 통계 카드 - 반응형 개선 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            <StatsCard
              title="전체 일정"
              value={academicEvents.length}
              gradientFrom="from-blue-500" gradientTo="to-blue-600"
              icon={<Calendar className="w-6 h-6 text-white" />}
              cardClasses={cardClasses}
              onClick={() => setModalType('all')}
            />
            
            <StatsCard
              title="임박한 일정"
              value={upcomingEvents.length}
              gradientFrom="from-orange-500" gradientTo="to-red-500"
              icon={<Clock className="w-6 h-6 text-white" />}
              cardClasses={cardClasses}
              onClick={() => setModalType('upcoming')}
            />
            
            <StatsCard
              title="알림 설정"
              value={notificationSettings.size}
              gradientFrom="from-green-500" gradientTo="to-emerald-500"
              icon={<Bell className="w-6 h-6 text-white" />}
              cardClasses={cardClasses}
              onClick={() => setModalType('notifications')}
            />
            
            <StatsCard
              title="중요 일정"
              value={academicEvents.filter(e => e.priority === "높음").length}
              gradientFrom="from-purple-500" gradientTo="to-pink-500"
              icon={<Star className="w-6 h-6 text-white" />}
              cardClasses={cardClasses}
              onClick={() => setModalType('important')}
            />
          </div>

          {/* 검색 및 필터 - 접근성 개선 */}
          <div className={`${cardClasses} rounded-2xl p-6`}>
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex-1 relative w-full md:w-auto">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="일정 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl border transition-all duration-300 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none ${
                    darkMode 
                      ? "bg-gray-700/50 border-gray-600 text-gray-100 placeholder-gray-400" 
                      : "bg-white/50 border-gray-200 text-gray-900 placeholder-gray-500"
                  }`}
                  aria-label="학사 일정 검색"
                />
              </div>
              
              <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 opacity-70" />
                  <select
                    className={`border rounded-xl px-4 py-3 transition-all duration-300 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none ${
                      darkMode 
                        ? "bg-gray-700/50 border-gray-600 text-gray-100" 
                        : "bg-white/50 border-gray-200 text-gray-900"
                    }`}
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    aria-label="카테고리 필터"
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex bg-gray-200/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-300/50 dark:border-gray-600/50 rounded-xl p-1" role="tablist" aria-label="보기 모드 선택">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 focus:ring-2 focus:ring-blue-500/50 focus:outline-none flex items-center gap-2 font-medium ${
                      viewMode === "grid" 
                        ? "bg-white dark:bg-gray-700 shadow-lg border border-gray-200/50 dark:border-gray-500/50 text-gray-900 dark:text-gray-100" 
                        : "hover:bg-white/70 dark:hover:bg-gray-700/70 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                    role="tab"
                    aria-selected={viewMode === "grid"}
                    aria-controls="calendar-content"
                  >
                    <Grid3x3 className="w-4 h-4" />
                    격자
                  </button>
                  <button
                    onClick={() => setViewMode("calendar")}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 focus:ring-2 focus:ring-blue-500/50 focus:outline-none flex items-center gap-2 font-medium ${
                      viewMode === "calendar" 
                        ? "bg-white dark:bg-gray-700 shadow-lg border border-gray-200/50 dark:border-gray-500/50 text-gray-900 dark:text-gray-100" 
                        : "hover:bg-white/70 dark:hover:bg-gray-700/70 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                    }`}
                    role="tab"
                    aria-selected={viewMode === "calendar"}
                    aria-controls="calendar-content"
                  >
                    <CalendarDays className="w-4 h-4" />
                    캘린더
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 학사 일정 목록 */}
          <div className={`${cardClasses} rounded-2xl p-6`} id="calendar-content">
            <h2 className="text-2xl font-bold mb-6 flex items-center px-2">
              <Calendar className="w-6 h-6 mr-3 text-blue-600" />
              학사 일정
              <span className="ml-3 text-sm font-normal opacity-60">
                ({filteredEvents.length}개)
              </span>
            </h2>

            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-2">
                {filteredEvents.map((event) => (
                  <EventCard
                    key={event.id}
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
                ))}
              </div>
            ) : (
              <CalendarGrid
                currentDate={currentDate}
                selectedDate={selectedDate}
                filteredEvents={filteredEvents}
                darkMode={darkMode}
                isMobile={isMobile}
                isLoading={isLoading}
                notificationSettings={notificationSettings}
                cardClasses={cardClasses}
                isPastEvent={isPastEvent}
                getCategoryColor={getCategoryColor}
                getPriorityColor={getPriorityColor}
                getCategoryColorForSelected={getCategoryColorForSelected}
                setSelectedDate={setSelectedDate}
                goToPreviousMonth={goToPreviousMonth}
                goToNextMonth={goToNextMonth}
                goToToday={goToToday}
                toggleNotification={toggleNotification}
              />
            )}
            
            {filteredEvents.length === 0 && (
              <div className="text-center py-12 px-4">
                <div className="w-24 h-24 mx-auto mb-4 opacity-30">
                  <Calendar className="w-full h-full" />
                </div>
                <p className="text-lg opacity-60">
                  {searchTerm ? `"${searchTerm}"에 대한 검색 결과가 없습니다.` : "선택한 카테고리에 해당하는 일정이 없습니다."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* 통계 모달 */}
        <StatsModal
          modalType={modalType}
          statsData={statsData}
          darkMode={darkMode}
          isLoading={isLoading}
          notificationSettings={notificationSettings}
          cardClasses={cardClasses}
          isPastEvent={isPastEvent}
          getCategoryColor={getCategoryColor}
          getPriorityColor={getPriorityColor}
          getCategoryIcon={getCategoryIcon}
          toggleNotification={toggleNotification}
          onClose={() => setModalType(null)}
        />
      </div>
    </div>
  )
}