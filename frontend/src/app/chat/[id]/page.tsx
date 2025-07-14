"use client"

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Send, Smile, Heart, User, MoreVertical } from 'lucide-react'
import { useChat,useChatRooms} from '@/hooks/useChat'
import { supabase } from "@/lib/supabaseClient"
interface Message {
  id: number
  text: string
  sender: 'chatUsr1' | 'chatUser2'
  timestamp: Date
}

interface ChatUser {
  id: number
  name: string
  nickname: string
  isOnline: boolean
}
interface ChatRoom {
  chatroomId: number;
  chatUsr1Id: string;      // UUID
  chatUsr1Name: string;
  chatUsr2Name: string;
  chatUsr2Id: string;      // UUID
  createdAt: number;       // timestamp (int, long)
}
const ChatPage: React.FC = () => {
  const router = useRouter()
  const params = useParams()
  const myUserId=params.id as string
  const chatRoomId = params.chatRoomId as string; 
  const [newMessage, setNewMessage] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [onlineUsers, setOnlineUsers] = useState<string[]>([])
  // useChat 훅 사용
  const {deleteRoom,rooms,isRoomsLoading,createRoom,loadRooms} =useChatRooms(myUserId)  
  const { messages, isMessagesLoading, loadMessages, sendMessage } = useChat(chatRoomId, myUserId)



  // 시간 포맷팅
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }



  const currentRoom = rooms.find(r => r.chatroomId.toString() === chatRoomId)
  const opponent = (() => {
    if (!currentRoom) return null
    if (currentRoom.chatUsr1Id === myUserId) {
      return {
        id: currentRoom.chatUsr2Id,
        name: currentRoom.chatUsr2Name,
        nickname: currentRoom.chatUsr2Name // nickname 별도 컬럼 있으면 교체
      }
    }
    return {
      id: currentRoom.chatUsr1Id,
      name: currentRoom.chatUsr1Name,
      nickname: currentRoom.chatUsr1Name // nickname 별도 컬럼 있으면 교체
    }
  })()

    // 최초 메시지 로딩
  useEffect(() => {
      loadRooms();
      loadMessages();
    }, [loadRooms,loadMessages])
      // 스크롤 항상 하단으로
  useEffect(() => {
        if (messagesEndRef.current) {
          messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
        }
  }, [messages])

  useEffect(() => {
    // 1. Presence 채널 생성
    const channel = supabase.channel("chat-presence", {
      config: { presence: { key: myUserId } }
    })

    // 2. 참가
    channel.subscribe(async (status) => {
      if (status === "SUBSCRIBED") {
        // presence 입장
        await channel.track({ user_id: myUserId })
      }
    })

    // 3. Presence 업데이트 이벤트 핸들러
    channel.on("presence", { event: "sync" }, () => {
      const state = channel.presenceState()
      // state: { [userId: string]: { user_id: string }[] }
      const userIds = Object.keys(state)
      setOnlineUsers(userIds)
    })

    // 4. 클린업 (언마운트 시 구독 해제)
    return () => {
      channel.unsubscribe()
    }
  }, [myUserId])

  // 예시: 특정 유저가 onlineUsers에 있으면 온라인 표시
  const isChatUserOnline = (chatUserId: string) => onlineUsers.includes(chatUserId)

  const handleSendMessage = useCallback(() => {
    if (!newMessage.trim()) return;
    sendMessage(newMessage);
    setNewMessage('');
  }, [newMessage, sendMessage]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (newMessage.trim()) handleSendMessage()
    }
  }


  if (!opponent) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="text-gray-400">채팅방 정보를 불러오는 중...</span>
      </div>
    )
  }

  return (
    <div className={`min-h-screen flex flex-col transition-all duration-700 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      
      {/* Header */}
      <header className={`sticky top-0 z-10 backdrop-blur-md border-b transition-all duration-300 ${
        isDarkMode 
          ? 'bg-gray-800/80 border-gray-700' 
          : 'bg-white/80 border-gray-200'
      }`}>
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className={`p-2 rounded-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${
                isDarkMode 
                  ? 'bg-white/10 hover:bg-white/20 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <ArrowLeft size={20} />
            </button>
            
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="relative">
                <div className={`w-12 h-12 rounded-full p-0.5 ${
                  isDarkMode 
                    ? 'bg-gradient-to-br from-gray-600 to-gray-500' 
                    : 'bg-gradient-to-br from-blue-400 via-purple-500 to-pink-500'
                }`}>
                  <div className={`w-full h-full rounded-full flex items-center justify-center ${
                    isDarkMode ? 'bg-gray-800' : 'bg-white'
                  }`}>
                    <User size={20} className={isDarkMode ? 'text-gray-300' : 'text-gray-600'} />
                  </div>
                </div>
                
                {/* Online Status */}
                {isChatUserOnline(opponent.id) && (
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-white">
                    <div className="absolute inset-0 bg-green-400 rounded-full animate-ping opacity-75" />
                  </div>
                )}
              </div>
              
              <div>
                <h2 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                  {opponent.name}
                </h2>
                <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                  {isChatUserOnline(opponent.id) ? '온라인' : '오프라인'} • @{opponent.nickname}
                </p>
              </div>
            </div>
          </div>
          
          <button
            className={`p-2 rounded-2xl transition-all duration-300 hover:scale-110 active:scale-95 ${
              isDarkMode 
                ? 'bg-white/10 hover:bg-white/20 text-white' 
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            }`}
          >
            <MoreVertical size={20} />
          </button>
        </div>
      </header>

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'chatUsr1' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-lg transition-all duration-300 hover:scale-105 ${
              message.sender === 'chatUsr1'
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                : isDarkMode
                  ? 'bg-gray-700 text-gray-100'
                  : 'bg-white text-gray-800 border border-gray-200'
            }`}>
              <p className="text-sm leading-relaxed">{message.text}</p>
              <p className={`text-xs mt-1 ${
                message.sender === 'chatUsr1' 
                  ? 'text-blue-100' 
                  : isDarkMode 
                    ? 'text-gray-400' 
                    : 'text-gray-500'
              }`}>
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={`sticky bottom-0 backdrop-blur-md border-t p-4 ${
        isDarkMode 
          ? 'bg-gray-800/80 border-gray-700' 
          : 'bg-white/80 border-gray-200'
      }`}>
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
                  ? 'bg-gray-700 text-white placeholder-gray-400 focus:ring-purple-500 border border-gray-600'
                  : 'bg-gray-50 text-gray-800 placeholder-gray-500 focus:ring-blue-500 border border-gray-200'
              }`}
              style={{ 
                minHeight: '48px',
                maxHeight: '120px'
              }}
            />
            
            <button
              className={`absolute right-3 bottom-3 p-2 rounded-xl transition-all duration-300 hover:scale-110 active:scale-95 ${
                isDarkMode 
                  ? 'text-gray-400 hover:text-gray-300' 
                  : 'text-gray-500 hover:text-gray-600'
              }`}
            >
              <Smile size={18} />
            </button>
          </div>
          
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className={`p-3 rounded-2xl transition-all duration-300 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              newMessage.trim()
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg'
                : isDarkMode
                  ? 'bg-gray-700 text-gray-500'
                  : 'bg-gray-200 text-gray-400'
            }`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ChatPage 