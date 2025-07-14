"use client"

import React from "react"
import { Sun, Moon, MessageCircle } from "lucide-react"

interface HeaderProps {
  isDarkMode: boolean
  onToggleTheme: () => void
  onOpenChat: () => void
}

const Header = React.memo(({ isDarkMode, onToggleTheme, onOpenChat }: HeaderProps) => {
  return (
    <header className="relative z-10 flex justify-between items-center p-6 md:p-8 pt-8">
      <div className="w-16 md:w-24"></div> {/* 왼쪽 공간 확보 */}
      <h1
        className={`text-3xl md:text-4xl lg:text-5xl font-bold transition-colors duration-500 ${
          isDarkMode ? "text-white" : "text-gray-800"
        } tracking-tight`}
      >
        친구찾기
      </h1>
      <div className="flex items-center gap-3 md:gap-4">
        <button
          onClick={onOpenChat}
          className={`p-3 md:p-4 rounded-2xl transition-all duration-300 hover:scale-110 active:scale-95 relative ${
            isDarkMode
              ? "bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20"
              : "bg-white/80 hover:bg-white/90 backdrop-blur-md border border-white/50"
          } shadow-lg`}
        >
          <MessageCircle size={20} className={isDarkMode ? "text-blue-300" : "text-blue-600"} />
          {/* 읽지 않은 메시지 알림 */}
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
            3
          </div>
        </button>

        <button
          onClick={onToggleTheme}
          className={`p-3 md:p-4 rounded-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${
            isDarkMode
              ? "bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20"
              : "bg-white/80 hover:bg-white/90 backdrop-blur-md border border-white/50"
          } shadow-lg`}
        >
          {isDarkMode ? <Sun size={20} className="text-yellow-300" /> : <Moon size={20} className="text-indigo-600" />}
        </button>
      </div>
    </header>
  )
})

Header.displayName = "Header"

export default Header
