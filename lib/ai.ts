import type { Review, AiPrompt, Tone } from '@/types'
const ANTHROPIC_API_BASE = 'https://api.anthropic.com/v1'
export async function generateAiResponse(review: Review, promptConfig: AiPrompt | null, tone: Tone = 'friendly', customInstructions?: string): Promise<string> {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY не настроен')
  const systemPrompt = promptConfig?.custom_prompt || `Ты — представитель продавца на маркетплейсе. Напиши ответ на отзыв покупателя. Рейтинг: ${review.rating} из 5. Тон: ${tone}. Ответ на русском языке, 2-4 предложения.`
  const userMessage = `Товар: ${review.product_name}\nОценка: ${review.rating} из 5\nАвтор: ${review.author ?? 'Покупатель'}\nОтзыв: ${review.text ?? '(без текста)'}\n${customInstructions ? '\nДополнительно: ' + customInstructions : ''}\nНапиши ответ.`
  const response = await fetch(`${ANTHROPIC_API_BASE}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({ model: 'claude-sonnet-4-20250514', max_tokens: 500, system: systemPrompt, messages: [{ role: 'user', content: userMessage }] })
  })
  if (!response.ok) throw new Error(`Anthropic API error: ${await response.text()}`)
  const data = await response.json()
  return data.content?.[0]?.text?.trim() || ''
}
