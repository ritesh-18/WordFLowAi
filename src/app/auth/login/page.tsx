import Link from 'next/link'
import { Zap } from 'lucide-react'
import { AuthForm } from '@/components/auth/AuthForm'

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-dark-900 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-xl text-white">WordFlow AI</span>
        </Link>

        <div className="bg-dark-800 border border-dark-600 rounded-2xl p-8">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-white">Welcome back</h1>
            <p className="text-slate-400 text-sm mt-1">Sign in to continue your training</p>
          </div>

          <AuthForm mode="login" />

          <p className="text-center text-sm text-slate-400 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-brand-400 hover:text-brand-300 font-medium">
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
