export interface Profile { id: string; email: string; name: string | null; phone: string | null; created_at: string; updated_at: string }
export type Platform = 'wildberries' | 'ozon'
export type ReviewStatus = 'new' | 'pending' | 'answered' | 'ignored'
export type ResponseMode = 'auto' | 'semi' | 'off'
export type Tone = 'friendly' | 'formal' | 'apologetic'
export interface Store { id: string; user_id: string; platform: Platform; name: string; wb_supplier_id?: string | null; wb_api_key?: string | null; ozon_client_id?: string | null; ozon_api_key?: string | null; is_active: boolean; last_sync_at: string | null; created_at: string; updated_at: string }
export interface Review { id: string; store_id: string; user_id: string; external_id: string; platform: Platform; product_name: string; product_id: string | null; product_image: string | null; rating: number; text: string | null; author: string | null; reviewed_at: string | null; status: ReviewStatus; response_text: string | null; responded_at: string | null; raw_data?: Record<string, unknown>; created_at: string; updated_at: string }
export interface AiPrompt { id: string; store_id: string; rating: number; mode: ResponseMode; custom_prompt: string | null; tone: Tone; created_at: string; updated_at: string }
export interface ApiResponse<T = unknown> { data?: T; error?: string; message?: string }
export interface RegisterRequest { email: string; password: string; name: string }
export interface LoginRequest { email: string; password: string }
export interface AuthResponse { user: Profile; access_token: string; refresh_token: string }
export interface CreateStoreRequest { platform: Platform; name: string; wb_supplier_id?: string; wb_api_key?: string; ozon_client_id?: string; ozon_api_key?: string }
export interface GetReviewsQuery { store_id?: string; platform?: Platform | 'all'; status?: ReviewStatus | 'all'; search?: string; page?: number; limit?: number }
export interface GetReviewsResponse { reviews: Review[]; total: number; page: number; limit: number; has_more: boolean }
export interface GenerateResponseRequest { review_id: string; tone?: Tone; custom_instructions?: string }
export interface GenerateResponseResponse { text: string; review_id: string }
export interface SyncRequest { store_id: string; days_back?: number }
export interface SyncResponse { synced: number; new_reviews: number; store_id: string }
export interface RespondToReviewRequest { response_text: string; send_to_marketplace?: boolean }
export interface WBReview { id: string; imtId: number; nmId: number; subjectId: number; userName: string; text: string; pros: string; cons: string; productValuation: number; createdDate: string; updatedDate: string; answer: { text: string; editable: boolean; createDate: string } | null; photoLinks: Array<{ fullSize: string; miniSize: string }>; subjectName: string; brand: string; color: string; supplierArticle: string }
export interface WBReviewsResponse { data: { countUnanswered: number; countArchive: number; feedbacks: WBReview[] }; error: boolean; errorText: string; additionalErrors: unknown[] }
export interface OzonReview { review_id: string; sku: number; product_name: string; created_at: string; reviewer_name: string; rating: number; text: string; comments: Array<{ text: string; created_at: string; from_name: string; from_type: string }>; media_files: string[]; response: { text: string; created_at: string } | null }
export interface OzonReviewsResponse { result: { reviews: OzonReview[]; total: number; page_count: number } }
