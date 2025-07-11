import { NextResponse } from 'next/server';
import { TEST_ACCOUNTS, VALIDATION_RULES, getEnvConfig } from '@/lib/constants';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { username, email, password, confirmPassword } = body;
        const envConfig = getEnvConfig();

        // 기본적인 유효성 검사
        if (!username || !email || !password) {
            return NextResponse.json(
                { message: '모든 필드를 입력해주세요.' },
                { status: 400 }
            );
        }

        // 개발 환경에서 테스트 계정과의 충돌 검사
        if (envConfig.isDevelopment) {
            if (email === TEST_ACCOUNTS.student.email || email === TEST_ACCOUNTS.admin.email) {
                return NextResponse.json(
                    { message: '이미 사용 중인 이메일입니다.' },
                    { status: 400 }
                );
            }
        }

        if (password !== confirmPassword) {
            return NextResponse.json(
                { message: '비밀번호가 일치하지 않습니다.' },
                { status: 400 }
            );
        }

        // 이메일 형식 검사
        if (!VALIDATION_RULES.email.pattern.test(email)) {
            return NextResponse.json(
                { message: '유효한 이메일 주소를 입력해주세요.' },
                { status: 400 }
            );
        }

        // 차단된 도메인 검사
        const domain = email.split('@')[1]?.toLowerCase();
        if (domain && VALIDATION_RULES.email.blockedDomains.includes(domain)) {
            return NextResponse.json(
                { message: '임시 이메일 주소는 사용할 수 없습니다.' },
                { status: 400 }
            );
        }

        // 비밀번호 복잡성 검사
        if (password.length < VALIDATION_RULES.password.minLength) {
            return NextResponse.json(
                { message: `비밀번호는 최소 ${VALIDATION_RULES.password.minLength}자 이상이어야 합니다.` },
                { status: 400 }
            );
        }

        if (!VALIDATION_RULES.password.pattern.test(password)) {
            return NextResponse.json(
                { message: '비밀번호는 대문자, 소문자, 숫자를 포함해야 합니다.' },
                { status: 400 }
            );
        }

        // 사용자명 유효성 검사
        if (!VALIDATION_RULES.username.pattern.test(username)) {
            return NextResponse.json(
                { message: '사용자명은 한글, 영문, 숫자, 언더스코어만 사용 가능합니다.' },
                { status: 400 }
            );
        }

        // 프로덕션 환경에서는 실제 데이터베이스 등록 로직 실행
        if (envConfig.isProduction) {
            // TODO: 실제 데이터베이스 등록 로직 구현
            return NextResponse.json(
                { message: '서비스 준비 중입니다.' },
                { status: 503 }
            );
        }

        // 개발 환경에서는 간단한 성공 응답
        const token = 'example-jwt-token-' + Date.now();

        return NextResponse.json({
            user: {
                id: Date.now(),
                username,
                email,
                department: '미정',
                year: 1
            },
            token,
            message: '회원가입이 완료되었습니다.'
        }, { status: 201 });
    } catch (error) {
        console.error('회원가입 처리 중 오류 발생:', error);
        return NextResponse.json(
            { message: '서버 오류가 발생했습니다.' },
            { status: 500 }
        );
    }
}