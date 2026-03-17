// ============================================================
// WordFlow AI — Shared TypeScript Types
// ============================================================

export type ThemeSlug = 'corporate' | 'daily_life' | 'tech'

export interface ThemePack {
  id: string
  slug: ThemeSlug
  name: string
  description: string
  color: string
  icon: string
  created_at: string
}

export interface Word {
  id: string
  theme_id: string
  word: string
  definition: string
  difficulty: 1 | 2 | 3
  created_at: string
}

export interface Profile {
  id: string
  email: string
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  default_wpm: number
  preferred_theme: ThemeSlug
  focus_mode_enabled: boolean
  ambient_sound: AmbientSound
  reminder_enabled: boolean
  reminder_time: string
  created_at: string
  updated_at: string
}

export type AmbientSound = 'none' | 'rain' | 'white_noise' | 'cafe' | 'forest'

export interface Session {
  id: string
  user_id: string
  theme_id: string | null
  wpm: number | null
  words_practiced: number
  duration_seconds: number
  focus_mode_used: boolean
  completed: boolean
  started_at: string
  ended_at: string | null
}

export interface SpeechMetric {
  id: string
  session_id: string
  user_id: string
  spoken_wpm: number | null
  pause_count: number
  longest_pause_ms: number
  total_speaking_ms: number
  total_silence_ms: number
  transcription: string | null
  recorded_at: string
}

export interface Streak {
  id: string
  user_id: string
  current_streak: number
  longest_streak: number
  last_practice: string | null
  total_days: number
  updated_at: string
}

// ---- UI State Types ----

export type StreamerStatus = 'idle' | 'playing' | 'paused' | 'finished'

export interface StreamerState {
  status: StreamerStatus
  currentIndex: number
  currentWord: string
  wpm: number
  words: string[]
  progress: number // 0-100
}

export interface SpeechAnalysisResult {
  spokenWpm: number
  pauseCount: number
  longestPauseMs: number
  totalSpeakingMs: number
  totalSilenceMs: number
  transcription: string
}

export interface DashboardStats {
  totalSessions: number
  avgWpm: number
  totalPracticeMinutes: number
  currentStreak: number
  longestStreak: number
  recentSessions: Session[]
  wpmHistory: { date: string; wpm: number }[]
}
