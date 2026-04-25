import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import type { ApiResponse, AuthResponse, LoginRequest } from '@/types'
export async function POST(req: NextRequest) {
  try {
    const body: LoginRequest = await req.json()
    const { email, password } = body
    if (!email || !password) return NextResponse.json<ApiResponse>({ error: 'Email и пароль обязательны' }, { status: 400 })
    const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password })
    if (error || !data.session) return NextResponse.json<ApiResponse>({ error: 'Неверный email или пароль' }, { status: 401 })
    const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', data.user.id).single()
    return NextResponse.json<ApiResponse<AuthResponse>>({ data: { user: profile, access_token: data.session.access_token, refresh_token: data.session.refresh_token } })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json<ApiResponse>({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
