import React from "react"
import SubjectCard from "./SubjectCard"

interface SubjectListProps {
  subjects: any[]
  onEdit: (subject: any) => void
  onDelete: (id?: number) => void
  isLoading: boolean
}

export default function SubjectList({ subjects, onEdit, onDelete, isLoading }: SubjectListProps) {
  if (isLoading && subjects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-t-2 border-b-2 border-blue-600 rounded-full animate-spin" />
        <p className="mt-3 text-gray-500">과목을 불러오는 중...</p>
      </div>
    )
  }
  if (subjects.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📚</div>
        <p className="text-gray-500 mb-4">등록된 과목이 없습니다</p>
        <p className="text-sm text-gray-400">과목을 추가해서 시간표를 만들어보세요</p>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {subjects.map((subject, index) => (
        <SubjectCard
          key={subject.id}
          subject={subject}
          index={index}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
} 