import { useCallback, useRef, useEffect } from 'react';

export const useAudio = () => {
  const audioContextRef = useRef<AudioContext | null>(null);

  // 오디오 컨텍스트 초기화
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current && typeof window !== 'undefined') {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // 기본 알림 소리
  const playNotificationSound = useCallback(() => {
    try {
      const audioContext = getAudioContext();
      if (!audioContext) return;

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1);
    } catch (error) {
      console.log('오디오 재생 실패:', error);
    }
  }, [getAudioContext]);

  // 알람 소리 (3번 반복)
  const playAlarmSound = useCallback(() => {
    try {
      const audioContext = getAudioContext();
      if (!audioContext) return;
      
      for (let i = 0; i < 3; i++) {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + i * 1.5);
        gainNode.gain.setValueAtTime(0.4, audioContext.currentTime + i * 1.5);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + i * 1.5 + 0.8);
        
        oscillator.start(audioContext.currentTime + i * 1.5);
        oscillator.stop(audioContext.currentTime + i * 1.5 + 0.8);
      }
    } catch (error) {
      console.log('알람 오디오 재생 실패:', error);
    }
  }, [getAudioContext]);

  // 인터벌 알림 소리
  const playIntervalSound = useCallback(() => {
    try {
      const audioContext = getAudioContext();
      if (!audioContext) return;

      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log('인터벌 사운드 재생 실패:', error);
    }
  }, [getAudioContext]);

  // 목표 달성 소리 (상승하는 멜로디)
  const playSuccessSound = useCallback(() => {
    try {
      const audioContext = getAudioContext();
      if (!audioContext) return;

      [523, 659, 784, 1047].forEach((freq, index) => {
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + index * 0.15);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime + index * 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + index * 0.15 + 0.2);
        
        oscillator.start(audioContext.currentTime + index * 0.15);
        oscillator.stop(audioContext.currentTime + index * 0.15 + 0.2);
      });
    } catch (error) {
      console.log('목표 달성 사운드 재생 실패:', error);
    }
  }, [getAudioContext]);

  // 컴포넌트 언마운트 시 오디오 컨텍스트 정리
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
    };
  }, []);

  return {
    playNotificationSound,
    playAlarmSound,
    playIntervalSound,
    playSuccessSound
  };
}; 