"use client"

import { useState, useCallback } from "react"
import type { Transaction, CreateTransactionRequest } from "../types"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createTransaction = useCallback(async (data: CreateTransactionRequest) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("거래 생성에 실패했습니다")
      }

      const transaction = await response.json()
      setTransactions((prev) => [...prev, transaction])
      return transaction
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "거래 생성에 실패했습니다"
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getTransactions = useCallback(async (userId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/transactions/user/${userId}`)

      if (!response.ok) {
        throw new Error("거래 목록 조회에 실패했습니다")
      }

      const data = await response.json()
      setTransactions(data)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "거래 목록 조회에 실패했습니다"
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getTransactionByItemAndBuyer = useCallback(async (itemId: number, buyerId: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/transactions/item/${itemId}/buyer/${buyerId}`)

      if (!response.ok) {
        if (response.status === 404) {
          return null // 거래가 없는 경우
        }
        throw new Error("거래 조회에 실패했습니다")
      }

      const transaction = await response.json()
      return transaction
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "거래 조회에 실패했습니다"
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateTransactionStatus = useCallback(async (transactionId: number, status: string) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`${API_BASE_URL}/api/transactions/${transactionId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      })

      if (!response.ok) {
        throw new Error("거래 상태 업데이트에 실패했습니다")
      }

      const updatedTransaction = await response.json()
      setTransactions((prev) =>
        prev.map((transaction) => (transaction.transactionid === transactionId ? updatedTransaction : transaction)),
      )
      return updatedTransaction
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "거래 상태 업데이트에 실패했습니다"
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    transactions,
    isLoading,
    error,
    createTransaction,
    getTransactions,
    getTransactionByItemAndBuyer,
    updateTransactionStatus,
  }
}
