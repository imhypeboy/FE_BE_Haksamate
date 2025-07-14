"use client"

import { useEffect } from "react"
import type { SegmentType } from "../types"

interface UseKeyboardShortcutsProps {
  activeSegment: SegmentType
  chatModalOpen: boolean
  showMatch: boolean
  handleDislike: () => void
  handleLike: () => void
  setIndex: (fn: (prev: number) => number) => void
  setShowMatch: (show: boolean) => void
  setChatModalOpen: (open: boolean) => void
}

export const useKeyboardShortcuts = ({
  activeSegment,
  chatModalOpen,
  showMatch,
  handleDislike,
  handleLike,
  setIndex,
  setShowMatch,
  setChatModalOpen,
}: UseKeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 현재 매칭 탭이고 모달이나 입력 필드가 열려있지 않을 때만
      if (activeSegment !== "matching" || chatModalOpen || showMatch) return

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault()
          handleDislike()
          break
        case "ArrowRight":
          e.preventDefault()
          handleLike()
          break
        case "ArrowUp":
          e.preventDefault()
          // 다시 보기 기능 (프로필 새로고침)
          setIndex((prev) => Math.max(0, prev - 1))
          break
        case "ArrowDown":
          e.preventDefault()
          // 더 많은 정보 (프로필 상세 보기 - 추후 구현)
          console.log("프로필 상세 정보 표시")
          break
        case " ": // 스페이스바
          e.preventDefault()
          handleLike()
          break
        case "Escape":
          e.preventDefault()
          if (showMatch) setShowMatch(false)
          if (chatModalOpen) setChatModalOpen(false)
          break
      }
    }

    // PC에서만 키보드 이벤트 리스너 추가
    if (typeof window !== "undefined" && window.innerWidth >= 1024) {
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }
  }, [activeSegment, chatModalOpen, showMatch, handleDislike, handleLike, setIndex, setShowMatch, setChatModalOpen])
}
