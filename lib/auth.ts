import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from './supabase'
import type { Profile, ApiResponse } from '@/types'

export interface AuthContext { user: Profile; accessToken: string }

export async function requireAuth(req: NextRequest): Promise<AuthContext | NextResponse<ApiResponse>> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json<ApiResponse>({ error: 'Требуется авторизация' }, { status: 401 })
  }
  const accessToken = authHeader.slice(7)
  const client = createServerClient(accessToken)
  const { data: { user }, error } = await client.auth.getUser()
  if (error || !user) {
    return NextResponse.json<ApiResponse>({ error: 'Недействительный токен' }, { status: 401 })
  }
  const { data: profile, error: profileError } = await client.from('profiles').select('*').eq('id', user.id).single()
  if (profileError || !profile) {
    return NextResponse.json<ApiResponse>({ error: 'Профиль не найден' }, { status: 404 })
  }
  return { user: profile as Profile, accessToken }
}

export function isAuthError(result: AuthContext | NextResponse): result is NextResponse {
  return result instanceof NextResponse
}
