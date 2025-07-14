import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { StopwatchState, LapTime } from '../types';

interface UseStopwatchProps {
  playIntervalSound: () => void;
  playSuccessSound: () => void;
  onIntervalReached?: (intervalNumber: number) => void;
  onTargetReached?: () => void;
}

export const useStopwatch = ({ 
  playIntervalSound, 
  playSuccessSound,
  onIntervalReached,
  onTargetReached 
}: UseStopwatchProps) => {
  const [stopwatchTime, setStopwatchTime] = useState(0);
  const [stopwatchState, setStopwatchState] = useState<StopwatchState>("idle");
  const [lapTimes, setLapTimes] = useState<LapTime[]>([]);
  const [lapCounter, setLapCounter] = useState(0);
  
  // Enhanced stopwatch features
  const [targetTime, setTargetTime] = useState(0); // 목표 시간 (밀리초)
  const [targetEnabled, setTargetEnabled] = useState(false);
  const [intervalTime, setIntervalTime] = useState(60000); // 인터벌 시간 (밀리초)
  const [intervalEnabled, setIntervalEnabled] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Stopwatch logic - Enhanced with interval and target notifications
  useEffect(() => {
    if (stopwatchState === "running") {
      intervalRef.current = setInterval(() => {
        setStopwatchTime((prev) => {
          const newTime = prev + 10;
          
          // 인터벌 알림 체크
          if (intervalEnabled && intervalTime > 0) {
            const currentInterval = Math.floor(newTime / intervalTime);
            const lastInterval = Math.floor(prev / intervalTime);
            
            if (currentInterval > lastInterval && currentInterval > 0) {
              // 인터벌 도달 알림
              if (soundEnabled) {
                playIntervalSound();
              }
              
              // 콜백 호출
              if (onIntervalReached) {
                setTimeout(() => onIntervalReached(currentInterval), 0);
              }
              
              // 진동 (모바일)
              if (navigator.vibrate) {
                navigator.vibrate([100, 50, 100]);
              }
            }
          }
          
          // 목표 시간 달성 체크
          if (targetEnabled && targetTime > 0 && prev < targetTime && newTime >= targetTime) {
            // 목표 달성 알림
            if (soundEnabled) {
              playSuccessSound();
            }
            
            // 콜백 호출
            if (onTargetReached) {
              setTimeout(() => onTargetReached(), 0);
            }
            
            // 진동 (모바일)
            if (navigator.vibrate) {
              navigator.vibrate([200, 100, 200, 100, 200]);
            }
            
            // 브라우저 알림
            if (Notification.permission === 'granted') {
              new Notification('목표 달성!', {
                body: `목표 시간 ${Math.floor(targetTime / 60000)}:${String(Math.floor((targetTime % 60000) / 1000)).padStart(2, '0')}에 도달했습니다!`,
                icon: '/favicon.ico'
              });
            }
          }
          
          return newTime;
        });
      }, 10);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [stopwatchState, intervalEnabled, intervalTime, targetEnabled, targetTime, soundEnabled, playIntervalSound, playSuccessSound, onIntervalReached, onTargetReached]);

  // Stopwatch functions
  const startStopwatch = useCallback(() => {
    setStopwatchState("running");
  }, []);

  const pauseStopwatch = useCallback(() => {
    setStopwatchState("paused");
  }, []);

  const resetStopwatch = useCallback(() => {
    setStopwatchState("idle");
    setStopwatchTime(0);
    setLapTimes([]);
    setLapCounter(0);
  }, []);

  const addLap = useCallback(() => {
    if (stopwatchState === "running") {
      const newLap: LapTime = {
        id: Date.now().toString(),
        time: stopwatchTime, // 절대 시간 저장 (누적 시간)
        lapNumber: lapCounter + 1,
      };
      setLapTimes((prev) => [newLap, ...prev]);
      setLapCounter((prev) => prev + 1);
    }
  }, [stopwatchState, stopwatchTime, lapCounter]);

  // 랩 타임 통계 메모이제이션
  const lapStats = useMemo(() => {
    if (lapTimes.length === 0) return null;
    
    // 분할 시간 계산
    const splitTimes = lapTimes.map((lap, index) => {
      const prevTime = index < lapTimes.length - 1 ? lapTimes[index + 1].time : 0;
      return lap.time - prevTime;
    });
    
    return {
      fastest: Math.min(...splitTimes),
      slowest: Math.max(...splitTimes),
      splitTimes
    };
  }, [lapTimes]);

  // 목표 시간 설정 함수들
  const setTargetMinutes = useCallback((minutes: number) => {
    setTargetTime(minutes * 60000);
  }, []);

  const setIntervalMinutes = useCallback((minutes: number) => {
    setIntervalTime(minutes * 60000);
  }, []);

  // 설정 토글 함수들
  const toggleTargetEnabled = useCallback(() => {
    setTargetEnabled(prev => !prev);
  }, []);

  const toggleIntervalEnabled = useCallback(() => {
    setIntervalEnabled(prev => !prev);
  }, []);

  const toggleSoundEnabled = useCallback(() => {
    setSoundEnabled(prev => !prev);
  }, []);

  return {
    // 상태
    stopwatchTime,
    stopwatchState,
    lapTimes,
    lapCounter,
    targetTime,
    targetEnabled,
    intervalTime,
    intervalEnabled,
    soundEnabled,
    lapStats,
    
    // 액션
    startStopwatch,
    pauseStopwatch,
    resetStopwatch,
    addLap,
    
    // 설정
    setTargetMinutes,
    setIntervalMinutes,
    toggleTargetEnabled,
    toggleIntervalEnabled,
    toggleSoundEnabled,
    
    // 직접 setter (필요한 경우)
    setTargetTime,
    setIntervalTime,
    setTargetEnabled,
    setIntervalEnabled,
    setSoundEnabled,
    setLapTimes,
    setLapCounter
  };
}; 