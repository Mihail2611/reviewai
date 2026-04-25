import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase'
import { WildberriesClient } from '@/lib/wildberries'
import { OzonClient } from '@/lib/ozon'
import type { ApiResponse, Review, RespondToReviewRequest } from '@/types'
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth(req)
  if (isAuthError(auth)) return auth
  const { id } = await params
  try {
    const body: RespondToReviewRequest = await req.json()
    const { response_text, send_to_marketplace = false } = body
    if (!response_text?.trim()) return NextResponse.json<ApiResponse>({ error: 'Текст ответа не может быть пустым' }, { status: 400 })
    const client = createServerClient(auth.accessToken)
    const { data: review, error: reviewError } = await client.from('reviews').select('*').eq('id', id).eq('user_id', auth.user.id).single()
    if (reviewError || !review) return NextResponse.json<ApiResponse>({ error: 'Отзыв не найден' }, { status: 404 })
    const typedReview = review as Review
    if (send_to_marketplace) {
      const { createClient } = await import('@supabase/supabase-js')
      const adminClient = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
      const { data: store } = await adminClient.from('stores').select('*').eq('id', typedReview.store_id).single()
      if (store) {
        try {
          if (typedReview.platform === 'wildberries' && store.wb_api_key) { const wb = new WildberriesClient(store.wb_api_key); await wb.sendResponse(typedReview.external_id, response_text) }
          else if (typedReview.platform === 'ozon' && store.ozon_client_id && store.ozon_api_key) { const ozon = new OzonClient(store.ozon_client_id, store.ozon_api_key); await ozon.sendResponse(typedReview.external_id, response_text) }
        } catch (apiError) { return NextResponse.json<ApiResponse>({ error: `Ошибка отправки на маркетплейс: ${apiError instanceof Error ? apiError.message : 'Неизвестная ошибка'}` }, { status: 502 }) }
      }
    }
    const { data: updated, error: updateError } = await client.from('reviews').update({ response_text, status: 'answered', responded_at: new Date().toISOString() }).eq('id', id).select().single()
    if (updateError) throw updateError
    return NextResponse.json<ApiResponse<Review>>({ data: updated as Review, message: send_to_marketplace ? 'Ответ отправлен на маркетплейс' : 'Ответ сохранён' })
  } catch (error) { return NextResponse.json<ApiResponse>({ error: 'Ошибка сохранения ответа' }, { status: 500 }) }
}
