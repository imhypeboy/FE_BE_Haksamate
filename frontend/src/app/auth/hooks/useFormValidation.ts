import { useState, useCallback } from 'react'

/**
 * 검증 규칙 타입
 */
export type ValidationRule = (value: string, formData?: Record<string, any>) => string

/**
 * 검증 규칙 생성 팩토리 함수들
 * 실무에서는 이런 방식으로 재사용 가능한 검증 규칙을 만듭니다
 */
export const validationRules = {
  required: (message = '필수 입력 항목입니다.'): ValidationRule => 
    (value) => !value.trim() ? message : '',
  
  minLength: (min: number, message?: string): ValidationRule => 
    (value) => value.length < min ? (message || `최소 ${min}자 이상 입력해주세요.`) : '',
  
  maxLength: (max: number, message?: string): ValidationRule => 
    (value) => value.length > max ? (message || `최대 ${max}자까지 입력 가능합니다.`) : '',
  
  email: (message = '유효한 이메일 주소를 입력해주세요.'): ValidationRule => 
    (value) => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) ? message : '',
  
  password: (message = '영문과 숫자를 포함해야 합니다.'): ValidationRule => 
    (value) => !/(?=.*[a-zA-Z])(?=.*[0-9])/.test(value) ? message : '',
  
  confirmPassword: (message = '비밀번호가 일치하지 않습니다.'): ValidationRule => 
    (value, formData) => value !== formData?.password ? message : '',
  
  username: (message = '한글, 영문, 숫자, 언더스코어만 사용 가능합니다.'): ValidationRule => 
    (value) => !/^[가-힣a-zA-Z0-9_]+$/.test(value) ? message : '',
  
  blockedEmailDomains: (domains: string[], message = '임시 이메일 주소는 사용할 수 없습니다.'): ValidationRule => 
    (value) => {
      const domain = value.split('@')[1]?.toLowerCase()
      return domain && domains.includes(domain) ? message : ''
    },
}

/**
 * 폼 필드 설정 타입
 */
interface FieldConfig {
  rules: ValidationRule[]
  validateOnChange?: boolean
}

/**
 * useFormValidation Hook Props
 */
interface UseFormValidationProps<T extends Record<string, any>> {
  initialValues: T
  fieldConfigs: Record<keyof T, FieldConfig>
  onSubmit?: (values: T) => void | Promise<void>
}

/**
 * 폼 검증 커스텀 훅
 * 
 * @example
 * ```tsx
 * const { values, errors, handleChange, handleSubmit, isValid } = useFormValidation({
 *   initialValues: { email: '', password: '' },
 *   fieldConfigs: {
 *     email: {
 *       rules: [validationRules.required(), validationRules.email()],
 *       validateOnChange: true
 *     },
 *     password: {
 *       rules: [validationRules.required(), validationRules.minLength(8)]
 *     }
 *   },
 *   onSubmit: async (values) => { await loginUser(values) }
 * })
 * ```
 */
