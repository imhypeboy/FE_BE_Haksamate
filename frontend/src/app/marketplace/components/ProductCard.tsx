"use client"

import React, { useState,useEffect} from "react"
import { Heart, Eye, MapPin, Clock, MessageCircle, Star, MoreVertical, Edit, Trash2, CheckCircle } from "lucide-react"
import type { Product } from "../types"

interface ProductCardProps {
  product: Product
  onLike?: (productId: number) => void
  onChat?: (sellerId: string) => void
  onClick?: (product: Product) => void
  onEdit?: (product: Product) => void
  onDelete?: (productId: number) => void
  onComplete?: (productId: number) => void
  onReport?:(product:Product)=>void
  onStatusChange?: (productId: number, status: "판매중" | "예약중" | "거래완료") => void
  currentUserId?: string
  isDarkMode?: boolean
}

const ProductCard = React.memo(
  ({
    product,
    onLike,
    onChat,
    onClick,
    onEdit,
    onDelete,
    onComplete,
    onStatusChange,
    currentUserId,
    isDarkMode = false,
  }: ProductCardProps) => {
    const [imageLoaded, setImageLoaded] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const [showMenu, setShowMenu] = useState(false)

    const formatPrice = (price: number) => {
      return new Intl.NumberFormat("ko-KR").format(price) + "원"
    }

    const formatTimeAgo = (timestamp: number) => {
      const now = Date.now();
      const diff = now - timestamp;
    
      const minutes = Math.floor(diff / 60000);
      if (minutes < 1) return "방금 전";
      if (minutes < 60) return `${minutes}분 전`;
    
      const hours = Math.floor(minutes / 60);
      if (hours < 24) return `${hours}시간 전`;
    
      const days = Math.floor(hours / 24);
      return `${days}일 전`;
    };


    const getStatusColor = (status: string) => {
      switch (status) {
        case "available":
          return "bg-green-500"
        case "reserved":
          return "bg-yellow-500"
        case "sold":
          return "bg-gray-500"
        default:
          return "bg-green-500"
      }
    }

    const getStatusLabel = (status: string) => {
      switch (status) {
        case "available":
          return "판매중"
        case "reserved":
          return "예약중"
        case "sold":
          return "거래완료"
        default:
          return "판매중"
      }
    }

    // 🔧 상태별 아이콘과 스타일 정의
    const getStatusInfo = (status: string) => {
      switch (status) {
        case "available":
          return {
            icon: "🟢",
            label: "판매중",
            bgColor: isDarkMode ? "bg-green-500/20" : "bg-green-50",
            textColor: isDarkMode ? "text-green-300" : "text-green-600",
            hoverColor: isDarkMode ? "hover:bg-green-500/30" : "hover:bg-green-100",
          }
        case "reserved":
          return {
            icon: "🟡",
            label: "예약중",
            bgColor: isDarkMode ? "bg-yellow-500/20" : "bg-yellow-50",
            textColor: isDarkMode ? "text-yellow-300" : "text-yellow-600",
            hoverColor: isDarkMode ? "hover:bg-yellow-500/30" : "hover:bg-yellow-100",
          }
        case "sold":
          return {
            icon: "⚫",
            label: "거래완료",
            bgColor: isDarkMode ? "bg-gray-500/20" : "bg-gray-50",
            textColor: isDarkMode ? "text-gray-300" : "text-gray-600",
            hoverColor: isDarkMode ? "hover:bg-gray-500/30" : "hover:bg-gray-100",
          }
        default:
          return {
            icon: "🟢",
            label: "판매중",
            bgColor: isDarkMode ? "bg-green-500/20" : "bg-green-50",
            textColor: isDarkMode ? "text-green-300" : "text-green-600",
            hoverColor: isDarkMode ? "hover:bg-green-500/30" : "hover:bg-green-100",
          }
      }
    }

    // 현재 사용자가 판매자인지 확인
    const isOwner = currentUserId === product.sellerId

    const handleMenuClick = (e: React.MouseEvent, action: string) => {
      e.stopPropagation()
      setShowMenu(false)

      switch (action) {
        case "edit":
          onEdit?.(product)
          break
        case "delete":
          if (confirm("정말로 이 상품을 삭제하시겠습니까?")) {
            onDelete?.(product.itemid)
          }
          break
        case "complete":
          if (confirm("거래를 완료하시겠습니까?")) {
            onComplete?.(product.itemid)
          }
          break
        case "status-available":
          onStatusChange?.(product.itemid, "판매중")
          break
        case "status-reserved":
          onStatusChange?.(product.itemid, "예약중")
          break
        case "status-sold":
          onStatusChange?.(product.itemid, "거래완료")
          break
      }
    }

    // 🔧 모든 상태 옵션 정의
    const statusOptions = [
      { value: "available", ...getStatusInfo("available") },
      { value: "reserved", ...getStatusInfo("reserved") },
      { value: "sold", ...getStatusInfo("sold") },
    ]
    useEffect(() => {
      console.log("🧩 ProductCard props:", product);
      console.log("  - isliked:", product.isLiked);
      console.log("  - images:", product.itemImages);
      console.log("  - title:", product.title);
      console.log("  - price:", product.price);
      console.log("  - sellerName:", product.sellerName);
      console.log("  - location:", product.meetLocation);
      console.log("  - regdate:", product.regdate);
    }, [product]);

    return (
      <div
        className={`relative rounded-3xl p-6 cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
          isDarkMode
            ? "bg-gray-800/60 backdrop-blur-xl border border-gray-700/40"
            : "bg-white/90 backdrop-blur-xl border border-gray-200/60"
        } shadow-lg hover:shadow-2xl group`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => onClick?.(product)}
        style={{
          transform: `scale(${isHovered ? 1.02 : 1})`,
        }}
      >
        <div className="relative aspect-square overflow-hidden rounded-2xl mb-4 bg-gray-100">
          {product.itemImages && product.itemImages.length > 0 ? (
            <img
              src={product.itemImages[0] || "/placeholder.svg?height=300&width=300&query=product"}
              alt={product.title}
              className={`w-full h-full object-cover transition-all duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-105"
              } ${isHovered ? "scale-110" : "scale-100"}`}
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            <div
              className={`w-full h-full flex items-center justify-center ${isDarkMode ? "bg-gray-700" : "bg-gray-100"}`}
            >
              <div className="text-4xl">📦</div>
            </div>
          )}

          {/* 상태 배지 */}
          <div
            className={`absolute top-3 left-3 ${getStatusColor(product.status)} text-white text-xs font-medium px-3 py-1.5 rounded-full shadow-lg`}
          >
            {getStatusLabel(product.status)}
          </div>

          {/* 좋아요 버튼 */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              onLike?.(product.itemid)
            }}
            className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
              product.isLiked
                ? "bg-pink-500 text-white scale-110 shadow-lg shadow-pink-500/30"
                : isDarkMode
                  ? "bg-gray-800/80 backdrop-blur-sm text-gray-300 hover:bg-pink-500/20 hover:text-pink-300"
                  : "bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-pink-50 hover:text-pink-500"
            } shadow-lg hover:scale-110 active:scale-95`}
          >
            <Heart size={18} className={product.isLiked ? "fill-current" : ""} />
          </button>

          {/* 🔧 판매자 메뉴 버튼 */}
          {isOwner && (
            <div className="absolute top-3 right-16">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowMenu(!showMenu)
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isDarkMode
                    ? "bg-gray-800/80 backdrop-blur-sm text-gray-300 hover:bg-gray-700"
                    : "bg-white/80 backdrop-blur-sm text-gray-600 hover:bg-gray-100"
                } shadow-lg hover:scale-110 active:scale-95`}
              >
                <MoreVertical size={18} />
              </button>

              {/* 🔧 개선된 드롭다운 메뉴 */}
              {showMenu && (
                <div
                  className={`absolute top-12 right-0 w-52 rounded-2xl shadow-2xl z-20 ${
                    isDarkMode ? "bg-gray-800 border border-gray-700" : "bg-white border border-gray-200"
                  } overflow-hidden`}
                >
                  {/* 상태 변경 섹션 */}
                  <div
                    className={`px-4 py-2 text-xs font-medium ${
                      isDarkMode ? "text-gray-400 bg-gray-700/50" : "text-gray-500 bg-gray-50"
                    }`}
                  >
                    상태 변경
                  </div>

                  {/* 🔧 모든 상태 옵션 표시 */}
                  {statusOptions.map((option) => {
                    const isCurrentStatus = product.status === option.value
                    return (
                      <button
                        key={option.value}
                        onClick={(e) => handleMenuClick(e, `status-${option.value}`)}
                        className={`w-full px-4 py-3 text-left text-sm transition-colors flex items-center gap-3 ${
                          isCurrentStatus
                            ? `${option.bgColor} ${option.textColor} font-medium`
                            : isDarkMode
                              ? "text-gray-300 hover:bg-gray-700"
                              : "text-gray-700 hover:bg-gray-50"
                        } ${option.hoverColor}`}
                      >
                        <span className="text-base">{option.icon}</span>
                        <span className="flex-1">{option.label}</span>
                        {/* 🔧 현재 상태 표시 */}
                        {isCurrentStatus && (
                          <span
                            className={`text-xs px-2 py-1 rounded-full ${
                              isDarkMode ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-600"
                            }`}
                          >
                            현재
                          </span>
                        )}
                      </button>
                    )
                  })}

                  <div className={`h-px ${isDarkMode ? "bg-gray-700" : "bg-gray-200"}`} />

                  {/* 관리 메뉴 */}
                  <button
                    onClick={(e) => handleMenuClick(e, "edit")}
                    className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-colors ${
                      isDarkMode ? "text-blue-300 hover:bg-gray-700" : "text-blue-600 hover:bg-blue-50"
                    }`}
                  >
                    <Edit size={16} />
                    수정하기
                  </button>

                  {/* 🔧 거래완료 버튼 - 판매중이거나 예약중일 때만 표시 */}
                  {(product.status === "판매중" || product.status === "예약중") && (
                    <button
                      onClick={(e) => handleMenuClick(e, "complete")}
                      className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-colors ${
                        isDarkMode ? "text-green-300 hover:bg-gray-700" : "text-green-600 hover:bg-green-50"
                      }`}
                    >
                      <CheckCircle size={16} />
                      거래완료
                    </button>
                  )}

                  <button
                    onClick={(e) => handleMenuClick(e, "delete")}
                    className={`w-full px-4 py-3 text-left text-sm flex items-center gap-3 transition-colors ${
                      isDarkMode ? "text-red-300 hover:bg-gray-700" : "text-red-600 hover:bg-red-50"
                    }`}
                  >
                    <Trash2 size={16} />
                    삭제하기
                  </button>
                </div>
              )}
            </div>
          )}

          {product.itemImages && product.itemImages.length > 1 && (
            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">
              +{product.itemImages.length - 1}
            </div>
          )}
        </div>

        <div className="relative z-10">
          <h3
            className={`font-semibold text-base line-clamp-2 mb-3 transition-colors duration-300 ${
              isDarkMode ? "text-white group-hover:text-blue-300" : "text-gray-900 group-hover:text-blue-600"
            }`}
          >
            {product.title}
          </h3>

          <div className="flex items-center justify-between mb-4">
            <span
              className={`text-xl font-bold transition-colors duration-300 ${
                isDarkMode ? "text-white" : "text-gray-900"
              }`}
            >
              {formatPrice(product.price)}
            </span>
          </div>

          <div
            className={`flex items-center justify-between text-sm mb-4 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
          >
            <div className="flex items-center gap-2">
              <MapPin size={14} />
              <span>{product.meetLocation?.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} />
              <span>{formatTimeAgo(product.regdate)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  isDarkMode
                    ? "bg-gradient-to-br from-blue-400 to-blue-600"
                    : "bg-gradient-to-br from-blue-500 to-blue-700"
                } shadow-lg`}
              >

              </div>
              <div>
                <span className={`text-sm font-medium ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
                  {product.sellerName}
                  {isOwner && (
                    <span
                      className={`ml-2 text-xs px-2 py-1 rounded-full ${
                        isDarkMode ? "bg-blue-500/20 text-blue-300" : "bg-blue-100 text-blue-600"
                      }`}
                    >
                      내 상품
                    </span>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* 🔧 채팅 버튼 - 자신의 상품이면 숨김 */}
          {!isOwner && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onChat?.(product.sellerId)
              }}
              className={`w-full py-3 rounded-2xl font-medium transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] flex items-center justify-center gap-2 ${
                isDarkMode
                  ? "bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 border border-blue-400/30"
                  : "bg-blue-500 hover:bg-blue-600 text-white shadow-lg shadow-blue-500/20"
              } hover:scale-105 active:scale-95`}
            >
              <MessageCircle size={18} />
              채팅하기
            </button>
          )}
        </div>

        {/* 🔧 메뉴 외부 클릭 시 닫기 */}
        {showMenu && (
          <div
            className="fixed inset-0 z-10"
            onClick={(e) => {
              e.stopPropagation()
              setShowMenu(false)
            }}
          />
        )}
      </div>
    )
  },
)

ProductCard.displayName = "ProductCard"

export default ProductCard