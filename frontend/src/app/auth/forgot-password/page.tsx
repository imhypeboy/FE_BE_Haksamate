'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { MailIcon, CheckCircle2 } from 'lucide-react'
import { AuthContainer, authStyles } from '../components/AuthContainer'
import { FormInput, FormError } from '../components/FormInput'
import { useAuthAnimation } from '../hooks/useAuthAnimation'
import { sendPasswordResetEmail } from '@/lib/auth'

export default function ForgotPasswordPage() {
  const { isVisible, isLoading, isSuccess, setLoading, triggerSuccess } = useAuthAnimation()

  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [hasSent, setHasSent] = useState(false)

  /* --------------- utils --------------- */
  const validateEmail = (value: string): string => {
    if (!value.trim()) return '이메일을 입력해주세요.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return '유효한 이메일 주소가 아닙니다.'
    return ''
  }

  /* ------------- handlers ------------- */
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value)
    if (error) setError(null)
  }, [error])

  const doSend = async () => {
    const emailErr = validateEmail(email)
    if (emailErr) {
      setError(emailErr)
      return false
    }
    setLoading(true)
    try {
      await sendPasswordResetEmail(email)
      triggerSuccess(2000)
      setHasSent(true)
      return true
    } catch (e: any) {
      setError(e.message || '이메일 전송에 실패했습니다.')
      return false
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await doSend()
  }

  const handleResend = async () => {
    await doSend()
  }

  /* ---------------- UI ---------------- */
  return (
    <AuthContainer
      title="비밀번호 재설정"
      subtitle="가입하신 이메일을 입력해주세요"
      isVisible={isVisible}
    >
      {error && <FormError message={error} />}

      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <FormInput
          id="fp-email"
          name="email"
          type="email"
          label="이메일"
          placeholder="이메일 주소"
          value={email}
          onChange={handleChange}
          icon={MailIcon}
          required
          disabled={isLoading || isSuccess}
          error={error ?? undefined}
        />

        <button type="submit" disabled={isLoading || isSuccess} className={authStyles.button}>
          {isLoading ? '전송 중...' : '재설정 링크 보내기'}
        </button>
      </form>

      {hasSent && !isSuccess && (
        <div className="mt-4 text-center space-y-2">
          <p className="text-sm text-white/80 drop-shadow-sm">메일을 받지 못하셨나요?</p>
          <button
            onClick={handleResend}
            disabled={isLoading}
            className={`${authStyles.button} flex items-center justify-center w-full`}
          >
            🔄 재전송
          </button>
        </div>
      )}

      <div className="text-center mt-6">
        <Link href="/auth/login" className="underline text-sm text-white/80 hover:text-white drop-shadow-sm">
          로그인 페이지로 돌아가기
        </Link>
      </div>

      {/* 🎨 개선된 성공 애니메이션 오버레이 */}
      {isSuccess && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm rounded-2xl z-10 animate-fade-in">
          <div className="text-green-600 animate-scale-up flex flex-col items-center">
            <CheckCircle2 className="h-16 w-16 animate-check-success text-green-500" />
            <p className="mt-3 text-lg font-semibold drop-shadow-md text-gray-800">
              이메일을 확인해주세요!
            </p>
            <p className="mt-1 text-sm text-gray-600">
              비밀번호 재설정 링크를 보냈습니다.
            </p>
          </div>
        </div>
      )}
    </AuthContainer>
  )
} 