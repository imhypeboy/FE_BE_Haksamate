"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import {
  MessageSquare,
  Users,
  Hash,
  MessageCircle,
  Share,
  Trash2,
  Plus,
  TrendingUp,
  FlameIcon as Fire,
  Heart,
  Send,
  ImageIcon,
  Smile,
  MoreHorizontal,
  Search,
  Bell,
  Bookmark,
  X,
} from "lucide-react"
import Sidebar from "../sidebar/sidebar"
import {
  fetchPosts,
  createPost,
  deletePost,
  fetchUserLikedPostIds,
  likePost,
  unlikePost,
  fetchComments,
  createComment,
  deleteComment,
} from "@/lib/community"
import { supabase } from "@/lib/supabaseClient"
import { useRouter } from "next/navigation"
import { Post, Comment } from "./types"
import { PostCard } from "./components/PostCard"
import { CommunityHeader } from "./components/CommunityHeader"
import { RightSidebar } from "./components/RightSidebar"
import { NewPostModal } from "./components/NewPostModal"
import { NotificationsPanel } from "./components/NotificationsPanel"
import { MockDataFactory, type MockUser } from '@/lib/mockData'
import { StatusIndicator } from '@/components/ui/StatusIndicator'

// User 타입을 Supabase User와 호환되도록 수정
interface CommunityUser {
  id: string
  email?: string
  username?: string
}

