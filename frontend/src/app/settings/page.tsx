"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Sidebar from "../sidebar/sidebar"
import { useAuth } from "@/hooks/useAuth"
import {
  Bell,
  User,
  Globe,
  Lock,
  Save,
  LogOut,
  UserIcon,
  Shield,
  Smartphone,
  Mail,
  Languages,
  Moon,
  Sun,
  Camera,
  X,
} from "lucide-react"
import { fetchProfile, updateProfile } from "@/lib/profile"
import { supabase } from "@/lib/supabaseClient"

export default function SettingsPage() {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState("profile")
  const [saving, setSaving] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [profileImage, setProfileImage] = useState<string | undefined>(undefined)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 인증 확인 및 리다이렉트
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, isLoading, router])

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

  // 최근 10년치 입학년도 리스트
  const currentYear = new Date().getFullYear()
  const admissionYears = Array.from({ length: 10 }, (_, i) => String(currentYear - i))

  // 학과 리스트
  const departments = [
    "간호학과",
    "건축학과",
    "경영학과",
    "글로벌한국학과",
    "데이터클라우드공학과",
    "동물자원과학과",
    "바이오융합공학과",
    "보건관리학과",
    "물리치료학과",
    "미래융합자유전공학부",
    "사회복지학과",
    "상담심리학과",
    "신학과",
    "식품영양학과",
    "아트앤디자인학과",
    "약학과",
    "영어영문학과",
    "유아교육과",
    "음악학과",
    "인공지능융합학부",
    "창의융합자유전공학부",
    "체육학과",
    "컴퓨터공학부",
    "항공관광외국어학부",
    "환경디자인원예학과",
    "화학생명과학과"
  ]

  // 프로필 상태 - 로그인한 사용자 정보로 초기화
  const [profileSettings, setProfileSettings] = useState({
    name: "",
    email: "",
    department: "",
    studentId: "",
    year: "",
  })

  // DB에서 프로필 정보 불러오기
  useEffect(() => {
    if (user?.id) {
      fetchProfile(user.id).then(data => {
        setProfileSettings({
          name: data.name || "",
          email: data.email || "",
          department: data.department || "",
          studentId: data.student_id || "",
          year: data.year || "",
        })
        setProfileImage(data.profile_image_url || undefined)
      })
    }
  }, [user])

  // 알림 설정
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    scheduleReminders: true,
    deadlineAlerts: true,
    systemUpdates: false,
    communityNotifications: true,
    gradeNotifications: true,
  })

  // 일반 설정
  const [generalSettings, setGeneralSettings] = useState({
    language: "ko",
    theme: "light",
    autoSave: true,
    dataSync: true,
    offlineMode: false,
  })

  // 보안 설정
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginAlerts: true,
    sessionTimeout: "30",
    dataEncryption: true,
  })

  // 저장 버튼 클릭 시 DB에 저장
  const handleSave = async () => {
    if (!user) return;
    setSaving(true)
    try {
      await updateProfile(user.id, {
        name: profileSettings.name,
        email: profileSettings.email,
        department: profileSettings.department,
        studentId: profileSettings.studentId,
        year: profileSettings.year,
        profile_image_url: profileImage,
      })
      alert("설정이 저장되었습니다.")
    } catch (e) {
      alert("설정 저장에 실패했습니다.")
    }
    setSaving(false)
  }

  const handleLogout = async () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      try {
        await supabase.auth.signOut()
        router.push("/auth/login")
      } catch (error) {
        console.error("로그아웃 실패:", error)
        alert("로그아웃 중 오류가 발생했습니다.")
      }
    }
  }

  // 프로필 사진 업로드 처리
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 파일 크기 체크 (5MB 제한)
    if (file.size > 5 * 1024 * 1024) {
      alert("파일 크기는 5MB 이하여야 합니다.")
      return
    }

    // 파일 타입 체크
    if (!file.type.startsWith('image/')) {
      alert("이미지 파일만 업로드 가능합니다.")
      return
    }

    setIsUploading(true)

    try {
      // 파일명 생성 (타임스탬프 + 원본 확장자)
      const timestamp = Date.now()
      const fileExtension = file.name.split('.').pop()
      const fileName = `profile_${timestamp}.${fileExtension}`

      // FormData 생성
      const formData = new FormData()
      formData.append('image', file)
      formData.append('fileName', fileName)

      // 서버에 이미지 업로드
      const response = await fetch('/api/upload-profile-image', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('이미지 업로드에 실패했습니다.')
      }

      const result = await response.json()

      // 성공 시 이미지 경로 설정
      setProfileImage(`/profile_img/${fileName}`)

    } catch (error) {
      console.error('이미지 업로드 오류:', error)
      alert('이미지 업로드에 실패했습니다.')
    } finally {
      setIsUploading(false)
    }
  }

  // 프로필 사진 제거
  const handleRemoveImage = async () => {
    if (profileImage && profileImage.startsWith('/profile_img/')) {
      try {
        // 서버에서 파일 삭제 요청
        const fileName = profileImage.split('/').pop()
        const response = await fetch('/api/delete-profile-image', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fileName }),
        })

        if (!response.ok) {
          console.error('파일 삭제 실패')
        }
      } catch (error) {
        console.error('파일 삭제 오류:', error)
      }
    }

    setProfileImage(undefined)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // 파일 선택 다이얼로그 열기
  const handleSelectImage = () => {
    fileInputRef.current?.click()
  }

  const tabs = [
    { id: "profile", label: "프로필 설정", icon: User },
    { id: "notifications", label: "알림 설정", icon: Bell },
    { id: "general", label: "일반 설정", icon: Globe },
    { id: "security", label: "보안 설정", icon: Lock },
  ]

  // 로딩 중이거나 사용자가 없으면 로딩 화면 표시
  if (isLoading || !user) {
    return (
        <div className="min-h-screen bg-[#FBFBFB] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">로딩 중...</p>
          </div>
        </div>
    )
  }

  return (
      <div className="min-h-screen bg-[#FBFBFB] text-gray-900 md:flex">
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

        <div className={`flex-1 transition-all duration-500 ease-out ${sidebarOpen ? "md:ml-[280px]" : "md:ml-0"}`}>
          {/* 헤더 */}
          <header
              className="bg-white border-b border-gray-200 py-4 px-4 flex justify-between items-center shadow-sm">
            <div className="w-10 md:hidden"></div>
            <h1 className="text-xl font-bold text-gray-800 flex-1 text-center">설정</h1>
            {/* 프로필 버튼 삭제됨 */}
          </header>

          <div className="max-w-6xl mx-auto py-8 px-4">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* 사이드 탭 */}
              <div className="lg:w-1/4">
                <nav className="bg-white border border-gray-200 rounded-xl p-4 sticky top-8 shadow-sm">
                  <ul className="space-y-2">
                    {tabs.map((tab) => {
                      const Icon = tab.icon
                      return (
                          <li key={tab.id}>
                            <button
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full text-left px-4 py-3 rounded-xl flex items-center transition-colors ${
                                    activeTab === tab.id
                                        ? "bg-[#E8F9FF] text-blue-700 border border-blue-200"
                                        : "hover:bg-gray-50 text-gray-700"
                                }`}
                            >
                              <Icon className="h-5 w-5 mr-3"/>
                              <span className="font-medium">{tab.label}</span>
                            </button>
                          </li>
                      )
                    })}
                    <li className="pt-4 mt-4 border-t border-gray-200">
                      <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-3 rounded-xl flex items-center text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <LogOut className="h-5 w-5 mr-3"/>
                        <span className="font-medium">로그아웃</span>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>

              {/* 메인 설정 패널 */}
              <div className="lg:w-3/4 bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                {activeTab === "profile" && (
                    <div>
                      <div className="flex items-center mb-6">
                        <div
                            className="w-12 h-12 bg-[#E8F9FF] rounded-xl flex items-center justify-center mr-4">
                          <User className="h-6 w-6 text-gray-700"/>
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-800">프로필 설정</h2>
                          <p className="text-gray-600 text-sm">개인 정보를 관리하세요</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {/* 프로필 사진 섹션 */}
                        <div className="flex flex-col items-center space-y-4">
                          <div className="relative">
                            <div className="w-24 h-24 rounded-full overflow-hidden bg-gray-100 border-4 border-gray-200">
                              {profileImage ? (
                                  <img
                                      src={profileImage}
                                      alt="프로필 사진"
                                      className="w-full h-full object-cover"
                                  />
                              ) : (
                                  <div className="w-full h-full bg-[#E8F9FF] flex items-center justify-center">
                                    <UserIcon className="h-12 w-12 text-gray-400" />
                                  </div>
                              )}
                            </div>
                            {isUploading && (
                                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                                </div>
                            )}
                            {profileImage && (
                                <button
                                    onClick={handleRemoveImage}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button
                                onClick={handleSelectImage}
                                disabled={isUploading}
                                className="px-4 py-2 bg-[#C4D9FF] hover:bg-[#B0CCFF] text-gray-800 rounded-lg flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              <Camera className="h-4 w-4" />
                              <span>사진 선택</span>
                            </button>
                            {profileImage && (
                                <button
                                    onClick={handleRemoveImage}
                                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                                >
                                  제거
                                </button>
                            )}
                          </div>
                          <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label
                                className="block text-sm font-medium text-gray-700 mb-2">이름</label>
                            <input
                                type="text"
                                className="w-full border border-gray-300 rounded-xl px-3 py-3 bg-white text-gray-900 focus:border-blue-500 focus:outline-none"
                                value={profileSettings.name}
                                onChange={(e) => setProfileSettings({
                                  ...profileSettings,
                                  name: e.target.value
                                })}
                            />
                          </div>
                          <div>
                            <label
                                className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                            <input
                                type="email"
                                className="w-full border border-gray-300 rounded-xl px-3 py-3 bg-gray-100 text-gray-600 cursor-not-allowed"
                                value={profileSettings.email}
                                readOnly
                                disabled
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label
                                className="block text-sm font-medium text-gray-700 mb-2">학과</label>
                            <select
                                className="w-full border border-gray-300 rounded-xl px-3 py-3 bg-white text-gray-900 focus:border-blue-500 focus:outline-none"
                                value={profileSettings.department}
                                onChange={(e) => setProfileSettings({
                                  ...profileSettings,
                                  department: e.target.value
                                })}
                            >
                              <option value="">학과를 선택하세요</option>
                              {departments.map((dept) => (
                                  <option key={dept} value={dept}>
                                    {dept}
                                  </option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label
                                className="block text-sm font-medium text-gray-700 mb-2">입학년도</label>
                            <select
                                className="w-full border border-gray-300 rounded-xl px-3 py-3 bg-white text-gray-900 focus:border-blue-500 focus:outline-none"
                                value={profileSettings.year}
                                onChange={(e) => setProfileSettings({
                                  ...profileSettings,
                                  year: e.target.value
                                })}
                            >
                              <option value="">입학년도를 선택하세요</option>
                              {admissionYears.map((year) => (
                                  <option key={year} value={year}>
                                    {year}년
                                  </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label
                                className="block text-sm font-medium text-gray-700 mb-2">학번</label>
                            <input
                                type="text"
                                placeholder="학번을 입력하세요"
                                className={`w-full border border-gray-300 rounded-xl px-3 py-3 focus:border-blue-500 focus:outline-none ${
                                    profileSettings.studentId
                                        ? 'bg-white text-gray-900'
                                        : 'bg-gray-50 text-gray-500'
                                }`}
                                value={profileSettings.studentId}
                                onChange={(e) => setProfileSettings({
                                  ...profileSettings,
                                  studentId: e.target.value
                                })}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                )}

                {activeTab === "notifications" && (
                    <div>
                      <div className="flex items-center mb-6">
                        <div
                            className="w-12 h-12 bg-[#C4D9FF] rounded-xl flex items-center justify-center mr-4">
                          <Bell className="h-6 w-6 text-gray-700"/>
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-800">알림 설정</h2>
                          <p className="text-gray-600 text-sm">알림 수신 방법을 설정하세요</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-[#E8F9FF] border border-gray-200 rounded-xl p-4">
                          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                            <Mail className="w-5 h-5 mr-2"/>
                            이메일 알림
                          </h3>
                          <div className="space-y-4">
                            {[
                              {
                                key: "emailNotifications",
                                label: "이메일 알림 수신",
                                desc: "중요한 알림을 이메일로 받습니다",
                              },
                              {
                                key: "scheduleReminders",
                                label: "일정 알림",
                                desc: "수업 및 시험 일정을 미리 알려드립니다",
                              },
                              {
                                key: "deadlineAlerts",
                                label: "마감일 알림",
                                desc: "과제 및 신청 마감일을 알려드립니다"
                              },
                            ].map((item) => (
                                <div key={item.key} className="flex items-center justify-between">
                                  <div>
                                    <div
                                        className="font-medium text-gray-800">{item.label}</div>
                                    <div className="text-sm text-gray-600">{item.desc}</div>
                                  </div>
                                  <label
                                      className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={notificationSettings[item.key as keyof typeof notificationSettings]}
                                        onChange={(e) =>
                                            setNotificationSettings({
                                              ...notificationSettings,
                                              [item.key]: e.target.checked,
                                            })
                                        }
                                    />
                                    <div
                                        className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                  </label>
                                </div>
                            ))}
                          </div>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                            <Smartphone className="w-5 h-5 mr-2"/>앱 알림
                          </h3>
                          <div className="space-y-4">
                            {[
                              {
                                key: "systemUpdates",
                                label: "시스템 업데이트",
                                desc: "앱 업데이트 및 시스템 공지사항"
                              },
                              {
                                key: "communityNotifications",
                                label: "커뮤니티 알림",
                                desc: "댓글, 좋아요 등 커뮤니티 활동",
                              },
                              {key: "gradeNotifications", label: "성적 알림", desc: "성적 입력 및 변경 알림"},
                            ].map((item) => (
                                <div key={item.key} className="flex items-center justify-between">
                                  <div>
                                    <div
                                        className="font-medium text-gray-800">{item.label}</div>
                                    <div className="text-sm text-gray-600">{item.desc}</div>
                                  </div>
                                  <label
                                      className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="sr-only peer"
                                        checked={notificationSettings[item.key as keyof typeof notificationSettings]}
                                        onChange={(e) =>
                                            setNotificationSettings({
                                              ...notificationSettings,
                                              [item.key]: e.target.checked,
                                            })
                                        }
                                    />
                                    <div
                                        className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                  </label>
                                </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                )}

                {activeTab === "general" && (
                    <div>
                      <div className="flex items-center mb-6">
                        <div
                            className="w-12 h-12 bg-[#C5BAFF] rounded-xl flex items-center justify-center mr-4">
                          <Globe className="h-6 w-6 text-gray-700"/>
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-800">일반 설정</h2>
                          <p className="text-gray-600 text-sm">앱 사용 환경을 설정하세요</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-[#E8F9FF] border border-gray-200 rounded-xl p-4">
                          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                            <Languages className="w-5 h-5 mr-2"/>
                            언어 및 지역
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label
                                  className="block text-sm font-medium text-gray-700 mb-2">언어</label>
                              <select
                                  className="w-full border border-gray-300 rounded-xl px-3 py-3 bg-white text-gray-900 focus:border-blue-500 focus:outline-none"
                                  value={generalSettings.language}
                                  onChange={(e) => setGeneralSettings({
                                    ...generalSettings,
                                    language: e.target.value
                                  })}
                              >
                                <option value="ko">한국어</option>
                                <option value="en">English</option>
                                <option value="ja">日本語</option>
                                <option value="zh">中文</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                            {generalSettings.theme === "light" ? (
                                <Sun className="w-5 h-5 mr-2"/>
                            ) : (
                                <Moon className="w-5 h-5 mr-2"/>
                            )}
                            테마 및 표시
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <label
                                  className="block text-sm font-medium text-gray-700 mb-2">테마</label>
                              <select
                                  className="w-full border border-gray-300 rounded-xl px-3 py-3 bg-white text-gray-900 focus:border-blue-500 focus:outline-none"
                                  value={generalSettings.theme}
                                  onChange={(e) => setGeneralSettings({
                                    ...generalSettings,
                                    theme: e.target.value
                                  })}
                              >
                                <option value="light">라이트 모드</option>
                                <option value="dark">다크 모드</option>
                                <option value="auto">시스템 설정 따름</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {[
                            {key: "autoSave", label: "자동 저장", desc: "작성 중인 내용을 자동으로 저장합니다"},
                            {key: "dataSync", label: "데이터 동기화", desc: "여러 기기 간 데이터를 동기화합니다"},
                            {
                              key: "offlineMode",
                              label: "오프라인 모드",
                              desc: "인터넷 연결 없이도 일부 기능을 사용할 수 있습니다",
                            },
                          ].map((item) => (
                              <div
                                  key={item.key}
                                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl"
                              >
                                <div>
                                  <div className="font-medium text-gray-800">{item.label}</div>
                                  <div className="text-sm text-gray-600">{item.desc}</div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                      type="checkbox"
                                      className="sr-only peer"
                                      checked={generalSettings[item.key as keyof typeof generalSettings] as boolean}
                                      onChange={(e) =>
                                          setGeneralSettings({
                                            ...generalSettings,
                                            [item.key]: e.target.checked,
                                          })
                                      }
                                  />
                                  <div
                                      className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                              </div>
                          ))}
                        </div>
                      </div>
                    </div>
                )}

                {activeTab === "security" && (
                    <div>
                      <div className="flex items-center mb-6">
                        <div
                            className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center mr-4">
                          <Lock className="h-6 w-6 text-red-600"/>
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-gray-800">보안 설정</h2>
                          <p className="text-gray-600 text-sm">계정 보안을 강화하세요</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                          <h3 className="font-semibold text-gray-800 mb-4 flex items-center">
                            <Shield className="w-5 h-5 mr-2 text-red-600"/>
                            인증 설정
                          </h3>
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-gray-800">2단계 인증</div>
                                <div className="text-sm text-gray-600">SMS 또는 앱을 통한 추가 인증</div>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={securitySettings.twoFactorAuth}
                                    onChange={(e) =>
                                        setSecuritySettings({
                                          ...securitySettings,
                                          twoFactorAuth: e.target.checked,
                                        })
                                    }
                                />
                                <div
                                    className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                              </label>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">세션
                                타임아웃</label>
                              <select
                                  className="w-full border border-gray-300 rounded-xl px-3 py-3 bg-white text-gray-900 focus:border-blue-500 focus:outline-none"
                                  value={securitySettings.sessionTimeout}
                                  onChange={(e) =>
                                      setSecuritySettings({
                                        ...securitySettings,
                                        sessionTimeout: e.target.value
                                      })
                                  }
                              >
                                <option value="15">15분</option>
                                <option value="30">30분</option>
                                <option value="60">1시간</option>
                                <option value="120">2시간</option>
                                <option value="never">자동 로그아웃 안함</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          {[
                            {key: "loginAlerts", label: "로그인 알림", desc: "새로운 기기에서 로그인 시 알림을 받습니다"},
                            {
                              key: "dataEncryption",
                              label: "데이터 암호화",
                              desc: "저장된 데이터를 암호화하여 보호합니다",
                            },
                          ].map((item) => (
                              <div
                                  key={item.key}
                                  className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl"
                              >
                                <div>
                                  <div className="font-medium text-gray-800">{item.label}</div>
                                  <div className="text-sm text-gray-600">{item.desc}</div>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                  <input
                                      type="checkbox"
                                      className="sr-only peer"
                                      checked={securitySettings[item.key as keyof typeof securitySettings] as boolean}
                                      onChange={(e) =>
                                          setSecuritySettings({
                                            ...securitySettings,
                                            [item.key]: e.target.checked,
                                          })
                                      }
                                  />
                                  <div
                                      className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                </label>
                              </div>
                          ))}
                        </div>

                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                          <h4 className="font-medium text-yellow-800 mb-2">⚠️ 주의사항</h4>
                          <ul className="text-sm text-yellow-700 space-y-1">
                            <li>• 2단계 인증을 활성화하면 로그인 시 추가 인증이 필요합니다</li>
                            <li>• 세션 타임아웃 설정이 짧을수록 보안이 강화됩니다</li>
                            <li>• 데이터 암호화는 성능에 영향을 줄 수 있습니다</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                )}

                {/* 저장 버튼 */}
                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end">
                  <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-3 bg-[#C4D9FF] hover:bg-[#B0CCFF] text-gray-800 rounded-xl flex items-center disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                  >
                    {saving ? (
                        <>
                          <div
                              className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-800 mr-2"></div>
                          저장 중...
                        </>
                    ) : (
                        <>
                          <Save className="h-4 w-4 mr-2"/>
                          설정 저장
                        </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 프로필 모달 삭제됨 */}
        </div>
      </div>
  )
}