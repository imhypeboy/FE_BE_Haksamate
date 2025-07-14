import React from 'react'
import { motion } from 'framer-motion'

export function SubjectCardSkeleton() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="backdrop-blur-xl bg-white/40 rounded-2xl p-6 shadow-xl border border-white/30"
    >
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200/60 rounded-xl mb-3"></div>
        <div className="flex gap-2 mb-4">
          <div className="h-5 w-16 bg-gray-200/60 rounded-full"></div>
          <div className="h-5 w-12 bg-gray-200/60 rounded-full"></div>
        </div>
        <div className="h-10 bg-gray-200/60 rounded-xl mb-4"></div>
        <div className="flex gap-2">
          <div className="flex-1 h-8 bg-gray-200/60 rounded-xl"></div>
          <div className="flex-1 h-8 bg-gray-200/60 rounded-xl"></div>
        </div>
      </div>
    </motion.div>
  )
}

export function TimetableSkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="p-3 text-center">
        <div className="h-8 bg-gray-200/60 rounded-xl mx-auto w-12"></div>
      </td>
      {Array.from({ length: 7 }).map((_, i) => (
        <td key={i} className="p-2">
          {Math.random() > 0.6 && (
            <div className="h-8 bg-gray-200/60 rounded-xl"></div>
          )}
        </td>
      ))}
    </tr>
  )
} 