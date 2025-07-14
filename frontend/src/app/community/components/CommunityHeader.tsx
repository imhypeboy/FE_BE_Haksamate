import React from "react"
import { Search, Bell, X, MessageSquare } from "lucide-react"
import { StatusIndicator } from '@/components/ui/StatusIndicator'

interface CommunityHeaderProps {
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  toggleNotifications: () => void
  unreadCount: number
  showMobileSearch: boolean
  setShowMobileSearch: (show: boolean) => void
}

export const CommunityHeader: React.FC<CommunityHeaderProps> = ({
  sidebarOpen,
  setSidebarOpen,
  searchQuery,
  setSearchQuery,
  toggleNotifications,
  unreadCount,
  showMobileSearch,
  setShowMobileSearch,
}) => {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-b border-white/20 dark:border-slate-700/20 shadow-lg shadow-black/5 dark:shadow-black/20 transition-colors duration-300">
      <div className="py-3 px-4 md:px-6">
        <div className="flex items-center justify-between relative">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden p-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/30 dark:border-slate-600/30 rounded-xl hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-200"
            >
              <div className="w-5 h-5 flex flex-col justify-center space-y-1">
                <div className="w-full h-0.5 bg-slate-600 dark:bg-slate-400"></div>
                <div className="w-full h-0.5 bg-slate-600 dark:bg-slate-400"></div>
                <div className="w-full h-0.5 bg-slate-600 dark:bg-slate-400"></div>
              </div>
            </button>
          </div>

          <div className="absolute left-1/2 transform -translate-x-1/2 flex items-center gap-2 md:gap-3">
            <div className="w-8 md:w-10 h-8 md:h-10 bg-slate-100 dark:bg-slate-700 rounded-xl md:rounded-2xl flex items-center justify-center border border-slate-200/50 dark:border-slate-600/50">
              <MessageSquare className="w-4 md:w-5 h-4 md:h-5 text-slate-700 dark:text-slate-300" />
            </div>
            <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-slate-800 via-blue-800 to-purple-800 bg-clip-text text-transparent whitespace-nowrap">
              대학생 커뮤니티
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
                <input
                  type="text"
                  placeholder="게시글 검색..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-600/80 rounded-2xl text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500/50 shadow-lg transition-all duration-300"
                />
              </div>
              <button
                onClick={toggleNotifications}
                data-notification-button
                className="relative p-2 bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm border border-white/30 dark:border-slate-600/30 rounded-xl hover:bg-white/80 dark:hover:bg-slate-800/80 transition-all duration-200"
              >
                <Bell className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                {unreadCount > 0 && (
                  <StatusIndicator 
                    status="error" 
                    size="lg" 
                    animate 
                    className="absolute -top-1 -right-1 text-xs font-bold"
                  />
                )}
              </button>
            </div>

            <div className="md:hidden flex items-center gap-2">
              <button
                onClick={() => setShowMobileSearch(!showMobileSearch)}
                className="p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-600/60 rounded-xl hover:bg-white dark:hover:bg-slate-800 hover:border-blue-500/50 shadow-md transition-all duration-200"
              >
                <Search className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              </button>
            </div>
          </div>
        </div>

        {showMobileSearch && (
          <div className="md:hidden mt-3 animate-in slide-in-from-top duration-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-500 dark:text-slate-400" />
              <input
                type="text"
                placeholder="게시글 검색..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 pr-10 py-3 w-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-600/80 rounded-2xl text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-500/50 shadow-xl transition-all duration-300"
              />
              <button
                onClick={() => setShowMobileSearch(false)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
} 