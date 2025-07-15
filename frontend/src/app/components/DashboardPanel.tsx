"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { AlarmClock, CalendarDays, CheckCircle, Clock8, ChevronDown, ChevronUp, FolderOpen, BookOpen, Target } from "lucide-react"
import type { Subject } from "@/hooks/useSubjects"
import { toggleChecklistItem } from "@/lib/examApi"
import { supabase } from "@/lib/supabaseClient"

interface Task {
  id: string
  title: string
  subject: string
  dueDate: string // ISO date string
}

interface ChecklistItem {
  id: string
  text: string
  done: boolean
  examId: number
  examSubject: string
}

interface DashboardPanelProps {
  subjects: Subject[]
  tasks?: Task[] // 과제 / 시험
  checklistItems?: ChecklistItem[] // 체크리스트 항목들
}

export default function DashboardPanel({ subjects, tasks = [], checklistItems = [] }: DashboardPanelProps) {
  // ------------------ 다음 수업 계산 ------------------
  const nextClass = useMemo(() => {
    if (subjects.length === 0) return null

    const now = new Date()
    // 요일 매핑
    const dayMap: Record<string, number> = {
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
      SATURDAY: 6,
      SUNDAY: 0,
    }

    let nearest: { subject: Subject; start: Date } | null = null

    subjects.forEach((sub) => {
      const start = new Date(now)
      start.setDate(
        now.getDate() + ((7 + dayMap[sub.dayofweek] - now.getDay()) % 7),
      )
      // set time
      const [sh, sm] = sub.starttime.split(":" )
      start.setHours(Number(sh), Number(sm), 0, 0)
      // 이미 시작됐으면 다음 주 고려
      if (start < now) start.setDate(start.getDate() + 7)

      if (!nearest || start < nearest.start) {
        nearest = { subject: sub, start }
      }
    })

    return nearest
  }, [subjects])

  const [countdown, setCountdown] = useState<string>("")

  useEffect(() => {
    const timer = setInterval(() => {
      if (!nextClass) return
      const diff = nextClass.start.getTime() - Date.now()
      if (diff <= 0) return setCountdown("곧 시작")
      const totalSec = Math.floor(diff / 1000)
      const days = Math.floor(totalSec / 86400)
      const h = Math.floor((totalSec % 86400) / 3600)
      const m = Math.floor((totalSec % 3600) / 60)
      const s = totalSec % 60
      const timeStr = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
      setCountdown(days > 0 ? `${days}일 ${timeStr}` : timeStr)
    }, 1000)
    return () => clearInterval(timer)
  }, [nextClass])

  // ------------------ D-Day 계산 ------------------
  const upcomingTasks = useMemo(() => {
    return tasks
      .filter((t) => new Date(t.dueDate) > new Date())
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      .slice(0, 3)
  }, [tasks])

  // ------------------ Todo ------------------
  type Todo = { id: string; text: string; done: boolean; isChecklist?: boolean; examId?: number }
  const [todos, setTodos] = useState<Todo[]>([])
  const [input, setInput] = useState("")
  const [collapsedCategories, setCollapsedCategories] = useState<Set<string>>(new Set())

  // localStorage persistence + 체크리스트 항목 추가
  useEffect(() => {
    const stored = localStorage.getItem("hm_todos")
    const localTodos = stored ? JSON.parse(stored) : []
    
    // 체크리스트 항목들을 TODO에 추가 (중복 방지)
    const checklistTodos = checklistItems.map(item => ({
      id: `checklist-${item.id}`,
      text: item.text,
      done: item.done,
      isChecklist: true,
      examId: item.examId
    }))
    
    // 기존 TODO와 체크리스트 항목 합치기 (중복 제거)
    const existingIds = new Set(localTodos.map((t: Todo) => t.id))
    const newChecklistTodos = checklistTodos.filter(item => !existingIds.has(item.id))
    
    setTodos([...localTodos, ...newChecklistTodos])
  }, [checklistItems])

  useEffect(() => {
    // 체크리스트가 아닌 항목만 localStorage에 저장
    const nonChecklistTodos = todos.filter(todo => !todo.isChecklist)
    localStorage.setItem("hm_todos", JSON.stringify(nonChecklistTodos))
  }, [todos])

  const addTodo = () => {
    if (!input.trim()) return
    setTodos([{ id: Date.now().toString(), text: input.trim(), done: false }, ...todos])
    setInput("")
  }

  // TODO 토글 (체크리스트 항목인 경우 데이터베이스도 업데이트)
  const toggleTodo = async (todo: Todo) => {
    if (todo.isChecklist && todo.examId) {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user?.id) {
          // 체크리스트 ID 추출 (checklist-123 형태에서 123 추출)
          const checklistId = parseInt(todo.id.replace('checklist-', ''))
          await toggleChecklistItem(checklistId, !todo.done, session.user.id)
        }
      } catch (e) {
        console.error('체크리스트 업데이트 실패:', e)
      }
    }
    
    setTodos((prev) =>
      prev.map((t) => (t.id === todo.id ? { ...t, done: !t.done } : t)),
    )
  }

  // TODO 삭제 (체크리스트 항목은 삭제 불가)
  const deleteTodo = (todoId: string) => {
    const todo = todos.find(t => t.id === todoId)
    if (todo?.isChecklist) {
      // 체크리스트 항목은 삭제 불가
      return
    }
    setTodos((prev) => prev.filter((t) => t.id !== todoId))
  }

  // 카테고리별로 그룹화
  const groupedTodos = useMemo(() => {
    const groups: { [key: string]: Todo[] } = {}
    
    todos.forEach(todo => {
      if (todo.isChecklist) {
        // 체크리스트 항목: 카테고리별로 그룹화
        const category = todo.text.match(/^\[([^\]]+)\]/)?.[1] || '기타'
        if (!groups[category]) groups[category] = []
        groups[category].push(todo)
      } else {
        // 일반 TODO: '일반' 카테고리로 그룹화
        if (!groups['일반']) groups['일반'] = []
        groups['일반'].push(todo)
      }
    })
    
    return groups
  }, [todos])

  // 카테고리 접기/펼치기 토글
  const toggleCategory = (category: string) => {
    setCollapsedCategories(prev => {
      const newSet = new Set(prev)
      if (newSet.has(category)) {
        newSet.delete(category)
      } else {
        newSet.add(category)
      }
      return newSet
    })
  }

  // 카테고리별 아이콘과 색상
  const getCategoryStyle = (category: string) => {
    if (category === '일반') {
      return {
        icon: <Target className="h-4 w-4" />,
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-700',
        headerBg: 'bg-blue-100'
      }
    }
    return {
      icon: <BookOpen className="h-4 w-4" />,
      bgColor: 'bg-[#8fc3ef]/10',
      borderColor: 'border-[#8fc3ef]/30',
      textColor: 'text-[#8fc3ef]',
      headerBg: 'bg-[#8fc3ef]/20'
    }
  }

  return (
    <div className="flex flex-col gap-6 w-full max-w-sm">
      {/* 다음 수업 카드 */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-2xl shadow-md p-5 border border-gray-100"
      >
        <div className="flex items-center gap-3 mb-3">
          <Clock8 className="h-5 w-5 text-emerald-500" />
          <h4 className="font-semibold text-gray-800">다음 수업</h4>
        </div>
        {nextClass ? (
          <>
            <p className="text-lg font-medium text-gray-900 mb-1">{nextClass.subject.name}</p>
            <p className="text-sm text-gray-500 mb-4">{nextClass.subject.starttime} ~ {nextClass.subject.endtime} / {nextClass.subject.dayofweek}</p>
            <div className="flex items-center gap-2 text-sm">
              <AlarmClock className="h-4 w-4 text-emerald-500" />
              <span className="font-mono text-gray-800 tracking-tight">{countdown}</span>
            </div>
          </>
        ) : (
          <p className="text-gray-500 text-sm">등록된 수업이 없습니다.</p>
        )}
      </motion.div>

      {/* D-Day 카드 */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-2xl shadow-md p-5 border border-gray-100"
      >
        <div className="flex items-center gap-3 mb-3">
          <CalendarDays className="h-5 w-5 text-purple-500" />
          <h4 className="font-semibold text-gray-800">D-Day</h4>
        </div>
        {upcomingTasks.length === 0 ? (
          <p className="text-gray-500 text-sm">예정된 과제/시험이 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {upcomingTasks.map((task) => {
              const dDay = Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              return (
                <li key={task.id} className="text-sm flex justify-between">
                  <span>{task.title}</span>
                  <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs">D-{dDay}</span>
                </li>
              )
            })}
          </ul>
        )}
      </motion.div>

      {/* TODO 카드 */}
      <motion.div
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white rounded-2xl shadow-md p-5 border border-gray-100"
      >
        <div className="flex items-center gap-3 mb-3">
          <CheckCircle className="h-5 w-5 text-blue-500" />
          <h4 className="font-semibold text-gray-800">오늘의 TODO</h4>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTodo()}
            placeholder="할 일을 입력하세요"
            className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
          <button
            onClick={addTodo}
            className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg"
          >
            추가
          </button>
        </div>
        {Object.entries(groupedTodos).length === 0 ? (
          <p className="text-gray-500 text-sm">할 일이 없습니다.</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(groupedTodos).map(([category, items]) => {
              const style = getCategoryStyle(category)
              const completedCount = items.filter(item => item.done).length
              const totalCount = items.length
              
              return (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`${style.bgColor} ${style.borderColor} border rounded-xl overflow-hidden shadow-sm`}
                >
                  <div 
                    className={`${style.headerBg} px-4 py-3 cursor-pointer transition-colors hover:opacity-80`}
                    onClick={() => toggleCategory(category)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={style.textColor}>
                          {style.icon}
                        </span>
                        <h5 className="font-semibold text-gray-800">{category}</h5>
                        <span className="text-xs bg-white/60 px-2 py-1 rounded-full text-gray-600">
                          {completedCount}/{totalCount}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {collapsedCategories.has(category) ? (
                          <ChevronDown className="h-4 w-4 text-gray-500" />
                        ) : (
                          <ChevronUp className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {!collapsedCategories.has(category) && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="px-4 py-3"
                    >
                      <ul className="space-y-2">
                        {items.map((todo) => (
                          <motion.li
                            key={todo.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={todo.done}
                              onChange={(e) => {
                                e.stopPropagation()
                                toggleTodo(todo)
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="h-4 w-4 text-blue-500 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                            />
                            <span 
                              className={`flex-1 text-sm cursor-pointer ${todo.done ? "line-through text-gray-400" : "text-gray-700"}`}
                              onClick={(e) => {
                                e.stopPropagation()
                                toggleTodo(todo)
                              }}
                            >
                              {todo.isChecklist ? todo.text.replace(/^\[[^\]]+\]\s*/, '') : todo.text}
                            </span>
                            {todo.isChecklist && (
                              <span className="text-xs bg-[#8fc3ef]/20 text-[#8fc3ef] px-2 py-1 rounded-full font-medium">
                                체크리스트
                              </span>
                            )}
                            {!todo.isChecklist && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteTodo(todo.id)
                                }}
                                className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded"
                              >
                                ×
                              </button>
                            )}
                          </motion.li>
                        ))}
                      </ul>
                    </motion.div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>
    </div>
  )
} 