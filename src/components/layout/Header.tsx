'use client'

import Link from 'next/link'
import { Bell, Zap } from 'lucide-react'

interface HeaderProps {
  title: string
  subtitle?: string
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <header className="flex items-center justify-between px-4 md:px-8 py-4 md:py-5
      border-b border-dark-700 bg-dark-900/60 backdrop-blur-sm sticky top-0 z-10"
    >
      {/* Mobile logo + title */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="md:hidden flex items-center justify-center
          w-8 h-8 rounded-lg bg-brand-600"
        >
          <Zap className="w-4 h-4 text-white" />
        </Link>
        <div>
          <h1 className="text-base md:text-xl font-semibold text-white leading-tight">{title}</h1>
          {subtitle && <p className="text-xs md:text-sm text-slate-400">{subtitle}</p>}
        </div>
      </div>

      <button
        aria-label="Notifications"
        className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-dark-700 transition-colors"
      >
        <Bell className="w-5 h-5" strokeWidth={1.8} />
      </button>
    </header>
  )
}
