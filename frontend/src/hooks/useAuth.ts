"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"

interface User {
  id: string
  email: string
  name?: string
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    console.log("🔐 useAuth 초기화 시작")

    // 현재 세션 확인
    const getSession = async () => {
      try {
        console.log("📡 세션 확인 중...")

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error("❌ 세션 확인 실패:", sessionError)
          setUser(null)
          setIsLoading(false)
          return
        }

        console.log("📋 세션 정보:", {
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id,
          email: session?.user?.email,
        })

        if (session?.user) {
          console.log("👤 사용자 정보 설정 시작:", session.user.id)

          // 🔧 기본 사용자 정보 먼저 설정 (프로필 조회 전에)
          const basicUser = {
            id: session.user.id,
            email: session.user.email!,
          }

          setUser(basicUser)
          console.log("✅ 기본 사용자 정보 설정 완료:", basicUser)

          // 프로필 조회는 별도로 진행 (실패해도 로그인 상태 유지)
          try {
            console.log("📡 프로필 조회 시작...")
            const { data: profile, error: profileError } = await supabase
              .from("profiles")
              .select("name")
              .eq("id", session.user.id)
              .single()

            if (profileError) {
              console.warn("⚠️ 프로필 조회 실패 (기본 정보 유지):", profileError.message)
            } else {
              console.log("✅ 프로필 조회 성공:", profile)
              // 프로필 정보로 업데이트
              setUser({
                id: session.user.id,
                email: session.user.email!,
                name: profile?.name || undefined,
              })
            }
          } catch (profileError) {
            console.warn("⚠️ 프로필 조회 중 예외 (기본 정보 유지):", profileError)
          }
        } else {
          console.log("❌ 세션에 사용자 정보 없음")
          setUser(null)
        }
      } catch (error) {
        console.error("❌ getSession 전체 실패:", error)
        setUser(null)
      } finally {
        console.log("🏁 초기 세션 확인 완료")
        setIsLoading(false)
      }
    }

    getSession()

    // 🔧 인증 상태 변화 감지 개선
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔄 인증 상태 변화:", {
        event,
        hasSession: !!session,
        hasUser: !!session?.user,
        userId: session?.user?.id,
      })

      // 🔧 로그인 이벤트 처리
      if (event === "SIGNED_IN" && session?.user) {
        console.log("✅ 로그인 성공 - 사용자 정보 설정")

        // 즉시 기본 사용자 정보 설정
        const basicUser = {
          id: session.user.id,
          email: session.user.email!,
        }

        setUser(basicUser)
        setIsLoading(false) // 🔧 로딩 상태 즉시 해제

        // 프로필 조회는 백그라운드에서 진행
        try {
          const { data: profile } = await supabase.from("profiles").select("name").eq("id", session.user.id).single()

          if (profile?.name) {
            setUser({
              id: session.user.id,
              email: session.user.email!,
              name: profile.name,
            })
          }
        } catch (error) {
          console.warn("⚠️ 백그라운드 프로필 조회 실패:", error)
        }
      }
      // 🔧 로그아웃 이벤트 처리
      else if (event === "SIGNED_OUT") {
        console.log("🚪 로그아웃 - 사용자 정보 초기화")
        setUser(null)
        setIsLoading(false)
      }
      // 🔧 기타 이벤트 처리
      else if (session?.user) {
        console.log("🔄 기타 인증 이벤트 - 사용자 정보 업데이트")
        setUser({
          id: session.user.id,
          email: session.user.email!,
        })
        setIsLoading(false)
      } else {
        console.log("❌ 인증 상태 변화 - 사용자 없음")
        setUser(null)
        setIsLoading(false)
      }
    })

    return () => {
      console.log("🧹 useAuth 정리")
      subscription.unsubscribe()
    }
  }, [])

  // 🔧 디버깅용 상태 로그
  useEffect(() => {
    console.log("📊 useAuth 상태:", {
      isLoading,
      hasUser: !!user,
      userId: user?.id,
      email: user?.email,
    })
  }, [isLoading, user])

  return { user, isLoading }
}
