import React from "react"
import { Users } from "lucide-react"

interface Rule {
  icon: string
  title: string
  desc: string
}

interface CommunityRulesProps {
  rules: Rule[]
}

export const CommunityRules: React.FC<CommunityRulesProps> = ({ rules }) => {
  return (
    <section className="backdrop-blur-xl bg-gradient-to-br from-blue-50/80 to-purple-50/80 rounded-3xl shadow-xl shadow-black/5 border border-white/20 p-6">
      <h2 className="text-lg font-bold mb-6 flex items-center text-slate-800">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
          <Users className="w-4 h-4 text-white" />
        </div>
        커뮤니티 규칙
      </h2>
      <ul className="space-y-4 text-sm text-slate-700">
        {rules.map((rule, index) => (
          <li
            key={index}
            className="p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-white/30 hover:bg-white/70 transition-all duration-200"
          >
            <div className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0">{rule.icon}</span>
              <div>
                <div className="font-semibold text-slate-800 mb-1">
                  {rule.title}
                </div>
                <div className="text-xs text-slate-600">{rule.desc}</div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
} 