"use client"

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Play, Pause, RotateCcw, Plus, Minus, Clock, TimerIcon, AlarmClockIcon as Alarm, Activity } from "lucide-react"
import { useTimer } from "../timer/hooks/useTimer"
import { useStopwatch } from "../timer/hooks/useStopwatch"
import { useAlarms } from "../timer/hooks/useAlarms"
import { useAudio } from "../timer/hooks/useAudio"
import { formatTimerTime, formatCurrentTime, formatStopwatchTime } from "../timer/utils/timeFormatters"
import { showToast } from "./toast"

interface TimerModalProps {
  isOpen: boolean
  onClose: () => void
}

type ActiveTab = "timer" | "stopwatch" | "alarm"

export function TimerModal({ isOpen, onClose }: TimerModalProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>("timer")
  const [currentTime, setCurrentTime] = useState(new Date())

  // 오디오 훅
  const { playNotificationSound, playAlarmSound, playIntervalSound, playSuccessSound } = useAudio()

  // 타이머 완료 콜백
  const handleTimerComplete = () => {
    showToast({
      type: 'success',
      title: '⏰ 타이머 완료!',
      message: '설정한 시간이 끝났습니다.'
    });
  };

  // 스톱워치 콜백들
  const handleIntervalReached = (intervalNumber: number) => {
    showToast({ 
      type: 'info', 
      title: '인터벌 알림', 
      message: `인터벌 ${intervalNumber} 도달! ⏰` 
    });
  };

  const handleTargetReached = () => {
    showToast({ 
      type: 'success', 
      title: '목표 달성!', 
      message: '🎯 목표 시간에 도달했습니다! 축하합니다!' 
    });
  };

  // 타이머 훅
  const {
    hours, minutes, seconds, timeLeft, timerState, totalSeconds, displayTime, progress,
    startTimer, pauseTimer, resetTimer, adjustTime, setPresetTime,
    setHours, setMinutes, setSeconds
  } = useTimer({ 
    playNotificationSound,
    onTimerComplete: handleTimerComplete 
  })

  // 스톱워치 훅
  const {
    stopwatchTime, stopwatchState, lapTimes, lapCounter, targetTime, targetEnabled,
    intervalTime, intervalEnabled, soundEnabled, lapStats,
    startStopwatch, pauseStopwatch, resetStopwatch, addLap,
    setTargetMinutes, setIntervalMinutes, toggleTargetEnabled, toggleIntervalEnabled, toggleSoundEnabled
  } = useStopwatch({ 
    playIntervalSound, 
    playSuccessSound,
    onIntervalReached: handleIntervalReached,
    onTargetReached: handleTargetReached
  })

  // 알람 훅
  const {
    alarms, showAddAlarm, newAlarmTime, newAlarmLabel,
    toggleAlarm, addAlarm, deleteAlarm, updateAlarm, toggleAlarmDay,
    toggleAllAlarms, sortAlarmsByTime,
    setShowAddAlarm, setNewAlarmTime, setNewAlarmLabel
  } = useAlarms({ playAlarmSound })

  // 현재 시간 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // 메모이제이션으로 성능 최적화
  const currentTimeDisplay = useMemo(() => formatCurrentTime(currentTime), [currentTime])
  const timerDisplay = useMemo(() => formatTimerTime(displayTime), [displayTime])
  const stopwatchDisplay = useMemo(() => formatStopwatchTime(stopwatchTime), [stopwatchTime])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ type: "spring", duration: 0.4 }}
          className="bg-white rounded-2xl shadow-2xl max-w-xl w-full max-h-[85vh] overflow-hidden border border-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-500 text-white p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center">
                  {activeTab === "alarm" && <Alarm className="h-5 w-5 text-white" />}
                  {activeTab === "stopwatch" && <Clock className="h-5 w-5 text-white" />}
                  {activeTab === "timer" && <TimerIcon className="h-5 w-5 text-white" />}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {activeTab === "alarm" && "알람"}
                    {activeTab === "stopwatch" && "스톱워치"}
                    {activeTab === "timer" && "타이머"}
                  </h2>
                  <p className="text-white/70 text-sm">시간 관리 도구</p>
                </div>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-colors"
              >
                <X className="h-4 w-4 text-white" />
              </motion.button>
            </div>

            {/* 탭 선택 */}
            <div className="flex justify-center">
              <div className="inline-flex bg-white/10 backdrop-blur-sm rounded-xl p-1">
                {[
                  { icon: TimerIcon, label: "타이머", tab: "timer" as ActiveTab },
                  { icon: Clock, label: "스톱워치", tab: "stopwatch" as ActiveTab },
                  { icon: Alarm, label: "알람", tab: "alarm" as ActiveTab },
                ].map(({ icon: Icon, label, tab }) => (
                  <motion.button
                    key={tab}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab)}
                    className={`relative flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
                      activeTab === tab 
                        ? "bg-white text-gray-900 shadow-sm" 
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{label}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>

          {/* 콘텐츠 */}
          <div className="p-6 max-h-[55vh] overflow-y-auto">
            <AnimatePresence mode="wait">
              {activeTab === "timer" && (
                <motion.div
                  key="timer"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* 현재 시간 */}
                  <div className="text-center">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="text-lg font-mono text-gray-800 tracking-tight flex items-center justify-center gap-2">
                        <Clock className="h-4 w-4 text-gray-500" />
                        {currentTimeDisplay.time}
                        <span className="text-sm text-gray-500">{currentTimeDisplay.period}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">현재 시간</p>
                    </div>
                  </div>

                  {/* 타이머 메인 디스플레이 */}
                  <div className="text-center space-y-4">
                    <div className="text-5xl font-mono text-gray-900 tracking-wider">
                      {timerDisplay.display}
                    </div>
                    
                    {/* 프로그레스 바 */}
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full bg-emerald-500 rounded-full"
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    
                    <p className="text-sm text-gray-500">
                      {timerState === "idle" && "타이머를 설정해주세요"}
                      {timerState === "running" && "타이머가 실행 중입니다"}
                      {timerState === "paused" && "타이머가 일시정지되었습니다"}
                    </p>
                  </div>

                  {/* 빠른 설정 */}
                  {timerState === "idle" && (
                    <div>
                      <p className="text-gray-600 text-sm font-medium mb-3 text-center">빠른 설정</p>
                      <div className="grid grid-cols-4 gap-3">
                        {[
                          { label: "5분", minutes: 5 },
                          { label: "10분", minutes: 10 },
                          { label: "15분", minutes: 15 },
                          { label: "25분", minutes: 25 }
                        ].map(({ label, minutes: presetMinutes }) => (
                          <motion.button
                            key={label}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setPresetTime(presetMinutes)}
                            className="bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl px-3 py-3 text-sm font-medium text-gray-700 transition-colors"
                          >
                            {label}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 시간 조정 */}
                  {timerState === "idle" && (
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { label: "시간", value: hours, type: "hours" as const },
                        { label: "분", value: minutes, type: "minutes" as const },
                        { label: "초", value: seconds, type: "seconds" as const },
                      ].map(({ label, value, type }) => (
                        <div key={type} className="text-center">
                          <p className="text-gray-500 text-sm font-medium mb-3">{label}</p>
                          <div className="flex flex-col items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => adjustTime(type, true)}
                              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </motion.button>
                            <div className="text-2xl font-mono text-gray-900 w-12 text-center bg-gray-50 rounded-lg py-2">
                              {value.toString().padStart(2, '0')}
                            </div>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => adjustTime(type, false)}
                              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </motion.button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 타이머 컨트롤 */}
                  <div className="flex justify-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={timerState === "running" ? pauseTimer : startTimer}
                      disabled={timerState === "idle" && totalSeconds === 0}
                      className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl shadow-lg flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {timerState === "running" ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={resetTimer}
                      className="w-14 h-14 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl shadow-sm flex items-center justify-center transition-colors"
                    >
                      <RotateCcw className="h-6 w-6" />
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {activeTab === "stopwatch" && (
                <motion.div
                  key="stopwatch"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* 스톱워치 메인 디스플레이 */}
                  <div className="text-center space-y-4">
                    <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                      <div className="text-5xl font-mono text-gray-900 tracking-wider mb-3">
                        {stopwatchDisplay.display}
                      </div>
                      <p className="text-gray-500 text-sm flex items-center justify-center gap-2">
                        <Activity className="h-4 w-4" />
                        {stopwatchState === "idle" && "준비"}
                        {stopwatchState === "running" && "실행 중"}
                        {stopwatchState === "paused" && "일시정지"}
                      </p>
                    </div>
                  </div>

                  {/* 스톱워치 컨트롤 */}
                  <div className="flex justify-center gap-3">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={stopwatchState === "running" ? pauseStopwatch : startStopwatch}
                      className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl shadow-lg flex items-center justify-center transition-colors"
                    >
                      {stopwatchState === "running" ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
                    </motion.button>
                    
                    {(stopwatchState === "running" || stopwatchState === "paused") && (
                      <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={addLap}
                        className="w-14 h-14 bg-gray-600 hover:bg-gray-700 text-white rounded-xl shadow-sm flex items-center justify-center transition-colors"
                      >
                        <span className="text-xs font-semibold">LAP</span>
                      </motion.button>
                    )}
                    
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={resetStopwatch}
                      className="w-14 h-14 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl shadow-sm flex items-center justify-center transition-colors"
                    >
                      <RotateCcw className="h-6 w-6" />
                    </motion.button>
                  </div>

                  {/* 랩 기록 */}
                  {lapTimes.length > 0 && (
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-center gap-2 mb-3">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">랩 기록</span>
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">{lapTimes.length}</span>
                      </div>
                      <div className="max-h-32 overflow-y-auto space-y-2">
                        {lapTimes.slice().reverse().map((lap, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center text-sm bg-white rounded-lg px-3 py-2 border border-gray-100"
                          >
                            <span className="font-medium text-gray-600">#{lapTimes.length - index}</span>
                            <span className="font-mono text-gray-900">{formatStopwatchTime(lap.time).display}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === "alarm" && (
                <motion.div
                  key="alarm"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.2 }}
                  className="text-center space-y-6"
                >
                  <div className="bg-gray-50 rounded-2xl p-12 border border-gray-100">
                    <div className="text-5xl mb-4">⏰</div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">알람 기능</h3>
                    <p className="text-gray-500">곧 업데이트될 예정입니다</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
} 