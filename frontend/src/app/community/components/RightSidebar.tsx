import React from "react"
import { TrendingTopics } from "./TrendingTopics"
import { CommunityRules } from "./CommunityRules"

const trendingTopicsData = [
    { tag: "webdev", posts: 2345, trend: "up", emoji: "💻" },
    { tag: "react", posts: 1890, trend: "up", emoji: "⚛️" },
    { tag: "typescript", posts: 1567, trend: "stable", emoji: "📘" },
    { tag: "nextjs", posts: 1234, trend: "up", emoji: "🚀" },
    { tag: "javascript", posts: 987, trend: "down", emoji: "⚡" },
]

const communityRulesData = [
    { icon: "🤝", title: "서로 존중하는 언어 사용", desc: "모든 구성원을 배려하는 대화" },
    { icon: "🚫", title: "스팸 및 광고 금지", desc: "주제와 관련 없는 홍보 금지" },
    { icon: "💡", title: "건설적인 토론 문화", desc: "지식 공유와 학습을 위한 소통" },
    { icon: "🔒", title: "개인정보 보호", desc: "타인의 프라이버시 존중" },
]

export const RightSidebar = () => {
  return (
    <aside className="hidden xl:block w-80 p-6 flex-shrink-0">
      <div className="sticky top-24 space-y-6">
        <TrendingTopics topics={trendingTopicsData} />
        <CommunityRules rules={communityRulesData} />
      </div>
    </aside>
  )
} 