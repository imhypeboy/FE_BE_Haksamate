"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { Client } from "@stomp/stompjs"

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

// 백엔드 서버 주소
const BASE_URL = "http://localhost:8080"
const WS_URL = BASE_URL.replace("http://", "ws://")

// 메시지 관련
export function useChat(chatRoomId?: number, myUserId?: string) {
  const [messages, setMessages] = useState<Message[]>([])
  const [isMessagesLoading, setIsMessagesLoading] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const stompClientRef = useRef<Client | null>(null)

  console.log("🔍 useChat 호출됨:", { chatRoomId, myUserId })

  // WebSocket 연결 설정 (SockJS 제거, 네이티브 WebSocket 사용)
  useEffect(() => {
    if (!chatRoomId || !myUserId) return

    console.log("🔌 네이티브 WebSocket 연결 시작:", `${WS_URL}/ws`)

    const stompClient = new Client({
      brokerURL: `${WS_URL}/ws`, // 네이티브 WebSocket URL
      debug: (str) => console.log("🔌 STOMP:", str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: (frame) => {
        console.log("✅ WebSocket 연결 성공", frame)
        setIsConnected(true)

        // 채팅방 구독
        const subscription = stompClient.subscribe(`/topic/chat/${chatRoomId}`, (message) => {
          console.log("📨 새 메시지 수신:", message.body)
          try {
            const receivedMessage = JSON.parse(message.body)
            setMessages((prev) => [
              ...prev,
              {
                id: receivedMessage.messageId || Date.now(), // messageId가 없으면 임시 ID
                text: receivedMessage.content,
                sender: receivedMessage.senderId === myUserId ? "chatUsr1" : "chatUsr2",
                timestamp: new Date(receivedMessage.sentAt || Date.now()),
              },
            ])
          } catch (error) {
            console.error("❌ 메시지 파싱 에러:", error)
          }
        })

        console.log("✅ 채팅방 구독 완료:", `/topic/chat/${chatRoomId}`)
      },
      onDisconnect: (frame) => {
        console.log("❌ WebSocket 연결 해제", frame)
        setIsConnected(false)
      },
      onStompError: (frame) => {
        console.error("❌ STOMP 에러:", frame)
        setIsConnected(false)
      },
      onWebSocketError: (event) => {
        console.error("❌ WebSocket 에러:", event)
        setIsConnected(false)
      },
      onWebSocketClose: (event) => {
        console.log("🔌 WebSocket 연결 종료:", event)
        setIsConnected(false)
      },
    })

    try {
      stompClient.activate()
      stompClientRef.current = stompClient
      console.log("🔌 STOMP 클라이언트 활성화 완료")
    } catch (error) {
      console.error("❌ WebSocket 활성화 실패:", error)
    }

    return () => {
      console.log("🔌 WebSocket 연결 정리")
      if (stompClientRef.current) {
        stompClientRef.current.deactivate()
        stompClientRef.current = null
      }
      setIsConnected(false)
    }
  }, [chatRoomId, myUserId])

  const loadMessages = useCallback(async () => {
    if (!chatRoomId) {
      console.log("⚠️ chatRoomId가 없어서 메시지 로드 중단")
      return
    }

    console.log("📡 메시지 로드 시작:", chatRoomId)
    setIsMessagesLoading(true)

    try {
      // 백엔드 API에 맞춰 POST 요청으로 변경
      const url = `${BASE_URL}/api/chat-messages/${chatRoomId}`
      console.log("📡 요청 URL:", url)

      const res = await fetch(url, {
        method: "POST", // 백엔드가 POST로 되어있음
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!res.ok) {
        console.error("❌ 메시지 로드 실패:", res.status, res.statusText)
        throw new Error(`메시지 불러오기 실패: ${res.status}`)
      }

      const data = await res.json()
      console.log("✅ 메시지 로드 성공:", data.length, "개")

      setMessages(
        data.map((msg: any) => ({
          id: msg.messageId,
          text: msg.content,
          sender: msg.senderId === myUserId ? "chatUsr1" : "chatUsr2",
          timestamp: new Date(msg.sentAt),
        })),
      )
    } catch (error) {
      console.error("❌ 메시지 로드 에러:", error)
    } finally {
      setIsMessagesLoading(false)
    }
  }, [chatRoomId, myUserId])

  useEffect(() => {
    console.log("🔄 useChat useEffect 실행:", { chatRoomId, myUserId })
    if (!chatRoomId) {
      console.log("⚠️ chatRoomId가 없어서 메시지 로드 스킵")
      return
    }

    loadMessages()
  }, [chatRoomId, loadMessages])

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || !chatRoomId || !myUserId) {
        console.log("⚠️ 메시지 전송 조건 미충족:", {
          text: !!text.trim(),
          chatRoomId,
          myUserId,
        })
        return
      }

      console.log("📤 메시지 전송 시도:", {
        isConnected,
        hasStompClient: !!stompClientRef.current,
        chatRoomId,
        senderId: myUserId,
        content: text.trim(),
      })

      // WebSocket이 연결되어 있으면 WebSocket으로 전송
      if (isConnected && stompClientRef.current) {
        try {
          console.log("📤 WebSocket으로 메시지 전송")
          stompClientRef.current.publish({
            destination: "/app/chat.send",
            body: JSON.stringify({
              chatRoomId,
              senderId: myUserId,
              content: text.trim(),
            }),
          })
          console.log("✅ WebSocket 메시지 전송 완료")
          return
        } catch (error) {
          console.error("❌ WebSocket 메시지 전송 에러:", error)
        }
      }

      // WebSocket이 연결되지 않았거나 실패했으면 HTTP POST로 fallback
      console.log("📤 HTTP POST로 메시지 전송 (fallback)")
      try {
        const res = await fetch(`${BASE_URL}/api/chat-messages/send`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chatRoomId,
            senderId: myUserId,
            content: text.trim(),
          }),
        })

        if (res.ok) {
          console.log("✅ HTTP로 메시지 전송 성공")
          // 메시지 목록 새로고침
          setTimeout(() => loadMessages(), 500)
        } else {
          console.error("❌ HTTP 메시지 전송 실패:", res.status)
        }
      } catch (error) {
        console.error("❌ HTTP 메시지 전송 에러:", error)
      }
    },
    [chatRoomId, myUserId, isConnected, loadMessages],
  )

  return { messages, isMessagesLoading, sendMessage, loadMessages, isConnected }
}

