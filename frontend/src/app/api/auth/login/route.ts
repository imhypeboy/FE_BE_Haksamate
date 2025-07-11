import { NextResponse } from 'next/server';
import { TEST_ACCOUNTS, getEnvConfig } from '@/lib/constants';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        const envConfig = getEnvConfig();
        
        // 개발 환경에서만 테스트 계정 허용
        if (envConfig.isDevelopment) {
            const testAccount = TEST_ACCOUNTS.student;
            
            if (email === testAccount.email && password === testAccount.password) {
                // JWT 토큰 생성 (실제 구현에서는 jsonwebtoken 라이브러리 사용)
                const token = 'example-jwt-token-' + Date.now(); // 매번 다른 토큰 생성

                return NextResponse.json({
                    user: {
                        id: 1,
                        username: testAccount.name,
                        email: testAccount.email,
                        department: testAccount.department,
                        year: testAccount.year
                    },
                    token
                }, { status: 200 });
            }
        }

        // 프로덕션 환경에서는 실제 인증 로직 실행
        if (envConfig.isProduction) {
            // TODO: 실제 데이터베이스 인증 로직 구현
            return NextResponse.json(
                { message: '서비스 준비 중입니다.' },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { message: '이메일 또는 비밀번호가 올바르지 않습니다.' },
            { status: 401 }
        );
    } catch (error) {
        console.error('로그인 처리 중 오류 발생:', error);
        return NextResponse.json(
            { message: '서버 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}