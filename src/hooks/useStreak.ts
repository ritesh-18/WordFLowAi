'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Streak } from '@/types'

export function useStreak(userId: string | null) {
  const [streak, setStreak] = useState<Streak | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStreak = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    const supabase = createClient()
    const { data } = await supabase
      .from('streaks')
      .select('*')
      .eq('user_id', userId)
      .single()
    setStreak(data)
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchStreak() }, [fetchStreak])

  return { streak, loading, refetch: fetchStreak }
}
