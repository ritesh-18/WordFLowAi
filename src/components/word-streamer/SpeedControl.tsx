'use client'

import { Minus, Plus } from 'lucide-react'

interface SpeedControlProps {
  wpm: number
  onChange: (wpm: number) => void
  disabled?: boolean
}

const PRESETS = [100, 200, 300, 400, 500, 700, 1000]

export function SpeedControl({ wpm, onChange, disabled }: SpeedControlProps) {
  const step = (delta: number) => {
    onChange(Math.min(1500, Math.max(50, wpm + delta)))
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-300">Reading speed</span>
        <span className="text-brand-400 font-semibold tabular-nums">
          {wpm} <span className="text-slate-500 font-normal text-xs">WPM</span>
        </span>
      </div>

      {/* Slider */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => step(-25)}
          disabled={disabled || wpm <= 50}
          className="p-1.5 rounded-lg bg-dark-700 border border-dark-500 text-slate-300
            hover:bg-dark-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>

        <input
          type="range"
          min={50}
          max={1500}
          step={25}
          value={wpm}
          disabled={disabled}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 h-1.5 accent-brand-500 cursor-pointer disabled:cursor-not-allowed"
        />

        <button
          onClick={() => step(25)}
          disabled={disabled || wpm >= 1500}
          className="p-1.5 rounded-lg bg-dark-700 border border-dark-500 text-slate-300
            hover:bg-dark-600 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            onClick={() => onChange(preset)}
            disabled={disabled}
            className={`
              px-3 py-1 rounded-lg text-xs font-medium transition
              disabled:opacity-40 disabled:cursor-not-allowed
              ${wpm === preset
                ? 'bg-brand-600 text-white border border-brand-500'
                : 'bg-dark-700 text-slate-400 border border-dark-600 hover:bg-dark-600'}
            `}
          >
            {preset}
          </button>
        ))}
      </div>
    </div>
  )
}