export const useFormValidation = <T extends Record<string, any>>({
  initialValues,
  fieldConfigs,
  onSubmit
}: UseFormValidationProps<T>) => {
  const [values, setValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Record<keyof T, string>>({} as Record<keyof T, string>)
  const [touched, setTouched] = useState<Record<keyof T, boolean>>({} as Record<keyof T, boolean>)
  const [isSubmitting, setIsSubmitting] = useState(false)

  /**
   * 단일 필드 검증
   */
  const validateField = useCallback((
    fieldName: keyof T, 
    value: string, 
    formData: T = values
  ): string => {
    const config = fieldConfigs[fieldName]
    if (!config) return ''

    for (const rule of config.rules) {
      const error = rule(value, formData)
      if (error) return error
    }
    return ''
  }, [fieldConfigs, values])

  /**
   * 전체 폼 검증
   */
  const validateForm = useCallback((formData: T = values): Record<keyof T, string> => {
    const newErrors = {} as Record<keyof T, string>
    
    Object.keys(fieldConfigs).forEach(fieldName => {
      const error = validateField(fieldName as keyof T, formData[fieldName], formData)
      if (error) {
        newErrors[fieldName as keyof T] = error
      }
    })
    
    return newErrors
  }, [fieldConfigs, validateField, values])

  /**
   * 입력 핸들러
   */
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    const fieldName = name as keyof T
    
    // 값 업데이트
    const newValues = { ...values, [fieldName]: value }
    setValues(newValues)
    
    // touched 상태 업데이트
    setTouched(prev => ({ ...prev, [fieldName]: true }))
    
    // 실시간 검증 (설정된 경우)
    const config = fieldConfigs[fieldName]
    if (config?.validateOnChange && touched[fieldName]) {
      const error = validateField(fieldName, value, newValues)
      setErrors(prev => ({ ...prev, [fieldName]: error }))
      
      // 연관 필드 재검증 (비밀번호 확인 등)
      if (fieldName === 'password' && newValues.confirmPassword) {
        const confirmError = validateField('confirmPassword' as keyof T, newValues.confirmPassword as string, newValues)
        setErrors(prev => ({ ...prev, confirmPassword: confirmError } as Record<keyof T, string>))
      }
    }
  }, [values, fieldConfigs, touched, validateField])

  /**
   * 블러 핸들러 (필드 떠날 때 검증)
   */
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement>) => {
    const fieldName = e.target.name as keyof T
    const error = validateField(fieldName, values[fieldName], values)
    setErrors(prev => ({ ...prev, [fieldName]: error }))
    setTouched(prev => ({ ...prev, [fieldName]: true }))
  }, [values, validateField])

  /**
   * 제출 핸들러
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (isSubmitting) return
    
    // 전체 검증
    const formErrors = validateForm(values)
    setErrors(formErrors)
    
    // 모든 필드를 touched로 설정
    const allTouched = Object.keys(fieldConfigs).reduce((acc, key) => {
      acc[key as keyof T] = true
      return acc
    }, {} as Record<keyof T, boolean>)
    setTouched(allTouched)
    
    // 에러가 있으면 중단
    if (Object.values(formErrors).some(error => error)) {
      return
    }
    
    // 제출 실행
    if (onSubmit) {
      try {
        setIsSubmitting(true)
        await onSubmit(values)
      } catch (error) {
        console.error('Form submission error:', error)
        throw error
      } finally {
        setIsSubmitting(false)
      }
    }
  }, [values, fieldConfigs, validateForm, onSubmit, isSubmitting])

  /**
   * 폼 유효성 상태
   */
  const isValid = Object.values(validateForm(values)).every(error => !error)

  /**
   * 에러 초기화
   */
  const clearErrors = useCallback(() => {
    setErrors({} as Record<keyof T, string>)
  }, [])

  /**
   * 필드 값 설정
   */
  const setFieldValue = useCallback((fieldName: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [fieldName]: value }))
  }, [])

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    handleChange,
    handleBlur,
    handleSubmit,
    validateField,
    validateForm,
    clearErrors,
    setFieldValue,
    setValues
  }
}

/**
 * 미리 정의된 검증 설정들
 */
export const commonValidations = {
  loginForm: {
    email: {
      rules: [
        validationRules.required('이메일을 입력해주세요.'),
        validationRules.email()
      ],
      validateOnChange: true
    },
    password: {
      rules: [
        validationRules.required('비밀번호를 입력해주세요.')
      ]
    }
  },
  
  registerForm: {
    username: {
      rules: [
        validationRules.required('사용자 이름을 입력해주세요.'),
        validationRules.minLength(2, '사용자 이름은 최소 2자 이상이어야 합니다.'),
        validationRules.maxLength(20, '사용자 이름은 최대 20자까지 가능합니다.'),
        validationRules.username()
      ],
      validateOnChange: true
    },
    email: {
      rules: [
        validationRules.required('이메일을 입력해주세요.'),
        validationRules.email(),
        validationRules.blockedEmailDomains(['tempmail.com', '10minutemail.com', 'guerrillamail.com'])
      ],
      validateOnChange: true
    },
    password: {
      rules: [
        validationRules.required('비밀번호를 입력해주세요.'),
        validationRules.minLength(8, '비밀번호는 최소 8자 이상이어야 합니다.'),
        validationRules.password()
      ],
      validateOnChange: true
    },
    confirmPassword: {
      rules: [
        validationRules.required('비밀번호 확인을 입력해주세요.'),
        validationRules.confirmPassword()
      ],
      validateOnChange: true
    }
  },
  
  forgotPasswordForm: {
    email: {
      rules: [
        validationRules.required('이메일을 입력해주세요.'),
        validationRules.email()
      ],
      validateOnChange: true
    }
  }
} as const 