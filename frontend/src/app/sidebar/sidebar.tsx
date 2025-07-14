"use client"

import type React from "react"

import {
  Calendar,
  MessageSquare,
  Settings,
  X,
  MenuIcon,
  GraduationCap,
  BookOpen,
  UserCheck,
  Bot,
  Bell,
  Utensils,
  Bus,
  CreditCard,
  ChevronDown,
  User,
  Zap,
  Sparkles,
  Heart,
  Clock,
  ShoppingBag,
} from "lucide-react"

import { useRouter, usePathname } from "next/navigation"
import { useState, useEffect, useCallback, useMemo } from "react"

interface SidebarProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

interface MenuItem {
  label: string
  icon: React.ReactNode
  path: string
  badge?: number | string
  category?: "main" | "secondary"
}

export default function Sidebar({ sidebarOpen, setSidebarOpen }: SidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // 키보드 단축키 지원
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "b") {
        event.preventDefault()
        setSidebarOpen(!sidebarOpen)
      }
      if (event.key === "Escape" && sidebarOpen) {
        setSidebarOpen(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [sidebarOpen, setSidebarOpen])

  const isActive = useCallback((path: string) => pathname === path, [pathname])

  const menuItems: MenuItem[] = useMemo(
    () => [
      { label: "시간표", icon: <Calendar size={20} />, path: "/", category: "main" },
      { label: "타이머", icon: <Clock size={20} />, path: "/timer", category: "main" },
      { label: "성적 관리", icon: <GraduationCap size={20} />, path: "/grades", category: "main" },
      { label: "친구찾기", icon: <Heart size={20} />, path: "/matching", category: "main" },
      { label: "중고마켓", icon: <ShoppingBag size={20} />, path: "/marketplace", badge: "NEW", category: "main" }, // 중고마켓 메뉴 추가
      { label: "시험 일정", icon: <BookOpen size={20} />, path: "/exams", category: "main" },
      { label: "출석 관리", icon: <UserCheck size={20} />, path: "/attendance", category: "main" },
      { label: "AI 학습 도우미", icon: <Bot size={20} />, path: "/ai-tutor", category: "main" },
      { label: "학사 일정", icon: <Bell size={20} />, path: "/academic-calendar", badge: 3, category: "main" },
      { label: "식단 정보", icon: <Utensils size={20} />, path: "/cafeteria", category: "secondary" },
      { label: "셔틀버스", icon: <Bus size={20} />, path: "/shuttle", category: "secondary" },
      { label: "디지털 학생증", icon: <CreditCard size={20} />, path: "/digital-id", category: "secondary" },
      { label: "커뮤니티", icon: <MessageSquare size={20} />, path: "/community", category: "secondary" },
      { label: "설정", icon: <Settings size={20} />, path: "/settings", category: "secondary" },
    ],
    [],
  )

  const groupedMenuItems = useMemo(() => {
    return menuItems.reduce(
      (acc, item) => {
        const category = item.category || "main"
        if (!acc[category]) acc[category] = []
        acc[category].push(item)
        return acc
      },
      {} as Record<string, MenuItem[]>,
    )
  }, [menuItems])

  const handleNavigation = useCallback(
    (path: string) => {
      router.push(path)
      if (window.innerWidth < 768) {
        setSidebarOpen(false)
      }
    },
    [router, setSidebarOpen],
  )

  const handleLogout = useCallback(() => {
    console.log("로그아웃")
  }, [])

  return (
    <>
      {/* 미니멀 햄버거 버튼 */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="
                        fixed top-4 left-4 z-[1100]
                        bg-white/90 backdrop-blur-md border border-gray-200/60
                        shadow-lg shadow-gray-900/5
                        rounded-xl p-3 h-12 w-12
                        flex items-center justify-center
                        hover:bg-white hover:border-blue-200/80 hover:shadow-xl hover:shadow-blue-500/10
                        hover:scale-105 active:scale-95
                        transition-all duration-300 ease-out
                        group
                    "
          aria-label="사이드바 열기 (Ctrl+B)"
        >
          <MenuIcon size={20} className="text-gray-700 group-hover:text-blue-600 transition-colors duration-200" />
        </button>
      )}

      {/* 클린 사이드바 패널 */}
      <div
        className={`
                    fixed top-0 left-0 h-full z-[1050]
                    transition-transform duration-500 ease-out
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
                    ${mounted ? "opacity-100" : "opacity-0"}
                `}
        style={{ width: 280 }}
        aria-hidden={!sidebarOpen}
      >
        <div className="flex flex-col h-full bg-white/95 backdrop-blur-xl border-r border-gray-200/60 shadow-2xl shadow-gray-900/5">
          {/* 헤더 */}
          <header className="flex justify-between items-center p-6 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25">
                <Sparkles size={18} className="text-white" />
              </div>
              <h1 className="font-bold text-xl text-gray-900 select-none">학사메이트</h1>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="
                                p-2 rounded-lg text-gray-500 bg-transparent
                                hover:bg-gray-100 hover:text-gray-700
                                transition-all duration-200
                            "
              aria-label="사이드바 닫기 (ESC)"
            >
              <X size={20} />
            </button>
          </header>

          {/* 사용자 정보 */}
          <div className="px-6 pb-6">
            <div
              className="
                                p-4 rounded-xl bg-gray-50/80 border border-gray-100
                                hover:bg-gray-50 hover:border-gray-200 hover:shadow-sm
                                transition-all duration-200 cursor-pointer group
                            "
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-md shadow-blue-500/20">
                  <span className="text-white font-semibold text-sm">학</span>
                </div>
                <div className="flex-1">
                  <div className="text-gray-900 font-medium text-sm">My Account</div>
                  <div className="text-gray-500 text-xs">학생</div>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 group-hover:text-gray-600 transition-all duration-200 ${userMenuOpen ? "rotate-180" : ""}`}
                />
              </div>

              {/* 사용자 메뉴 */}
              {userMenuOpen && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-1">
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-white/60 transition-all duration-200">
                    <User size={16} />
                    <span className="text-sm font-medium">프로필 설정</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-white/60 transition-all duration-200">
                    <Zap size={16} />
                    <span className="text-sm font-medium">프리미엄 업그레이드</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 메인 메뉴 */}
          <nav className="flex-1 overflow-y-auto px-6">
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">메뉴</h2>
              <div className="space-y-1">
                {groupedMenuItems.main?.map((item) => {
                  const active = isActive(item.path)
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNavigation(item.path)}
                      className={`
                                                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                                                font-medium text-sm transition-all duration-200
                                                group relative
                                                ${
                                                  active
                                                    ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100"
                                                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                                                }
                                            `}
                      aria-current={active ? "page" : undefined}
                    >
                      <span
                        className={`
                                                transition-colors duration-200
                                                ${active ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"}
                                            `}
                      >
                        {item.icon}
                      </span>
                      <span className="flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <div
                          className={`text-xs rounded-full px-2 py-0.5 font-medium shadow-sm ${
                            typeof item.badge === "string"
                              ? "bg-orange-500 text-white"
                              : "bg-blue-500 text-white w-5 h-5 flex items-center justify-center"
                          }`}
                        >
                          {item.badge}
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 보조 메뉴 */}
            {groupedMenuItems.secondary && (
              <div className="mb-6">
                <div className="h-px bg-gray-200 mb-6"></div>
                <div className="space-y-1">
                  {groupedMenuItems.secondary.map((item) => {
                    const active = isActive(item.path)
                    return (
                      <button
                        key={item.path}
                        onClick={() => handleNavigation(item.path)}
                        className={`
                                                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                                                    font-medium text-sm transition-all duration-200
                                                    group
                                                    ${
                                                      active
                                                        ? "bg-blue-50 text-blue-700 shadow-sm border border-blue-100"
                                                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                                                    }
                                                `}
                        aria-current={active ? "page" : undefined}
                      >
                        <span
                          className={`
                                                    transition-colors duration-200
                                                    ${active ? "text-blue-600" : "text-gray-500 group-hover:text-gray-700"}
                                                `}
                        >
                          {item.icon}
                        </span>
                        <span className="flex-1 text-left">{item.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </nav>

          <div className="p-6 pt-0">
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="text-center space-y-1">
                <p className="text-xs font-medium text-gray-500">학사메이트 v2.0</p>
                <p className="text-xs text-gray-400">© 2025 학사메이트</p>
                <p className="text-xs text-gray-400">Ctrl+B로 토글</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 모바일 오버레이 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/20 backdrop-blur-sm z-[1040] md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-label="사이드바 닫기"
        />
      )}
    </>
  )
}
