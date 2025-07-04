"use client"

import { useState, useEffect, useCallback, useRef } from "react"

export const useKakaoMap = () => {
  const [kakaoLoaded, setKakaoLoaded] = useState(false)
  const [sdkError, setSdkError] = useState<string | null>(null)
  const [apiKeyError, setApiKeyError] = useState<string | null>(null)
  const [loadingMessage, setLoadingMessage] = useState("카카오맵 SDK 로드 준비 중...")
  const [apiKey, setApiKey] = useState<string | null>(null)
  const scriptLoadAttempts = useRef(0)
  const maxScriptLoadAttempts = 3

  // API 키 유효성 검사
  const validateApiKey = useCallback((key: string): { isValid: boolean; error?: string } => {
    if (!key) {
      return { isValid: false, error: "API 키가 없습니다." }
    }

    const cleanKey = key.trim()

    if (cleanKey.length !== 32) {
      return {
        isValid: false,
        error: `API 키 길이가 잘못되었습니다. (현재: ${cleanKey.length}자리, 필요: 32자리)`,
      }
    }

    const hexPattern = /^[a-fA-F0-9]+$/
    if (!hexPattern.test(cleanKey)) {
      return {
        isValid: false,
        error: "API 키는 16진수 문자(0-9, a-f)만 포함해야 합니다.",
      }
    }

    return { isValid: true }
  }, [])

  // 카카오맵 스크립트 동적 로드
  const loadKakaoScript = useCallback((key: string) => {
    scriptLoadAttempts.current += 1
    console.log(`📜 카카오맵 스크립트 로드 시도 ${scriptLoadAttempts.current}/${maxScriptLoadAttempts}`)
    setLoadingMessage(`카카오맵 스크립트 로드 중... (${scriptLoadAttempts.current}/${maxScriptLoadAttempts})`)

    // 기존 스크립트 제거
    const existingScript = document.querySelector('script[src*="dapi.kakao.com"]')
    if (existingScript) {
      console.log("🗑️ 기존 스크립트 제거")
      existingScript.remove()
    }

    // 새 스크립트 생성
    const script = document.createElement("script")
    script.type = "text/javascript"
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&libraries=services,clusterer,drawing&autoload=false`
    script.async = true

    script.onload = () => {
      console.log("✅ 카카오맵 스크립트 로드 완료")
      setLoadingMessage("카카오맵 SDK 초기화 중...")

      if (window.kakao && window.kakao.maps) {
        try {
          window.kakao.maps.load(() => {
            console.log("🎉 카카오맵 SDK 초기화 완료!")
            setKakaoLoaded(true)
            setSdkError(null)
            setApiKeyError(null)
          })
        } catch (error) {
          console.error("❌ 카카오맵 초기화 오류:", error)
          setSdkError(`카카오맵 초기화 실패: ${error}`)
        }
      } else {
        console.error("❌ window.kakao.maps가 없습니다")
        setSdkError("카카오맵 객체를 찾을 수 없습니다.")
      }
    }

    script.onerror = (error) => {
      console.error("❌ 카카오맵 스크립트 로드 실패:", error)
      if (scriptLoadAttempts.current < maxScriptLoadAttempts) {
        console.log("🔄 스크립트 로드 재시도...")
        setTimeout(() => loadKakaoScript(key), 2000)
      } else {
        setSdkError("카카오맵 스크립트 로드 실패")
        setApiKeyError("네트워크 연결을 확인하거나 API 키가 올바른지 확인해주세요.")
      }
    }

    document.head.appendChild(script)
  }, [])

  // 환경변수 확인 및 스크립트 로드
  useEffect(() => {
    const envApiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY

    if (!envApiKey) {
      setSdkError("카카오맵 API 키가 설정되지 않았습니다.")
      setApiKeyError(".env.local 파일에 NEXT_PUBLIC_KAKAO_MAP_API_KEY를 설정해주세요.")
      return
    }

    const validation = validateApiKey(envApiKey)
    if (!validation.isValid) {
      setSdkError("API 키 형식 오류")
      setApiKeyError(validation.error || "알 수 없는 API 키 오류")
      return
    }

    const cleanApiKey = envApiKey.trim()
    setApiKey(cleanApiKey)
    loadKakaoScript(cleanApiKey)
  }, [validateApiKey, loadKakaoScript])

  return {
    kakaoLoaded,
    sdkError,
    apiKeyError,
    loadingMessage,
    apiKey,
  }
}
