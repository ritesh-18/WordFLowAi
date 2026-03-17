'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  PlayCircle,
  Settings,
  Zap,
  LogOut,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const navLinks = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/practice',  label: 'Practice',  icon: PlayCircle },
  { href: '/settings',  label: 'Settings',  icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const router   = useRouter()

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <>
      {/* ── DESKTOP sidebar (md and above) ── */}
      <aside className="hidden md:flex flex-col w-64 min-h-screen bg-dark-900 border-r border-dark-700 px-4 py-6 shrink-0">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2.5 px-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="text-white font-semibold text-lg tracking-tight">WordFlow AI</span>
        </Link>

        {/* Nav */}
        <nav className="flex-1 space-y-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + '/')
            return (
              <Link
                key={href}
                href={href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-colors duration-150
                  ${active
                    ? 'bg-brand-600/15 text-brand-400 border border-brand-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-dark-700'}
                `}
              >
                <Icon className="w-5 h-5" strokeWidth={1.8} />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
            text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-150"
        >
          <LogOut className="w-4 h-4" strokeWidth={1.8} />
          Sign out
        </button>
      </aside>

      {/* ── MOBILE bottom tab bar ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50
        bg-dark-900/95 backdrop-blur-md border-t border-dark-700
        flex items-center justify-around px-2 safe-area-pb"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        {navLinks.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={`
                flex flex-col items-center gap-1 px-4 py-3 rounded-xl
                text-xs font-medium transition-colors duration-150 min-w-[64px]
                ${active ? 'text-brand-400' : 'text-slate-500'}
              `}
            >
              <Icon
                className={`w-6 h-6 transition-colors ${active ? 'text-brand-400' : 'text-slate-500'}`}
                strokeWidth={active ? 2.2 : 1.8}
              />
              {label}
            </Link>
          )
        })}

        {/* Sign out on mobile */}
        <button
          onClick={handleSignOut}
          className="flex flex-col items-center gap-1 px-4 py-3 rounded-xl
            text-xs font-medium text-slate-500 min-w-[64px] transition-colors"
        >
          <LogOut className="w-6 h-6" strokeWidth={1.8} />
          Sign out
        </button>
      </nav>
    </>
  )
}
