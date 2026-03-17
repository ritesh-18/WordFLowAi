'use client'

import type { ThemeSlug } from '@/types'
import { THEME_META } from '@/lib/words/themes'

interface ThemePickerProps {
  selected: ThemeSlug
  onChange: (theme: ThemeSlug) => void
  disabled?: boolean
}

const themes = Object.entries(THEME_META) as [ThemeSlug, (typeof THEME_META)[ThemeSlug]][]

export function ThemePicker({ selected, onChange, disabled }: ThemePickerProps) {
  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium text-slate-300">Theme pack</span>
      <div className="grid grid-cols-3 gap-3">
        {themes.map(([slug, meta]) => (
          <button
            key={slug}
            onClick={() => onChange(slug)}
            disabled={disabled}
            style={{ borderColor: selected === slug ? meta.color : undefined }}
            className={`
              flex flex-col items-center gap-2 p-4 rounded-xl border transition
              disabled:opacity-40 disabled:cursor-not-allowed
              ${selected === slug
                ? 'bg-dark-700'
                : 'bg-dark-800 border-dark-600 hover:bg-dark-700 hover:border-dark-500'}
            `}
          >
            <span className="text-2xl">{meta.icon}</span>
            <span
              className="text-xs font-medium"
              style={{ color: selected === slug ? meta.color : '#94a3b8' }}
            >
              {meta.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
