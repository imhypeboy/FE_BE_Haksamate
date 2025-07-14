// lib/api.ts
import { supabase } from './supabaseClient'
import type { Subject } from '@/types/subject'

// 유저별 과목 목록 조회
export async function fetchSubjects(userId: string): Promise<Subject[]> {
    const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('user_id', userId)
        .order('starttime')
    if (error) throw error
    return data as Subject[]
}

// 과목 추가
export async function createSubject(subject: Omit<Subject, 'id'>, userId: string) {
    const { error } = await supabase
        .from('subjects')
        .insert([{ ...subject, user_id: userId }])
    if (error) throw error
}

// 과목 수정
export async function updateSubject(subject: Subject, userId: string) {
    const { id, ...rest } = subject
    const { error } = await supabase
        .from('subjects')
        .update({ ...rest })
        .eq('id', id)
        .eq('user_id', userId)
    if (error) throw error
}

// 과목 삭제
export async function deleteSubject(id: number, userId: string) {
    const { error } = await supabase
        .from('subjects')
        .delete()
        .eq('id', id)
        .eq('user_id', userId)
    if (error) throw error
}
