"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"

export interface TimetableSlot {
  dayofweek: string
  starttime: string
  endtime: string
  subject: {
    id: number
    name: string
    dayofweek: string
    starttime: string
    endtime: string
    required: boolean
    user_id: string
  }
}

export const useSubjectSuggestions = (userId: string | null) => {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!userId) return

      setLoading(true)
      try {
        const { data, error } = await supabase
          .from("timetable_slots")
          .select("data")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(1)
          .single()

        if (error) throw error

        console.log("🔍 Supabase에서 가져온 원본 데이터:", data)

        // 🔥 데이터 구조 안전하게 처리
        let slots: TimetableSlot[] = []

        if (data?.data) {
          console.log("📊 data.data 타입:", typeof data.data)
          console.log("📊 data.data 내용:", data.data)

          // data.data가 배열인지 확인
          if (Array.isArray(data.data)) {
            slots = data.data
            console.log("✅ data.data는 배열입니다")
          }
          // data.data.slots가 배열인지 확인
          else if (data.data.slots && Array.isArray(data.data.slots)) {
            slots = data.data.slots
            console.log("✅ data.data.slots가 배열입니다")
          }
          // data.data가 객체이고 slots 프로퍼티가 있는지 확인
          else if (typeof data.data === "object" && data.data.slots) {
            if (Array.isArray(data.data.slots)) {
              slots = data.data.slots
              console.log("✅ 중첩된 data.data.slots가 배열입니다")
            }
          }
          // 다른 구조일 경우 로그 출력
          else {
            console.warn("⚠️ 예상하지 못한 데이터 구조:", data.data)
            console.warn("⚠️ 데이터 타입:", typeof data.data)
            console.warn("⚠️ 데이터 키들:", Object.keys(data.data || {}))
          }
        }

        console.log("📋 최종 slots 배열:", slots)
        console.log("📋 slots 길이:", slots.length)

        // 배열이 확실한지 다시 한번 체크
        if (Array.isArray(slots) && slots.length > 0) {
          const names = Array.from(new Set(slots.map((s) => s.subject.name))).sort()
          console.log("📚 추출된 과목명들:", names)
          setSuggestions(names)
        } else {
          console.log("📭 시간표 슬롯이 없습니다")
          setSuggestions([])
        }
      } catch (e) {
        console.error("📚 과목 추천 불러오기 실패:", e)
        console.error("📚 에러 상세:", {
          message: e instanceof Error ? e.message : "알 수 없는 오류",
          stack: e instanceof Error ? e.stack : undefined,
        })
        setSuggestions([])
      } finally {
        setLoading(false)
      }
    }

    fetchSuggestions()
  }, [userId])

  return { suggestions, loading }
}
