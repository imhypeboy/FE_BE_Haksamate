"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "../sidebar/sidebar"
import { UserIcon, Utensils, Clock, MapPin, Star, Heart, DollarSign, Zap, Users, Calendar } from "lucide-react"
import { MockDataFactory, type MockDailyMenu } from '@/lib/mockData'

interface MenuItem {
    id: string
    name: string
    price: number
    category: "main" | "side" | "soup" | "dessert" | "drink"
    calories?: number
    allergens?: string[]
    rating?: number
    isVegetarian?: boolean
    isSpicy?: boolean
    image?: string
}

interface DailyMenu {
    date: string
    breakfast: MenuItem[]
    lunch: MenuItem[]
    dinner: MenuItem[]
    specialMenu?: MenuItem[]
}

interface CafeteriaInfo {
    id: string
    name: string
    location: string
    phone: string
    operatingHours: {
        breakfast: string
        lunch: string
        dinner: string
    }
    capacity: number
    currentOccupancy: number
    rating: number
}

export default function CafeteriaPage() {
    const router = useRouter()
    const [weeklyMenu, setWeeklyMenu] = useState<MockDailyMenu[]>([])
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
    const [selectedMeal, setSelectedMeal] = useState<"breakfast" | "lunch" | "dinner">("lunch")
    const [selectedCafeteria, setSelectedCafeteria] = useState("main")
    const [favoriteItems, setFavoriteItems] = useState<string[]>([])
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [showProfileModal, setShowProfileModal] = useState(false)

    // 데스크톱에서는 사이드바 기본 열림
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setSidebarOpen(true)
            } else {
                setSidebarOpen(false)
            }
        }

        handleResize()
        window.addEventListener("resize", handleResize)
        return () => window.removeEventListener("resize", handleResize)
    }, [])

    const cafeterias: CafeteriaInfo[] = [
        {
            id: "main",
            name: "학생회관 식당",
            location: "학생회관 2층",
            phone: "02-1234-5678",
            operatingHours: {
                breakfast: "07:30 - 09:00",
                lunch: "11:30 - 14:00",
                dinner: "17:30 - 19:30",
            },
            capacity: 300,
            currentOccupancy: 180,
            rating: 4.2,
        },
        {
            id: "dorm",
            name: "기숙사 식당",
            location: "생활관 1층",
            phone: "02-1234-5679",
            operatingHours: {
                breakfast: "07:00 - 09:00",
                lunch: "11:30 - 13:30",
                dinner: "17:00 - 19:00",
            },
            capacity: 200,
            currentOccupancy: 120,
            rating: 3.8,
        },
    ]

    useEffect(() => {
        // 🔧 중앙 데이터 시스템에서 메뉴 데이터 가져오기
        const loadMenuData = async () => {
            try {
                const menuData = await MockDataFactory.withDelay(
                    MockDataFactory.createCafeteriaMenu(), 
                    500
                )
                setWeeklyMenu(menuData)
            } catch (error) {
                console.error('메뉴 데이터 로드 실패:', error)
            }
        }

        loadMenuData()
    }, [])

    const todayMenu = weeklyMenu.find((menu) => menu.date === selectedDate)
    const currentMealItems = todayMenu ? todayMenu[selectedMeal] : []
    const specialItems = todayMenu?.specialMenu || []
    const currentCafeteria = cafeterias.find((c) => c.id === selectedCafeteria)!

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case "main":
                return "🍽️"
            case "side":
                return "🥗"
            case "soup":
                return "🍲"
            case "dessert":
                return "🍰"
            case "drink":
                return "🥤"
            default:
                return "🍴"
        }
    }

    const getCategoryColor = (category: string) => {
        switch (category) {
            case "main":
                return "bg-blue-100 text-blue-800 border border-blue-200"
            case "side":
                return "bg-green-100 text-green-800 border border-green-200"
            case "soup":
                return "bg-orange-100 text-orange-800 border border-orange-200"
            case "dessert":
                return "bg-pink-100 text-pink-800 border border-pink-200"
            case "drink":
                return "bg-purple-100 text-purple-800 border border-purple-200"
            default:
                return "bg-gray-100 text-gray-800 border border-gray-200"
        }
    }

    const toggleFavorite = (itemId: string) => {
        setFavoriteItems((prev) => (prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]))
    }

    const totalCalories = currentMealItems.reduce((sum, item) => sum + (item.calories || 0), 0)
    const totalPrice = currentMealItems.reduce((sum, item) => sum + item.price, 0)
    const occupancyRate = Math.round((currentCafeteria.currentOccupancy / currentCafeteria.capacity) * 100)

    const getMealDisplayName = (meal: string) => {
        switch (meal) {
            case "breakfast":
                return "조식"
            case "lunch":
                return "중식"
            case "dinner":
                return "석식"
            default:
                return meal
        }
    }

    return (
        <div className="min-h-screen bg-[#FBFBFB] text-gray-900 md:flex">
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className={`flex-1 transition-all duration-500 ease-out ${sidebarOpen ? "md:ml-[280px]" : "md:ml-0"}`}>
                {/* 헤더 */}
                <header
                    className="bg-white border-b border-gray-200 py-4 px-4 flex justify-between items-center shadow-sm">
                    <div className="w-10 md:hidden"></div>
                    <h1 className="text-xl font-bold text-gray-800 flex-1 text-center">
                        식단 정보
                    </h1>
                    <button
                        onClick={() => setShowProfileModal(true)}
                        className="w-10 h-10 rounded-full bg-[#C4D9FF] hover:bg-[#B0CCFF] flex items-center justify-center transition-colors"
                        aria-label="프로필"
                    >
                        <UserIcon className="h-5 w-5 text-gray-700"/>
                    </button>
                </header>

                <div className="max-w-6xl mx-auto py-8 px-4">
                    {/* 상단 컨트롤 */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-8">
                        <div
                            className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                            <div
                                className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">식당 선택</label>
                                    <select
                                        value={selectedCafeteria}
                                        onChange={(e) => setSelectedCafeteria(e.target.value)}
                                        className="border border-gray-300 rounded-xl px-3 py-2 bg-white text-gray-900 focus:border-blue-500 focus:outline-none"
                                    >
                                        {cafeterias.map((cafeteria) => (
                                            <option key={cafeteria.id} value={cafeteria.id}>
                                                {cafeteria.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">날짜 선택</label>
                                    <input
                                        type="date"
                                        value={selectedDate}
                                        onChange={(e) => setSelectedDate(e.target.value)}
                                        className="border border-gray-300 rounded-xl px-3 py-2 bg-white text-gray-900 focus:border-blue-500 focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">식사 시간</label>
                                <div className="flex space-x-2">
                                    {(["breakfast", "lunch", "dinner"] as const).map((meal) => (
                                        <button
                                            key={meal}
                                            onClick={() => setSelectedMeal(meal)}
                                            className={`px-4 py-2 rounded-xl font-medium transition-colors ${
                                                selectedMeal === meal
                                                    ? "bg-[#C4D9FF] text-gray-800"
                                                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                            }`}
                                        >
                                            {getMealDisplayName(meal)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 통계 카드 */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                            <div className="flex items-center">
                                <div
                                    className="w-12 h-12 bg-[#E8F9FF] rounded-xl flex items-center justify-center mr-4">
                                    <Star className="h-6 w-6 text-gray-700"/>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-600">식당 평점</h3>
                                    <p className="text-2xl font-bold text-gray-900">{currentCafeteria.rating}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                            <div className="flex items-center">
                                <div
                                    className="w-12 h-12 bg-[#C4D9FF] rounded-xl flex items-center justify-center mr-4">
                                    <Zap className="h-6 w-6 text-gray-700"/>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-600">총 칼로리</h3>
                                    <p className="text-2xl font-bold text-gray-900">{totalCalories}</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                            <div className="flex items-center">
                                <div
                                    className="w-12 h-12 bg-[#C5BAFF] rounded-xl flex items-center justify-center mr-4">
                                    <DollarSign className="h-6 w-6 text-gray-700"/>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-600">총 가격</h3>
                                    <p className="text-2xl font-bold text-gray-900">{totalPrice.toLocaleString()}원</p>
                                </div>
                            </div>
                        </div>
                        <div className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm">
                            <div className="flex items-center">
                                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mr-4">
                                    <Users className="h-6 w-6 text-red-600"/>
                                </div>
                                <div>
                                    <h3 className="text-sm font-medium text-gray-600">혼잡도</h3>
                                    <p className="text-2xl font-bold text-gray-900">{occupancyRate}%</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 식당 정보 */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-8">
                        <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                            <MapPin className="w-5 h-5 mr-2"/>
                            {currentCafeteria.name} 정보
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-[#E8F9FF] border border-gray-200 p-4 rounded-xl">
                                <div className="text-sm text-gray-600 mb-1">위치</div>
                                <div className="font-medium text-gray-900">{currentCafeteria.location}</div>
                            </div>
                            <div className="bg-[#E8F9FF] border border-gray-200 p-4 rounded-xl">
                                <div className="text-sm text-gray-600 mb-1">전화번호</div>
                                <div className="font-medium text-gray-900">{currentCafeteria.phone}</div>
                            </div>
                            <div className="bg-[#E8F9FF] border border-gray-200 p-4 rounded-xl">
                                <div className="text-sm text-gray-600 mb-1">수용인원</div>
                                <div className="font-medium text-gray-900">
                                    {currentCafeteria.currentOccupancy}/{currentCafeteria.capacity}명
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 특선 메뉴 */}
                    {specialItems.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8">
                            <h2 className="text-xl font-bold mb-4 flex items-center text-yellow-800">
                                <Star className="w-6 h-6 mr-2"/>
                                오늘의 특선 메뉴
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {specialItems.map((item) => (
                                    <div key={item.id} className="bg-white border border-yellow-200 rounded-xl p-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="font-semibold text-lg text-gray-900">{item.name}</h3>
                                            <button
                                                onClick={() => toggleFavorite(item.id)}
                                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                                            >
                                                <Heart
                                                    className={`w-5 h-5 ${
                                                        favoriteItems.includes(item.id) ? "fill-red-500 text-red-500" : "text-gray-400"
                                                    }`}
                                                />
                                            </button>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span
                                                className="font-medium text-orange-600">{item.price.toLocaleString()}원</span>
                                            <div className="flex items-center">
                                                <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400"/>
                                                <span className="font-medium">{item.rating}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 메뉴 목록 */}
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                        <div className="mb-6">
                            <h2 className="text-xl font-bold text-gray-800 flex items-center">
                                <Clock className="w-5 h-5 mr-2"/>
                                {getMealDisplayName(selectedMeal)} 메뉴
                            </h2>
                            <p className="text-gray-600 mt-1">운영시간: {currentCafeteria.operatingHours[selectedMeal]}</p>
                        </div>

                        {currentMealItems.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {currentMealItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-[#E8F9FF] border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center space-x-3">
                                                <span className="text-2xl">{getCategoryIcon(item.category)}</span>
                                                <div>
                                                    <h3 className="font-medium text-gray-900 flex items-center">
                                                        {item.name}
                                                        {item.isVegetarian &&
                                                            <span className="ml-2 text-green-600">🌱</span>}
                                                        {item.isSpicy && <span className="ml-1 text-red-600">🌶️</span>}
                                                    </h3>
                                                    <span
                                                        className={`inline-block px-2 py-1 text-xs font-medium rounded-lg mt-1 ${getCategoryColor(item.category)}`}
                                                    >
                            {item.category}
                          </span>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => toggleFavorite(item.id)}
                                                className="p-1 hover:bg-white rounded-full transition-colors"
                                            >
                                                <Heart
                                                    className={`w-5 h-5 ${
                                                        favoriteItems.includes(item.id) ? "fill-red-500 text-red-500" : "text-gray-400"
                                                    }`}
                                                />
                                            </button>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">가격</span>
                                                <span
                                                    className="font-semibold text-orange-600">{item.price.toLocaleString()}원</span>
                                            </div>
                                            {item.calories && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">칼로리</span>
                                                    <span className="font-medium">{item.calories}kcal</span>
                                                </div>
                                            )}
                                            {item.rating && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">평점</span>
                                                    <div className="flex items-center">
                                                        <Star className="w-4 h-4 mr-1 fill-yellow-400 text-yellow-400"/>
                                                        <span className="font-medium">{item.rating}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <Calendar className="h-16 w-16 mx-auto mb-4 text-gray-400"/>
                                <p className="text-lg font-medium mb-2">선택한 날짜의 메뉴 정보가 없습니다</p>
                                <p className="text-sm">다른 날짜를 선택해보세요.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 프로필 모달 */}
                {showProfileModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-2xl max-w-lg w-full p-6">
                            <div className="flex flex-col items-center">
                                <div
                                    className="w-24 h-24 rounded-full bg-[#E8F9FF] flex items-center justify-center mb-4">
                                    <UserIcon className="h-12 w-12 text-gray-700"/>
                                </div>
                                <h2 className="text-xl font-bold mb-1 text-gray-900">홍길동</h2>
                                <p className="text-gray-500 mb-6">컴퓨터공학과 • 3학년</p>

                                <div className="w-full space-y-3 mb-6">
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                        <span className="font-medium text-gray-700">즐겨찾기 메뉴</span>
                                        <span className="text-gray-600">{favoriteItems.length}개</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                        <span className="font-medium text-gray-700">선호 식당</span>
                                        <span className="text-gray-600">{currentCafeteria.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                        <span className="font-medium text-gray-700">오늘 칼로리</span>
                                        <span className="text-gray-600">{totalCalories}kcal</span>
                                    </div>
                                </div>

                                <div className="w-full space-y-3">
                                    <button
                                        className="w-full py-3 px-4 bg-[#C4D9FF] hover:bg-[#B0CCFF] text-gray-800 rounded-xl transition-colors font-medium">
                                        설정
                                    </button>
                                    <button
                                        className="w-full py-3 px-4 bg-[#C5BAFF] hover:bg-[#B8ABFF] text-gray-800 rounded-xl transition-colors font-medium">
                                        내 정보 수정
                                    </button>
                                    <button
                                        onClick={() => setShowProfileModal(false)}
                                        className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl transition-colors font-medium"
                                    >
                                        닫기
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}