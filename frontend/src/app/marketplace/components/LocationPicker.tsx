"use client"
import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { MdLocationOn, MdSearch, MdClose } from "react-icons/md"

interface LocationPickerProps {
  onLocationSelect: (location: { address: string; lat: number; lng: number }) => void
  initialLocation?:  {address: string; lat: number; lng: number}
  isDarkMode: boolean
  kakaoMapState: {
    kakaoLoaded: boolean
    sdkError: string | null
    apiKeyError: string | null
    loadingMessage: string
    apiKey: string | null
  }
}

const LocationPicker: React.FC<LocationPickerProps> = ({
  onLocationSelect,
  initialLocation = {
    address:"",
    lat:0,
    lng:0
  },
  isDarkMode,
  kakaoMapState,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string
    lat: number
    lng: number
  }>(initialLocation)
  const [map, setMap] = useState<any>(null)
  const [marker, setMarker] = useState<any>(null)
  const [isMapInitialized, setIsMapInitialized] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)

  const { kakaoLoaded, sdkError, apiKeyError, loadingMessage } = kakaoMapState

  // 지도 초기화 함수
  const initializeMap = useCallback(async () => {
    console.log("🔍 지도 초기화 조건 체크:", {
      mapRefCurrent: !!mapRef.current,
      windowKakao: !!window.kakao,
      windowKakaoMaps: !!window.kakao?.maps,
      kakaoLoaded,
    })

    if (!mapRef.current) {
      const error = "지도 컨테이너(mapRef.current)가 없습니다"
      console.error("❌", error)
      setMapError(error)
      return
    }

    if (!window.kakao?.maps) {
      const error = "window.kakao.maps가 없습니다"
      console.error("❌", error)
      setMapError(error)
      return
    }

    if (!kakaoLoaded) {
      const error = "kakaoLoaded가 false입니다"
      console.error("❌", error)
      setMapError(error)
      return
    }

    try {
      // DOM이 완전히 렌더링될 때까지 대기
      await new Promise((resolve) => setTimeout(resolve, 300))

      const container = mapRef.current
      console.log("📦 지도 컨테이너 정보:", {
        offsetWidth: container.offsetWidth,
        offsetHeight: container.offsetHeight,
        clientWidth: container.clientWidth,
        clientHeight: container.clientHeight,
      })

      // 컨테이너 크기 확인
      if (container.offsetWidth === 0 || container.offsetHeight === 0) {
        const error = `지도 컨테이너 크기가 0입니다: ${container.offsetWidth}x${container.offsetHeight}`
        console.error("❌", error)
        setMapError(error)
        return
      }

      const options = {
        center: new window.kakao.maps.LatLng(37.5665, 126.978), // 서울 시청
        level: 3,
      }

      console.log("🗺️ 지도 초기화 시작")
      const mapInstance = new window.kakao.maps.Map(container, options)

      // 지도 객체 확인
      console.log("🗺️ 지도 인스턴스:", mapInstance)

      setMap(mapInstance)
      setIsMapInitialized(true)
      setMapError(null)
      console.log("✅ 지도 초기화 완료")

      // 지도가 완전히 로드될 때까지 대기
      setTimeout(() => {
        try {
          mapInstance.relayout()
          console.log("🔄 지도 레이아웃 재조정 완료")
        } catch (error) {
          console.warn("⚠️ 지도 레이아웃 재조정 실패:", error)
        }
      }, 100)

      // 지도 클릭 이벤트
      window.kakao.maps.event.addListener(mapInstance, "click", (mouseEvent: any) => {
        const latlng = mouseEvent.latLng
        console.log("📍 지도 클릭:", latlng.getLat(), latlng.getLng())

        // 기존 마커 제거
        if (marker) {
          marker.setMap(null)
        }

        // 새 마커 생성
        const newMarker = new window.kakao.maps.Marker({
          position: latlng,
        })
        newMarker.setMap(mapInstance)
        setMarker(newMarker)

        // 좌표를 주소로 변환
        const geocoder = new window.kakao.maps.services.Geocoder()
        geocoder.coord2Address(latlng.getLng(), latlng.getLat(), (result: any, status: any) => {
          if (status === window.kakao.maps.services.Status.OK) {
            const address = result[0].address.address_name
            console.log("🏠 주소 변환 완료:", address)
            setSelectedLocation({
              address: address,
              lat: latlng.getLat(),
              lng: latlng.getLng(),
            })
          } else {
            console.warn("주소 변환 실패:", status)
          }
        })
      })
    } catch (error) {
      const errorMessage = `지도 초기화 중 오류: ${error}`
      console.error("❌", errorMessage)
      setMapError(errorMessage)
    }
  }, [kakaoLoaded, marker])

  // 모달이 열릴 때 지도 초기화
  useEffect(() => {
    if (!isOpen || !kakaoLoaded || isMapInitialized) return

    console.log("🚀 지도 초기화 준비:", { isOpen, kakaoLoaded, isMapInitialized })

    const timer = setTimeout(() => {
      initializeMap()
    }, 600) // 모달 애니메이션 완료 후 초기화

    return () => clearTimeout(timer)
  }, [isOpen, kakaoLoaded, isMapInitialized, initializeMap])

  // 모달이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      console.log("🧹 지도 상태 초기화")
      setIsMapInitialized(false)
      setMap(null)
      setMapError(null)
      if (marker) {
        marker.setMap(null)
        setMarker(null)
      }
    }
  }, [isOpen, marker])

  const handleSearch = useCallback(() => {
    if (!searchQuery.trim() || !map || !window.kakao?.maps) {
      console.warn("검색 조건 미충족:", { searchQuery: searchQuery.trim(), map: !!map, kakao: !!window.kakao?.maps })
      return
    }

    console.log("🔍 장소 검색:", searchQuery)
    const places = new window.kakao.maps.services.Places()

    places.keywordSearch(searchQuery, (data: any, status: any) => {
      console.log("검색 결과:", { status, dataLength: data?.length })

      if (status === window.kakao.maps.services.Status.OK && data.length > 0) {
        const place = data[0]
        const coords = new window.kakao.maps.LatLng(place.y, place.x)

        console.log("📍 검색된 장소:", place.place_name, coords)
        map.setCenter(coords)

        // 기존 마커 제거
        if (marker) {
          marker.setMap(null)
        }

        // 새 마커 생성
        const newMarker = new window.kakao.maps.Marker({ position: coords })
        newMarker.setMap(map)
        setMarker(newMarker)

        setSelectedLocation({
          address: place.address_name || place.road_address_name || place.place_name,
          lat: parseFloat(place.y),
          lng: parseFloat(place.x),
        })
      } else {
        alert("검색 결과가 없습니다.")
      }
    })
  }, [searchQuery, map, marker])

  const handleConfirm = useCallback(() => {
    if (selectedLocation) {
      console.log("✅ 위치 선택 완료:", selectedLocation)
      onLocationSelect(selectedLocation)
      setIsOpen(false)
    }
  }, [selectedLocation, onLocationSelect])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    setSearchQuery("")
  }, [])

  // 에러 메시지 표시
  const getErrorMessage = () => {
    if (mapError) return mapError
    if (apiKeyError) return apiKeyError
    if (sdkError) return sdkError
    return null
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`w-full p-3 rounded-lg border text-left transition-colors ${
          selectedLocation
            ? isDarkMode
              ? "border-orange-500 bg-orange-900/20 text-orange-400"
              : "border-orange-300 bg-orange-50 text-orange-600"
            : isDarkMode
              ? "border-gray-600 bg-gray-700 text-gray-400 hover:border-gray-500"
              : "border-gray-300 bg-white text-gray-500 hover:border-gray-400"
        }`}
      >
        <div className="flex items-center">
          <MdLocationOn size={20} className="mr-2" />
          {selectedLocation.address || "거래 위치를 선택해주세요"}
        </div>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div
            className={`w-full max-w-4xl h-[80vh] rounded-2xl shadow-xl overflow-hidden ${
              isDarkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            {!kakaoLoaded ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                  <div className={`text-lg ${isDarkMode ? "text-white" : "text-gray-700"}`}>{loadingMessage}</div>
                  {getErrorMessage() && <div className="text-red-500 text-sm max-w-md">{getErrorMessage()}</div>}
                </div>
              </div>
            ) : (
              <>
                {/* 헤더 */}
                <div className={`p-4 border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className={`text-lg font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>
                      거래 위치 선택
                    </h3>
                    <button
                      onClick={handleClose}
                      className={`p-2 rounded-lg transition-colors ${
                        isDarkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-500"
                      }`}
                    >
                      <MdClose size={20} />
                    </button>
                  </div>

                  {/* 검색바 */}
                  <div className="flex space-x-2">
                    <div className="flex-1 relative">
                      <MdSearch
                        className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                          isDarkMode ? "text-gray-400" : "text-gray-500"
                        }`}
                        size={20}
                      />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                        placeholder="장소를 검색해주세요"
                        className={`w-full pl-10 pr-4 py-2 rounded-lg border transition-colors ${
                          isDarkMode
                            ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                            : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
                        }`}
                      />
                    </div>
                    <button
                      onClick={handleSearch}
                      disabled={!searchQuery.trim()}
                      className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      검색
                    </button>
                  </div>
                </div>

                {/* 지도 */}
                <div className="flex-1 relative">
                  {/* 지도 컨테이너 - 명시적 크기 설정 */}
                  <div
                    ref={mapRef}
                    className="w-full h-full"
                    style={{
                      minHeight: "400px",
                      width: "100%",
                      height: "100%",
                    }}
                  />

                  {/* 로딩 오버레이 */}
                  {!isMapInitialized && !mapError && (
                    <div
                      className={`absolute inset-0 flex items-center justify-center ${
                        isDarkMode ? "bg-gray-700" : "bg-gray-100"
                      }`}
                    >
                      <div className="text-center space-y-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                        <div className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                          지도를 로딩중입니다...
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 에러 오버레이 */}
                  {mapError && (
                    <div
                      className={`absolute inset-0 flex items-center justify-center ${
                        isDarkMode ? "bg-gray-700" : "bg-gray-100"
                      }`}
                    >
                      <div className="text-center space-y-2 p-4">
                        <div className="text-red-500 text-4xl">⚠️</div>
                        <div className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                          지도 로딩 실패
                        </div>
                        <div className="text-red-500 text-xs max-w-md">{mapError}</div>
                        <button
                          onClick={() => {
                            setMapError(null)
                            setIsMapInitialized(false)
                            setTimeout(initializeMap, 100)
                          }}
                          className="mt-2 px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600"
                        >
                          다시 시도
                        </button>
                      </div>
                    </div>
                  )}

                  {/* 선택된 위치 표시 */}
                  {selectedLocation && isMapInitialized && (
                    <div
                      className={`absolute bottom-4 left-4 right-4 p-3 rounded-lg shadow-lg ${
                        isDarkMode ? "bg-gray-700 text-white" : "bg-white text-gray-900"
                      }`}
                    >
                      <div className="flex items-center">
                        <MdLocationOn className="text-orange-500 mr-2" size={20} />
                        <span className="flex-1 text-sm">{selectedLocation.address}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 버튼 */}
                <div className={`p-4 border-t ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                  <div className="flex space-x-4">
                    <button
                      onClick={handleClose}
                      className={`flex-1 py-2 rounded-lg border transition-colors ${
                        isDarkMode
                          ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      취소
                    </button>
                    <button
                      onClick={handleConfirm}
                      disabled={!selectedLocation}
                      className="flex-1 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      선택 완료
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default LocationPicker
