// src/app/digital-id/page.tsx
'use client';

import { useState, useEffect } from 'react';
//import { QRCodeSVG } from 'qrcode.react';
import { CreditCard, User, Calendar, MapPin, Clock, Shield, Smartphone, Download, Share2, Wallet, TrendingUp } from 'lucide-react';
import { MockDataFactory, type MockUsageHistory, type MockUser } from '@/lib/mockData'

interface StudentInfo {
    id: string;
    name: string;
    studentNumber: string;
    department: string;
    grade: number;
    photo: string;
    issueDate: string;
    expiryDate: string;
    email: string;
    phone: string;
    address: string;
    emergencyContact: string;
}

interface UsageHistory {
    id: string;
    service: string;
    location: string;
    timestamp: string;
    type: 'entry' | 'payment' | 'library' | 'attendance';
    amount?: number;
}

interface DigitalWallet {
    balance: number;
    lastRecharge: string;
    monthlySpent: number;
}

export default function DigitalIDPage() {
    const [studentInfo, setStudentInfo] = useState<StudentInfo | null>(null);
    const [isFlipped, setIsFlipped] = useState(false);
    const [qrData, setQrData] = useState('');
    const [usageHistory, setUsageHistory] = useState<MockUsageHistory[]>([]);
    const [wallet, setWallet] = useState<DigitalWallet | null>(null);
    const [activeTab, setActiveTab] = useState<'card' | 'history' | 'wallet'>('card');

    useEffect(() => {
        // 🔧 중앙 데이터 시스템에서 데이터 가져오기
        const loadDigitalIdData = async () => {
            try {
                const [users, history] = await Promise.all([
                    MockDataFactory.withDelay(MockDataFactory.createUsers(), 300),
                    MockDataFactory.withDelay(MockDataFactory.createUsageHistory(), 500)
                ])

                // 첫 번째 사용자를 현재 학생으로 사용
                const currentUser = users[0]
                
                const dummyStudent: StudentInfo = {
                    id: currentUser.id,
                    name: currentUser.name,
                    studentNumber: currentUser.studentNumber,
                    department: currentUser.department,
                    grade: currentUser.year,
                    photo: '/api/placeholder/150/200',
                    issueDate: '2021-03-01',
                    expiryDate: '2025-02-28',
                    email: currentUser.email,
                    phone: '010-1234-5678',
                    address: '서울시 강남구 학교로 123',
                    emergencyContact: '010-9876-5432'
                }

                const dummyWallet: DigitalWallet = {
                    balance: 45000,
                    lastRecharge: '2025-05-20',
                    monthlySpent: 89000
                }

                setStudentInfo(dummyStudent)
                setUsageHistory(history)
                setWallet(dummyWallet)

                setQrData(JSON.stringify({
                    studentNumber: dummyStudent.studentNumber,
                    name: dummyStudent.name,
                    timestamp: Date.now()
                }))
            } catch (error) {
                console.error('디지털 ID 데이터 로드 실패:', error)
            }
        }

        loadDigitalIdData()
    }, []);

    const getServiceIcon = (type: string) => {
        switch (type) {
            case 'entry': return '🚪';
            case 'payment': return '💳';
            case 'library': return '📚';
            case 'attendance': return '✅';
            default: return '📱';
        }
    };

    const getServiceColor = (type: string) => {
        switch (type) {
            case 'entry': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'payment': return 'bg-green-100 text-green-800 border-green-200';
            case 'library': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'attendance': return 'bg-orange-100 text-orange-800 border-orange-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    if (!studentInfo || !wallet) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">학생 정보를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
            <div className="container mx-auto px-6 py-8">
                {/* 헤더 */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
                        <CreditCard className="w-10 h-10 mr-3 text-indigo-600" />
                        디지털 학생증
                    </h1>
                    <p className="text-gray-600">언제 어디서나 편리하게 사용하는 스마트 학생증</p>
                </div>

                {/* 탭 네비게이션 */}
                <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-sm border border-white/30 p-2 mb-8">
                    <div className="flex space-x-2">
                        {[
                            { id: 'card', label: '학생증', icon: CreditCard },
                            { id: 'history', label: '이용 내역', icon: Clock },
                            { id: 'wallet', label: '전자지갑', icon: Wallet }
                        ].map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id as any)}
                                className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg font-medium transition-all ${
                                    activeTab === id
                                        ? 'bg-indigo-500 text-white shadow-lg'
                                        : 'text-gray-700 hover:bg-white/50'
                                }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span>{label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 학생증 탭 */}
                {activeTab === 'card' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* 디지털 학생증 카드 */}
                        <div className="lg:col-span-2 flex justify-center">
                            <div className="relative">
                                <div
                                    className={`w-96 h-60 relative transition-transform duration-700 transform-style-preserve-3d cursor-pointer ${
                                        isFlipped ? 'rotate-y-180' : ''
                                    }`}
                                    onClick={() => setIsFlipped(!isFlipped)}
                                    style={{ transformStyle: 'preserve-3d' }}
                                >
                                    {/* 앞면 */}
                                    <div
                                        className="absolute inset-0 w-full h-full bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-2xl p-6 text-white"
                                        style={{ backfaceVisibility: 'hidden' }}
                                    >
                                        <div className="flex items-center justify-between h-full">
                                            <div className="flex-1">
                                                <div className="text-xs opacity-75 mb-2">DIGITAL STUDENT ID CARD</div>
                                                <div className="text-xl font-bold mb-4">한국대학교</div>
                                                <div className="space-y-2">
                                                    <div className="text-sm">
                                                        <span className="opacity-75">이름:</span>
                                                        <span className="ml-2 font-medium">{studentInfo.name}</span>
                                                    </div>
                                                    <div className="text-sm">
                                                        <span className="opacity-75">학번:</span>
                                                        <span className="ml-2 font-medium">{studentInfo.studentNumber}</span>
                                                    </div>
                                                    <div className="text-sm">
                                                        <span className="opacity-75">학과:</span>
                                                        <span className="ml-2 font-medium">{studentInfo.department}</span>
                                                    </div>
                                                    <div className="text-sm">
                                                        <span className="opacity-75">학년:</span>
                                                        <span className="ml-2 font-medium">{studentInfo.grade}학년</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <div className="w-20 h-24 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                                                    <User className="w-8 h-8 text-white opacity-60" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="absolute bottom-4 right-4">
                                            <Shield className="w-6 h-6 opacity-60" />
                                        </div>
                                    </div>

                                    {/* 뒷면 */}
                                    <div
                                        className="absolute inset-0 w-full h-full bg-white rounded-2xl shadow-2xl p-6"
                                        style={{
                                            backfaceVisibility: 'hidden',
                                            transform: 'rotateY(180deg)'
                                        }}
                                    >
                                        <div className="flex flex-col items-center justify-center h-full">
                                            <div className="mb-4">
                                                {/*<QRCodeSVG value={qrData} size={140} /> */}
                                            </div>
                                            <div className="text-center text-sm text-gray-600">
                                                <p className="font-medium mb-1">출입 및 결제 시 스캔</p>
                                                <p>QR 코드를 리더기에 인식해주세요</p>
                                            </div>
                                            <div className="mt-4 text-xs text-gray-500 text-center">
                                                <p>발급일: {studentInfo.issueDate}</p>
                                                <p>만료일: {studentInfo.expiryDate}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-center text-sm text-gray-600 mt-4">
                                    카드를 클릭하여 뒤집기
                                </p>
                            </div>
                        </div>

                        {/* 학생 정보 및 기능 */}
                        <div className="space-y-6">
                            {/* 학생 정보 */}
                            <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-sm border border-white/30 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <User className="w-5 h-5 mr-2 text-indigo-500" />
                                    학생 정보
                                </h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">이름</span>
                                        <span className="font-medium">{studentInfo.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">학번</span>
                                        <span className="font-medium">{studentInfo.studentNumber}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">학과</span>
                                        <span className="font-medium">{studentInfo.department}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">학년</span>
                                        <span className="font-medium">{studentInfo.grade}학년</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">이메일</span>
                                        <span className="font-medium text-xs">{studentInfo.email}</span>
                                    </div>
                                </div>
                            </div>

                            {/* 이용 가능 서비스 */}
                            <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-sm border border-white/30 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">이용 가능 서비스</h3>
                                <div className="space-y-3">
                                    {[
                                        { icon: '📚', service: '도서관 출입 및 대출' },
                                        { icon: '🚪', service: '건물 출입 인증' },
                                        { icon: '🍽️', service: '학식 결제' },
                                        { icon: '🖨️', service: '프린터 이용' },
                                        { icon: '🏃', service: '체육시설 이용' },
                                        { icon: '✅', service: '출석 체크' }
                                    ].map((item, index) => (
                                        <div key={index} className="flex items-center space-x-3">
                                            <span className="text-lg">{item.icon}</span>
                                            <span className="text-sm text-gray-700">{item.service}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 빠른 액션 */}
                            <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-sm border border-white/30 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">빠른 액션</h3>
                                <div className="grid grid-cols-2 gap-3">
                                    <button className="flex items-center justify-center space-x-2 py-3 px-4 bg-indigo-100 hover:bg-indigo-200 rounded-lg transition-colors">
                                        <Download className="w-4 h-4 text-indigo-600" />
                                        <span className="text-sm font-medium text-indigo-600">저장</span>
                                    </button>
                                    <button className="flex items-center justify-center space-x-2 py-3 px-4 bg-green-100 hover:bg-green-200 rounded-lg transition-colors">
                                        <Share2 className="w-4 h-4 text-green-600" />
                                        <span className="text-sm font-medium text-green-600">공유</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 이용 내역 탭 */}
                {activeTab === 'history' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2">
                            <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-sm border border-white/30">
                                <div className="p-6 border-b border-gray-200">
                                    <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                                        <Clock className="w-5 h-5 mr-2" />
                                        최근 이용 내역
                                    </h2>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {usageHistory.map((record) => (
                                            <div key={record.id} className={`p-4 rounded-lg border ${getServiceColor(record.type)}`}>
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-3">
                                                        <span className="text-2xl">{getServiceIcon(record.type)}</span>
                                                        <div>
                                                            <h3 className="font-medium text-gray-900">{record.service}</h3>
                                                            <p className="text-sm text-gray-600">{record.location}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        {record.amount && (
                                                            <p className="font-semibold text-gray-900">-{record.amount.toLocaleString()}원</p>
                                                        )}
                                                        <p className="text-sm text-gray-500">{record.timestamp}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* 이용 통계 */}
                            <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-sm border border-white/30 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">이번 주 이용 통계</h3>
                                <div className="space-y-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-indigo-600">{usageHistory.length}</div>
                                        <div className="text-sm text-gray-600">총 이용 횟수</div>
                                    </div>
                                    <div className="space-y-2">
                                        {[
                                            { type: 'payment', label: '결제', count: usageHistory.filter(h => h.type === 'payment').length },
                                            { type: 'entry', label: '출입', count: usageHistory.filter(h => h.type === 'entry').length },
                                            { type: 'library', label: '도서관', count: usageHistory.filter(h => h.type === 'library').length },
                                            { type: 'attendance', label: '출석', count: usageHistory.filter(h => h.type === 'attendance').length }
                                        ].map((stat) => (
                                            <div key={stat.type} className="flex justify-between items-center">
                                                <span className="text-gray-600">{stat.label}</span>
                                                <span className="font-semibold">{stat.count}회</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* 전자지갑 탭 */}
                {activeTab === 'wallet' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            {/* 잔액 정보 */}
                            <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold">전자지갑 잔액</h2>
                                    <Wallet className="w-6 h-6" />
                                </div>
                                <div className="text-3xl font-bold mb-2">{wallet.balance.toLocaleString()}원</div>
                                <p className="text-green-100">마지막 충전: {wallet.lastRecharge}</p>
                            </div>

                            {/* 결제 내역 */}
                            <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-sm border border-white/30">
                                <div className="p-6 border-b border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900">결제 내역</h3>
                                </div>
                                <div className="p-6">
                                    <div className="space-y-4">
                                        {usageHistory.filter(h => h.type === 'payment' && h.amount).map((payment) => (
                                            <div key={payment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                                <div className="flex items-center space-x-3">
                                                    <span className="text-xl">💳</span>
                                                    <div>
                                                        <h4 className="font-medium text-gray-900">{payment.service}</h4>
                                                        <p className="text-sm text-gray-600">{payment.location}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-red-600">-{payment.amount!.toLocaleString()}원</p>
                                                    <p className="text-sm text-gray-500">{payment.timestamp.split(' ')[1]}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* 이번 달 지출 */}
                            <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-sm border border-white/30 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                    <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                                    이번 달 지출
                                </h3>
                                <div className="text-center mb-4">
                                    <div className="text-2xl font-bold text-blue-600">{wallet.monthlySpent.toLocaleString()}원</div>
                                    <div className="text-sm text-gray-600">총 지출 금액</div>
                                </div>
                                <div className="space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">식비</span>
                                        <span className="font-medium">65,000원</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">프린터</span>
                                        <span className="font-medium">12,000원</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">카페</span>
                                        <span className="font-medium">12,000원</span>
                                    </div>
                                </div>
                            </div>

                            {/* 충전 */}
                            <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-sm border border-white/30 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">잔액 충전</h3>
                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    {[10000, 20000, 30000, 50000].map((amount) => (
                                        <button
                                            key={amount}
                                            className="py-2 px-4 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            {amount.toLocaleString()}원
                                        </button>
                                    ))}
                                </div>
                                <button className="w-full py-3 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg transition-colors">
                                    충전하기
                                </button>
                            </div>

                            {/* 자동충전 설정 */}
                            <div className="bg-white/60 backdrop-blur-md rounded-xl shadow-sm border border-white/30 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">자동충전 설정</h3>
                                <div className="space-y-3">
                                    <label className="flex items-center">
                                        <input type="checkbox" className="mr-3" />
                                        <span className="text-sm">잔액 10,000원 이하 시 자동충전</span>
                                    </label>
                                    <div className="text-sm text-gray-600">
                                        <p>충전 금액: 30,000원</p>
                                        <p>결제 수단: 신용카드 (****-1234)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
        </div>
    );
}