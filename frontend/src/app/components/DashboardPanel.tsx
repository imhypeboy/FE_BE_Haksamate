"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "framer-motion"
import { AlarmClock, CalendarDays, CheckCircle, Clock8 } from "lucide-react"
import type { Subject } from "@/hooks/useSubjects"

interface Task {
  id: string
  title: string
  subject: string
  dueDate: string // ISO date string
}

interface DashboardPanelProps {
  subjects: Subject[]
  tasks?: Task[] // 과제 / 시험
}

export default function DashboardPanel({ subjects, tasks = [] }: DashboardPanelProps) {
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
  type Todo = { id: string; text: string; done: boolean }
  const [todos, setTodos] = useState<Todo[]>([])
  const [input, setInput] = useState("")

  // localStorage persistence
  useEffect(() => {
    const stored = localStorage.getItem("hm_todos")
    if (stored) setTodos(JSON.parse(stored))
  }, [])
  useEffect(() => {
    localStorage.setItem("hm_todos", JSON.stringify(todos))
  }, [todos])

  const addTodo = () => {
    if (!input.trim()) return
    setTodos([{ id: Date.now().toString(), text: input.trim(), done: false }, ...todos])
    setInput("")
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
        {todos.length === 0 ? (
          <p className="text-gray-500 text-sm">할 일이 없습니다.</p>
        ) : (
          <ul className="space-y-2 max-h-40 overflow-y-auto pr-1">
            {todos.map((todo) => (
              <li key={todo.id} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={todo.done}
                  onChange={() =>
                    setTodos((prev) =>
                      prev.map((t) => (t.id === todo.id ? { ...t, done: !t.done } : t)),
                    )
                  }
                  className="h-4 w-4 text-blue-500"
                />
                <span className={todo.done ? "line-through text-gray-400" : "text-gray-800"}>{todo.text}</span>
                <button
                  onClick={() => setTodos((prev) => prev.filter((t) => t.id !== todo.id))}
                  className="ml-auto text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    </div>
  )
} 