// 채팅방 관련
export function useChatRooms(userId: string | null) {
  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [isRoomsLoading, setIsRoomsLoading] = useState(false)

  console.log("🏠 useChatRooms 호출됨:", { userId })

  const loadRooms = useCallback(async () => {
    if (!userId) {
      console.log("⚠️ userId가 없어서 채팅방 로드 중단")
      return
    }

    console.log("📡 채팅방 목록 로드 시작:", userId)
    setIsRoomsLoading(true)

    try {
      const url = `${BASE_URL}/api/chat-rooms?userId=${userId}`
      console.log("📡 요청 URL:", url)

      const res = await fetch(url)

      if (!res.ok) {
        console.error("❌ 채팅방 목록 로드 실패:", res.status, res.statusText)
        throw new Error(`채팅방 목록 불러오기 실패: ${res.status}`)
      }

      const data = await res.json()
      console.log("✅ 채팅방 목록 로드 성공:", data.length, "개")

      // 🔧 중복 채팅방 제거 (같은 chatroomId 기준)
      const uniqueRooms = data.filter((room: ChatRoom, index: number, self: ChatRoom[]) => 
        index === self.findIndex(r => r.chatroomId === room.chatroomId)
      )

      console.log("🔧 중복 제거 후:", uniqueRooms.length, "개")
      setRooms(uniqueRooms)
    } catch (error) {
      console.error("❌ 채팅방 목록 로드 에러:", error)
    } finally {
      setIsRoomsLoading(false)
    }
  }, [userId])

  // 🔧 채팅방 생성 또는 기존 방 찾기 개선
  const createRoom = useCallback(async (chatUsr1Id: string, chatUsr2Id: string) => {
    console.log("🆕 채팅방 생성/찾기 시작:", { chatUsr1Id, chatUsr2Id })
    setIsRoomsLoading(true)

    try {
      // 🔧 먼저 기존 채팅방이 있는지 확인
      console.log("🔍 기존 채팅방 검색 중...")
      const existingRoom = rooms.find(room => 
        (room.chatUsr1Id === chatUsr1Id && room.chatUsr2Id === chatUsr2Id) ||
        (room.chatUsr1Id === chatUsr2Id && room.chatUsr2Id === chatUsr1Id)
      )

      if (existingRoom) {
        console.log("✅ 기존 채팅방 발견:", existingRoom.chatroomId)
        return existingRoom
      }

      // 🔧 기존 방이 없으면 새로 생성
      console.log("🆕 새 채팅방 생성 중...")
      const res = await fetch(`${BASE_URL}/api/chat-rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chatUsr1Id, chatUsr2Id }),
      })

      if (!res.ok) {
        console.error("❌ 채팅방 생성 실패:", res.status, res.statusText)
        throw new Error(`채팅방 생성 실패: ${res.status}`)
      }

      const newRoom = await res.json()
      console.log("✅ 채팅방 생성 성공:", newRoom)

      // 🔧 중복 방지를 위해 기존 목록에서 같은 방 제거 후 추가
      setRooms((prev) => {
        const filtered = prev.filter(room => room.chatroomId !== newRoom.chatroomId)
        return [newRoom, ...filtered]
      })
      
      return newRoom
    } catch (error) {
      console.error("❌ 채팅방 생성/찾기 에러:", error)
      throw error
    } finally {
      setIsRoomsLoading(false)
    }
  }, [rooms])

  const deleteRoom = useCallback(async (chatRoomId: number) => {
    console.log("🗑️ 채팅방 삭제 시작:", chatRoomId)
    setIsRoomsLoading(true)

    try {
      const res = await fetch(`${BASE_URL}/api/chat-rooms/${chatRoomId}`, { method: "DELETE" })

      if (!res.ok) {
        console.error("❌ 채팅방 삭제 실패:", res.status, res.statusText)
        throw new Error(`채팅방 삭제 실패: ${res.status}`)
      }

      console.log("✅ 채팅방 삭제 성공:", chatRoomId)
      setRooms((prev) => prev.filter((room) => room.chatroomId !== chatRoomId))
    } catch (error) {
      console.error("❌ 채팅방 삭제 에러:", error)
      throw error
    } finally {
      setIsRoomsLoading(false)
    }
  }, [])

  useEffect(() => {
    console.log("🔄 useChatRooms useEffect 실행:", { userId })
    if (userId) loadRooms()
  }, [userId, loadRooms])

  return { rooms, isRoomsLoading, loadRooms, createRoom, deleteRoom }
}
