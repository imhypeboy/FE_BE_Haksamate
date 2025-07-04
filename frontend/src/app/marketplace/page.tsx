"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import Sidebar from "../sidebar/sidebar"
import ProductCard from "./components/ProductCard"
import CategoryFilter from "./components/CategoryFilter"
import SearchBar from "./components/SearchBar"
import Header from "./components/Header"
import ProductModal from "./components/ProductModal"
import AddProductModal from "./components/AddProductModal"
import EditProductModal from "./components/EditProductModal"
import ChatModal from "@/components/ChatModal"
import AnimatedBackground from "../matching/components/AnimatedBackground"
import { useMarketplace } from "./hooks/useMarketplace"
import { useAuth } from "@/hooks/useAuth"
import type { Product, SearchFilters } from "./types"
import ReportModal from "./components/ReportModal"
import { useTransactions } from "./hooks/useTransactions"
import {useReports} from "./hooks/useReports"
import { useKakaoMap } from "@/hooks/useKakaoMap"

const MarketplacePage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [showAddProduct, setShowAddProduct] = useState(false)
  const [showEditProduct, setShowEditProduct] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [reportingProduct, setReportingProduct] = useState<Product | null>(null)

  // 채팅 관련 상태
  const [showChat, setShowChat] = useState(false)
  const [chatSellerId, setChatSellerId] = useState<string | null>(null)
  const { createReport } = useReports()
  const { user, isLoading} = useAuth()
  const {
    products,
    isMarketplaceLoading,
    error,
    loadProducts,
    searchProducts,
    toggleLike,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    updateProductStatus,
    completeTransaction,
  } = useMarketplace()

  const { createTransaction } = useTransactions()
  const kakaoMapState = useKakaoMap()

  
  // 초기 상품 로드
  useEffect(() => {
    console.log("🧑 현재 사용자 ID:", user?.id)
    const filters: SearchFilters = {
      category: selectedCategory,
      sortBy: "latest",
    }
    loadProducts(user?.id,filters)
  }, [user,isLoading, selectedCategory, loadProducts])

  // 검색 처리
  useEffect(() => {
    if (searchQuery.trim()) {
      const filters: SearchFilters = {
        category: selectedCategory,
        sortBy: "latest",
      }
      searchProducts(searchQuery, filters)
    } else {
      const filters: SearchFilters = {
        category: selectedCategory,
        sortBy: "latest",
      }
      loadProducts(user?.id,filters)
    }
  }, [searchQuery, selectedCategory, searchProducts, loadProducts])

  const handleLike = useCallback(
    async (productId: number) => {
      if (!user) {
        alert("로그인이 필요합니다.")
        return
      }

      const product = products.find((p) => p.itemid === productId)
      if (!product) return

      toggleLike(productId,user.id)

    },
    [user, products, toggleLike],
  )

  // 채팅 핸들러
  const handleChat = useCallback(
    async (sellerId: string) => {
      if (!user) {
        alert("로그인이 필요합니다.")
        return
      }

      // Create transaction when starting chat
      try {
        const product = products.find((p) => p.sellerId === sellerId)
        if (product) {
          await createTransaction({
            itemId: product.itemid,
            sellerId: sellerId,
          })
        }
      } catch (error) {
        console.warn("거래 생성 실패:", error)
      }

      console.log("💬 채팅 시작:", { sellerId, userId: user.id })
      setChatSellerId(sellerId)
      setShowChat(true)
    },
    [user, products, createTransaction],
  )

  const handleProductClick = useCallback(
    async (product: Product) => {
      const detailedProduct = await getProduct(product.itemid)
      if (detailedProduct) {
        setSelectedProduct(detailedProduct)
      }
    },
    [getProduct],
  )

  const handleAddProduct = useCallback(() => {
    if (!user) {
      alert("로그인이 필요합니다.")
      return
    }
    setShowAddProduct(true)
  }, [user])

  // 상품 수정 핸들러
  const handleEditProduct = useCallback((product: Product) => {
    setEditingProduct(product)
    setShowEditProduct(true)
  }, [])

  // 상품 삭제 핸들러
  const handleDeleteProduct = useCallback(
    async (productId: number) => {
      try {
        await deleteProduct(productId)
        alert("상품이 삭제되었습니다.")
      } catch (error) {
        alert("상품 삭제에 실패했습니다.")
      }
    },
    [deleteProduct],
  )

  // 상품 상태 변경 핸들러
  const handleStatusChange = useCallback(
    async (productId: number, status: "판매중" | "예약중" | "거래완료") => {
      try {
        await updateProductStatus(productId, status)

        const statusLabels = {
          판매중: "판매중",
          예약중: "예약중",
          거래완료: "판매완료",
        }

        alert(`상품 상태가 "${statusLabels[status]}"로 변경되었습니다.`)
      } catch (error) {
        alert("상품 상태 변경에 실패했습니다.")
      }
    },
    [updateProductStatus],
  )
  const handleReportSubmit = async (reportData: any) => {
    try {
      await createReport(reportData)
      setShowReportModal(false)
      setReportingProduct(null)
    } catch (error) {
      throw error
    }
  }
  // 거래 완료 핸들러
  const handleCompleteTransaction = useCallback(
    async (productId: number) => {
      try {
        await completeTransaction(productId)
        alert("거래가 완료되었습니다!")
      } catch (error) {
        alert("거래 완료 처리에 실패했습니다.")
      }
    },
    [completeTransaction],
  )

  const handleReport = useCallback((product: Product) => {
    setReportingProduct(product)
    setShowReportModal(true)
  }, [])

  const toggleTheme = useCallback(() => {
    setIsDarkMode((prev) => !prev)
  }, [])

  const handleProductAdded = useCallback(() => {
    // 상품 등록 후 목록 새로고침
    const filters: SearchFilters = {
      category: selectedCategory,
      sortBy: "latest",
    }
    loadProducts(user?.id,filters)
    setShowAddProduct(false)
  }, [selectedCategory, loadProducts])

  const handleProductUpdated = useCallback(() => {
    // 상품 수정 후 목록 새로고침
    const filters: SearchFilters = {
      category: selectedCategory,
      sortBy: "latest",
    }
    loadProducts(user?.id,filters)
    setShowEditProduct(false)
    setEditingProduct(null)
    setSelectedProduct(null)
  }, [selectedCategory, loadProducts])

  return (
    <>
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div
        className={`min-h-screen transition-all duration-700 ${
          isDarkMode
            ? "bg-gradient-to-br from-gray-900 to-gray-800"
            : "bg-gradient-to-br from-orange-50 via-red-50 to-pink-50"
        }`}
      >
        <AnimatedBackground isDarkMode={isDarkMode} />

        <Header isDarkMode={isDarkMode} onToggleTheme={toggleTheme} onAddProduct={handleAddProduct} />

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 pb-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* 사이드바 (데스크톱) */}
            <div className="hidden lg:block">
              <div className="space-y-6">
                <CategoryFilter
                  selectedCategory={selectedCategory}
                  onCategoryChange={setSelectedCategory}
                  isDarkMode={isDarkMode}
                />
              </div>
            </div>

            {/* 메인 컨텐츠 */}
            <div className="lg:col-span-3">
              <div className="space-y-6">
                <SearchBar
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onFilterClick={() => setShowFilters(!showFilters)}
                  isDarkMode={isDarkMode}
                />

                {showFilters && (
                  <div className="lg:hidden">
                    <CategoryFilter
                      selectedCategory={selectedCategory}
                      onCategoryChange={setSelectedCategory}
                      isDarkMode={isDarkMode}
                    />
                  </div>
                )}

                {/* 결과 헤더 */}
                <div className="flex items-center justify-between">
                  <h2
                    className={`text-xl font-bold transition-colors duration-500 ${
                      isDarkMode ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {selectedCategory === "all" ? "전체 상품" : `${selectedCategory} 상품`}
                    <span className={`text-base font-normal ml-3 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      ({products.length}개)
                    </span>
                  </h2>
                </div>

                {/* 로딩 상태 */}
                {isMarketplaceLoading && (
                  <div className="flex justify-center items-center py-16">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                  </div>
                )}

                {/* 에러 상태 */}
                {isMarketplaceLoading && (
                  <div className="text-center py-16">
                    <div className="text-red-500 text-lg">{error}</div>
                  </div>
                )}

                {/* 상품 그리드 */}
                {!isMarketplaceLoading && !error && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product, index) => (
                      <div
                        key={`product-${product.itemid}`}
                        style={{
                          animationDelay: `${index * 100}ms`,
                          animation: "slideInUp 0.6s ease-out forwards",
                          opacity: 0,
                        }}
                      >
                        <ProductCard
                          product={product}
                          onLike={handleLike}
                          onChat={handleChat}
                          onClick={handleProductClick}
                          onEdit={handleEditProduct}
                          onDelete={handleDeleteProduct}
                          onComplete={handleCompleteTransaction}
                          onStatusChange={handleStatusChange}
                          onReport={handleReport}
                          currentUserId={user?.id}
                          isDarkMode={isDarkMode}
                        />
                      </div>
                    ))}
                  </div>
                )}

                {/* 빈 상태 */}
                {!isMarketplaceLoading && !error && products.length === 0 && (
                  <div
                    className={`text-center py-16 transition-colors duration-500 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <div className="text-8xl mb-6">🔍</div>
                    <h3 className={`text-2xl font-bold mb-4 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
                      검색 결과가 없습니다
                    </h3>
                    <p className="text-lg">다른 검색어나 카테고리를 시도해보세요</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 모달들 */}
      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onLike={handleLike}
          onChat={handleChat}
          onEdit={handleEditProduct}
          currentUserId={user?.id}
          isDarkMode={isDarkMode}
          kakaoMapState={kakaoMapState}
        />
      )}

      {showAddProduct && (
        <AddProductModal
          isOpen={showAddProduct}
          onClose={() => setShowAddProduct(false)}
          onCreate={createProduct}
          isDarkMode={isDarkMode}
          kakaoMapState={kakaoMapState}
        />
      )}

      {showEditProduct && (
        <EditProductModal
          isOpen={showEditProduct}
          onClose={() => {
            setShowEditProduct(false)
            setEditingProduct(null)
          }}
          product={editingProduct}
          onUpdate={updateProduct}
          isDarkMode={isDarkMode}
          kakaoMapState={kakaoMapState}
        />
      )}

      {showChat && (
        <ChatModal
          isOpen={showChat}
          onClose={() => {
            setShowChat(false)
            setChatSellerId(null)
          }}
          sellerId={chatSellerId}
          isDarkMode={isDarkMode}
        />
      )}

      {showReportModal && reportingProduct && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => {
            setShowReportModal(false)
            setReportingProduct(null)
          }}
          reportedUserId={reportingProduct.sellerId}
          reporterUserId={user?.id}
          itemId={reportingProduct.itemid}
          reportedUserName={reportingProduct.sellerName}
          itemTitle={reportingProduct.title}
          onSubmit={handleReportSubmit}
          isDarkMode={isDarkMode}
        />
      )}

      <style jsx>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  )
}

export default MarketplacePage
