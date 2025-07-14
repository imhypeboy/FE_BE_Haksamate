import { motion } from "framer-motion"
import { Edit2, Trash2 } from "lucide-react"
import React from "react"

export interface SubjectCardProps {
  subject: {
    id?: number
    name: string
    dayofweek: string
    starttime: string
    endtime: string
    required: boolean
  }
  onEdit: (subject: any) => void
  onDelete: (id?: number) => void
  dayLabel: string
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      type: "spring",
      stiffness: 300,
      damping: 25 
    } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.8, 
    y: -10,
    transition: { duration: 0.2 } 
  },
}

export function SubjectCard({ subject, onEdit, onDelete, dayLabel }: SubjectCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={{ 
        y: -4, 
        scale: 1.02,
        transition: { type: "spring", stiffness: 400, damping: 10 }
      }}
      className="group backdrop-blur-xl bg-white/60 hover:bg-white/80 rounded-2xl p-4 sm:p-5 lg:p-6 shadow-xl border border-white/30 hover:border-white/50 transition-all duration-300 cursor-pointer w-full min-w-0"
    >
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="flex-1 min-w-0 pr-2">
          <h3 className="font-bold text-gray-900 truncate text-base sm:text-lg mb-2">{subject.name}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs px-2 sm:px-3 py-1 bg-blue-100/80 text-blue-700 rounded-full font-bold whitespace-nowrap">
              {dayLabel}요일
            </span>
            {subject.required && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className="text-xs px-2 sm:px-3 py-1 bg-red-100/80 text-red-700 rounded-full font-bold flex items-center gap-1 whitespace-nowrap"
              >
                ⭐ 필수
              </motion.span>
            )}
          </div>
        </div>
      </div>
      
      <div className="text-sm text-gray-600 mb-3 sm:mb-4 bg-gray-50/80 rounded-xl p-3">
        <div className="flex items-center justify-center gap-2 font-bold">
          <span className="text-blue-600">{subject.starttime}</span>
          <span className="text-gray-400">~</span>
          <span className="text-blue-600">{subject.endtime}</span>
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300"
      >
        <motion.button
          whileHover={{ scale: 1.05, y: -1 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation()
            onEdit(subject)
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 sm:py-2.5 px-3 sm:px-4 bg-blue-100/80 hover:bg-blue-200/80 text-blue-700 rounded-lg sm:rounded-xl transition-all text-xs sm:text-sm font-bold shadow-sm whitespace-nowrap min-w-0"
        >
          <Edit2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
          <span className="truncate">수정</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05, y: -1 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation()
            if (subject.id !== undefined) {
              onDelete(subject.id)
            }
          }}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 sm:py-2.5 px-3 sm:px-4 bg-red-100/80 hover:bg-red-200/80 text-red-700 rounded-lg sm:rounded-xl transition-all text-xs sm:text-sm font-bold shadow-sm whitespace-nowrap min-w-0"
        >
          <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 flex-shrink-0" />
          <span className="truncate">삭제</span>
        </motion.button>
      </motion.div>
    </motion.div>
  )
} 