import React from "react"
import {
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Share,
  Trash2,
} from "lucide-react"
import { Comment, Post } from "../types"
import { CommentSection } from "./CommentSection"

interface PostCardProps {
  post: Post
  user: any
  username: string
  isLiked: boolean
  isBookmarked: boolean
  areCommentsVisible: boolean
  commentsForPost: Comment[]
  newComment: string
  onNewCommentChange: (comment: string) => void
  onLike: () => void
  onBookmark: () => void
  onToggleComments: () => void
  onDelete: () => void
  onAddComment: () => void
  onDeleteComment: (commentId: number) => void
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  user,
  username,
  isLiked,
  isBookmarked,
  areCommentsVisible,
  commentsForPost,
  newComment,
  onNewCommentChange,
  onLike,
  onBookmark,
  onToggleComments,
  onDelete,
  onAddComment,
  onDeleteComment,
}) => {
  return (
    <article className="bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group">
      {/* Post Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25">
              <span className="text-white font-bold text-lg">
                {post.author_username[0]?.toUpperCase()}
              </span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base sm:text-lg truncate">
              {post.author_username}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <span>{new Date(post.created_at).toLocaleString("ko-KR")}</span>
              <span className="w-1 h-1 bg-slate-400 dark:bg-slate-500 rounded-full"></span>
              <span>공개</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {user && user.id === post.author_id && (
            <button
              onClick={onDelete}
              className="p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 transition-all duration-200 opacity-0 group-hover:opacity-100"
              title="삭제"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button className="p-2 rounded-xl bg-white/60 hover:bg-white/80 text-slate-600 hover:text-slate-800 transition-all duration-200 opacity-0 group-hover:opacity-100">
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Post Content */}
      <div className="mb-4 sm:mb-6">
        <p className="text-slate-800 dark:text-slate-200 text-sm sm:text-base md:text-lg leading-relaxed whitespace-pre-wrap break-words">
          {post.content}
        </p>
      </div>

      {/* Tags */}
      {post.tags && post.tags.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {post.tags.map((tag: string) => (
            <span
              key={tag}
              className="px-3 py-1 bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 text-sm rounded-full border border-blue-200/50 hover:from-blue-200 hover:to-purple-200 transition-all duration-200 cursor-pointer"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between mb-6 pt-4 border-t border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-1">
          <button
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-full transition-all duration-200 ${
              isLiked
                ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
            onClick={onLike}
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-current" : ""}`} />
            <span className="font-medium">{post.likes}</span>
          </button>
          <button
            className={`flex items-center gap-2 px-3 py-2 text-sm rounded-full transition-all duration-200 ${
              areCommentsVisible
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            }`}
            onClick={onToggleComments}
          >
            <MessageCircle className="w-4 h-4" />
            <span className="font-medium">{commentsForPost?.length ?? 0}</span>
          </button>
          <button className="flex items-center gap-2 px-3 py-2 text-sm rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all duration-200">
            <Share className="w-4 h-4" />
          </button>
        </div>
        <button
          className={`p-2 rounded-full transition-all duration-200 ${
            isBookmarked
              ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
              : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
          }`}
          onClick={onBookmark}
          title={isBookmarked ? "북마크 제거" : "북마크 추가"}
        >
          <Bookmark
            className={`w-4 h-4 ${isBookmarked ? "fill-current" : ""}`}
          />
        </button>
      </div>

      {/* Comment Section */}
      <CommentSection
        visible={areCommentsVisible}
        comments={commentsForPost}
        currentUser={user}
        username={username}
        newComment={newComment}
        onNewCommentChange={onNewCommentChange}
        onAddComment={onAddComment}
        onDeleteComment={onDeleteComment}
      />
    </article>
  )
} 