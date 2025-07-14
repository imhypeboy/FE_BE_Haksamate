"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabaseClient"

// Components
import AnimatedBackground from "./components/AnimatedBackground"
import Header from "./components/Header"
import DesktopLayout from "./components/DesktopLayout"
import MobileLayout from "./components/MobileLayout"
import MatchSuccessModal from "./components/MatchSuccessModal"

// Sidebar and ChatModal (assuming these exist)
import Sidebar from "../sidebar/sidebar"
import ChatModal from "@/components/ChatModal"

// Hooks
import { useMatchingLogic } from "./hooks/useMatchingLogic"
import { useDragHandlers } from "./hooks/useDragHandlers"
import { useKeyboardShortcuts } from "./hooks/useKeyboardShortcuts"
import { useChatRooms } from "@/hooks/useChat"

// Constants
import { ANIMATION_DURATION } from "./constants"

import "./styles.css"

const MatchingPage: React.FC = () => {
  const router = useRouter()
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [exitX, setExitX] = useState(0)
  const [selectedChatRoomId, setSelectedChatRoomId] = useState<number | null>(null)

  console.log("🚀 MatchingPage 렌더링 시작")

  // Hooks must be called at the top level of the component
  const {
    index,
    showMatch,
    isAnimating,
    activeSegment,
    profile,
    isProfilesLoading,
    user,
    chatModalOpen,
    matchedProfile,
    setIndex,
    setIsAnimating,
    setShowMatch,
    handleLike,
    handleDislike,
    handleSegmentChange,
    handleStartChat,
    handleCloseChatModal,
    setChatModalOpen,
    nextProfile,
  } = useMatchingLogic()

  // 채팅방 관리 훅
  const { createRoom } = useChatRooms(user?.id ?? "")

  console.log("📊 MatchingPage 상태:", {
    isProfilesLoading,
    hasProfile: !!profile,
    hasUser: !!user,
    profileId: profile?.id,
    userId: user?.id,
  })

  const {
    isDragging,
    dragX,
    dragY,
    rotation,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
    resetDragState,
  } = useDragHandlers({
    onLike: handleLike,
    onDislike: handleDislike,
    nextProfile,
    setExitX,
  })

  useKeyboardShortcuts({
    activeSegment,
    chatModalOpen,
    showMatch,
    handleDislike,
    handleLike,
    setIndex,
    setShowMatch,
    setChatModalOpen,
  })

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => !prev)
  }, [])

  // 좋아요한 프로필에서 채팅 시작
  const handleOpenChatFromLiked = useCallback(
    async (profileId: string) => {
      if (!user?.id) {
        console.error("❌ 사용자 정보가 없음")
        return
      }

      try {
        console.log("💬 채팅방 생성/조회 시작:", { userId: user.id, profileId })

        // 기존 채팅방 찾기
        const { data: existingRoom, error: findError } = await supabase
          .from("chat_room")
          .select("chatroomid")
          .or(
            `and(chatusr1_id.eq.${user.id},chatusr2_id.eq.${profileId}),and(chatusr1_id.eq.${profileId},chatusr2_id.eq.${user.id})`,
          )
          .maybeSingle()

        if (findError && findError.code !== "PGRST116") {
          console.error("❌ 기존 채팅방 조회 실패:", findError)
          throw findError
        }

        let roomId = existingRoom?.chatroomid

        if (!roomId) {
          console.log("🆕 새 채팅방 생성")
          // 새 채팅방 생성
          const newRoom = await createRoom(user.id, profileId)
          roomId = newRoom.chatroomId
        } else {
          console.log("✅ 기존 채팅방 발견:", roomId)
        }

        // 채팅 모달 열기
        setSelectedChatRoomId(roomId)
        setChatModalOpen(true)
      } catch (error) {
        console.error("❌ 채팅방 생성/조회 실패:", error)
        // 에러가 있어도 일단 채팅 모달은 열기
        setChatModalOpen(true)
      }
    },
    [user?.id, createRoom, setChatModalOpen],
  )

  // 채팅 모달 닫기 (확장)
  const handleCloseChatModalExtended = useCallback(() => {
    setSelectedChatRoomId(null)
    handleCloseChatModal()
  }, [handleCloseChatModal])

  // 로딩 상태 처리 추가
  const [isAnimatingState, setIsAnimatingState] = useState(false)

  useEffect(() => {
    if (!profile) return

    setIsAnimatingState(true)
    const timer = setTimeout(() => setIsAnimatingState(false), ANIMATION_DURATION)
    return () => clearTimeout(timer)
  }, [index, profile])

  // exitX 리셋 처리
  useEffect(() => {
    if (exitX !== 0) {
      const timer = setTimeout(() => {
        setExitX(0)
        resetDragState()
      }, ANIMATION_DURATION)
      return () => clearTimeout(timer)
    }
  }, [exitX, resetDragState])

  // 로딩 중일 때만 로딩 화면 표시, profile이 없으면 아무것도 렌더링하지 않음
  if (isProfilesLoading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center transition-all duration-700 ${
          isDarkMode
            ? "bg-gradient-to-br from-gray-900 to-gray-800"
            : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
        }`}
      >
        <div className="text-center">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              isDarkMode ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-600"
            }`}
          >
            <div className="w-8 h-8 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </div>
          <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-800"}`}>프로필 로딩 중...</h3>
          <p className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>새로운 사람들을 찾고 있어요</p>
        </div>
      </div>
    )
  }
  if (!profile) {
    return null;
  }

  console.log("✅ 메인 컨텐츠 렌더링")

  return (
    <>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div
        className={`min-h-screen transition-all duration-700 ${
          isDarkMode
            ? "bg-gradient-to-br from-gray-900 to-gray-800"
            : "bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50"
        }`}
      >
        {/* 성능 최적화된 배경 */}
        <AnimatedBackground isDarkMode={isDarkMode} />

        {/* 헤더 */}
        <Header isDarkMode={isDarkMode} onToggleTheme={toggleTheme} onOpenChat={() => setChatModalOpen(true)} />

        {/* PC 버전 레이아웃 */}
        <DesktopLayout
          activeSegment={activeSegment}
          onSegmentChange={handleSegmentChange}
          isDarkMode={isDarkMode}
          onOpenChat={handleOpenChatFromLiked}
          profile={profile}
          exitX={exitX}
          dragX={dragX}
          dragY={dragY}
          rotation={rotation}
          isAnimating={isAnimatingState}
          isDragging={isDragging}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onLike={handleLike}
          onDislike={handleDislike}
        />

        {/* 모바일 버전 레이아웃 */}
        <MobileLayout
          activeSegment={activeSegment}
          onSegmentChange={handleSegmentChange}
          isDarkMode={isDarkMode}
          onOpenChat={handleOpenChatFromLiked}
          profile={profile}
          exitX={exitX}
          dragX={dragX}
          dragY={dragY}
          rotation={rotation}
          isAnimating={isAnimatingState}
          isDragging={isDragging}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onLike={handleLike}
          onDislike={handleDislike}
        />

        {/* Match Success Modal */}
        <MatchSuccessModal
          isOpen={showMatch}
          profile={matchedProfile}
          isDarkMode={isDarkMode}
          onClose={() => setShowMatch(false)}
          onStartChat={handleStartChat}
        />

        {/* Chat Modal - 실제 채팅방 ID와 함께 */}
        {chatModalOpen && selectedChatRoomId && (
          <ChatModal
            isOpen={chatModalOpen}
            onClose={handleCloseChatModalExtended}
            initialRoomId={selectedChatRoomId}
            isDarkMode={isDarkMode}
          />
        )}
      </div>
    </>
  )
}

export default MatchingPage
