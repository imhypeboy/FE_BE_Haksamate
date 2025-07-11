"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Bus, MapPin, Clock, Navigation, AlertCircle, Users, Route, Zap } from "lucide-react"
import { isAuthenticated } from "@/lib/auth"
import { MockDataFactory, type MockBusRoute, type MockBusStop } from '@/lib/mockData'

interface BusRoute {
    id: string
    name: string
    color: string
    description: string
    totalStops: number
    estimatedTime: number
}

interface BusStop {
    id: string
    name: string
    location: string
    facilities: string[]
    waitingPassengers: number
}

interface BusInfo {
    id: string
    routeId: string
    busNumber: string
    currentStop: string
    nextStop: string
    arrivalTime: number
    status: "running" | "delayed" | "stopped" | "maintenance"
    capacity: number
    currentPassengers: number
    driver: string
}

export default function ShuttlePage() {
    const router = useRouter()
    const [routes, setRoutes] = useState<MockBusRoute[]>([])
    const [stops, setStops] = useState<MockBusStop[]>([])
    const [selectedRoute, setSelectedRoute] = useState<string>("1")
    const [selectedTab, setSelectedTab] = useState<"schedule" | "map">("schedule")
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [showProfileModal, setShowProfileModal] = useState(false)
    const [expandedRoute, setExpandedRoute] = useState<string | null>(null)

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

    useEffect(() => {
        // 🔧 중앙 데이터 시스템에서 셔틀 데이터 가져오기
        const loadShuttleData = async () => {
            try {
                const [routesData, stopsData] = await Promise.all([
                    MockDataFactory.withDelay(MockDataFactory.createBusRoutes(), 400),
                    MockDataFactory.withDelay(MockDataFactory.createBusStops(), 300)
                ])

                setRoutes(routesData)
                setStops(stopsData)
            } catch (error) {
                console.error('셔틀 데이터 로드 실패:', error)
            }
        }

        loadShuttleData()
    }, [])

    const [busInfo, setBusInfo] = useState<BusInfo[]>([
        {
            id: "1",
            routeId: "1",
            busNumber: "A-001",
            currentStop: "본관",
            nextStop: "도서관",
            arrivalTime: 3,
            status: "running",
            capacity: 45,
            currentPassengers: 28,
            driver: "김기사",
        },
        {
            id: "2",
            routeId: "2",
            busNumber: "B-002",
            currentStop: "정문",
            nextStop: "후문",
            arrivalTime: 7,
            status: "running",
            capacity: 45,
            currentPassengers: 35,
            driver: "이기사",
        },
        {
            id: "3",
            routeId: "3",
            busNumber: "C-003",
            currentStop: "기숙사",
            nextStop: "본관",
            arrivalTime: 12,
            status: "delayed",
            capacity: 50,
            currentPassengers: 42,
            driver: "박기사",
        },
    ])

    const [selectedStop, setSelectedStop] = useState("1")
    const [notifications, setNotifications] = useState({
        arrivalAlert: true,
        delayAlert: true,
        capacityAlert: false,
    })

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push("/auth/login")
        }

        const interval = setInterval(() => {
            setBusInfo((prev) =>
                prev.map((bus) => ({
                    ...bus,
                    arrivalTime: Math.max(0, bus.arrivalTime - 1),
                })),
            )
        }, 60000)

        return () => clearInterval(interval)
    }, [router])

    const getStatusColor = (status: string) => {
        switch (status) {
            case "running":
                return "bg-green-100 text-green-800 border-green-200"
            case "delayed":
                return "bg-yellow-100 text-yellow-800 border-yellow-200"
            case "stopped":
                return "bg-red-100 text-red-800 border-red-200"
            case "maintenance":
                return "bg-gray-100 text-gray-800 border-gray-200"
            default:
                return "bg-gray-100 text-gray-800 border-gray-200"
        }
    }

    const getStatusText = (status: string) => {
        switch (status) {
            case "running":
                return "운행중"
            case "delayed":
                return "지연"
            case "stopped":
                return "운행종료"
            case "maintenance":
                return "정비중"
            default:
                return "알 수 없음"
        }
    }

    const getRouteColorClass = (color: string) => {
        const colorMap: { [key: string]: string } = {
            blue: "bg-blue-500",
            green: "bg-green-500",
            purple: "bg-purple-500",
            red: "bg-red-500",
            orange: "bg-orange-500",
        }
        return colorMap[color] || "bg-gray-500"
    }

    const filteredBusInfo = busInfo.filter((bus) => bus.routeId === selectedRoute)
    const selectedStopInfo = stops.find((stop) => stop.id === selectedStop)
    const selectedRouteInfo = routes.find((route) => route.id === selectedRoute)

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-200 via-purple-100 to-pink-100 text-gray-900">
            <header className="bg-white/20 backdrop-blur-md text-gray-800 py-4 px-6 flex items-center shadow-lg border-b border-white/30">
                <button
                    onClick={() => router.push("/")}
                    className="mr-4 hover:bg-white/20 p-2 rounded-full transition-colors backdrop-blur-sm"
                    aria-label="뒤로 가기"
                >
                    <ArrowLeft className="h-5 w-5" />
                </button>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center">
                    <Bus className="w-6 h-6 mr-2 text-indigo-600" />
                    학교 셔틀버스 실시간 정보
                </h1>
            </header>

            <div className="max-w-6xl mx-auto py-8 px-4">
                {/* 노선 선택 */}
                <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 p-6 mb-8">
                    <h2 className="text-xl font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center">
                        <Route className="w-5 h-5 mr-2 text-indigo-600" />
                        노선 선택
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {routes.map((route) => (
                            <button
                                key={route.id}
                                onClick={() => setSelectedRoute(route.id)}
                                className={`p-4 rounded-xl border-2 transition-all ${
                                    selectedRoute === route.id
                                        ? "border-indigo-500 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 backdrop-blur-sm"
                                        : "border-gray-200 bg-white/60 hover:border-gray-300 hover:bg-white/80"
                                }`}
                            >
                                <div className="flex items-center space-x-3 mb-2">
                                    <div className={`w-4 h-4 rounded-full ${getRouteColorClass(route.color)}`}></div>
                                    <span className="font-semibold text-gray-900">{route.name}</span>
                                </div>
                                <p className="text-sm text-gray-600 mb-2">{route.description}</p>
                                <div className="flex justify-between text-xs text-gray-500">
                                    <span>{route.totalStops}개 정류장</span>
                                    <span>약 {route.estimatedTime}분</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 통계 카드 */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-r from-indigo-500/80 to-purple-500/80 backdrop-blur-md text-white p-6 rounded-2xl shadow-xl border border-white/30">
                        <div className="flex items-center">
                            <Navigation className="h-8 w-8 mr-3" />
                            <div>
                                <h3 className="text-lg font-semibold">운행 노선</h3>
                                <p className="text-3xl font-bold">{routes.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-500/80 to-emerald-500/80 backdrop-blur-md text-white p-6 rounded-2xl shadow-xl border border-white/30">
                        <div className="flex items-center">
                            <Bus className="h-8 w-8 mr-3" />
                            <div>
                                <h3 className="text-lg font-semibold">운행 버스</h3>
                                <p className="text-3xl font-bold">{busInfo.filter((bus) => bus.status === "running").length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-yellow-500/80 to-orange-500/80 backdrop-blur-md text-white p-6 rounded-2xl shadow-xl border border-white/30">
                        <div className="flex items-center">
                            <MapPin className="h-8 w-8 mr-3" />
                            <div>
                                <h3 className="text-lg font-semibold">정류장</h3>
                                <p className="text-3xl font-bold">{stops.length}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-red-500/80 to-pink-500/80 backdrop-blur-md text-white p-6 rounded-2xl shadow-xl border border-white/30">
                        <div className="flex items-center">
                            <Users className="h-8 w-8 mr-3" />
                            <div>
                                <h3 className="text-lg font-semibold">대기 승객</h3>
                                <p className="text-3xl font-bold">{stops.reduce((sum, stop) => sum + stop.waitingPassengers, 0)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 실시간 버스 위치 */}
                    <div className="lg:col-span-2">
                        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 p-6">
                            <h2 className="text-xl font-bold mb-6 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center">
                                <Navigation className="w-5 h-5 mr-2 text-indigo-600" />
                                실시간 버스 위치 - {selectedRouteInfo?.name}
                            </h2>

                            <div className="space-y-4">
                                {filteredBusInfo.map((bus) => {
                                    const occupancyRate = Math.round((bus.currentPassengers / bus.capacity) * 100)

                                    return (
                                        <div
                                            key={bus.id}
                                            className="bg-gradient-to-r from-white/60 to-indigo-50/60 backdrop-blur-sm rounded-xl border border-white/30 p-6 hover:from-white/80 hover:to-indigo-50/80 transition-all shadow-md"
                                        >
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center space-x-4">
                                                    <div
                                                        className={`w-12 h-12 rounded-full ${getRouteColorClass(selectedRouteInfo?.color || "blue")} flex items-center justify-center text-white font-bold`}
                                                    >
                                                        {bus.busNumber.split("-")[1]}
                                                    </div>
                                                    <div>
                                                        <h3 className="font-semibold text-gray-900">{bus.busNumber}</h3>
                                                        <p className="text-sm text-gray-600">{bus.driver} 기사</p>
                                                    </div>
                                                </div>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(bus.status)}`}
                                                >
                          {getStatusText(bus.status)}
                        </span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                                <div className="bg-gray-50/80 backdrop-blur-sm rounded-lg p-3">
                                                    <span className="text-gray-600 text-sm">현재 위치</span>
                                                    <p className="font-medium text-gray-900">{bus.currentStop}</p>
                                                </div>
                                                <div className="bg-gray-50/80 backdrop-blur-sm rounded-lg p-3">
                                                    <span className="text-gray-600 text-sm">다음 정류장</span>
                                                    <p className="font-medium text-gray-900">{bus.nextStop}</p>
                                                </div>
                                                <div className="bg-blue-50/80 backdrop-blur-sm rounded-lg p-3">
                                                    <span className="text-gray-600 text-sm">도착 예정</span>
                                                    <p className="font-medium text-blue-600">
                                                        {bus.arrivalTime === 0 ? "도착" : `${bus.arrivalTime}분 후`}
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="flex items-center space-x-2">
                                                        <Users className="w-4 h-4 text-gray-500" />
                                                        <span className="text-sm text-gray-600">
                              {bus.currentPassengers}/{bus.capacity}명
                            </span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        <div
                                                            className={`w-3 h-3 rounded-full ${
                                                                occupancyRate > 80
                                                                    ? "bg-red-500"
                                                                    : occupancyRate > 60
                                                                        ? "bg-yellow-500"
                                                                        : "bg-green-500"
                                                            }`}
                                                        ></div>
                                                        <span className="text-sm text-gray-600">{occupancyRate}% 탑승</span>
                                                    </div>
                                                </div>

                                                {bus.arrivalTime <= 5 && bus.arrivalTime > 0 && (
                                                    <div className="flex items-center text-orange-600">
                                                        <AlertCircle className="w-4 h-4 mr-1" />
                                                        <span className="text-sm font-medium">곧 도착</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* 탑승률 바 */}
                                            <div className="mt-4">
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div
                                                        className={`h-2 rounded-full transition-all duration-300 ${
                                                            occupancyRate > 80 ? "bg-red-500" : occupancyRate > 60 ? "bg-yellow-500" : "bg-green-500"
                                                        }`}
                                                        style={{ width: `${occupancyRate}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* 사이드바 */}
                    <div className="space-y-6">
                        {/* 정류장 정보 */}
                        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 p-6">
                            <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center">
                                <MapPin className="w-5 h-5 mr-2 text-indigo-600" />
                                정류장 정보
                            </h3>
                            <div className="space-y-3">
                                {stops.map((stop) => (
                                    <div
                                        key={stop.id}
                                        className={`p-3 rounded-xl cursor-pointer transition-all ${
                                            selectedStop === stop.id
                                                ? "bg-gradient-to-br from-indigo-100/80 to-purple-100/80 backdrop-blur-sm border-2 border-indigo-300"
                                                : "bg-gray-50/80 hover:bg-gray-100/80 border-2 border-transparent backdrop-blur-sm"
                                        }`}
                                        onClick={() => setSelectedStop(stop.id)}
                                    >
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium text-gray-900">{stop.name}</span>
                                            <div className="flex items-center text-sm text-gray-600">
                                                <Users className="w-4 h-4 mr-1" />
                                                <span>{stop.waitingPassengers}</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-2">{stop.location}</p>
                                        <div className="flex flex-wrap gap-1">
                                            {stop.facilities.map((facility, index) => (
                                                <span
                                                    key={index}
                                                    className="text-xs bg-white/80 backdrop-blur-sm px-2 py-1 rounded-full text-gray-600"
                                                >
                          {facility}
                        </span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 운행 시간표 */}
                        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 p-6">
                            <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center">
                                <Clock className="w-5 h-5 mr-2 text-indigo-600" />
                                운행 시간표
                            </h3>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <div className="font-medium text-gray-700">평일</div>
                                    <div className="text-gray-600">07:00 - 22:00 (10분 간격)</div>
                                </div>
                                <div>
                                    <div className="font-medium text-gray-700">주말</div>
                                    <div className="text-gray-600">08:00 - 20:00 (15분 간격)</div>
                                </div>
                                <div>
                                    <div className="font-medium text-gray-700">공휴일</div>
                                    <div className="text-gray-600">운행 중단</div>
                                </div>
                            </div>
                        </div>

                        {/* 알림 설정 */}
                        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-white/30 p-6">
                            <h3 className="text-lg font-bold mb-4 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent flex items-center">
                                <Zap className="w-5 h-5 mr-2 text-indigo-600" />
                                알림 설정
                            </h3>
                            <div className="space-y-3">
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={notifications.arrivalAlert}
                                        onChange={(e) =>
                                            setNotifications((prev) => ({
                                                ...prev,
                                                arrivalAlert: e.target.checked,
                                            }))
                                        }
                                        className="mr-3 rounded"
                                    />
                                    <span className="text-sm">버스 도착 5분 전 알림</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={notifications.delayAlert}
                                        onChange={(e) =>
                                            setNotifications((prev) => ({
                                                ...prev,
                                                delayAlert: e.target.checked,
                                            }))
                                        }
                                        className="mr-3 rounded"
                                    />
                                    <span className="text-sm">운행 지연 알림</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={notifications.capacityAlert}
                                        onChange={(e) =>
                                            setNotifications((prev) => ({
                                                ...prev,
                                                capacityAlert: e.target.checked,
                                            }))
                                        }
                                        className="mr-3 rounded"
                                    />
                                    <span className="text-sm">만석 알림</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}