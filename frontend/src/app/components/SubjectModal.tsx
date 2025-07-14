"use client"

import { motion, AnimatePresence } from "framer-motion"
import Modal from "react-modal"
import { Plus } from "lucide-react"
import type { Subject } from "@/hooks/useSubjects"

interface SubjectModalProps {
  showModal: boolean
  form: Omit<Subject, "id" | "user_id">
  editId: number | null
  timeError: string | null
  isLoading: boolean
  timeOptions: string[]
  days: Array<{ label: string; value: string; ko: string }>
  onClose: () => void
  onSubmit: () => void
  onFormChange: (form: Omit<Subject, "id" | "user_id">) => void
  onStartTimeChange: (starttime: string) => void
}

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 50,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 300,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 50,
    transition: {
      duration: 0.2,
    },
  },
}

export function SubjectModal({
  showModal,
  form,
  editId,
  timeError,
  isLoading,
  timeOptions,
  days,
  onClose,
  onSubmit,
  onFormChange,
  onStartTimeChange,
}: SubjectModalProps) {
  return (
    <AnimatePresence>
      {showModal && (
        <Modal
          isOpen={showModal}
          onRequestClose={onClose}
          contentLabel="과목 추가/수정"
          className="backdrop-blur-xl bg-white/90 rounded-3xl max-w-lg w-full mx-4 p-8 shadow-2xl border border-white/50"
          overlayClassName="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          ariaHideApp={false}
        >
          <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <motion.div
                  whileHover={{ rotate: 180, scale: 1.1 }}
                  transition={{ duration: 0.4 }}
                  className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
                >
                  <Plus className="h-4 w-4 text-white" />
                </motion.div>
                {editId ? "과목 수정" : "과목 추가"}
              </h2>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-gray-100/80 hover:bg-gray-200/80 flex items-center justify-center transition-all duration-200"
                aria-label="닫기"
              >
                ✕
              </motion.button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault()
                onSubmit()
              }}
              className="space-y-6"
            >
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  과목명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full border-2 border-gray-200/50 rounded-2xl px-4 py-3 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all backdrop-blur-sm bg-white/80 text-gray-900 placeholder-gray-500"
                  value={form.name}
                  onChange={(e) => onFormChange({ ...form, name: e.target.value })}
                  placeholder="예: 데이터구조와 알고리즘"
                  required
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-3 gap-4"
              >
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    요일 <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full border-2 border-gray-200/50 rounded-2xl px-4 py-3 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all backdrop-blur-sm bg-white/80 text-gray-900"
                    value={form.dayofweek}
                    onChange={(e) => onFormChange({ ...form, dayofweek: e.target.value })}
                    required
                  >
                    {days.map((day) => (
                      <option key={day.value} value={day.value}>
                        {day.ko}요일
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    시작 <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full border-2 border-gray-200/50 rounded-2xl px-4 py-3 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all backdrop-blur-sm bg-white/80 text-gray-900"
                    value={form.starttime}
                    onChange={(e) => onStartTimeChange(e.target.value)}
                    required
                  >
                    <option value="">선택</option>
                    {timeOptions.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">
                    종료 <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="w-full border-2 border-gray-200/50 rounded-2xl px-4 py-3 focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all backdrop-blur-sm bg-white/80 text-gray-900"
                    value={form.endtime}
                    onChange={(e) => onFormChange({ ...form, endtime: e.target.value })}
                    required
                  >
                    <option value="">선택</option>
                    {timeOptions.map((time, idx) =>
                      idx > timeOptions.findIndex((t) => t === form.starttime) ? (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ) : null,
                    )}
                  </select>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center gap-3 p-4 bg-gray-50/80 rounded-2xl backdrop-blur-sm"
              >
                <input
                  id="required"
                  type="checkbox"
                  checked={form.required}
                  onChange={(e) => onFormChange({ ...form, required: e.target.checked })}
                  className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded-lg focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="required" className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <span className="text-red-500">⭐</span>
                  필수 과목으로 설정 (시간표 생성 시 우선 배치)
                </label>
              </motion.div>

              <AnimatePresence>
                {timeError && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -10 }}
                    className="p-4 bg-red-50/80 border-2 border-red-200/50 rounded-2xl backdrop-blur-sm"
                  >
                    <p className="text-red-700 text-sm font-medium flex items-center gap-2">
                      <span>⚠️</span>
                      {timeError}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex gap-4 pt-6"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 px-6 border-2 border-gray-300/50 rounded-2xl text-gray-700 hover:bg-gray-50/80 transition-all font-medium backdrop-blur-sm"
                  disabled={isLoading}
                >
                  취소
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl font-bold transition-all disabled:opacity-50 shadow-lg backdrop-blur-sm"
                  disabled={isLoading}
                >
                  {isLoading ? "저장 중..." : editId ? "✏️ 수정" : "➕ 추가"}
                </motion.button>
              </motion.div>
            </form>
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  )
}
