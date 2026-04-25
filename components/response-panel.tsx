"use client"
import { useState } from 'react'
import { Star, Sparkles, Send, Copy, RotateCcw, ExternalLink, User, Calendar, ShoppingBag, Loader2, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { aiApi, reviewsApi } from '@/lib/api-client'
import type { Review } from '@/types'
import Image from 'next/image'
import { toast } from 'sonner'
interface ResponsePanelProps { review: Review | null; onReviewUpdate?: (updated: Review) => void }
const platformLabels = { wildberries: 'Wildberries', ozon: 'Ozon' }
const toneOptions = [{ id: 'friendly', label: 'Дружелюбный' }, { id: 'apologetic', label: 'Извиняющийся' }, { id: 'formal', label: 'Официальный' }] as const
export function ResponsePanel({ review, onReviewUpdate }: ResponsePanelProps) {
  const [response, setResponse] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [copied, setCopied] = useState(false)
  const [selectedTone, setSelectedTone] = useState<'friendly' | 'apologetic' | 'formal'>('friendly')
  const handleAiGenerate = async () => { if (!review) return; setIsGenerating(true); try { const result = await aiApi.generate({ review_id: review.id, tone: selectedTone }); setResponse(result.text); toast.success('Ответ сгенерирован') } catch (err) { toast.error(err instanceof Error ? err.message : 'Ошибка') } finally { setIsGenerating(false) } }
  const handleCopy = async () => { if (!response) return; await navigator.clipboard.writeText(response); setCopied(true); setTimeout(() => setCopied(false), 2000); toast.success('Скопировано') }
  const handleSend = async (sendToMarketplace: boolean) => { if (!review || !response.trim()) { toast.error('Напишите ответ'); return }; setIsSending(true); try { const updated = await reviewsApi.respond(review.id, { response_text: response, send_to_marketplace: sendToMarketplace }); onReviewUpdate?.(updated); toast.success(sendToMarketplace ? 'Отправлен на маркетплейс' : 'Сохранён'); setResponse('') } catch (err) { toast.error(err instanceof Error ? err.message : 'Ошибка') } finally { setIsSending(false) } }
  if (!review) return (<div className="flex-1 flex flex-col items-center justify-center bg-background p-8"><div className="w-20 h-20 rounded-full bg-secondary flex items-center justify-center mb-4"><ShoppingBag className="w-10 h-10 text-muted-foreground" /></div><h3 className="text-lg font-medium mb-2">Выберите отзыв</h3><p className="text-sm text-muted-foreground text-center max-w-[280px]">Выберите отзыв из списка слева</p></div>)
  return (
    <div className="flex-1 flex flex-col bg-background min-w-[400px]">
      <div className="p-4 border-b border-border bg-card"><div className="flex items-center justify-between mb-3"><div className="flex items-center gap-2"><span className={cn('px-2 py-1 rounded-md text-xs font-medium text-white', review.platform === 'wildberries' ? 'bg-purple-500' : 'bg-blue-500')}>{platformLabels[review.platform]}</span><span className="text-sm text-muted-foreground">ID: {review.external_id}</span></div><Button variant="ghost" size="sm" className="gap-2 text-muted-foreground"><ExternalLink className="w-4 h-4" />Открыть</Button></div>
      <div className="flex gap-4"><div className="relative w-20 h-20 rounded-lg overflow-hidden bg-secondary shrink-0">{review.product_image ? <Image src={review.product_image} alt={review.product_name} fill className="object-cover" unoptimized /> : <div className="w-full h-full flex items-center justify-center"><ShoppingBag className="w-8 h-8 text-muted-foreground" /></div>}</div><div className="flex-1"><h2 className="font-semibold mb-1 line-clamp-2">{review.product_name}</h2><div className="flex items-center gap-0.5 mb-2">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={cn('w-4 h-4', i < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-muted text-muted')} />)}<span className="ml-1 text-sm font-medium">{review.rating}.0</span></div><div className="flex items-center gap-4 text-sm text-muted-foreground"><span className="flex items-center gap-1"><User className="w-3.5 h-3.5" />{review.author ?? 'Покупатель'}</span><span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{review.reviewed_at ? new Date(review.reviewed_at).toLocaleDateString('ru-RU') : '—'}</span></div></div></div></div>
      <div className="p-4 border-b border-border"><h3 className="text-sm font-medium mb-2">Текст отзыва</h3><div className="p-4 bg-secondary/50 rounded-lg"><p className="text-sm leading-relaxed">{review.text ?? '(без текста)'}</p></div></div>
      {review.status === 'answered' && review.response_text && (<div className="p-4 border-b border-border bg-emerald-50/50"><h3 className="text-sm font-medium text-emerald-700 mb-2 flex items-center gap-1.5"><Check className="w-4 h-4" />Ответ отправлен</h3><p className="text-sm">{review.response_text}</p></div>)}
      <div className="flex-1 flex flex-col p-4"><div className="flex items-center justify-between mb-3"><h3 className="text-sm font-medium">Ваш ответ</h3><div className="flex gap-2"><Button variant="outline" size="sm" className="gap-2" onClick={() => setResponse('')}><RotateCcw className="w-3.5 h-3.5" />Очистить</Button><Button variant="outline" size="sm" className="gap-2" onClick={handleCopy} disabled={!response}>{copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}{copied ? 'Скопировано' : 'Копировать'}</Button></div></div>
      <div className="flex gap-2 mb-3">{toneOptions.map(t => (<button key={t.id} onClick={() => setSelectedTone(t.id)} className={cn('px-3 py-1.5 text-xs font-medium rounded-full border transition-colors', selectedTone === t.id ? 'bg-primary text-primary-foreground border-primary' : 'bg-secondary text-secondary-foreground border-transparent')}>{t.label}</button>))}</div>
      <div className="flex-1 relative"><textarea value={response} onChange={e => setResponse(e.target.value)} placeholder="Напишите ответ или сгенерируйте с AI..." className="w-full h-full min-h-[160px] p-4 rounded-lg border border-input bg-card text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring" /></div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border gap-2"><Button variant="outline" className="gap-2" onClick={handleAiGenerate} disabled={isGenerating || isSending}>{isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}{isGenerating ? 'Генерация...' : 'AI ответ'}</Button><div className="flex gap-2"><Button variant="outline" className="gap-2" onClick={() => handleSend(false)} disabled={!response.trim() || isSending}>Сохранить</Button><Button className="gap-2" onClick={() => handleSend(true)} disabled={!response.trim() || isSending}>{isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}Отправить</Button></div></div></div>
    </div>
  )
}
