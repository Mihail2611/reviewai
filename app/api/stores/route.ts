import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase'
import { WildberriesClient } from '@/lib/wildberries'
import { OzonClient } from '@/lib/ozon'
import type { ApiResponse, Store, CreateStoreRequest } from '@/types'
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isAuthError(auth)) return auth
  const client = createServerClient(auth.accessToken)
  const { data, error } = await client.from('stores').select('*').eq('user_id', auth.user.id).order('created_at', { ascending: false })
  if (error) return NextResponse.json<ApiResponse>({ error: 'Ошибка загрузки магазинов' }, { status: 500 })
  const sanitized = (data as Store[]).map(store => ({ ...store, wb_api_key: store.wb_api_key ? '••••••••' : null, ozon_api_key: store.ozon_api_key ? '••••••••' : null }))
  return NextResponse.json<ApiResponse<Store[]>>({ data: sanitized })
}
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isAuthError(auth)) return auth
  try {
    const body: CreateStoreRequest = await req.json()
    const { platform, name, wb_supplier_id, wb_api_key, ozon_client_id, ozon_api_key } = body
    if (!platform || !name) return NextResponse.json<ApiResponse>({ error: 'Платформа и название обязательны' }, { status: 400 })
    if (platform === 'wildberries') {
      if (!wb_api_key) return NextResponse.json<ApiResponse>({ error: 'API ключ Wildberries обязателен' }, { status: 400 })
      try { const wb = new WildberriesClient(wb_api_key); await wb.getUnansweredCount() }
      catch { return NextResponse.json<ApiResponse>({ error: 'Неверный API ключ Wildberries.' }, { status: 422 }) }
    }
    if (platform === 'ozon') {
      if (!ozon_client_id || !ozon_api_key) return NextResponse.json<ApiResponse>({ error: 'Client ID и API ключ Ozon обязательны' }, { status: 400 })
      try { const ozon = new OzonClient(ozon_client_id, ozon_api_key); await ozon.getReviewsCount() }
      catch { return NextResponse.json<ApiResponse>({ error: 'Неверный Client ID или API ключ Ozon.' }, { status: 422 }) }
    }
    const client = createServerClient(auth.accessToken)
    const { data, error } = await client.from('stores').insert({ user_id: auth.user.id, platform, name, wb_supplier_id: wb_supplier_id ?? null, wb_api_key: wb_api_key ?? null, ozon_client_id: ozon_client_id ?? null, ozon_api_key: ozon_api_key ?? null }).select().single()
    if (error) throw error
    const promptsToInsert = [1, 2, 3, 4, 5].map(rating => ({ store_id: (data as Store).id, rating, mode: rating <= 2 ? 'semi' : (rating >= 4 ? 'auto' : 'semi'), tone: rating <= 2 ? 'apologetic' : 'friendly' }))
    await client.from('ai_prompts').insert(promptsToInsert)
    return NextResponse.json<ApiResponse<Store>>({ data: data as Store, message: 'Магазин добавлен' }, { status: 201 })
  } catch (error) {
    return NextResponse.json<ApiResponse>({ error: 'Ошибка создания магазина' }, { status: 500 })
  }
}
