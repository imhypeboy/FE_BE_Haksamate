"use client"

import React, { useState } from "react"
import { CATEGORY_INFO } from "../constants"

interface CategoryFilterProps {
  selectedCategory: string
  onCategoryChange: (category: string) => void
  isDarkMode?: boolean
}

const CategoryFilter = React.memo(({ selectedCategory, onCategoryChange, isDarkMode = false }: CategoryFilterProps) => {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)

  return (
    <div
      className={`rounded-3xl p-6 transition-all duration-500 ${
        isDarkMode
          ? "bg-gray-800/60 backdrop-blur-xl border border-gray-700/40"
          : "bg-white/90 backdrop-blur-xl border border-gray-200/60"
      } shadow-xl`}
    >
      <h3 className={`font-bold text-xl mb-6 ${isDarkMode ? "text-white" : "text-gray-900"}`}>카테고리</h3>
      <div className="space-y-2">
        {CATEGORY_INFO.map((category) => {
          const isActive = selectedCategory === category.id
          const isHovered = hoveredCategory === category.id

          return (
            <button
              key={`category-filter-${category.id}`}
              onClick={() => onCategoryChange(category.id)}
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
              className={`w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                isActive
                  ? isDarkMode
                    ? "bg-blue-500/20 text-blue-300 border border-blue-400/30 shadow-lg shadow-blue-500/10"
                    : "bg-blue-50 text-blue-700 border border-blue-200 shadow-lg shadow-blue-500/10"
                  : isDarkMode
                    ? "text-gray-300 hover:bg-gray-700/50 hover:text-gray-100"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
              style={{
                transform: `scale(${isActive ? 1.02 : isHovered ? 1.01 : 1})`,
              }}
            >
              <span className="text-2xl relative z-10">{category.icon}</span>
              <div className="flex-1 relative z-10">
                <span className="text-sm font-medium">{category.name}</span>
                {category.count > 0 && (
                  <span className={`text-xs ml-2 ${isDarkMode ? "text-gray-500" : "text-gray-400"}`}>
                    ({category.count})
                  </span>
                )}
              </div>

              {isActive && (
                <div
                  className={`w-2 h-2 rounded-full ${
                    isDarkMode ? "bg-blue-400" : "bg-blue-500"
                  } animate-pulse relative z-10`}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
})

CategoryFilter.displayName = "CategoryFilter"

export default CategoryFilter
