"use client"

import { useEffect, useState, useMemo, useCallback } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"
import { useAuth } from "@/hooks/useAuth"
import { useSubjects, type Subject } from "@/hooks/useSubjects"
import { useTimetable } from "@/hooks/useTimetable"
import { showToast, ToastContainer } from "./components/toast"
import { BookOpen, Plus } from "lucide-react"
import { fetchExams, fetchChecklist, type Exam, type ChecklistItem } from "@/lib/examApi"

// Components
import Sidebar from "./sidebar/sidebar"
import { Header } from "./components/header"
import { SubjectManagement } from "./components/subject-manager"
import { TimetableSection } from "./components/timetable-section"
import DashboardPanel from "./components/DashboardPanel"
import { MobileFAB } from "./components/mobile-fab"
import { SubjectModal } from "./components/SubjectModal"
import { ProfileModal } from "./components/ProfileModal"
import { TimerModal } from "./components/TimerModal"

type TimetableSlot = {
  dayofweek: string
  starttime: string
  endtime: string
  subject: Subject
}

const SUBJECT_COLORS = [
  "bg-gradient-to-br from-violet-500/90 to-purple-600/90 backdrop-blur-sm",
  "bg-gradient-to-br from-blue-500/90 to-cyan-600/90 backdrop-blur-sm",
  "bg-gradient-to-br from-emerald-500/90 to-teal-600/90 backdrop-blur-sm",
  "bg-gradient-to-br from-rose-500/90 to-pink-600/90 backdrop-blur-sm",
  "bg-gradient-to-br from-amber-500/90 to-orange-600/90 backdrop-blur-sm",
  "bg-gradient-to-br from-indigo-500/90 to-blue-600/90 backdrop-blur-sm",
  "bg-gradient-to-br from-green-500/90 to-emerald-600/90 backdrop-blur-sm",
  "bg-gradient-to-br from-red-500/90 to-rose-600/90 backdrop-blur-sm",
  "bg-gradient-to-br from-purple-500/90 to-violet-600/90 backdrop-blur-sm",
  "bg-gradient-to-br from-cyan-500/90 to-blue-600/90 backdrop-blur-sm",
]

