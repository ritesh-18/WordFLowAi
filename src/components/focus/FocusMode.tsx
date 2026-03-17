'use client'

import { useState, useRef, useEffect } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import type { AmbientSound } from '@/types'

const SOUNDS: { value: AmbientSound; label: string; emoji: string }[] = [
  { value: 'none',        label: 'Silent',      emoji: '🔇' },
  { value: 'rain',        label: 'Rain',         emoji: '🌧️' },
  { value: 'white_noise', label: 'White noise',  emoji: '🌊' },
  { value: 'cafe',        label: 'Café',         emoji: '☕' },
  { value: 'forest',      label: 'Forest',       emoji: '🌲' },
]

// Frequencies used to synthesise ambient tones via Web Audio
const TONE_FREQS: Partial<Record<AmbientSound, number>> = {
  rain:        200,
  white_noise: 0,   // white noise
  cafe:        250,
  forest:      180,
}

interface FocusModeProps {
  enabled: boolean
  sound: AmbientSound
  onToggle: (enabled: boolean) => void
  onSoundChange: (sound: AmbientSound) => void
}

export function FocusMode({ enabled, sound, onToggle, onSoundChange }: FocusModeProps) {
  const audioCtxRef  = useRef<AudioContext | null>(null)
  const gainRef      = useRef<GainNode | null>(null)
  const sourceRef    = useRef<AudioNode | null>(null)

  const stopAudio = () => {
    sourceRef.current?.disconnect()
    sourceRef.current = null
    gainRef.current?.disconnect()
    gainRef.current = null
    audioCtxRef.current?.close()
    audioCtxRef.current = null
  }

  const startAudio = (s: AmbientSound) => {
    if (s === 'none') return
    stopAudio()

    const ctx  = new AudioContext()
    const gain = ctx.createGain()
    gain.gain.value = 0.08
    gain.connect(ctx.destination)

    let node: AudioNode

    if (s === 'white_noise') {
      const bufferSize = ctx.sampleRate * 2
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
      const data = buffer.getChannelData(0)
      for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1
      const src = ctx.createBufferSource()
      src.buffer = buffer
      src.loop = true
      src.connect(gain)
      src.start()
      node = src
    } else {
      const osc = ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = TONE_FREQS[s] ?? 200
      osc.connect(gain)
      osc.start()
      node = osc
    }

    audioCtxRef.current = ctx
    gainRef.current = gain
    sourceRef.current = node
  }

  useEffect(() => {
    if (enabled && sound !== 'none') {
      startAudio(sound)
    } else {
      stopAudio()
    }
    return stopAudio
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, sound])

  return (
    <div className="flex flex-col gap-3">
      {/* Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-300">Focus mode</p>
          <p className="text-xs text-slate-500">Dims the UI and plays ambient sound</p>
        </div>
        <button
          onClick={() => onToggle(!enabled)}
          className={`
            relative w-11 h-6 rounded-full transition-colors duration-200
            ${enabled ? 'bg-brand-600' : 'bg-dark-600'}
          `}
        >
          <span
            className={`
              absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200
              ${enabled ? 'left-6' : 'left-1'}
            `}
          />
        </button>
      </div>

      {/* Sound picker */}
      {enabled && (
        <div className="flex flex-wrap gap-2">
          {SOUNDS.map(({ value, label, emoji }) => (
            <button
              key={value}
              onClick={() => onSoundChange(value)}
              className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition
                ${sound === value
                  ? 'bg-brand-600/20 text-brand-400 border border-brand-600/30'
                  : 'bg-dark-700 text-slate-400 border border-dark-600 hover:bg-dark-600'}
              `}
            >
              <span>{emoji}</span>
              {label}
              {value !== 'none' && sound === value && (
                <Volume2 className="w-3 h-3 text-brand-400" />
              )}
              {value !== 'none' && sound !== value && (
                <VolumeX className="w-3 h-3 opacity-40" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
