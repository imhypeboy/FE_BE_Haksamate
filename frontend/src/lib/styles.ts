/**
 * 중앙 집중식 스타일 관리 시스템
 * 인라인 스타일과 반복되는 스타일을 관리
 */

import { THEME_COLORS, ANIMATIONS } from './constants'

// ===============================
// 타이포그래피 스타일
// ===============================

export const typography = {
  display: {
    xl: 'text-4xl font-bold tracking-tight',
    lg: 'text-3xl font-bold tracking-tight',
    md: 'text-2xl font-bold tracking-tight',
    sm: 'text-xl font-semibold'
  },
  heading: {
    h1: 'text-2xl font-bold',
    h2: 'text-xl font-semibold',
    h3: 'text-lg font-semibold',
    h4: 'text-base font-semibold',
    h5: 'text-sm font-semibold',
    h6: 'text-xs font-semibold'
  },
  body: {
    lg: 'text-lg leading-relaxed',
    md: 'text-base leading-normal',
    sm: 'text-sm leading-normal',
    xs: 'text-xs leading-tight'
  },
  mono: {
    base: 'font-mono text-base',
    tnum: 'font-mono text-base',
    style: { fontFeatureSettings: '"tnum"' }
  }
} as const

// ===============================
// 레이아웃 스타일
// ===============================

export const layout = {
  container: {
    sm: 'max-w-md mx-auto',
    md: 'max-w-2xl mx-auto',
    lg: 'max-w-4xl mx-auto',
    xl: 'max-w-6xl mx-auto',
    '2xl': 'max-w-7xl mx-auto',
    full: 'w-full',
    screen: 'min-h-screen'
  },
  spacing: {
    section: 'py-8 px-4',
    card: 'p-6',
    compact: 'p-4',
    tight: 'p-2'
  },
  grid: {
    cols1: 'grid grid-cols-1',
    cols2: 'grid grid-cols-1 md:grid-cols-2',
    cols3: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    cols4: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    gap: {
      sm: 'gap-2',
      md: 'gap-4', 
      lg: 'gap-6',
      xl: 'gap-8'
    }
  },
  flex: {
    center: 'flex items-center justify-center',
    between: 'flex items-center justify-between',
    start: 'flex items-center justify-start',
    end: 'flex items-center justify-end',
    col: 'flex flex-col',
    colCenter: 'flex flex-col items-center justify-center'
  }
} as const

// ===============================
// 컴포넌트 스타일
// ===============================

export const components = {
  button: {
    base: 'inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
    sizes: {
      xs: 'px-2.5 py-1.5 text-xs',
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-4 py-2 text-base',
      xl: 'px-6 py-3 text-base'
    },
    variants: {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
      outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
      danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
    }
  },
  card: {
    base: 'bg-white rounded-xl shadow-sm border border-gray-200',
    hover: 'hover:shadow-md transition-shadow duration-200',
    interactive: 'hover:shadow-md hover:scale-[1.02] transition-all duration-200 cursor-pointer',
    variants: {
      default: 'bg-white border-gray-200',
      elevated: 'bg-white shadow-lg border-gray-200',
      outlined: 'bg-white border-2 border-gray-300',
      glass: 'bg-white/80 backdrop-blur-md border-white/30'
    }
  },
  input: {
    base: 'block w-full px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors',
    error: 'border-red-400 focus:border-red-400 focus:ring-red-400',
    success: 'border-green-400 focus:border-green-400 focus:ring-green-400',
    sizes: {
      sm: 'px-2.5 py-1.5 text-sm',
      md: 'px-3 py-2 text-sm',
      lg: 'px-4 py-3 text-base'
    }
  },
  badge: {
    base: 'inline-flex items-center rounded-full font-medium',
    sizes: {
      sm: 'px-2 py-0.5 text-xs',
      md: 'px-3 py-1 text-xs',
      lg: 'px-4 py-1.5 text-sm'
    },
    variants: {
      default: 'bg-gray-100 text-gray-700',
      primary: 'bg-blue-100 text-blue-700',
      success: 'bg-green-100 text-green-700',
      warning: 'bg-yellow-100 text-yellow-700',
      danger: 'bg-red-100 text-red-700'
    }
  },
  avatar: {
    base: 'rounded-full flex items-center justify-center font-medium',
    sizes: {
      xs: 'w-6 h-6 text-xs',
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-sm',
      lg: 'w-12 h-12 text-base',
      xl: 'w-16 h-16 text-lg',
      '2xl': 'w-20 h-20 text-xl'
    },
    colors: {
      blue: 'bg-gradient-to-br from-blue-500 to-blue-700 text-white',
      green: 'bg-gradient-to-br from-green-500 to-green-700 text-white',
      purple: 'bg-gradient-to-br from-purple-500 to-purple-700 text-white',
      gray: 'bg-gradient-to-br from-gray-500 to-gray-700 text-white'
    }
  }
} as const

// ===============================
// 애니메이션 스타일
// ===============================

