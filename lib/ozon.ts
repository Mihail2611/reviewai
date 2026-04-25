import type { OzonReview, OzonReviewsResponse } from '@/types'
const OZON_API_BASE = 'https://api-seller.ozon.ru'
export class OzonClient {
  private clientId: string
  private apiKey: string
  constructor(clientId: string, apiKey: string) { this.clientId = clientId; this.apiKey = apiKey }
  private async request<T>(path: string, body?: Record<string, unknown>): Promise<T> {
    const response = await fetch(`${OZON_API_BASE}${path}`, { method: 'POST', headers: { 'Client-Id': this.clientId, 'Api-Key': this.apiKey, 'Content-Type': 'application/json' }, body: JSON.stringify(body ?? {}) })
    if (!response.ok) { const text = await response.text(); throw new Error(`Ozon API error ${response.status}: ${text}`) }
    return response.json()
  }
  async getReviews(options: { page?: number; pageSize?: number } = {}): Promise<OzonReview[]> {
    const { page = 1, pageSize = 100 } = options
    const data = await this.request<OzonReviewsResponse>('/v1/review/list', { page, page_size: pageSize, sort_dir: 'DESC', with_content: true })
    return data.result?.reviews ?? []
  }
  async getReviewsCount(): Promise<number> {
    const data = await this.request<OzonReviewsResponse>('/v1/review/list', { page: 1, page_size: 1 })
    return data.result?.total ?? 0
  }
  async sendResponse(reviewId: string, text: string): Promise<void> {
    await this.request('/v1/review/comment/create', { review_id: reviewId, text })
  }
}
