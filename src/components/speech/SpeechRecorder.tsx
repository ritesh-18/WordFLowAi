'use client'

import { Mic, MicOff, Square } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useSpeechRecording } from '@/hooks/useSpeechRecording'
import { SpeechMetrics } from './SpeechMetrics'

export function SpeechRecorder() {
  const { recordingState, result, error, startRecording, stopRecording, reset } =
    useSpeechRecording()

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-300">Speech recording</span>
        {recordingState === 'recording' && (
          <span className="flex items-center gap-1.5 text-red-400 text-xs">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
            Recording
          </span>
        )}
      </div>

      <div className="flex gap-3">
        {recordingState === 'idle' && (
          <Button variant="secondary" size="sm" onClick={startRecording}>
            <Mic className="w-4 h-4" />
            Start recording
          </Button>
        )}

        {recordingState === 'recording' && (
          <Button variant="danger" size="sm" onClick={stopRecording}>
            <Square className="w-4 h-4" />
            Stop
          </Button>
        )}

        {(recordingState === 'done' || recordingState === 'error') && (
          <Button variant="ghost" size="sm" onClick={reset}>
            <MicOff className="w-4 h-4" />
            Reset
          </Button>
        )}

        {recordingState === 'analysing' && (
          <Button variant="secondary" size="sm" loading disabled>
            Analysing…
          </Button>
        )}
      </div>

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      {result && <SpeechMetrics result={result} />}
    </div>
  )
}
