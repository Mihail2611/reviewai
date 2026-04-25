"use client"
import { Search, Filter, ChevronDown, Loader2, RefreshCw } from 'lucide-react'
import { ReviewCard } from './review-card'
import { Button } from '@/components/ui/button'
import type { Review } from '@/types'
interface ReviewListProps { reviews: Review[]; total: number; selectedReview: Review | null; onSelectReview: (r: Review) => void; filter: string; onFilterChange: (f: string) => void; marketplace: string; onMarketplaceChange: (m: string) => void; search: string; onSearchChange: (s: string) => void; isLoading: boolean; onLoadMore: () => void; hasMore: boolean }
const filters = [{ id: 'all', label: 'Все' }, { id: 'new', label: 'Новые' }, { id: 'pending', label: 'В работе' }, { id: 'answered', label: 'Отвечены' }]
const marketplaces = [{ id: 'all', label: 'Все' }, { id: 'wildberries', label: 'WB', color: 'bg-violet-500' }, { id: 'ozon', label: 'Ozon', color: 'bg-blue-500' }]
export function ReviewList({ reviews, total, selectedReview, onSelectReview, filter, onFilterChange, marketplace, onMarketplaceChange, search, onSearchChange, isLoading, onLoadMore, hasMore }: ReviewListProps) {
  const newCount = reviews.filter(r => r.status === 'new').length
  return (
    <div className="flex-1 flex flex-col min-w-[320px] max-w-md bg-card border-r border-border">
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-1 p-1 bg-secondary rounded-lg mb-4">{marketplaces.map(mp => (<button key={mp.id} onClick={() => onMarketplaceChange(mp.id)} className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${marketplace === mp.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>{mp.color && <span className={`w-2 h-2 rounded-full ${mp.color}`} />}{mp.label}</button>))}</div>
        <div className="flex items-center justify-between mb-4"><div><h1 className="text-xl font-semibold">Отзывы</h1><p className="text-sm text-muted-foreground">{isLoading ? 'Загрузка...' : `${total} всего, ${newCount} новых`}</p></div><Button variant="outline" size="sm" className="gap-2" disabled={isLoading}>{isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Filter className="w-4 h-4" />}Фильтры<ChevronDown className="w-3 h-3" /></Button></div>
        <div className="relative mb-4"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><input type="text" value={search} onChange={e => onSearchChange(e.target.value)} placeholder="Поиск по отзывам..." className="w-full h-10 pl-10 pr-4 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" /></div>
        <div className="flex gap-1">{filters.map(f => (<button key={f.id} onClick={() => onFilterChange(f.id)} className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'}`}>{f.label}{f.id === 'new' && newCount > 0 && <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${filter === f.id ? 'bg-primary-foreground/20' : 'bg-amber-100 text-amber-700'}`}>{newCount}</span>}</button>))}</div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {reviews.map(review => (<ReviewCard key={review.id} review={review} isSelected={selectedReview?.id === review.id} onClick={() => onSelectReview(review)} />))}
        {reviews.length === 0 && !isLoading && (<div className="flex flex-col items-center justify-center py-12 text-center"><div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4"><Search className="w-8 h-8 text-muted-foreground" /></div><p className="text-muted-foreground text-sm">Отзывы не найдены</p><p className="text-xs text-muted-foreground mt-1">Добавьте магазин и выполните синхронизацию</p></div>)}
        {isLoading && reviews.length === 0 && (<div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>)}
        {hasMore && (<button onClick={onLoadMore} disabled={isLoading} className="w-full py-3 text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-2">{isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}Загрузить ещё</button>)}
      </div>
    </div>
  )
}
