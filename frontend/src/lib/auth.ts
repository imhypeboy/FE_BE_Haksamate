import { supabase } from './supabaseClient';

// 회원가입 (닉네임은 profiles 테이블에도 insert)
export async function registerUser({
                                       username,
                                       email,
                                       password,
                                   }: {
    username: string;
    email: string;
    password: string;
}) {
    // 1. Auth 등록 (email, password)
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) throw error;

    // 2. 유저가 생성되면 profiles 테이블에 닉네임도 저장
    if (data.user) {
        const { error: insertError } = await supabase
            .from('profiles')
            .insert([{ id: data.user.id, name: username, email }]);
        if (insertError) throw insertError;
    }

    return data;
}

// 로그인
export async function loginUser({
                                    email,
                                    password,
                                }: {
    email: string;
    password: string;
}) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
}

// 현재 로그인한 유저 정보 가져오기
export async function getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
}

// 로그인 여부 확인
export async function isAuthenticated() {
    const { data } = await supabase.auth.getUser();
    return !!data.user;
}

// 로그아웃
export async function logoutUser() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return true;
}

// 비밀번호 재설정 이메일 전송
export async function sendPasswordResetEmail(email: string) {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: process.env.NEXT_PUBLIC_SITE_URL
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/update-password`
      : undefined
  })
  if (error) throw error
  return data
}