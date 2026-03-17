'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card } from '@/components/ui/Card'

interface DataPoint {
  date: string
  wpm: number
}

interface ProgressChartProps {
  data: DataPoint[]
}

export function ProgressChart({ data }: ProgressChartProps) {
  if (data.length === 0) {
    return (
      <Card className="p-6 flex flex-col items-center justify-center h-52 gap-2">
        <p className="text-slate-500 text-sm">No sessions yet</p>
        <p className="text-slate-600 text-xs">Complete a practice session to see your progress</p>
      </Card>
    )
  }

  return (
    <Card className="p-6">
      <p className="text-sm font-medium text-slate-300 mb-4">Reading speed over time</p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#22222f" />
          <XAxis
            dataKey="date"
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            unit=" wpm"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#12121a',
              border: '1px solid #22222f',
              borderRadius: '12px',
              color: '#e2e8f0',
              fontSize: 12,
            }}
            labelStyle={{ color: '#94a3b8' }}
          />
          <Line
            type="monotone"
            dataKey="wpm"
            stroke="#6172f3"
            strokeWidth={2.5}
            dot={{ fill: '#6172f3', strokeWidth: 0, r: 3 }}
            activeDot={{ r: 5, fill: '#8098f9' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  )
}
