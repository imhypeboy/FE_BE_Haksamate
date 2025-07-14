"use client"

import { useState, useCallback } from "react"
import { supabase } from "@/lib/supabaseClient"
import type { Profile } from "../types"

export const useProfiles = (currentUserId?: string) => {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  const loadProfiles = useCallback(async () => {
    console.log("📊 프로필 로드 시작, currentUserId:", currentUserId)
    setIsLoading(true)

    try {
      console.log("🔍 profiles 테이블 확인 중...")

      // 기본 컬럼들만 먼저 조회해보기
      let query = supabase.from("profiles").select("*")

      if (currentUserId) {
        query = query.neq("id", currentUserId)
        console.log("🚫 현재 사용자 제외:", currentUserId)
      }

      console.log("📡 프로필 데이터 조회 중...")
      const { data, error } = await query.limit(10) // 일단 10개만

      if (error) {
        console.error("❌ 프로필 데이터 조회 실패:", error)
        throw error
      }

      console.log("📋 조회 결과:", {
        dataExists: !!data,
        dataLength: data?.length || 0,
        firstProfile: data?.[0],
        allColumns: data?.[0] ? Object.keys(data[0]) : [],
      })

      if (data && data.length > 0) {
        // 실제 컬럼에 맞춰서 매핑
        const processedData = data.map((profile) => ({
          id: profile.id,
          name: profile.name || "이름 없음",
          department: profile.department || profile.major || "학과 없음",
          year: profile.year || 1,
          // 가능한 컬럼들 중에서 찾기
          profile:
            profile.description ||
            profile.bio ||
            profile.introduction ||
            profile.about ||
            `${profile.department || "학과"} ${profile.year || 1}학년입니다.`,
        }))

        const shuffledData = processedData.sort(() => Math.random() - 0.5)
        setProfiles(shuffledData)
        console.log("✅ 프로필 로드 성공:", shuffledData.length, "개")
        console.log("🎯 첫 번째 프로필:", shuffledData[0])
      } else {
        console.log("📭 조회된 프로필이 없음")
        setProfiles([])
      }
    } catch (error) {
      console.error("❌ 프로필 로드 실패:", error)
      setProfiles([])
    } finally {
      console.log("🏁 프로필 로딩 완료")
      setIsLoading(false)
    }
  }, [currentUserId])

  const likeProfile = useCallback(
    async (profileId: string) => {
      console.log("❤️ likeProfile 호출됨:", { currentUserId, profileId })

      if (!currentUserId) {
        console.log("⚠️ 현재 사용자 ID가 없음, 랜덤 매칭 결과 반환")
        return Math.random() > 0.7
      }

      if (!profileId) {
        console.error("❌ profileId가 없음!")
        return false
      }

      try {
        console.log("💖 좋아요 처리 시작:", { currentUserId, profileId })

        // user_likes 테이블에서 기존 좋아요 확인
        const { data: existingLike, error: checkError } = await supabase
          .from("user_likes")
          .select("*")
          .eq("liker_id", currentUserId)
          .eq("liked_id", profileId)
          .maybeSingle()

        if (checkError) {
          console.error("❌ 기존 좋아요 확인 실패:", checkError)
          throw checkError
        }

        // 이미 좋아요를 눌렀다면 중복 방지
        if (existingLike) {
          console.log("⚠️ 이미 좋아요를 누른 프로필")
          return false
        }

        // 새로운 좋아요 기록 생성
        const { error: insertError } = await supabase.from("user_likes").insert({
          liker_id: currentUserId,
          liked_id: profileId,
        })

        if (insertError) {
          console.error("❌ 좋아요 삽입 실패:", insertError)
          throw insertError
        }

        console.log("✅ 좋아요 삽입 성공")

        // 상대방이 나를 좋아요 했는지 확인 (매칭 체크)
        const { data: mutualLike, error: mutualError } = await supabase
          .from("user_likes")
          .select("*")
          .eq("liker_id", profileId)
          .eq("liked_id", currentUserId)
          .maybeSingle()

        if (mutualError) {
          console.error("❌ 상호 좋아요 확인 실패:", mutualError)
          return false
        }

        const isMatch = !!mutualLike
        console.log("🎯 매칭 결과:", isMatch)

        return isMatch
      } catch (error) {
        console.error("❌ 좋아요 처리 실패:", error)
        return Math.random() > 0.7
      }
    },
    [currentUserId],
  )

  const getCurrentProfile = useCallback(() => {
    if (profiles.length === 0) {
      console.log("📭 현재 프로필 없음 (profiles 배열이 비어있음)")
      return null
    }
    const current = profiles[currentIndex % profiles.length]
    console.log("🎯 현재 프로필:", current)
    return current
  }, [profiles, currentIndex])

  const nextProfile = useCallback(() => {
    console.log("➡️ 다음 프로필로 이동")
    setCurrentIndex((prev) => prev + 1)
  }, [])

  const previousProfile = useCallback(() => {
    console.log("⬅️ 이전 프로필로 이동")
    setCurrentIndex((prev) => Math.max(0, prev - 1))
  }, [])

  return {
    profiles,
    isLoading,
    currentIndex,
    currentProfile: getCurrentProfile(),
    loadProfiles,
    likeProfile,
    nextProfile,
    previousProfile,
    setCurrentIndex,
  }
}
