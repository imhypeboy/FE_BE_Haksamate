"use client"

import { useState, useCallback } from "react"
import type { SearchHistory, SearchSuggestion } from "../types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export const useSearchHistory = () => {
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([])
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addSearchHistory = useCallback(async (userId: string, keyword: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/search-history`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId, keyword }),
      })

      if (!response.ok) {
        throw new Error("검색 기록 저장에 실패했습니다.")
      }

      const history = await response.json()
      setSearchHistory((prev) => [history, ...prev.filter((h) => h.keyword !== keyword)])
      return history
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "검색 기록 저장에 실패했습니다."
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getSearchHistory = useCallback(async (userId: string) => {
    // 입력값 검증
    if (!userId || typeof userId !== "string" || !userId.trim()) {
      setSearchHistory([])
      return []
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/search-history?userId=${userId}`)

      if (!response.ok) {
        if (response.status === 404) {
          // 검색 기록이 없는 경우
          setSearchHistory([])
          return []
        }
        throw new Error("검색 기록 조회에 실패했습니다.")
      }

      const history = await response.json()
      const validHistory = Array.isArray(history) ? history : []
      setSearchHistory(validHistory)
      return validHistory
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "검색 기록 조회에 실패했습니다."
      setError(errorMessage)
      console.error("Get search history error:", err)
      setSearchHistory([])
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const deleteSearchHistory = useCallback(async (historyId: string) => {
    if (!historyId || typeof historyId !== "string" || !historyId.trim()) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/search-history/${encodeURIComponent(historyId.trim())}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("검색 기록 삭제에 실패했습니다.")
      }

      setSearchHistory((prev) => prev.filter((h) => h.id !== historyId))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "검색 기록 삭제에 실패했습니다."
      setError(errorMessage)
      console.error("Delete search history error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])




  const getSuggestions = useCallback(async (userId: string, keyword: string) => {
    // 입력값 검증
    if (!userId || !keyword || typeof keyword !== "string" || !keyword.trim()) {
      setSuggestions([])
      return []
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/search-history/suggest?userId=${encodeURIComponent(userId.trim())}&keyword=${encodeURIComponent(keyword.trim())}`,
      )

      if (!response.ok) {
        if (response.status === 404) {
          // 제안이 없는 경우
          setSuggestions([])
          return []
        }
        throw new Error("검색 제안 조회에 실패했습니다.")
      }

      const suggestions = await response.json()
      const validSuggestions = Array.isArray(suggestions) ? suggestions : []
      setSuggestions(validSuggestions)
      return validSuggestions
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "검색 제안 조회에 실패했습니다."
      setError(errorMessage)
      console.error("Get suggestions error:", err)
      setSuggestions([])
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearSearchHistory = useCallback(async (userId: string) => {
    if (!userId || typeof userId !== "string" || !userId.trim()) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/search-history/clear/${encodeURIComponent(userId.trim())}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("검색 기록 전체 삭제에 실패했습니다.")
      }

      setSearchHistory([])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "검색 기록 전체 삭제에 실패했습니다."
      setError(errorMessage)
      console.error("Clear search history error:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])
  return {
    searchHistory,
    suggestions,
    isLoading,
    error,
    clearSearchHistory,
    getSuggestions,
    addSearchHistory,
    getSearchHistory,
    deleteSearchHistory,
  }
}





