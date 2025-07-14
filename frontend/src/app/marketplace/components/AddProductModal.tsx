"use client"
import type React from "react"
import { useState, useCallback } from "react"
import { MdClose, MdImage, MdDelete } from "react-icons/md"
import type { CreateProductRequest, KakaoMapState } from "../types"
import { CATEGORIES } from "../constants"
import LocationPicker from "./LocationPicker"
import {useAuth} from '@/hooks/useAuth'
interface AddProductModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (data: CreateProductRequest, images: File[]) => Promise<void>
  isDarkMode: boolean
  kakaoMapState: KakaoMapState
  onCreated?: ()=>void
}

const AddProductModal: React.FC<AddProductModalProps> = ({ isOpen, onClose, onCreate, isDarkMode, kakaoMapState,onCreated}) => {
  const {user}=useAuth()
  const [formData, setFormData] = useState<CreateProductRequest>({
  title: "",
  description: "",
  price: 0,
  category: "",
  sellerId: user?.id, // ✅ 반드시 추가
  itemImages: [], // ✅ 반드시 추가
  meetLocation: {
    address: "",
    lat: 0,
    lng: 0,
  },
  status: "판매중",
  })
  const [images, setImages] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target
      setFormData((prev) => ({
        ...prev,
        [name]: name === "price" ? Number(value) : value,
      }))
    },
    [],
  )

  const handleImageChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || [])
      if (files.length + images.length > 5) {
        alert("이미지는 최대 5개까지 업로드할 수 있습니다.")
        return
      }

      setImages((prev) => [...prev, ...files])

      // 미리보기 생성
      files.forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          setImagePreviews((prev) => [...prev, e.target?.result as string])
        }
        reader.readAsDataURL(file)
      })
    },
    [images.length],
  )

  const removeImage = useCallback((index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const handleLocationSelect = useCallback((location: { address: string; lat: number; lng: number }) => {
    setFormData((prev) => ({
      ...prev,
      meetLocation: location,
    }))
  }, [])

  const resetForm = useCallback(() => {
    setFormData({
      title: "",
      description: "",
      price: 0,
      category: "",
      sellerId: user?.id,
      itemImages: [],
      meetLocation: {
        address: "",
        lat: 0,
        lng: 0,
      },
      status: "판매중",
    })
    setImages([])
    setImagePreviews([])
  }, [])
  
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()

      if (
        !formData.title.trim() ||
        !formData.description.trim() ||
        formData.price <= 0 ||
        !formData.category ||
        !formData.meetLocation.address.trim()
      ) {
        alert("모든 필수 항목을 입력해주세요.")
        return
      }

      try {
        setIsLoading(true)
        await onCreate({ ...formData, sellerId: user?.id ||""}, images)
        onCreated?.()
        resetForm()
        onClose()
      } catch (error) {
        console.error("상품 등록 실패:", error)
        alert("상품 등록에 실패했습니다.")
      } finally {
        setIsLoading(false)
      }
    },
    [formData, images, onCreate, onClose, resetForm],
  )

  const handleClose = useCallback(() => {
    if (!isLoading) {
      onClose()
    }
  }, [isLoading, onClose])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl shadow-xl ${
          isDarkMode ? "bg-gray-800" : "bg-white"
        }`}
      >
        {/* 헤더 */}
        <div
          className={`flex items-center justify-between p-6 border-b ${
            isDarkMode ? "border-gray-700" : "border-gray-200"
          }`}
        >
          <h2 className={`text-xl font-semibold ${isDarkMode ? "text-white" : "text-gray-900"}`}>상품 등록</h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className={`p-2 rounded-lg transition-colors ${
              isDarkMode ? "hover:bg-gray-700 text-gray-400" : "hover:bg-gray-100 text-gray-500"
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* 이미지 업로드 */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              상품 이미지 (최대 5개)
            </label>
            <div className="space-y-4">
              {/* 이미지 미리보기 */}
              {imagePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-4">
                  {imagePreviews.map((preview, index) => (
                    <div key={`preview-${index}`} className="relative">
                      <img
                        src={preview || "/placeholder.svg"}
                        alt={`미리보기 ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                      >
                        <MdDelete size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* 이미지 업로드 버튼 */}
              {imagePreviews.length < 5 && (
                <label
                  className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                    isDarkMode
                      ? "border-gray-600 bg-gray-700 hover:bg-gray-600 text-gray-400"
                      : "border-gray-300 bg-gray-50 hover:bg-gray-100 text-gray-500"
                  }`}
                >
                  <MdImage size={32} />
                  <span className="mt-2 text-sm">이미지 추가</span>
                  <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* 제목 */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              제목 *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              required
              className={`w-full p-3 rounded-lg border transition-colors ${
                isDarkMode
                  ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                  : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
              }`}
              placeholder="상품 제목을 입력해주세요"
            />
          </div>

          {/* 설명 */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              설명 *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              className={`w-full p-3 rounded-lg border transition-colors resize-none ${
                isDarkMode
                  ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                  : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
              }`}
              placeholder="상품에 대한 자세한 설명을 입력해주세요"
            />
          </div>

          {/* 가격 */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              가격 *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
              min="0"
              className={`w-full p-3 rounded-lg border transition-colors ${
                isDarkMode
                  ? "border-gray-600 bg-gray-700 text-white placeholder-gray-400"
                  : "border-gray-300 bg-white text-gray-900 placeholder-gray-500"
              }`}
              placeholder="가격을 입력해주세요"
            />
          </div>

          {/* 카테고리 */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              카테고리 *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              className={`w-full p-3 rounded-lg border transition-colors ${
                isDarkMode ? "border-gray-600 bg-gray-700 text-white" : "border-gray-300 bg-white text-gray-900"
              }`}
            >
              <option value="">카테고리를 선택해주세요</option>
              {CATEGORIES.filter((cat) => cat !== "전체").map((category) => (
                <option key={`category-${category}`} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* 위치 선택 */}
          <div>
            <label className={`block text-sm font-medium mb-2 ${isDarkMode ? "text-gray-300" : "text-gray-700"}`}>
              거래 위치 *
            </label>
            <LocationPicker
              onLocationSelect={handleLocationSelect}
              initialLocation={formData.meetLocation}
              isDarkMode={isDarkMode}
              kakaoMapState={kakaoMapState}
            />
          </div>

          {/* 버튼 */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className={`flex-1 py-3 rounded-lg border transition-colors ${
                isDarkMode
                  ? "border-gray-600 text-gray-300 hover:bg-gray-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              취소
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "등록 중..." : "등록하기"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddProductModal
