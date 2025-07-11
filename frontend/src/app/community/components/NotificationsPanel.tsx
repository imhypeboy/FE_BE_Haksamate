import React from "react"
import { Bell, Heart, MessageCircle, Plus, X } from "lucide-react"

interface Notification {
  id: string
  type: "like" | "comment" | "new_post"
  message: string
  timestamp: Date
  read: boolean
}

interface NotificationsPanelProps {
  notifications: Notification[]
  onClose: () => void
  onClearAll: () => void
}

export const NotificationsPanel: React.FC<NotificationsPanelProps> = ({
  notifications,
  onClose,
  onClearAll,
}) => {
  return (
    <div
      className="absolute top-20 right-4 md:right-6 z-50 w-80 max-w-[calc(100vw-2rem)] animate-in slide-in-from-top duration-200"
      data-notification-panel
    >
      <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 dark:border-slate-600/20 overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200/20 dark:border-slate-600/20">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">
              알림
            </h3>
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            </button>
          </div>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-6 text-center">
              <Bell className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 dark:text-slate-400 text-sm">
                새로운 알림이 없습니다
              </p>
            </div>
          ) : (
            <div className="py-2">
              {notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-l-4 ${
                    notification.read
                      ? "border-transparent"
                      : notification.type === "like"
                      ? "border-red-400"
                      : notification.type === "comment"
                      ? "border-blue-400"
                      : "border-green-400"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        notification.type === "like"
                          ? "bg-red-100 dark:bg-red-900/30"
                          : notification.type === "comment"
                          ? "bg-blue-100 dark:bg-blue-900/30"
                          : "bg-green-100 dark:bg-green-900/30"
                      }`}
                    >
                      {notification.type === "like" && (
                        <Heart className="w-4 h-4 text-red-500" />
                      )}
                      {notification.type === "comment" && (
                        <MessageCircle className="w-4 h-4 text-blue-500" />
                      )}
                      {notification.type === "new_post" && (
                        <Plus className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
                        {notification.message}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {notification.timestamp.toLocaleString("ko-KR", {
                          hour: "2-digit",
                          minute: "2-digit",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {notifications.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-200/20 dark:border-slate-600/20 bg-slate-50/50 dark:bg-slate-800/50">
            <button
              onClick={onClearAll}
              className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
            >
              모든 알림 지우기
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 