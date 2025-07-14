import React from "react"
import { Hash, TrendingUp } from "lucide-react"

interface Topic {
  tag: string
  posts: number
  trend: string
  emoji: string
}

interface TrendingTopicsProps {
  topics: Topic[]
}

export const TrendingTopics: React.FC<TrendingTopicsProps> = ({ topics }) => {
  return (
    <section className="backdrop-blur-xl bg-white/70 rounded-3xl shadow-xl shadow-black/5 border border-white/20 p-6">
      <h2 className="text-lg font-bold mb-6 flex items-center text-slate-800">
        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-xl flex items-center justify-center mr-3">
          <Hash className="w-4 h-4 text-white" />
        </div>
        트렌딩 토픽
      </h2>
      <div className="space-y-3">
        {topics.map((topic, index) => (
          <div
            key={topic.tag}
            className="group p-4 hover:bg-white/60 rounded-2xl transition-all duration-300 cursor-pointer border border-white/20 hover:border-white/40 hover:shadow-lg hover:shadow-black/5"
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="text-lg">{topic.emoji}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800">
                      #{topic.tag}
                    </span>
                    {topic.trend === "up" && (
                      <TrendingUp className="w-3 h-3 text-green-500" />
                    )}
                    {topic.trend === "down" && (
                      <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />
                    )}
                  </div>
                  <div className="text-xs text-slate-400">
                    {index === 0 && "🔥 급상승 중"}
                    {index === 1 && "⭐ 인기 급상승"}
                    {index === 2 && "💎 꾸준한 인기"}
                    {index === 3 && "🚀 새로운 트렌드"}
                    {index === 4 && "📈 관심 증가"}
                  </div>
                </div>
              </div>
              <span className="text-sm text-slate-500 font-medium">
                {topic.posts.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
} 