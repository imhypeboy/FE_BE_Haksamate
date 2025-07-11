import React from 'react'
import { createPulseAnimation } from '@/lib/styles'

interface StatusIndicatorProps {
  status: 'online' | 'busy' | 'offline' | 'error' | 'warning' | 'info'
  size?: 'sm' | 'md' | 'lg'
  label?: string
  className?: string
  animate?: boolean
}

/**
 * 표준화된 상태 인디케이터 컴포넌트
 * 
 * @example
 * ```tsx
 * <StatusIndicator status="online" size="sm" label="온라인" />
 * <StatusIndicator status="error" size="md" animate />
 * ```
 */
export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  size = 'sm',
  label,
  className = '',
  animate = true
}) => {
  const pulseClass = animate ? createPulseAnimation('status', status, size) : ''
  
  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className={pulseClass} />
      {label && (
        <span className="text-sm font-medium text-gray-700">
          {label}
        </span>
      )}
    </div>
  )
}

export default StatusIndicator 