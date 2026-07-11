'use client'

import { motion } from 'framer-motion'
import { Camera, Loader2 } from 'lucide-react'

interface StartScreenProps {
  isLoading: boolean
  onStart: () => void
  error: string | null
}

export function StartScreen({ isLoading, onStart, error }: StartScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 z-50 flex items-center justify-center"
    >
      {/* Background blur vignette */}
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(0,20,60,0.7) 0%, rgba(0,0,10,0.92) 100%)' }} />

      <div className="relative z-10 max-w-lg w-full mx-6">
        {/* Orbital logo */}
        <motion.div
          className="relative mx-auto mb-10"
          style={{ width: 120, height: 120 }}
        >
          {/* Outer orbit ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-0 rounded-full"
            style={{ border: '1px solid rgba(0,245,255,0.15)' }}
          />
          {/* Middle orbit ring with dot */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            className="absolute inset-5 rounded-full"
            style={{ border: '1px solid rgba(0,245,255,0.3)' }}
          >
            <div
              className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full"
              style={{ background: '#00f5ff', boxShadow: '0 0 8px rgba(0,245,255,0.9)' }}
            />
          </motion.div>
          {/* Inner ring */}
          <div
            className="absolute inset-10 rounded-full"
            style={{ border: '1px solid rgba(0,245,255,0.6)' }}
          />
          {/* Core sun */}
          <div
            className="absolute inset-12 rounded-full"
            style={{
              background: 'radial-gradient(circle, #00f5ff 0%, #0088cc 60%, transparent 100%)',
              boxShadow: '0 0 20px rgba(0,245,255,0.6), 0 0 40px rgba(0,180,255,0.3)',
            }}
          />
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-center mb-2"
        >
          <h1 className="text-5xl font-bold tracking-[0.15em] text-white font-sans">
            UNIVERSE<span className="neon-cyan">X</span>
          </h1>
        </motion.div>

        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.22 }}
          className="text-center text-[11px] tracking-[0.45em] text-cyan-400/50 uppercase font-mono mb-10"
        >
          Hand-Tracked Solar System
        </motion.p>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center gap-3 mb-8 flex-wrap"
        >
          {['AI Hand Tracking', 'Real-Time Gestures', '3D Solar System'].map((feat) => (
            <div
              key={feat}
              className="px-3 py-1.5 rounded-full text-[10px] font-mono tracking-wider text-cyan-300/70"
              style={{ background: 'rgba(0,200,255,0.06)', border: '1px solid rgba(0,200,255,0.15)' }}
            >
              {feat}
            </div>
          ))}
        </motion.div>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="text-center text-sm text-gray-400 leading-relaxed font-sans mb-8 px-4"
        >
          Control the solar system entirely with your hands.
          Open your palm to spawn planets, point to explore, and use two hands to scale.
        </motion.p>

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-5 p-3 rounded-xl text-center"
            style={{ background: 'rgba(220,50,50,0.1)', border: '1px solid rgba(220,50,50,0.25)' }}
          >
            <p className="text-xs text-red-400 font-mono">{error}</p>
          </motion.div>
        )}

        {/* CTA Button */}
        <motion.button
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.42 }}
          whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(0,200,255,0.25)' }}
          whileTap={{ scale: 0.98 }}
          onClick={onStart}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-mono text-sm font-bold tracking-[0.15em] uppercase transition-all duration-300 disabled:opacity-50"
          style={{
            background: isLoading
              ? 'rgba(0,100,160,0.2)'
              : 'linear-gradient(135deg, rgba(0,200,255,0.18) 0%, rgba(0,100,200,0.15) 100%)',
            border: '1px solid rgba(0,220,255,0.35)',
            color: '#00f5ff',
            boxShadow: '0 0 24px rgba(0,180,255,0.12), inset 0 1px 0 rgba(255,255,255,0.06)',
          }}
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Loading Hand Tracker...
            </>
          ) : (
            <>
              <Camera size={16} />
              Enable Hand Tracking
            </>
          )}
        </motion.button>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="mt-4 text-center text-[10px] text-gray-600 font-mono"
        >
          Camera required &middot; All processing is local &middot; Nothing is uploaded
        </motion.p>
      </div>
    </motion.div>
  )
}
