'use client'

import { useState, useEffect } from 'react'
import { Header } from '@/components/layout/Header'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { SpeedControl } from '@/components/word-streamer/SpeedControl'
import { ThemePicker } from '@/components/word-streamer/ThemePicker'
import { createClient } from '@/lib/supabase/client'
import { useNotifications } from '@/hooks/useNotifications'
import type { ThemeSlug, AmbientSound, UserSettings } from '@/types'
import { Bell, BellOff, Save } from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings]   = useState<UserSettings | null>(null)
  const [loading, setLoading]     = useState(true)
  const [saving, setSaving]       = useState(false)
  const [saved, setSaved]         = useState(false)

  const [wpm, setWpm]                   = useState(300)
  const [theme, setTheme]               = useState<ThemeSlug>('tech')
  const [reminderEnabled, setReminder]  = useState(false)
  const [reminderTime, setReminderTime] = useState('09:00')

  const { permission, enable, disable } = useNotifications()

  useEffect(() => {
    const load = async () => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const { data } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', session.user.id)
        .single()

      if (data) {
        setSettings(data)
        setWpm(data.default_wpm)
        setTheme(data.preferred_theme)
        setReminder(data.reminder_enabled)
        setReminderTime(data.reminder_time?.slice(0, 5) ?? '09:00')
      }
      setLoading(false)
    }
    load()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) return

    await supabase.from('user_settings').upsert({
      user_id:          session.user.id,
      default_wpm:      wpm,
      preferred_theme:  theme,
      reminder_enabled: reminderEnabled,
      reminder_time:    reminderTime + ':00',
      updated_at:       new Date().toISOString(),
    })

    if (reminderEnabled) {
      await enable(reminderTime)
    } else {
      disable()
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex flex-col flex-1">
        <Header title="Settings" />
        <div className="p-8 animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-dark-800 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1 overflow-auto">
      <Header title="Settings" subtitle="Personalise your training experience" />

      <div className="p-4 md:p-8 max-w-2xl space-y-4 md:space-y-6">
        {/* Reading speed */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-slate-200 mb-5">Reading preferences</h2>
          <SpeedControl wpm={wpm} onChange={setWpm} />
        </Card>

        {/* Theme */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-slate-200 mb-5">Default theme pack</h2>
          <ThemePicker selected={theme} onChange={setTheme} />
        </Card>

        {/* Reminders */}
        <Card className="p-6">
          <h2 className="text-sm font-semibold text-slate-200 mb-1">Daily reminders</h2>
          <p className="text-xs text-slate-500 mb-5">
            Get a browser notification to keep your streak alive.
            {permission === 'denied' && (
              <span className="text-red-400 ml-1">Notifications blocked — allow in browser settings.</span>
            )}
          </p>

          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setReminder((v) => !v)}
              className={`
                relative w-11 h-6 rounded-full transition-colors duration-200
                ${reminderEnabled ? 'bg-brand-600' : 'bg-dark-600'}
              `}
            >
              <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${reminderEnabled ? 'left-6' : 'left-1'}`} />
            </button>
            <span className="text-sm text-slate-300 flex items-center gap-1.5">
              {reminderEnabled
                ? <><Bell className="w-4 h-4 text-brand-400" /> Enabled</>
                : <><BellOff className="w-4 h-4 text-slate-500" /> Disabled</>
              }
            </span>
          </div>

          {reminderEnabled && (
            <div>
              <label className="block text-xs text-slate-500 mb-1.5">Reminder time</label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="px-4 py-2 rounded-xl bg-dark-700 border border-dark-500 text-slate-200
                  focus:outline-none focus:ring-2 focus:ring-brand-500/40 text-sm"
              />
            </div>
          )}
        </Card>

        <Button onClick={handleSave} loading={saving} size="lg">
          <Save className="w-4 h-4" />
          {saved ? 'Saved!' : 'Save settings'}
        </Button>
      </div>
    </div>
  )
}
