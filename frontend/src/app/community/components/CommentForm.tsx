import React from "react"

interface CommentFormProps {
  value: string
  onChange: (value: string) => void
  onSubmit: () => void
  username: string
}

export const CommentForm: React.FC<CommentFormProps> = ({
  value,
  onChange,
  onSubmit,
  username,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      onSubmit()
    }
  }

  return (
    <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl">
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
        <span className="text-white font-semibold text-xs">
          {username[0]?.toUpperCase()}
        </span>
      </div>
      <div className="flex-1 flex items-center gap-2">
        <input
          className="flex-1 px-4 py-2 text-sm rounded-full border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          type="text"
          placeholder="댓글 추가..."
          value={value}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm rounded-full transition-all duration-200 font-medium flex-shrink-0"
          onClick={onSubmit}
        >
          등록
        </button>
      </div>
    </div>
  )
} 