import { useState, useEffect, useCallback, useRef } from 'react';
import type { TimerState, TimerConfig } from '../types';

interface UseTimerProps {
  playNotificationSound: () => void;
  onTimerComplete?: () => void;
}

export const useTimer = ({ playNotificationSound, onTimerComplete }: UseTimerProps) => {
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(5);
  const [seconds, setSeconds] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [timerState, setTimerState] = useState<TimerState>("idle");
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const timerCompletedRef = useRef(false);

  const totalSeconds = hours * 3600 + minutes * 60 + seconds;

  // 타이머 카운트다운 로직
  useEffect(() => {
    if (timerState === "running" && timeLeft > 0) {
      timerIntervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setTimerState("idle");
            
            // 알림 소리
            playNotificationSound();
            
            // 완료 콜백 호출 (StrictMode 중복 방지)
            if (!timerCompletedRef.current) {
              timerCompletedRef.current = true;
              if (onTimerComplete) setTimeout(() => onTimerComplete(), 0);
            }
            
            // 브라우저 알림
            if (Notification.permission === "granted") {
              new Notification("⏰ 타이머 완료!", {
                body: "설정한 시간이 끝났습니다.",
                icon: "/favicon.ico",
                tag: "timer-finished",
                requireInteraction: true
              });
            } else if (Notification.permission === "default") {
              // 권한 요청
              Notification.requestPermission().then(permission => {
                if (permission === "granted") {
                  new Notification("⏰ 타이머 완료!", {
                    body: "설정한 시간이 끝났습니다.",
                    icon: "/favicon.ico",
                    tag: "timer-finished",
                    requireInteraction: true
                  });
                }
              });
            }
            
            // 모바일 진동
            if (navigator.vibrate) {
              navigator.vibrate([200, 100, 200, 100, 200]);
            }
            
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
        timerIntervalRef.current = null;
      }
    };
  }, [timerState, timeLeft, playNotificationSound, onTimerComplete]);

  // 타이머 시작
  const startTimer = useCallback(() => {
    if (timerState === "idle") {
      if (totalSeconds > 0) {
        setTimeLeft(totalSeconds);
        setTimerState("running");
      }
    } else if (timerState === "paused") {
      setTimerState("running");
    }
  }, [totalSeconds, timerState]);

  // 타이머 일시정지
  const pauseTimer = useCallback(() => {
    setTimerState("paused");
  }, []);

  // 타이머 초기화
  const resetTimer = useCallback(() => {
    setTimerState("idle");
    setTimeLeft(0);
    setHours(0);
    setMinutes(5);
    setSeconds(0);
    timerCompletedRef.current = false;
  }, []);

  // 시간 조정
  const adjustTime = useCallback((type: "hours" | "minutes" | "seconds", increment: boolean) => {
    if (timerState !== "idle") return;

    const setValue = type === "hours" ? setHours : type === "minutes" ? setMinutes : setSeconds;
    const maxValue = type === "hours" ? 23 : 59;

    setValue((prev) => {
      if (increment) {
        return prev >= maxValue ? 0 : prev + 1;
      } else {
        return prev <= 0 ? maxValue : prev - 1;
      }
    });
  }, [timerState]);

  // 빠른 설정 프리셋
  const setPresetTime = useCallback((presetMinutes: number) => {
    if (timerState !== "idle") return;
    
    setHours(Math.floor(presetMinutes / 60));
    setMinutes(presetMinutes % 60);
    setSeconds(0);
  }, [timerState]);

  // 진행률 계산
  const progress = totalSeconds > 0 && timeLeft > 0 ? (timeLeft / totalSeconds) * 100 : 100;

  // 표시할 시간 계산
  const displayTime = timeLeft > 0 ? timeLeft : totalSeconds;

  return {
    // 상태
    hours,
    minutes,
    seconds,
    timeLeft,
    timerState,
    totalSeconds,
    displayTime,
    progress,
    
    // 액션
    startTimer,
    pauseTimer,
    resetTimer,
    adjustTime,
    setPresetTime,
    
    // 개별 setter (필요한 경우)
    setHours,
    setMinutes,
    setSeconds
  };
}; 