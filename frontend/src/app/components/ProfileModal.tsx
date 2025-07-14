"use client"

import { motion, AnimatePresence } from "framer-motion"
import Modal from "react-modal"
import { UserIcon, GraduationCap, BookOpen, Calendar } from "lucide-react"
import { useEffect, useState } from "react"
import { fetchProfile } from "@/lib/profile"
import type { Subject } from "@/hooks/useSubjects"

interface TimetableSlot {
    dayofweek: string
    starttime: string
    endtime: string
    subject: Subject
}

interface ProfileModalProps {
    showProfileModal: boolean
    userEmail: string | null
    userId: string | null
    subjects: Subject[]
    timetable: TimetableSlot[]
    onClose: () => void
    onLogout: () => void
    onSettingsClick: () => void
}

const modalVariants = {
    hidden: {
        opacity: 0,
        scale: 0.9,
        y: 50,
    },
    visible: {
        opacity: 1,
        scale: 1,
        y: 0,
        transition: {
            type: "spring" as const,
            stiffness: 300,
            damping: 25,
        },
    },
    exit: {
        opacity: 0,
        scale: 0.9,
        y: 50,
        transition: {
            duration: 0.2,
        },
    },
}

export function ProfileModal({
                                 showProfileModal,
                                 userEmail,
                                 userId,
                                 subjects,
                                 timetable,
                                 onClose,
                                 onLogout,
                                 onSettingsClick,
                             }: ProfileModalProps) {
    const [profileData, setProfileData] = useState({
        name: "",
        department: "",
        year: "",
        studentId: "",
        profileImageUrl: "",
    })

    const [isLoading, setIsLoading] = useState(false)

// 프로필 정보 불러오기
    useEffect(() => {
        if (showProfileModal && userId) {
            setIsLoading(true)
            fetchProfile(userId)
                .then(data => {
                    setProfileData({
                        name: data.name || "",
                        department: data.department || "",
                        year: data.year || "",
                        studentId: data.student_id || "",
                        profileImageUrl: data.profile_image_url || "",
                    })
                })
                .catch(error => {
                    console.error("프로필 정보 불러오기 실패:", error)
                })
                .finally(() => {
                    setIsLoading(false)
                })
        }
    }, [showProfileModal, userId])

// 학번 계산 (입학년도 뒤 2자리)
    const studentNumber = profileData.year ? `${profileData.year.slice(-2)}학번` : "학번 미설정"

    return (
        <AnimatePresence>
            {showProfileModal && (
                <Modal
                    isOpen={showProfileModal}
                    onRequestClose={onClose}
                    contentLabel="프로필"
                    className="backdrop-blur-xl bg-white/90 rounded-3xl max-w-md w-full mx-4 p-8 shadow-2xl border border-white/50"
                    overlayClassName="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    ariaHideApp={false}
                >
                    <motion.div variants={modalVariants} initial="hidden" animate="visible" exit="exit" className="text-center">
                        <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-6 shadow-2xl overflow-hidden"
                        >
                            {profileData.profileImageUrl ? (
                                <img
                                    src={profileData.profileImageUrl}
                                    alt="프로필 사진"
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <UserIcon className="h-12 w-12 text-white" />
                            )}
                        </motion.div>

                        <h2 className="text-2xl font-bold mb-2 text-gray-900">{profileData.name || userEmail || "사용자"}</h2>
                        <p className="text-gray-500 mb-8 flex items-center justify-center gap-2">
                            <GraduationCap className="h-4 w-4" />
                            {profileData.department || "학과 미설정"} • {studentNumber}
                        </p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="space-y-4 text-left mb-8"
                        >
                            <div className="p-4 bg-gradient-to-r from-blue-50/80 to-purple-50/80 rounded-2xl backdrop-blur-sm border border-white/30">
                                <div className="text-sm text-gray-600 flex items-center gap-2">
                                    <BookOpen className="h-4 w-4" />
                                    등록된 과목
                                </div>
                                <div className="font-bold text-xl text-gray-900">{subjects.length}개</div>
                            </div>

                            <div className="p-4 bg-gradient-to-r from-emerald-50/80 to-teal-50/80 rounded-2xl backdrop-blur-sm border border-white/30">
                                <div className="text-sm text-gray-600 flex items-center gap-2">
                                    <Calendar className="h-4 w-4" />
                                    생성된 시간표
                                </div>
                                <div className="font-bold text-xl text-gray-900">{timetable.length}개 과목</div>
                            </div>

                            <div className="p-4 bg-gradient-to-r from-amber-50/80 to-orange-50/80 rounded-2xl backdrop-blur-sm border border-white/30">
                                <div className="text-sm text-gray-600 flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4" />
                                    학번
                                </div>
                                <div className="font-bold text-xl text-gray-900">{profileData.studentId || "미입력"}</div>
                            </div>

                            <div className="p-4 bg-gradient-to-r from-indigo-50/80 to-purple-50/80 rounded-2xl backdrop-blur-sm border border-white/30">
                                <div className="text-sm text-gray-600 flex items-center gap-2">
                                    <UserIcon className="h-4 w-4" />
                                    이메일
                                </div>
                                <div className="font-bold text-xl text-gray-900 truncate">{userEmail || "-"}</div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="space-y-3"
                        >
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                    onClose()
                                    onSettingsClick()
                                }}
                                className="w-full py-3 px-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-2xl transition-all font-bold shadow-lg"
                            >
                                ⚙️ 설정
                            </motion.button>

                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={onLogout}
                                className="w-full py-3 px-6 bg-gray-100/80 hover:bg-gray-200/80 text-gray-800 rounded-2xl transition-all font-medium backdrop-blur-sm"
                            >
                                🚪 로그아웃
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </Modal>
            )}
        </AnimatePresence>
    )
}