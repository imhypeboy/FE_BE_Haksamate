export interface AcademicEventRaw {
  id: number
  title: string
  description: string
  startDate: string
  endDate?: string
  category: "성적" | "수강신청" | "시험" | "축제" | "공휴일" | "등록" | "실습" | "개강" | "졸업" | "기타"
  priority: "높음" | "보통" | "낮음"
  icon: string
}

export const ACADEMIC_EVENTS_RAW: readonly AcademicEventRaw[] = [
  // 2025년 7월
  {
    id: 1,
    title: "계절학기 성적입력",
    description: "하계 계절학기 성적 입력 기간입니다.",
    startDate: "2025-07-10",
    endDate: "2025-07-15",
    category: "성적",
    priority: "보통",
    icon: "📝"
  },
  {
    id: 2,
    title: "계절학기 성적확인",
    description: "하계 계절학기 성적을 확인할 수 있습니다.",
    startDate: "2025-07-16",
    category: "성적",
    priority: "보통",
    icon: "📊"
  },
  {
    id: 3,
    title: "졸업사정회",
    description: "졸업 요건 심사가 진행됩니다.",
    startDate: "2025-07-28",
    category: "졸업",
    priority: "높음",
    icon: "🎓"
  },
  {
    id: 4,
    title: "예비수강신청",
    description: "다음 학기 예비 수강신청 기간입니다.",
    startDate: "2025-07-28",
    endDate: "2025-07-30",
    category: "수강신청",
    priority: "높음",
    icon: "📚"
  },
  // 2025년 3월
  {
    id: 5,
    title: "삼일절",
    description: "3·1절 국경일입니다.",
    startDate: "2025-03-01",
    category: "공휴일",
    priority: "낮음",
    icon: "🇰🇷"
  },
  {
    id: 6,
    title: "개강 / 입학식",
    description: "2025학년도 1학기 개강 및 입학식이 있습니다.",
    startDate: "2025-03-04",
    category: "개강",
    priority: "높음",
    icon: "🏫"
  },
  {
    id: 7,
    title: "수강과목 중도포기",
    description: "수강 과목 중도포기 신청 기간입니다. (4주차)",
    startDate: "2025-03-25",
    endDate: "2025-03-27",
    category: "수강신청",
    priority: "보통",
    icon: "❌"
  },
  // 2025년 4월
  {
    id: 8,
    title: "중간강의평가",
    description: "중간 강의평가 기간입니다. (7주차)",
    startDate: "2025-04-14",
    endDate: "2025-05-02",
    category: "기타",
    priority: "보통",
    icon: "⭐"
  },
  {
    id: 9,
    title: "교직원 영성축제",
    description: "교직원 영성축제가 개최됩니다.",
    startDate: "2025-04-21",
    endDate: "2025-04-25",
    category: "축제",
    priority: "낮음",
    icon: "🎉"
  },
  {
    id: 10,
    title: "중간고사",
    description: "1학기 중간고사 기간입니다. (8주차)",
    startDate: "2025-04-22",
    endDate: "2025-04-28",
    category: "시험",
    priority: "높음",
    icon: "📝"
  },
  // 2025년 5월
  {
    id: 11,
    title: "근로자의 날",
    description: "근로자의 날 공휴일입니다.",
    startDate: "2025-05-01",
    category: "공휴일",
    priority: "낮음",
    icon: "👷"
  },
  {
    id: 12,
    title: "학교현장 교육실습",
    description: "교육실습생 학교현장 실습 기간입니다.",
    startDate: "2025-05-07",
    endDate: "2025-05-30",
    category: "실습",
    priority: "높음",
    icon: "🏫"
  },
  {
    id: 13,
    title: "사랑나눔축제",
    description: "대학 사랑나눔축제가 개최됩니다.",
    startDate: "2025-05-12",
    endDate: "2025-05-16",
    category: "축제",
    priority: "보통",
    icon: "❤️"
  },
  {
    id: 14,
    title: "계절학기 수강신청",
    description: "하계 계절학기 수강신청 기간입니다.",
    startDate: "2025-05-26",
    endDate: "2025-05-28",
    category: "수강신청",
    priority: "보통",
    icon: "📚"
  },
  // 2025년 6월
  {
    id: 15,
    title: "현충일",
    description: "현충일 국경일입니다.",
    startDate: "2025-06-06",
    category: "공휴일",
    priority: "낮음",
    icon: "🇰🇷"
  },
  {
    id: 16,
    title: "기말고사",
    description: "1학기 기말고사 기간입니다. (15주차)",
    startDate: "2025-06-10",
    endDate: "2025-06-16",
    category: "시험",
    priority: "높음",
    icon: "📝"
  },
  {
    id: 17,
    title: "성적입력기간",
    description: "교수님들의 성적 입력 기간입니다.",
    startDate: "2025-06-10",
    endDate: "2025-06-23",
    category: "성적",
    priority: "보통",
    icon: "📊"
  },
  {
    id: 18,
    title: "하계계절학기",
    description: "여름 계절학기가 진행됩니다.",
    startDate: "2025-06-23",
    endDate: "2025-07-11",
    category: "개강",
    priority: "보통",
    icon: "☀️"
  },
  // 2025년 8월
  {
    id: 19,
    title: "본수강신청",
    description: "2학기 본 수강신청 기간입니다.",
    startDate: "2025-08-04",
    endDate: "2025-08-06",
    category: "수강신청",
    priority: "높음",
    icon: "📚"
  },
  {
    id: 20,
    title: "후기 학위수여식",
    description: "후기 졸업식이 진행됩니다.",
    startDate: "2025-08-14",
    category: "졸업",
    priority: "높음",
    icon: "🎓"
  },
  {
    id: 21,
    title: "재학생 등록기간",
    description: "재학생 등록 기간입니다.",
    startDate: "2025-08-18",
    endDate: "2025-08-22",
    category: "등록",
    priority: "높음",
    icon: "📋"
  },
  // 2025년 9월
  {
    id: 22,
    title: "2학기 개강",
    description: "2025학년도 2학기가 시작됩니다.",
    startDate: "2025-09-01",
    category: "개강",
    priority: "높음",
    icon: "🏫"
  },
  {
    id: 23,
    title: "수강신청 확인 및 정정",
    description: "수강신청 확인 및 정정 기간입니다. (1주차)",
    startDate: "2025-09-01",
    endDate: "2025-09-05",
    category: "수강신청",
    priority: "높음",
    icon: "✏️"
  },
  {
    id: 24,
    title: "천보축전",
    description: "대학 천보축전이 개최됩니다.",
    startDate: "2025-09-29",
    category: "축제",
    priority: "보통",
    icon: "🎊"
  },
  {
    id: 25,
    title: "체육대회",
    description: "전교 체육대회가 열립니다.",
    startDate: "2025-09-30",
    category: "축제",
    priority: "보통",
    icon: "🏃"
  }
] as const 