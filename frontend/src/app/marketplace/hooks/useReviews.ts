"use client"

import { useState, useCallback } from "react"
import type { Review, CreateReviewRequest } from "../types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export const useReviews = () => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createReview = useCallback(async (data: CreateReviewRequest) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("리뷰 작성에 실패했습니다.")
      }

      const review = await response.json()
      setReviews((prev) => [...prev, review])
      return review
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "리뷰 작성에 실패했습니다."
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getReviews = useCallback(async (sellerId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews/seller/${sellerId}`)

      if (!response.ok) {
        throw new Error("리뷰 목록 조회에 실패했습니다.")
      }

      const reviews = await response.json()
      setReviews(reviews)
      return reviews
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "리뷰 목록 조회에 실패했습니다."
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getReviewSummary = useCallback(async (sellerId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/reviews/seller/${sellerId}/summary`)

      if (!response.ok) {
        throw new Error("리뷰 요약 조회에 실패했습니다.")
      }

      const summary = await response.json()
      return summary
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "리뷰 요약 조회에 실패했습니다."
      setError(errorMessage)
      return { averageRating: 0, totalReviews: 0 }
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    reviews,
    isLoading,
    error,
    createReview,
    getReviews,
    getReviewSummary,
  }
}
