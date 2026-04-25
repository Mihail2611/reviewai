import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/auth-context'
import { Toaster } from '@/components/ui/sonner'
const geist = Geist({ subsets: ['latin', 'cyrillic'] })
export const metadata: Metadata = { title: 'ReviewAI', description: 'Review management SaaS for WB & Ozon' }
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className="bg-background">
      <body className={`${geist.className} font-sans antialiased`}>
        <AuthProvider>{children}</AuthProvider>
        <Toaster />
      </body>
    </html>
  )
}
