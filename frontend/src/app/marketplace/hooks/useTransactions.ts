"use client"

import { useState, useCallback } from "react"
import type { Transaction, CreateTransactionRequest, Product } from "../types"
import type { ChatRoom } from "@/app/matching/types"
import {useChat,useChatRooms}from "@/hooks/useChat"
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

  const getTransactions = useCallback(async (itemId: number, sellerId: string) => {
    setIsLoading(true)
    setError(null)
  
    try {
      const response = await fetch(`${API_BASE_URL}/api/transactions/${itemId}/requests?sellerId=${sellerId}`)
  
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

  const confirmTransaction = async (
    transactionId: number,
    product: Product,
    buyerId: string,
  ) => {
    const res = await fetch(`${API_BASE_URL}/api/transactions/${transactionId}/confirm`, {
      method: "POST",
    })
    if (!res.ok) throw new Error("거래 확정 실패")
  
    const statusRes = await fetch(`${API_BASE_URL}/api/items/${product.itemid}/reserve`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ buyerId }),
    })
    if (!statusRes.ok) throw new Error("아이템 상태 변경 실패")
  
  }

  const rejectTransaction = async (transactionId: number) => {
    const res = await fetch(`${API_BASE_URL}/api/transactions/${transactionId}/reject`, { method: "POST" })
    if (!res.ok) throw new Error("거래 거절 실패")
  }


  return {
    transactions,
    isLoading,
    error,
    createTransaction,
    getTransactions,
    confirmTransaction,
    rejectTransaction,
  }
}
