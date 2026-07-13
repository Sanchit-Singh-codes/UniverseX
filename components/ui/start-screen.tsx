'use client'

import { motion } from 'framer-motion'
import { Camera, Loader2, Instagram } from 'lucide-react'

interface StartScreenProps {
  isLoading: boolean
  onStart: () => void
  error: string | null
  onWatchDemo: () => void
}

export function StartScreen({ isLoading, onStart, error, onWatchDemo }: StartScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="absolute inset-0 z-50 flex items-center justify-center"
    >
      <div className="glass-bright rounded-3xl p-10 max-w-md w-full mx-6 text-center">
        {/* Animated logo */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="mx-auto mb-8 relative w-24 h-24"
        >
          <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border border-cyan-400/40" />
          <div className="absolute inset-4 rounded-full border border-cyan-300/60" />
          <div className="absolute inset-6 rounded-full border-2 border-cyan-200/80" />
          <div className="absolute inset-9 rounded-full bg-cyan-400" style={{
            boxShadow: '0 0 20px rgba(0, 245, 255, 0.8), 0 0 40px rgba(0, 245, 255, 0.4)'
          }} />
        </motion.div>

        <motion.h1
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-4xl font-bold tracking-[0.2em] text-white mb-2"
        >
          UNIVERSE<span className="neon-cyan">X</span>
        </motion.h1>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-[11px] tracking-[0.4em] text-cyan-400/60 uppercase font-mono mb-8"
        >
          Hand-Tracked Solar System
        </motion.p>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-sm text-gray-400 leading-relaxed mb-8 font-mono"
        >
          Control the Solar System with your hands using AI-powered hand tracking.
          Camera access is required for real-time gesture detection.
        </motion.p>

        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20"
          >
            <p className="text-xs text-red-400 font-mono">{error}</p>
          </motion.div>
        )}

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-mono text-sm font-bold tracking-wider transition-all duration-300 disabled:opacity-50"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 180, 255, 0.2), rgba(0, 100, 200, 0.15))',
            border: '1px solid rgba(0, 200, 255, 0.4)',
            color: '#00f5ff',
            boxShadow: '0 0 20px rgba(0, 180, 255, 0.15)',
          }}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              LOADING HAND TRACKER...
            </>
          ) : (
            <>
              <Camera size={16} />
              ENABLE HAND TRACKING
            </>
          )}
        </motion.button>

        <motion.button
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onWatchDemo}
          className="w-full mt-3 flex items-center justify-center gap-3 py-3.5 rounded-2xl font-mono text-xs font-bold tracking-wider transition-all duration-300 border border-white/10 text-gray-400 hover:text-white hover:border-cyan-400/30 hover:bg-cyan-950/10 cursor-pointer"
        >
          <Instagram size={14} className="text-pink-500 animate-pulse" />
          WATCH DEMO (INSTA STORY)
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-4 text-[10px] text-gray-600 font-mono"
        >
          No data is stored or transmitted. Processing is entirely local.
        </motion.p>
      </div>
    </motion.div>
  )
}
