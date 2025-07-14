"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, Star, User } from "lucide-react"
import type { Review } from "../types"

interface ReviewListModalProps {
  isOpen: boolean
  onClose: () => void
  itemId: number
  sellerName: string
  sellerId: string
  onGetReviews: (sellerId: string) => Promise<Review[]>
  onGetReviewSummary: (sellerId: string) => Promise<{ averageRating: number; totalReviews: number }>
  isDarkMode: boolean
}

const ReviewListModal: React.FC<ReviewListModalProps> = ({
  isOpen,
  onClose,
  itemId,
  sellerName,
  sellerId,
  onGetReviews,
  onGetReviewSummary,
  isDarkMode,
}) => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [summary, setSummary] = useState({ averageRating: 0, totalReviews: 0 })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isOpen && itemId) {
      loadReviews()
    }
  }, [isOpen, itemId])

  const loadReviews = async () => {
    setIsLoading(true)
    try {
      const [reviewsData, summaryData] = await Promise.all([onGetReviews(sellerId), onGetReviewSummary(sellerId)])
      setReviews(reviewsData)
      setSummary(summaryData)
    } catch (error) {
      console.error("리뷰 로딩 실패:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR")
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={`star-${star}`}
            size={16}
            className={`${star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-300 dark:text-gray-600"}`}
          />
        ))}
      </div>
    )
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className={`w-full max-w-2xl mx-4 max-h-[80vh] rounded-2xl overflow-hidden ${
          isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        }`}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <Star size={20} className="text-yellow-500" />
            <h2 className="text-xl font-bold">리뷰 목록</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(80vh-140px)]">
          {/* 리뷰 요약 */}
          <div className={`p-6 border-b ${isDarkMode ? "border-gray-700 bg-gray-750" : "border-gray-200 bg-gray-50"}`}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{sellerName}님의 리뷰</h3>
                <div className="flex items-center gap-2 mt-1">
                  {renderStars(Math.round(summary.averageRating))}
                  <span className="font-medium text-yellow-500">{summary.averageRating.toFixed(1)}</span>
                  <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    ({summary.totalReviews}개 리뷰)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 리뷰 목록 */}
          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-8 h-8 border-2 border-current border-t-transparent rounded-full" />
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-8">
                <Star size={48} className={`mx-auto mb-4 ${isDarkMode ? "text-gray-600" : "text-gray-400"}`} />
                <p className={`text-lg font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                  아직 리뷰가 없습니다
                </p>
                <p className={`text-sm mt-2 ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                  첫 번째 리뷰를 작성해보세요!
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div
                    key={`review-${review.id}`}
                    className={`p-4 rounded-xl border ${
                      isDarkMode ? "border-gray-700 bg-gray-750" : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          isDarkMode ? "bg-gray-600" : "bg-gray-300"
                        }`}
                      >
                        <User size={20} className={isDarkMode ? "text-gray-300" : "text-gray-600"} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{review.reviewerName || review.buyerName}</span>
                            {renderStars(review.rating)}
                          </div>
                          <span className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                        <p className={`${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewListModal
