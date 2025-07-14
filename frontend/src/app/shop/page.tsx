"use client"

import type React from "react"
import { useState, useCallback, useMemo } from "react"
import { Plus } from "lucide-react"
import Sidebar from "../sidebar/sidebar"
import ProductCard from "./components/ProductCard"
import CategoryFilter from "./components/CategoryFilter"
import SearchBar from "./components/SearchBar"
import type { Product } from "./types"

// 임시 데이터
const SAMPLE_PRODUCTS: Product[] = [
  {
    id: "1",
    title: "맥북 프로 13인치 M2 (2022)",
    description: "거의 새것같은 맥북 프로입니다. 학업용으로 가끔 사용했어요.",
    price: 1800000,
    images: ["/placeholder.svg?height=300&width=300"],
    category: "electronics",
    condition: "like-new",
    location: "서울 강남구",
    sellerId: "user1",
    sellerName: "김학생",
    sellerRating: 4.8,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2시간 전
    updatedAt: new Date(),
    status: "available",
    views: 124,
    likes: 15,
    isLiked: false,
    tags: ["맥북", "노트북", "M2"],
  },
  {
    id: "2",
    title: "대학 전공서적 일괄 판매",
    description: "경영학과 전공서적 10권 일괄 판매합니다. 밑줄 조금 있어요.",
    price: 150000,
    images: ["/placeholder.svg?height=300&width=300"],
    category: "books",
    condition: "good",
    location: "서울 서대문구",
    sellerId: "user2",
    sellerName: "이학생",
    sellerRating: 4.5,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5시간 전
    updatedAt: new Date(),
    status: "available",
    views: 89,
    likes: 8,
    isLiked: true,
    tags: ["전공서적", "경영학", "교재"],
  },
  {
    id: "3",
    title: "아이폰 14 Pro 128GB 딥퍼플",
    description: "케이스 끼고 사용해서 스크래치 없습니다. 배터리 효율 98%",
    price: 950000,
    images: ["/placeholder.svg?height=300&width=300"],
    category: "mobile",
    condition: "like-new",
    location: "서울 마포구",
    sellerId: "user3",
    sellerName: "박학생",
    sellerRating: 4.9,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1일 전
    updatedAt: new Date(),
    status: "reserved",
    views: 256,
    likes: 32,
    isLiked: false,
    tags: ["아이폰", "스마트폰", "애플"],
  },
  {
    id: "4",
    title: "소니 WH-1000XM4 헤드폰",
    description: "노이즈 캔슬링 헤드폰입니다. 박스, 케이블 모두 있어요.",
    price: 180000,
    images: ["/placeholder.svg?height=300&width=300"],
    category: "audio",
    condition: "good",
    location: "서울 종로구",
    sellerId: "user4",
    sellerName: "최학생",
    sellerRating: 4.7,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3일 전
    updatedAt: new Date(),
    status: "available",
    views: 67,
    likes: 12,
    isLiked: false,
    tags: ["헤드폰", "소니", "노이즈캔슬링"],
  },
]

const MarketplacePage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [products, setProducts] = useState<Product[]>(SAMPLE_PRODUCTS)
  const [showFilters, setShowFilters] = useState(false)

  // 필터링된 상품 목록
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // 카테고리 필터
      if (selectedCategory !== "all" && product.category !== selectedCategory) {
        return false
      }

      // 검색어 필터
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        return (
          product.title.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.tags.some((tag) => tag.toLowerCase().includes(query))
        )
      }

      return true
    })
  }, [products, selectedCategory, searchQuery])

  const handleLike = useCallback((productId: string) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === productId
          ? {
              ...product,
              isLiked: !product.isLiked,
              likes: product.isLiked ? product.likes - 1 : product.likes + 1,
            }
          : product,
      ),
    )
  }, [])

  const handleChat = useCallback((sellerId: string) => {
    console.log("채팅 시작:", sellerId)
    // 채팅 모달 열기 로직
  }, [])

  const handleProductClick = useCallback((product: Product) => {
    console.log("상품 상세보기:", product.id)
    // 상품 상세 페이지로 이동 또는 모달 열기
  }, [])

  return (
    <>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="min-h-screen bg-gray-50">
        {/* 헤더 */}
        <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold text-gray-900">🥕 중고마켓</h1>
                <span className="text-sm text-gray-500">우리 학교 학생들과 안전한 거래</span>
              </div>

              <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl font-medium transition-colors duration-200 flex items-center gap-2">
                <Plus size={20} />
                판매하기
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 사이드바 (데스크톱) */}
            <div className="hidden lg:block">
              <div className="space-y-6">
                <CategoryFilter selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
              </div>
            </div>

            {/* 메인 컨텐츠 */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                {/* 검색바 */}
                <SearchBar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onFilterClick={() => setShowFilters(!showFilters)}
                />

                {/* 모바일 카테고리 (필터 열렸을 때) */}
                {showFilters && (
                  <div className="lg:hidden">
                    <CategoryFilter selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
                  </div>
                )}

                {/* 결과 헤더 */}
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedCategory === "all" ? "전체 상품" : `${selectedCategory} 상품`}
                    <span className="text-sm font-normal text-gray-500 ml-2">({filteredProducts.length}개)</span>
                  </h2>
                </div>

                {/* 상품 그리드 */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onLike={handleLike}
                      onChat={handleChat}
                      onClick={handleProductClick}
                    />
                  ))}
                </div>

                {/* 빈 상태 */}
                {filteredProducts.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">검색 결과가 없습니다</h3>
                    <p className="text-gray-500">다른 검색어나 카테고리를 시도해보세요</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default MarketplacePage
