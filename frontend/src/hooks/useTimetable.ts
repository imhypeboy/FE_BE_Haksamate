import { useState, useCallback, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { showToast } from '@/app/components/toast'
import type { Subject } from './useSubjects'

export interface TimetableSlot {
  dayofweek: string
  starttime: string
  endtime: string
  subject: Subject
}

export interface TimetableData {
  slots: TimetableSlot[]
}

export const useTimetable = (userId: string | null) => {
  const [timetable, setTimetable] = useState<TimetableSlot[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  /**
   * 최신 시간표 불러오기
   */
  const loadTimetable = useCallback(async (uid: string) => {
    try {
      setIsLoading(true)

      const { data, error } = await supabase
        .from('timetable_slots')
        .select('data')
        .eq('user_id', uid)
        .order('version', { ascending: false })
        .limit(1)
        .single()

      if (error) throw error

      const slots: TimetableSlot[] = data?.data?.slots ?? []
      setTimetable(slots)
    } catch (err) {
      console.error('📥 시간표 로드 실패:', err)
      showToast({
        type: 'error',
        title: '시간표 로드 실패',
        message: '시간표를 불러오는 중 오류가 발생했습니다.',
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  /**
   * 시간표 저장 (버전 증가 방식)
   */
  const saveTimetable = useCallback(
    async (slots: TimetableSlot[]) => {
      if (!userId) throw new Error('로그인이 필요합니다.')

      try {
        setIsSaving(true)

        // 현재 최대 버전 조회
        const { data: latest, error: versionError } = await supabase
          .from('timetable_slots')
          .select('version')
          .eq('user_id', userId)
          .order('version', { ascending: false })
          .limit(1)
          .single()

        if (versionError && versionError.code !== 'PGRST116') throw versionError

        const newVersion = latest?.version ? latest.version + 1 : 1

        const { error: insertError } = await supabase.from('timetable_slots').insert([
          {
            id: Date.now(), // bigint용 ID
            user_id: userId,
            version: newVersion,
            data: { slots }, // JSONB 저장
          },
        ])

        if (insertError) throw insertError

        showToast({
          type: 'success',
          title: '시간표 저장 완료',
          message: `${slots.length}개 슬롯이 저장되었습니다.`,
        })

        await loadTimetable(userId)
      } catch (err) {
        console.error('⛔ 시간표 저장 오류:', err)
        showToast({
          type: 'error',
          title: '시간표 저장 실패',
          message: '저장 중 오류가 발생했습니다.',
        })
        throw err
      } finally {
        setIsSaving(false)
      }
    },
    [userId, loadTimetable]
  )

  // userId 변경 시 자동 로드
  useEffect(() => {
    if (userId) {
      loadTimetable(userId)
    } else {
      setTimetable([])
    }
  }, [userId, loadTimetable])

  return {
    timetable,
    isLoading,
    isSaving,
    loadTimetable,
    saveTimetable,
  }
}
