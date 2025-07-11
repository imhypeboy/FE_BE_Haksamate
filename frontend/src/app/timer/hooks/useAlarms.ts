import { useState, useEffect, useCallback, useRef } from 'react';
import { showToast } from '../../components/toast';
import type { AlarmItem } from '../types';

interface UseAlarmsProps {
  playAlarmSound: () => void;
}

export const useAlarms = ({ playAlarmSound }: UseAlarmsProps) => {
  const [alarms, setAlarms] = useState<AlarmItem[]>([
    {
      id: "1",
      time: "07:00",
      label: "Morning Alarm",
      enabled: true,
      days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    },
    {
      id: "2",
      time: "22:00",
      label: "Sleep Time",
      enabled: false,
      days: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    },
  ]);
  
  const [showAddAlarm, setShowAddAlarm] = useState(false);
  const [newAlarmTime, setNewAlarmTime] = useState("12:00");
  const [newAlarmLabel, setNewAlarmLabel] = useState("");
  
  // 알람 중복 실행 방지 (각 알람별로 관리)
  const lastAlarmCheckRef = useRef<Set<string>>(new Set());

  // 알람 체크 로직
  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      const currentTime = now.toTimeString().slice(0, 5); // HH:MM 형식
      const currentDay = now.toLocaleDateString('en-US', { weekday: 'short' });
      
      alarms.forEach(alarm => {
        if (alarm.enabled && alarm.time === currentTime) {
          // 요일 체크
          if (alarm.days.includes(currentDay)) {
            const alarmKey = `${alarm.id}-${currentTime}-${currentDay}`;
            
            // 중복 실행 방지 (각 알람별로)
            if (lastAlarmCheckRef.current.has(alarmKey)) return;
            lastAlarmCheckRef.current.add(alarmKey);
            
            // 1분 후 키 정리 (다음 번에 다시 울릴 수 있도록)
            setTimeout(() => {
              lastAlarmCheckRef.current.delete(alarmKey);
            }, 60000);
            
            // 멀티모달 알람 알림
            showToast({
              type: 'warning',
              title: `🔔 ${alarm.label}`,
              message: `${alarm.time} 알람이 울렸습니다!`
            });
            
            // 알람 소리 (더 길고 반복적인 소리)
            playAlarmSound();
            
            // 브라우저 알림
            if (Notification.permission === "granted") {
              new Notification(`🔔 ${alarm.label}`, {
                body: `${alarm.time} 알람이 울렸습니다!`,
                icon: "/favicon.ico",
                tag: `alarm-${alarm.id}`,
                requireInteraction: true
              });
            }
            
            // 모바일 진동
            if (navigator.vibrate) {
              navigator.vibrate([300, 200, 300, 200, 300, 200, 300]);
            }
          }
        }
      });
    };
    
    // 매분 0초에 알람 체크
    const now = new Date();
    const secondsUntilNextMinute = 60 - now.getSeconds();
    
    const timeout = setTimeout(() => {
      checkAlarms();
      const interval = setInterval(checkAlarms, 60000); // 매분마다 체크
      return () => clearInterval(interval);
    }, secondsUntilNextMinute * 1000);
    
    return () => clearTimeout(timeout);
  }, [alarms, playAlarmSound]);

  // 알람 토글
  const toggleAlarm = useCallback((id: string) => {
    setAlarms((prev) => 
      prev.map((alarm) => 
        alarm.id === id ? { ...alarm, enabled: !alarm.enabled } : alarm
      )
    );
  }, []);

  // 알람 추가
  const addAlarm = useCallback(() => {
    if (newAlarmTime && newAlarmLabel) {
      const newAlarm: AlarmItem = {
        id: Date.now().toString(),
        time: newAlarmTime,
        label: newAlarmLabel,
        enabled: true,
        days: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      };
      setAlarms((prev) => [...prev, newAlarm]);
      setNewAlarmTime("12:00");
      setNewAlarmLabel("");
      setShowAddAlarm(false);
    }
  }, [newAlarmTime, newAlarmLabel]);

  // 알람 삭제
  const deleteAlarm = useCallback((id: string) => {
    setAlarms((prev) => prev.filter((alarm) => alarm.id !== id));
  }, []);

  // 알람 수정
  const updateAlarm = useCallback((id: string, updates: Partial<AlarmItem>) => {
    setAlarms((prev) => 
      prev.map((alarm) => 
        alarm.id === id ? { ...alarm, ...updates } : alarm
      )
    );
  }, []);

  // 요일 토글
  const toggleAlarmDay = useCallback((id: string, day: string) => {
    setAlarms((prev) => 
      prev.map((alarm) => {
        if (alarm.id === id) {
          const newDays = alarm.days.includes(day)
            ? alarm.days.filter(d => d !== day)
            : [...alarm.days, day];
          return { ...alarm, days: newDays };
        }
        return alarm;
      })
    );
  }, []);

  // 모든 알람 켜기/끄기
  const toggleAllAlarms = useCallback((enabled: boolean) => {
    setAlarms((prev) => 
      prev.map((alarm) => ({ ...alarm, enabled }))
    );
  }, []);

  // 알람 정렬 (시간순)
  const sortAlarmsByTime = useCallback(() => {
    setAlarms((prev) => 
      [...prev].sort((a, b) => a.time.localeCompare(b.time))
    );
  }, []);

  return {
    // 상태
    alarms,
    showAddAlarm,
    newAlarmTime,
    newAlarmLabel,
    
    // 액션
    toggleAlarm,
    addAlarm,
    deleteAlarm,
    updateAlarm,
    toggleAlarmDay,
    toggleAllAlarms,
    sortAlarmsByTime,
    
    // UI 상태 관리
    setShowAddAlarm,
    setNewAlarmTime,
    setNewAlarmLabel,
    
    // 직접 setter (필요한 경우)
    setAlarms
  };
}; 