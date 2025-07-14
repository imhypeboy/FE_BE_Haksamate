"use client"

import React, { useCallback } from "react"
import SegmentControl from "./SegmentControl"
import MatchingContent from "./MatchingContent"
import NearbyMatching from "./NearbyMatching"
import LikedProfiles from "./LikedProfiles"
import SidePanel from "./SidePanel"
import type { SegmentType, Profile } from "../types"

interface DesktopLayoutProps {
  activeSegment: SegmentType
  onSegmentChange: (segment: SegmentType) => void
  isDarkMode: boolean
  onOpenChat?: (profileId?: string) => void
  // Matching content props
  profile: Profile
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

const DesktopLayout = React.memo(
  ({
    activeSegment,
    onSegmentChange,
    isDarkMode,
    onOpenChat,
    profile,
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
  }: DesktopLayoutProps) => {
    const renderContent = useCallback(() => {
      switch (activeSegment) {
        case "matching":
          return (
            <MatchingContent
              profile={profile}
              isDarkMode={isDarkMode}
              exitX={exitX}
              dragX={dragX}
              dragY={dragY}
              rotation={rotation}
              isAnimating={isAnimating}
              isDragging={isDragging}
              onTouchStart={onTouchStart}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              onMouseDown={onMouseDown}
              onLike={onLike}
              onDislike={onDislike}
            />
          )
        case "nearby":
          return <NearbyMatching isDarkMode={isDarkMode} />
        case "liked":
          return <LikedProfiles isDarkMode={isDarkMode} onOpenChat={onOpenChat} />
        default:
          return null
      }
    }, [
      activeSegment,
      profile,
      isDarkMode,
      onOpenChat,
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
    ])

    return (
      <div className="hidden lg:block relative z-10 flex-1 px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* PC 세그먼트 컨트롤 */}
          <div className="mb-8">
            <SegmentControl activeSegment={activeSegment} onSegmentChange={onSegmentChange} isDarkMode={isDarkMode} />
          </div>

          {/* PC 메인 컨텐츠 */}
          <div className="grid grid-cols-12 gap-8 h-[calc(100vh-200px)]">
            {/* 왼쪽 패널 - 프로필 카드 */}
            <div className="col-span-5 flex items-center justify-center">
              <div className="w-full max-w-md">{renderContent()}</div>
            </div>

            {/* 가운데 구분선 */}
            <div className="col-span-1 flex items-center justify-center">
              <div className={`w-px h-full ${isDarkMode ? "bg-gray-700" : "bg-gray-200"} opacity-50`} />
            </div>

            {/* 오른쪽 패널 - 추가 정보 */}
            <SidePanel isDarkMode={isDarkMode} />
          </div>
        </div>
      </div>
    )
  },
)

DesktopLayout.displayName = "DesktopLayout"

export default DesktopLayout
