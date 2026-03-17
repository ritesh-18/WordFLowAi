'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { StreamerState } from '@/types'

interface WordStreamerProps {
  state: StreamerState
}

export function WordStreamer({ state }: WordStreamerProps) {
  const { currentWord, status, progress, currentIndex, words } = state
  const prevWordRef = useRef('')

  useEffect(() => {
    prevWordRef.current = currentWord
  })

  return (
    <div className="flex flex-col items-center gap-5 md:gap-8 w-full">
      {/* Main word display */}
      <div
        className="relative flex items-center justify-center w-full h-36 md:h-44
          rounded-2xl bg-dark-800 border border-dark-600 overflow-hidden"
      >
        {/* Focus guide lines */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-brand-600/20" />

        {status === 'idle' && (
          <p className="text-slate-500 text-lg">Press play to start</p>
        )}

        {status === 'finished' && (
          <p className="text-green-400 text-lg font-medium">Session complete!</p>
        )}

        {(status === 'playing' || status === 'paused') && (
          <AnimatePresence mode="wait">
            <motion.span
              key={currentIndex}
              initial={{ opacity: 0, scale: 0.85, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.1, y: -6 }}
              transition={{ duration: 0.12, ease: 'easeOut' }}
              className="text-4xl md:text-5xl font-bold text-white tracking-tight select-none px-4 text-center"
            >
              {currentWord}
            </motion.span>
          </AnimatePresence>
        )}

        {status === 'paused' && (
          <div className="absolute inset-0 bg-dark-900/40 flex items-center justify-center">
            <span className="text-sm text-slate-400 uppercase tracking-widest">Paused</span>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-dark-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      {/* Word counter */}
      <p className="text-sm text-slate-500">
        {status !== 'idle'
          ? `${currentIndex + 1} / ${words.length} words`
          : `${words.length} words`}
      </p>
    </div>
  )
}
