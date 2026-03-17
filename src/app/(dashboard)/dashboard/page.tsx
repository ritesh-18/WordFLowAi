import { createClient } from '@/lib/supabase/server'
import { Header } from '@/components/layout/Header'
import { StatsCard } from '@/components/dashboard/StatsCard'
import { ProgressChart } from '@/components/dashboard/ProgressChart'
import { StreakDisplay } from '@/components/dashboard/StreakDisplay'
import { BarChart2, Clock, PlayCircle, Zap } from 'lucide-react'

async function getDashboardData(userId: string) {
  const supabase = createClient()

  const [sessionsRes, streakRes, metricsRes] = await Promise.all([
    supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('completed', true)
      .order('started_at', { ascending: false }),
    supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .single(),
    supabase
      .from('speech_metrics')
      .select('spoken_wpm, recorded_at')
      .eq('user_id', userId)
      .order('recorded_at', { ascending: true })
      .limit(30),
  ])

  const sessions = sessionsRes.data ?? []
  const streak   = streakRes.data ?? null
  const metrics  = metricsRes.data ?? []

  const totalSessions = sessions.length
  const avgWpm =
    sessions.length > 0
      ? Math.round(sessions.reduce((s, x) => s + (x.wpm ?? 0), 0) / sessions.length)
      : 0
  const totalMinutes = Math.round(
    sessions.reduce((s, x) => s + (x.duration_seconds ?? 0), 0) / 60
  )

  const wpmHistory = metrics
    .filter((m) => m.spoken_wpm)
    .map((m) => ({
      date: new Date(m.recorded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      wpm: m.spoken_wpm as number,
    }))

  return { totalSessions, avgWpm, totalMinutes, streak, wpmHistory, sessions }
}

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user!.id

  const { totalSessions, avgWpm, totalMinutes, streak, wpmHistory } =
    await getDashboardData(userId)

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Dashboard" subtitle="Your training overview" />

      <div className="p-4 md:p-8 space-y-4 md:space-y-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <StatsCard
            icon={PlayCircle}
            label="Sessions completed"
            value={totalSessions}
            color="text-brand-400"
          />
          <StatsCard
            icon={BarChart2}
            label="Average WPM"
            value={avgWpm}
            unit="wpm"
            color="text-green-400"
          />
          <StatsCard
            icon={Clock}
            label="Practice time"
            value={totalMinutes}
            unit="min"
            color="text-purple-400"
          />
          <StatsCard
            icon={Zap}
            label="Current streak"
            value={streak?.current_streak ?? 0}
            unit="days"
            color="text-yellow-400"
          />
        </div>

        {/* Chart + Streak */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ProgressChart data={wpmHistory} />
          </div>
          <div>
            <StreakDisplay streak={streak} />
          </div>
        </div>
      </div>
    </div>
  )
}
