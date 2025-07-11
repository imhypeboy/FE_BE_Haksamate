/**
 * 중앙 집중식 상수 관리 시스템
 * 애플리케이션 전반에서 사용되는 상수값들을 관리
 */

// ===============================
// 테마 및 스타일 상수
// ===============================

export const THEME_COLORS = {
    primary: {
      50: '#eff6ff',
      100: '#dbeafe', 
      200: '#bfdbfe',
      300: '#93c5fd',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
      800: '#1e40af',
      900: '#1e3a8a'
    },
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d'
    },
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f'
    },
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d'
    }
  } as const
  
  export const BREAKPOINTS = {
    sm: '640px',
    md: '768px', 
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  } as const
  
  export const ANIMATIONS = {
    durations: {
      fast: 150,
      normal: 300,
      slow: 500,
      success: 1200,
      error: 2000,
      pageTransition: 800
    },
    
    // 로그인/인증 관련 애니메이션
    auth: {
      fadeIn: 'animate-fade-in',
      scaleUp: 'animate-scale-up',
      checkSuccess: 'animate-check-success',
      bounceGentle: 'animate-bounce-gentle',
      
      // 타이밍 설정
      timing: {
        successDisplay: 1200,  // 성공 메시지 표시 시간
        pageRedirect: 1500,    // 페이지 이동 지연 시간
        errorDisplay: 3000     // 에러 메시지 표시 시간
      }
    },
  
    easings: {
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      elastic: 'cubic-bezier(0.68, -0.6, 0.32, 1.6)'
    },
    pulse: {
      skeleton: {
        sm: "animate-pulse bg-gray-200 dark:bg-gray-700 rounded",
        md: "animate-pulse bg-gray-300 dark:bg-gray-600 rounded-md", 
        lg: "animate-pulse bg-gray-300 dark:bg-gray-600 rounded-lg"
      },
      indicator: {
        online: "animate-pulse bg-green-200 dark:bg-green-800 border-2 border-green-400",
        offline: "animate-pulse bg-gray-200 dark:bg-gray-700 border-2 border-gray-400",
        error: "animate-pulse bg-red-200 dark:bg-red-800 border-2 border-red-400",
        warning: "animate-pulse bg-yellow-200 dark:bg-yellow-800 border-2 border-yellow-400"
      },
      status: {
        sm: "w-2 h-2 rounded-full animate-pulse",
        md: "w-3 h-3 rounded-full animate-pulse", 
        lg: "w-4 h-4 rounded-full animate-pulse"
      },
      special: {
        notification: "animate-pulse bg-blue-100 dark:bg-blue-900 border border-blue-300 dark:border-blue-700",
        highlight: "animate-pulse bg-purple-100 dark:bg-purple-900 border border-purple-300 dark:border-purple-700",
        success: "animate-pulse bg-green-100 dark:bg-green-900 border border-green-300 dark:border-green-700"
      }
    }
  } as const
  
  // ===============================
  // API 관련 상수
  // ===============================
  
  export const API_CONFIG = {
    baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
    timeout: 10000,
    retryAttempts: 3,
    retryDelay: 1000
  } as const
  
  export const API_ENDPOINTS = {
    auth: {
      login: '/api/auth/login',
      register: '/api/auth/register',
      logout: '/api/auth/logout',
      refresh: '/api/auth/refresh'
    },
    marketplace: {
      items: '/api/items',
      search: '/api/items/search',
      categories: '/api/items/categories'
    },
    user: {
      profile: '/api/profile',
      preferences: '/api/profile/preferences'
    }
  } as const
  
  // ===============================
  // 인증 관련 상수
  // ===============================
  
  export const AUTH_CONFIG = {
    tokenKey: 'haksamate_token',
    refreshTokenKey: 'haksamate_refresh_token',
    userKey: 'haksamate_user',
    sessionTimeout: 30 * 60 * 1000, // 30분
    rememberMeTimeout: 7 * 24 * 60 * 60 * 1000, // 7일
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000 // 15분
  } as const
  
  // 테스트 계정 정보 (개발 환경에서만 사용)
  export const TEST_ACCOUNTS = {
    student: {
      email: 'test@haksamate.com',
      password: 'haksa123',
      name: '테스트사용자',
      department: '컴퓨터공학과',
      year: 3
    },
    admin: {
      email: 'admin@haksamate.com', 
      password: 'admin123',
      name: '관리자',
      role: 'admin'
    }
  } as const
  
  // ===============================
  // 유효성 검사 규칙
  // ===============================
  
  export const VALIDATION_RULES = {
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      blockedDomains: ['tempmail.com', '10minutemail.com', 'guerrillamail.com']
    },
    password: {
      minLength: 8,
      maxLength: 128,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false,
      pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]*$/
    },
    username: {
      minLength: 2,
      maxLength: 20,
      pattern: /^[가-힣a-zA-Z0-9_]+$/
    },
    phone: {
      pattern: /^010-\d{4}-\d{4}$/
    }
  } as const
  
  // ===============================
  // 파일 업로드 설정
  // ===============================
  
  export const FILE_UPLOAD = {
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFiles: 5,
    imageQuality: 0.8,
    thumbnailSize: { width: 300, height: 300 }
  } as const
  
  // ===============================
  // 페이지네이션 설정
  // ===============================
  
  export const PAGINATION = {
    defaultPageSize: 10,
    maxPageSize: 100,
    pageSizeOptions: [10, 20, 50, 100]
  } as const
  
  // ===============================
  // 로컬 스토리지 키
  // ===============================
  
  export const STORAGE_KEYS = {
    theme: 'haksamate_theme',
    language: 'haksamate_language',
    sidebarState: 'haksamate_sidebar_state',
    recentSearches: 'haksamate_recent_searches',
    favorites: 'haksamate_favorites',
    settings: 'haksamate_settings'
  } as const
  
  // ===============================
  // 기본 설정값
  // ===============================
  
  export const DEFAULT_SETTINGS = {
    theme: 'light',
    language: 'ko',
    notifications: {
      push: true,
      email: true,
      sms: false
    },
    privacy: {
      showOnlineStatus: true,
      allowDirectMessages: true,
      showActivity: true
    }
  } as const
  
  // ===============================
  // 에러 메시지
  // ===============================
  
  export const ERROR_MESSAGES = {
    network: '네트워크 연결을 확인해주세요.',
    unauthorized: '로그인이 필요합니다.',
    forbidden: '접근 권한이 없습니다.',
    notFound: '요청한 리소스를 찾을 수 없습니다.',
    serverError: '서버 오류가 발생했습니다.',
    validation: '입력값을 확인해주세요.',
    timeout: '요청 시간이 초과되었습니다.'
  } as const
  
  // ===============================
  // 성공 메시지
  // ===============================
  
  export const SUCCESS_MESSAGES = {
    login: '로그인되었습니다.',
    logout: '로그아웃되었습니다.',
    register: '회원가입이 완료되었습니다.',
    update: '정보가 업데이트되었습니다.',
    delete: '삭제되었습니다.',
    save: '저장되었습니다.'
  } as const
  
  // ===============================
  // 유틸리티 함수
  // ===============================
  
  /**
   * 환경별 설정값 가져오기
   */
  export const getEnvConfig = () => ({
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
    isTest: process.env.NODE_ENV === 'test',
    apiBaseUrl: API_CONFIG.baseUrl,
    enableMockData: process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'
  })
  
  /**
   * 브레이크포인트 체크 함수
   */
  export const createBreakpointChecker = () => {
    if (typeof window === 'undefined') return () => false
    
    return (breakpoint: keyof typeof BREAKPOINTS) => {
      return window.matchMedia(`(min-width: ${BREAKPOINTS[breakpoint]})`).matches
    }
  } 