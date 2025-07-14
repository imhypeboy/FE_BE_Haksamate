"use client"

import React, { useMemo } from "react"
import { Heart, X, User, MapPin } from "lucide-react"
import type { Profile } from "../types"
import { ANIMATION_DURATION } from "../constants"

interface ProfileCardProps {
  profile: Profile
  isDarkMode: boolean
  exitX: number
  dragX: number
  dragY: number
  rotation: number
  isAnimating: boolean
  onTouchStart: (e: React.TouchEvent) => void
  onTouchMove: (e: React.TouchEvent) => void
  onTouchEnd: (e: React.TouchEvent) => void
  onMouseDown: (e: React.MouseEvent) => void
}

const ProfileCard = React.memo(
  ({
    profile,
    isDarkMode,
    exitX,
    dragX,
    dragY,
    rotation,
    isAnimating,
    onTouchStart,
    onTouchMove,
    onTouchEnd,
    onMouseDown,
  }: ProfileCardProps) => {
    const cardStyle = useMemo(
      () => ({
        transform: `translateX(${exitX + dragX}px) translateY(${dragY}px) rotate(${rotation}deg) ${isAnimating ? "scale(0.95)" : "scale(1)"}`,
        transition:
          exitX !== 0
            ? `transform ${ANIMATION_DURATION}ms cubic-bezier(0.175, 0.885, 0.32, 1.275)`
            : isAnimating
              ? "all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)"
              : "transform 0.1s ease-out",
        willChange: "transform",
        backfaceVisibility: "hidden" as const,
        perspective: "1000px",
        userSelect: "none" as const,
        WebkitUserSelect: "none" as const,
        MozUserSelect: "none" as const,
        msUserSelect: "none" as const,
        touchAction: "none" as const, // 터치 액션 방지
        WebkitTouchCallout: "none" as const, // iOS 길게 누르기 방지
      }),
      [exitX, dragX, dragY, rotation, isAnimating],
    )

    const overlayOpacity = Math.abs(dragX) > 50 ? Math.min(Math.abs(dragX) / 150, 0.9) : 0

    return (
      <div
        className={`relative w-full rounded-3xl p-8 cursor-grab active:cursor-grabbing touch-none select-none ${
          isDarkMode
            ? "bg-white/10 backdrop-blur-2xl border border-white/20"
            : "bg-white/90 backdrop-blur-2xl border border-white/60"
        } shadow-2xl hover:shadow-3xl transition-shadow duration-300`}
        style={cardStyle}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onMouseDown={onMouseDown}
        onDragStart={(e) => e.preventDefault()}
        onContextMenu={(e) => e.preventDefault()}
      >
        {/* Enhanced Overlay Icons with Glow Effect */}
        {dragX > 50 && (
          <div
            className="absolute top-6 right-6 text-pink-500 pointer-events-none transition-opacity duration-200"
            style={{ opacity: overlayOpacity }}
          >
            <div className="relative">
              <Heart size={80} fill="currentColor" className="drop-shadow-2xl animate-pulse" />
              <div className="absolute inset-0 bg-pink-400 rounded-full blur-3xl opacity-60 animate-ping" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-bold text-lg">
                LIKE!
              </div>
            </div>
          </div>
        )}

        {dragX < -50 && (
          <div
            className="absolute top-6 left-6 text-red-500 pointer-events-none transition-opacity duration-200"
            style={{ opacity: overlayOpacity }}
          >
            <div className="relative">
              <X size={80} className="drop-shadow-2xl animate-pulse" />
              <div className="absolute inset-0 bg-red-400 rounded-full blur-3xl opacity-60 animate-ping" />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white font-bold text-lg">
                NOPE!
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Avatar with Animated Border */}
        <div className="relative mx-auto mb-6 w-fit">
          <div
            className={`w-36 h-36 rounded-full p-1 relative ${
              isDarkMode
                ? "bg-gradient-to-br from-gray-600 to-gray-500"
                : "bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500"
            }`}
          >
            <div
              className={`w-full h-full rounded-full flex items-center justify-center ${
                isDarkMode ? "bg-gray-800" : "bg-white"
              } relative overflow-hidden`}
            >
              <User size={52} className={isDarkMode ? "text-gray-300" : "text-gray-600"} />

              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 animate-shimmer" />
            </div>
          </div>

          {/* Online Status with Pulse */}
          <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-400 rounded-full border-4 border-white shadow-lg">
            <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75" />
          </div>
        </div>

        {/* Enhanced Profile Info */}
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <h2 className={`text-2xl font-bold mb-1 ${isDarkMode ? "text-white" : "text-gray-800"} tracking-tight`}>
              {profile.name}
            </h2>
            <div className="flex items-center justify-center gap-2 text-sm">
              <MapPin size={14} className={isDarkMode ? "text-gray-400" : "text-gray-500"} />
              <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                {profile.department} {profile.year}학년
              </span>
            </div>
          </div>

          {/* Enhanced Description */}
          <div
            className={`text-sm leading-relaxed p-4 rounded-2xl transition-all duration-300 ${
              isDarkMode
                ? "bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10"
                : "bg-gray-50/80 text-gray-600 border border-gray-100 hover:bg-gray-100/80"
            }`}
          >
            {profile.profile}
          </div>
        </div>
      </div>
    )
  },
)

ProfileCard.displayName = "ProfileCard"

export default ProfileCard