export default function Page() {
  const router = useRouter()
  const { user, isLoading: isAuthLoading } = useAuth()

  const [form, setForm] = useState<Omit<Subject, "id" | "user_id">>({
    name: "",
    dayofweek: "MONDAY",
    starttime: "",
    endtime: "",
    required: false,
  })
  const [editId, setEditId] = useState<number | null>(null)
  const [timeError, setTimeError] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showSubjectModal, setShowSubjectModal] = useState(false) // 과목 관리 모달 상태 추가
  const [showTimerModal, setShowTimerModal] = useState(false) // 타이머 모달 상태 추가
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)

  // 🔧 리다이렉트 방지를 위한 상태 추가
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false)

  const { subjects, isLoading, addSubject, updateSubject, deleteSubject } = useSubjects(user?.id || null)
  const { timetable, isLoading: isTimetableLoading, saveTimetable, loadTimetable } = useTimetable(user?.id)

  // D-Day 연동용 시험 데이터 state 추가
  const [examTasks, setExamTasks] = useState<{
    id: string
    title: string
    subject: string
    dueDate: string
  }[]>([])

  // 체크리스트 데이터 state 추가
  const [checklistItems, setChecklistItems] = useState<{
    id: string
    text: string
    done: boolean
    examId: number
    examSubject: string
  }[]>([])

  // 시험 데이터와 체크리스트 불러오기
  useEffect(() => {
    const loadExamsAndChecklist = async () => {
      if (!user?.id) return
      try {
        const exams: Exam[] = await fetchExams(user.id)
        // DashboardPanel Task 타입에 맞게 변환
        setExamTasks(
          exams.map((exam) => ({
            id: String(exam.id),
            title: exam.subject + " (" + exam.type + ")",
            subject: exam.subject,
            dueDate: exam.date,
          }))
        )

        // 모든 시험의 체크리스트 불러오기
        const allChecklistItems: {
          id: string
          text: string
          done: boolean
          examId: number
          examSubject: string
        }[] = []

        for (const exam of exams) {
          if (exam.id) {
            try {
              const checklist = await fetchChecklist(user.id, exam.id)
              checklist.forEach((item) => {
                allChecklistItems.push({
                  id: String(item.id),
                  text: `[${exam.subject}] ${item.task}`,
                  done: item.completed,
                  examId: exam.id!,
                  examSubject: exam.subject,
                })
              })
            } catch (e) {
              // 개별 체크리스트 로드 실패는 무시
            }
          }
        }

        setChecklistItems(allChecklistItems)
      } catch (e) {
        // 에러 무시(로그인 전 등)
      }
    }
    loadExamsAndChecklist()
  }, [user?.id])

  const timeOptions = useMemo(
    () =>
      Array.from({ length: 21 }, (_, i) => {
        const hour = Math.floor(i / 2) + 8
        const minute = i % 2 === 0 ? "00" : "30"
        return `${hour.toString().padStart(2, "0")}:${minute}`
      }),
    [],
  )

  const days = useMemo(
    () => [
      { label: "MON", value: "MONDAY", ko: "월" },
      { label: "TUE", value: "TUESDAY", ko: "화" },
      { label: "WED", value: "WEDNESDAY", ko: "수" },
      { label: "THU", value: "THURSDAY", ko: "목" },
      { label: "FRI", value: "FRIDAY", ko: "금" },
      { label: "SAT", value: "SATURDAY", ko: "토" },
      { label: "SUN", value: "SUNDAY", ko: "일" },
    ],
    [],
  )

  const hours = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 9), [])

  const getSubjectColor = useCallback((subjectName: string) => {
    let hash = 0
    for (let i = 0; i < subjectName.length; i++) {
      const char = subjectName.charCodeAt(i)
      hash = (hash << 5) - hash + char
      hash = hash & hash
    }
    return SUBJECT_COLORS[Math.abs(hash) % SUBJECT_COLORS.length]
  }, [])

  // 🔧 인증 체크 로직 개선 - 무한 리다이렉트 방지
  useEffect(() => {
    console.log("🔍 인증 상태 체크:", {
      isAuthLoading,
      hasUser: !!user,
      hasCheckedAuth,
      userEmail: user?.email,
    })

    // 로딩 중이면 아무것도 하지 않음
    if (isAuthLoading) {
      console.log("⏳ 아직 로딩 중...")
      return
    }

    // 🔧 인증 체크 완료 표시
    if (!hasCheckedAuth) {
      setHasCheckedAuth(true)
      console.log("✅ 인증 체크 완료")
    }

    // 🔧 로딩 완료 후 사용자가 없으면 리다이렉트 (한 번만)
    if (!user && hasCheckedAuth) {
      console.log("❌ 인증되지 않은 사용자 - 로그인 페이지로 리다이렉트")
      router.replace("/auth/login")
      return
    }

    if (user) {
      console.log("✅ 인증된 사용자:", user.email)
    }
  }, [user, isAuthLoading, hasCheckedAuth, router])

  // 🔧 강제 타임아웃 제거 (무한 리다이렉트 방지)
  // useEffect(() => {
  //   const timeout = setTimeout(() => {
  //     if (isAuthLoading) {
  //       console.warn("⚠️ 인증 확인 타임아웃 - 강제로 로그인 페이지로 이동")
  //       router.replace("/auth/login")
  //     }
  //   }, 10000)

  //   return () => clearTimeout(timeout)
  // }, [isAuthLoading, router])

  const timeToMinutes = useCallback((time: string) => {
    const [h, m] = time.split(":").map(Number)
    return h * 60 + m
  }, [])

  const handleStartTimeChange = useCallback(
    (starttime: string) => {
      const startIndex = timeOptions.findIndex((t) => t === starttime)
      const defaultEnd = timeOptions[startIndex + 2] || ""
      setForm((prev) => ({ ...prev, starttime, endtime: defaultEnd }))
    },
    [timeOptions],
  )

  const validateForm = useCallback(() => {
    if (!form.name || !form.starttime || !form.endtime) {
      setTimeError("모든 입력을 채워주세요.")
      return false
    }

    if (timeToMinutes(form.starttime) >= timeToMinutes(form.endtime)) {
      setTimeError("종료 시간이 시작 시간보다 늦어야 합니다.")
      return false
    }

    const lastTimeOption = timeOptions[timeOptions.length - 1]
    if (timeToMinutes(form.endtime) > timeToMinutes(lastTimeOption)) {
      setTimeError(`종료 시간은 ${lastTimeOption}를 넘을 수 없습니다.`)
      return false
    }

    return true
  }, [form, timeToMinutes, timeOptions])

  const handleAddOrUpdate = async () => {
    if (!validateForm()) return

    setTimeError(null)

    try {
      if (editId) {
        await updateSubject(editId, form)
        showToast({
          type: "success",
          title: "과목 수정 완료",
          message: `${form.name} 과목이 수정되었습니다.`,
        })
      } else {
        await addSubject(form)
        showToast({
          type: "success",
          title: "과목 추가 완료",
          message: `${form.name} 과목이 추가되었습니다.`,
        })
      }
      setForm({ name: "", dayofweek: "MONDAY", starttime: "", endtime: "", required: false })
      setEditId(null)
      setShowModal(false)
    } catch (err) {
      showToast({
        type: "error",
        title: "저장 실패",
        message: "저장 중 오류가 발생했습니다. 다시 시도해주세요.",
      })
    }
  }

  const handleEdit = useCallback((subject: Subject) => {
    setForm({
      name: subject.name,
      dayofweek: subject.dayofweek,
      starttime: subject.starttime,
      endtime: subject.endtime,
      required: subject.required,
    })
    setEditId(subject.id || null)
    setShowModal(true)
  }, [])

  const handleDelete = useCallback(
    async (id?: number) => {
      if (!id) return

      try {
        const subject = subjects.find((s) => s.id === id)
        await deleteSubject(id)
        showToast({
          type: "success",
          title: "과목 삭제 완료",
          message: `${subject?.name || "과목"}이 삭제되었습니다.`,
        })
      } catch (err) {
        showToast({
          type: "error",
          title: "삭제 실패",
          message: "삭제 중 오류가 발생했습니다.",
        })
      }
    },
    [subjects, deleteSubject],
  )

  const handleGenerate = useCallback(async () => {
    if (subjects.length === 0) {
      showToast({
        type: "warning",
        title: "과목이 없습니다",
        message: "시간표를 생성하려면 먼저 과목을 추가해주세요.",
      })
      return
    }

    setIsGenerating(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const required = subjects.filter((s) => s.required)
      const optional = subjects.filter((s) => !s.required)
      const optionalShuffled = optional.sort(() => Math.random() - 0.5)

      const selected: Subject[] = [...required]
      const occupied: { [key: string]: [number, number][] } = {}

      for (const subj of selected) {
        const d = subj.dayofweek
        if (!occupied[d]) occupied[d] = []
        occupied[d].push([timeToMinutes(subj.starttime), timeToMinutes(subj.endtime)])
      }

      for (const subj of optionalShuffled) {
        const d = subj.dayofweek
        const s = timeToMinutes(subj.starttime)
        const e = timeToMinutes(subj.endtime)

        if (!occupied[d]) occupied[d] = []

        const overlap = occupied[d].some(([os, oe]) => Math.max(os, s) < Math.min(oe, e))

        if (!overlap) {
          selected.push(subj)
          occupied[d].push([s, e])
        }
      }

      const newTimetable: TimetableSlot[] = selected.map((subject) => ({
        dayofweek: subject.dayofweek,
        starttime: subject.starttime,
        endtime: subject.endtime,
        subject,
      }))

      saveTimetable(newTimetable)
      showToast({
        type: "success",
        title: "시간표 생성 완료",
        message: `${newTimetable.length}개 과목으로 시간표가 생성되었습니다.`,
      })
    } catch (err) {
      showToast({
        type: "error",
        title: "생성 실패",
        message: "시간표 생성 중 오류가 발생했습니다.",
      })
    } finally {
      setIsGenerating(false)
    }
  }, [subjects, timeToMinutes])

  const timetableMap = useMemo(() => {
    const map = new Map<string, Subject[]>()
    timetable.forEach((slot) => {
      const startHour = Number.parseInt(slot.starttime.split(":")[0], 10)
      const endHour = Number.parseInt(slot.endtime.split(":")[0], 10)

      for (let hour = startHour; hour < endHour; hour++) {
        const key = `${slot.dayofweek}-${hour}`
        const existing = map.get(key) || []
        map.set(key, [...existing, slot.subject])
      }
    })
    return map
  }, [timetable])

  const resetForm = useCallback(() => {
    setForm({ name: "", dayofweek: "MONDAY", starttime: "", endtime: "", required: false })
    setTimeError(null)
    setEditId(null)
  }, [])

  const closeModal = useCallback(() => {
    setShowModal(false)
    resetForm()
  }, [resetForm])

  const handleLogout = useCallback(async () => {
    try {
      console.log("🚪 로그아웃 시작...")
      await supabase.auth.signOut()
      console.log("✅ 로그아웃 완료")
      showToast({
        type: "success",
        title: "로그아웃 완료",
        message: "안전하게 로그아웃되었습니다.",
      })
      // 로그아웃 후 로그인 페이지로 이동
      router.push("/auth/login")
    } catch (error) {
      console.error("❌ 로그아웃 실패:", error)
      showToast({
        type: "error",
        title: "로그아웃 실패",
        message: "로그아웃 중 오류가 발생했습니다.",
      })
    }
  }, [router])

  const handleAddClick = useCallback(() => {
    resetForm()
    setShowModal(true)
  }, [resetForm])

  // 🔐 로딩 화면 - 더 간단하게
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">인증 확인 중...</h2>
          <p className="text-gray-600">잠시만 기다려주세요.</p>
        </div>
      </div>
    )
  }

  // 🔧 인증 체크가 완료되지 않았으면 로딩 화면 유지
  if (!hasCheckedAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto mb-6"></div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">인증 처리 중...</h2>
          <p className="text-gray-600">잠시만 기다려주세요.</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">접근 권한이 없습니다</h1>
          <p className="text-gray-600 mb-4">로그인이 필요한 페이지입니다.</p>
          <button
            onClick={() => router.push("/auth/login")}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            로그인 페이지로 이동
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="flex min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 relative overflow-hidden"
      >
        {/* 배경 장식 요소들 */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1.2, 1, 1.2],
              rotate: [360, 180, 0],
            }}
            transition={{
              duration: 25,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
            className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 15,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-violet-400/10 to-pink-600/10 rounded-full blur-3xl"
          />
        </div>

        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className="flex-1 font-sans lg:ml-0 relative z-10">
          <Header 
            onProfileClick={() => setShowProfileModal(true)} 
            onTimerClick={() => setShowTimerModal(true)}
          />

          <div className="flex flex-col gap-4 sm:gap-6 lg:gap-8 p-3 sm:p-6 lg:p-8 max-w-[95rem] mx-auto">
            {/* 과목 관리 버튼 */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowSubjectModal(true)}
                className="flex items-center gap-3 px-6 py-4 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300/50 backdrop-blur-sm border border-white/20"
              >
                <motion.div
                  whileHover={{ rotate: 180 }}
                  transition={{ duration: 0.4 }}
                  className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center"
                >
                  <BookOpen className="h-4 w-4 text-white" />
                </motion.div>
                <span className="font-medium text-lg">과목 관리</span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm font-medium">
                  {subjects.length}개
                </span>
                <Plus className="h-5 w-5 text-white/80" />
              </motion.button>
            </motion.div>

            <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-8">
              {/* 시간표 */}
              <TimetableSection
                timetable={timetable}
                subjects={subjects}
                isGenerating={isGenerating}
                days={days}
                hours={hours}
                timetableMap={timetableMap}
                getSubjectColor={getSubjectColor}
                onGenerate={handleGenerate}
              />

              {/* 대시보드 */}
              <DashboardPanel
                subjects={subjects}
                tasks={examTasks}
                checklistItems={checklistItems}
              />
            </div>
          </div>

          <MobileFAB isLoading={isLoading} onAddClick={handleAddClick} />

          <SubjectModal
            showModal={showModal}
            form={form}
            editId={editId}
            timeError={timeError}
            isLoading={isLoading}
            timeOptions={timeOptions}
            days={days}
            onClose={closeModal}
            onSubmit={handleAddOrUpdate}
            onFormChange={setForm}
            onStartTimeChange={handleStartTimeChange}
          />

          <ProfileModal
            showProfileModal={showProfileModal}
            userEmail={user.email}
            userId={user.id}
            subjects={subjects}
            timetable={timetable}
            onClose={() => setShowProfileModal(false)}
            onLogout={handleLogout}
            onSettingsClick={() => router.push("/settings")}
          />

          <TimerModal 
            isOpen={showTimerModal}
            onClose={() => setShowTimerModal(false)}
          />

          {/* 과목 관리 모달 */}
          {showSubjectModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => setShowSubjectModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", duration: 0.5 }}
                className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <motion.div
                        whileHover={{ rotate: 180 }}
                        transition={{ duration: 0.4 }}
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
                      >
                        <BookOpen className="h-5 w-5 text-white" />
                      </motion.div>
                      과목 관리
                      <span className="text-lg font-normal text-gray-500 bg-gray-100/80 px-3 py-1 rounded-full">
                        {subjects.length}개
                      </span>
                    </h2>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setShowSubjectModal(false)}
                      className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center transition-colors"
                    >
                      <Plus className="h-5 w-5 text-gray-600 rotate-45" />
                    </motion.button>
                  </div>
                </div>
                
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                  <SubjectManagement
                    subjects={subjects}
                    isLoading={isLoading}
                    days={days}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onAddClick={handleAddClick}
                  />
                </div>
              </motion.div>
            </motion.div>
          )}
        </div>
      </motion.div>

      <ToastContainer />
    </>
  )
}