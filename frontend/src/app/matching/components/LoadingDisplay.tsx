"use client"

import React from "react"
import { MapPin } from "lucide-react"

interface LoadingDisplayProps {
  isDarkMode: boolean
}

export const LoadingDisplay = React.memo(({ isDarkMode }: LoadingDisplayProps) => {
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
              isDarkMode ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-600"
            } animate-pulse`}
          >
            <MapPin size={24} className="animate-bounce" />
          </div>
          <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-800"}`}>위치 확인 중...</h3>
          <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>잠시만 기다려주세요</p>
        </div>
      </div>
    </div>
  )
})

LoadingDisplay.displayName = "LoadingDisplay"
