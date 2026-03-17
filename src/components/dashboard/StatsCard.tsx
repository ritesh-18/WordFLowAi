import { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/Card'

interface StatsCardProps {
  icon: LucideIcon
  label: string
  value: string | number
  unit?: string
  trend?: { value: number; label: string }
  color?: string
}

export function StatsCard({ icon: Icon, label, value, unit, trend, color = 'text-brand-400' }: StatsCardProps) {
  return (
    <Card className="p-3 md:p-5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 truncate">{label}</p>
          <p className={`text-2xl md:text-3xl font-bold tabular-nums ${color}`}>
            {value}
            {unit && <span className="text-sm md:text-base font-normal text-slate-500 ml-1">{unit}</span>}
          </p>
          {trend && (
            <p className={`text-xs mt-1 ${trend.value >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
            </p>
          )}
        </div>
        <div className={`p-2 md:p-2.5 rounded-xl bg-dark-700 ${color} shrink-0`}>
          <Icon className="w-4 h-4 md:w-5 md:h-5" strokeWidth={1.8} />
        </div>
      </div>
    </Card>
  )
}
