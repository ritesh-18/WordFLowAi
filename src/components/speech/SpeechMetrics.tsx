'use client'

import type { SpeechAnalysisResult } from '@/types'
import { Card } from '@/components/ui/Card'
import { Mic, Clock, PauseCircle } from 'lucide-react'

interface SpeechMetricsProps {
  result: SpeechAnalysisResult
}

function msToSeconds(ms: number): string {
  return (ms / 1000).toFixed(1) + 's'
}

export function SpeechMetrics({ result }: SpeechMetricsProps) {
  const metrics = [
    {
      icon: Mic,
      label: 'Speaking WPM',
      value: result.spokenWpm,
      unit: 'wpm',
      color: 'text-brand-400',
    },
    {
      icon: PauseCircle,
      label: 'Pauses detected',
      value: result.pauseCount,
      unit: 'pauses',
      color: 'text-yellow-400',
    },
    {
      icon: Clock,
      label: 'Longest pause',
      value: msToSeconds(result.longestPauseMs),
      unit: '',
      color: 'text-orange-400',
    },
  ]

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-3">
        {metrics.map(({ icon: Icon, label, value, unit, color }) => (
          <Card key={label} className="p-3 text-center">
            <Icon className={`w-4 h-4 mx-auto mb-1 ${color}`} />
            <p className={`text-xl font-bold tabular-nums ${color}`}>
              {value}
              {unit && <span className="text-xs font-normal text-slate-500 ml-1">{unit}</span>}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">{label}</p>
          </Card>
        ))}
      </div>

      {result.transcription && (
        <div className="p-3 rounded-xl bg-dark-700 border border-dark-600">
          <p className="text-xs text-slate-500 mb-1 uppercase tracking-wider">Transcript</p>
          <p className="text-sm text-slate-300 leading-relaxed">{result.transcription}</p>
        </div>
      )}
    </div>
  )
}
