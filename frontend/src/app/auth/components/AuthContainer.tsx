import React from 'react'

/**
 * Auth Container Props
 */
interface AuthContainerProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  showBackButton?: boolean
  isVisible?: boolean
  bgImage?: string
  className?: string
}

/**
 * 모든 Auth 페이지에서 공통으로 사용하는 컨테이너
 * 배경, 레이아웃, 애니메이션을 담당
 */
export const AuthContainer: React.FC<AuthContainerProps> = ({
  children,
  title,
  subtitle,
  showBackButton = false,
  isVisible = true,
  bgImage = '/Login_wallpaper.png',
  className = ""
}) => {
  return (
    <>
      <style jsx>{`
        .auth-background {
          background-image: url(/Login_wallpaper.png);
          background-size: cover;
          background-repeat: no-repeat;
          background-position: center;
        }
        
        @media (max-width: 640px) {
          .auth-background {
            background-position: 30% center; /* 모바일: 인물 중심 */
          }
        }
        
        @media (min-width: 641px) and (max-width: 1024px) {
          .auth-background {
            background-position: 40% center; /* 태블릿: 균형 */
          }
        }
        
        @media (min-width: 1025px) {
          .auth-background {
            background-position: 25% center; /* 데스크톱: 바다 풍경 강조 */
          }
        }
      `}</style>
      
      <div className="min-h-screen relative overflow-hidden auth-background" style={{backgroundImage: `url(${bgImage})`}}>
        {/* 그라데이션 오버레이 */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/50"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20"></div>

        {/* 메인 콘텐츠 */}
        <div className="relative z-10 min-h-screen flex items-center justify-end py-12 px-4 sm:px-6 lg:px-8">
          {/* Auth 폼 컨테이너 */}
          <div
            className={`max-w-md w-full sm:w-[90%] md:w-[440px] lg:mr-20 xl:mr-32 space-y-8 bg-black/20 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} ${className}`}
            style={{
              backdropFilter: 'blur(20px) saturate(180%)',
              WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            }}
          >
            {/* 헤더 */}
            <div className="text-center relative">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent drop-shadow-lg">
                학사메이트
              </h1>
              <h2 className="mt-6 text-2xl font-semibold text-white drop-shadow-md">
                {title}
              </h2>
              {subtitle && (
                <p className="mt-2 text-sm text-white/80 drop-shadow-sm">
                  {subtitle}
                </p>
              )}
              {/* 아날로그 요소 - 밑줄 */}
              <div className="h-1 w-20 bg-gradient-to-r from-white/80 to-purple-200/80 mx-auto mt-2 rounded-full drop-shadow-sm" aria-hidden="true"></div>
            </div>

            {/* 컨텐츠 */}
            {children}
          </div>
        </div>
      </div>
    </>
  )
}

/**
 * CSS 클래스 정의
 */
export const authStyles = {
  input: "pl-10 block w-full px-3 py-3 border border-white/30 rounded-lg bg-white/20 backdrop-blur-sm text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 transition-all",
  button: "group relative w-full flex justify-center py-3 px-4 border border-white/30 text-sm font-medium rounded-lg text-white bg-white/20 backdrop-blur-sm hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/50 disabled:opacity-70 transition-all duration-300 shadow-lg hover:shadow-xl",
  iconContainer: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-300",
  label: "block text-sm font-medium text-white/90 mb-2 transition-colors group-focus-within:text-white drop-shadow-sm"
} as const 