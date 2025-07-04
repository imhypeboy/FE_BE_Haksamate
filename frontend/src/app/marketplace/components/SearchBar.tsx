"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Search, X, Clock, TrendingUp } from "lucide-react"
import { useSearchHistory } from "../hooks/useSearchHistory"
import {useAuth} from "@/hooks/useAuth"
interface SearchBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  onFilterClick: () => void
  isDarkMode: boolean
}

const SearchBar: React.FC<SearchBarProps> = ({ searchQuery, onSearchChange, onFilterClick, isDarkMode }) => {
  const [inputValue, setInputValue] = useState(searchQuery || "")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const {
    searchHistory,
    suggestions,
    isLoading,
    addSearchHistory,
    getSearchHistory,
    deleteSearchHistory,
    getSuggestions,
  } = useSearchHistory()
  const { user } = useAuth()
  // 현재 사용자 ID (실제로는 auth에서 가져와야 함)
  const currentUserId = user?.id

  // 입력값이 변경될 때 부모 컴포넌트에 알림
  useEffect(() => {
    const safeQuery = searchQuery || ""
    if (safeQuery !== inputValue) {
      setInputValue(safeQuery)
    }
  }, [searchQuery])

  // 컴포넌트 마운트 시 검색 기록 로드
  useEffect(() => {
    if (currentUserId) {
      getSearchHistory(currentUserId).catch(console.error)
    }
  }, [currentUserId, getSearchHistory])

  // 입력값 변경 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value || ""
    setInputValue(value)

    // 검색 제안 가져오기
    if (value.trim() && currentUserId) {
      getSuggestions(currentUserId, value).catch(console.error)
    }
  }

  // 검색 실행
  const handleSearch = async (query?: string) => {
    const searchTerm = query || inputValue || ""

    if (searchTerm.trim()) {
      // 검색 기록에 추가
      if (currentUserId) {
        try {
          await addSearchHistory(currentUserId, searchTerm.trim())
        } catch (error) {
          console.error("검색 기록 저장 실패:", error)
        }
      }
    }

    onSearchChange(searchTerm)
    setShowSuggestions(false)
    inputRef.current?.blur()
  }

  // 엔터 키 처리
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    } else if (e.key === "Escape") {
      setShowSuggestions(false)
      inputRef.current?.blur()
    }
  }

  // 검색 기록 삭제
  const handleDeleteHistory = async (historyId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await deleteSearchHistory(historyId)
    } catch (error) {
      console.error("검색 기록 삭제 실패:", error)
    }
  }

  // 검색어 클리어
  const handleClear = () => {
    setInputValue("")
    onSearchChange("")
    inputRef.current?.focus()
  }

  // 포커스 처리
  const handleFocus = () => {
    setIsFocused(true)
    setShowSuggestions(true)
  }

  const handleBlur = () => {
    // 약간의 지연을 두어 클릭 이벤트가 처리되도록 함
    setTimeout(() => {
      setIsFocused(false)
      setShowSuggestions(false)
    }, 200)
  }

  // 제안 항목 클릭
  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion)
    handleSearch(suggestion)
  }

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* 검색 입력 필드 */}
      <div
        className={`relative flex items-center rounded-2xl border-2 transition-all duration-300 ${
          isFocused
            ? isDarkMode
              ? "border-orange-500 bg-gray-800"
              : "border-orange-500 bg-white"
            : isDarkMode
              ? "border-gray-600 bg-gray-800 hover:border-gray-500"
              : "border-gray-300 bg-white hover:border-gray-400"
        } shadow-lg`}
      >
        <div className="flex items-center pl-4">
          <Search
            size={20}
            className={`transition-colors duration-300 ${
              isFocused ? "text-orange-500" : isDarkMode ? "text-gray-400" : "text-gray-500"
            }`}
          />
        </div>

        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder="상품을 검색해보세요..."
          className={`flex-1 px-4 py-4 bg-transparent border-none outline-none text-lg placeholder-gray-400 ${
            isDarkMode ? "text-white" : "text-gray-900"
          }`}
        />

        {inputValue && (
          <button
            onClick={handleClear}
            className={`p-2 mr-2 rounded-full transition-colors duration-200 ${
              isDarkMode
                ? "text-gray-400 hover:text-gray-300 hover:bg-gray-700"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
            }`}
          >
            <X size={18} />
          </button>
        )}

        <button
          onClick={() => handleSearch()}
          className="px-6 py-2 mr-2 bg-orange-500 text-white rounded-xl font-medium hover:bg-orange-600 transition-colors duration-200"
        >
          검색
        </button>
      </div>

      {/* 검색 제안 및 기록 */}
      {showSuggestions && (isFocused || inputValue) && (
        <div
          ref={suggestionsRef}
          className={`absolute top-full left-0 right-0 mt-2 rounded-2xl border shadow-xl z-50 max-h-96 overflow-y-auto ${
            isDarkMode ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"
          }`}
        >
          {isLoading ? (
            <div className="p-4 text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
            </div>
          ) : (
            <>
              {/* 검색 제안 */}
              {suggestions.length > 0 && (
                <div className="p-2">
                  <div className={`px-3 py-2 text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                    <TrendingUp size={16} className="inline mr-2" />
                    인기 검색어
                  </div>
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={`suggestion-${index}`}
                      onClick={() => handleSuggestionClick(suggestion.keyword)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors duration-200 ${
                        isDarkMode ? "text-gray-200 hover:bg-gray-700" : "text-gray-800 hover:bg-gray-100"
                      }`}
                    >
                      <Search size={16} className="inline mr-3 text-gray-400" />
                      {suggestion.keyword}
                    </button>
                  ))}
                </div>
              )}

              {/* 검색 기록 */}
              {searchHistory.length > 0 && (
                <div className="p-2 border-t border-gray-200 dark:border-gray-600">
                  <div className={`px-3 py-2 text-sm font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                    <Clock size={16} className="inline mr-2" />
                    최근 검색어
                  </div>
                  {searchHistory.slice(0, 5).map((history) => (
                    <div
                      key={`history-${history.id}`}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors duration-200 ${
                        isDarkMode ? "text-gray-200 hover:bg-gray-700" : "text-gray-800 hover:bg-gray-100"
                      }`}
                    >
                      <button onClick={() => handleSuggestionClick(history.keyword)} className="flex-1 text-left">
                        <Clock size={16} className="inline mr-3 text-gray-400" />
                        {history.keyword}
                      </button>
                      <button
                        onClick={(e) => handleDeleteHistory(history.id, e)}
                        className={`p-1 rounded transition-colors duration-200 ${
                          isDarkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* 빈 상태 */}
              {suggestions.length === 0 && searchHistory.length === 0 && !isLoading && (
                <div className={`p-6 text-center ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  <Search size={48} className="mx-auto mb-3 opacity-50" />
                  <p>검색어를 입력해보세요</p>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default SearchBar
