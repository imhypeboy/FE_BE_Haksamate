// 타이머용 시간 포맷팅 (HH:MM:SS)
export const formatTimerTime = (totalSeconds: number) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  
  return {
    hours: h.toString().padStart(2, "0"),
    minutes: m.toString().padStart(2, "0"),
    seconds: s.toString().padStart(2, "0"),
    display: `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  };
};

// 스톱워치용 시간 포맷팅 (MM:SS.MS)
export const formatStopwatchTime = (milliseconds: number) => {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const ms = Math.floor((milliseconds % 1000) / 10);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  
  return {
    minutes: minutes.toString().padStart(2, "0"),
    seconds: seconds.toString().padStart(2, "0"),
    milliseconds: ms.toString().padStart(2, "0"),
    display: `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${ms.toString().padStart(2, "0")}`
  };
};

// 현재 시간 포맷팅
export const formatCurrentTime = (date: Date) => {
  return {
    time: date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }),
    period: date.getHours() >= 12 ? "PM" : "AM",
    timezone: "Korean Standard Time",
  };
};

// 목표 시간을 분:초 형태로 포맷팅
export const formatTargetTime = (milliseconds: number) => {
  const minutes = Math.floor(milliseconds / 60000);
  const seconds = Math.floor((milliseconds % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

// 인터벌 시간을 사람이 읽기 쉬운 형태로 포맷팅
export const formatIntervalTime = (milliseconds: number) => {
  const seconds = milliseconds / 1000;
  if (seconds < 60) {
    return `${seconds}초`;
  }
  return `${seconds / 60}분`;
}; 