"use client"

import { useEffect, useState, useCallback, useMemo, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, RotateCcw, Plus, Minus, Clock, TimerIcon, AlarmClockIcon as Alarm, Flag, Settings, MoreVertical } from "lucide-react"
import Sidebar from "../sidebar/sidebar"
import { showToast, ToastContainer } from "../components/toast"
import { useAudio } from "./hooks/useAudio"
import { useStopwatch } from "./hooks/useStopwatch"
import { useAlarms } from "./hooks/useAlarms"
import { formatStopwatchTime, formatCurrentTime } from "./utils/timeFormatters"
import TimerSection from "./components/TimerSection"
import type { TimerState, StopwatchState, ActiveTab, AlarmItem, LapTime } from "./types"
import { StatusIndicator } from '@/components/ui/StatusIndicator'

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
}

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            type: "spring" as const,
            stiffness: 300,
            damping: 25,
        },
    },
}

export default function TimerApp() {
    const [activeTab, setActiveTab] = useState<ActiveTab>("timer")
    const [currentTime, setCurrentTime] = useState(new Date())
    const [sidebarOpen, setSidebarOpen] = useState(false)
    
    // 오디오 훅 사용
    const { playNotificationSound, playAlarmSound, playIntervalSound, playSuccessSound } = useAudio()



    // 스톱워치 훅 사용
    const {
        stopwatchTime, stopwatchState, lapTimes, lapCounter, targetTime, targetEnabled,
        intervalTime, intervalEnabled, soundEnabled, lapStats,
        startStopwatch, pauseStopwatch, resetStopwatch, addLap,
        setTargetMinutes, setIntervalMinutes, toggleTargetEnabled, toggleIntervalEnabled, toggleSoundEnabled,
        setTargetTime, setIntervalTime, setTargetEnabled, setIntervalEnabled, setSoundEnabled,
        setLapTimes, setLapCounter
    } = useStopwatch({ playIntervalSound, playSuccessSound })

    // 알람 훅 사용
    const {
        alarms, showAddAlarm, newAlarmTime, newAlarmLabel,
        toggleAlarm, addAlarm, deleteAlarm, updateAlarm, toggleAlarmDay,
        toggleAllAlarms, sortAlarmsByTime,
        setShowAddAlarm, setNewAlarmTime, setNewAlarmLabel
    } = useAlarms({ playAlarmSound })

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

    // 사이드바 반응형 처리

    // Update current time every second
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date())
        }, 1000)
        return () => clearInterval(interval)
    }, [])

    // 포맷팅 함수들은 utils에서 import하여 사용

    // 메모이제이션으로 성능 최적화
    const currentTimeDisplay = useMemo(() => formatCurrentTime(currentTime), [currentTime])
    const stopwatchDisplay = useMemo(() => formatStopwatchTime(stopwatchTime), [stopwatchTime])

    return (
        <div className="min-h-screen bg-[#FBFBFB] text-gray-900 md:flex">
            <ToastContainer />
            <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

            <div className={`flex-1 transition-all duration-500 ease-out ${sidebarOpen ? "md:ml-[280px]" : "md:ml-0"}`}>
                {/* 헤더 with 툴바 - 개선된 레이아웃 */}
                <header className="bg-white/95 backdrop-blur-xl border-b border-gray-200/60 shadow-sm">
                    <div className="px-4 py-3 flex justify-between items-center">
                        <div className="w-10 md:hidden"></div>
                        <div className="flex items-center gap-3">
                            <motion.div
                                whileHover={{ rotate: 360, scale: 1.1 }}
                                transition={{ duration: 0.6 }}
                                className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/25"
                            >
                                {activeTab === "alarm" && <Alarm className="h-5 w-5 text-white" />}
                                {activeTab === "stopwatch" && <Clock className="h-5 w-5 text-white" />}
                                {activeTab === "timer" && <TimerIcon className="h-5 w-5 text-white" />}
                            </motion.div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 capitalize">
                                    {activeTab === "alarm" && "알람"}
                                    {activeTab === "stopwatch" && "스톱워치"}
                                    {activeTab === "timer" && "타이머"}
                                </h1>
                                <p className="text-xs text-gray-500">시간 관리 도구</p>
                            </div>
                        </div>
                        <div className="w-9"></div>
                    </div>

                                        {/* 툴바 - 세그먼트 컨트롤 스타일 */}
                    <div className="px-4 pb-4 flex justify-center">
                        <div className="inline-flex bg-gray-100/80 backdrop-blur-sm rounded-full p-1.5 shadow-inner">
                            {[
                                { icon: Alarm, label: "알람", tab: "alarm" as ActiveTab },
                                { icon: Clock, label: "스톱워치", tab: "stopwatch" as ActiveTab },
                                { icon: TimerIcon, label: "타이머", tab: "timer" as ActiveTab },
                            ].map(({ icon: Icon, label, tab }) => (
                                <motion.button
                                    key={tab}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setActiveTab(tab)}
                                    className={`relative flex items-center justify-center gap-2 px-6 py-3 rounded-full font-medium text-sm transition-all duration-300 ${
                                        activeTab === tab 
                                            ? "bg-gray-800 text-white shadow-lg shadow-gray-800/25" 
                                            : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
                                    }`}
                                >
                                    <Icon className="h-4 w-4" />
                                    <span className="hidden sm:inline">{label}</span>
                                    
                                    {/* 선택된 탭의 배경 애니메이션 */}
                                    {activeTab === tab && (
                                        <motion.div
                                            layoutId="activeTab"
                                            className="absolute inset-0 bg-gray-800 rounded-full -z-10"
                                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                        />
                                    )}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </header>

                {/* 메인 컨텐츠 */}
                <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 relative overflow-hidden">
                    {/* Background decoration elements */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 180, 360],
                            }}
                            transition={{
                                duration: 20,
                                repeat: Number.POSITIVE_INFINITY,
                                ease: "linear",
                            }}
                            className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/5 to-purple-600/5 rounded-full blur-3xl"
                        />
                        <motion.div
                            animate={{
                                scale: [1.2, 1, 1.2],
                                rotate: [360, 180, 0],
                            }}
                            transition={{
                                duration: 25,
                                repeat: Number.POSITIVE_INFINITY,
                                ease: "linear",
                            }}
                            className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400/5 to-blue-600/5 rounded-full blur-3xl"
                        />
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === "alarm" && (
                            <motion.div
                                key="alarm"
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 50 }}
                                transition={{ duration: 0.3 }}
                                className="w-full max-w-md"
                            >
                                {/* 알람 탭 내용 - 기존 renderAlarmTab() 내용 */}
                                <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-md space-y-6">
                                    {/* Current Time Display - Material Design 3 */}
                                    <motion.div variants={itemVariants} className="text-center mb-8 w-full">
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[28px] p-6 md:p-8 border border-blue-100/50 shadow-lg shadow-blue-500/10 max-w-full overflow-hidden">
                                            <motion.div
                                                key={currentTimeDisplay.time}
                                                initial={{ scale: 0.95 }}
                                                animate={{ scale: 1 }}
                                                className="text-4xl md:text-5xl lg:text-6xl font-light text-gray-900 mb-3 tracking-tight font-mono"
                                                style={{ 
                                                    fontFeatureSettings: '"tnum"',
                                                    letterSpacing: '-0.01em',
                                                    lineHeight: '1.1'
                                                }}
                                            >
                                                <div className="break-all">{currentTimeDisplay.time}</div>
                                                <div className="text-xl md:text-2xl lg:text-3xl text-blue-600 font-sans mt-1">{currentTimeDisplay.period}</div>
                                            </motion.div>
                                            <div className="flex items-center justify-center gap-3 mt-4 flex-wrap">
                                                <div className="flex items-center gap-2">
                                                    <StatusIndicator 
                                                      status="online" 
                                                      size="sm" 
                                                      animate 
                                                    />
                                                    <span className="text-sm text-gray-600">활성</span>
                                                </div>
                                                <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                                                <span className="text-sm text-gray-500">실시간</span>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Alarms List */}
                                    <motion.div variants={itemVariants} className="space-y-4">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-gray-900 font-semibold text-lg">알람</h3>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setShowAddAlarm(true)}
                                                className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-600/25 hover:bg-blue-700 transition-colors"
                                            >
                                                <Plus className="h-5 w-5" />
                                            </motion.button>
                                        </div>

                                        <div className="space-y-3">
                                            {alarms.map((alarm) => (
                                                <motion.div
                                                    key={alarm.id}
                                                    whileHover={{ scale: 1.02 }}
                                                    className="bg-white rounded-[20px] p-5 border border-gray-100 shadow-md shadow-gray-900/5"
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <div className="text-2xl font-mono text-gray-900" style={{ fontFeatureSettings: '"tnum"' }}>
                                                                {alarm.time}
                                                            </div>
                                                            <div className="text-sm text-gray-600">{alarm.label}</div>
                                                            <div className="text-xs text-gray-400 mt-1">{alarm.days.join(", ")}</div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() => toggleAlarm(alarm.id)}
                                                                className={`w-12 h-6 rounded-full transition-all ${alarm.enabled ? "bg-green-500" : "bg-gray-300"}`}
                                                            >
                                                                <div
                                                                    className={`w-5 h-5 bg-white rounded-full transition-all shadow-md ${
                                                                        alarm.enabled ? "translate-x-6" : "translate-x-0.5"
                                                                    }`}
                                                                />
                                                            </motion.button>
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                onClick={() => deleteAlarm(alarm.id)}
                                                                className="text-red-500 hover:text-red-400 text-sm"
                                                            >
                                                                ✕
                                                            </motion.button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>

                                        {/* Add Alarm Form */}
                                        <AnimatePresence>
                                            {showAddAlarm && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: "auto" }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    className="bg-white rounded-2xl p-4 border border-gray-200 shadow-lg"
                                                >
                                                    <div className="space-y-4">
                                                        <div className="relative">
                                                            <input
                                                                type="time"
                                                                value={newAlarmTime}
                                                                onChange={(e) => setNewAlarmTime(e.target.value)}
                                                                className="w-full bg-gradient-to-br from-blue-50 to-indigo-50 text-gray-900 rounded-xl px-4 py-3 border border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none font-mono text-lg tracking-wider transition-all"
                                                                style={{ fontFeatureSettings: '"tnum"' }}
                                                            />
                                                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500">
                                                                <Clock className="h-5 w-5" />
                                                            </div>
                                                        </div>
                                                        <input
                                                            type="text"
                                                            placeholder="알람 레이블"
                                                            value={newAlarmLabel}
                                                            onChange={(e) => setNewAlarmLabel(e.target.value)}
                                                            className="w-full bg-gray-50 text-gray-900 rounded-lg px-3 py-2 border border-gray-200 placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                                                        />
                                                        <div className="flex gap-2">
                                                            <motion.button
                                                                whileHover={{ scale: 1.02 }}
                                                                whileTap={{ scale: 0.98 }}
                                                                onClick={addAlarm}
                                                                className="flex-1 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-medium shadow-lg"
                                                            >
                                                                추가
                                                            </motion.button>
                                                            <motion.button
                                                                whileHover={{ scale: 1.02 }}
                                                                whileTap={{ scale: 0.98 }}
                                                                onClick={() => setShowAddAlarm(false)}
                                                                className="flex-1 py-2 bg-gray-500 text-white rounded-lg font-medium shadow-lg"
                                                            >
                                                                취소
                                                            </motion.button>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                </motion.div>
                            </motion.div>
                        )}
                        
                        {activeTab === "stopwatch" && (
                            <motion.div
                                key="stopwatch"
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 50 }}
                                transition={{ duration: 0.3 }}
                                className="w-full min-h-full"
                            >
                                {/* 배경 그라데이션 확장 */}
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50/30 to-indigo-50/50 -z-10"></div>
                                
                                {/* 스톱워치 탭 내용 */}
                                <motion.div 
                                    variants={containerVariants} 
                                    initial="hidden" 
                                    animate="visible" 
                                    className="w-full max-w-md mx-auto space-y-8 pb-8"
                                >
                                    {/* Stopwatch Display */}
                                    <motion.div variants={itemVariants} className="bg-white rounded-3xl p-8 border border-gray-200 shadow-2xl">
                                        <div className="text-center mb-8">
                                            {/* 상태 표시 */}
                                            <div className="flex items-center justify-center gap-3 mb-4">
                                                <div className={`w-3 h-3 rounded-full ${
                                                    stopwatchState === "running" ? "bg-green-500 animate-pulse" :
                                                    stopwatchState === "paused" ? "bg-yellow-500" :
                                                    "bg-gray-400"
                                                }`}></div>
                                                <span className="text-sm font-medium text-gray-600">
                                                    {stopwatchState === "running" ? "측정 중" :
                                                     stopwatchState === "paused" ? "일시정지" :
                                                     "대기 중"}
                                                </span>
                                                {soundEnabled && (
                                                    <motion.button
                                                        whileHover={{ scale: 1.1 }}
                                                        whileTap={{ scale: 0.9 }}
                                                        onClick={() => setSoundEnabled(!soundEnabled)}
                                                        className="ml-auto text-gray-500 hover:text-blue-600"
                                                    >
                                                        🔊
                                                    </motion.button>
                                                )}
                                            </div>

                                            {/* 메인 시간 디스플레이 */}
                                            <motion.div
                                                key={`${stopwatchDisplay.minutes}:${stopwatchDisplay.seconds}:${stopwatchDisplay.milliseconds}`}
                                                initial={{ scale: 0.95 }}
                                                animate={{ scale: 1 }}
                                                className={`text-5xl sm:text-6xl font-mono mb-4 tracking-wider transition-colors ${
                                                    targetEnabled && stopwatchTime >= targetTime ? "text-green-600" : "text-gray-900"
                                                }`}
                                                style={{ fontFeatureSettings: '"tnum"' }}
                                            >
                                                                                                 {stopwatchDisplay.display}
                                            </motion.div>

                                            {/* 목표 시간 진행률 */}
                                            {targetEnabled && targetTime > 0 && (
                                                <div className="mb-4">
                                                    <div className="text-sm text-gray-600 mb-2">
                                                        목표: {Math.floor(targetTime / 60000)}:{String(Math.floor((targetTime % 60000) / 1000)).padStart(2, '0')}
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                                        <div 
                                                            className={`h-2 rounded-full transition-all duration-300 ${
                                                                stopwatchTime >= targetTime ? "bg-green-500" : "bg-blue-500"
                                                            }`}
                                                            style={{ width: `${Math.min(100, (stopwatchTime / targetTime) * 100)}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-1">
                                                        {Math.round((stopwatchTime / targetTime) * 100)}% 달성
                                                    </div>
                                                </div>
                                            )}

                                            {/* 인터벌 알림 */}
                                            {intervalEnabled && intervalTime > 0 && (
                                                <div className="text-sm text-gray-600 mb-4">
                                                    다음 인터벌: {Math.floor((intervalTime - (stopwatchTime % intervalTime)) / 1000)}초 후
                                                </div>
                                            )}
                                        </div>

                                        {/* Control Buttons - 모바일 최적화 */}
                                        <div className="space-y-4">
                                            {stopwatchState === "idle" && (
                                                <div className="flex justify-center">
                                                    <motion.button
                                                        whileHover={{ scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={startStopwatch}
                                                        className="flex items-center justify-center gap-3 w-full max-w-[200px] h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[16px] font-semibold shadow-lg shadow-emerald-500/25 transition-all"
                                                    >
                                                        <Play className="h-5 w-5" />
                                                        <span>시작</span>
                                                    </motion.button>
                                                </div>
                                            )}

                                            {stopwatchState === "running" && (
                                                <div className="space-y-3">
                                                    <div className="flex justify-center">
                                                        <motion.button
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={pauseStopwatch}
                                                            className="flex items-center justify-center gap-3 w-full max-w-[200px] h-14 bg-amber-500 hover:bg-amber-600 text-white rounded-[16px] font-semibold shadow-lg shadow-amber-500/25 transition-all"
                                                        >
                                                            <Pause className="h-5 w-5" />
                                                            <span>일시정지</span>
                                                        </motion.button>
                                                    </div>
                                                    <div className="flex justify-center">
                                                        <motion.button
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={addLap}
                                                            className="flex items-center justify-center gap-3 w-full max-w-[200px] h-12 bg-indigo-500 hover:bg-indigo-600 text-white rounded-[16px] font-medium shadow-md shadow-indigo-500/20 transition-all"
                                                        >
                                                            <Flag className="h-4 w-4" />
                                                            <span>랩 기록</span>
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            )}

                                            {stopwatchState === "paused" && (
                                                <div className="space-y-3">
                                                    <div className="flex gap-3">
                                                        <motion.button
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={startStopwatch}
                                                            className="flex items-center justify-center gap-2 flex-1 h-14 bg-emerald-500 hover:bg-emerald-600 text-white rounded-[16px] font-semibold shadow-lg shadow-emerald-500/25 transition-all"
                                                        >
                                                            <Play className="h-5 w-5" />
                                                            <span>재개</span>
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.02 }}
                                                            whileTap={{ scale: 0.98 }}
                                                            onClick={resetStopwatch}
                                                            className="flex items-center justify-center gap-2 flex-1 h-14 bg-rose-500 hover:bg-rose-600 text-white rounded-[16px] font-semibold shadow-lg shadow-rose-500/25 transition-all"
                                                        >
                                                            <RotateCcw className="h-5 w-5" />
                                                            <span>초기화</span>
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>

                                    {/* 스톱워치 설정 패널 */}
                                    <motion.div variants={itemVariants} className="bg-white rounded-3xl p-6 border border-gray-200 shadow-lg">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">고급 설정</h3>
                                        
                                        <div className="space-y-6">
                                            {/* 목표 시간 설정 */}
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <label className="text-sm font-medium text-gray-700">목표 시간</label>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => setTargetEnabled(!targetEnabled)}
                                                        className={`w-10 h-6 rounded-full transition-all ${targetEnabled ? "bg-blue-500" : "bg-gray-300"}`}
                                                    >
                                                        <div className={`w-4 h-4 bg-white rounded-full transition-all shadow-md ${
                                                            targetEnabled ? "translate-x-5" : "translate-x-0.5"
                                                        }`} />
                                                    </motion.button>
                                                </div>
                                                {targetEnabled && (
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="59"
                                                            value={Math.floor(targetTime / 60000)}
                                                            onChange={(e) => setTargetTime(parseInt(e.target.value || "0") * 60000 + (targetTime % 60000))}
                                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-center"
                                                            placeholder="분"
                                                        />
                                                        <span className="self-center text-gray-500">:</span>
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            max="59"
                                                            value={Math.floor((targetTime % 60000) / 1000)}
                                                            onChange={(e) => setTargetTime(Math.floor(targetTime / 60000) * 60000 + parseInt(e.target.value || "0") * 1000)}
                                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-center"
                                                            placeholder="초"
                                                        />
                                                    </div>
                                                )}
                                            </div>

                                            {/* 인터벌 알림 설정 */}
                                            <div>
                                                <div className="flex items-center justify-between mb-3">
                                                    <label className="text-sm font-medium text-gray-700">인터벌 알림</label>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => setIntervalEnabled(!intervalEnabled)}
                                                        className={`w-10 h-6 rounded-full transition-all ${intervalEnabled ? "bg-green-500" : "bg-gray-300"}`}
                                                    >
                                                        <div className={`w-4 h-4 bg-white rounded-full transition-all shadow-md ${
                                                            intervalEnabled ? "translate-x-5" : "translate-x-0.5"
                                                        }`} />
                                                    </motion.button>
                                                </div>
                                                {intervalEnabled && (
                                                    <div className="flex gap-2 flex-wrap">
                                                        {[30, 60, 120, 300].map((seconds) => (
                                                            <motion.button
                                                                key={seconds}
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => setIntervalTime(seconds * 1000)}
                                                                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                                                    intervalTime === seconds * 1000 
                                                                        ? "bg-green-500 text-white" 
                                                                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                                                }`}
                                                            >
                                                                {seconds < 60 ? `${seconds}초` : `${seconds / 60}분`}
                                                            </motion.button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* 빠른 액션 버튼들 */}
                                            <div className="flex gap-2 flex-wrap">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => {
                                                        setTargetTime(300000) // 5분
                                                        setTargetEnabled(true)
                                                    }}
                                                    className="px-3 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-all"
                                                >
                                                    🎯 5분 목표
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => {
                                                        setIntervalTime(60000) // 1분
                                                        setIntervalEnabled(true)
                                                    }}
                                                    className="px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium hover:bg-green-200 transition-all"
                                                >
                                                    ⏰ 1분 알림
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => {
                                                        setTargetEnabled(false)
                                                        setIntervalEnabled(false)
                                                    }}
                                                    className="px-3 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-all"
                                                >
                                                    🚫 모두 끄기
                                                </motion.button>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Lap Times - Enhanced */}
                                    {lapTimes.length > 0 && (
                                        <motion.div variants={itemVariants} className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-gray-900 font-semibold text-lg flex items-center gap-2">
                                                    <Flag className="h-5 w-5 text-blue-600" />
                                                    랩 타임 ({lapTimes.length})
                                                </h3>
                                                <div className="flex gap-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => {
                                                            setLapTimes([])
                                                            setLapCounter(0)
                                                        }}
                                                        className="text-xs bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1 rounded-full transition-colors"
                                                    >
                                                        🗑️ 전체 삭제
                                                    </motion.button>
                                                </div>
                                            </div>
                                            
                                            {/* 통계 정보 - 확장 */}
                                            {lapTimes.length > 1 && (
                                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                        <div>
                                                            <span className="text-gray-600 block">🏆 최고 기록</span>
                                                            <div className="font-mono text-green-600 font-semibold">
                                                                {lapStats && (() => {
                                                                    const fastestDisplay = formatStopwatchTime(lapStats.fastest)
                                                                    return `${fastestDisplay.minutes}:${fastestDisplay.seconds}.${fastestDisplay.milliseconds}`
                                                                })()}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600 block">🐌 최저 기록</span>
                                                            <div className="font-mono text-red-600 font-semibold">
                                                                {lapStats && (() => {
                                                                    const slowestDisplay = formatStopwatchTime(lapStats.slowest)
                                                                    return `${slowestDisplay.minutes}:${slowestDisplay.seconds}.${slowestDisplay.milliseconds}`
                                                                })()}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600 block">📊 평균 시간</span>
                                                            <div className="font-mono text-blue-600 font-semibold">
                                                                {lapStats && (() => {
                                                                    const avgTime = lapStats.splitTimes.reduce((a, b) => a + b, 0) / lapStats.splitTimes.length
                                                                    const avgDisplay = formatStopwatchTime(avgTime)
                                                                    return `${avgDisplay.minutes}:${avgDisplay.seconds}.${avgDisplay.milliseconds}`
                                                                })()}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600 block">🎯 일관성</span>
                                                            <div className="font-mono text-purple-600 font-semibold">
                                                                {lapStats && (() => {
                                                                    const variance = lapStats.splitTimes.reduce((sum, time) => {
                                                                        const avg = lapStats.splitTimes.reduce((a, b) => a + b, 0) / lapStats.splitTimes.length
                                                                        return sum + Math.pow(time - avg, 2)
                                                                    }, 0) / lapStats.splitTimes.length
                                                                    const consistency = Math.max(0, 100 - Math.sqrt(variance) / 1000)
                                                                    return `${Math.round(consistency)}%`
                                                                })()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="max-h-64 overflow-y-auto space-y-2">
                                                {lapTimes.slice().reverse().map((lap, index) => {
                                                    const originalIndex = lapTimes.length - 1 - index
                                                    const splitTime = lapStats?.splitTimes[originalIndex] || 0
                                                    const lapDisplay = formatStopwatchTime(splitTime)
                                                    const isLatest = index === 0
                                                    const isFastest = lapStats && splitTime === lapStats.fastest && lapTimes.length > 1
                                                    const isSlowest = lapStats && splitTime === lapStats.slowest && lapTimes.length > 1
                                                    
                                                    return (
                                                        <motion.div
                                                            key={lap.id}
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            className={`rounded-xl p-4 border shadow-sm transition-all ${
                                                                isLatest 
                                                                    ? "bg-blue-50 border-blue-200 ring-2 ring-blue-100" 
                                                                    : isFastest
                                                                    ? "bg-green-50 border-green-200"
                                                                    : isSlowest  
                                                                    ? "bg-red-50 border-red-200"
                                                                    : "bg-white border-gray-200"
                                                            }`}
                                                        >
                                                            <div className="flex justify-between items-center">
                                                                <div className="flex items-center gap-3">
                                                                    <span className={`text-sm font-medium ${
                                                                        isLatest ? "text-blue-700" : "text-gray-600"
                                                                    }`}>
                                                                        랩 {lap.lapNumber}
                                                                    </span>
                                                                    {isFastest && (
                                                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
                                                                            🏆 최고
                                                                        </span>
                                                                    )}
                                                                    {isSlowest && (
                                                                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-medium">
                                                                            🐌 최저
                                                                        </span>
                                                                    )}
                                                                </div>
                                                                <div className="text-right">
                                                                    <span className={`font-mono text-lg font-semibold ${
                                                                        isLatest ? "text-blue-900" : "text-gray-900"
                                                                    }`} style={{ fontFeatureSettings: '"tnum"' }}>
                                                                        {lapDisplay.minutes}:{lapDisplay.seconds}.{lapDisplay.milliseconds}
                                                                    </span>
                                                                    <div className="text-xs text-gray-500 font-mono mt-1">
                                                                        총 {(() => {
                                                                            const totalDisplay = formatStopwatchTime(lap.time)
                                                                            return `${totalDisplay.minutes}:${totalDisplay.seconds}.${totalDisplay.milliseconds}`
                                                                        })()}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )
                                                })}
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.div>
                            </motion.div>
                        )}
                        
                        {activeTab === "timer" && <TimerSection currentTime={currentTime} />}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    )
}