'use client'

import { useState, useCallback, useEffect } from 'react'
import { Play, Pause, Square } from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { WordStreamer } from '@/components/word-streamer/WordStreamer'
import { SpeedControl } from '@/components/word-streamer/SpeedControl'
import { ThemePicker } from '@/components/word-streamer/ThemePicker'
import { SpeechRecorder } from '@/components/speech/SpeechRecorder'
import { FocusMode } from '@/components/focus/FocusMode'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useWordStreamer } from '@/hooks/useWordStreamer'
import { createClient } from '@/lib/supabase/client'
import { FALLBACK_WORDS } from '@/lib/words/themes'
import type { ThemeSlug, AmbientSound } from '@/types'

export default function PracticePage() {
  const [theme, setTheme]               = useState<ThemeSlug>('tech')
  const [words, setWords]               = useState<string[]>(FALLBACK_WORDS.tech)
  const [loadingWords, setLoadingWords] = useState(false)
  const [focusEnabled, setFocusEnabled] = useState(false)
  const [ambientSound, setAmbientSound] = useState<AmbientSound>('none')
  const [sessionId, setSessionId]       = useState<string | null>(null)
  const [sessionStart, setSessionStart] = useState<number>(0)

  const handleFinish = useCallback(
    async (durationMs: number) => {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      const wpm = Math.round((words.length / durationMs) * 60_000)

      if (sessionId) {
        await supabase
          .from('sessions')
          .update({
            completed: true,
            wpm,
            words_practiced: words.length,
            duration_seconds: Math.round(durationMs / 1000),
            focus_mode_used: focusEnabled,
            ended_at: new Date().toISOString(),
          })
          .eq('id', sessionId)
      }
    },
    [words.length, sessionId, focusEnabled]
  )

  const { state, play, pause, stop, changeWpm } = useWordStreamer({
    words,
    initialWpm: 300,
    onFinish: handleFinish,
  })

  // Fetch words from Supabase when theme changes
  useEffect(() => {
    const fetchWords = async () => {
      setLoadingWords(true)
      const supabase = createClient()
      const { data: pack } = await supabase
        .from('theme_packs')
        .select('id')
        .eq('slug', theme)
        .single()

      if (pack) {
        const { data: wordRows } = await supabase
          .from('words')
          .select('word')
          .eq('theme_id', pack.id)
          .order('difficulty')
        if (wordRows && wordRows.length > 0) {
          setWords(wordRows.map((r) => r.word))
          setLoadingWords(false)
          return
        }
      }
      // Fallback to local list
      setWords(FALLBACK_WORDS[theme])
      setLoadingWords(false)
    }
    fetchWords()
  }, [theme])

  const handlePlay = async () => {
    // Create session record in Supabase
    if (state.status === 'idle' || state.status === 'finished') {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const { data: pack } = await supabase
          .from('theme_packs')
          .select('id')
          .eq('slug', theme)
          .single()

        const { data } = await supabase
          .from('sessions')
          .insert({
            user_id: session.user.id,
            theme_id: pack?.id ?? null,
            focus_mode_used: focusEnabled,
          })
          .select('id')
          .single()

        if (data) setSessionId(data.id)
        setSessionStart(Date.now())
      }
    }
    play()
  }

  const isPlaying = state.status === 'playing'
  const isPaused  = state.status === 'paused'

  return (
    <div className={`flex flex-col flex-1 overflow-auto transition-all duration-500 ${focusEnabled ? 'bg-dark-900' : ''}`}>
      <Header title="Practice" subtitle="Word streaming session" />

      <div className={`flex flex-col lg:flex-row gap-4 md:gap-6 p-4 md:p-8 ${focusEnabled ? 'opacity-95' : ''}`}>
        {/* Main streamer panel */}
        <div className="flex-1 flex flex-col gap-4 md:gap-5">
          <Card className="p-4 md:p-6">
            <WordStreamer state={state} />

            {/* Playback controls */}
            <div className="flex items-center justify-center gap-3 mt-6">
              {!isPlaying && (
                <Button onClick={handlePlay} size="lg" disabled={loadingWords}>
                  <Play className="w-5 h-5" />
                  {state.status === 'finished' ? 'Restart' : 'Play'}
                </Button>
              )}
              {isPlaying && (
                <Button onClick={pause} size="lg" variant="secondary">
                  <Pause className="w-5 h-5" />
                  Pause
                </Button>
              )}
              {(isPlaying || isPaused) && (
                <Button onClick={stop} variant="ghost" size="lg">
                  <Square className="w-5 h-5" />
                  Stop
                </Button>
              )}
            </div>
          </Card>

          {/* Speech recorder */}
          <Card className="p-4 md:p-6">
            <SpeechRecorder />
          </Card>
        </div>

        {/* Settings panel */}
        <div className="w-full lg:w-80 flex flex-col gap-3 md:gap-4">
          <Card className="p-4 md:p-5">
            <SpeedControl
              wpm={state.wpm}
              onChange={changeWpm}
              disabled={isPlaying}
            />
          </Card>

          <Card className="p-4 md:p-5">
            <ThemePicker
              selected={theme}
              onChange={(t) => { stop(); setTheme(t) }}
              disabled={isPlaying}
            />
          </Card>

          <Card className="p-4 md:p-5">
            <FocusMode
              enabled={focusEnabled}
              sound={ambientSound}
              onToggle={setFocusEnabled}
              onSoundChange={setAmbientSound}
            />
          </Card>
        </div>
      </div>

      {/* Focus mode overlay */}
      {focusEnabled && (
        <div className="fixed inset-0 bg-dark-900/60 pointer-events-none z-0" />
      )}
    </div>
  )
}
