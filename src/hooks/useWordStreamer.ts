'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import type { StreamerState, StreamerStatus } from '@/types'
import { wpmToIntervalMs } from '@/lib/words/themes'

interface UseWordStreamerOptions {
  words: string[]
  initialWpm?: number
  onFinish?: (durationMs: number) => void
}

export function useWordStreamer({
  words,
  initialWpm = 300,
  onFinish,
}: UseWordStreamerOptions) {
  const [status, setStatus] = useState<StreamerStatus>('idle')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [wpm, setWpm] = useState(initialWpm)

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef<number>(0)

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const play = useCallback(() => {
    if (words.length === 0) return

    if (status === 'finished') {
      setCurrentIndex(0)
    }

    startTimeRef.current = Date.now()
    setStatus('playing')
  }, [status, words.length])

  const pause = useCallback(() => {
    clearTimer()
    setStatus('paused')
  }, [clearTimer])

  const stop = useCallback(() => {
    clearTimer()
    setStatus('idle')
    setCurrentIndex(0)
  }, [clearTimer])

  const changeWpm = useCallback((newWpm: number) => {
    setWpm(Math.min(1500, Math.max(50, newWpm)))
  }, [])

  // Drive the interval whenever status is 'playing'
  useEffect(() => {
    if (status !== 'playing') {
      clearTimer()
      return
    }

    const intervalMs = wpmToIntervalMs(wpm)

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev + 1
        if (next >= words.length) {
          clearTimer()
          setStatus('finished')
          onFinish?.(Date.now() - startTimeRef.current)
          return prev
        }
        return next
      })
    }, intervalMs)

    return clearTimer
  }, [status, wpm, words.length, clearTimer, onFinish])

  const state: StreamerState = {
    status,
    currentIndex,
    currentWord: words[currentIndex] ?? '',
    wpm,
    words,
    progress: words.length > 0 ? Math.round((currentIndex / words.length) * 100) : 0,
  }

  return { state, play, pause, stop, changeWpm }
}
