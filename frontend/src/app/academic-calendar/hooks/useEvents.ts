import { useCallback, useMemo } from "react"

export interface AcademicEvent {
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

interface UseEventsProps {
  events: AcademicEvent[]
  selectedCategory: string
  searchTerm: string
  notificationSettings: Set<number>
}

export function useEvents({
  events,
  selectedCategory,
  searchTerm,
  notificationSettings
}: UseEventsProps) {
  /** 지나간 일정 */
  const isPastEvent = useCallback((event: AcademicEvent) => {
    const today = new Date()
    const end = event.endDate ? new Date(event.endDate) : new Date(event.startDate)
    today.setHours(0, 0, 0, 0)
    end.setHours(23, 59, 59, 999)
    return end < today
  }, [])

  /** 전처리 (daysLeft 계산) */
  const preparedEvents = useMemo(() => {
    return events.map((ev) => {
      const diff = Math.ceil(
        (new Date(ev.startDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
      )
      return { ...ev, daysLeft: diff }
    })
  }, [events])

  /** 필터 + 정렬 */
  const filteredEvents = useMemo(() => {
    let list = preparedEvents

    if (selectedCategory !== "전체") {
      list = list.filter((ev) => ev.category === selectedCategory)
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      list = list.filter(
        (ev) => ev.title.toLowerCase().includes(term) || ev.description.toLowerCase().includes(term)
      )
    }

    // 완료된 일정은 뒤로, 그 외는 daysLeft 기준 오름차순
    return list.sort((a, b) => {
      const aPast = isPastEvent(a)
      const bPast = isPastEvent(b)
      if (aPast !== bPast) return aPast ? 1 : -1
      if (!aPast && !bPast) return (a.daysLeft || 0) - (b.daysLeft || 0)
      // 둘 다 past
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
    })
  }, [preparedEvents, selectedCategory, searchTerm, isPastEvent])

  /** 30일 이내 임박한 일정 */
  const upcomingEvents = useMemo(
    () =>
      preparedEvents
        .filter((ev) => ev.daysLeft !== undefined && ev.daysLeft >= 0 && ev.daysLeft <= 30)
        .sort((a, b) => (a.daysLeft || 0) - (b.daysLeft || 0))
        .slice(0, 3),
    [preparedEvents]
  )

  /** 중요·알림 통계 */
  const stats = useMemo(() => {
    const sort = (arr: AcademicEvent[]) => [...arr].sort((a, b) => {
      const aPast = isPastEvent(a)
      const bPast = isPastEvent(b)
      if (aPast !== bPast) return aPast ? 1 : -1
      return (a.daysLeft || 0) - (b.daysLeft || 0)
    })

    return {
      all: sort(preparedEvents),
      upcoming: upcomingEvents,
      notifications: sort(preparedEvents.filter((e) => notificationSettings.has(e.id))),
      important: sort(preparedEvents.filter((e) => e.priority === "높음"))
    }
  }, [preparedEvents, upcomingEvents, isPastEvent, notificationSettings])

  return { filteredEvents, upcomingEvents, isPastEvent, stats }
} 