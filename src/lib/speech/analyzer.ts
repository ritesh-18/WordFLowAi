import type { SpeechAnalysisResult } from '@/types'

const SILENCE_THRESHOLD_MS = 500  // gaps > 500ms count as a pause

interface TimestampedWord {
  word: string
  startMs: number
  endMs: number
}

/**
 * Analyse a speech transcript with word-level timestamps
 * (as returned by the Web Speech API SpeechRecognitionResult).
 */
export function analyseSpeech(
  words: TimestampedWord[],
  totalDurationMs: number
): SpeechAnalysisResult {
  if (words.length === 0) {
    return {
      spokenWpm: 0,
      pauseCount: 0,
      longestPauseMs: 0,
      totalSpeakingMs: 0,
      totalSilenceMs: totalDurationMs,
      transcription: '',
    }
  }

  let pauseCount = 0
  let longestPauseMs = 0
  let totalSilenceMs = 0

  // Check gap before first word
  const leadingGap = words[0].startMs
  if (leadingGap > SILENCE_THRESHOLD_MS) {
    pauseCount++
    longestPauseMs = Math.max(longestPauseMs, leadingGap)
    totalSilenceMs += leadingGap
  }

  // Check gaps between words
  for (let i = 1; i < words.length; i++) {
    const gap = words[i].startMs - words[i - 1].endMs
    if (gap > SILENCE_THRESHOLD_MS) {
      pauseCount++
      longestPauseMs = Math.max(longestPauseMs, gap)
      totalSilenceMs += gap
    }
  }

  // Check trailing gap
  const lastWord = words[words.length - 1]
  const trailingGap = totalDurationMs - lastWord.endMs
  if (trailingGap > SILENCE_THRESHOLD_MS) {
    totalSilenceMs += trailingGap
  }

  const totalSpeakingMs = totalDurationMs - totalSilenceMs
  const spokenWpm =
    totalSpeakingMs > 0
      ? Math.round((words.length / totalSpeakingMs) * 60_000)
      : 0

  const transcription = words.map((w) => w.word).join(' ')

  return {
    spokenWpm,
    pauseCount,
    longestPauseMs,
    totalSpeakingMs,
    totalSilenceMs,
    transcription,
  }
}

/**
 * Simple WPM calculation from a plain transcript string and duration.
 */
export function calcWpmFromTranscript(transcript: string, durationMs: number): number {
  if (!transcript || durationMs <= 0) return 0
  const wordCount = transcript.trim().split(/\s+/).length
  return Math.round((wordCount / durationMs) * 60_000)
}

/**
 * Detect pauses from a series of amplitude samples (0–1).
 * Returns pause count and longest pause in ms.
 */
export function detectPausesFromAmplitude(
  samples: number[],
  sampleRateHz: number,
  silenceLevel = 0.02
): { pauseCount: number; longestPauseMs: number } {
  const msPerSample = 1000 / sampleRateHz
  let inPause = false
  let pauseDurationMs = 0
  let pauseCount = 0
  let longestPauseMs = 0

  for (const amp of samples) {
    if (amp < silenceLevel) {
      inPause = true
      pauseDurationMs += msPerSample
    } else {
      if (inPause && pauseDurationMs >= SILENCE_THRESHOLD_MS) {
        pauseCount++
        longestPauseMs = Math.max(longestPauseMs, pauseDurationMs)
      }
      inPause = false
      pauseDurationMs = 0
    }
  }

  // Flush final pause
  if (inPause && pauseDurationMs >= SILENCE_THRESHOLD_MS) {
    pauseCount++
    longestPauseMs = Math.max(longestPauseMs, pauseDurationMs)
  }

  return { pauseCount, longestPauseMs }
}
