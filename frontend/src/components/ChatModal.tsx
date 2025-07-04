"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { X, Send, Smile, User, MessageCircle, Search } from "lucide-react"
import { useChat, useChatRooms } from "../hooks/useChat"
import { supabase } from "@/lib/supabaseClient"

interface ChatModalProps {
  isOpen: boolean
  onClose: () => void
  initialRoomId?: number
  sellerId?: string | null// 🔧 sellerId prop 추가
  isDarkMode: boolean
}

export interface Message {
  id: number
  text: string
  sender: "chatUsr1" | "chatUsr2"
  timestamp: Date
}

export interface ChatRoom {
  chatroomId: number
  chatUsr1Id: string // UUID
  chatUsr1Name: string
  chatUsr2Name: string
  chatUsr2Id: string // UUID
  createdAt: number
  lastMessage?: string
  lastMessageTime?: number
  unreadCount?: number
}

const getOpponentInfo = (room: ChatRoom, myUserId: string) => {
  if (room.chatUsr1Id === myUserId) {
    return { id: room.chatUsr2Id, name: room.chatUsr2Name }
  }
  return { id: room.chatUsr1Id, name: room.chatUsr1Name }
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, initialRoomId, sellerId, isDarkMode }) => {
  const [user, setUser] = useState<{ id: string } | null>(null)
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [newMessage, setNewMessage] = useState("")
  const [isMobile, setIsMobile] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 유저 정보 조회 (Supabase 사용)
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        console.log("👤 채팅 모달 사용자 설정:", data.user.id)
        setUser({ id: data.user.id })
      } else {
        setUser(null)
      }
    })
  }, [])

  // initialRoomId가 있으면 해당 방을 선택
  useEffect(() => {
    if (initialRoomId) {
      console.log("🎯 초기 채팅방 ID 설정:", initialRoomId)
      setSelectedRoomId(initialRoomId)
    }
  }, [initialRoomId])

  // 🔧 sellerId가 있으면 해당 판매자와 채팅방 생성/조회
  useEffect(() => {
    if (sellerId && user && isOpen) {
      console.log("🎯 판매자와 채팅방 생성/조회:", sellerId)
      createOrFindRoom(sellerId)
    }
  }, [sellerId, user, isOpen])

  // 반응형 대응
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // 채팅방 목록, 메시지 목록 훅 사용 (Spring Boot 연동)
  const { rooms, isRoomsLoading, loadRooms, createRoom, deleteRoom } = useChatRooms(user?.id ?? null)
  const { messages, sendMessage, isMessagesLoading, loadMessages, isConnected } = useChat(
    selectedRoomId ?? undefined,
    user?.id ?? "",
  )

  // 🔧 판매자와 채팅방 생성 또는 찾기
  const createOrFindRoom = async (sellerId: string) => {
    if (!user) return

    try {
      const room = await createRoom(user.id, sellerId)
      if (room) {
        setSelectedRoomId(room.chatroomId)
      }
    } catch (error) {
      console.error("❌ 채팅방 생성/조회 실패:", error)
    }
  }

  // 선택된 채팅방 정보 및 상대방 정보
  const selectedRoom = useMemo(() => {
    const room = rooms.find((room) => room.chatroomId === selectedRoomId)
    console.log("🏠 선택된 채팅방:", room)
    return room
  }, [rooms, selectedRoomId])

  const opponent = useMemo(
    () => (selectedRoom && user ? getOpponentInfo(selectedRoom, user.id) : null),
    [selectedRoom, user],
  )

  // 채팅방 목록 검색
  const filteredRooms = useMemo(() => {
    if (!rooms) return []
    return rooms.filter((room) => {
      const opp = getOpponentInfo(room, user?.id ?? "")
      return opp.name.toLowerCase().includes(searchTerm.toLowerCase())
    })
  }, [rooms, searchTerm, user])

  // 자동 스크롤
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // 메시지 전송 핸들러
  const onSend = useCallback(async () => {
    if (!newMessage.trim() || !selectedRoomId) return

    console.log("📤 메시지 전송:", { roomId: selectedRoomId, message: newMessage.trim() })
    await sendMessage(newMessage.trim())
    setNewMessage("")
  }, [newMessage, sendMessage, selectedRoomId])

  // 엔터키 전송
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        onSend()
      }
    },
    [onSend],
  )

  // 시간 포맷팅
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
  }

  const formatLastMessageTime = (date: number | null) => {
    if (!date) return ""
    const now = Date.now()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return "방금"
    if (minutes < 60) return `${minutes}분 전`
    if (hours < 24) return `${hours}시간 전`
    return `${days}일 전`
  }

  // 모달이 열릴 때 채팅방 목록 새로고침
  useEffect(() => {
    if (isOpen && user?.id) {
      console.log("🔄 채팅 모달 열림 - 채팅방 목록 새로고침")
      loadRooms()
    }
  }, [isOpen, user?.id, loadRooms])

  if (!isOpen) return null

  console.log("💬 ChatModal 렌더링:", {
    selectedRoomId,
    roomsCount: rooms.length,
    messagesCount: messages.length,
    opponent: opponent?.name,
    isConnected,
  })

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[99999]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className={`w-full max-w-6xl h-[85vh] rounded-3xl shadow-2xl overflow-hidden transition-all duration-300 ${
          isDarkMode
            ? "bg-gray-800/95 backdrop-blur-2xl border border-white/20"
            : "bg-white/95 backdrop-blur-2xl border border-white/60"
        }`}
        style={{ animation: "zoomIn 0.3s ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div
          className={`flex items-center justify-between p-4 border-b ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <div className="flex items-center gap-3">
            <MessageCircle size={24} className={isDarkMode ? "text-white" : "text-gray-800"} />
            <h2 className={`text-xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
              {selectedRoom && opponent ? (
                <>
                  채팅 - {opponent.name}
                  <span className="ml-2 text-sm font-normal opacity-60">({selectedRoom.chatroomId}번 방)</span>
                  {/* 🔧 연결 상태 표시 추가 */}
                  <div className="flex items-center gap-2 ml-3">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"}`} />
                    <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      {isConnected ? "연결됨" : "연결 안됨"}
                    </span>
                  </div>
                </>
              ) : (
                "채팅 목록"
              )}
            </h2>
          </div>

          <button
            onClick={onClose}
            className={`p-2 rounded-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${
              isDarkMode ? "bg-white/10 hover:bg-white/20 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-700"
            } z-10`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex h-full">
          {/* 좌측 채팅방 목록 */}
          <div className={`w-80 border-r ${isDarkMode ? "border-gray-700" : "border-gray-200"} flex flex-col`}>
            {/* 검색창 */}
            <div className="p-4">
              <div className="relative">
                <Search
                  size={18}
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${
                    isDarkMode ? "text-gray-400" : "text-gray-500"
                  }`}
                />
                <input
                  type="text"
                  placeholder="대화 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 rounded-2xl transition-all duration-300 focus:outline-none focus:ring-2 ${
                    isDarkMode
                      ? "bg-gray-700 text-white placeholder-gray-400 focus:ring-purple-500 border border-gray-600"
                      : "bg-gray-50 text-gray-800 placeholder-gray-500 focus:ring-blue-500 border border-gray-200"
                  }`}
                />
              </div>
            </div>

            {/* 채팅방 리스트 */}
            <div className="flex-1 overflow-y-auto" role="list">
              {isRoomsLoading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin w-6 h-6 border-2 border-current border-t-transparent rounded-full mx-auto mb-2" />
                  <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>채팅방 로딩 중...</p>
                </div>
              ) : filteredRooms.length === 0 ? (
                <div className="p-4 text-center">
                  <MessageCircle
                    size={32}
                    className={`mx-auto mb-2 ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}
                  />
                  <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    {searchTerm ? "검색 결과가 없습니다" : "채팅방이 없습니다"}
                  </p>
                </div>
              ) : (
                filteredRooms.map((room) => {
                  const opp = getOpponentInfo(room, user?.id ?? "")
                  return (
                    <div
                      key={room.chatroomId}
                      onClick={() => {
                        console.log("🎯 채팅방 선택:", room.chatroomId)
                        setSelectedRoomId(room.chatroomId)
                      }}
                      className={`p-4 cursor-pointer transition-all duration-200 ${
                        selectedRoomId === room.chatroomId
                          ? isDarkMode
                            ? "bg-gray-700 border-r-2 border-purple-500"
                            : "bg-blue-50 border-r-2 border-blue-500"
                          : isDarkMode
                            ? "hover:bg-gray-700/50"
                            : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="relative">
                          <div
                            className={`w-12 h-12 rounded-full p-0.5 ${
                              isDarkMode
                                ? "bg-gradient-to-br from-gray-600 to-gray-500"
                                : "bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500"
                            }`}
                          >
                            <div
                              className={`w-full h-full rounded-full flex items-center justify-center ${
                                isDarkMode ? "bg-gray-800" : "bg-white"
                              }`}
                            >
                              <User size={18} className={isDarkMode ? "text-gray-300" : "text-gray-600"} />
                            </div>
                          </div>
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className={`font-medium truncate ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                              {opp.name}
                            </h3>
                            <span className={`text-xs ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                              {room.lastMessageTime && formatLastMessageTime(room.lastMessageTime)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between mt-1">
                            <p className={`text-sm truncate ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                              {room.lastMessage || "새로운 매칭이 생성되었습니다!"}
                            </p>
                            {(room.unreadCount ?? 0) > 0 && (
                              <span className="min-w-[20px] h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center px-1">
                                {room.unreadCount ?? 0}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>

          {/* 우측 채팅영역 */}
          <div className="flex-1 flex flex-col">
            {selectedRoomId ? (
              <>
                <div
                  className="flex-1 overflow-y-auto p-6 space-y-4"
                  style={{
                    background: isDarkMode
                      ? "linear-gradient(to bottom, rgb(31, 41, 55), rgb(17, 24, 39))"
                      : "linear-gradient(to bottom, rgb(249, 250, 251), rgb(243, 244, 246))",
                  }}
                >
                  {isMessagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="animate-spin w-8 h-8 border-2 border-current border-t-transparent rounded-full mx-auto mb-2" />
                        <p className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>메시지 로딩 중...</p>
                      </div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <MessageCircle
                          size={48}
                          className={`mx-auto mb-4 ${isDarkMode ? "text-gray-600" : "text-gray-400"}`}
                        />
                        <p className={`text-lg font-medium ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                          대화를 시작해보세요! 👋
                        </p>
                        <p className={`text-sm mt-2 ${isDarkMode ? "text-gray-500" : "text-gray-500"}`}>
                          첫 메시지를 보내서 대화를 시작하세요
                        </p>
                      </div>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === "chatUsr1" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 ${
                            message.sender === "chatUsr1"
                              ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                              : isDarkMode
                                ? "bg-gray-700 text-gray-100"
                                : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.text}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p
                              className={`text-xs ${
                                message.sender === "chatUsr1"
                                  ? "text-blue-100"
                                  : isDarkMode
                                    ? "text-gray-400"
                                    : "text-gray-500"
                              }`}
                            >
                              {formatTime(message.timestamp)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* 입력영역 */}
                <div
                  className={`p-4 border-t backdrop-blur-lg ${
                    isDarkMode ? "border-gray-700 bg-gray-800/50" : "border-gray-200 bg-white/50"
                  }`}
                >
                  <div className="flex items-end gap-3">
                    <div className="flex-1 relative">
                      <textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="메시지를 입력하세요..."
                        rows={1}
                        className={`w-full px-4 py-3 pr-12 rounded-2xl resize-none transition-all duration-300 focus:outline-none focus:ring-2 ${
                          isDarkMode
                            ? "bg-gray-700 text-white placeholder-gray-400 focus:ring-purple-500 border border-gray-600"
                            : "bg-gray-50 text-gray-800 placeholder-gray-500 focus:ring-blue-500 border border-gray-200"
                        }`}
                        style={{
                          minHeight: "48px",
                          maxHeight: "120px",
                        }}
                      />
                      <button
                        className={`absolute right-3 bottom-3 p-2 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 ${
                          isDarkMode ? "text-gray-400 hover:text-gray-300" : "text-gray-500 hover:text-gray-600"
                        }`}
                      >
                        <Smile size={16} />
                      </button>
                    </div>

                    <button
                      onClick={onSend}
                      disabled={!newMessage.trim()}
                      className={`p-3 rounded-2xl transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
                        newMessage.trim()
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg"
                          : isDarkMode
                            ? "bg-gray-700 text-gray-500"
                            : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div
                className="flex-1 flex items-center justify-center"
                style={{
                  background: isDarkMode
                    ? "linear-gradient(to bottom, rgb(31, 41, 55), rgb(17, 24, 39))"
                    : "linear-gradient(to bottom, rgb(249, 250, 251), rgb(243, 244, 246))",
                }}
              >
                <div className="text-center space-y-6 max-w-md">
                  <div
                    className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${
                      isDarkMode
                        ? "bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/10"
                        : "bg-gradient-to-br from-purple-50 to-blue-50 border border-gray-200"
                    }`}
                  >
                    <MessageCircle size={48} className={isDarkMode ? "text-purple-400" : "text-purple-500"} />
                  </div>
                  <div>
                    <h3 className={`text-2xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}>
                      대화를 시작해보세요! 💬
                    </h3>
                    <p className={`text-base mt-3 leading-relaxed ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                      왼쪽 목록에서 채팅하고 싶은
                      <br />
                      상대를 선택해주세요
                    </p>
                  </div>

                  <div
                    className={`flex items-center justify-center gap-2 text-sm ${
                      isDarkMode ? "text-gray-500" : "text-gray-500"
                    }`}
                  >
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span>{rooms.length}개 방</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <style jsx>{`
          @keyframes zoomIn {
            from {
              opacity: 0;
              transform: scale(0.8);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
      </div>
    </div>
  )
}

export default ChatModal