import React from "react"
import { Comment } from "../types"
import { CommentItem } from "./CommentItem"
import { CommentForm } from "./CommentForm"

interface CommentSectionProps {
  visible: boolean
  comments: Comment[]
  currentUser: any
  username: string
  newComment: string
  onNewCommentChange: (value: string) => void
  onAddComment: () => void
  onDeleteComment: (commentId: number) => void
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  visible,
  comments,
  currentUser,
  username,
  newComment,
  onNewCommentChange,
  onAddComment,
  onDeleteComment,
}) => {
  return (
    <div
      className={`space-y-4 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] overflow-hidden ${
        visible
          ? "max-h-screen opacity-100 transform translate-y-0"
          : "max-h-0 opacity-0 transform -translate-y-4"
      }`}
    >
      {comments.map(comment => (
        <CommentItem
          key={comment.id}
          comment={comment}
          currentUser={currentUser}
          onDelete={() => onDeleteComment(comment.id)}
        />
      ))}

      {currentUser && (
        <CommentForm
          value={newComment}
          onChange={onNewCommentChange}
          onSubmit={onAddComment}
          username={username}
        />
      )}
    </div>
  )
} 