"use client"

import type React from "react"
import { useState } from "react"
import { MdClose, MdWarning } from "react-icons/md"
import { REPORT_REASONS } from "../constants"
import type { CreateReportRequest } from "../types"

interface ReportModalProps {
  isOpen: boolean
  onClose: () => void
  itemId: number
  reportedUserId: string
  reporterUserId:string|null|undefined
  reportedUserName:string
  itemTitle: string
  onSubmit: (reportData: CreateReportRequest) => Promise<void>
  isDarkMode: boolean
}

const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  itemId,
  reportedUserId,
  reporterUserId,
  reportedUserName,
  itemTitle,
  onSubmit,
  isDarkMode,
}) => {
  const [formData, setFormData] = useState({
    reason: "",
    description: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.reason || !formData.description.trim()) {
      alert("신고 사유와 상세 내용을 모두 입력해주세요.")
      return
    }

    try {
      
      setIsLoading(true)
      await onSubmit({
        reporterId: reporterUserId,
        reportedId: reportedUserId,
        itemId:itemId,
        reason: formData.reason,
      })

      // 폼 초기화
      setFormData({
        reason: "",
        description: "",
      })
      onClose()
      alert("신고가 접수되었습니다.")
    } catch (error) {
      console.error("신고 접수 실패:", error)
      alert("신고 접수에 실패했습니다.")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-md rounded-2xl shadow-xl ${isDarkMode ? "bg-gray-800" : "bg-white"}`}>
        {/* 헤더 */}
        <div
          className={`flex items-center justify-between p-6 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}
        >
          <div className="flex items-center space-x-3">
            <MdWarning className="text-red-500" size={24} />
            <h2 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>신고하기</h2>
          </div>
          <button
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${isDarkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-500"}`}
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* 신고 대상 정보 */}
        <div className={`p-4 border-b ${isDarkMode ? "border-gray-700 bg-gray-750" : "border-gray-200 bg-gray-50"}`}>
          <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
            <span className="font-medium">신고 대상:</span> {reportedUserName}
          </p>
          <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
            <span className="font-medium">상품:</span> {itemTitle}
          </p>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 신고 사유 */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              신고 사유 *
            </label>
            <select
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              required
              className={`w-full p-3 rounded-lg border transition-colors ${
                isDarkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white text-gray-900"
              }`}
            >
              <option value="">신고 사유를 선택해주세요</option>
              {REPORT_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>

          {/* 상세 내용 */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              상세 내용 *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className={`w-full p-3 rounded-lg border transition-colors resize-none ${
                isDarkMode
                  ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                  : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
              }`}
              placeholder="신고 사유에 대한 자세한 내용을 입력해주세요"
            />
          </div>

          {/* 안내 메시지 */}
          <div className={`p-4 rounded-lg ${isDarkMode ? "bg-gray-700" : "bg-gray-50"}`}>
            <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
              • 허위 신고 시 서비스 이용에 제한이 있을 수 있습니다.
              <br />• 신고 내용은 관리자 검토 후 처리됩니다.
              <br />• 개인정보는 신고 처리 목적으로만 사용됩니다.
            </p>
          </div>

          {/* 버튼 */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 py-3 rounded-lg border transition-colors ${
                isDarkMode
                  ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "신고 중..." : "신고하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReportModal
