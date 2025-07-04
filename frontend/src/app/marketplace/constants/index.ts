export const CATEGORIES = ["전체", "전자기기", "의류", "도서", "생활용품", "스포츠", "기타"] as const

export const ITEM_STATUS = {
  AVAILABLE: "AVAILABLE",
  RESERVED: "RESERVED", 
  SOLD: "SOLD",
} as const

export const TRANSACTION_STATUS = {
  PENDING: "PENDING",
  CONFIRMED: "CONFIRMED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const

export const REPORT_REASONS = ["부적절한 내용", "스팸/광고", "사기 의심", "기타"] as const

export const BASE_URL = "http://localhost:8080"

// 카테고리별 아이콘과 개수 정보
export const CATEGORY_INFO = [
  { id: "all", name: "전체", icon: "🛍️", count: 0 },
  { id: "전자기기", name: "전자기기", icon: "📱", count: 0 },
  { id: "의류", name: "의류", icon: "👕", count: 0 },
  { id: "도서", name: "도서", icon: "📚", count: 0 },
  { id: "생활용품", name: "생활용품", icon: "🏠", count: 0 },
  { id: "스포츠", name: "스포츠", icon: "⚽", count: 0 },
  { id: "기타", name: "기타", icon: "📦", count: 0 },
] as const

export type CategoryType = typeof CATEGORIES[number]
export type ItemStatusType = typeof ITEM_STATUS[keyof typeof ITEM_STATUS]
export type TransactionStatusType = typeof TRANSACTION_STATUS[keyof typeof TRANSACTION_STATUS]
export type ReportReasonType = typeof REPORT_REASONS[number]

export const CATEGORIY_INFO = [
  { id: "all", name: "전체", icon: "🏪" },
  { id: "electronics", name: "전자기기", icon: "📱" },
  { id: "books", name: "도서", icon: "📚" },
  { id: "clothing", name: "의류", icon: "👕" },
  { id: "sports", name: "스포츠", icon: "⚽" },
  { id: "beauty", name: "뷰티", icon: "💄" },
  { id: "home", name: "생활용품", icon: "🏠" },
  { id: "food", name: "식품", icon: "🍎" },
  { id: "other", name: "기타", icon: "📦" },
] as const
