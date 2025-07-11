import React from "react"

interface StatsCardProps {
  title: string
  value: number
  gradientFrom: string // e.g. 'from-blue-500'
  gradientTo: string   // e.g. 'to-blue-600'
  icon: React.ReactNode
  cardClasses: string
  onClick?: () => void
}

export default function StatsCard({
  title,
  value,
  gradientFrom,
  gradientTo,
  icon,
  cardClasses,
  onClick
}: StatsCardProps) {
  const Wrapper: React.ElementType = onClick ? "button" : "div"
  const gradientClasses = `${gradientFrom} ${gradientTo}`
  return (
    <Wrapper
      onClick={onClick}
      className={`${cardClasses} p-4 lg:p-6 rounded-2xl transition-all duration-300 hover:transform hover:scale-105 hover:shadow-2xl focus:ring-2 focus:ring-blue-500/50 focus:outline-none text-left w-full`}
    >
      <div className="flex items-center">
        <div
          className={`w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r ${gradientFrom} ${gradientTo} rounded-2xl flex items-center justify-center mr-3 lg:mr-4 shadow-lg`}
        >
          {icon}
        </div>
        <div>
          <h3 className="text-sm lg:text-lg font-semibold opacity-70">{title}</h3>
          <p className={`text-2xl lg:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r ${gradientClasses}` }>
            {value}
          </p>
        </div>
      </div>
    </Wrapper>
  )
} 