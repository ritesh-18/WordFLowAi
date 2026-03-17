'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { calcWpmFromTranscript, detectPausesFromAmplitude } from '@/lib/speech/analyzer'
import type { SpeechAnalysisResult } from '@/types'

type RecordingState = 'idle' | 'recording' | 'analysing' | 'done' | 'error'

export function useSpeechRecording() {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle')
  const [result, setResult] = useState<SpeechAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const analyserRef = useRef<AnalyserNode | null>(null)
  const amplitudeSamplesRef = useRef<number[]>([])
  const startTimeRef = useRef<number>(0)
  const transcriptRef = useRef<string>('')
  const animFrameRef = useRef<number | null>(null)

  // Web Speech API for live transcription
  const recognitionRef = useRef<SpeechRecognition | null>(null)

  useEffect(() => {
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
      recognitionRef.current?.abort()
    }
  }, [])

  const sampleAmplitude = useCallback(() => {
    if (!analyserRef.current) return
    const data = new Uint8Array(analyserRef.current.frequencyBinCount)
    analyserRef.current.getByteTimeDomainData(data)
    // RMS amplitude 0-1
    const rms =
      Math.sqrt(
        data.reduce((sum, v) => sum + ((v - 128) / 128) ** 2, 0) / data.length
      )
    amplitudeSamplesRef.current.push(rms)
    animFrameRef.current = requestAnimationFrame(sampleAmplitude)
  }, [])

  const startRecording = useCallback(async () => {
    setError(null)
    setResult(null)
    amplitudeSamplesRef.current = []
    transcriptRef.current = ''
    audioChunksRef.current = []

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Web Audio analyser
      const ctx = new AudioContext()
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 256
      source.connect(analyser)
      analyserRef.current = analyser

      // MediaRecorder
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data)
      }

      recorder.start(100)
      startTimeRef.current = Date.now()
      sampleAmplitude()

      // Speech recognition
      const SR =
        (window as Window & { SpeechRecognition?: typeof SpeechRecognition; webkitSpeechRecognition?: typeof SpeechRecognition })
          .SpeechRecognition ??
        (window as Window & { webkitSpeechRecognition?: typeof SpeechRecognition })
          .webkitSpeechRecognition

      if (SR) {
        const recognition = new SR()
        recognition.continuous = true
        recognition.interimResults = false
        recognition.lang = 'en-US'
        recognition.onresult = (event: SpeechRecognitionEvent) => {
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              transcriptRef.current += event.results[i][0].transcript + ' '
            }
          }
        }
        recognition.start()
        recognitionRef.current = recognition
      }

      setRecordingState('recording')
    } catch (err) {
      setError('Microphone access denied. Please allow microphone permissions.')
      setRecordingState('error')
    }
  }, [sampleAmplitude])

  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current) return

    setRecordingState('analysing')

    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    recognitionRef.current?.stop()

    const durationMs = Date.now() - startTimeRef.current

    mediaRecorderRef.current.stop()
    mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop())

    // ~10 samples/sec from requestAnimationFrame
    const { pauseCount, longestPauseMs } = detectPausesFromAmplitude(
      amplitudeSamplesRef.current,
      60
    )

    const transcript = transcriptRef.current.trim()
    const spokenWpm = calcWpmFromTranscript(transcript, durationMs)

    const silenceRatio =
      amplitudeSamplesRef.current.filter((a) => a < 0.02).length /
      Math.max(amplitudeSamplesRef.current.length, 1)
    const totalSilenceMs = Math.round(durationMs * silenceRatio)
    const totalSpeakingMs = durationMs - totalSilenceMs

    setResult({
      spokenWpm,
      pauseCount,
      longestPauseMs,
      totalSpeakingMs,
      totalSilenceMs,
      transcription: transcript,
    })
    setRecordingState('done')
  }, [])

  const reset = useCallback(() => {
    setRecordingState('idle')
    setResult(null)
    setError(null)
  }, [])

  return { recordingState, result, error, startRecording, stopRecording, reset }
}
