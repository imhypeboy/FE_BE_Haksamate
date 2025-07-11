import React, { useState } from 'react'
import { EyeIcon, EyeOffIcon, LucideIcon } from 'lucide-react'
import { authStyles } from './AuthContainer'

/**
 * Form Input Props
 */
interface FormInputProps {
  id: string
  name: string
  type: 'text' | 'email' | 'password'
  label: string
  placeholder: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
  icon?: LucideIcon
  autoComplete?: string
  required?: boolean
  disabled?: boolean
  showPasswordToggle?: boolean
  className?: string
}

/**
 * 재사용 가능한 Form Input 컴포넌트
 * 
 * @example
 * ```tsx
 * <FormInput
 *   id="email"
 *   name="email"
 *   type="email"
 *   label="이메일"
 *   placeholder="이메일 주소"
 *   value={email}
 *   onChange={handleChange}
 *   icon={MailIcon}
 *   error={errors.email}
 * />
 * ```
 */
export const FormInput: React.FC<FormInputProps> = ({
  id,
  name,
  type,
  label,
  placeholder,
  value,
  onChange,
  error,
  icon: Icon,
  autoComplete,
  required = false,
  disabled = false,
  showPasswordToggle = false,
  className = ""
}) => {
  const [showPassword, setShowPassword] = useState(false)
  
  // 비밀번호 타입이고 토글이 활성화된 경우 실제 input type 결정
  const inputType = type === 'password' && showPasswordToggle 
    ? (showPassword ? 'text' : 'password')
    : type

  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev)
  }

  return (
    <div className={`group ${className}`}>
      {/* 라벨 */}
      <label htmlFor={id} className={authStyles.label}>
        {label}
        {required && <span className="text-red-300 ml-1">*</span>}
      </label>
      
      {/* 입력 필드 컨테이너 */}
      <div className="relative">
        {/* 왼쪽 아이콘 */}
        {Icon && (
          <div className={authStyles.iconContainer} aria-hidden="true">
            <Icon size={18} />
          </div>
        )}
        
        {/* 입력 필드 */}
        <input
          id={id}
          name={name}
          type={inputType}
          autoComplete={autoComplete}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`${authStyles.input} ${Icon ? 'pl-10' : 'pl-3'} ${
            error ? 'border-red-400 focus:border-red-400 focus:ring-red-400/50' : ''
          }`}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        
        {/* 비밀번호 토글 버튼 */}
        {type === 'password' && showPasswordToggle && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-white/70 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
            tabIndex={-1}
            aria-label={showPassword ? "비밀번호 숨기기" : "비밀번호 보기"}
            disabled={disabled}
          >
            {showPassword ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
          </button>
        )}
      </div>
      
      {/* 에러 메시지 */}
      {error && (
        <p 
          id={`${id}-error`}
          className="mt-2 text-sm text-red-300 drop-shadow-sm flex items-start"
          role="alert"
          aria-live="assertive"
        >
          <span className="mt-0.5 mr-1" aria-hidden="true">❗</span>
          {error}
        </p>
      )}
    </div>
  )
}

/**
 * 비밀번호 강도 표시 컴포넌트
 */
interface PasswordStrengthProps {
  password: string
  strength: number
  className?: string
}

export const PasswordStrength: React.FC<PasswordStrengthProps> = ({
  password,
  strength,
  className = ""
}) => {
  if (!password) return null

  const getStrengthColor = (strength: number) => {
    if (strength <= 1) return 'bg-red-500'
    if (strength <= 3) return 'bg-yellow-500'
    if (strength <= 4) return 'bg-blue-500'
    return 'bg-green-500'
  }

  const getStrengthText = (strength: number) => {
    if (strength <= 1) return "매우 약한 비밀번호"
    if (strength <= 2) return "약한 비밀번호"
    if (strength <= 3) return "보통 비밀번호"
    if (strength <= 4) return "강한 비밀번호"
    return "매우 강한 비밀번호"
  }

  return (
    <div className={`mt-2 space-y-1 ${className}`}>
      {/* 강도 바 */}
      <div className="flex gap-1 h-1">
        {[1, 2, 3, 4, 5].map((segment) => (
          <div
            key={segment}
            className={`h-full flex-1 rounded-full transition-all ${
              strength >= segment ? getStrengthColor(strength) : 'bg-white/30'
            }`}
            aria-hidden="true"
          ></div>
        ))}
      </div>
      
      {/* 강도 텍스트 */}
      <p className="text-xs text-white/80 drop-shadow-sm">
        🔒 {getStrengthText(strength)}
      </p>
    </div>
  )
}

/**
 * 폼 에러 메시지 컴포넌트
 */
interface FormErrorProps {
  message: string
  className?: string
}

export const FormError: React.FC<FormErrorProps> = ({ 
  message, 
  className = "" 
}) => (
  <div
    className={`bg-red-100/80 backdrop-blur-sm text-red-800 p-4 rounded-md text-sm border-l-4 border-red-400 flex items-start ${className}`}
    role="alert"
    aria-live="assertive"
  >
    <span className="mt-0.5" aria-hidden="true">❗</span>
    <span className="ml-2">{message}</span>
  </div>
)

/**
 * 폼 성공 메시지 컴포넌트  
 */
interface FormSuccessProps {
  message: string
  className?: string
}

export const FormSuccess: React.FC<FormSuccessProps> = ({ 
  message, 
  className = "" 
}) => (
  <div
    className={`bg-green-100/80 backdrop-blur-sm text-green-800 p-4 rounded-md text-sm border-l-4 border-green-400 flex items-start ${className}`}
    role="alert"
    aria-live="polite"
  >
    <span className="mt-0.5" aria-hidden="true">✅</span>
    <span className="ml-2">{message}</span>
  </div>
) 