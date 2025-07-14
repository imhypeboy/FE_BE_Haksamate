"use client"

import React, { useState, useCallback } from "react"
import { AlertCircle, ExternalLink, Copy, Check, RefreshCw } from "lucide-react"

interface ApiKeyErrorDisplayProps {
  isDarkMode: boolean
  sdkError: string | null
  apiKeyError: string | null
}

export const ApiKeyErrorDisplay = React.memo(({ isDarkMode, sdkError, apiKeyError }: ApiKeyErrorDisplayProps) => {
  const [copied, setCopied] = useState(false)
  const apiKey = process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("클립보드 복사 실패:", error)
    }
  }, [])

  return (
    <div className="relative w-full max-w-lg mx-auto">
      <div
        className={`rounded-3xl p-8 text-center transition-all duration-700 ease-out ${
          isDarkMode
            ? "bg-red-900/20 backdrop-blur-xl border border-red-700/40"
            : "bg-red-50/90 backdrop-blur-xl border border-red-200/60"
        } shadow-2xl`}
      >
        <div className="mb-6">
          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
              isDarkMode ? "bg-red-500/20 text-red-300" : "bg-red-100 text-red-600"
            }`}
          >
            <AlertCircle size={24} />
          </div>
          <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? "text-white" : "text-gray-800"}`}>API 키 형식 오류</h3>
          <p className={`text-sm mb-4 ${isDarkMode ? "text-red-300" : "text-red-600"}`}>{apiKeyError || sdkError}</p>

          {/* API 키 정보 */}
          {apiKey && (
            <div className={`text-xs p-3 rounded-lg mb-4 ${isDarkMode ? "bg-gray-800/50" : "bg-gray-100"}`}>
              <p className={`mb-2 font-semibold ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                🔍 현재 API 키 정보:
              </p>
              <div className={`text-left space-y-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                <p>길이: {apiKey.length}자리 (필요: 32자리)</p>
                <div className="flex items-center gap-2">
                  <code className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-xs break-all">{apiKey}</code>
                  <button
                    onClick={() => copyToClipboard(apiKey)}
                    className="p-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 해결 방법 */}
          <div className={`text-xs p-3 rounded-lg mb-4 ${isDarkMode ? "bg-blue-900/20" : "bg-blue-50"}`}>
            <p className={`mb-2 font-semibold ${isDarkMode ? "text-blue-300" : "text-blue-600"}`}>🛠️ 해결 방법:</p>
            <div className={`text-left space-y-1 ${isDarkMode ? "text-blue-200" : "text-blue-700"}`}>
              <p>
                1. 카카오 개발자 콘솔에서 <strong>JavaScript 키</strong> 재복사
              </p>
              <p>2. .env.local 파일에서 API 키 앞뒤 공백 제거</p>
              <p>3. API 키가 정확히 32자리인지 확인</p>
              <p>4. 16진수 문자(0-9, a-f)만 포함되어 있는지 확인</p>
            </div>
          </div>

          {/* 올바른 형식 예시 */}
          <div className={`text-xs p-3 rounded-lg mb-4 ${isDarkMode ? "bg-green-900/20" : "bg-green-50"}`}>
            <p className={`mb-2 font-semibold ${isDarkMode ? "text-green-300" : "text-green-600"}`}>
              ✅ 올바른 형식 예시:
            </p>
            <code
              className={`block text-left ${
                isDarkMode ? "text-green-200 bg-green-900/30" : "text-green-700 bg-green-100"
              } px-2 py-1 rounded`}
            >
              ca91a71f77581356c6aca311412bebc1
            </code>
            <p className={`mt-1 text-xs ${isDarkMode ? "text-green-400" : "text-green-600"}`}>
              (32자리, 16진수만 포함)
            </p>
          </div>

          {/* 카카오 개발자 콘솔 링크 */}
          <a
            href="https://developers.kakao.com/console/app"
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center gap-2 text-xs px-3 py-2 rounded-lg mb-4 transition-colors ${
              isDarkMode
                ? "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                : "bg-blue-50 text-blue-600 hover:bg-blue-100"
            }`}
          >
            <ExternalLink size={12} />
            카카오 개발자 콘솔에서 JavaScript 키 확인
          </a>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => window.location.reload()}
            className={`w-full py-3 px-4 rounded-2xl font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 ${
              isDarkMode
                ? "bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-400/30"
                : "bg-blue-50 hover:bg-blue-100 text-blue-600 border border-blue-200"
            }`}
          >
            <RefreshCw size={16} />
            API 키 수정 후 새로고침
          </button>
        </div>
      </div>
    </div>
  )
})

ApiKeyErrorDisplay.displayName = "ApiKeyErrorDisplay"
