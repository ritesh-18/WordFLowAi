import { Card } from '@/components/ui/Card'
import type { Streak } from '@/types'

interface StreakDisplayProps {
  streak: Streak | null
  loading?: boolean
}

export function StreakDisplay({ streak, loading }: StreakDisplayProps) {
  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-3">
          <div className="h-4 w-24 bg-dark-600 rounded" />
          <div className="h-10 w-16 bg-dark-600 rounded" />
        </div>
      </Card>
    )
  }

  const current = streak?.current_streak ?? 0
  const longest = streak?.longest_streak ?? 0
  const total   = streak?.total_days ?? 0

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-slate-300">Practice streak</p>
        <span className="text-2xl">🔥</span>
      </div>

      <div className="flex items-end gap-1.5 mb-4">
        <span className="text-5xl font-bold text-white tabular-nums">{current}</span>
        <span className="text-slate-400 mb-1.5 text-sm">day{current !== 1 ? 's' : ''}</span>
      </div>

      <div className="flex gap-4 pt-4 border-t border-dark-600">
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Longest</p>
          <p className="text-lg font-semibold text-slate-200 tabular-nums">{longest}d</p>
        </div>
        <div>
          <p className="text-xs text-slate-500 mb-0.5">Total days</p>
          <p className="text-lg font-semibold text-slate-200 tabular-nums">{total}</p>
        </div>
      </div>
    </Card>
  )
}
