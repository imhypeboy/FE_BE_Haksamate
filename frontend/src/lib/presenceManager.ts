import { supabase } from "@/lib/supabaseClient"
import type { RealtimeChannel } from "@supabase/supabase-js"

class PresenceManager {
  private static instance: PresenceManager
  private channel: RealtimeChannel | null = null
  private subscribers: Set<(onlineIds: string[]) => void> = new Set()
  private currentUserId: string | null = null
  private onlineIds: string[] = []
  private isSubscribed = false

  static getInstance(): PresenceManager {
    if (!PresenceManager.instance) {
      PresenceManager.instance = new PresenceManager()
    }
    return PresenceManager.instance
  }

  private constructor() {}

  async initialize(userId: string): Promise<void> {
    if (this.currentUserId === userId && this.isSubscribed) {
      // 이미 같은 사용자로 초기화되어 있으면 현재 상태 반환
      this.notifySubscribers()
      return
    }

    // 기존 채널 정리
    await this.cleanup()

    this.currentUserId = userId

    try {
      // 새 채널 생성
      this.channel = supabase.channel("online-users", {
        config: {
          presence: {
            key: userId,
          },
        },
      })

      // 이벤트 리스너 설정
      this.channel
        .on("presence", { event: "sync" }, () => {
          console.log("Presence sync 이벤트 발생")
          this.updateOnlineUsers()
        })
        .on("presence", { event: "join" }, ({ key, newPresences }) => {
          console.log("사용자 접속:", key, newPresences)
          this.updateOnlineUsers()
        })
        .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
          console.log("사용자 퇴장:", key, leftPresences)
          this.updateOnlineUsers()
        })

      // 채널 구독
      const subscriptionResult = await this.channel.subscribe(async (status) => {
        console.log("채널 구독 상태:", status)

        if (status === "SUBSCRIBED") {
          this.isSubscribed = true
          // 현재 사용자를 온라인으로 표시
          const trackResult = await this.channel!.track({
            user_id: userId,
            online_at: new Date().toISOString(),
          })
          console.log("사용자 추적 결과:", trackResult)
          this.updateOnlineUsers()
        } else if (status === "CHANNEL_ERROR") {
          console.error("채널 연결 오류")
          this.isSubscribed = false
        } else if (status === "TIMED_OUT") {
          console.error("연결 시간 초과")
          this.isSubscribed = false
        } else if (status === "CLOSED") {
          console.log("채널 연결 종료")
          this.isSubscribed = false
        }
      })

      if (subscriptionResult === "error") {
        throw new Error("채널 구독 실패")
      }
    } catch (error) {
      console.error("Presence 초기화 오류:", error)
      this.isSubscribed = false
      throw error
    }
  }

  private updateOnlineUsers(): void {
    if (!this.channel) return

    try {
      const state = this.channel.presenceState()
      this.onlineIds = Object.keys(state)
      console.log("온라인 사용자 업데이트:", this.onlineIds)
      this.notifySubscribers()
    } catch (error) {
      console.error("온라인 사용자 업데이트 오류:", error)
    }
  }

  private notifySubscribers(): void {
    this.subscribers.forEach((callback) => {
      try {
        callback([...this.onlineIds])
      } catch (error) {
        console.error("구독자 알림 오류:", error)
      }
    })
  }

  subscribe(callback: (onlineIds: string[]) => void): () => void {
    this.subscribers.add(callback)

    // 현재 상태를 즉시 전달
    if (this.onlineIds.length > 0) {
      callback([...this.onlineIds])
    }

    // 구독 해제 함수 반환
    return () => {
      this.subscribers.delete(callback)
    }
  }

  async cleanup(): Promise<void> {
    if (this.channel) {
      console.log("채널 정리 중...")
      try {
        await this.channel.unsubscribe()
      } catch (error) {
        console.error("채널 구독 해제 오류:", error)
      }
      this.channel = null
    }

    this.isSubscribed = false
    this.onlineIds = []
    this.currentUserId = null
    this.subscribers.clear()
  }

  getOnlineIds(): string[] {
    return [...this.onlineIds]
  }

  isOnline(userId: string): boolean {
    return this.onlineIds.includes(userId)
  }

  getCurrentUserId(): string | null {
    return this.currentUserId
  }

  getSubscriberCount(): number {
    return this.subscribers.size
  }
}

export const presenceManager = PresenceManager.getInstance()
