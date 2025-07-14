import React from 'react'
import { Heart } from 'lucide-react'
import type { Profile } from '../types'

interface MatchSuccessModalProps {
  isOpen: boolean
  profile: Profile 
  isDarkMode: boolean
  onClose: () => void
  onStartChat: () => void
}

const MatchSuccessModal = React.memo(({ 
  isOpen, 
  profile, 
  isDarkMode, 
  onClose, 
  onStartChat 
}: MatchSuccessModalProps) => {
  if (!isOpen) return null

  return (
    <div 
      className="fixed top-0 left-0 w-full h-full bg-black/60 backdrop-blur-sm z-[99999]" 
      style={{ 
        animation: 'fadeIn 0.3s ease-out',
        position: 'fixed',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div 
        className={`rounded-3xl p-6 w-full shadow-2xl transition-all duration-700 ${
          isDarkMode 
            ? 'bg-gray-800/98 backdrop-blur-2xl border border-white/20' 
            : 'bg-white/98 backdrop-blur-2xl border border-white/60'
        }`}
        style={{ 
          animation: 'zoomIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          maxWidth: '400px',
          maxHeight: '80vh',
          overflow: 'auto',
          margin: '0 auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center space-y-6">
          <div className="relative mx-auto w-20 h-20">
            <div className="w-20 h-20 bg-gradient-to-br from-pink-400 to-red-400 rounded-full flex items-center justify-center animate-pulse">
              <Heart size={40} className="text-white" fill="currentColor" />
            </div>
            <div className="absolute inset-0 bg-pink-400 rounded-full blur-2xl opacity-30 animate-ping" />
            <div className="absolute -top-2 -right-2 text-2xl animate-bounce">🎉</div>
            <div className="absolute -bottom-2 -left-2 text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>✨</div>
          </div>
          
          <div>
            <h3 className={`text-2xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
              🎉 매칭 성공!
            </h3>
            <p className={`transition-colors duration-500 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              {profile.name}님과 매칭됐어요!<br />
              지금 바로 대화를 시작해보세요!
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className={`flex-1 py-3 px-4 rounded-2xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 ${
                isDarkMode 
                  ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200'
              }`}
            >
              나중에
            </button>
            <button
              onClick={onStartChat}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl font-medium transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg"
            >
              채팅 시작
            </button>
          </div>
        </div>
      </div>
    </div>
  )
})

MatchSuccessModal.displayName = 'MatchSuccessModal'

export default MatchSuccessModal
