"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Edit, Trash2, Calendar, Clock, CheckCircle } from "lucide-react"
import Modal from "react-modal"
import Sidebar from "../sidebar/sidebar"
import {
  fetchExams,
  addExam,
  updateExam,
  deleteExam,
  fetchChecklist,
  addChecklistItem,
  toggleChecklistItem,
  deleteChecklistItem,
  type Exam,
  type ChecklistItem,
} from "@/lib/examApi"
import { supabase } from "@/lib/supabaseClient"

export default function ExamsPage() {
  const router = useRouter()
  const [exams, setExams] = useState<Exam[]>([])
  const [checklist, setChecklist] = useState<ChecklistItem[]>([])
  const [showModal, setShowModal] = useState(false)
  const [showChecklistModal, setShowChecklistModal] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null)
  const [newChecklistItem, setNewChecklistItem] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(true) // 사이드바 상태 추가
  const [form, setForm] = useState<Exam>({
    subject: "",
    type: "중간고사",
    date: "",
    time: "",
    location: "",
    status: "예정",
  })
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const check = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      if (!session) {
        router.push("/auth/login")
        return
      }
      setUserId(session.user.id)
      if (typeof window !== "undefined") Modal.setAppElement("body")
    }
    check()
  }, [router])

  useEffect(() => {
    if (!userId) return
    loadExams(userId)
  }, [userId])

  const loadExams = async (uid: string) => {
    setLoading(true)
    try {
      const list = await fetchExams(uid)
      setExams(list)
    } catch {
      alert("시험 불러오기 오류")
    } finally {
      setLoading(false)
    }
  }

  // 체크리스트 로드 (선택한 시험)
  const loadChecklist = async (uid: string, examId: number) => {
    try {
      const list = await fetchChecklist(uid, examId)
      setChecklist(list)
    } catch {
      setChecklist([])
    }
  }

  // 시험 추가/수정
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return
    try {
      if (editMode && form.id) {
        await updateExam(form, userId)
      } else {
        const newExam = await addExam(form, userId)
        setSelectedExam(newExam) // 새 시험이면 checklist 띄울때 사용
      }
      await loadExams(userId)
      resetForm()
      setShowModal(false)
    } catch {
      alert("저장 오류")
    }
  }

  // 시험 수정
  const handleEdit = (exam: Exam) => {
    setForm({ ...exam })
    setEditMode(true)
    setShowModal(true)
  }

  // 시험 삭제
  const handleDelete = async (id: number) => {
    if (!userId) return
    if (window.confirm("정말로 이 시험을 삭제하시겠습니까?\n관련된 체크리스트도 함께 삭제됩니다.")) {
      try {
        await deleteExam(id, userId)
        await loadExams(userId)
      } catch {
        alert("삭제 오류")
      }
    }
  }

  // 시험 추가 폼 초기화
  const resetForm = () => {
    setForm({
      subject: "",
      type: "중간고사",
      date: "",
      time: "",
      location: "",
      status: "예정",
    })
    setEditMode(false)
  }

  // 체크리스트 모달 열기
  const openChecklistModal = async (exam: Exam) => {
    setSelectedExam(exam)
    if (userId && exam.id) {
      await loadChecklist(userId, exam.id)
      setShowChecklistModal(true)
    }
  }

  // 체크리스트 항목 추가
  const handleAddChecklistItem = async () => {
    if (!newChecklistItem.trim() || !selectedExam?.id || !userId) return
    try {
      await addChecklistItem(newChecklistItem.trim(), selectedExam.id, userId)
      await loadChecklist(userId, selectedExam.id)
      setNewChecklistItem("")
    } catch {
      alert("추가 오류")
    }
  }

  // 체크리스트 항목 토글
  const handleToggleChecklistItem = async (id: number, completed: boolean) => {
    if (!userId) return
    try {
      await toggleChecklistItem(id, !completed, userId)
      if (selectedExam?.id) await loadChecklist(userId, selectedExam.id)
    } catch {
      alert("토글 오류")
    }
  }

  // 체크리스트 삭제
  const handleDeleteChecklistItem = async (id: number) => {
    if (!userId) return
    if (!selectedExam?.id) return
    if (window.confirm("이 항목을 삭제하시겠습니까?")) {
      try {
        await deleteChecklistItem(id, userId)
        await loadChecklist(userId, selectedExam.id)
      } catch {
        alert("삭제 오류")
      }
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      {/* 사이드바 추가 */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* 메인 콘텐츠 */}
      <div className="flex-1 font-sans pb-12">
        <header className="bg-white text-gray-800 py-6 px-4 flex justify-between items-center shadow-sm border-b border-gray-200">
          <div className="w-10"></div>
          <h1 className="text-2xl font-bold text-gray-900">시험 일정 관리</h1>
          <div className="w-10"></div>
        </header>

        <div className="max-w-6xl mx-auto py-8 px-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">시험 목록</h2>
              <button
                onClick={() => {
                  resetForm()
                  setShowModal(true)
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors"
              >
                <Plus className="h-4 w-4 mr-2" />
                시험 추가
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all shadow-sm"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{exam.subject}</h3>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          exam.type === "중간고사" || exam.type === "기말고사"
                            ? "bg-red-100 text-red-800"
                            : exam.type === "퀴즈"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {exam.type}
                      </span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        exam.status === "완료"
                          ? "bg-green-100 text-green-800"
                          : exam.status === "진행중"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {exam.status}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                      {new Date(exam.date).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      {exam.time} | {exam.location}
                    </div>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <button
                      onClick={() => openChecklistModal(exam)}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium flex items-center transition-colors flex-1"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      체크리스트 ({checklist.filter((item) => item.completed && item.exam_id === exam.id).length}/
                      {checklist.filter((item) => item.exam_id === exam.id).length})
                    </button>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(exam)}
                        className="bg-gray-50 hover:bg-gray-100 text-blue-600 p-2 rounded-lg transition-colors"
                        title="수정"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(exam.id!)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {loading && (
              <div className="py-10 text-center text-lg text-gray-500">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mr-3"></div>
                불러오는 중...
              </div>
            )}
            {!loading && exams.length === 0 && (
              <div className="py-10 text-center text-lg text-gray-500">등록된 시험이 없습니다.</div>
            )}
          </div>
        </div>
      </div>

      {/* 시험 추가/수정 모달 */}
      <Modal
        isOpen={showModal}
        onRequestClose={() => setShowModal(false)}
        contentLabel="시험 추가/수정"
        className="bg-white text-gray-900 rounded-xl max-w-md mx-auto mt-24 p-6 shadow-lg outline-none border border-gray-200"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
        ariaHideApp={false}
      >
        <h2 className="text-xl font-bold mb-4 text-gray-900">{editMode ? "시험 수정" : "시험 추가"}</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">과목명</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">시험 유형</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as Exam["type"] })}
                required
              >
                <option value="중간고사">중간고사</option>
                <option value="기말고사">기말고사</option>
                <option value="퀴즈">퀴즈</option>
                <option value="과제">과제</option>
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">날짜</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">시간</label>
                <input
                  type="time"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">장소</label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as Exam["status"] })}
                required
              >
                <option value="예정">예정</option>
                <option value="진행중">진행중</option>
                <option value="완료">완료</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
            >
              {editMode ? "수정" : "추가"}
            </button>
          </div>
        </form>
      </Modal>

      {/* 체크리스트 모달 */}
      <Modal
        isOpen={showChecklistModal}
        onRequestClose={() => setShowChecklistModal(false)}
        contentLabel="시험 준비 체크리스트"
        className="bg-white text-gray-900 rounded-xl max-w-lg mx-auto mt-24 p-6 shadow-lg outline-none border border-gray-200"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
        ariaHideApp={false}
      >
        <h2 className="text-xl font-bold mb-4 text-gray-900">{selectedExam?.subject} - 준비 체크리스트</h2>

        <div className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              value={newChecklistItem}
              onChange={(e) => setNewChecklistItem(e.target.value)}
              placeholder="새 할일 추가"
              onKeyPress={(e) => e.key === "Enter" && handleAddChecklistItem()}
            />
            <button
              onClick={handleAddChecklistItem}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors font-medium shadow-sm"
            >
              추가
            </button>
          </div>
        </div>

        <div className="space-y-3 max-h-60 overflow-y-auto">
          {checklist
            .filter((item) => item.exam_id === selectedExam?.id)
            .map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={item.completed}
                  onChange={() => handleToggleChecklistItem(item.id!, item.completed)}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className={`flex-1 ${item.completed ? "line-through text-gray-500" : "text-gray-900"}`}>
                  {item.task}
                </span>
                <button
                  onClick={() => handleDeleteChecklistItem(item.id!)}
                  className="bg-red-50 hover:bg-red-100 text-red-600 p-2 rounded-lg transition-colors"
                  title="삭제"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          {checklist.filter((item) => item.exam_id === selectedExam?.id).length === 0 && (
            <div className="text-center text-gray-500 py-8">
              아직 체크리스트가 없습니다.
              <br />
              위에서 새로운 할일을 추가해보세요.
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={() => setShowChecklistModal(false)}
            className="px-6 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors font-medium"
          >
            닫기
          </button>
        </div>
      </Modal>
    </div>
  )
}
