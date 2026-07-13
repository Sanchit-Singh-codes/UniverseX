'use client'

import { motion } from 'framer-motion'
import { Maximize2, Settings, Wifi, WifiOff, Instagram } from 'lucide-react'

interface TopNavProps {
  fps: number
  isTracking: boolean
  trackingQuality: number
  onFullscreen: () => void
  onSettings: () => void
  onWatchDemo: () => void
}

export function TopNav({ fps, isTracking, trackingQuality, onFullscreen, onSettings, onWatchDemo }: TopNavProps) {
  const qualityPercent = Math.round(trackingQuality * 100)
  const fpsColor = fps >= 50 ? '#00f5aa' : fps >= 30 ? '#ffcc00' : '#ff4444'

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 rounded-full border border-cyan-400/40 animate-pulse" />
          <div className="absolute inset-1 rounded-full border border-cyan-300/60" />
          <div className="absolute inset-2.5 rounded-full bg-cyan-400" />
        </div>
        <div>
          <h1 className="text-lg font-bold tracking-[0.15em] text-white leading-none">
            UNIVERSE<span className="neon-cyan">X</span>
          </h1>
          <p className="text-[9px] tracking-[0.3em] text-cyan-400/60 uppercase font-mono leading-none mt-0.5">
            Hand Tracking Solar System
          </p>
        </div>
      </div>

      {/* Center stats */}
      <div className="flex items-center gap-6">
        {/* FPS */}
        <div className="glass rounded-lg px-4 py-2 flex items-center gap-2.5">
          <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: fpsColor, boxShadow: `0 0 6px ${fpsColor}` }} />
          <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">FPS</span>
          <span className="font-mono text-sm font-bold" style={{ color: fpsColor }}>{fps}</span>
        </div>

        {/* Tracking status */}
        <div className="glass rounded-lg px-4 py-2 flex items-center gap-2.5">
          {isTracking ? (
            <Wifi size={12} className="text-cyan-400" />
          ) : (
            <WifiOff size={12} className="text-gray-500" />
          )}
          <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">Tracking</span>
          <span className={`text-sm font-bold font-mono ${isTracking ? 'neon-cyan' : 'text-gray-500'}`}>
            {isTracking ? `${qualityPercent}%` : 'OFF'}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={onWatchDemo}
          className="glass rounded-lg p-2.5 hover:bg-pink-500/10 transition-colors group flex items-center gap-1.5 cursor-pointer"
          title="Watch Tutorial Story"
        >
          <Instagram size={16} className="text-pink-500 animate-pulse group-hover:scale-110 transition-transform" />
          <span className="text-[9px] font-mono text-gray-400 group-hover:text-white transition-colors hidden sm:inline uppercase tracking-wider">Demo Story</span>
        </button>
        <button
          onClick={onSettings}
          className="glass rounded-lg p-2.5 hover:bg-cyan-500/10 transition-colors group cursor-pointer"
          aria-label="Settings"
        >
          <Settings size={16} className="text-gray-400 group-hover:text-cyan-400 transition-colors" />
        </button>
        <button
          onClick={onFullscreen}
          className="glass rounded-lg p-2.5 hover:bg-cyan-500/10 transition-colors group cursor-pointer"
          aria-label="Toggle fullscreen"
        >
          <Maximize2 size={16} className="text-gray-400 group-hover:text-cyan-400 transition-colors" />
        </button>
      </div>
    </motion.header>
  )
}
