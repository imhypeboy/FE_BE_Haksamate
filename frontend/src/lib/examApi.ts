import { supabase } from './supabaseClient'

export interface Exam {
    id?: number
    subject: string
    type: "중간고사" | "기말고사" | "퀴즈" | "과제"
    date: string
    time: string
    location: string
    status: "예정" | "진행중" | "완료"
    user_id?: string
}

export interface ChecklistItem {
    id?: number
    task: string
    completed: boolean
    exam_id: number
    user_id?: string
}

const EXAMS_TABLE = "exams"
const CHECKLIST_TABLE = "exam_checklist"

// 시험 목록 조회
export const fetchExams = async (userId: string): Promise<Exam[]> => {
    try {
        const { data, error } = await supabase
            .from(EXAMS_TABLE)
            .select("*")
            .eq("user_id", userId)
            .order("date", { ascending: true })

        if (error) {
            throw error
        }

        return (data || []) as Exam[]
    } catch (error) {
        console.error("Error fetching exams:", error)
        throw error
    }
}

// 시험 추가
export const addExam = async (exam: Omit<Exam, "id" | "user_id">, userId: string): Promise<Exam> => {
    try {
        const { data, error } = await supabase
            .from(EXAMS_TABLE)
            .insert([{ ...exam, user_id: userId }])
            .select()
            .single()

        if (error) {
            throw error
        }

        return data as Exam
    } catch (error) {
        console.error("Error adding exam:", error)
        throw error
    }
}

// 시험 수정
export const updateExam = async (exam: Exam, userId: string): Promise<Exam> => {
    try {
        // Prevent updating user_id
        const { user_id, id, ...rest } = exam
        const { data, error } = await supabase
            .from(EXAMS_TABLE)
            .update(rest)
            .eq("id", id)
            .eq("user_id", userId)
            .select()
            .single()

        if (error) {
            throw error
        }

        return data as Exam
    } catch (error) {
        console.error("Error updating exam:", error)
        throw error
    }
}

// 시험 삭제
export const deleteExam = async (id: number, userId: string): Promise<void> => {
    try {
        // 먼저 관련 체크리스트 삭제
        const { error: checklistError } = await supabase
            .from(CHECKLIST_TABLE)
            .delete()
            .eq("exam_id", id)
            .eq("user_id", userId)

        if (checklistError) {
            console.error("Error deleting checklist items:", checklistError)
            throw checklistError
        }

        // 시험 삭제
        const { error: examError } = await supabase.from(EXAMS_TABLE).delete().eq("id", id).eq("user_id", userId)

        if (examError) {
            throw examError
        }
    } catch (error) {
        console.error("Error deleting exam:", error)
        throw error
    }
}

// 체크리스트 조회
export const fetchChecklist = async (userId: string, examId: number): Promise<ChecklistItem[]> => {
    try {
        const { data, error } = await supabase
            .from(CHECKLIST_TABLE)
            .select("*")
            .eq("user_id", userId)
            .eq("exam_id", examId)
            .order("created_at", { ascending: true })

        if (error) {
            throw error
        }

        return (data || []) as ChecklistItem[]
    } catch (error) {
        console.error("Error fetching checklist:", error)
        throw error
    }
}

// 체크리스트 항목 추가
export const addChecklistItem = async (task: string, examId: number, userId: string): Promise<ChecklistItem> => {
    try {
        const { data, error } = await supabase
            .from(CHECKLIST_TABLE)
            .insert([{ task, exam_id: examId, completed: false, user_id: userId }])
            .select()
            .single()

        if (error) {
            throw error
        }

        return data as ChecklistItem
    } catch (error) {
        console.error("Error adding checklist item:", error)
        throw error
    }
}

// 체크리스트 항목 토글
export const toggleChecklistItem = async (id: number, completed: boolean, userId: string): Promise<void> => {
    try {
        const { error } = await supabase.from(CHECKLIST_TABLE).update({ completed }).eq("id", id).eq("user_id", userId)

        if (error) {
            throw error
        }
    } catch (error) {
        console.error("Error toggling checklist item:", error)
        throw error
    }
}

// 체크리스트 항목 삭제
export const deleteChecklistItem = async (id: number, userId: string): Promise<void> => {
    try {
        const { error } = await supabase.from(CHECKLIST_TABLE).delete().eq("id", id).eq("user_id", userId)

        if (error) {
            throw error
        }
    } catch (error) {
        console.error("Error deleting checklist item:", error)
        throw error
    }
}
