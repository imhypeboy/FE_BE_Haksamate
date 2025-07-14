"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Bot, User, BookOpen, Calculator, Globe, Beaker, History, Lightbulb } from "lucide-react"
import Sidebar from "../sidebar/sidebar"

interface ChatMessage {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: Date
  category?: string
}

interface StudySession {
  id: string
  subject: string
  duration: number
  questionsAsked: number
  date: string
}

export default function AITutorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      type: "ai",
      content:
        "안녕하세요! 저는 여러분의 AI 학습 도우미입니다. 🤖\n\n어떤 과목이나 주제에 대해 궁금한 것이 있으시면 언제든 물어보세요. 수학, 과학, 언어, 프로그래밍 등 다양한 분야를 도와드릴 수 있습니다!",
      timestamp: new Date(),
      category: "greeting",
    },
  ])
  const [inputMessage, setInputMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sidebarOpen, setSidebarOpen] = useState(true) // 사이드바 상태 추가
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const categories = [
    { id: "math", name: "수학", icon: Calculator, color: "blue" },
    { id: "science", name: "과학", icon: Beaker, color: "green" },
    { id: "language", name: "언어", icon: Globe, color: "purple" },
    { id: "programming", name: "프로그래밍", icon: BookOpen, color: "orange" },
  ]

  const quickQuestions = [
    { text: "미적분 기본 개념 설명해줘", category: "math" },
    { text: "파이썬 반복문 사용법", category: "programming" },
    { text: "영어 문법 정리해줘", category: "language" },
    { text: "화학 주기율표 설명", category: "science" },
  ]

  const studySessions: StudySession[] = [
    { id: "1", subject: "수학", duration: 45, questionsAsked: 8, date: "2025-05-23" },
    { id: "2", subject: "프로그래밍", duration: 60, questionsAsked: 12, date: "2025-05-22" },
    { id: "3", subject: "영어", duration: 30, questionsAsked: 5, date: "2025-05-21" },
  ]

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: "user",
      content: inputMessage,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)

    // AI 응답 시뮬레이션
    setTimeout(() => {
      const aiResponses = [
        "좋은 질문이네요! 이 주제에 대해 자세히 설명해드리겠습니다.",
        "이 문제를 단계별로 풀어보겠습니다.",
        "개념을 이해하기 쉽게 예시와 함께 설명해드릴게요.",
        "이 부분이 어려우실 수 있는데, 차근차근 알아보겠습니다.",
      ]

      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)]

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: `${randomResponse}\n\n"${inputMessage}"에 대한 답변:\n\n이는 매우 중요한 개념입니다. 기본 원리부터 차근차근 설명해드리겠습니다. 추가로 궁금한 점이 있으시면 언제든 말씀해주세요!`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 1500)
  }

  const handleQuickQuestion = (question: string) => {
    setInputMessage(question)
  }

  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      {/* 사이드바 추가 */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* 메인 콘텐츠 */}
      <div className="flex-1 font-sans pb-12">
        <header className="bg-white text-gray-800 py-6 px-4 flex justify-between items-center shadow-sm border-b border-gray-200">
          <div className="w-10"></div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <Bot className="w-8 h-8 mr-3 text-blue-600" />
            AI 학습 도우미
          </h1>
          <div className="w-10"></div>
        </header>

        <div className="max-w-7xl mx-auto py-8 px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* 채팅 영역 */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-[600px] flex flex-col">
                {/* 채팅 헤더 */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Bot className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">AI 튜터</h3>
                        <p className="text-sm text-green-600">● 온라인</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {categories.map((category) => {
                        const Icon = category.icon
                        return (
                          <button
                            key={category.id}
                            onClick={() => setSelectedCategory(category.id)}
                            className={`p-2 rounded-lg transition-colors ${
                              selectedCategory === category.id
                                ? "bg-blue-100 text-blue-600"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                            title={category.name}
                          >
                            <Icon className="w-4 h-4" />
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* 메시지 영역 */}
                <div className="flex-1 p-6 overflow-y-auto">
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`flex items-start space-x-3 max-w-xs lg:max-w-md ${
                            message.type === "user" ? "flex-row-reverse space-x-reverse" : ""
                          }`}
                        >
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              message.type === "user" ? "bg-blue-500" : "bg-blue-100"
                            }`}
                          >
                            {message.type === "user" ? (
                              <User className="w-4 h-4 text-white" />
                            ) : (
                              <Bot className="w-4 h-4 text-blue-600" />
                            )}
                          </div>
                          <div
                            className={`px-4 py-3 rounded-2xl ${
                              message.type === "user" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{message.content}</p>
                            <p
                              className={`text-xs mt-2 ${message.type === "user" ? "text-blue-100" : "text-gray-500"}`}
                            >
                              {message.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="flex items-start space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Bot className="w-4 h-4 text-blue-600" />
                          </div>
                          <div className="bg-gray-100 px-4 py-3 rounded-2xl">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                              <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.1s" }}
                              ></div>
                              <div
                                className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                style={{ animationDelay: "0.2s" }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div ref={messagesEndRef} />
                </div>

                {/* 입력 영역 */}
                <div className="p-6 border-t border-gray-200">
                  <div className="flex space-x-4">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                      placeholder="궁금한 것을 물어보세요..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-xl bg-white text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={isLoading || !inputMessage.trim()}
                      className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-sm transition-colors"
                    >
                      <Send className="w-4 h-4" />
                      <span>전송</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* 사이드바 */}
            <div className="space-y-6">
              {/* 빠른 질문 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                  빠른 질문
                </h3>
                <div className="space-y-3">
                  {quickQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickQuestion(question.text)}
                      className="w-full text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                    >
                      {question.text}
                    </button>
                  ))}
                </div>
              </div>

              {/* 학습 세션 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <History className="w-5 h-5 mr-2 text-blue-500" />
                  최근 학습
                </h3>
                <div className="space-y-3">
                  {studySessions.map((session) => (
                    <div key={session.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-gray-900">{session.subject}</span>
                        <span className="text-sm text-gray-500">{session.duration}분</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        질문 {session.questionsAsked}개 • {session.date}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 학습 통계 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">이번 주 학습</h3>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="text-3xl font-bold text-blue-600">135분</div>
                    <div className="text-sm text-gray-600">총 학습 시간</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="text-3xl font-bold text-green-600">25개</div>
                    <div className="text-sm text-gray-600">해결한 문제</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
