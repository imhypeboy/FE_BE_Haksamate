"use client"

import React from "react"
import { MapPin, Navigation } from "lucide-react"

interface LocationPermissionRequestProps {
  isDarkMode: boolean
  kakaoLoaded: boolean
  loadingMessage: string
  onLocationRequest: () => void
  isHovered: boolean
  setIsHovered: (hovered: boolean) => void
}

export const LocationPermissionRequest = React.memo(
  ({
    isDarkMode,
    kakaoLoaded,
    loadingMessage,
    onLocationRequest,
    isHovered,
    setIsHovered,
  }: LocationPermissionRequestProps) => {
    return (
      <div className="relative w-full max-w-sm mx-auto">
        <div
          className={`rounded-3xl p-8 text-center transition-all duration-700 ease-out ${
            isDarkMode
              ? "bg-gray-800/60 backdrop-blur-xl border border-gray-700/40"
              : "bg-white/90 backdrop-blur-xl border border-gray-200/60"
          } shadow-2xl hover:shadow-xl`}
        >
          <div className="mb-8">
            <div
              className={`relative w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-6 transition-all duration-700 ease-out ${
                isDarkMode
                  ? "bg-gradient-to-br from-blue-400/20 to-blue-600/20 text-blue-300"
                  : "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-600"
              } shadow-lg hover:shadow-xl hover:scale-105`}
            >
              <MapPin size={36} className="transition-transform duration-500 ease-out" />
              {!kakaoLoaded && (
                <div
                  className={`absolute inset-0 rounded-full animate-pulse ${
                    isDarkMode ? "bg-blue-400/10" : "bg-blue-500/10"
                  }`}
                />
              )}
            </div>
            <h3
              className={`text-2xl font-bold mb-3 transition-colors duration-500 ${
                isDarkMode ? "text-white" : "text-gray-800"
              }`}
            >
              주변 매칭
            </h3>
            <p
              className={`text-sm leading-relaxed transition-colors duration-500 ${
                isDarkMode ? "text-gray-300" : "text-gray-600"
              }`}
            >
              위치 기반으로 근처에 있는
              <br />
              사람들과 매칭해보세요
            </p>
          </div>

          <div className="space-y-4">
            <button
              onClick={onLocationRequest}
              disabled={!kakaoLoaded}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              className={`relative w-full py-4 px-6 rounded-full font-semibold transition-all duration-500 ease-out overflow-hidden ${
                isDarkMode
                  ? "bg-blue-500 hover:bg-blue-400 text-white shadow-lg shadow-blue-500/20 disabled:bg-gray-600 disabled:cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 disabled:bg-gray-400 disabled:cursor-not-allowed"
              } hover:shadow-xl hover:scale-105 active:scale-95 disabled:hover:scale-100`}
            >
              <div className="relative flex items-center justify-center gap-2">
                <Navigation size={18} />
                <span>{kakaoLoaded ? "위치 권한 허용" : "지도 로딩 중..."}</span>
              </div>
            </button>

            <div
              className={`text-xs leading-relaxed transition-colors duration-500 ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              {kakaoLoaded ? (
                <>
                  현재 위치를 기반으로 1km 반경 내<br />
                  사용자들을 찾아드립니다
                </>
              ) : (
                <>
                  {loadingMessage}
                  <br />
                  잠시만 기다려주세요...
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  },
)

LocationPermissionRequest.displayName = "LocationPermissionRequest"
