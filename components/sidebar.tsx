"use client"
import { MessageSquare, Settings, HelpCircle, LogOut, Store } from 'lucide-react'
import { cn } from '@/lib/utils'
interface SidebarProps { activeItem: string; onItemClick: (item: string) => void }
const menuItems = [{ id: 'reviews', icon: MessageSquare, label: 'Отзывы' }, { id: 'stores', icon: Store, label: 'Магазины' }]
const bottomItems = [{ id: 'help', icon: HelpCircle, label: 'Помощь' }, { id: 'settings', icon: Settings, label: 'Настройки' }, { id: 'logout', icon: LogOut, label: 'Выход' }]
export function Sidebar({ activeItem, onItemClick }: SidebarProps) {
  return (
    <aside className="w-16 bg-card border-r border-border flex flex-col items-center py-4 shrink-0">
      <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mb-8"><span className="text-primary-foreground font-bold text-lg">R</span></div>
      <nav className="flex-1 flex flex-col items-center gap-2">
        {menuItems.map(item => { const Icon = item.icon; const isActive = activeItem === item.id; return (<button key={item.id} onClick={() => onItemClick(item.id)} title={item.label} className={cn('w-10 h-10 rounded-lg flex items-center justify-center transition-all group relative', isActive ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-secondary hover:text-foreground')}><Icon className="w-5 h-5" /><span className="absolute left-14 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">{item.label}</span></button>) })}
      </nav>
      <div className="flex flex-col items-center gap-2 mt-auto">
        {bottomItems.map(item => { const Icon = item.icon; const isActive = activeItem === item.id; return (<button key={item.id} onClick={() => onItemClick(item.id)} title={item.label} className={cn('w-10 h-10 rounded-lg flex items-center justify-center transition-all group relative', isActive ? 'bg-primary text-primary-foreground shadow-md' : 'text-muted-foreground hover:bg-secondary hover:text-foreground')}><Icon className="w-5 h-5" /><span className="absolute left-14 bg-foreground text-background text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">{item.label}</span></button>) })}
      </div>
    </aside>
  )
}