export default function CommunityPage() {
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"all" | "popular" | "following">(
    "all",
  )
  const [newPost, setNewPost] = useState("")
  const [posts, setPosts] = useState<Post[]>([])
  const [user, setUser] = useState<CommunityUser | null>(null)
  const [username, setUsername] = useState<string>("")
  const [likedPostIds, setLikedPostIds] = useState<number[]>([])
  const [bookmarkedPostIds, setBookmarkedPostIds] = useState<number[]>([])
  const [comments, setComments] = useState<Record<number, Comment[]>>({})
  const [newComment, setNewComment] = useState<Record<number, string>>({})
  const [showComments, setShowComments] = useState<Record<number, boolean>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isCreatingPost, setIsCreatingPost] = useState(false)
  const [showNewPostForm, setShowNewPostForm] = useState(false)
  const [showNewPostModal, setShowNewPostModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showMobileSearch, setShowMobileSearch] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [isPullRefreshing, setIsPullRefreshing] = useState(false)
  const [pullDistance, setPullDistance] = useState(0)
  const [startY, setStartY] = useState(0)

  const [
    notifications,
    setNotifications,
  ] = useState<
    Array<{
      id: string
      type: "like" | "comment" | "new_post"
      message: string
      timestamp: Date
      read: boolean
    }>
  >([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  // 알림 패널 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      if (
        showNotifications &&
        !target.closest("[data-notification-panel]") &&
        !target.closest("[data-notification-button]")
      ) {
        setShowNotifications(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showNotifications])

  // 알림 추가 함수
  const addNotification = useCallback(
    (type: "like" | "comment" | "new_post", message: string) => {
      const newNotification = {
        id: Date.now().toString(),
        type,
        message,
        timestamp: new Date(),
        read: false,
      }

      setNotifications(prev => [newNotification, ...prev].slice(0, 10)) // 최대 10개
      setUnreadCount(prev => prev + 1)

      // 3초 후 자동으로 읽음 처리
      setTimeout(() => {
        setNotifications(prev =>
          prev.map(notif =>
            notif.id === newNotification.id ? { ...notif, read: true } : notif,
          ),
        )
        setUnreadCount(prev => Math.max(0, prev - 1))
      }, 3000)
    },
    [],
  )

  // WebSocket 시뮬레이션 (실제 환경에서는 실제 WebSocket 사용)
  useEffect(() => {
    if (!user) return

    const simulateRealTimeEvents = () => {
      const events = [
        () =>
          addNotification("like", "누군가가 당신의 게시글에 좋아요를 눌렀습니다! ❤️"),
        () => addNotification("comment", "새로운 댓글이 달렸습니다! 💬"),
        () =>
          addNotification("new_post", "팔로우한 사용자가 새 글을 작성했습니다! 📝"),
      ]

      // 랜덤한 시간 간격으로 알림 생성 (10-30초)
      const randomDelay = Math.random() * 20000 + 10000
      const timeout = setTimeout(() => {
        const randomEvent = events[Math.floor(Math.random() * events.length)]
        randomEvent()
        simulateRealTimeEvents() // 재귀적으로 계속 실행
      }, randomDelay)

      return timeout
    }

    const timeout = simulateRealTimeEvents()
    return () => clearTimeout(timeout)
  }, [user, addNotification])

  // 알림 패널 토글
  const toggleNotifications = useCallback(() => {
    setShowNotifications(prev => !prev)
    if (!showNotifications) {
      // 알림 패널 열 때 모든 알림을 읽음 처리
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })))
      setUnreadCount(0)
    }
  }, [showNotifications])

  // 북마크 토글 함수
  const handleBookmark = useCallback((postId: number) => {
    setBookmarkedPostIds(prev => {
      const newBookmarks = prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]

      // 로컬스토리지에 저장
      localStorage.setItem("bookmarkedPosts", JSON.stringify(newBookmarks))

      return newBookmarks
    })
  }, [])

  // 북마크 데이터 로드
  useEffect(() => {
    try {
      const saved = localStorage.getItem("bookmarkedPosts")
      if (saved) {
        setBookmarkedPostIds(JSON.parse(saved))
      }
    } catch (error) {
      console.error("북마크 로드 실패:", error)
    }
  }, [])

  // 댓글 토글 함수
  const toggleComments = useCallback((postId: number) => {
    setShowComments(prev => ({
      ...prev,
      [postId]: !prev[postId],
    }))
  }, [])

  // 인증 확인 - 타입 문제 해결
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        if (!session) {
          router.push("/auth/login")
          return
        }
        
        // Supabase User를 CommunityUser로 변환
        setUser({
          id: session.user.id,
          email: session.user.email
        })

        const { data, error } = await supabase
          .from("profiles")
          .select("nickname")
          .eq("id", session.user.id)
          .single()

        if (!error && data) {
          setUsername(data.nickname)
        } else {
          setUsername(session.user.email?.split("@")[0] || "사용자")
        }

        const liked = await fetchUserLikedPostIds(session.user.id)
        setLikedPostIds(liked)
      } catch (error) {
        console.error("Auth check failed:", error)
      }
    }

    checkAuth()
    loadPosts()
  }, [router])

  // 게시글 로드
  const loadPosts = useCallback(
    async (isInitial = true) => {
      if (isInitial) {
        setIsLoading(true)
        setPage(1)
      } else {
        setIsLoadingMore(true)
      }

      try {
        const data = await fetchPosts()

        if (isInitial) {
          setPosts(data)
        } else {
          // 실제로는 페이지네이션 API가 필요하지만, 현재는 시뮬레이션
          setPosts(prev => [
            ...prev,
            ...data.slice(prev.length, prev.length + 5),
          ])
        }

        // 댓글 로드 최적화
        const commentsData: Record<number, Comment[]> = {}
        await Promise.all(
          data.map(async post => {
            try {
              const postComments = await fetchComments(post.id)
              commentsData[post.id] = postComments
            } catch (error) {
              console.error(
                `Failed to fetch comments for post ${post.id}:`,
                error,
              )
              commentsData[post.id] = []
            }
          }),
        )
        setComments(prev => ({ ...prev, ...commentsData }))

        // 댓글 숨김 상태 초기화 (기본적으로 모든 댓글 숨김)
        const initialCommentState: Record<number, boolean> = {}
        data.forEach(post => {
          initialCommentState[post.id] = false
        })
        setShowComments(prev => ({ ...prev, ...initialCommentState }))

        // 더 로드할 데이터가 있는지 확인 (실제로는 API 응답에서 확인)
        if (data.length < 10) {
          setHasMore(false)
        }
      } catch (error) {
        console.error("Failed to load posts:", error)
      } finally {
        setIsLoading(false)
        setIsLoadingMore(false)
      }
    },
    [],
  )

  // Pull-to-Refresh 함수
  const handlePullRefresh = useCallback(async () => {
    setIsPullRefreshing(true)
    try {
      await loadPosts(true)
    } finally {
      setIsPullRefreshing(false)
      setPullDistance(0)
    }
  }, [loadPosts])

  // 터치 이벤트 핸들러들
  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (window.scrollY === 0) {
      setStartY(e.touches[0].clientY)
    }
  }, [])

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (window.scrollY === 0 && startY > 0) {
        const currentY = e.touches[0].clientY
        const distance = Math.max(0, currentY - startY)

        if (distance > 0) {
          e.preventDefault()
          setPullDistance(Math.min(distance * 0.5, 100)) // 최대 100px
        }
      }
    },
    [startY],
  )

  const handleTouchEnd = useCallback(() => {
    if (pullDistance > 60 && !isPullRefreshing) {
      handlePullRefresh()
    } else {
      setPullDistance(0)
    }
    setStartY(0)
  }, [pullDistance, isPullRefreshing, handlePullRefresh])

  // 터치 이벤트 리스너 등록
  useEffect(() => {
    const element = document.body
    element.addEventListener("touchstart", handleTouchStart, { passive: false })
    element.addEventListener("touchmove", handleTouchMove, { passive: false })
    element.addEventListener("touchend", handleTouchEnd)

    return () => {
      element.removeEventListener("touchstart", handleTouchStart)
      element.removeEventListener("touchmove", handleTouchMove)
      element.removeEventListener("touchend", handleTouchEnd)
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd])

  // 무한 스크롤 감지
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
          document.documentElement.offsetHeight - 1000 &&
        hasMore &&
        !isLoadingMore &&
        !isLoading
      ) {
        setPage(prev => prev + 1)
        loadPosts(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [hasMore, isLoadingMore, isLoading, loadPosts])

  // 게시글 생성
  const handleCreatePost = useCallback(async () => {
    if (!newPost.trim() || !user || isCreatingPost) return

    setIsCreatingPost(true)
    try {
      await createPost({
        author_id: user.id,
        author_username: username,
        content: newPost.trim(),
        tags: [],
      })
      setNewPost("")
      setShowNewPostForm(false)
      await loadPosts()
    } catch (error) {
      console.error("Failed to create post:", error)
      alert("게시글 등록에 실패했습니다.")
    } finally {
      setIsCreatingPost(false)
    }
  }, [newPost, user, username, isCreatingPost, loadPosts])

  // 게시글 삭제
  const handleDeletePost = useCallback(
    async (id: number) => {
      if (!user) return
      if (!window.confirm("정말 삭제하시겠습니까?")) return

      try {
        await deletePost(id, user.id)
        await loadPosts()
      } catch (error) {
        console.error("Failed to delete post:", error)
        alert("게시글 삭제에 실패했습니다.")
      }
    },
    [user, loadPosts],
  )

  // 좋아요 토글
  const handleLike = useCallback(
    async (postId: number) => {
      if (!user) {
        alert("로그인이 필요합니다.")
        return
      }

      try {
        if (likedPostIds.includes(postId)) {
          await unlikePost(postId, user.id)
          setLikedPostIds(prev => prev.filter(id => id !== postId))
        } else {
          await likePost(postId, user.id)
          setLikedPostIds(prev => [...prev, postId])
        }
        await loadPosts()
      } catch (error) {
        console.error("Failed to toggle like:", error)
        alert("좋아요 처리에 실패했습니다.")
      }
    },
    [user, likedPostIds, loadPosts],
  )

  // 댓글 추가
  const handleAddComment = useCallback(
    async (postId: number) => {
      if (!user) {
        alert("로그인이 필요합니다.")
        return
      }

      const content = newComment[postId]?.trim()
      if (!content) return

      try {
        await createComment({
          post_id: postId,
          author_id: user.id,
          author_username: username,
          content,
        })
        setNewComment(prev => ({ ...prev, [postId]: "" }))

        const postComments = await fetchComments(postId)
        setComments(prev => ({ ...prev, [postId]: postComments }))
        await loadPosts()
      } catch (error) {
        console.error("Failed to add comment:", error)
        alert("댓글 등록에 실패했습니다.")
      }
    },
    [user, username, newComment, loadPosts],
  )

  // 댓글 삭제
  const handleDeleteComment = useCallback(
    async (commentId: number, postId: number) => {
      if (!user) return

      try {
        await deleteComment(commentId, user.id)
        const postComments = await fetchComments(postId)
        setComments(prev => ({ ...prev, [postId]: postComments }))
        await loadPosts()
      } catch (error) {
        console.error("Failed to delete comment:", error)
        alert("댓글 삭제에 실패했습니다.")
      }
    },
    [user, loadPosts],
  )

  // 필터링된 게시글 - 인기글 로직 추가
  const filteredPosts = useMemo(() => {
    let filtered = posts.filter(post =>
      searchQuery
        ? post.content.toLowerCase().includes(searchQuery.toLowerCase())
        : true,
    )

    // 탭에 따른 정렬
    if (activeTab === "popular") {
      // 인기글: 일단 간단히 좋아요 수로만 정렬 (테스트)
      filtered = filtered.sort((a, b) => {
        return b.likes - a.likes
      })
    } else if (activeTab === "following") {
      // 좋아요: 내가 좋아요 누른 게시글만 표시
      filtered = filtered.filter(post => likedPostIds.includes(post.id))
      // 최신순으로 정렬
      filtered = filtered.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
    } else {
      // 전체: 최신순
      filtered = filtered.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
    }

    return filtered
  }, [posts, searchQuery, activeTab, comments])

  const handleCreatePostWithModalClose = async () => {
    await handleCreatePost()
    setShowNewPostModal(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 relative overflow-hidden transition-colors duration-300">
      {/* 배경 장식 요소들 - 성능 최적화 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/10 to-orange-400/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-cyan-400/5 to-blue-400/5 rounded-full blur-3xl"></div>
      </div>

      <div className="flex relative z-10">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        {/* 메인 컨텐츠 영역 - 레이아웃 개선 */}
        <div
          className={`flex-1 transition-all duration-300 ease-out ${
            sidebarOpen ? "md:ml-[280px]" : "ml-0"
          }`}
        >
          {/* Pull-to-Refresh 인디케이터 */}
          <div
            className="md:hidden fixed top-0 left-0 right-0 z-50 flex justify-center transition-transform duration-300 ease-out"
            style={{
              transform: `translateY(${pullDistance - 60}px)`,
              opacity: pullDistance > 20 ? 1 : 0,
            }}
          >
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm rounded-b-2xl px-6 py-3 shadow-lg">
              {isPullRefreshing ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-blue-200 dark:border-blue-300 border-t-blue-500 dark:border-t-blue-400 rounded-full animate-spin"></div>
                  <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                    새로고침 중...
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <div
                    className={`transition-transform duration-200 ${
                      pullDistance > 60 ? "rotate-180" : ""
                    } text-slate-600 dark:text-slate-300`}
                  >
                    ↓
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                    {pullDistance > 60
                      ? "놓아서 새로고침"
                      : "아래로 당겨서 새로고침"}
                  </span>
                </div>
              )}
            </div>
          </div>

          <CommunityHeader
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            toggleNotifications={toggleNotifications}
            unreadCount={unreadCount}
            showMobileSearch={showMobileSearch}
            setShowMobileSearch={setShowMobileSearch}
          />

          {/* 알림 패널 */}
          {showNotifications && (
            <NotificationsPanel
              notifications={notifications}
              onClose={toggleNotifications}
              onClearAll={() => {
                setNotifications([])
                setUnreadCount(0)
              }}
            />
          )}

          <div className="flex">
            {/* 메인 컨텐츠 - 개선된 레이아웃 */}
            <main className="flex-1 p-4 md:p-6 max-w-4xl mx-auto w-full">
              {/* Material Design 3 세그먼트 컨트롤 */}
              <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-6 mb-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  {/* 스프링 애니메이션이 적용된 세그먼트 컨트롤 */}
                  <div className="relative bg-slate-100 dark:bg-slate-700 rounded-full p-1 w-full md:w-auto">
                    {/* 활성 탭 배경 애니메이션 */}
                    <div
                      className="absolute top-1 h-[calc(100%-8px)] bg-white dark:bg-slate-600 rounded-full shadow-sm transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                      style={{
                        left:
                          activeTab === "all"
                            ? "4px"
                            : activeTab === "popular"
                            ? "calc(33.333% + 1px)"
                            : "calc(66.666% - 2px)",
                        width: "calc(33.333% - 2px)",
                      }}
                    />

                    <nav className="relative flex w-full md:w-auto">
                      {(["all", "popular", "following"] as const).map(tab => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`flex-1 md:flex-none px-6 py-3 text-sm font-medium rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex items-center justify-center gap-2 relative z-10 ${
                            activeTab === tab
                              ? "text-slate-900 dark:text-slate-100"
                              : "text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                          }`}
                        >
                          <div
                            className={`transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                              activeTab === tab ? "scale-110" : "scale-100"
                            }`}
                          >
                            {tab === "all" && (
                              <span
                                className={`text-xs font-bold ${
                                  activeTab === tab ? "text-blue-600" : ""
                                }`}
                              >
                                All
                              </span>
                            )}
                            {tab === "popular" && (
                              <Fire
                                className={`w-4 h-4 ${
                                  activeTab === tab ? "text-orange-500" : ""
                                }`}
                              />
                            )}
                            {tab === "following" && (
                              <Heart
                                className={`w-4 h-4 ${
                                  activeTab === tab ? "text-red-500" : ""
                                }`}
                              />
                            )}
                          </div>
                          <span className="hidden sm:inline">
                            {tab === "all" && "모든글"}
                            {tab === "popular" && "인기"}
                            {tab === "following" && "좋아요"}
                          </span>
                        </button>
                      ))}
                    </nav>
                  </div>
                </div>
              </div>

              {/* 게시글 목록 - 개선된 스켈레톤 로딩 */}
              <div className="space-y-6">
                {isLoading ? (
                  // 스켈레톤 로딩 UI
                  <div className="space-y-6">
                    {[...Array(3)].map((_, index) => (
                      <div
                        key={index}
                        className="backdrop-blur-xl bg-white/70 rounded-3xl shadow-xl shadow-black/5 border border-white/20 p-6 md:p-8 animate-pulse"
                      >
                        {/* 게시글 헤더 스켈레톤 */}
                        <div className="flex items-start gap-4 mb-6">
                          <div className="w-12 h-12 bg-slate-200 rounded-2xl flex-shrink-0"></div>
                          <div className="min-w-0 flex-1">
                            <div className="h-5 bg-slate-200 rounded-lg w-32 mb-2"></div>
                            <div className="h-4 bg-slate-100 rounded-lg w-48"></div>
                          </div>
                          <div className="w-8 h-8 bg-slate-100 rounded-xl"></div>
                        </div>

                        {/* 게시글 내용 스켈레톤 */}
                        <div className="mb-6 space-y-3">
                          <div className="h-4 bg-slate-200 rounded-lg w-full"></div>
                          <div className="h-4 bg-slate-200 rounded-lg w-4/5"></div>
                          <div className="h-4 bg-slate-200 rounded-lg w-3/5"></div>
                        </div>

                        {/* 태그 스켈레톤 */}
                        <div className="flex gap-2 mb-6">
                          <div className="h-6 bg-slate-100 rounded-full w-16"></div>
                          <div className="h-6 bg-slate-100 rounded-full w-20"></div>
                        </div>

                        {/* 액션 버튼 스켈레톤 */}
                        <div className="flex items-center justify-between">
                          <div className="flex gap-4">
                            <div className="h-8 bg-slate-100 rounded-xl w-16"></div>
                            <div className="h-8 bg-slate-100 rounded-xl w-16"></div>
                            <div className="h-8 bg-slate-100 rounded-xl w-16"></div>
                          </div>
                          <div className="h-8 bg-slate-100 rounded-xl w-8"></div>
                        </div>
                      </div>
                    ))}

                    {/* 로딩 인디케이터 */}
                    <div className="text-center py-8">
                      <div className="relative mx-auto w-8 h-8">
                        <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                      </div>
                      <p className="mt-3 text-slate-500 text-sm">
                        게시글을 불러오는 중...
                      </p>
                    </div>
                  </div>
                ) : filteredPosts.length === 0 ? (
                  <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-12 text-center">
                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                      <MessageSquare className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                      {searchQuery
                        ? "검색 결과가 없습니다"
                        : "아직 게시글이 없습니다"}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      {searchQuery
                        ? "다른 키워드로 검색해보세요"
                        : "첫 번째 게시글을 작성해보세요!"}
                    </p>
                  </div>
                ) : (
                  filteredPosts.map(post => (
                    <PostCard
                      key={post.id}
                      post={post}
                      user={user}
                      username={username}
                      isLiked={likedPostIds.includes(post.id)}
                      isBookmarked={bookmarkedPostIds.includes(post.id)}
                      areCommentsVisible={!!showComments[post.id]}
                      commentsForPost={comments[post.id] || []}
                      newComment={newComment[post.id] || ""}
                      onNewCommentChange={value =>
                        setNewComment(prev => ({ ...prev, [post.id]: value }))
                      }
                      onLike={() => handleLike(post.id)}
                      onBookmark={() => handleBookmark(post.id)}
                      onToggleComments={() => toggleComments(post.id)}
                      onDelete={() => handleDeletePost(post.id)}
                      onAddComment={() => handleAddComment(post.id)}
                      onDeleteComment={commentId =>
                        handleDeleteComment(commentId, post.id)
                      }
                    />
                  ))
                )}

                {/* 무한 스크롤 로딩 인디케이터 */}
                {isLoadingMore && (
                  <div className="text-center py-8">
                    <div className="relative mx-auto w-8 h-8">
                      <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                    <p className="mt-3 text-slate-500 text-sm">
                      더 많은 게시글을 불러오는 중...
                    </p>
                  </div>
                )}

                {/* 모든 게시글을 불러왔을 때 */}
                {!hasMore && filteredPosts.length > 0 && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 text-sm">
                      모든 게시글을 확인했습니다! 🎉
                    </p>
                  </div>
                )}
              </div>
            </main>

            <RightSidebar />
          </div>
        </div>

        {/* 모바일용 플로팅 액션 버튼 */}
        {user && (
          <button
            onClick={() => setShowNewPostModal(true)}
            className="md:hidden fixed bottom-4 sm:bottom-6 right-4 sm:right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-2xl shadow-lg shadow-blue-600/25 transition-all duration-200 hover:scale-105 active:scale-95 z-50 flex items-center justify-center"
          >
            <Plus className="w-6 h-6" />
          </button>
        )}

        {/* 새 글 작성 모달 */}
        {showNewPostModal && (
          <NewPostModal
            onClose={() => {
              setShowNewPostModal(false)
              setNewPost("")
            }}
            username={username}
            newPost={newPost}
            setNewPost={setNewPost}
            isCreatingPost={isCreatingPost}
            handleCreatePost={handleCreatePostWithModalClose}
          />
        )}
      </div>
    </div>
  )
}