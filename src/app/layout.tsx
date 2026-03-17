import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'),
  title: 'WordFlow AI — Communication Training Platform',
  description:
    'Improve your reading speed, speaking fluency, and presentation skills with AI-powered coaching.',
  openGraph: {
    title: 'WordFlow AI',
    description: 'Communication training powered by AI',
    type: 'website',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#0a0a0f',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen bg-dark-900 font-sans antialiased">
        {children}
      </body>
    </html>
  )
}
