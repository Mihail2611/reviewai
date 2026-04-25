"use client"
import { Star, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'
import type { Review } from '@/types'
interface ReviewCardProps { review: Review; isSelected: boolean; onClick: () => void }
const statusConfig = { new: { label: 'Новый', icon: AlertCircle, className: 'bg-amber-50 text-amber-600 border-amber-200' }, pending: { label: 'В работе', icon: Clock, className: 'bg-blue-50 text-blue-600 border-blue-200' }, answered: { label: 'Отвечен', icon: CheckCircle2, className: 'bg-emerald-50 text-emerald-600 border-emerald-200' }, ignored: { label: 'Игнор', icon: AlertCircle, className: 'bg-gray-50 text-gray-400 border-gray-200' } } as const
const platformColors = { wildberries: 'bg-purple-500', ozon: 'bg-blue-500' }
export function ReviewCard({ review, isSelected, onClick }: ReviewCardProps) {
  const status = statusConfig[review.status as keyof typeof statusConfig] ?? statusConfig.new
  const StatusIcon = status.icon
  return (
    <button onClick={onClick} className={cn('w-full p-4 bg-card rounded-xl border text-left transition-all duration-200 hover:shadow-md', isSelected ? 'border-primary shadow-md ring-2 ring-primary/20' : 'border-border hover:border-primary/30')}>
      <div className="flex gap-3">
        <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-secondary shrink-0">{review.product_image ? <Image src={review.product_image} alt={review.product_name} fill className="object-cover" unoptimized /> : <div className="w-full h-full bg-secondary" />}<div className={cn('absolute bottom-0 right-0 w-4 h-4 rounded-tl-md', platformColors[review.platform])} /></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1"><h3 className="font-medium text-sm text-foreground truncate">{review.product_name}</h3><div className={cn('shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border', status.className)}><StatusIcon className="w-3 h-3" />{status.label}</div></div>
          <div className="flex items-center gap-0.5 mb-2">{Array.from({ length: 5 }).map((_, i) => (<Star key={i} className={cn('w-3.5 h-3.5', i < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted')} />))}<span className="ml-1 text-xs text-muted-foreground">{review.rating}.0</span></div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{review.text ?? '(без текста)'}</p>
          <div className="flex items-center justify-between text-xs text-muted-foreground"><span>{review.author ?? 'Покупатель'}</span><span>{review.reviewed_at ? new Date(review.reviewed_at).toLocaleDateString('ru-RU') : '—'}</span></div>
        </div>
      </div>
    </button>
  )
}