export const animations = {
  transition: {
    fast: `transition-all duration-${ANIMATIONS.durations.fast}`,
    normal: `transition-all duration-${ANIMATIONS.durations.normal}`,
    slow: `transition-all duration-${ANIMATIONS.durations.slow}`
  },
  transform: {
    hover: 'hover:scale-105',
    hoverSlight: 'hover:scale-[1.02]',
    hoverLift: 'hover:-translate-y-1'
  },
  fade: {
    in: 'animate-in fade-in',
    out: 'animate-out fade-out'
  },
  slide: {
    inUp: 'animate-in slide-in-from-bottom',
    inDown: 'animate-in slide-in-from-top',
    inLeft: 'animate-in slide-in-from-left',
    inRight: 'animate-in slide-in-from-right'
  },
  bounce: 'animate-bounce',
  pulse: 'animate-pulse',
  spin: 'animate-spin'
} as const

// ===============================
// 상태별 스타일
// ===============================

export const states = {
  loading: {
    spinner: animations.spin,
    pulse: animations.pulse,
    skeleton: 'animate-pulse bg-gray-200 rounded'
  },
  empty: {
    container: layout.flex.colCenter + ' py-20 px-6',
    icon: 'w-16 h-16 text-gray-400 mb-4',
    title: typography.heading.h3 + ' text-gray-900 mb-2',
    description: typography.body.md + ' text-gray-600 text-center'
  },
  error: {
    container: layout.flex.colCenter + ' py-20 px-6',
    icon: 'w-16 h-16 text-red-400 mb-4',
    title: typography.heading.h3 + ' text-red-900 mb-2',
    description: typography.body.md + ' text-red-600 text-center'
  }
} as const

// ===============================
// 반응형 스타일
// ===============================

export const responsive = {
  mobile: {
    show: 'block md:hidden',
    hide: 'hidden md:block'
  },
  tablet: {
    show: 'hidden md:block lg:hidden',
    hide: 'block md:hidden lg:block'
  },
  desktop: {
    show: 'hidden lg:block',
    hide: 'block lg:hidden'
  },
  grid: {
    mobile1: 'grid-cols-1',
    mobile2: 'grid-cols-2',
    tablet2: 'md:grid-cols-2',
    tablet3: 'md:grid-cols-3',
    desktop3: 'lg:grid-cols-3',
    desktop4: 'lg:grid-cols-4'
  }
} as const

// ===============================
// 유틸리티 함수
// ===============================

/**
 * 클래스명 조합 유틸리티
 */
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ')
}

/**
 * 조건부 클래스명 적용
 */
export const conditionalClass = (condition: boolean, trueClass: string, falseClass?: string): string => {
  return condition ? trueClass : (falseClass || '')
}

/**
 * 다크모드 클래스 생성
 */
export const darkMode = (lightClass: string, darkClass: string): string => {
  return `${lightClass} dark:${darkClass}`
}

/**
 * 컴포넌트 스타일 빌더
 */
export const buildComponentStyle = (
  component: keyof typeof components,
  variant: string = 'default',
  size: string = 'md',
  additionalClasses: string = ''
) => {
  const comp = components[component] as any
  const base = comp.base || ''
  const variantClass = comp.variants?.[variant] || ''
  const sizeClass = comp.sizes?.[size] || ''
  
  return cn(base, variantClass, sizeClass, additionalClasses)
}

/**
 * 인라인 스타일 객체 생성 도우미
 */
export const createInlineStyle = (styles: Record<string, any>): React.CSSProperties => {
  return styles
}

/**
 * 애니메이션 딜레이 생성
 */
export const createAnimationDelay = (index: number, baseDelay: number = 100): React.CSSProperties => {
  return { animationDelay: `${index * baseDelay}ms` }
}

/**
 * 진행률 스타일 생성
 */
export const createProgressStyle = (percentage: number): React.CSSProperties => {
  return { width: `${Math.min(100, Math.max(0, percentage))}%` }
}

/**
 * 표준화된 pulse 애니메이션 생성
 */
export const createPulseAnimation = (
  type: 'skeleton' | 'indicator' | 'status' | 'special',
  variant?: string,
  size?: 'sm' | 'md' | 'lg'
): string => {
  const { pulse } = ANIMATIONS
  
  switch (type) {
    case 'skeleton':
      return pulse.skeleton
    case 'indicator':
      const indicatorSize = size || 'sm'
      return `${pulse.indicator[indicatorSize]} ${pulse.status.info}`
    case 'status':
      const statusColor = variant ? pulse.status[variant as keyof typeof pulse.status] : pulse.status.info
      const statusSize = size || 'sm'
      return `${pulse.indicator[statusSize]} ${statusColor}`
    case 'special':
      const specialType = variant ? pulse.special[variant as keyof typeof pulse.special] : pulse.special.highlight
      return specialType
    default:
      return pulse.loading
  }
}

/**
 * 이벤트 리스너 정리 훅 생성 도우미
 */
export const createEventListenerCleanup = (
  eventType: string,
  handler: () => void,
  dependencies: any[] = []
) => {
  return {
    setup: () => {
      window.addEventListener(eventType, handler)
    },
    cleanup: () => {
      window.removeEventListener(eventType, handler)
    },
    dependencies
  }
}

/**
 * 반응형 사이드바 상태 관리 훅 패턴
 */
export const createResponsiveSidebarPattern = () => {
  return {
    effect: `
      const handleResize = () => {
        if (window.innerWidth >= 768) {
          setSidebarOpen(true)
        } else {
          setSidebarOpen(false)
        }
      }

      handleResize()
      window.addEventListener("resize", handleResize)
      return () => window.removeEventListener("resize", handleResize)
    `,
    dependencies: '[]'
  }
} 