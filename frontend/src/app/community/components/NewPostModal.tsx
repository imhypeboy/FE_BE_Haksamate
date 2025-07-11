import React from "react"
import { ImageIcon, Smile, X } from "lucide-react"

interface NewPostModalProps {
  onClose: () => void
  username: string
  newPost: string
  setNewPost: (post: string) => void
  isCreatingPost: boolean
  handleCreatePost: () => void
}

export const NewPostModal: React.FC<NewPostModalProps> = ({
  onClose,
  username,
  newPost,
  setNewPost,
  isCreatingPost,
  handleCreatePost,
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
            새 글 작성
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        <div className="p-6">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm">
                {username[0]?.toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-slate-900 dark:text-slate-100 mb-1">
                {username}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                공개 게시
              </p>
            </div>
          </div>

          <textarea
            value={newPost}
            onChange={e => setNewPost(e.target.value)}
            placeholder="무슨 일이 일어나고 있나요?"
            className="w-full h-40 p-4 border border-slate-200 dark:border-slate-600 rounded-2xl resize-none bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg"
            autoFocus
          />

          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors">
                <ImageIcon className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors">
                <Smile className="w-5 h-5" />
              </button>
            </div>

            <button
              onClick={handleCreatePost}
              disabled={!newPost.trim() || isCreatingPost}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-full font-medium transition-all duration-200 disabled:opacity-50"
            >
              {isCreatingPost ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  게시 중...
                </div>
              ) : (
                "게시하기"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 