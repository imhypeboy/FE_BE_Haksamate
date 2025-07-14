import React, { useState } from 'react'
import type { SegmentType } from '../types'
import { SEGMENTS } from '../constants'

interface SegmentControlProps {
  activeSegment: SegmentType
  onSegmentChange: (segment: SegmentType) => void
  isDarkMode: boolean
}

const SegmentControl = React.memo(({ 
  activeSegment, 
  onSegmentChange, 
  isDarkMode 
}: SegmentControlProps) => {
  const [hoveredSegment, setHoveredSegment] = useState<SegmentType | null>(null)
  
  return (
    <div className={`relative flex rounded-full p-1 mx-6 mb-6 transition-all duration-500 ease-out ${
      isDarkMode 
        ? 'bg-gray-800/40 backdrop-blur-xl border border-gray-700/50' 
        : 'bg-gray-100/80 backdrop-blur-xl border border-gray-200/60'
    } shadow-2xl`}>
      {/* Material Design 3 Indicator */}
      <div 
        className={`absolute top-1 bottom-1 rounded-full transition-all duration-400 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isDarkMode 
            ? 'bg-white/90 shadow-lg shadow-white/20' 
            : 'bg-white shadow-lg shadow-gray-900/10'
        }`}
        style={{
          left: `${4 + (SEGMENTS.findIndex(s => s.id === activeSegment) * (100 / SEGMENTS.length))}%`,
          width: `${(100 / SEGMENTS.length) - 8}%`,
          transform: 'translateX(-4px)'
        }}
      />
      
      {SEGMENTS.map((segment, index) => {
        const Icon = segment.icon
        const isActive = activeSegment === segment.id
        const isHovered = hoveredSegment === segment.id
        
        return (
          <button
            key={segment.id}
            onClick={() => onSegmentChange(segment.id)}
            onMouseEnter={() => setHoveredSegment(segment.id)}
            onMouseLeave={() => setHoveredSegment(null)}
            className={`relative flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] font-medium text-sm z-10 ${
              isActive
                ? isDarkMode
                  ? 'text-gray-900 scale-105'
                  : 'text-gray-900 scale-105'
                : isDarkMode
                  ? 'text-gray-300 hover:text-gray-100'
                  : 'text-gray-600 hover:text-gray-800'
            }`}
            style={{
              transform: `scale(${isActive ? 1.05 : isHovered ? 1.02 : 1})`,
              transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
            }}
          >
            <Icon 
              size={16} 
              className={`transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                isActive ? 'scale-110' : isHovered ? 'scale-105' : 'scale-100'
              }`}
            />
            <span className={`transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              isActive ? 'font-semibold' : 'font-medium'
            }`}>
              {segment.label}
            </span>
            
            {/* Material Design 3 Ripple Effect */}
            <div className={`absolute inset-0 rounded-full opacity-0 transition-opacity duration-300 ${
              isHovered && !isActive 
                ? isDarkMode 
                  ? 'bg-white/10 opacity-100' 
                  : 'bg-gray-900/5 opacity-100'
                : ''
            }`} />
          </button>
        )
      })}
    </div>
  )
})

SegmentControl.displayName = 'SegmentControl'

export default SegmentControl
