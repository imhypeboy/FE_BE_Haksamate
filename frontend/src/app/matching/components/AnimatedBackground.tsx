"use client"

import React from "react"

interface AnimatedBackgroundProps {
  isDarkMode: boolean
}

const AnimatedBackground = React.memo(({ isDarkMode }: AnimatedBackgroundProps) => (
  <>
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div
        className={`absolute top-20 left-10 w-72 h-72 rounded-full opacity-10 blur-3xl transition-all duration-1000 ${
          isDarkMode ? "bg-gray-600" : "bg-blue-300"
        }`}
        style={{
          animation: "float 8s ease-in-out infinite",
          animationDelay: "0s",
        }}
      />

      <div
        className={`absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-8 blur-3xl transition-all duration-1000 ${
          isDarkMode ? "bg-gray-700" : "bg-indigo-300"
        }`}
        style={{
          animation: "float 10s ease-in-out infinite",
          animationDelay: "3s",
        }}
      />
    </div>

    {/* CSS 애니메이션 정의 */}
    <style jsx>{`
      @keyframes float {
        0%, 100% {
          transform: translateY(0px) rotate(0deg);
        }
        50% {
          transform: translateY(-20px) rotate(180deg);
        }
      }
    `}</style>
  </>
))

AnimatedBackground.displayName = "AnimatedBackground"

export default AnimatedBackground
