"use client"

import React, { useCallback } from "react"
import SegmentControl from "./SegmentControl"
import MatchingContent from "./MatchingContent"
import NearbyMatching from "./NearbyMatching"
import LikedProfiles from "./LikedProfiles"
import type { SegmentType, Profile } from "../types"

interface MobileLayoutProps {
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

const MobileLayout = React.memo(
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
  }: MobileLayoutProps) => {
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
      <div className="lg:hidden">
        {/* 세그먼트 컨트롤 */}
        <SegmentControl activeSegment={activeSegment} onSegmentChange={onSegmentChange} isDarkMode={isDarkMode} />

        {/* Main Content */}
        <div className="relative z-10 flex-1 flex items-center justify-center p-6 pt-2">{renderContent()}</div>
      </div>
    )
  },
)

MobileLayout.displayName = "MobileLayout"

export default MobileLayout
