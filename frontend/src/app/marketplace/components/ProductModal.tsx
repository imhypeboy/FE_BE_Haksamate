"use client"
import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import {
  X,
  Heart,
  MessageCircle,
  MapPin,
  Star,
  Flag,
  Edit,
  Trash2,
  Eye,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { useMarketplace } from "../hooks/useMarketplace"
import { useTransactions } from "../hooks/useTransactions"
import { useReviews } from "../hooks/useReviews"
import { useReports } from "../hooks/useReports"
import type { KakaoMapState, Product } from "../types"
import ReviewModal from "./ReviewModal"
import ReviewListModal from "./ReviewListModal"
import ReportModal from "./ReportModal"
import EditProductModal from "./EditProductModal"
import ChatModal from "@/components/ChatModal"

interface ProductModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
  onLike?: (productId: number) => void
  onChat?: (sellerId: string) => void
  onEdit?: (product: Product) => void
  currentUserId?: string | null
  isDarkMode: boolean
  kakaoMapState: KakaoMapState
}

const ProductModal: React.FC<ProductModalProps> = ({
  product,
  isOpen,
  onClose,
  currentUserId,
  isDarkMode,
  kakaoMapState,
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showReviewListModal, setShowReviewListModal] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showChatModal, setShowChatModal] = useState(false)
  const [showMap, setShowMap] = useState(false)
  const [map, setMap] = useState<any>(null)
  const [marker, setMarker] = useState<any>(null)
  const [isMapInitialized, setIsMapInitialized] = useState(false)
  const [mapError, setMapError] = useState<string | null>(null)
  const [transaction, setTransaction] = useState<any>(null)

  const mapRef = useRef<HTMLDivElement>(null)

  const { toggleLike, deleteProduct, updateProduct } = useMarketplace()
  const { getTransactionByItemAndBuyer, createTransaction } = useTransactions()
  const { getReviews, createReview, getReviewSummary } = useReviews()
  const { createReport } = useReports()

  const { kakaoLoaded, sdkError, apiKeyError, loadingMessage } = kakaoMapState

  useEffect(() => {
    if (product && currentUserId && product.sellerId !== currentUserId) {
      getTransactionByItemAndBuyer(product.itemid, currentUserId)
        .then(setTransaction)
        .catch(() => setTransaction(null))
    }
  }, [product, currentUserId, getTransactionByItemAndBuyer])

  // 지도 초기화 함수
  const initializeMap = useCallback(async () => {
    console.log("🔍 지도 초기화 시작")
    console.log("조건 체크:", {
      mapRefCurrent: !!mapRef.current,
      windowKakao: !!window.kakao?.maps,
      kakaoLoaded,
      meetLocation: product?.meetLocation,
    })

    if (!mapRef.current || !window.kakao?.maps || !kakaoLoaded || !product?.meetLocation) {
      console.warn("❌ 지도 초기화 조건 미충족")
      setMapError("지도 초기화 조건이 충족되지 않았습니다.")
      return
    }

    try {
      await new Promise((resolve) => setTimeout(resolve, 300))

      const container = mapRef.current
      if (!container || container.offsetWidth === 0 || container.offsetHeight === 0) {
        console.warn("❌ 지도 컨테이너 크기 문제:", {
          offsetWidth: container?.offsetWidth,
          offsetHeight: container?.offsetHeight,
        })
        setMapError("지도 컨테이너 크기가 올바르지 않습니다.")
        return
      }

      // meetLocation 구조 확인
      console.log("📍 meetLocation 데이터:", product.meetLocation)

      // 주소 추출 - 다양한 형태 지원
      let address = ""
      if (typeof product.meetLocation === "string") {
        address = product.meetLocation
      } else if (product.meetLocation?.address) {
        address = product.meetLocation.address
      }  else {
        console.error("❌ 주소 정보를 찾을 수 없습니다:", product.meetLocation)
        setMapError("주소 정보가 올바르지 않습니다.")
        return
      }

      console.log("🔍 검색할 주소:", address)

      // Geocoder로 주소 검색
      const geocoder = new window.kakao.maps.services.Geocoder()

      // 먼저 정확한 주소 검색 시도
      geocoder.addressSearch(address, (result: any, status: any) => {
        console.log("📍 주소 검색 결과:", { status, result })

        if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
          const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x)
          console.log("✅ 좌표 변환 성공:", result[0].y, result[0].x)

          createMapWithCoords(coords, address)
        } else {
          console.warn("⚠️ 정확한 주소 검색 실패, 키워드 검색 시도")

          // 정확한 주소 검색 실패 시 키워드 검색 시도
          const places = new window.kakao.maps.services.Places()
          places.keywordSearch(address, (data: any, status: any) => {
            console.log("🔍 키워드 검색 결과:", { status, dataLength: data?.length })

            if (status === window.kakao.maps.services.Status.OK && data.length > 0) {
              const place = data[0]
              const coords = new window.kakao.maps.LatLng(place.y, place.x)
              console.log("✅ 키워드 검색 성공:", place.place_name, place.y, place.x)

              createMapWithCoords(coords, place.place_name || address)
            } else {
              console.error("❌ 키워드 검색도 실패")
              setMapError(`주소를 찾을 수 없습니다: "${address}"`)
            }
          })
        }
      })
    } catch (error) {
      const errorMessage = `지도 초기화 중 오류: ${error}`
      console.error("❌", errorMessage)
      setMapError(errorMessage)
    }
  }, [kakaoLoaded, product?.meetLocation])

  // 좌표로 지도 생성하는 함수
  const createMapWithCoords = useCallback((coords: any, locationName: string) => {
    try {
      const container = mapRef.current
      if (!container) return

      const options = {
        center: coords,
        level: 3,
      }

      console.log("🗺️ 지도 인스턴스 생성")
      const mapInstance = new window.kakao.maps.Map(container, options)

      // 마커 생성
      const newMarker = new window.kakao.maps.Marker({
        position: coords,
      })
      newMarker.setMap(mapInstance)

      // 인포윈도우 생성 (선택사항)
      const infowindow = new window.kakao.maps.InfoWindow({
        content: `<div style="padding:5px;font-size:12px;width:150px;text-align:center;">${locationName}</div>`,
      })
      infowindow.open(mapInstance, newMarker)

      setMap(mapInstance)
      setMarker(newMarker)
      setIsMapInitialized(true)
      setMapError(null)

      console.log("✅ 지도 초기화 완료")

      // 지도 레이아웃 재조정
      setTimeout(() => {
        try {
          mapInstance.relayout()
          mapInstance.setCenter(coords)
          console.log("🔄 지도 레이아웃 재조정 완료")
        } catch (error) {
          console.warn("⚠️ 지도 레이아웃 재조정 실패:", error)
        }
      }, 100)
    } catch (error) {
      console.error("❌ 지도 생성 실패:", error)
      setMapError(`지도 생성 실패: ${error}`)
    }
  }, [])

  // 지도 표시/숨김 토글
  const toggleMap = useCallback(() => {
    setShowMap((prev) => {
      const newShowMap = !prev
      if (newShowMap && !isMapInitialized && kakaoLoaded) {
        setTimeout(initializeMap, 100)
      }
      return newShowMap
    })
  }, [isMapInitialized, kakaoLoaded, initializeMap])

  // 모달이 닫힐 때 지도 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      setShowMap(false)
      setIsMapInitialized(false)
      setMap(null)
      setMapError(null)
      if (marker) {
        marker.setMap(null)
        setMarker(null)
      }
    }
  }, [isOpen, marker])

  if (!isOpen || !product) return null

  const isOwner = currentUserId === product.sellerId
  const canReview = transaction && transaction.status === "COMPLETED"

  const handlePurchase = async () => {
    if (!currentUserId) {
      alert("로그인이 필요합니다.")
      return
    }
    try {
      await createTransaction({
        itemId: product.itemid,
        sellerId: product.sellerId,
      })
      alert("구매 요청이 전송되었습니다!")
    } catch (error) {
      alert(error instanceof Error ? error.message : "구매 요청에 실패했습니다.")
    }
  }

  const handleLike = async () => {
    if (!currentUserId) {
      alert("로그인이 필요합니다.")
      return
    }
    try {
      await toggleLike(product.itemid, currentUserId)
    } catch (error) {
      alert("찜하기에 실패했습니다.")
    }
  }

  const handleDelete = async () => {
    if (window.confirm("정말로 이 상품을 삭제하시겠습니까?")) {
      try {
        await deleteProduct(product.itemid)
        alert("상품이 삭제되었습니다.")
        onClose()
      } catch (error) {
        alert("상품 삭제에 실패했습니다.")
      }
    }
  }

  const handleReportSubmit = async (reportData: any) => {
    try {
      await createReport(reportData)
    } catch (error) {
      throw error
    }
  }

  const handleReviewSubmit = async (reviewData: any) => {
    try {
      await createReview(reviewData)
    } catch (error) {
      throw error
    }
  }

  const handleProductUpdate = async (productId: number, data: any, itemImages?: File[]) => {
    try {
      await updateProduct(productId, data, itemImages)
    } catch (error) {
      throw error
    }
  }

  const handleGetReviews = async (sellerId: string) => {
    try {
      return await getReviews(sellerId)
    } catch (error) {
      return []
    }
  }

  const handleGetReviewSummary = async (sellerId: string) => {
    try {
      return await getReviewSummary(sellerId)
    } catch (error) {
      return { averageRating: 0, totalReviews: 0 }
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ko-KR").format(price) + "원"
  }

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp

    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return "방금 전"
    if (minutes < 60) return `${minutes}분 전`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}시간 전`

    const days = Math.floor(hours / 24)
    return `${days}일 전`
  }

  // 주소 표시용 함수
  const getDisplayAddress = () => {
    if (!product.meetLocation) return "위치 정보 없음"

    if (typeof product.meetLocation === "string") {
      return product.meetLocation
    }

    return product.meetLocation.address  || "위치 정보 없음"
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div
          className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl ${
            isDarkMode ? "bg-gray-800 text-white" : "bg-white text-gray-900"
          }`}
        >
          {/* 헤더 */}
          <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-inherit">
            <h2 className="text-xl font-bold truncate">{product.title}</h2>
            <div className="flex items-center gap-2">
              {isOwner && (
                <>
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="수정"
                  >
                    <Edit size={20} />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-red-500"
                    title="삭제"
                  >
                    <Trash2 size={20} />
                  </button>
                </>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 p-6">
            {/* 이미지 섹션 */}
            <div className="space-y-4">
              <div className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                <Image
                  src={
                    product.itemImages[currentImageIndex] || product.imageUrl || "/placeholder.svg?height=400&width=400"
                  }
                  alt={product.name || product.title}
                  fill
                  className="object-cover"
                />
                {product.itemImages.length > 1 && (
                  <>
                    <button
                      onClick={() =>
                        setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : product.itemImages.length - 1))
                      }
                      className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    >
                      ←
                    </button>
                    <button
                      onClick={() =>
                        setCurrentImageIndex((prev) => (prev < product.itemImages.length - 1 ? prev + 1 : 0))
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors"
                    >
                      →
                    </button>
                  </>
                )}
              </div>
              {/* 썸네일 */}
              {product.itemImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto">
                  {product.itemImages.map((image, index) => (
                    <button
                      key={`image-${index}`}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        currentImageIndex === index ? "border-blue-500" : "border-gray-200 dark:border-gray-600"
                      }`}
                    >
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`${product.name || product.title} ${index + 1}`}
                        width={64}
                        height={64}
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 정보 섹션 */}
            <div className="space-y-6">
              {/* 기본 정보 */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl font-bold text-blue-600">{formatPrice(product.price)}</span>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Eye size={16} />
                    <span>{product.viewCount}</span>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{product.description}</p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">카테고리</span>
                    <p className="font-medium">{product.category}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">상태</span>
                    <p
                      className={`font-medium ${
                        product.status === "판매중"
                          ? "text-green-600"
                          : product.status === "예약중"
                            ? "text-yellow-600"
                            : "text-gray-600"
                      }`}
                    >
                      {product.status}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">등록일</span>
                    <p className="font-medium flex items-center gap-1">
                      <Calendar size={14} />
                      {formatTimeAgo(product.regdate)}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">판매자</span>
                    <p className="font-medium">{product.sellerName}</p>
                  </div>
                </div>

                {/* 거래 위치 섹션 */}
                {product.meetLocation && (
                  <div className="mt-4">
                    <button
                      onClick={toggleMap}
                      className={`w-full text-left p-3 rounded-lg border transition-colors ${
                        isDarkMode
                          ? "border-gray-600 bg-gray-700 hover:bg-gray-600"
                          : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin size={16} className="text-red-500" />
                          <div>
                            <span className="text-gray-500 text-sm block">거래 위치</span>
                            <span className="font-medium">{getDisplayAddress()}</span>
                          </div>
                        </div>
                        {showMap ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </button>

                    {/* 지도 영역 */}
                    <div
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        showMap ? "max-h-80 mt-3" : "max-h-0"
                      }`}
                    >
                      <div className="rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600">
                        {!kakaoLoaded ? (
                          <div className="h-64 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                            <div className="text-center space-y-2">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
                              <div className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                                {loadingMessage}
                              </div>
                              {(sdkError || apiKeyError) && (
                                <div className="text-red-500 text-xs">{sdkError || apiKeyError}</div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="relative">
                            <div ref={mapRef} className="w-full h-64" style={{ minHeight: "256px" }} />

                            {!isMapInitialized && !mapError && (
                              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                                <div className="text-center space-y-2">
                                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
                                  <div className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                                    지도를 로딩중입니다...
                                  </div>
                                </div>
                              </div>
                            )}

                            {mapError && (
                              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-700">
                                <div className="text-center space-y-2 p-4">
                                  <div className="text-red-500 text-2xl">⚠️</div>
                                  <div className={`text-sm ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                                    지도 로딩 실패
                                  </div>
                                  <div className="text-red-500 text-xs max-w-xs break-words">{mapError}</div>
                                  <div className="text-xs text-gray-500 mt-2">주소: {getDisplayAddress()}</div>
                                  <button
                                    onClick={() => {
                                      setMapError(null)
                                      setIsMapInitialized(false)
                                      setTimeout(initializeMap, 100)
                                    }}
                                    className="mt-2 px-3 py-1 bg-orange-500 text-white text-xs rounded hover:bg-orange-600"
                                  >
                                    다시 시도
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {product.tags && product.tags.length > 0 && (
                  <div className="mt-4">
                    <span className="text-gray-500 text-sm">태그</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {product.tags.map((tag, index) => (
                        <span
                          key={`tag-${index}`}
                          className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* 액션 버튼들 */}
              <div className="space-y-3">
                {!isOwner && (
                  <div className="flex gap-3">
                    <button
                      onClick={handleLike}
                      className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors ${
                        product.isLiked
                          ? "bg-red-50 text-red-600 border border-red-200"
                          : isDarkMode
                            ? "bg-gray-700 hover:bg-gray-600 text-white"
                            : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      <Heart size={20} fill={product.isLiked ? "currentColor" : "none"} />
                      찜하기 ({product.likeCount})
                    </button>
                    <button
                      onClick={() => setShowChatModal(true)}
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors"
                    >
                      <MessageCircle size={20} />
                      채팅하기
                    </button>
                  </div>
                )}
                {!isOwner && product.status === "판매중" && (
                  <button
                    onClick={handlePurchase}
                    className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-medium transition-colors"
                  >
                    구매하기
                  </button>
                )}
                {canReview && (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl font-medium transition-colors"
                  >
                    <Star size={20} />
                    리뷰 작성하기
                  </button>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowReviewListModal(true)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl font-medium transition-colors ${
                      isDarkMode
                        ? "bg-gray-700 hover:bg-gray-600 text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                    }`}
                  >
                    <Star size={16} />
                    리뷰 보기
                  </button>
                  {!isOwner && (
                    <button
                      onClick={() => setShowReportModal(true)}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-medium transition-colors"
                    >
                      <Flag size={16} />
                      신고하기
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 모달들 */}
      {showReviewModal && (
        <ReviewModal
          isOpen={showReviewModal}
          onClose={() => setShowReviewModal(false)}
          itemId={product.itemid}
          sellerId={product.sellerId}
          sellerName={product.sellerName}
          onSubmit={handleReviewSubmit}
          isDarkMode={isDarkMode}
        />
      )}
      {showReviewListModal && (
        <ReviewListModal
          isOpen={showReviewListModal}
          onClose={() => setShowReviewListModal(false)}
          itemId={product.itemid}
          sellerName={product.sellerName}
          sellerId={product.sellerId}
          onGetReviews={handleGetReviews}
          onGetReviewSummary={handleGetReviewSummary}
          isDarkMode={isDarkMode}
        />
      )}
      {showReportModal && (
        <ReportModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          itemId={product.itemid}
          reportedUserId={product.sellerId}
          reporterUserId={currentUserId}
          reportedUserName={product.sellerName}
          itemTitle={product.title}
          onSubmit={handleReportSubmit}
          isDarkMode={isDarkMode}
        />
      )}
      {showEditModal && (
        <EditProductModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          product={product}
          onUpdate={handleProductUpdate}
          isDarkMode={isDarkMode}
          kakaoMapState={kakaoMapState}
        />
      )}
      {showChatModal && (
        <ChatModal
          isOpen={showChatModal}
          onClose={() => setShowChatModal(false)}
          sellerId={product.sellerId}
          isDarkMode={isDarkMode}
        />
      )}
    </>
  )
}

export default ProductModal
