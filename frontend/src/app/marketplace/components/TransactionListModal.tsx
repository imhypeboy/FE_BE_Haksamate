"use client"
import type React from "react"
import { X } from "lucide-react"

interface Transaction {
  transactionId: number
  buyerId: string
  buyerName: string
  status: string
}

interface TransactionListModalProps {
  isOpen: boolean
  onClose: () => void
  transactions: Transaction[]
  onConfirm: (transactionId: number,buyerId:string) => void
  onReject: (transactionId: number) => void
  isDarkMode: boolean
}

const TransactionListModal: React.FC<TransactionListModalProps> = ({
  isOpen,
  onClose,
  transactions,
  onConfirm,
  onReject,
  isDarkMode,
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div
        className={`w-full max-w-lg rounded-xl p-6 ${isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"}`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">거래 요청 목록</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {transactions.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">요청된 거래가 없습니다.</p>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {transactions.map((tx) => (
              <div
                key={tx.transactionId}
                className={`border rounded-lg p-4 ${
                  isDarkMode ? "border-gray-600 bg-gray-700" : "border-gray-200 bg-gray-50"
                }`}
              >
                <div className="flex justify-between items-center mb-3">
                  <div>
                    <span className="font-medium text-lg">{tx.buyerName}</span>
                    <p className="text-sm text-gray-500">구매자 ID: {tx.buyerId}</p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      tx.status === "대기중"
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                        : tx.status === "확정됨"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                    }`}
                  >
                    {tx.status}
                  </span>
                </div>

                {tx.status === "대기중" && (
                  <div className="flex gap-2">
                    <button
                      className="flex-1 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors"
                      onClick={() => onConfirm(tx.transactionId,tx.buyerId)}
                    >
                      확정
                    </button>
                    <button
                      className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
                      onClick={() => onReject(tx.transactionId)}
                    >
                      거절
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default TransactionListModal
