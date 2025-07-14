// lib/profile.ts
import { supabase } from './supabaseClient'

// 프로필 정보 조회 (userId = auth의 uuid)
export async function fetchProfile(userId: string) {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
    if (error) throw error
    return data
}

// 프로필 정보 업데이트/생성 (onConflict 옵션 없이!)
export async function updateProfile(userId: string, profile: {
    name: string,
    email: string,
    department: string,
    studentId: string,
    year: string,
    profile_image_url?: string
}) {
    const { error } = await supabase
        .from('profiles')
        .upsert([
            {
                id: userId,
                name: profile.name,
                email: profile.email,
                department: profile.department,
                student_id: profile.studentId,   // DB 컬럼명에 맞춰야 함!
                year: profile.year,
                profile_image_url: profile.profile_image_url || null
            }
        ])
    if (error) throw error
    return true
}
