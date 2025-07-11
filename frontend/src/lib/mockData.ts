/**
 * 중앙 집중식 목업 데이터 관리 시스템
 * 개발 환경에서 백엔드 API를 시뮬레이션하는 역할
 */

// ===============================
// 타입 정의
// ===============================

export interface MockUser {
    id: string
    name: string
    email: string
    department: string
    year: number
    studentNumber: string
    rating?: number
  }
  
  export interface MockAttendance {
    id: string
    date: string
    status: 'present' | 'late' | 'absent'
    subject: string
    time: string
    professor: string
    room: string
    week: number
  }
  
  export interface MockSubject {
    id: string
    name: string
    professor: string
    room: string
    schedule: string
    totalClasses: number
    attendedClasses: number
  }
  
  export interface MockMenuItem {
    id: string
    name: string
    price: number
    category: 'main' | 'side' | 'soup' | 'special'
    calories: number
    rating: number
    isSpicy?: boolean
    isVegetarian?: boolean
  }
  
  export interface MockDailyMenu {
    date: string
    breakfast: MockMenuItem[]
    lunch: MockMenuItem[]
    dinner: MockMenuItem[]
    specialMenu?: MockMenuItem[]
  }
  
  export interface MockBusRoute {
    id: string
    name: string
    color: string
    description: string
    totalStops: number
    estimatedTime: number
  }
  
  export interface MockBusStop {
    id: string
    name: string
    location: string
    facilities: string[]
    waitingPassengers: number
  }
  
  export interface MockUsageHistory {
    id: string
    service: string
    location: string
    timestamp: string
    type: 'library' | 'payment' | 'attendance' | 'entry'
    amount?: number
  }
  
  // ===============================
  // 데이터 팩토리 클래스
  // ===============================
  
  export class MockDataFactory {
    
    // 기본 사용자 데이터
    static createUsers(): MockUser[] {
      return [
        {
          id: 'user1',
          name: '김학생',
          email: 'student1@university.ac.kr',
          department: '컴퓨터공학과',
          year: 3,
          studentNumber: '2021123456',
          rating: 4.8
        },
        {
          id: 'user2', 
          name: '이학생',
          email: 'student2@university.ac.kr',
          department: '경영학과',
          year: 2,
          studentNumber: '2022234567',
          rating: 4.5
        },
        {
          id: 'user3',
          name: '박학생', 
          email: 'student3@university.ac.kr',
          department: '수학과',
          year: 4,
          studentNumber: '2020345678',
          rating: 4.9
        }
      ]
    }
  
    // 과목 데이터 생성
    static createSubjects(): MockSubject[] {
      return [
        {
          id: '1',
          name: '데이터베이스',
          professor: '김교수',
          room: 'IT-301',
          schedule: '월,수 09:00-10:30',
          totalClasses: 15,
          attendedClasses: 13
        },
        {
          id: '2',
          name: '웹프로그래밍',
          professor: '이교수',
          room: 'IT-205',
          schedule: '화,목 11:00-12:30',
          totalClasses: 15,
          attendedClasses: 14
        },
        {
          id: '3',
          name: '소프트웨어공학',
          professor: '박교수',
          room: 'IT-401',
          schedule: '금 13:00-16:00',
          totalClasses: 15,
          attendedClasses: 12
        },
        {
          id: '4',
          name: '알고리즘',
          professor: '최교수',
          room: 'IT-302',
          schedule: '월,수 14:00-15:30',
          totalClasses: 15,
          attendedClasses: 15
        }
      ]
    }
  
    // 출석 데이터 생성
    static createAttendanceRecords(): MockAttendance[] {
      return [
        {
          id: '1',
          date: '2025-05-23',
          status: 'present',
          subject: '데이터베이스',
          time: '09:00',
          professor: '김교수',
          room: 'IT-301',
          week: 8
        },
        {
          id: '2',
          date: '2025-05-23',
          status: 'late',
          subject: '웹프로그래밍',
          time: '11:00',
          professor: '이교수',
          room: 'IT-205',
          week: 8
        },
        {
          id: '3',
          date: '2025-05-22',
          status: 'present',
          subject: '소프트웨어공학',
          time: '13:00',
          professor: '박교수',
          room: 'IT-401',
          week: 8
        },
        {
          id: '4',
          date: '2025-05-21',
          status: 'present',
          subject: '알고리즘',
          time: '14:00',
          professor: '최교수',
          room: 'IT-302',
          week: 8
        },
        {
          id: '5',
          date: '2025-05-20',
          status: 'absent',
          subject: '데이터베이스',
          time: '09:00',
          professor: '김교수',
          room: 'IT-301',
          week: 8
        }
      ]
    }
  
    // 카페테리아 메뉴 데이터 생성
    static createCafeteriaMenu(): MockDailyMenu[] {
      return [
        {
          date: '2025-01-20',
          breakfast: [
            {
              id: '1',
              name: '김치찌개',
              price: 4000,
              category: 'main',
              calories: 320,
              rating: 4.5,
              isSpicy: true
            },
            {
              id: '2',
              name: '계란말이',
              price: 2000,
              category: 'side',
              calories: 180,
              rating: 4.2
            },
            {
              id: '3',
              name: '미역국',
              price: 1500,
              category: 'soup',
              calories: 45,
              rating: 3.8
            }
          ],
          lunch: [
            {
              id: '4',
              name: '불고기덮밥',
              price: 6000,
              category: 'main',
              calories: 650,
              rating: 4.7
            },
            {
              id: '5',
              name: '잡채',
              price: 3000,
              category: 'side',
              calories: 220,
              rating: 4.3
            },
            {
              id: '6',
              name: '된장국',
              price: 2000,
              category: 'soup',
              calories: 80,
              rating: 4.0
            },
            {
              id: '7',
              name: '비빔밥',
              price: 5500,
              category: 'main',
              calories: 580,
              rating: 4.4,
              isVegetarian: true
            }
          ],
          dinner: [
            {
              id: '8',
              name: '치킨까스',
              price: 7000,
              category: 'main',
              calories: 580,
              rating: 4.6
            },
            {
              id: '9',
              name: '샐러드',
              price: 2500,
              category: 'side',
              calories: 120,
              rating: 4.1,
              isVegetarian: true
            },
            {
              id: '10',
              name: '콘크림 스프',
              price: 2000,
              category: 'soup',
              calories: 150,
              rating: 4.2
            }
          ],
          specialMenu: [
            {
              id: '11',
              name: '오늘의 특선 - 갈비탕',
              price: 8000,
              category: 'special',
              calories: 720,
              rating: 4.9
            }
          ]
        }
      ]
    }
  
    // 셔틀버스 노선 데이터 생성
    static createBusRoutes(): MockBusRoute[] {
      return [
        {
          id: '1',
          name: '본관-기숙사',
          color: 'blue',
          description: '본관에서 기숙사까지 운행',
          totalStops: 5,
          estimatedTime: 15
        },
        {
          id: '2',
          name: '정문-후문',
          color: 'green',
          description: '정문에서 후문까지 캠퍼스 순환',
          totalStops: 8,
          estimatedTime: 25
        },
        {
          id: '3',
          name: '캠퍼스순환',
          color: 'purple',
          description: '캠퍼스 전체 순환 노선',
          totalStops: 12,
          estimatedTime: 35
        }
      ]
    }
  
    // 버스 정류장 데이터 생성
    static createBusStops(): MockBusStop[] {
      return [
        {
          id: '1',
          name: '본관',
          location: '행정관 앞',
          facilities: ['벤치', '지붕', 'WIFI'],
          waitingPassengers: 8
        },
        {
          id: '2',
          name: '도서관',
          location: '중앙도서관',
          facilities: ['벤치', '지붕', 'WIFI', '자판기'],
          waitingPassengers: 12
        },
        {
          id: '3',
          name: '기숙사',
          location: '생활관 정류장',
          facilities: ['벤치', '지붕', 'WIFI', '편의점'],
          waitingPassengers: 15
        },
        {
          id: '4',
          name: '정문',
          location: '정문 게이트',
          facilities: ['벤치', '지붕'],
          waitingPassengers: 6
        },
        {
          id: '5',
          name: '후문',
          location: '후문 주차장',
          facilities: ['벤치', 'WIFI'],
          waitingPassengers: 4
        }
      ]
    }
  
    // 디지털 ID 사용 내역 생성
    static createUsageHistory(): MockUsageHistory[] {
      return [
        {
          id: '1',
          service: '도서관 출입',
          location: '중앙도서관',
          timestamp: '2025-05-23 14:30',
          type: 'library'
        },
        {
          id: '2',
          service: '학식 결제',
          location: '학생회관 식당',
          timestamp: '2025-05-23 12:15',
          type: 'payment',
          amount: 6000
        },
        {
          id: '3',
          service: '출석 체크',
          location: 'IT-301 (웹프로그래밍)',
          timestamp: '2025-05-23 09:00',
          type: 'attendance'
        },
        {
          id: '4',
          service: '건물 출입',
          location: 'IT관',
          timestamp: '2025-05-23 08:45',
          type: 'entry'
        },
        {
          id: '5',
          service: '프린터 이용',
          location: '도서관 2층',
          timestamp: '2025-05-22 16:20',
          type: 'payment',
          amount: 500
        },
        {
          id: '6',
          service: '카페 결제',
          location: '학생회관 카페',
          timestamp: '2025-05-22 15:30',
          type: 'payment',
          amount: 4500
        },
        {
          id: '7',
          service: '체육관 출입',
          location: '종합체육관',
          timestamp: '2025-05-22 14:00',
          type: 'entry'
        }
      ]
    }
  
    // 로딩 지연 시뮬레이션
    static async withDelay<T>(data: T, delay: number = 800): Promise<T> {
      await new Promise(resolve => setTimeout(resolve, delay))
      return data
    }
  }
  
  // ===============================
  // 유틸리티 함수
  // ===============================
  
  /**
   * 개발 환경에서만 목업 데이터 사용
   */
  export const isDevelopment = () => {
    return process.env.NODE_ENV === 'development'
  }
  
  /**
   * API 모드 감지 (목업 vs 실제)
   */
  export const isUsingMockData = () => {
    return isDevelopment() || process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'
  }
  
  /**
   * 환경에 따른 데이터 제공 전략
   */
  export const getDataProvider = <T>(mockData: T, apiCall: () => Promise<T>) => {
    return isUsingMockData() ? Promise.resolve(mockData) : apiCall()
  } 