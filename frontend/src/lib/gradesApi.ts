import { supabase } from './supabaseClient'

export interface Grade {
    id?: number
    user_id?: string
    semester: string
    subject: string
    credit: number
    grade: string
    score: number
}

// [조회]
export async function fetchGrades(userId: string): Promise<Grade[]> {
    const { data, error } = await supabase
        .from('grades')
        .select('*')
        .eq('user_id', userId)
        .order('semester', { ascending: true })
    if (error) throw error
    return data as Grade[]
}

// [추가]
export async function addGrade(grade: Omit<Grade, "id" | "user_id">, userId: string) {
    const { error } = await supabase
        .from('grades')
        .insert([{ ...grade, user_id: userId }])
    if (error) throw error
}

// [수정]
export async function updateGrade(grade: Grade, userId: string) {
    if (!grade.id) throw new Error("No grade id")
    const { id, ...rest } = grade
    const { error } = await supabase
        .from('grades')
        .update({ ...rest })
        .eq('id', id)
        .eq('user_id', userId)
    if (error) throw error
}

// [삭제]
export async function deleteGrade(id: number, userId: string) {
    const { error } = await supabase
        .from('grades')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
    if (error) throw error
}
