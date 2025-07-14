"use client"

import { useState, useCallback, useEffect } from "react"
import type { SegmentType } from "../types"
import { SWIPE_VELOCITY, ANIMATION_DURATION } from "../constants"
import { useProfiles } from "./useProfiles"
import { useAuth } from "../../../hooks/useAuth"
import { supabase } from "@/lib/supabaseClient"

export const useMatchingLogic = () => {
  const { user } = useAuth() // 현재 로그인한 사용자 정보

  const {
    currentProfile: profile,
    currentIndex: index,
    isLoading: isProfilesLoading,
    loadProfiles,
    likeProfile,
    nextProfile: moveToNextProfile,
    previousProfile,
    setCurrentIndex: setIndex,
  } = useProfiles(user?.id) // 현재 사용자 ID 전달

  // 기존 상태들
  const [exitX, setExitX] = useState(0)
  const [showMatch, setShowMatch] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [activeSegment, setActiveSegment] = useState<SegmentType>("matching")
  const [chatModalOpen, setChatModalOpen] = useState(false)
  const [matchedProfile, setMatchedProfile] = useState<typeof profile>(null)

  // 프로필 로드
  useEffect(() => {
    if (user?.id) {
      loadProfiles()
    }
  }, [user?.id, loadProfiles])

  const handleLike = useCallback(async () => {
    if (!profile || !user?.id) {
      console.log("프로필 또는 사용자 정보가 없음:", { profile, userId: user?.id })
      return
    }

    console.log("좋아요 처리:", { profileId: profile.id, userId: user.id })

    setExitX(SWIPE_VELOCITY)

    // 실제 좋아요 처리
    const isMatch = await likeProfile(profile.id)

    setTimeout(async () => {
      if (isMatch) {
        // 매칭 성공 시 매칭된 프로필 저장
        setMatchedProfile(profile)
        setShowMatch(true)
      }
      moveToNextProfile()
    }, ANIMATION_DURATION)
  }, [profile, user?.id, likeProfile, moveToNextProfile])

  const handleDislike = useCallback(() => {
    if (!profile) {
      console.log("프로필이 없어서 dislike 처리 불가")
      return
    }

    console.log("싫어요 처리:", { profileId: profile.id })
    setExitX(-SWIPE_VELOCITY)
    setTimeout(moveToNextProfile, ANIMATION_DURATION)
  }, [profile, moveToNextProfile])

  const handleSegmentChange = useCallback((segment: SegmentType) => {
    setActiveSegment(segment)
  }, [])

  // 매칭 성공 모달에서 채팅 시작 버튼 클릭 시
  const handleStartChat = useCallback(async () => {
    if (!matchedProfile || !user?.id) {
      console.error("매칭된 프로필 또는 사용자 정보가 없음")
      return
    }

    try {
      // 채팅방 생성 또는 기존 채팅방 찾기
      const { data: existingRoom, error: findError } = await supabase
        .from("chat_rooms")
        .select("id")
        .or(
          `and(user1_id.eq.${user.id},user2_id.eq.${matchedProfile.id}),and(user1_id.eq.${matchedProfile.id},user2_id.eq.${user.id})`,
        )
        .maybeSingle()

      if (findError && findError.code !== "PGRST116") {
        console.error("기존 채팅방 조회 실패:", findError)
        throw findError
      }

      let roomId = existingRoom?.id

      if (!roomId) {
        // 새 채팅방 생성
        const { data: newRoom, error: createError } = await supabase
          .from("chat_rooms")
          .insert({
            user1_id: user.id,
            user2_id: matchedProfile.id,
          })
          .select("id")
          .single()

        if (createError) {
          console.error("채팅방 생성 실패:", createError)
          throw createError
        }

        roomId = newRoom.id
      }

      console.log("채팅방 ID:", roomId)

      // 매칭 모달 닫고 채팅 모달 열기
      setShowMatch(false)
      setChatModalOpen(true)
    } catch (error) {
      console.error("채팅방 생성/조회 실패:", error)
      // 에러가 있어도 일단 채팅 모달은 열기
      setShowMatch(false)
      setChatModalOpen(true)
    }
  }, [matchedProfile, user?.id])

  // 채팅 모달 닫기
  const handleCloseChatModal = useCallback(() => {
    setChatModalOpen(false)
    setMatchedProfile(null)
  }, [])

  return {
    // State
    index,
    exitX,
    showMatch,
    isAnimating,
    activeSegment,
    profile,
    isProfilesLoading,
    user,
    chatModalOpen,
    matchedProfile,

    // Actions
    setIndex,
    setIsAnimating,
    setShowMatch,
    handleLike,
    handleDislike,
    handleSegmentChange,
    handleStartChat,
    handleCloseChatModal,
    setChatModalOpen,
    nextProfile: moveToNextProfile,
    previousProfile,
    loadProfiles,
  }
}
