"use client"

import React from "react"
import { MapPin, RefreshCw } from "lucide-react"

interface Profile {
  id: number
  name: string
  age: number
  mbti: string
  nickname: string
  tags: string[]
  description: string
}

interface Location {
  lat: number
  lng: number
}

interface MapContainerProps {
  isDarkMode: boolean
  mapLoaded: boolean
  nearbyUsers: Profile[]
  kakaoLoaded: boolean
  currentLocation: Location | null
  onRefresh: () => void
}

export const MapContainer = React.memo(
  ({ isDarkMode, mapLoaded, nearbyUsers, kakaoLoaded, currentLocation, onRefresh }: MapContainerProps) => {
    return (
      <div
        className={`rounded-3xl overflow-hidden transition-all duration-700 ease-out ${
          isDarkMode
            ? "bg-gray-800/60 backdrop-blur-xl border border-gray-700/40"
            : "bg-white/90 backdrop-blur-xl border border-gray-200/60"
        } shadow-2xl`}
      >
        <div className="h-64 lg:h-80 relative">
          {!mapLoaded && (
            <div
              className={`absolute inset-0 flex items-center justify-center z-10 ${
                isDarkMode ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <div className="text-center">
                <MapPin
                  size={32}
                  className={`mx-auto mb-2 animate-pulse ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
                />
                <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>지도 초기화 중...</p>
              </div>
            </div>
          )}

          {/* 카카오맵 컨테이너 */}
          <div id="kakao-map" className="w-full h-full" />
        </div>

        {/* 지도 하단 정보 */}
        {/* 아래 정보 영역 전체 삭제 */}
      </div>
    )
  },
)

MapContainer.displayName = "MapContainer"
