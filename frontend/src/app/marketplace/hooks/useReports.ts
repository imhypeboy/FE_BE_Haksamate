"use client"

import { useState, useCallback } from "react"
import type { CreateReportRequest } from "../types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export const useReports = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createReport = useCallback(async (data: CreateReportRequest) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("신고 접수에 실패했습니다.")
      }

      const report = await response.json()
      return report
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "신고 접수에 실패했습니다."
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    isLoading,
    error,
    createReport,
  }
}
