import type React from "react"

export interface Profile {
  id: string // UUID로 변경
  name: string
  department: string // major 대신 department
  year: number
  profile: string // description 대신 profile
}

export type SegmentType = "matching" | "nearby" | "liked"

export interface SegmentItem {
  id: SegmentType
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}

export interface DragState {
  isDragging: boolean
  dragStart: { x: number; y: number }
  dragCurrent: { x: number; y: number }
}

// 채팅 관련 타입 추가
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
