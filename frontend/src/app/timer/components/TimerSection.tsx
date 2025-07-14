"use client"

import { motion } from "framer-motion"
import { Play, Pause, RotateCcw, Plus, Minus } from "lucide-react"
import { formatTimerTime, formatCurrentTime } from "../utils/timeFormatters"
import { useTimer } from "../hooks/useTimer"
import { useAudio } from "../hooks/useAudio"
import { useMemo } from "react"

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

interface TimerSectionProps {
    currentTime: Date;
}

export default function TimerSection({ currentTime }: TimerSectionProps) {
    // 오디오 훅 사용
    const { playNotificationSound } = useAudio()

    // 타이머 훅 사용
    const {
        hours, minutes, seconds, timeLeft, timerState, totalSeconds, displayTime, progress,
        startTimer, pauseTimer, resetTimer, adjustTime, setPresetTime,
        setHours, setMinutes, setSeconds
    } = useTimer({ playNotificationSound })

    // 메모이제이션으로 성능 최적화
    const currentTimeDisplay = useMemo(() => formatCurrentTime(currentTime), [currentTime])
    const timerDisplay = useMemo(() => formatTimerTime(displayTime), [displayTime])

    return (
        <motion.div
            key="timer"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md"
        >
            {/* 타이머 탭 내용 */}
            <motion.div variants={containerVariants} initial="hidden" animate="visible" className="w-full max-w-md space-y-8">
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
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-sm font-medium text-gray-700">{currentTimeDisplay.timezone}</span>
                            </div>
                            <div className="w-1 h-1 bg-gray-300 rounded-full"></div>
                            <span className="text-sm text-gray-500">실시간</span>
                        </div>
                    </div>
                </motion.div>

                {/* Timer Display */}
                <motion.div variants={itemVariants} className="bg-white rounded-3xl p-8 border border-gray-200 shadow-2xl">
                    <div className="text-center mb-8">
                        <motion.div
                            key={`${timerDisplay.hours}:${timerDisplay.minutes}:${timerDisplay.seconds}`}
                            initial={{ scale: 0.95 }}
                            animate={{ scale: 1 }}
                            className="text-4xl sm:text-5xl font-mono text-gray-900 mb-4 tracking-wider"
                            style={{ fontFeatureSettings: '"tnum"' }}
                        >
                            {timerDisplay.display}
                        </motion.div>

                        {/* Progress Bar */}
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                            <motion.div
                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                                initial={{ width: "100%" }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    </div>

                    {/* Quick Preset Buttons */}
                    {timerState === "idle" && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6"
                        >
                            <p className="text-gray-500 text-sm font-medium mb-3 text-center">빠른 설정</p>
                            <div className="grid grid-cols-4 gap-2 mb-6">
                                {[
                                    { label: "5분", minutes: 5 },
                                    { label: "10분", minutes: 10 },
                                    { label: "15분", minutes: 15 },
                                    { label: "25분", minutes: 25 },
                                    { label: "30분", minutes: 30 },
                                    { label: "45분", minutes: 45 },
                                    { label: "1시간", minutes: 60 },
                                    { label: "2시간", minutes: 120 }
                                ].map(({ label, minutes: presetMinutes }) => (
                                    <motion.button
                                        key={label}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setPresetTime(presetMinutes)}
                                        className="bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 transition-all shadow-sm hover:shadow-md"
                                    >
                                        {label}
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Time Adjustment Controls - 개선된 접근성 */}
                    {timerState === "idle" && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="grid grid-cols-3 gap-6 mb-8"
                        >
                            {[
                                { label: "시간", value: hours, type: "hours" as const },
                                { label: "분", value: minutes, type: "minutes" as const },
                                { label: "초", value: seconds, type: "seconds" as const },
                            ].map(({ label, value, type }) => (
                                <div key={type} className="text-center">
                                    <p className="text-gray-500 text-sm font-medium mb-3">{label}</p>
                                    <div className="flex flex-col items-center gap-3">
                                        <motion.button
                                            whileHover={{ scale: 1.05, backgroundColor: "#f3f4f6" }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => adjustTime(type, true)}
                                            className="w-12 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md flex items-center justify-center text-gray-700 transition-all"
                                            aria-label={`${label} 증가`}
                                        >
                                            <Plus className="h-5 w-5" />
                                        </motion.button>
                                        <div className="bg-gray-50 rounded-xl px-4 py-2 min-w-[60px] relative">
                                            <input
                                                type="number"
                                                min="0"
                                                max={type === "hours" ? 23 : 59}
                                                value={value}
                                                onChange={(e) => {
                                                    const newValue = parseInt(e.target.value) || 0
                                                    const maxValue = type === "hours" ? 23 : 59
                                                    const clampedValue = Math.min(Math.max(0, newValue), maxValue)
                                                    
                                                    if (type === "hours") setHours(clampedValue)
                                                    else if (type === "minutes") setMinutes(clampedValue)
                                                    else setSeconds(clampedValue)
                                                }}
                                                className="w-full text-3xl font-mono text-gray-900 text-center bg-transparent border-none outline-none appearance-none"
                                                style={{ 
                                                    fontFeatureSettings: '"tnum"',
                                                    MozAppearance: 'textfield' // Firefox에서 스피너 제거
                                                }}
                                            />
                                            {/* 웹킷 브라우저에서 스피너 제거 */}
                                            <style jsx>{`
                                                input::-webkit-outer-spin-button,
                                                input::-webkit-inner-spin-button {
                                                    -webkit-appearance: none;
                                                    margin: 0;
                                                }
                                            `}</style>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.05, backgroundColor: "#f3f4f6" }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => adjustTime(type, false)}
                                            className="w-12 h-12 rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-md flex items-center justify-center text-gray-700 transition-all"
                                            aria-label={`${label} 감소`}
                                        >
                                            <Minus className="h-5 w-5" />
                                        </motion.button>
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )}

                    {/* Control Buttons - 모바일 최적화 */}
                    <div className="space-y-4">
                        {timerState === "idle" && (
                            <div className="flex justify-center">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={startTimer}
                                    disabled={hours === 0 && minutes === 0 && seconds === 0}
                                    className="flex items-center justify-center gap-3 w-full max-w-[200px] h-14 bg-violet-500 hover:bg-violet-600 disabled:bg-gray-400 disabled:hover:bg-gray-400 text-white rounded-[16px] font-semibold shadow-lg shadow-violet-500/25 disabled:shadow-gray-400/25 transition-all disabled:cursor-not-allowed"
                                >
                                    <Play className="h-5 w-5" />
                                    <span>시작</span>
                                </motion.button>
                            </div>
                        )}

                        {timerState === "running" && (
                            <div className="flex justify-center">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={pauseTimer}
                                    className="flex items-center justify-center gap-3 w-full max-w-[200px] h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-[16px] font-semibold shadow-lg shadow-orange-500/25 transition-all"
                                >
                                    <Pause className="h-5 w-5" />
                                    <span>일시정지</span>
                                </motion.button>
                            </div>
                        )}

                        {timerState === "paused" && (
                            <div className="space-y-3">
                                <div className="flex gap-3">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={startTimer}
                                        className="flex items-center justify-center gap-2 flex-1 h-14 bg-violet-500 hover:bg-violet-600 text-white rounded-[16px] font-semibold shadow-lg shadow-violet-500/25 transition-all"
                                    >
                                        <Play className="h-5 w-5" />
                                        <span>재개</span>
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={resetTimer}
                                        className="flex items-center justify-center gap-2 flex-1 h-14 bg-slate-500 hover:bg-slate-600 text-white rounded-[16px] font-semibold shadow-lg shadow-slate-500/25 transition-all"
                                    >
                                        <RotateCcw className="h-5 w-5" />
                                        <span>초기화</span>
                                    </motion.button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </motion.div>
        </motion.div>
    )
} 