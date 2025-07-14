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
  index: number
  onEdit: (subject: any) => void
  onDelete: (id?: number) => void
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
}

export default function SubjectCard({ subject, index, onEdit, onDelete }: SubjectCardProps) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={{ y: -4, scale: 1.02 }}
      className="group bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-md border border-white/50 transition-all cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate text-base">{subject.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
              {subject.dayofweek}
            </span>
            {subject.required && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.2 }}
                className="text-xs px-2 py-1 bg-red-50 text-red-700 rounded-full font-medium"
              >
                필수
              </motion.span>
            )}
          </div>
        </div>
      </div>
      <div className="text-sm text-gray-600 mb-3">
        <div className="flex items-center gap-1">
          <span className="font-medium">{subject.starttime}</span>
          <span>~</span>
          <span className="font-medium">{subject.endtime}</span>
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: index * 0.1 + 0.8, duration: 0.3 }}
        className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onEdit(subject)}
          className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg transition-colors text-sm font-medium"
        >
          <Edit2 className="h-3 w-3" />
          수정
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onDelete(subject.id)}
          className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg transition-colors text-sm font-medium"
        >
          <Trash2 className="h-3 w-3" />
          삭제
        </motion.button>
      </motion.div>
    </motion.div>
  )
} 