"use client"

import type React from "react"
import { useState, useCallback, useMemo, useEffect } from "react"
import { DRAG_THRESHOLD } from "../constants"

interface UseDragHandlersProps {
  onLike: () => void
  onDislike: () => void
  nextProfile: () => void
  setExitX: (x: number) => void
}

export const useDragHandlers = ({ onLike, onDislike, nextProfile, setExitX }: UseDragHandlersProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [dragCurrent, setDragCurrent] = useState({ x: 0, y: 0 })

  // 드래그 계산 (성능 최적화)
  const dragX = useMemo(() => (isDragging ? dragCurrent.x - dragStart.x : 0), [isDragging, dragCurrent.x, dragStart.x])
  const dragY = useMemo(
    () => (isDragging ? (dragCurrent.y - dragStart.y) * 0.1 : 0),
    [isDragging, dragCurrent.y, dragStart.y],
  )
  const rotation = useMemo(() => dragX * 0.1, [dragX])

  const resetDragState = useCallback(() => {
    setIsDragging(false)
    setDragCurrent({ x: 0, y: 0 })
    setDragStart({ x: 0, y: 0 })
  }, [])

  // 드래그 완료 처리
  const handleDragEnd = useCallback(() => {
    if (!isDragging) return

    const currentDragX = dragCurrent.x - dragStart.x

    if (Math.abs(currentDragX) > DRAG_THRESHOLD) {
      // 카드 날아가는 애니메이션을 위한 exitX 설정
      if (currentDragX > 0) {
        setExitX(400) // 오른쪽으로 날아가기
        onLike()
      } else {
        setExitX(-400) // 왼쪽으로 날아가기
        onDislike()
      }
    } else {
      // 임계값에 도달하지 않으면 원래 위치로 복귀
      setExitX(0)
    }

    // 드래그 종료 후 상태 리셋
    resetDragState()
  }, [isDragging, dragCurrent.x, dragStart.x, onLike, onDislike, resetDragState, setExitX])

  // 마우스 이벤트 처리
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      e.preventDefault()
      setDragCurrent({ x: e.clientX, y: e.clientY })
    }

    const handleMouseUp = (e: MouseEvent) => {
      if (!isDragging) return
      e.preventDefault()
      handleDragEnd()
      // 마우스 업 후 즉시 드래그 상태 리셋
      setIsDragging(false)
    }

    // 마우스가 윈도우를 벗어났을 때도 처리
    const handleMouseLeave = () => {
      if (isDragging) {
        handleDragEnd()
        setIsDragging(false)
      }
    }

    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove, { passive: false })
      document.addEventListener("mouseup", handleMouseUp, { passive: false })
      document.addEventListener("mouseleave", handleMouseLeave, { passive: false })
      // 윈도우 전체에서 마우스 업 감지
      window.addEventListener("mouseup", handleMouseUp, { passive: false })
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("mouseleave", handleMouseLeave)
      window.removeEventListener("mouseup", handleMouseUp)
    }
  }, [isDragging, handleDragEnd])

  // 드래그 중 body 스크롤 방지
  useEffect(() => {
    if (isDragging) {
      // 드래그 중 body 스크롤 방지
      document.body.style.overflow = "hidden"
      document.body.style.touchAction = "none"
    } else {
      // 드래그 종료 시 스크롤 복원
      document.body.style.overflow = ""
      document.body.style.touchAction = ""
    }

    return () => {
      document.body.style.overflow = ""
      document.body.style.touchAction = ""
    }
  }, [isDragging])

  // 터치 이벤트 핸들러들 - preventDefault 제거
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0]
    setIsDragging(true)
    setDragStart({ x: touch.clientX, y: touch.clientY })
    setDragCurrent({ x: touch.clientX, y: touch.clientY })
  }, [])

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return
      // preventDefault 제거 - CSS touch-action으로 처리
      const touch = e.touches[0]
      setDragCurrent({ x: touch.clientX, y: touch.clientY })
    },
    [isDragging],
  )

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!isDragging) return
      handleDragEnd()
      // 터치 종료 후 즉시 드래그 상태 리셋
      setIsDragging(false)
    },
    [isDragging, handleDragEnd],
  )

  // 마우스 이벤트 핸들러 (시작만)
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setDragStart({ x: e.clientX, y: e.clientY })
    setDragCurrent({ x: e.clientX, y: e.clientY })
  }, [])

  return {
    isDragging,
    dragX,
    dragY,
    rotation,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleMouseDown,
    resetDragState,
  }
}
