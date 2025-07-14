import { useMemo } from 'react'

/**
 * 비밀번호 강도 계산 결과 타입
 */
export interface PasswordStrengthResult {
  score: number          // 0-5 점수
  percentage: number     // 0-100 퍼센트
  level: 'weak' | 'fair' | 'good' | 'strong' | 'very-strong'
  feedback: string[]     // 개선 제안사항
  color: string         // Tailwind 색상 클래스
  label: string         // 강도 레이블
}

/**
 * 비밀번호 강도 계산 훅
 * 
 * @param password - 검증할 비밀번호
 * @returns 비밀번호 강도 분석 결과
 * 
 * @example
 * ```tsx
 * const { score, level, feedback, color, label } = usePasswordStrength(password)
 * ```
 */
export const usePasswordStrength = (password: string): PasswordStrengthResult => {
  return useMemo(() => {
    if (!password) {
      return {
        score: 0,
        percentage: 0,
        level: 'weak',
        feedback: ['비밀번호를 입력해주세요.'],
        color: 'bg-gray-300',
        label: '비밀번호 없음'
      }
    }

    let score = 0
    const feedback: string[] = []

    // 길이 체크 (0-2점)
    if (password.length >= 8) {
      score += 1
    } else {
      feedback.push('최소 8자 이상 입력하세요.')
    }

    if (password.length >= 12) {
      score += 1
    } else if (password.length >= 8) {
      feedback.push('12자 이상 권장합니다.')
    }

    // 문자 종류 체크 (0-3점)
    const hasLowerCase = /[a-z]/.test(password)
    const hasUpperCase = /[A-Z]/.test(password)
    const hasNumbers = /[0-9]/.test(password)
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>]/.test(password)

    let charTypes = 0
    if (hasLowerCase) charTypes++
    if (hasUpperCase) charTypes++
    if (hasNumbers) charTypes++
    if (hasSpecialChars) charTypes++

    if (charTypes >= 2) score += 1
    if (charTypes >= 3) score += 1
    if (charTypes >= 4) score += 1

    // 피드백 생성
    if (!hasLowerCase) feedback.push('소문자 추가')
    if (!hasUpperCase) feedback.push('대문자 추가')
    if (!hasNumbers) feedback.push('숫자 추가')
    if (!hasSpecialChars) feedback.push('특수문자 추가')

    // 패턴 체크 (보너스/감점)
    const hasRepeatedChars = /(.)\1{2,}/.test(password) // 3번 이상 반복
    const hasSequentialChars = /(abc|bcd|cde|123|234|345|qwe|wer|ert)/.test(password.toLowerCase())
    const hasCommonPatterns = /(password|123456|qwerty|admin)/.test(password.toLowerCase())

    if (hasRepeatedChars) {
      score = Math.max(0, score - 1)
      feedback.push('반복 문자 피하기')
    }

    if (hasSequentialChars) {
      score = Math.max(0, score - 1)
      feedback.push('연속 문자 피하기')
    }

    if (hasCommonPatterns) {
      score = Math.max(0, score - 2)
      feedback.push('일반적인 패턴 피하기')
    }

    // 엔트로피 보너스 (복잡성)
    const uniqueChars = new Set(password).size
    if (uniqueChars >= password.length * 0.7) {
      score += 1 // 문자 다양성 보너스
    }

    // 점수 정규화 (0-5)
    score = Math.min(5, Math.max(0, score))

    // 레벨 결정
    let level: PasswordStrengthResult['level']
    let color: string
    let label: string

    if (score <= 1) {
      level = 'weak'
      color = 'bg-red-500'
      label = '매우 약함'
    } else if (score <= 2) {
      level = 'fair'
      color = 'bg-orange-500'
      label = '약함'
    } else if (score <= 3) {
      level = 'good'
      color = 'bg-yellow-500'
      label = '보통'
    } else if (score <= 4) {
      level = 'strong'
      color = 'bg-blue-500'
      label = '강함'
    } else {
      level = 'very-strong'
      color = 'bg-green-500'
      label = '매우 강함'
    }

    // 강한 비밀번호는 피드백 최소화
    if (score >= 4) {
      feedback.splice(0, feedback.length) // 모든 피드백 제거
      if (score === 4) {
        feedback.push('매우 강한 비밀번호입니다!')
      } else {
        feedback.push('완벽한 비밀번호입니다!')
      }
    }

    return {
      score,
      percentage: (score / 5) * 100,
      level,
      feedback,
      color,
      label
    }
  }, [password])
}

/**
 * 비밀번호 강도 체크 유틸리티 함수들
 */
export const passwordUtils = {
  /**
   * 간단한 점수만 계산
   */
  getScore: (password: string): number => {
    if (!password) return 0
    
    let score = 0
    if (password.length >= 8) score += 1
    if (/[a-z]/.test(password)) score += 1
    if (/[A-Z]/.test(password)) score += 1
    if (/[0-9]/.test(password)) score += 1
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1
    
    return score
  },

  /**
   * 최소 요구사항 검증
   */
  meetsMinimumRequirements: (password: string): boolean => {
    return password.length >= 8 && 
           /[a-zA-Z]/.test(password) && 
           /[0-9]/.test(password)
  },

  /**
   * 강한 비밀번호 검증
   */
  isStrong: (password: string): boolean => {
    return passwordUtils.getScore(password) >= 4
  },

  /**
   * 일반적인 패턴 검출
   */
  hasCommonPatterns: (password: string): boolean => {
    const commonPatterns = [
      'password', '123456', 'qwerty', 'admin', 'letmein',
      'welcome', 'monkey', '1234567890', 'abc123'
    ]
    
    return commonPatterns.some(pattern => 
      password.toLowerCase().includes(pattern)
    )
  },

  /**
   * 개인정보 포함 검증 (이름, 이메일 등)
   */
  containsPersonalInfo: (password: string, personalInfo: string[]): boolean => {
    return personalInfo.some(info => 
      info.length >= 3 && password.toLowerCase().includes(info.toLowerCase())
    )
  }
} as const 