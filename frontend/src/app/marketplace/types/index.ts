export interface Product {
  itemid: number
  name: string
  title: string
  description: string
  price: number
  category: string
  status: "판매중" | "예약중" | "거래완료"
  regdate: number
  completedDate?: string
  comment?: string
  thumbnail?: string
  time?: string
  sellerId: string
  sellerName: string
  sellerAvatar?: string
  buyerId?: string
  itemImages: string[]
  imageUrl: string
  meetLocation: {
    address: string
    lat: number
    lng: number
  }
  tags?: string[]
  isLiked: boolean
  likeCount: number
  viewCount: number
}

export interface CreateProductRequest {
  title: string
  description: string
  price: number
  category: string
  sellerId: string|undefined
  itemImages: string[] // 수정 시 사용
  meetLocation: {
    address: string
    lat: number
    lng: number
  }
  status: "판매중" | "예약중" | "거래완료"
}

export interface UpdateProductRequest {
  title: string
  description: string
  price: number
  category: string
  sellerId: string|undefined
  itemImages: string[] // 수정 시 사용
  meetLocation: {
    address: string
    lat: number
    lng: number
  }
  status: "판매중" | "예약중" | "거래완료"
}

export interface SearchFilters {
  category?: string
  minPrice?: number
  maxPrice?: number
  location?: string
  sortBy?: "latest" | "price_low" | "price_high" | "popular"
}

export interface LocationData {
  address: string
  latitude: number
  longitude: number
}

export interface CreateReviewRequest {
  itemId: number
  sellerId: string
  rating: number
  comment: string
}

export interface Review {
  id: string
  itemId: string
  sellerId: string
  buyerId: string
  rating: number
  comment: string
  createdAt: string
  buyerName: string
  reviewerName: string
  buyerAvatar?: string
}

export interface CreateReportRequest {
  reporterId: string|null|undefined
  reportedId: string
  itemId?: number
  reason: string
}

export interface Transaction {
  transactionid: number
  itemId: number
  sellerId: string
  buyerId: string
  status: "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED"
  regdate: number
}

export interface CreateTransactionRequest {
  itemId: number
  sellerId: string
}

export interface SearchHistory {
  id: string
  userId: string
  keyword: string
  searchedAt: string
}

export interface SearchSuggestion {
  keyword: string
  count: number
}

export interface KakaoMapState {
  kakaoLoaded: boolean
  sdkError: string | null
  apiKeyError: string | null
  loadingMessage: string
  apiKey: string | null
}