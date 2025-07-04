"use client"

import type React from "react"
import { useState } from "react"
import { X, Star } from "lucide-react"
import type { CreateReviewRequest } from "../types"

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  itemId: string
  sellerId: string
  sellerName: string
  onSubmit: (reviewData: CreateReviewRequest) => Promise<void>
  isDarkMode: boolean
}

const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  itemId,
  sellerId,
  sellerName,
  onSubmit,
  isDarkMode,
}) => {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      alert("별점을 선택해주세요.")
      return
    }

    if (!comment.trim()) {
      alert("리뷰 내용을 입력해주세요.")
      return
    }

    setIsLoading(true)

    try {
      await onSubmit({
        itemId,
        sellerId,
        rating,
        comment: comment.trim(),
      })

      alert("리뷰가 작성되었습니다!")
      onClose()
      setRating(0)
      setComment("")
    } catch (error) {
      alert(error instanceof Error ? error.message : "리뷰 작성에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className={`w-full max-w-md mx-4 rounded-2xl overflow-hidden ${
          isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Star size={20} className="text-yellow-500" />
            <h2 className="text-xl font-bold">리뷰 작성</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* 판매자 정보 */}
            <div className={`p-4 rounded-xl ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
              <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>판매자</p>
              <p className="font-medium">{sellerName}</p>
            </div>

            {/* 별점 선택 */}
            <div>
              <label className="block text-sm font-medium mb-3">별점</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={`star-${star}`}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 rounded transition-colors hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Star
                      size={32}
                      className={`${
                        star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"
                      } transition-colors`}
                    />
                  </button>
                ))}
              </div>
              <p className={`text-sm mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                {rating > 0 && (
                  <>
                    {rating === 1 && "매우 불만족"}
                    {rating === 2 && "불만족"}
                    {rating === 3 && "보통"}
                    {rating === 4 && "만족"}
                    {rating === 5 && "매우 만족"}
                  </>
                )}
              </p>
            </div>

            {/* 리뷰 내용 */}
            <div>
              <label className="block text-sm font-medium mb-2">리뷰 내용</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="거래 경험을 자세히 알려주세요"
                rows={4}
                className={`w-full px-4 py-3 rounded-xl border transition-colors resize-none ${
                  isDarkMode
                    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                    : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
                }`}
                required
              />
              <p className={`text-xs mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>{comment.length}/500자</p>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 rounded-xl font-medium transition-colors ${
                isDarkMode ? "bg-gray-700 hover:bg-gray-600 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
              }`}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading || rating === 0}
              className="flex-1 py-3 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white rounded-xl font-medium transition-colors"
            >
              {isLoading ? "작성 중..." : "리뷰 작성"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReviewModal
