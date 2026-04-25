import type { WBReview, WBReviewsResponse } from '@/types'
const WB_API_BASE = 'https://feedbacks-api.wildberries.ru'
export class WildberriesClient {
  private apiKey: string
  constructor(apiKey: string) { this.apiKey = apiKey }
  private async request<T>(path: string, params?: Record<string, string | number | boolean>): Promise<T> {
    const url = new URL(`${WB_API_BASE}${path}`)
    if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)))
    const response = await fetch(url.toString(), { headers: { Authorization: this.apiKey, 'Content-Type': 'application/json' } })
    if (!response.ok) { const text = await response.text(); throw new Error(`WB API error ${response.status}: ${text}`) }
    return response.json()
  }
  async getUnansweredReviews(take = 100, skip = 0): Promise<WBReview[]> {
    const data = await this.request<WBReviewsResponse>('/api/v1/feedbacks', { isAnswered: false, take, skip, order: 'dateDesc' })
    if (data.error) throw new Error(`WB API: ${data.errorText}`)
    return data.data?.feedbacks ?? []
  }
  async getAllReviews(take = 100, skip = 0, dateFrom?: Date): Promise<WBReview[]> {
    const params: Record<string, string | number | boolean> = { isAnswered: false, take, skip, order: 'dateDesc' }
    if (dateFrom) params.dateFrom = Math.floor(dateFrom.getTime() / 1000)
    const [unanswered, answered] = await Promise.all([
      this.request<WBReviewsResponse>('/api/v1/feedbacks', { ...params, isAnswered: false }),
      this.request<WBReviewsResponse>('/api/v1/feedbacks', { ...params, isAnswered: true })
    ])
    return [...(unanswered.data?.feedbacks ?? []), ...(answered.data?.feedbacks ?? [])]
  }
  async sendResponse(feedbackId: string, text: string): Promise<void> {
    const response = await fetch(`${WB_API_BASE}/api/v1/feedbacks`, { method: 'PATCH', headers: { Authorization: this.apiKey, 'Content-Type': 'application/json' }, body: JSON.stringify({ id: feedbackId, text }) })
    if (!response.ok) throw new Error(`WB API error ${response.status}: ${await response.text()}`)
  }
  async getUnansweredCount(): Promise<number> {
    const data = await this.request<WBReviewsResponse>('/api/v1/feedbacks', { isAnswered: false, take: 1, skip: 0 })
    return data.data?.countUnanswered ?? 0
  }
}
