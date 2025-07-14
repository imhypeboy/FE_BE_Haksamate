import { useState, useCallback,useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

export type Subject = {
  id?: number
  name: string
  dayofweek: string
  starttime: string
  endtime: string
  required: boolean
  user_id?: string
}

export const useSubjects = (userId: string | null) => {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadSubjects = useCallback(async (uid: string) => {
    try {
      console.log('📚 과목 로딩 시작:', uid)
      setIsLoading(true)
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .eq("user_id", uid)
        .order("starttime")
      
      if (error) {
        console.error('❌ Supabase 에러:', error)
        throw error
      }
      
      console.log('✅ 로드된 과목들:', data)
      setSubjects(data || [])
    } catch (error) {
      console.error('💥 과목 로드 실패:', error)
      throw new Error("과목을 불러오는 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const addSubject = useCallback(async (subject: Omit<Subject, "id" | "user_id">) => {
    if (!userId) throw new Error("로그인이 필요합니다.")
    
    try {
      console.log('➕ 과목 추가 시도:', subject)
      setIsLoading(true)
      
      const { data, error } = await supabase
        .from("subjects")
        .insert([{ ...subject, user_id: userId }])
        .select()
      
      if (error) {
        console.error('❌ 과목 추가 에러:', error)
        throw error
      }
      
      console.log('✅ 과목 추가 성공:', data)
      
      // 과목 목록 새로고침
      await loadSubjects(userId)
    } catch (error) {
      console.error('💥 과목 추가 실패:', error)
      throw new Error("과목 추가 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }, [userId, loadSubjects])

  const updateSubject = useCallback(async (id: number, subject: Omit<Subject, "id" | "user_id">) => {
    if (!userId) throw new Error("로그인이 필요합니다.")
    
    try {
      console.log('📝 과목 수정 시도:', { id, subject })
      setIsLoading(true)
      
      const { data, error } = await supabase
        .from("subjects")
        .update(subject)
        .eq("id", id)
        .eq("user_id", userId)
        .select()
      
      if (error) {
        console.error('❌ 과목 수정 에러:', error)
        throw error
      }
      
      console.log('✅ 과목 수정 성공:', data)
      await loadSubjects(userId)
    } catch (error) {
      console.error('💥 과목 수정 실패:', error)
      throw new Error("과목 수정 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }, [userId, loadSubjects])

  const deleteSubject = useCallback(async (id: number) => {
    if (!userId) throw new Error("로그인이 필요합니다.")
    
    try {
      console.log('🗑️ 과목 삭제 시도:', id)
      setIsLoading(true)
      
      const { error } = await supabase
        .from("subjects")
        .delete()
        .eq("id", id)
        .eq("user_id", userId)
      
      if (error) {
        console.error('❌ 과목 삭제 에러:', error)
        throw error
      }
      
      console.log('✅ 과목 삭제 성공')
      await loadSubjects(userId)
    } catch (error) {
      console.error('💥 과목 삭제 실패:', error)
      throw new Error("과목 삭제 중 오류가 발생했습니다.")
    } finally {
      setIsLoading(false)
    }
  }, [userId, loadSubjects])


  useEffect(() => {
    if (userId) {
      loadSubjects(userId);
    }
  }, [userId, loadSubjects]);
  
  return {
    subjects,
    isLoading,
    loadSubjects,
    addSubject,
    updateSubject,
    deleteSubject
  }
} 