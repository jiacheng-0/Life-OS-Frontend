import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/components/SessionProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Life OS MVP - Personalized Voice Coach',
  description: 'A web app that speaks with you, understands your life goals, optimizes your calendar, and remembers context.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
