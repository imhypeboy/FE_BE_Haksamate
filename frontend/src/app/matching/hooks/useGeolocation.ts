"use client"

import { useState, useCallback } from "react"

interface Location {
  lat: number
  lng: number
}

export const useGeolocation = () => {
  const [locationPermission, setLocationPermission] = useState<"granted" | "denied" | "prompt" | "loading">("prompt")
  const [currentLocation, setCurrentLocation] = useState<Location>({
    lat: 37.5665, // default: 서울
    lng: 126.978,
  })

  const requestLocation = useCallback(async (): Promise<boolean> => {
    setLocationPermission("loading")

    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation not supported")
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5분 캐시
        })
      })

      const newLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      }

      setCurrentLocation(newLocation)
      setLocationPermission("granted")
      return true
    } catch (error) {
      console.error("❌ 위치 확인 오류:", error)
      setLocationPermission("denied")
      return false
    }
  }, [])

  return {
    locationPermission,
    currentLocation,
    requestLocation,
  }
}
