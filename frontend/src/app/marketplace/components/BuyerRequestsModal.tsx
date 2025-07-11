"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { X, User, Clock, Check, AlertCircle } from "lucide-react"

interface BuyerRequest {
  transactionId: string
  buyerId: string
  buyerName: string
  status: string
}

interface BuyerRequestsModalProps {
  isOpen: boolean
  onClose: () => void
  itemId: number
  sellerId: string
  onGetBuyerRequests: (itemId: number, sellerId: string) => Promise<BuyerRequest[]>
  onConfirmBuyer: (transactionId: string) => Promise<void>
  isDarkMode: boolean
}

const BuyerRequestsModal: React.FC<BuyerRequestsModalProps> = ({
  isOpen,
  onClose,
  itemId,
  sellerId,
  onGetBuyerRequests,
  onConfirmBuyer,
  isDarkMode,
}) => {
  const [requests, setRequests] = useState<BuyerRequest[]>([])
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadBuyerRequests()
    }
  }, [isOpen])

  const loadBuyerRequests = async () => {
    setLoading(true)
    try {
      const data = await onGetBuyerRequests(itemId, sellerId)
      setRequests(data)
    } catch (error) {
      console.error("구매 요청 조회 실패:", error)
      alert("구매 요청을 불러오는데 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  const handleConfirmBuyer = async (transactionId: string, buyerName: string) => {
    if (!window.confirm(`${buyerName}님과의 거래를 확정하시겠습니까?`)) {
      return
    }

    setConfirming(transactionId)
    try {
      await onConfirmBuyer(transactionId)
      alert("거래가 확정되었습니다!")
      await loadBuyerRequests() // 목록 새로고침
    } catch (error) {
      console.error("거래 확정 실패:", error)
      alert("거래 확정에 실패했습니다.")
    } finally {
      setConfirming(null)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      case "IN_PROGRESS":
        return "text-blue-600 bg-blue-50 border-blue-200"
      case "COMPLETED":
        return "text-green-600 bg-green-50 border-green-200"
      case "CANCELLED":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "PENDING":
        return "구매 요청"
      case "IN_PROGRESS":
        return "거래중"
      case "COMPLETED":
        return "거래 완료"
      case "CANCELLED":
        return "취소됨"
      default:
        return status
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className={`w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-2xl ${
          isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
        }`}
      >
        {/* 헤더 */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-inherit">
          <h2 className="text-xl font-bold">구매 요청 관리</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* 내용 */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="text-gray-500">구매 요청을 불러오는 중...</p>
              </div>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">아직 구매 요청이 없습니다.</p>
              <p className="text-gray-400 text-sm mt-2">구매자가 요청을 보내면 여기에 표시됩니다.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">총 {requests.length}개의 구매 요청</h3>
                <button
                  onClick={loadBuyerRequests}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    isDarkMode
                      ? "bg-gray-700 hover:bg-gray-600 text-white"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  새로고침
                </button>
              </div>

              {requests.map((request) => (
                <div
                  key={request.transactionId}
                  className={`p-4 rounded-xl border transition-colors ${
                    isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${isDarkMode ? "bg-gray-600" : "bg-white"}`}>
                        <User size={20} className="text-gray-500" />
                      </div>
                      <div>
                        <h4 className="font-medium">{request.buyerName}</h4>
                        <p className="text-sm text-gray-500">구매자 ID: {request.buyerId}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(
                          request.status,
                        )}`}
                      >
                        {getStatusText(request.status)}
                      </span>

                      {request.status === "PENDING" && (
                        <button
                          onClick={() => handleConfirmBuyer(request.transactionId, request.buyerName)}
                          disabled={confirming === request.transactionId}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white text-sm rounded-lg font-medium transition-colors"
                        >
                          {confirming === request.transactionId ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              처리중...
                            </>
                          ) : (
                            <>
                              <Check size={16} />
                              거래 확정
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {request.status === "IN_PROGRESS" && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
                        <Clock size={16} />
                        <span className="text-sm font-medium">{request.buyerName}님과 거래가 진행중입니다</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BuyerRequestsModal
