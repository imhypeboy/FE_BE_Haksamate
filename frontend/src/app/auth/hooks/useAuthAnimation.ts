import { useState, useEffect, useCallback, useRef } from 'react'

/**
 * 애니메이션 상태 타입
 */
interface AnimationState {
  isVisible: boolean
  isLoading: boolean
  isSuccess: boolean
  isError: boolean
}

/**
 * 타이머 관리 훅
 * 메모리 누수 방지를 위한 안전한 타이머 관리
 */
export const useSafeTimers = () => {
  const timersRef = useRef<Set<NodeJS.Timeout>>(new Set())
  const isMountedRef = useRef<boolean>(true)

  // 안전한 타이머 설정
  const setSafeTimer = useCallback((callback: () => void, delay: number): NodeJS.Timeout => {
    const timer = setTimeout(() => {
      timersRef.current.delete(timer)
      if (isMountedRef.current) {
        callback()
      }
    }, delay)
    timersRef.current.add(timer)
    return timer
  }, [])

  // 특정 타이머 정리
  const clearSafeTimer = useCallback((timer: NodeJS.Timeout) => {
    clearTimeout(timer)
    timersRef.current.delete(timer)
  }, [])

  // 모든 타이머 정리
  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach(timer => clearTimeout(timer))
    timersRef.current.clear()
  }, [])

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
      clearAllTimers()
    }
  }, [clearAllTimers])

  return {
    setSafeTimer,
    clearSafeTimer,
    clearAllTimers
  }
}

/**
 * Auth 페이지 애니메이션 훅
 * 
 * @example
 * ```tsx
 * const { 
 *   animationState, 
 *   triggerSuccess, 
 *   triggerError, 
 *   setLoading 
 * } = useAuthAnimation()
 * ```
 */
export const useAuthAnimation = () => {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isError, setIsError] = useState(false)
  const { setSafeTimer, clearAllTimers } = useSafeTimers()

  // 페이지 진입 애니메이션
  useEffect(() => {
    setSafeTimer(() => setIsVisible(true), 100)
  }, [setSafeTimer])

  // 로딩 상태 설정
  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading)
  }, [])

  // 성공 애니메이션 트리거
  const triggerSuccess = useCallback((duration = 1500) => {
    setIsLoading(false)
    setIsSuccess(true)
    setIsError(false)
    setSafeTimer(() => setIsSuccess(false), duration)
  }, [setSafeTimer])

  // 에러 애니메이션 트리거
  const triggerError = useCallback((duration = 2000) => {
    setIsLoading(false)
    setIsError(true)
    setIsSuccess(false)
    setSafeTimer(() => setIsError(false), duration)
  }, [setSafeTimer])

  // 상태 초기화
  const reset = useCallback(() => {
    setIsVisible(true)
    setIsLoading(false)
    setIsSuccess(false)
    setIsError(false)
    clearAllTimers()
  }, [clearAllTimers])

  return {
    isVisible,
    isLoading,
    isSuccess,
    isError,
    setLoading,
    triggerSuccess,
    triggerError,
    reset
  }
}

/**
 * 버튼 상호작용 애니메이션 훅
 * 
 * @example
 * ```tsx
 * const { 
 *   isPressed, 
 *   isHovered, 
 *   handlePress, 
 *   handleHover 
 * } = useButtonAnimation()
 * ```
 */
export const useButtonAnimation = () => {
  const [isPressed, setIsPressed] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const { setSafeTimer } = useSafeTimers()

  const handlePress = useCallback((pressed: boolean) => {
    setIsPressed(pressed)
    if (pressed) setSafeTimer(() => setIsPressed(false), 150)
  }, [setSafeTimer])

  const handleHover = useCallback((hovered: boolean) => {
    setIsHovered(hovered)
  }, [])

  return {
    isPressed,
    isHovered,
    handlePress,
    handleHover
  }
}

/**
 * 카운트다운 훅
 * 재전송 대기시간 등에 사용
 * 
 * @example
 * ```tsx
 * const { count, isActive, start, stop, reset } = useCountdown(60)
 * ```
 */
export const useCountdown = (initialCount: number = 60) => {
  const [count, setCount] = useState(initialCount)
  const [isActive, setIsActive] = useState(false)
  const { setSafeTimer, clearAllTimers } = useSafeTimers()

  const start = useCallback(() => {
    setIsActive(true)
    setCount(initialCount)
  }, [initialCount])

  const stop = useCallback(() => {
    setIsActive(false)
    clearAllTimers()
  }, [clearAllTimers])

  const reset = useCallback(() => {
    setIsActive(false)
    setCount(initialCount)
    clearAllTimers()
  }, [initialCount, clearAllTimers])

  // 카운트다운 로직
  useEffect(() => {
    if (isActive && count > 0) {
      setSafeTimer(() => {
        setCount(prev => prev - 1)
      }, 1000)
    } else if (count === 0) {
      setIsActive(false)
    }
  }, [isActive, count, setSafeTimer])

  return {
    count,
    isActive,
    isComplete: count === 0 && !isActive,
    start,
    stop,
    reset,
    progress: ((initialCount - count) / initialCount) * 100
  }
}

/**
 * 진행률 애니메이션 훅
 * 원형 진행바 등에 사용
 * 
 * @example
 * ```tsx
 * const { progress, setProgress, animateToProgress } = useProgressAnimation()
 * ```
 */
export const useProgressAnimation = (initialProgress = 0) => {
  const [progress, setProgress] = useState(initialProgress)
  const [isAnimating, setIsAnimating] = useState(false)
  const { setSafeTimer } = useSafeTimers()

  const animateToProgress = useCallback((targetProgress: number, duration = 500) => {
    const startProgress = progress
    const difference = targetProgress - startProgress
    const startTime = Date.now()

    setIsAnimating(true)

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progressRatio = Math.min(elapsed / duration, 1)
      
      // Easing function (easeOutCubic)
      const easedProgress = 1 - Math.pow(1 - progressRatio, 3)
      const currentProgress = startProgress + (difference * easedProgress)

      setProgress(currentProgress)

      if (progressRatio < 1) {
        setSafeTimer(animate, 16) // ~60fps
      } else {
        setIsAnimating(false)
      }
    }

    animate()
  }, [progress, setSafeTimer])

  return {
    progress,
    isAnimating,
    setProgress,
    animateToProgress
  }
}

/**
 * 애니메이션 관련 상수들
 */
export const animationConstants = {
  durations: {
    fast: 150,
    normal: 300,
    slow: 500,
    success: 1500,
    error: 3000
  },
  
  easings: {
    easeOut: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    easeIn: 'cubic-bezier(0.4, 0.0, 1, 1)',
    easeInOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)'
  },
  
  delays: {
    pageEnter: 100,
    stagger: 50,
    success: 200,
    error: 0
  }
} as const 