"use client"

import React from "react"
import { User, Heart } from "lucide-react"

interface Profile {
  id: number
  name: string
  age: number
  mbti: string
  nickname: string
  tags: string[]
  description: string
}

interface NearbyUsersListProps {
  isDarkMode: boolean
  nearbyUsers: Profile[]
}

export const NearbyUsersList = React.memo(({ isDarkMode, nearbyUsers }: NearbyUsersListProps) => {
  if (nearbyUsers.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {nearbyUsers.slice(0, 3).map((user, index) => (
        <div
          key={user.id}
          className={`rounded-2xl p-4 transition-all duration-300 hover:scale-[1.02] ${
            isDarkMode
              ? "bg-gray-800/60 backdrop-blur-xl border border-gray-700/40"
              : "bg-white/90 backdrop-blur-xl border border-gray-200/60"
          } shadow-lg hover:shadow-xl`}
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isDarkMode ? "bg-gray-700" : "bg-gray-100"
              }`}
            >
              <User size={16} className={isDarkMode ? "text-gray-300" : "text-gray-600"} />
            </div>

            <div className="flex-1 min-w-0">
              <p className={`text-sm font-medium ${isDarkMode ? "text-white" : "text-gray-800"}`}>{user.name}</p>
              <p className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                만 {user.age} · {user.mbti} · 500m
              </p>
            </div>

            <Heart size={16} className="text-pink-500 hover:fill-current cursor-pointer transition-colors" />
          </div>
        </div>
      ))}

      {nearbyUsers.length > 3 && (
        <button
          className={`w-full py-3 px-4 rounded-2xl font-medium transition-all duration-300 hover:scale-105 ${
            isDarkMode
              ? "bg-gray-800/40 hover:bg-gray-800/60 text-gray-300 border border-gray-700/40"
              : "bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200"
          }`}
        >
          +{nearbyUsers.length - 3}명 더 보기
        </button>
      )}
    </div>
  )
})

NearbyUsersList.displayName = "NearbyUsersList"
