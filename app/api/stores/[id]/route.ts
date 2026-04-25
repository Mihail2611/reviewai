import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase'
import type { ApiResponse, Store } from '@/types'
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req)
  if (isAuthError(auth)) return auth
  const { id } = await params
  const client = createServerClient(auth.accessToken)
  const { data: store } = await client.from('stores').select('id, user_id').eq('id', id).eq('user_id', auth.user.id).single()
  if (!store) return NextResponse.json<ApiResponse>({ error: 'Магазин не найден' }, { status: 404 })
  const { error } = await client.from('stores').delete().eq('id', id)
  if (error) return NextResponse.json<ApiResponse>({ error: 'Ошибка удаления магазина' }, { status: 500 })
  return NextResponse.json<ApiResponse>({ message: 'Магазин удалён' })
}
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req)
  if (isAuthError(auth)) return auth
  const { id } = await params
  try {
    const body = await req.json()
    const client = createServerClient(auth.accessToken)
    const { data, error } = await client.from('stores').update(body).eq('id', id).eq('user_id', auth.user.id).select().single()
    if (error) throw error
    return NextResponse.json<ApiResponse<Store>>({ data: data as Store })
  } catch { return NextResponse.json<ApiResponse>({ error: 'Ошибка обновления магазина' }, { status: 500 }) }
}
