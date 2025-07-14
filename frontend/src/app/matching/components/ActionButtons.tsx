"use client"

import React from "react"
import { Heart, X, Star, BookOpen } from "lucide-react"

interface ActionButtonsProps {
  isDarkMode: boolean
  isDragging: boolean
  onLike: () => void
  onDislike: () => void
}

const ActionButtons = React.memo(({ isDarkMode, isDragging, onLike, onDislike }: ActionButtonsProps) => {
  return (
    <div className="flex justify-center gap-6 lg:gap-12 mt-8">
      <button
        onClick={onDislike}
        disabled={isDragging}
        className={`group relative w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] disabled:opacity-50 overflow-hidden ${
          isDarkMode
            ? "bg-gray-800/60 hover:bg-red-500/20 backdrop-blur-xl border border-gray-700/40 shadow-lg shadow-red-500/10"
            : "bg-white/90 hover:bg-red-50 backdrop-blur-xl border border-gray-200/60 shadow-lg shadow-red-500/10"
        } hover:shadow-2xl hover:scale-110 active:scale-95`}
      >
        {/* Material Design 3 Ripple Effect */}
        <div className="absolute inset-0 rounded-full bg-red-500/10 scale-0 group-hover:scale-100 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]" />

        <X
          size={26}
          className={`lg:scale-125 relative z-10 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            isDarkMode
              ? "text-red-400 group-hover:text-red-300 group-hover:scale-110 group-hover:rotate-90"
              : "text-red-500 group-hover:text-red-600 group-hover:scale-110 group-hover:rotate-90"
          }`}
        />

        {/* Floating Animation Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-red-400/20 scale-0 group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]" />
      </button>

      {/* PC 전용 추가 버튼 */}
      <div className="hidden lg:flex items-center gap-4">
        <button
          className={`group relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            isDarkMode
              ? "bg-gray-800/40 hover:bg-yellow-500/20 backdrop-blur-xl border border-gray-700/40"
              : "bg-white/80 hover:bg-yellow-50 backdrop-blur-xl border border-gray-200/60"
          } shadow-lg hover:shadow-xl hover:scale-110`}
          title="다시 보기"
        >
          <div className="absolute inset-0 rounded-full bg-yellow-500/10 scale-0 group-hover:scale-100 transition-transform duration-500" />
          <Star
            size={20}
            className={`relative z-10 transition-colors ${isDarkMode ? "text-yellow-400" : "text-yellow-600"}`}
          />
        </button>

        <button
          className={`group relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            isDarkMode
              ? "bg-gray-800/40 hover:bg-blue-500/20 backdrop-blur-xl border border-gray-700/40"
              : "bg-white/80 hover:bg-blue-50 backdrop-blur-xl border border-gray-200/60"
          } shadow-lg hover:shadow-xl hover:scale-110`}
          title="더 많은 정보"
        >
          <div className="absolute inset-0 rounded-full bg-blue-500/10 scale-0 group-hover:scale-100 transition-transform duration-500" />
          <BookOpen
            size={20}
            className={`relative z-10 transition-colors ${isDarkMode ? "text-blue-400" : "text-blue-600"}`}
          />
        </button>
      </div>

      <button
        onClick={onLike}
        disabled={isDragging}
        className={`group relative w-16 h-16 lg:w-20 lg:h-20 rounded-full flex items-center justify-center transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] disabled:opacity-50 overflow-hidden ${
          isDarkMode
            ? "bg-gray-800/60 hover:bg-pink-500/20 backdrop-blur-xl border border-gray-700/40 shadow-lg shadow-pink-500/10"
            : "bg-white/90 hover:bg-pink-50 backdrop-blur-xl border border-gray-200/60 shadow-lg shadow-pink-500/10"
        } hover:shadow-2xl hover:scale-110 active:scale-95`}
      >
        {/* Material Design 3 Ripple Effect */}
        <div className="absolute inset-0 rounded-full bg-pink-500/10 scale-0 group-hover:scale-100 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]" />

        <Heart
          size={26}
          className={`lg:scale-125 relative z-10 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
            isDarkMode
              ? "text-pink-400 group-hover:text-pink-300 group-hover:scale-110 group-hover:fill-current"
              : "text-pink-500 group-hover:text-pink-600 group-hover:scale-110 group-hover:fill-current"
          }`}
        />

        {/* Floating Animation Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-pink-400/20 scale-0 group-hover:scale-110 transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)]" />

        {/* Heart Beat Animation */}
        <div className="absolute inset-0 rounded-full bg-pink-400/5 animate-ping opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </button>
    </div>
  )
})

ActionButtons.displayName = "ActionButtons"

export default ActionButtons
