import React from 'react'
import { createPulseAnimation } from '@/lib/styles'

interface LoadingSkeletonProps {
  variant?: 'text' | 'card' | 'avatar' | 'button' | 'image'
  width?: string | number
  height?: string | number
  lines?: number
  className?: string
  isDarkMode?: boolean
}

/**
 * 표준화된 로딩 스켈레톤 컴포넌트
 * 
 * @example
 * ```tsx
 * <LoadingSkeleton variant="text" lines={3} />
 * <LoadingSkeleton variant="card" width="100%" height="200px" />
 * <LoadingSkeleton variant="avatar" />
 * ```
 */
export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  variant = 'text',
  width,
  height,
  lines = 1,
  className = '',
  isDarkMode = false
}) => {
  const pulseClass = createPulseAnimation('skeleton')
  const baseClass = `${pulseClass} ${
    isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
  } rounded ${className}`

  const renderSkeleton = () => {
    switch (variant) {
      case 'text':
        return (
          <div className="space-y-2">
            {Array.from({ length: lines }, (_, i) => (
              <div
                key={i}
                className={`${baseClass} h-4`}
                style={{
                  width: i === lines - 1 ? '60%' : width || '100%'
                }}
              />
            ))}
          </div>
        )
      
      case 'card':
        return (
          <div className={`${baseClass} rounded-xl`} style={{ 
            width: width || '100%', 
            height: height || '200px' 
          }}>
            <div className="p-6 space-y-4">
              <div className={`${baseClass} h-6 w-3/4`} />
              <div className={`${baseClass} h-4 w-full`} />
              <div className={`${baseClass} h-4 w-2/3`} />
            </div>
          </div>
        )
      
      case 'avatar':
        return (
          <div
            className={`${baseClass} rounded-full`}
            style={{
              width: width || '40px',
              height: height || '40px'
            }}
          />
        )
      
      case 'button':
        return (
          <div
            className={`${baseClass} rounded-lg`}
            style={{
              width: width || '100px',
              height: height || '40px'
            }}
          />
        )
      
      case 'image':
        return (
          <div
            className={`${baseClass} rounded-lg`}
            style={{
              width: width || '100%',
              height: height || '200px'
            }}
          />
        )
      
      default:
        return (
          <div
            className={baseClass}
            style={{ width, height }}
          />
        )
    }
  }

  return <>{renderSkeleton()}</>
}

export default LoadingSkeleton 