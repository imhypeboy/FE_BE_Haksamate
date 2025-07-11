"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Plus, Filter } from "lucide-react"
import { SubjectCard } from "./subject-card"
import { SubjectCardSkeleton } from "./loading-skeleton"
import type { Subject } from "@/hooks/useSubjects"
import { useState, useMemo } from "react"

interface SubjectManagementProps {
  subjects: Subject[]
  isLoading: boolean
  days: Array<{ label: string; value: string; ko: string }>
  onEdit: (subject: Subject) => void
  onDelete: (id?: number) => void
  onAddClick: () => void
}

type FilterType = "all" | "required" | "dayofweek"
type DayFilter = "ALL" | "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

export function SubjectManagement({ subjects, isLoading, days, onEdit, onDelete, onAddClick }: SubjectManagementProps) {
  const [filterType, setFilterType] = useState<FilterType>("all")
  const [dayFilter, setDayFilter] = useState<DayFilter>("ALL")
  const [requiredFilter, setRequiredFilter] = useState<"all" | "required" | "optional">("all")

  // 필터링된 과목 목록
  const filteredSubjects = useMemo(() => {
    let filtered = [...subjects]

    // 요일 필터
    if (filterType === "dayofweek" && dayFilter !== "ALL") {
      filtered = filtered.filter(subject => subject.dayofweek === dayFilter)
    }

    // 필수/선택 필터
    if (filterType === "required") {
      if (requiredFilter === "required") {
        filtered = filtered.filter(subject => subject.required === true)
      } else if (requiredFilter === "optional") {
        filtered = filtered.filter(subject => subject.required === false)
      }
    }

    return filtered
  }, [subjects, filterType, dayFilter, requiredFilter])

  // Chip 기반 단일 라인 필터 정의
  const chipFilters = useMemo(() => {
    // 요일별 칩
    const dayChips = days.map(({ value, ko }) => ({
      id: value,
      label: ko,
      count: subjects.filter((s) => s.dayofweek === value).length,
      onClick: () => {
        setFilterType("dayofweek")
        setDayFilter(value as DayFilter)
      },
      active: filterType === "dayofweek" && dayFilter === value,
    }))

    return [
      {
        id: "all",
        label: "전체",
        count: subjects.length,
        onClick: () => {
          setFilterType("all")
          setDayFilter("ALL")
          setRequiredFilter("all")
        },
        active: filterType === "all",
      },
      ...dayChips,
      {
        id: "required",
        label: "필수",
        count: subjects.filter((s) => s.required).length,
        onClick: () => {
          setFilterType("required")
          setRequiredFilter("required")
        },
        active: filterType === "required" && requiredFilter === "required",
      },
      {
        id: "optional",
        label: "선택",
        count: subjects.filter((s) => !s.required).length,
        onClick: () => {
          setFilterType("required")
          setRequiredFilter("optional")
        },
        active: filterType === "required" && requiredFilter === "optional",
      },
    ]
  }, [subjects, filterType, dayFilter, requiredFilter, days])

  return (
    <motion.div
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.8 }}
      className="w-full space-y-6"
    >
      <div className="space-y-6">
        {/* 필터 칩 한 줄 */}
        <div className="overflow-x-auto flex gap-2 px-1 pb-1">
          {chipFilters.map(({ id, label, count, onClick, active }) => (
            <motion.button
              key={id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClick}
              className={`flex items-center gap-1 px-3 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-colors ${
                active
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              <span>{label}</span>
              <span className="text-xs bg-white/20 rounded-full px-2 py-0.5">
                {count}
              </span>
            </motion.button>
          ))}
        </div>

        {/* 과목 추가 버튼 */}
        <div className="flex justify-between items-center">
          <motion.h3
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="text-lg font-semibold text-gray-900 flex items-center gap-2"
          >
            <Filter className="h-5 w-5 text-gray-500" />
            {filterType === "all" && "전체 과목"}
            {filterType === "dayofweek" && dayFilter === "ALL" && "전체 요일"}
            {filterType === "dayofweek" && dayFilter !== "ALL" && `${days.find(d => d.value === dayFilter)?.ko}요일 과목`}
            {filterType === "required" && requiredFilter === "all" && "전체 과목"}
            {filterType === "required" && requiredFilter === "required" && "필수 과목"}
            {filterType === "required" && requiredFilter === "optional" && "선택 과목"}
            <span className="text-sm text-gray-500">({filteredSubjects.length}개)</span>
          </motion.h3>

          <motion.button
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.7, type: "spring", stiffness: 200, damping: 15 }}
            whileHover={{ scale: 1.05, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAddClick}
            className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white rounded-xl shadow-lg transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300/50 backdrop-blur-sm border border-white/20 flex items-center justify-center"
            disabled={isLoading}
            aria-label="과목 추가"
          >
            <Plus className="h-5 w-5" />
          </motion.button>
        </div>

        {/* 과목 리스트 */}
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-4"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <SubjectCardSkeleton key={i} />
            ))}
          </motion.div>
        ) : filteredSubjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-center py-16"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 4,
                repeat: Number.POSITIVE_INFINITY,
                ease: "easeInOut",
              }}
              className="text-6xl mb-6"
            >
              {filterType === "all" && "📚"}
              {filterType === "dayofweek" && "📅"}
              {filterType === "required" && "🎯"}
            </motion.div>
            <h4 className="text-xl font-semibold text-gray-700 mb-3">
              {filteredSubjects.length === 0 && subjects.length > 0 
                ? "해당 조건의 과목이 없어요" 
                : "아직 등록된 과목이 없어요"
              }
            </h4>
            <p className="text-gray-500 mb-6">
              {filteredSubjects.length === 0 && subjects.length > 0
                ? "다른 필터를 선택하거나 새 과목을 추가해보세요"
                : "과목을 추가해서 나만의 시간표를 만들어보세요"
              }
            </p>
            <motion.div
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl font-medium shadow-lg cursor-pointer"
              onClick={onAddClick}
            >
              <Plus className="h-4 w-4" />
              {subjects.length === 0 ? "첫 번째 과목 추가하기" : "새 과목 추가하기"}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-4"
          >
            <AnimatePresence>
              {filteredSubjects.map((subject) => (
                <SubjectCard
                  key={subject.id}
                  subject={subject}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  dayLabel={days.find((d) => d.value === subject.dayofweek)?.ko || ""}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}