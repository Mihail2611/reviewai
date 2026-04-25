"use client"
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { reviewsApi } from '@/lib/api-client'
import { Sidebar } from '@/components/sidebar'
import { ReviewList } from '@/components/review-list'
import { ResponsePanel } from '@/components/response-panel'
import { StoresContent } from '@/components/stores-content'
import { SettingsContent } from '@/components/settings-content'
import type { Review } from '@/types'
import { Loader2 } from 'lucide-react'
export default function ReviewsPage() {
  const { isLoggedIn, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [activeMenuItem, setActiveMenuItem] = useState('reviews')
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [total, setTotal] = useState(0)
  const [filter, setFilter] = useState('all')
  const [marketplace, setMarketplace] = useState('all')
  const [search, setSearch] = useState('')
  const [isLoadingReviews, setIsLoadingReviews] = useState(false)
  const [page, setPage] = useState(1)
  useEffect(() => { if (!authLoading && !isLoggedIn) { router.replace('/auth') } }, [authLoading, isLoggedIn, router])
  const loadReviews = useCallback(async (resetPage = false) => {
    if (!isLoggedIn) return
    const currentPage = resetPage ? 1 : page
    setIsLoadingReviews(true)
    try {
      const data = await reviewsApi.list({ platform: marketplace === 'all' ? undefined : marketplace as 'wildberries' | 'ozon', status: filter === 'all' ? undefined : filter as 'new' | 'pending' | 'answered', search: search || undefined, page: currentPage, limit: 20 })
      if (resetPage || currentPage === 1) { setReviews(data.reviews); if (data.reviews.length > 0 && !selectedReview) { setSelectedReview(data.reviews[0]) } }
      else { setReviews(prev => [...prev, ...data.reviews]) }
      setTotal(data.total)
    } catch (err) { console.error('Failed to load reviews:', err) }
    finally { setIsLoadingReviews(false) }
  }, [isLoggedIn, marketplace, filter, search, page, selectedReview])
  useEffect(() => { if (isLoggedIn && activeMenuItem === 'reviews') { loadReviews(true) } }, [isLoggedIn, activeMenuItem, marketplace, filter, search])
  const handleReviewUpdate = (updated: Review) => { setReviews(prev => prev.map(r => r.id === updated.id ? updated : r)); setSelectedReview(updated) }
  if (authLoading) return <div className="h-screen flex items-center justify-center bg-background"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
  if (!isLoggedIn) return null
  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar activeItem={activeMenuItem} onItemClick={setActiveMenuItem} />
      {activeMenuItem === 'stores' ? <StoresContent /> : activeMenuItem === 'settings' ? <SettingsContent /> : (
        <>
          <ReviewList reviews={reviews} total={total} selectedReview={selectedReview} onSelectReview={setSelectedReview}
            filter={filter} onFilterChange={f => { setFilter(f); setPage(1) }}
            marketplace={marketplace} onMarketplaceChange={m => { setMarketplace(m); setPage(1) }}
            search={search} onSearchChange={s => { setSearch(s); setPage(1) }}
            isLoading={isLoadingReviews} onLoadMore={() => { setPage(p => p + 1); loadReviews(false) }} hasMore={reviews.length < total} />
          <ResponsePanel review={selectedReview} onReviewUpdate={handleReviewUpdate} />
        </>
      )}
    </div>
  )
}
