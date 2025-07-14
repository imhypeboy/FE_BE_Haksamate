export const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(":").map(Number)
  return h * 60 + m
}

export const generateTimeOptions = (startHour = 8, slotCount = 21): string[] => {
  return Array.from({ length: slotCount }, (_, i) => {
    const hour = Math.floor(i / 2) + startHour
    const minute = i % 2 === 0 ? "00" : "30"
    return `${hour.toString().padStart(2, "0")}:${minute}`
  })
}

export const validateTimeRange = (startTime: string, endTime: string, maxTime?: string): string | null => {
  if (!startTime || !endTime) {
    return "시작 시간과 종료 시간을 모두 선택해주세요."
  }

  if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
    return "종료 시간이 시작 시간보다 늦어야 합니다."
  }

  if (maxTime && timeToMinutes(endTime) > timeToMinutes(maxTime)) {
    return `종료 시간은 ${maxTime}를 넘을 수 없습니다.`
  }

  return null
}

export const formatTimeRange = (startTime: string, endTime: string): string => {
  return `${startTime} ~ ${endTime}`
}

export const isTimeOverlap = (
  start1: string, 
  end1: string, 
  start2: string, 
  end2: string
): boolean => {
  const s1 = timeToMinutes(start1)
  const e1 = timeToMinutes(end1)
  const s2 = timeToMinutes(start2)
  const e2 = timeToMinutes(end2)
  
  return Math.max(s1, s2) < Math.min(e1, e2)
} 