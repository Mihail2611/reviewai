"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/auth-context'
import { Eye, EyeOff, Loader2, Sparkles } from 'lucide-react'
type Mode = 'login' | 'register'
export default function AuthPage() {
  const { login, register } = useAuth()
  const router = useRouter()
  const [mode, setMode] = useState<Mode>('login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setIsLoading(true)
    try {
      if (mode === 'login') { await login(email, password) }
      else {
        if (!name.trim()) { setError('Введите ваше имя'); setIsLoading(false); return }
        if (password.length < 8) { setError('Пароль должен содержать минимум 8 символов'); setIsLoading(false); return }
        await register(email, password, name)
      }
      router.push('/')
    } catch (err) { setError(err instanceof Error ? err.message : 'Произошла ошибка') }
    finally { setIsLoading(false) }
  }
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">ReviewAI</span>
        </div>
        <div className="bg-card rounded-2xl border border-border p-8">
          <div className="flex gap-1 p-1 bg-secondary rounded-xl mb-6">
            {(['login', 'register'] as Mode[]).map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${mode === m ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
                {m === 'login' ? 'Войти' : 'Регистрация'}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-medium mb-1.5">Ваше имя</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Иван Петров" required
                  className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Пароль</label>
              <div className="relative">
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'Минимум 8 символов' : '••••••••'} required
                  className="w-full h-10 px-3 pr-10 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm text-destructive">{error}</div>}
            <button type="submit" disabled={isLoading}
              className="w-full h-10 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {mode === 'login' ? 'Войти' : 'Создать аккаунт'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
