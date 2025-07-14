"use client"

import { useEffect, useState, useCallback } from "react"
import { presenceManager } from "@/lib/presenceManager"

export const useOnlineUsers = (userId: string | null) => {
  const [onlineIds, setOnlineIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleOnlineUsersUpdate = useCallback((newOnlineIds: string[]) => {
    setOnlineIds(newOnlineIds)
    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (!userId) {
      setOnlineIds([])
      setIsLoading(false)
      setError(null)
      return
    }

    setIsLoading(true)
    setError(null)

    let unsubscribe: (() => void) | null = null

    const initializePresence = async () => {
      try {
        // PresenceManager 구독
        unsubscribe = presenceManager.subscribe(handleOnlineUsersUpdate)

        // 현재 상태 가져오기
        const currentOnlineIds = presenceManager.getOnlineIds()
        if (currentOnlineIds.length > 0) {
          setOnlineIds(currentOnlineIds)
          setIsLoading(false)
        }

        // PresenceManager 초기화 (필요한 경우에만)
        if (presenceManager.getCurrentUserId() !== userId) {
          await presenceManager.initialize(userId)
        } else {
          setIsLoading(false)
        }
      } catch (err) {
        console.error("Presence 초기화 오류:", err)
        setError(err instanceof Error ? err.message : "알 수 없는 오류")
        setIsLoading(false)
      }
    }

    initializePresence()

    // 클린업 함수
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [userId, handleOnlineUsersUpdate])

  // 컴포넌트 언마운트 시 정리 (전체 앱이 종료될 때만)
  useEffect(() => {
    return () => {
      // 더 이상 구독자가 없으면 정리
      if (presenceManager.getSubscriberCount() === 0) {
        presenceManager.cleanup()
      }
    }
  }, [])

  return {
    onlineIds,
    isLoading,
    error,
    isOnline: useCallback((checkUserId: string) => presenceManager.isOnline(checkUserId), []),
  }
}
