import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase'
import { WildberriesClient } from '@/lib/wildberries'
import { OzonClient } from '@/lib/ozon'
import type { ApiResponse, Store, SyncRequest, SyncResponse } from '@/types'
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isAuthError(auth)) return auth
  try {
    const body: SyncRequest = await req.json()
    const { store_id, days_back = 30 } = body
    if (!store_id) return NextResponse.json<ApiResponse>({ error: 'store_id обязателен' }, { status: 400 })
    const { createClient } = await import('@supabase/supabase-js')
    const adminClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    const { data: store, error: storeError } = await adminClient.from('stores').select('*').eq('id', store_id).eq('user_id', auth.user.id).single()
    if (storeError || !store) return NextResponse.json<ApiResponse>({ error: 'Магазин не найден' }, { status: 404 })
    const typedStore = store as Store
    const dateFrom = new Date()
    dateFrom.setDate(dateFrom.getDate() - days_back)
    const client = createServerClient(auth.accessToken)
    let rawReviews: Array<{ external_id: string; product_name: string; product_id?: string; product_image?: string; rating: number; text: string | null; author: string | null; reviewed_at: string; status: 'new' | 'answered'; raw_data: Record<string, unknown> }> = []
    if (typedStore.platform === 'wildberries' && typedStore.wb_api_key) {
      const wb = new WildberriesClient(typedStore.wb_api_key)
      const wbReviews = await wb.getAllReviews(100, 0, dateFrom)
      rawReviews = wbReviews.map(r => ({ external_id: r.id, product_name: r.subjectName || `Артикул ${r.nmId}`, product_id: String(r.nmId), product_image: r.photoLinks?.[0]?.miniSize ?? null, rating: r.productValuation, text: r.text || r.pros || null, author: r.userName || null, reviewed_at: r.createdDate, status: r.answer ? 'answered' : 'new', raw_data: r as unknown as Record<string, unknown> }))
    } else if (typedStore.platform === 'ozon' && typedStore.ozon_client_id && typedStore.ozon_api_key) {
      const ozon = new OzonClient(typedStore.ozon_client_id, typedStore.ozon_api_key)
      const ozonReviews = await ozon.getReviews({ pageSize: 100 })
      rawReviews = ozonReviews.filter(r => new Date(r.created_at) >= dateFrom).map(r => ({ external_id: r.review_id, product_name: r.product_name || `SKU ${r.sku}`, product_id: String(r.sku), product_image: r.media_files?.[0] ?? null, rating: r.rating, text: r.text || null, author: r.reviewer_name || null, reviewed_at: r.created_at, status: r.response ? 'answered' : 'new', raw_data: r as unknown as Record<string, unknown> }))
    } else {
      return NextResponse.json<ApiResponse>({ error: 'API ключи магазина не настроены' }, { status: 422 })
    }
    if (rawReviews.length === 0) {
      await client.from('stores').update({ last_sync_at: new Date().toISOString() }).eq('id', store_id)
      return NextResponse.json<ApiResponse<SyncResponse>>({ data: { synced: 0, new_reviews: 0, store_id }, message: 'Новых отзывов нет' })
    }
    const reviewsToUpsert = rawReviews.map(r => ({ store_id, user_id: auth.user.id, external_id: r.external_id, platform: typedStore.platform, product_name: r.product_name, product_id: r.product_id ?? null, product_image: r.product_image ?? null, rating: r.rating, text: r.text, author: r.author, reviewed_at: r.reviewed_at, status: r.status, raw_data: r.raw_data }))
    const { data: upserted, error: upsertError } = await client.from('reviews').upsert(reviewsToUpsert, { onConflict: 'store_id,external_id,platform', ignoreDuplicates: false }).select('id, status')
    if (upsertError) throw upsertError
    await client.from('stores').update({ last_sync_at: new Date().toISOString() }).eq('id', store_id)
    const newReviews = (upserted ?? []).filter(r => r.status === 'new').length
    return NextResponse.json<ApiResponse<SyncResponse>>({ data: { synced: rawReviews.length, new_reviews: newReviews, store_id }, message: `Синхронизировано ${rawReviews.length} отзывов, новых: ${newReviews}` })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ошибка синхронизации'
    return NextResponse.json<ApiResponse>({ error: message }, { status: 500 })
  }
}
