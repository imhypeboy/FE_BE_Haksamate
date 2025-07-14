"use client"

import { useState, useCallback, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import type { Profile } from "../types"

export const useLikedProfiles = (currentUserId?: string) => {
  const [likedProfiles, setLikedProfiles] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const loadLikedProfiles = useCallback(async () => {
    if (!currentUserId) {
      console.log("⚠️ 현재 사용자 ID가 없음")
      setLikedProfiles([])
      return
    }

    console.log("💖 좋아요한 프로필 로드 시작, userId:", currentUserId)
    setIsLoading(true)

    try {
      // user_likes 테이블에서 내가 좋아요한 사람들의 ID 가져오기
      const { data: likes, error: likesError } = await supabase
        .from("user_likes")
        .select("liked_id")
        .eq("liker_id", currentUserId)

      if (likesError) {
        console.error("❌ 좋아요 목록 조회 실패:", likesError)
        throw likesError
      }

      console.log("📋 좋아요 목록:", likes)

      if (!likes || likes.length === 0) {
        console.log("📭 좋아요한 프로필이 없음")
        setLikedProfiles([])
        return
      }

      // 좋아요한 사람들의 프로필 정보 가져오기
      const likedUserIds = likes.map((like) => like.liked_id)

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("id", likedUserIds)

      if (profilesError) {
        console.error("❌ 프로필 정보 조회 실패:", profilesError)
        throw profilesError
      }

      console.log("✅ 좋아요한 프로필 조회 성공:", profiles?.length || 0, "개")

      if (profiles && profiles.length > 0) {
        // 프로필 데이터 매핑
        const processedProfiles = profiles.map((profile) => ({
          id: profile.id,
          name: profile.name || "이름 없음",
          department: profile.department || profile.major || "학과 없음",
          year: profile.year || 1,
          profile:
            profile.description ||
            profile.bio ||
            profile.introduction ||
            profile.about ||
            `${profile.department || "학과"} ${profile.year || 1}학년입니다.`,
        }))

        setLikedProfiles(processedProfiles)
      } else {
        setLikedProfiles([])
      }
    } catch (error) {
      console.error("❌ 좋아요한 프로필 로드 실패:", error)
      setLikedProfiles([])
    } finally {
      setIsLoading(false)
    }
  }, [currentUserId])

  // 좋아요 취소 기능
  const unlikeProfile = useCallback(
    async (profileId: string) => {
      if (!currentUserId) return false

      try {
        console.log("💔 좋아요 취소:", { currentUserId, profileId })

        const { error } = await supabase
          .from("user_likes")
          .delete()
          .eq("liker_id", currentUserId)
          .eq("liked_id", profileId)

        if (error) {
          console.error("❌ 좋아요 취소 실패:", error)
          throw error
        }

        console.log("✅ 좋아요 취소 성공")

        // 로컬 상태에서도 제거
        setLikedProfiles((prev) => prev.filter((profile) => profile.id !== profileId))

        return true
      } catch (error) {
        console.error("❌ 좋아요 취소 실패:", error)
        return false
      }
    },
    [currentUserId],
  )

  // 상호 좋아요 확인 (매칭된 사람들)
  const checkMutualLikes = useCallback(async () => {
    if (!currentUserId) return []

    try {
      // 1단계: 내가 좋아요한 사람들의 ID 가져오기
      const { data: myLikes, error: myLikesError } = await supabase
        .from("user_likes")
        .select("liked_id")
        .eq("liker_id", currentUserId)

      if (myLikesError) throw myLikesError
      if (!myLikes || myLikes.length === 0) return []

      const myLikedIds = myLikes.map((like) => like.liked_id)

      // 2단계: 그 사람들 중에서 나를 좋아요한 사람들 찾기 (상호 좋아요)
      const { data: mutualLikes, error: mutualError } = await supabase
        .from("user_likes")
        .select(`
        liker_id,
        profiles:liker_id (
          id,
          name,
          department,
          year
        )
      `)
        .eq("liked_id", currentUserId)
        .in("liker_id", myLikedIds)

      if (mutualError) throw mutualError

      return mutualLikes || []
    } catch (error) {
      console.error("❌ 상호 좋아요 확인 실패:", error)
      return []
    }
  }, [currentUserId])

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (currentUserId) {
      loadLikedProfiles()
    }
  }, [currentUserId, loadLikedProfiles])

  return {
    likedProfiles,
    isLoading,
    loadLikedProfiles,
    unlikeProfile,
    checkMutualLikes,
  }
}
