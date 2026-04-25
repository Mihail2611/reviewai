"use client"
import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { authApi } from '@/lib/api-client'
import type { Profile } from '@/types'
interface AuthContextValue { user: Profile | null; isLoading: boolean; isLoggedIn: boolean; login: (email: string, password: string) => Promise<void>; register: (email: string, password: string, name: string) => Promise<void>; logout: () => void; refreshUser: () => Promise<void> }
const AuthContext = createContext<AuthContextValue | null>(null)
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const refreshUser = useCallback(async () => {
    try { const profile = await authApi.me(); setUser(profile); localStorage.setItem('user', JSON.stringify(profile)) }
    catch { authApi.clearSession(); setUser(null) }
  }, [])
  useEffect(() => {
    const init = async () => { if (authApi.isLoggedIn()) { await refreshUser() } setIsLoading(false) }
    init()
  }, [refreshUser])
  const login = async (email: string, password: string) => { const data = await authApi.login({ email, password }); authApi.saveSession(data); setUser(data.user) }
  const register = async (email: string, password: string, name: string) => { const data = await authApi.register({ email, password, name }); authApi.saveSession(data); setUser(data.user) }
  const logout = () => { authApi.clearSession(); setUser(null) }
  return <AuthContext.Provider value={{ user, isLoading, isLoggedIn: !!user, login, register, logout, refreshUser }}>{children}</AuthContext.Provider>
}
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
