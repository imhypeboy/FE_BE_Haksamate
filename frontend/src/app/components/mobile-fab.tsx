"use client"

import { motion } from "framer-motion"
import { Plus } from "lucide-react"

interface MobileFABProps {
  isLoading: boolean
  onAddClick: () => void
}

export function MobileFAB({ isLoading, onAddClick }: MobileFABProps) {
  return (
    <motion.button
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ delay: 1.2, type: "spring", stiffness: 200, damping: 15 }}
      whileHover={{
        scale: 1.1,
        rotate: 90,
        boxShadow: "0 20px 40px rgba(59, 130, 246, 0.4)",
      }}
      whileTap={{ scale: 0.9 }}
      onClick={onAddClick}
      className="fixed bottom-6 right-4 sm:bottom-8 sm:right-8 w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white rounded-2xl shadow-2xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300/50 z-50 backdrop-blur-sm border border-white/20 xl:hidden"
      disabled={isLoading}
      aria-label="과목 추가"
    >
      <Plus className="h-6 w-6 sm:h-8 sm:w-8 mx-auto" />
    </motion.button>
  )
}
