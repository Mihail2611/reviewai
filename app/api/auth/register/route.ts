import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import type { ApiResponse, AuthResponse, RegisterRequest } from '@/types'
export async function POST(req: NextRequest) {
  try {
    const body: RegisterRequest = await req.json()
    const { email, password, name } = body
    if (!email || !password || !name) return NextResponse.json<ApiResponse>({ error: 'Email, пароль и имя обязательны' }, { status: 400 })
    if (password.length < 8) return NextResponse.json<ApiResponse>({ error: 'Пароль должен содержать минимум 8 символов' }, { status: 400 })
    const { data, error } = await supabaseAdmin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { name } })
    if (error) {
      if (error.message.includes('already registered')) return NextResponse.json<ApiResponse>({ error: 'Пользователь с таким email уже существует' }, { status: 409 })
      throw error
    }
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({ email, password })
    if (signInError || !signInData.session) throw signInError ?? new Error('Ошибка создания сессии')
    const { data: profile } = await supabaseAdmin.from('profiles').select('*').eq('id', data.user.id).single()
    return NextResponse.json<ApiResponse<AuthResponse>>({ data: { user: profile, access_token: signInData.session.access_token, refresh_token: signInData.session.refresh_token }, message: 'Аккаунт создан успешно' }, { status: 201 })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json<ApiResponse>({ error: 'Внутренняя ошибка сервера' }, { status: 500 })
  }
}
