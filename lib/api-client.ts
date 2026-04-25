import type { AuthResponse, RegisterRequest, LoginRequest, Store, CreateStoreRequest, Review, GetReviewsQuery, GetReviewsResponse, GenerateResponseRequest, GenerateResponseResponse, SyncRequest, SyncResponse, RespondToReviewRequest, Profile, ApiResponse } from '@/types'
function getToken(): string | null { if (typeof window === 'undefined') return null; return localStorage.getItem('access_token') }
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(options.headers as Record<string, string> ?? {}) }
  if (token) headers['Authorization'] = `Bearer ${token}`
  const res = await fetch(`/api${path}`, { ...options, headers })
  const json: ApiResponse<T> = await res.json()
  if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`)
  return json.data as T
}
export const authApi = {
  register: (d: RegisterRequest) => request<AuthResponse>('/auth/register', { method: 'POST', body: JSON.stringify(d) }),
  login: (d: LoginRequest) => request<AuthResponse>('/auth/login', { method: 'POST', body: JSON.stringify(d) }),
  me: () => request<Profile>('/auth/me'),
  updateProfile: (d: Partial<Profile>) => request<Profile>('/auth/me', { method: 'PATCH', body: JSON.stringify(d) }),
  saveSession: (d: AuthResponse) => { localStorage.setItem('access_token', d.access_token); localStorage.setItem('refresh_token', d.refresh_token); localStorage.setItem('user', JSON.stringify(d.user)) },
  clearSession: () => { localStorage.removeItem('access_token'); localStorage.removeItem('refresh_token'); localStorage.removeItem('user') },
  getUser: (): Profile | null => { if (typeof window === 'undefined') return null; const raw = localStorage.getItem('user'); return raw ? JSON.parse(raw) : null },
  isLoggedIn: (): boolean => !!getToken()
}
export const storesApi = {
  list: () => request<Store[]>('/stores'),
  create: (d: CreateStoreRequest) => request<Store>('/stores', { method: 'POST', body: JSON.stringify(d) }),
  delete: (id: string) => request<void>(`/stores/${id}`, { method: 'DELETE' }),
  update: (id: string, d: Partial<Store>) => request<Store>(`/stores/${id}`, { method: 'PATCH', body: JSON.stringify(d) })
}
export const reviewsApi = {
  list: (q: GetReviewsQuery = {}) => { const p = new URLSearchParams(); Object.entries(q).forEach(([k,v]) => { if (v !== undefined && v !== null && v !== '') p.set(k, String(v)) }); return request<GetReviewsResponse>(`/reviews${p.toString() ? '?'+p.toString() : ''}`) },
  sync: (d: SyncRequest) => request<SyncResponse>('/reviews/sync', { method: 'POST', body: JSON.stringify(d) }),
  respond: (id: string, d: RespondToReviewRequest) => request<Review>(`/reviews/${id}/respond`, { method: 'POST', body: JSON.stringify(d) })
}
export const aiApi = { generate: (d: GenerateResponseRequest) => request<GenerateResponseResponse>('/ai/generate', { method: 'POST', body: JSON.stringify(d) }) }
