import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase'
import type { ApiResponse, GetReviewsResponse } from '@/types'
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isAuthError(auth)) return auth
  const { searchParams } = new URL(req.url)
  const store_id = searchParams.get('store_id')
  const platform = searchParams.get('platform') ?? 'all'
  const status = searchParams.get('status') ?? 'all'
  const search = searchParams.get('search') ?? ''
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1'))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') ?? '20')))
  const offset = (page - 1) * limit
  const client = createServerClient(auth.accessToken)
  let query = client.from('reviews').select('*', { count: 'exact' }).eq('user_id', auth.user.id)
  if (store_id) query = query.eq('store_id', store_id)
  if (platform !== 'all') query = query.eq('platform', platform)
  if (status !== 'all') query = query.eq('status', status)
  if (search) query = query.or(`text.ilike.%${search}%,product_name.ilike.%${search}%,author.ilike.%${search}%`)
  const { data, error, count } = await query.order('reviewed_at', { ascending: false }).range(offset, offset + limit - 1)
  if (error) return NextResponse.json<ApiResponse>({ error: 'Ошибка загрузки отзывов' }, { status: 500 })
  const total = count ?? 0
  return NextResponse.json<ApiResponse<GetReviewsResponse>>({ data: { reviews: data ?? [], total, page, limit, has_more: offset + limit < total } })
}
