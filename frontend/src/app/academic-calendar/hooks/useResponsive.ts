import { useEffect, useState } from "react"

/**
 * useResponsive
 * window.innerWidth < 640 일 때 isMobile=true 반환.
 * SSR 안전: window 존재 여부 확인
 */
export default function useResponsive() {
  const [isMobile, setIsMobile] = useState<boolean>(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const checkIsMobile = () => setIsMobile(window.innerWidth < 640)
    checkIsMobile()
    window.addEventListener("resize", checkIsMobile)
    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

  return { isMobile }
} 