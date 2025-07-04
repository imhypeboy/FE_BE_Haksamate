"use client"

import React, { useState, useCallback, useEffect, useRef } from "react"
import { useKakaoMap } from "@/hooks/useKakaoMap"
import { useGeolocation } from "../hooks/useGeolocation"
import { useAuth } from "@/hooks/useAuth"
import { ApiKeyErrorDisplay } from "./ApiKeyErrorDisplay"
import { LocationPermissionRequest } from "./LocationPermissionRequest"
import { LoadingDisplay } from "./LoadingDisplay"
import { LocationDeniedDisplay } from "./LocationDeniedDisplay"
import { MapContainer } from "./MapContainer"
import { LocationSharingControls } from "./LocationSharingControls"
import type { LocationData } from "../hooks/useLocationShare"

interface NearbyMatchingProps {
  isDarkMode: boolean
}

const NearbyMatching = React.memo(({ isDarkMode }: NearbyMatchingProps) => {
  // 상태 관리
  const [isHovered, setIsHovered] = useState(false)
  const [realTimeUsers, setRealTimeUsers] = useState<LocationData[]>([])
  const [mapLoaded, setMapLoaded] = useState(false)

  // ref 관리
  const mapRef = useRef<any>(null)
  const markersRef = useRef<Map<string, any>>(new Map())

  // 커스텀 훅 사용
  const { kakaoLoaded, sdkError, apiKeyError, loadingMessage } = useKakaoMap()
  const { locationPermission, currentLocation, requestLocation } = useGeolocation()
  const { user } = useAuth()

  // 실시간 사용자 위치 업데이트 핸들러
  const handleNearbyUsersUpdate = useCallback((users: LocationData[]) => {
    console.log("📍 NearbyMatching - 실시간 사용자 업데이트:", users.length, "명")
    setRealTimeUsers(users)
  }, [])

  // 지도 초기화 함수
  const initializeMap = useCallback(
    (lat: number, lng: number) => {
      if (!kakaoLoaded || !window.kakao || !window.kakao.maps) {
        console.error("❌ 카카오맵 SDK가 아직 로드되지 않았습니다.")
        return
      }

      const container = document.getElementById("kakao-map")
      if (!container) {
        console.error("❌ 지도 컨테이너를 찾을 수 없습니다.")
        return
      }

      try {
        console.log("🗺️ 지도 초기화 시작:", {
          lat,
          lng,
          realTimeUsers: realTimeUsers.length,
        })

        const options = {
          center: new window.kakao.maps.LatLng(lat, lng),
          level: 3,
        }

        const kakaoMap = new window.kakao.maps.Map(container, options)
        mapRef.current = kakaoMap

        // 기존 마커들 정리
        markersRef.current.forEach((marker) => marker.setMap(null))
        markersRef.current.clear()

        // 현재 위치 마커 생성
        const currentMarkerImage = new window.kakao.maps.MarkerImage(
          "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_red.png",
          new window.kakao.maps.Size(24, 35),
        )

        const currentMarker = new window.kakao.maps.Marker({
          position: new window.kakao.maps.LatLng(lat, lng),
          image: currentMarkerImage,
          map: kakaoMap,
        })

        markersRef.current.set("current", currentMarker)

        // 현재 위치 인포윈도우
        const currentInfoWindow = new window.kakao.maps.InfoWindow({
          content: '<div style="padding:5px;font-size:12px;color:#000;">📍 현재 위치</div>',
        })

        currentInfoWindow.open(kakaoMap, currentMarker)

        // 실시간 사용자 마커들 추가
        console.log("🗺️ 실시간 사용자 마커 추가:", realTimeUsers.length, "개")

        realTimeUsers.forEach((user) => {
          // 자신 제외
          if (user.userId === user?.id?.toString()) {
            console.log("🗺️ 자신의 마커는 제외:", user.userName)
            return
          }

          const userMarkerImage = new window.kakao.maps.MarkerImage(
            user.status === "online"
              ? "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_blue.png"
              : "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/marker_grey.png",
            new window.kakao.maps.Size(24, 35),
          )

          const userMarker = new window.kakao.maps.Marker({
            position: new window.kakao.maps.LatLng(user.latitude, user.longitude),
            image: userMarkerImage,
            map: kakaoMap,
          })

          markersRef.current.set(`realtime-${user.userId}`, userMarker)

          const userInfoWindow = new window.kakao.maps.InfoWindow({
            content: `<div style="padding:5px;font-size:12px;color:#000;">
              👤 ${user.userName}<br/>
              <span style="color:${user.status === "online" ? "green" : "gray"};">
                ${user.status === "online" ? "🟢 온라인" : "⚫ 오프라인"}
              </span>
            </div>`,
          })

          // 마커 클릭 이벤트
          window.kakao.maps.event.addListener(userMarker, "click", () => {
            userInfoWindow.open(kakaoMap, userMarker)
          })

          console.log("🗺️ 실시간 사용자 마커 추가됨:", user.userName)
        })

        setMapLoaded(true)
        console.log("✅ 지도 초기화 완료! 총 마커:", markersRef.current.size, "개")
      } catch (error) {
        console.error("❌ 지도 초기화 중 오류:", error)
      }
    },
    [kakaoLoaded, realTimeUsers, user],
  )

  // 위치 권한 요청 및 지도 초기화
  const handleLocationRequest = useCallback(async () => {
    if (!kakaoLoaded) {
      return
    }

    const success = await requestLocation()
    console.log("📍 위치 권한 요청 결과:", success)
  }, [kakaoLoaded, requestLocation])

  // 실시간 사용자 변경 시 지도 업데이트
  useEffect(() => {
    if (kakaoLoaded && locationPermission === "granted" && currentLocation && mapLoaded) {
      console.log("🔄 실시간 사용자 변경으로 지도 업데이트 - 실시간 사용자:", realTimeUsers.length, "명")
      initializeMap(currentLocation.lat, currentLocation.lng)
    }
  }, [realTimeUsers, kakaoLoaded, locationPermission, currentLocation, mapLoaded, initializeMap])

  // 카카오맵 로드 및 위치 권한 확인 시 지도 초기화
  useEffect(() => {
    if (kakaoLoaded && locationPermission === "granted" && currentLocation) {
      console.log("🔄 초기 지도 설정")
      setTimeout(() => {
        initializeMap(currentLocation.lat, currentLocation.lng)
      }, 500)
    }
  }, [kakaoLoaded, locationPermission, currentLocation, initializeMap])

  // 에러 상태 처리
  if (sdkError || apiKeyError) {
    return <ApiKeyErrorDisplay isDarkMode={isDarkMode} sdkError={sdkError} apiKeyError={apiKeyError} />
  }

  // 위치 권한 요청 상태
  if (locationPermission === "prompt") {
    return (
      <LocationPermissionRequest
        isDarkMode={isDarkMode}
        kakaoLoaded={kakaoLoaded}
        loadingMessage={loadingMessage}
        onLocationRequest={handleLocationRequest}
        isHovered={isHovered}
        setIsHovered={setIsHovered}
      />
    )
  }

  // 로딩 상태
  if (locationPermission === "loading") {
    return <LoadingDisplay isDarkMode={isDarkMode} />
  }

  // 위치 권한 거부 상태
  if (locationPermission === "denied") {
    return <LocationDeniedDisplay isDarkMode={isDarkMode} onRetry={handleLocationRequest} />
  }

  // 메인 렌더링
  return (
    <div className="relative w-full max-w-sm lg:max-w-none mx-auto space-y-4">
      {/* 실시간 위치 공유 컨트롤 */}
      <LocationSharingControls
        userId={user?.id?.toString()}
        isDarkMode={isDarkMode}
        onNearbyUsersUpdate={handleNearbyUsersUpdate}
      />

      {/* 지도 컨테이너 */}
      <MapContainer
        isDarkMode={isDarkMode}
        mapLoaded={mapLoaded}
        nearbyUsers={realTimeUsers.map((u) => ({
          id: Number.parseInt(u.userId) || 0,
          name: u.userName,
          age: 0,
          mbti: "",
          nickname: u.userName,
          tags: [],
          description: `실시간 사용자 (${u.status})`,
        }))}
        kakaoLoaded={kakaoLoaded}
        currentLocation={currentLocation}
        onRefresh={() => {
          if (kakaoLoaded && currentLocation) {
            console.log("🔄 지도 새로고침 요청")
            initializeMap(currentLocation.lat, currentLocation.lng)
          }
        }}
      />

      {/* 실시간 사용자 목록 */}
      {realTimeUsers.length > 0 && (
        <div
          className={`rounded-3xl p-4 transition-all duration-700 ease-out ${
            isDarkMode
              ? "bg-gray-800/60 backdrop-blur-xl border border-gray-700/40"
              : "bg-white/90 backdrop-blur-xl border border-gray-200/60"
          } shadow-2xl`}
        >
          <h4 className={`text-sm font-medium mb-3 ${isDarkMode ? "text-white" : "text-gray-800"}`}>
            실시간 위치 공유 중 ({realTimeUsers.length}명)
          </h4>
          <div className="space-y-2">
            {realTimeUsers.map((user) => (
              <div
                key={user.userId}
                className={`flex items-center gap-3 p-2 rounded-lg ${isDarkMode ? "bg-gray-700/30" : "bg-gray-50"}`}
              >
                <div
                  className={`w-2 h-2 rounded-full ${
                    user.status === "online" ? "bg-green-500" : "bg-gray-400"
                  } animate-pulse`}
                />
                <span className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>{user.userName}</span>
                <span className={`text-xs ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                  {new Date(user.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 디버그 정보 (개발 중에만 표시) */}
      {process.env.NODE_ENV === "development" && (
        <div
          className={`text-xs p-2 rounded ${isDarkMode ? "bg-gray-800 text-gray-300" : "bg-gray-100 text-gray-600"}`}
        >
          <div>실시간 사용자: {realTimeUsers.length}명</div>
          <div>지도 로드됨: {mapLoaded ? "✅" : "❌"}</div>
          <div>총 마커: {markersRef.current.size}개</div>
          <div>사용자 ID: {user?.id}</div>
        </div>
      )}
    </div>
  )
})

NearbyMatching.displayName = "NearbyMatching"

export default NearbyMatching
