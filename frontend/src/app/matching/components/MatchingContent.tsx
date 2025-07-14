"use client"

import React from "react"
import ProfileCard from "./ProfileCard"
import ActionButtons from "./ActionButtons"
import type { Profile } from "../types"
import { useLocationShare } from "../hooks/useLocationShare"
import { MapContainer } from "./MapContainer"

interface MatchingContentProps {
  profile: Profile
  isDarkMode: boolean
  exitX: number
  dragX: number
  dragY: number
  rotation: number
  isAnimating: boolean
  isDragging: boolean
  onTouchStart: (e: React.TouchEvent) => void
  onTouchMove: (e: React.TouchEvent) => void
  onTouchEnd: (e: React.TouchEvent) => void
  onMouseDown: (e: React.MouseEvent) => void
  onLike: () => void
  onDislike: () => void
}

const MatchingContent = React.memo(
  ({
    profile,
    isDarkMode,
    exitX,
    dragX,
    dragY,
    rotation,
    isAnimating,
    isDragging,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onMouseDown,
    onLike,
    onDislike,
  }: MatchingContentProps) => {
    // 위치 공유 훅 사용 (profile.id를 userId로 전달)
    const { nearbyUsers, refreshNearbyUsers } = useLocationShare(profile.id)
    // LocationData[] -> Profile[] 변환
    const mappedNearbyUsers = nearbyUsers.map((user) => ({
      id: Number(user.userId) || 0, // string -> number 변환, 실패시 0
      name: user.userName,
      age: 0, // 실제 데이터에 맞게 수정 필요
      mbti: '', // 실제 데이터에 맞게 수정 필요
      nickname: user.userName,
      tags: [], // 실제 데이터에 맞게 수정 필요
      description: '', // 실제 데이터에 맞게 수정 필요
    }))
    // 임시 상태값 (실제 구현에 맞게 수정 필요)
    const mapLoaded = true
    const kakaoLoaded = true
    const currentLocation = null
    const onRefresh = refreshNearbyUsers

    return (
      <div className="relative w-full max-w-sm">
        {/* 지도 영역 */}
        <div className="mb-6">
          <MapContainer
            isDarkMode={isDarkMode}
            mapLoaded={mapLoaded}
            nearbyUsers={mappedNearbyUsers}
            kakaoLoaded={kakaoLoaded}
            currentLocation={currentLocation}
            onRefresh={onRefresh}
          />
        </div>
        {/* Profile Card */}
        <ProfileCard
          profile={profile}
          isDarkMode={isDarkMode}
          exitX={exitX}
          dragX={dragX}
          dragY={dragY}
          rotation={rotation}
          isAnimating={isAnimating}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={onMouseDown}
        />

        {/* Action Buttons */}
        <ActionButtons isDarkMode={isDarkMode} isDragging={isDragging} onLike={onLike} onDislike={onDislike} />

        {/* PC 전용 키보드 단축키 안내 */}
        <div className="hidden lg:block mt-6 text-center">
          <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
            키보드 단축키: ← (거절) / → (좋아요) / ↑ (다시보기) / ↓ (더보기)
          </p>
        </div>
      </div>
    )
  },
)

MatchingContent.displayName = "MatchingContent"

export default MatchingContent
