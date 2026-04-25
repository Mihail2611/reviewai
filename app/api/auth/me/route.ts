import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase'
import type { ApiResponse, Profile } from '@/types'
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isAuthError(auth)) return auth
  return NextResponse.json<ApiResponse<Profile>>({ data: auth.user })
}
export async function PATCH(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isAuthError(auth)) return auth
  try {
    const body = await req.json()
    const { name, phone } = body
    const client = createServerClient(auth.accessToken)
    const { data, error } = await client.from('profiles').update({ name, phone }).eq('id', auth.user.id).select().single()
    if (error) throw error
    return NextResponse.json<ApiResponse<Profile>>({ data: data as Profile, message: 'Профиль обновлён' })
  } catch (error) {
    return NextResponse.json<ApiResponse>({ error: 'Ошибка обновления профиля' }, { status: 500 })
  }
}
