"use client"

import React from "react"
import { X } from "lucide-react"

interface LocationDeniedDisplayProps {
  isDarkMode: boolean
  onRetry: () => void
}

export const LocationDeniedDisplay = React.memo(({ isDarkMode, onRetry }: LocationDeniedDisplayProps) => {
  return (
    <div className="relative w-full max-w-sm mx-auto">
      <div
        className={`rounded-3xl p-8 text-center transition-all duration-700 ease-out ${
          isDarkMode
            ? "bg-gray-800/60 backdrop-blur-xl border border-gray-700/40"
            : "bg-white/90 backdrop-blur-xl border border-gray-200/60"
        } shadow-2xl`}
      >
        <div className="mb-6">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              isDarkMode ? "bg-red-500/20 text-red-300" : "bg-red-100 text-red-600"
            }`}
          >
            <X size={24} />
          </div>
          <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
            위치 권한이 필요해요
          </h3>
          <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
            브라우저 설정에서 위치 권한을
            <br />
            허용해주세요
          </p>
        </div>

        <button
          onClick={onRetry}
          className={`w-full py-3 px-4 rounded-2xl font-medium transition-all duration-300 hover:scale-105 ${
            isDarkMode
              ? "bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-400/30"
              : "bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200"
          }`}
        >
          다시 시도
        </button>
      </div>
    </div>
  )
})

LocationDeniedDisplay.displayName = "LocationDeniedDisplay"
