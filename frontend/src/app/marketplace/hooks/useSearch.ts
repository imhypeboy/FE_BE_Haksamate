"use client"

import { useState, useEffect, useCallback } from "react"
import { useAuth } from "@/hooks/useAuth"

export function useSearch() {
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth()

  // 검색 기록 조회
  const fetchSearchHistory = useCallback(async () => {
    if (!user?.id) return

    try {
      setIsLoading(true)
      const response = await fetch(`http://localhost:8080/api/search-history/${user.id}`,{
        method:'POST'
      })
      if (response.ok) {
        const history = await response.json()
        setSearchHistory(history)
      }
    } catch (error) {
      console.error("검색 기록 조회 실패:", error)
    } finally {
      setIsLoading(false)
    }
  }, [user?.id])

  // 검색 키워드 저장
  const saveSearchKeyword = useCallback(
    async (keyword: string) => {
      if (!user?.id || !keyword.trim()) return

      try {
        await fetch("http://localhost:8080/api/search-history", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            keyword: keyword.trim(),
          }),
        })

        // 로컬 상태 업데이트
        setSearchHistory((prev) => {
          const filtered = prev.filter((item) => item !== keyword.trim())
          return [keyword.trim(), ...filtered].slice(0, 10) // 최대 10개 유지
        })
      } catch (error) {
        console.error("검색 키워드 저장 실패:", error)
      }
    },
    [user?.id],
  )

  // 검색 키워드 삭제
  const deleteSearchKeyword = useCallback(
    async (keyword: string) => {
      if (!user?.id) return

      try {
        await fetch(
          `http://localhost:8080/api/search-history/${user.id}/keyword?keyword=${encodeURIComponent(keyword)}`,
          {
            method: "DELETE",
          },
        )

        setSearchHistory((prev) => prev.filter((item) => item !== keyword))
      } catch (error) {
        console.error("검색 키워드 삭제 실패:", error)
      }
    },
    [user?.id],
  )

  // 검색 기록 전체 삭제
  const clearSearchHistory = useCallback(async () => {
    if (!user?.id) return

    try {
      await fetch(`http://localhost:8080/api/search-history/${user.id}`, {
        method: "DELETE",
      })

      setSearchHistory([])
    } catch (error) {
      console.error("검색 기록 삭제 실패:", error)
    }
  }, [user?.id])

  // 초기 로드
  useEffect(() => {
    fetchSearchHistory()
  }, [fetchSearchHistory])

  return {
    searchHistory,
    isLoading,
    saveSearchKeyword,
    deleteSearchKeyword,
    clearSearchHistory,
    fetchSearchHistory,
  }
}
