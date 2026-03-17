import Link from 'next/link'
import { Zap, Mic, BarChart2, Target, BookOpen, Music } from 'lucide-react'

const features = [
  {
    icon: BookOpen,
    title: 'Word Streaming',
    description: 'Words flash one at a time at your chosen speed — from 100 to 1000 WPM.',
    color: 'text-brand-400',
    bg: 'bg-brand-600/10',
  },
  {
    icon: Mic,
    title: 'Speech Recording',
    description: 'Record yourself while reading. Get instant feedback on WPM and pauses.',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
  },
  {
    icon: Music,
    title: 'Focus Mode',
    description: 'Ambient sounds (rain, café, forest) help you enter deep focus.',
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
  },
  {
    icon: Target,
    title: 'Theme Packs',
    description: 'Corporate, Daily Life, and Tech vocabulary packs included.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
  },
  {
    icon: BarChart2,
    title: 'Dashboard',
    description: 'Track sessions, reading speed trends, and practice time.',
    color: 'text-orange-400',
    bg: 'bg-orange-500/10',
  },
  {
    icon: Zap,
    title: 'Streak System',
    description: 'Build a daily practice habit with streak tracking.',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
  },
]

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-dark-900 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-4 md:px-8 py-4 md:py-5
        border-b border-dark-700 max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-base md:text-lg">WordFlow AI</span>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <Link
            href="/auth/login"
            className="text-sm text-slate-400 hover:text-white transition px-3 md:px-4 py-2 rounded-xl hover:bg-dark-700"
          >
            Sign in
          </Link>
          <Link
            href="/auth/signup"
            className="text-sm bg-brand-600 hover:bg-brand-500 text-white px-3 md:px-4 py-2 rounded-xl transition font-medium"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 md:px-8 pt-14 md:pt-24 pb-12 md:pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
          bg-brand-600/15 border border-brand-600/25 text-brand-400 text-xs font-medium mb-6 md:mb-8">
          <Zap className="w-3 h-3" />
          Communication Training Platform
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight leading-tight text-balance mb-4 md:mb-6">
          Read faster.{' '}
          <span className="bg-gradient-to-r from-brand-400 to-purple-400 bg-clip-text text-transparent">
            Speak better.
          </span>
          <br className="hidden md:block" />
          {' '}Communicate with confidence.
        </h1>

        <p className="text-base md:text-xl text-slate-400 max-w-2xl mx-auto mb-8 md:mb-10 text-balance">
          AI-powered sessions for reading speed, speaking fluency, and vocabulary — built for daily practice on any device.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4">
          <Link
            href="/auth/signup"
            className="w-full sm:w-auto px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white
              rounded-xl font-semibold text-base transition shadow-xl shadow-brand-900/40 text-center"
          >
            Start training free
          </Link>
          <Link
            href="/auth/login"
            className="w-full sm:w-auto px-8 py-4 bg-dark-700 hover:bg-dark-600 text-slate-200
              rounded-xl font-semibold text-base transition border border-dark-500 text-center"
          >
            Sign in
          </Link>
        </div>

        {/* Stats row */}
        <div className="flex items-center justify-center gap-8 md:gap-12 mt-12 md:mt-16 pt-8 md:pt-12 border-t border-dark-700">
          {[
            { label: 'Avg WPM gain', value: '3×' },
            { label: 'Words in library', value: '100+' },
            { label: 'Theme packs', value: '3' },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-white">{value}</p>
              <p className="text-xs md:text-sm text-slate-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 md:px-8 pb-16 md:pb-24">
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-3">Everything you need to level up</h2>
          <p className="text-slate-400 text-sm md:text-base">One platform. All the tools for communication mastery.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {features.map(({ icon: Icon, title, description, color, bg }) => (
            <div
              key={title}
              className="p-5 md:p-6 rounded-2xl bg-dark-800 border border-dark-700
                hover:border-dark-500 transition"
            >
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3 md:mb-4`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <h3 className="font-semibold text-white mb-1.5 md:mb-2">{title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-4 md:px-8 pb-16 md:pb-24 text-center">
        <div className="p-8 md:p-10 rounded-2xl bg-gradient-to-br from-brand-600/20 to-purple-600/10
          border border-brand-600/20">
          <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-3">Ready to start?</h2>
          <p className="text-slate-400 mb-6 md:mb-8 text-sm md:text-base">Free to use. No credit card required.</p>
          <Link
            href="/auth/signup"
            className="inline-block px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white
              rounded-xl font-semibold transition"
          >
            Create your account
          </Link>
        </div>
      </section>

      <footer className="border-t border-dark-700 py-6 md:py-8 text-center text-slate-500 text-xs md:text-sm">
        © 2025 WordFlow AI — Communication Training Platform
      </footer>
    </main>
  )
}
