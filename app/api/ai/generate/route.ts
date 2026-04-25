import { NextRequest, NextResponse } from 'next/server'
import { requireAuth, isAuthError } from '@/lib/auth'
import { createServerClient } from '@/lib/supabase'
import { generateAiResponse } from '@/lib/ai'
import type { ApiResponse, Review, AiPrompt, GenerateResponseRequest, GenerateResponseResponse, Tone } from '@/types'
export async function POST(req: NextRequest) {
  const auth = await requireAuth(req)
  if (isAuthError(auth)) return auth
  try {
    const body: GenerateResponseRequest = await req.json()
    const { review_id, tone, custom_instructions } = body
    if (!review_id) return NextResponse.json<ApiResponse>({ error: 'review_id обязателен' }, { status: 400 })
    const client = createServerClient(auth.accessToken)
    const { data: review, error: reviewError } = await client.from('reviews').select('*').eq('id', review_id).eq('user_id', auth.user.id).single()
    if (reviewError || !review) return NextResponse.json<ApiResponse>({ error: 'Отзыв не найден' }, { status: 404 })
    const typedReview = review as Review
    const { data: promptConfig } = await client.from('ai_prompts').select('*').eq('store_id', typedReview.store_id).eq('rating', typedReview.rating).single()
    await client.from('reviews').update({ status: 'pending' }).eq('id', review_id).eq('status', 'new')
    const generatedText = await generateAiResponse(typedReview, promptConfig as AiPrompt | null, (tone as Tone) ?? 'friendly', custom_instructions)
    return NextResponse.json<ApiResponse<GenerateResponseResponse>>({ data: { text: generatedText, review_id } })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Ошибка генерации'
    return NextResponse.json<ApiResponse>({ error: message }, { status: 500 })
  }
}
