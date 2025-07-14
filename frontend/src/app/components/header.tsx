"use client"

import { motion } from "framer-motion"
import { UserIcon, Calendar, GraduationCap, TimerIcon } from "lucide-react"

interface HeaderProps {
  onProfileClick: () => void
  onTimerClick: () => void
}

export function Header({ onProfileClick, onTimerClick }: HeaderProps) {

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2, duration: 0.6 }}
      className="sticky top-0 z-40 backdrop-blur-xl bg-white/30 border-b border-white/20 shadow-lg"
    >
      <div className="relative flex items-center justify-center px-3 sm:px-6 lg:px-8 py-3 sm:py-4 lg:py-6">
        {/* 왼쪽 아이콘 + 중앙 제목 */}
        <div className="flex items-center gap-2 sm:gap-4">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <motion.div
              whileHover={{ rotate: 360, scale: 1.1 }}
              transition={{ duration: 0.6 }}
              className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg"
            >
              <GraduationCap className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </motion.div>
          </motion.div>

          <div className="flex flex-col items-center text-center">
            <span className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-600 bg-clip-text text-transparent">
              HaksaMate
            </span>
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 mt-1">
              <Calendar className="h-3 w-3" />
              <span>스마트 시간표 관리</span>
            </div>
          </div>
        </div>

        {/* 오른쪽 버튼들 */}
        <div className="absolute right-3 sm:right-6 lg:right-8 flex items-center gap-3">
          {/* 타이머 버튼 */}
          <motion.button
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            onClick={onTimerClick}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl flex items-center justify-center hover:shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-emerald-400/50"
            aria-label="타이머"
          >
            <TimerIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </motion.button>

          {/* 프로필 버튼 */}
          <motion.button
            whileHover={{ scale: 1.05, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            onClick={onProfileClick}
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-xl flex items-center justify-center hover:shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-400/50"
            aria-label="프로필"
          >
            <UserIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </motion.button>
        </div>
      </div>
    </motion.header>
  )
}