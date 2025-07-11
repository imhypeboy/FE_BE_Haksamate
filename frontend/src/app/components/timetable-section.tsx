"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Calendar, Clock, Sparkles, X } from "lucide-react"
import { useState } from "react"
import { TimetableSkeletonRow } from "./loading-skeleton"
import type { Subject } from "@/hooks/useSubjects"

interface TimetableSlot {
  dayofweek: string
  starttime: string
  endtime: string
  subject: Subject
}

interface TimetableSectionProps {
  timetable: TimetableSlot[]
  subjects: Subject[]
  isGenerating: boolean
  days: Array<{ label: string; value: string; ko: string }>
  hours: number[]
  timetableMap: Map<string, Subject[]>
  getSubjectColor: (subjectName: string) => string
  onGenerate: () => void
}

export function TimetableSection({
  timetable,
  subjects,
  isGenerating,
  days,
  hours,
  timetableMap,
  getSubjectColor,
  onGenerate,
}: TimetableSectionProps) {
  const [selected, setSelected] = useState<Subject | null>(null)
  return (
    <motion.div
      initial={{ x: 50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.8 }}
      className="w-full"
    >
      <div className="backdrop-blur-xl bg-white/40 rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8 shadow-2xl border border-white/30 hover:bg-white/50 transition-all duration-500">
        <div className="flex items-center justify-between mb-6 sm:mb-8 flex-wrap gap-4">
          <motion.h2
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-3"
          >
            <motion.div
              whileHover={{ rotate: 180, scale: 1.1 }}
              transition={{ duration: 0.4 }}
              className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center"
            >
              <Calendar className="h-4 w-4 text-white" />
            </motion.div>
            <span className="whitespace-nowrap">주간 시간표</span>
          </motion.h2>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="text-sm text-gray-500 bg-gray-100/80 px-4 py-2 rounded-full font-medium whitespace-nowrap">
              {timetable.length}개 과목 배치됨
            </div>
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={onGenerate}
              disabled={subjects.length === 0 || isGenerating}
              className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-600 hover:via-green-600 hover:to-teal-600 disabled:from-gray-400 disabled:to-gray-500 text-white py-2 px-4 sm:py-3 sm:px-6 rounded-xl font-bold shadow-lg transition-all disabled:cursor-not-allowed flex items-center gap-2 text-sm sm:text-base backdrop-blur-sm whitespace-nowrap"
            >
              {isGenerating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                  <span className="hidden sm:inline">생성 중...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span className="hidden sm:inline">✨ 시간표 자동 생성</span>
                  <span className="sm:hidden">✨ 자동 생성</span>
                </>
              )}
            </motion.button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl">
          <div className="min-w-[350px] sm:min-w-[600px] lg:min-w-[700px]">
            <table className="w-full border-collapse rounded-2xl overflow-hidden shadow-lg backdrop-blur-sm bg-white/30">
              <thead>
                <tr>
                  <th className="w-16 sm:w-20 p-2 sm:p-4 text-center text-xs sm:text-sm font-bold text-gray-700 bg-gradient-to-r from-gray-50/80 to-gray-100/80 backdrop-blur-sm">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 mx-auto mb-1" />
                    <span className="hidden sm:block">시간</span>
                  </th>
                  {days.map((day) => (
                    <th
                      key={day.value}
                      className="p-2 sm:p-4 text-center text-xs sm:text-sm font-bold text-gray-700 bg-gradient-to-r from-gray-50/80 to-gray-100/80 backdrop-blur-sm"
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="hidden lg:block font-bold">{day.label}</span>
                        <span className="lg:hidden font-bold text-xs sm:text-sm">{day.ko}</span>
                        <span className="hidden sm:block text-xs text-gray-500 font-normal">{day.ko}요일</span>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isGenerating
                  ? Array.from({ length: 8 }).map((_, i) => <TimetableSkeletonRow key={i} />)
                  : hours.map((hour, hourIndex) => (
                      <motion.tr
                        key={hour}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: hourIndex * 0.05 + 0.9, duration: 0.4 }}
                        className="hover:bg-white/20 transition-all duration-300"
                      >
                        <td className="p-1 sm:p-3 text-center text-xs sm:text-sm font-bold text-gray-600 bg-gradient-to-r from-gray-50/50 to-gray-100/50 backdrop-blur-sm">
                          <div className="flex flex-col items-center">
                            <span className="text-sm sm:text-lg">{hour}</span>
                            <span className="text-[10px] sm:text-xs text-gray-400">:00</span>
                          </div>
                        </td>
                        {days.map((day) => {
                          const key = `${day.value}-${hour}`
                          const slotSubjects = timetableMap.get(key) || []
                          return (
                            <td
                              key={day.value}
                              className="p-1 sm:p-2 border-l border-white/30 relative min-h-[60px] sm:min-h-[80px]"
                            >
                              <AnimatePresence>
                                {slotSubjects.map((subject, i) => (
                                  <motion.div
                                    key={i}
                                    initial={{ opacity: 0, scale: 0.8, y: 10 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.8, y: -10 }}
                                    whileHover={{
                                      scale: 1.05,
                                      y: -2,
                                      transition: { type: "spring", stiffness: 400, damping: 10 },
                                    }}
                                    transition={{
                                      type: "spring",
                                      stiffness: 500,
                                      damping: 30,
                                      delay: i * 0.1,
                                    }}
                                    onClick={() => setSelected(subject)}
                                    className={`${getSubjectColor(subject.name)} text-white text-[10px] sm:text-xs font-bold px-1 sm:px-3 py-1 sm:py-2 rounded-lg sm:rounded-xl shadow-lg mb-1 last:mb-0 cursor-pointer border border-white/20`}
                                    title={`${subject.name} (${subject.starttime}~${subject.endtime})`}
                                  >
                                    <div className="truncate text-center leading-tight">{subject.name}</div>
                                    <div className="text-[8px] sm:text-[10px] text-white/80 text-center mt-0.5 sm:mt-1 leading-tight">
                                      {subject.starttime}~{subject.endtime}
                                    </div>
                                  </motion.div>
                                ))}
                              </AnimatePresence>
                            </td>
                          )
                        })}
                      </motion.tr>
                    ))}
              </tbody>
            </table>
          </div>
        </div>

        {timetable.length === 0 && !isGenerating && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="text-center py-16"
          >
            <motion.div
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, -5, 5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="text-6xl mb-4"
            >
              📋
            </motion.div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">시간표가 비어있어요</h3>
            <p className="text-gray-500">과목을 추가하고 자동 생성을 눌러보세요</p>
          </motion.div>
        )}
      </div>

      {/* subject info modal */}
      {selected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelected(null)}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", duration: 0.4 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative mb-6">
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-400/40 to-teal-500/40 blur-xl opacity-70 -z-10" />
              <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight text-center capitalize">
                {selected.name}
              </h3>
            </div>

            <div className="grid grid-cols-[auto_1fr] gap-y-3 gap-x-4 text-[15px] text-gray-800">
              <span className="font-semibold">요일</span>
              <span className="uppercase tracking-wide">{selected.dayofweek}</span>

              <span className="font-semibold">시간</span>
              <span>{selected.starttime} ~ {selected.endtime}</span>

              <span className="font-semibold">구분</span>
              <span>{selected.required ? "필수" : "선택"}</span>
              {/* 추가 필드: 강의실, 교수 등 */}
            </div>

            <button
              onClick={() => setSelected(null)}
              className="mt-8 w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl font-medium shadow-lg"
            >
              닫기
            </button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}