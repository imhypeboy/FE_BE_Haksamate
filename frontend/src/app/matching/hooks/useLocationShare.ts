"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Client } from "@stomp/stompjs"

export interface LocationData {
  userId: string
  userName: string
  latitude: number
  longitude: number
  timestamp: string
  status: "online" | "offline" | "away"
  isVisible: boolean
}

const BASE_URL = "http://localhost:8080"
const WS_URL = BASE_URL.replace("http://", "ws://")

export function useLocationShare(userId?: string) {
  const [nearbyUsers, setNearbyUsers] = useState<LocationData[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [isVisible, setIsVisible] = useState(true) // 가시성 상태 추가
  const stompClientRef = useRef<Client | null>(null)
  const locationIntervalRef = useRef<NodeJS.Timeout | null>(null)

  console.log("📍 useLocationShare 호출됨:", { userId, isVisible })

  // WebSocket 연결 설정
  useEffect(() => {
    if (!userId) {
      console.log("⚠️ userId가 없어서 WebSocket 연결 생략")
      return
    }

    console.log("🔌 위치 공유 WebSocket 연결 시작 - 사용자:", userId)

    const stompClient = new Client({
      brokerURL: `${WS_URL}/ws`,
      debug: (str) => console.log("🔌 Location STOMP:", str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: (frame) => {
        console.log("✅ 위치 공유 WebSocket 연결 성공", frame)
        setIsConnected(true)

        // 근처 사용자 위치 구독 (모든 사용자의 위치 업데이트 수신)
        const nearbySubscription = stompClient.subscribe("/topic/location/nearby", (message) => {
          console.log("📍 근처 사용자 위치 수신 원본:", message.body)
          try {
            const locationData: LocationData = JSON.parse(message.body)
            console.log("📍 파싱된 위치 데이터:", locationData)

            // 자신의 위치 정보는 제외
            if (locationData.userId === userId) {
              console.log("🚫 자신의 위치 정보는 제외:", locationData.userName)
              return
            }

            setNearbyUsers((prev) => {
              console.log("📍 현재 근처 사용자 목록:", prev.length, "명")

              if (locationData.status === "offline") {
                // 오프라인 사용자 제거
                const filtered = prev.filter((user) => user.userId !== locationData.userId)
                console.log("👋 오프라인 사용자 제거:", locationData.userName, "남은 사용자:", filtered.length, "명")
                return filtered
              } else {
                // 기존 사용자 업데이트 또는 새 사용자 추가
                const existingIndex = prev.findIndex((user) => user.userId === locationData.userId)
                if (existingIndex >= 0) {
                  const updated = [...prev]
                  updated[existingIndex] = locationData
                  console.log("🔄 기존 사용자 위치 업데이트:", locationData.userName)
                  return updated
                } else {
                  const newList = [...prev, locationData]
                  console.log("➕ 새 사용자 추가:", locationData.userName, "총 사용자:", newList.length, "명")
                  return newList
                }
              }
            })
          } catch (error) {
            console.error("❌ 위치 데이터 파싱 에러:", error)
          }
        })

        // 개인 위치 정보 구독 (초기 데이터)
        const initialSubscription = stompClient.subscribe(`/user/queue/location/initial`, (message) => {
          console.log("📍 초기 위치 데이터 수신:", message.body)
          try {
            const locationData: LocationData = JSON.parse(message.body)
            console.log("📍 초기 위치 데이터 파싱:", locationData)

            // 자신의 위치 정보는 제외
            if (locationData.userId === userId) {
              console.log("🚫 초기 데이터에서 자신의 위치 정보는 제외")
              return
            }

            setNearbyUsers((prev) => {
              const exists = prev.some((user) => user.userId === locationData.userId)
              if (!exists) {
                const newList = [...prev, locationData]
                console.log(
                  "➕ 초기 데이터로 새 사용자 추가:",
                  locationData.userName,
                  "총 사용자:",
                  newList.length,
                  "명",
                )
                return newList
              }
              console.log("ℹ️ 초기 데이터 사용자 이미 존재:", locationData.userName)
              return prev
            })
          } catch (error) {
            console.error("❌ 초기 위치 데이터 파싱 에러:", error)
          }
        })

        console.log("✅ 위치 공유 구독 완료")
      },
      onDisconnect: (frame) => {
        console.log("❌ 위치 공유 WebSocket 연결 해제", frame)
        setIsConnected(false)
        setNearbyUsers([])
      },
      onStompError: (frame) => {
        console.error("❌ 위치 공유 STOMP 에러:", frame)
        setIsConnected(false)
      },
    })

    try {
      stompClient.activate()
      stompClientRef.current = stompClient
    } catch (error) {
      console.error("❌ 위치 공유 WebSocket 활성화 실패:", error)
    }

    return () => {
      console.log("🔌 위치 공유 WebSocket 연결 정리")
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current)
      }
      if (stompClientRef.current) {
        stompClientRef.current.deactivate()
        stompClientRef.current = null
      }
      setIsConnected(false)
      setNearbyUsers([])
    }
  }, [userId])

  // 위치 공유 시작
  const startLocationSharing = useCallback(
    async (visible = true) => {
      if (!userId || !isConnected || !stompClientRef.current) {
        console.log("⚠️ 위치 공유 시작 조건 미충족:", {
          userId: !!userId,
          isConnected,
          stompClient: !!stompClientRef.current,
        })
        return false
      }

      try {
        console.log("📍 현재 위치 가져오기 시작...")
        // 현재 위치 가져오기
        const position = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          })
        })

        console.log("📍 현재 위치 획득:", position.coords.latitude, position.coords.longitude)

        // 가시성 상태 업데이트
        setIsVisible(visible)

        const locationData = {
          userId,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          visible: visible, // isVisible 대신 visible 사용
        }

        console.log("📤 위치 공유 참여 메시지 전송:", locationData)

        // 위치 공유 참여 메시지 전송
        stompClientRef.current.publish({
          destination: "/app/location.join",
          body: JSON.stringify(locationData),
        })

        setIsSharing(true)

        // 주기적 위치 업데이트 (30초마다)
        locationIntervalRef.current = setInterval(async () => {
          try {
            console.log("🔄 주기적 위치 업데이트 시작...")
            const newPosition = await new Promise<GeolocationPosition>((resolve, reject) => {
              navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 30000,
              })
            })

            const updatedLocationData = {
              userId,
              latitude: newPosition.coords.latitude,
              longitude: newPosition.coords.longitude,
              visible: visible, // isVisible 대신 visible 사용
            }

            console.log("📤 위치 업데이트 메시지 전송:", updatedLocationData)

            stompClientRef.current?.publish({
              destination: "/app/location.update",
              body: JSON.stringify(updatedLocationData),
            })

            console.log("✅ 위치 업데이트 전송 완료")
          } catch (error) {
            console.error("❌ 위치 업데이트 실패:", error)
          }
        }, 30000)

        console.log("✅ 위치 공유 시작 완료")
        return true
      } catch (error) {
        console.error("❌ 위치 공유 시작 실패:", error)
        return false
      }
    },
    [userId, isConnected],
  )

  // 위치 공유 중지
  const stopLocationSharing = useCallback(() => {
    if (!userId || !stompClientRef.current) {
      console.log("⚠️ 위치 공유 중지 조건 미충족")
      return
    }

    try {
      console.log("📤 위치 공유 종료 메시지 전송:", userId)

      // 위치 공유 종료 메시지 전송
      stompClientRef.current.publish({
        destination: "/app/location.leave",
        body: userId,
      })

      // 주기적 업데이트 중지
      if (locationIntervalRef.current) {
        clearInterval(locationIntervalRef.current)
        locationIntervalRef.current = null
      }

      setIsSharing(false)
      setNearbyUsers([]) // 근처 사용자 목록 초기화

      console.log("✅ 위치 공유 중지 완료")
    } catch (error) {
      console.error("❌ 위치 공유 중지 실패:", error)
    }
  }, [userId])

  // 가시성 토글
  const toggleVisibility = useCallback(
    async (visible: boolean) => {
      setIsVisible(visible)

      if (isSharing && stompClientRef.current) {
        try {
          // 현재 위치 가져오기
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 5000,
              maximumAge: 30000,
            })
          })

          const locationData = {
            userId,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            visible: visible,
          }

          console.log("📤 가시성 변경 위치 업데이트:", locationData)

          stompClientRef.current.publish({
            destination: "/app/location.update",
            body: JSON.stringify(locationData),
          })
        } catch (error) {
          console.error("❌ 가시성 변경 실패:", error)
        }
      }
    },
    [userId, isSharing],
  )

  // 근처 사용자 새로고침
  const refreshNearbyUsers = useCallback(async () => {
    if (!userId) {
      console.log("⚠️ userId가 없어서 새로고침 생략")
      return
    }

    try {
      console.log("🔄 근처 사용자 새로고침 시작...")
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })

      const response = await fetch(
        `${BASE_URL}/api/location/nearby?userId=${userId}&latitude=${position.coords.latitude}&longitude=${position.coords.longitude}`,
        {
          method: "POST",
        },
      )

      console.log("🔄 근처 사용자 새로고침 요청 완료, 응답:", response.status)
    } catch (error) {
      console.error("❌ 근처 사용자 새로고침 실패:", error)
    }
  }, [userId])

  return {
    nearbyUsers,
    isConnected,
    isSharing,
    isVisible,
    startLocationSharing,
    stopLocationSharing,
    toggleVisibility,
    refreshNearbyUsers,
  }
}
