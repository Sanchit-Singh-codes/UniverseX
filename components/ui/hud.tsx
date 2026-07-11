'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { GestureState, SolarSystemState } from '@/lib/types'
import { PLANETS } from '@/lib/planet-data'

interface HUDProps {
  gesture: GestureState
  solarSystem: SolarSystemState
  fps: number
}

const GESTURE_DISPLAY: Record<string, { label: string; color: string }> = {
  none:           { label: 'No gesture', color: '#555' },
  open_palm:      { label: 'Open Palm',  color: '#00f5ff' },
  point:          { label: 'Pointing',   color: '#4db8ff' },
  fist:           { label: 'Fist',       color: '#ff9944' },
  two_hand_scale: { label: 'Scale',      color: '#88aaff' },
}

export function HUD({ gesture, solarSystem, fps }: HUDProps) {
  const g       = GESTURE_DISPLAY[gesture.gesture] ?? GESTURE_DISPLAY.none
  const planet  = solarSystem.selectedPlanet
    ? PLANETS.find(p => p.id === solarSystem.selectedPlanet) ?? null
    : null
  const hovered = solarSystem.hoveredPlanet
    ? PLANETS.find(p => p.id === solarSystem.hoveredPlanet) ?? null
    : null
  const display = hovered ?? planet
  const fpsColor = fps >= 50 ? '#00f5aa' : fps >= 30 ? '#ffcc00' : '#ff5555'

  return (
    <div
      className="absolute bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-end gap-3 pointer-events-none"
      style={{ maxWidth: 'calc(100vw - 32px)' }}
    >
      {/* Left: Gesture status */}
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
        className="glass-bright rounded-2xl px-4 py-3 flex items-center gap-3 min-w-[160px]"
      >
        <div
          className="flex-shrink-0 w-2.5 h-2.5 rounded-full transition-all duration-300"
          style={{
            backgroundColor: gesture.isTracking ? g.color : '#444',
            boxShadow: gesture.isTracking ? `0 0 8px ${g.color}` : 'none',
          }}
        />
        <div>
          <div
            className="text-xs font-mono font-semibold leading-tight transition-colors duration-200"
            style={{ color: gesture.isTracking ? g.color : '#555' }}
          >
            {gesture.isTracking ? g.label : 'No hands'}
          </div>
          <div className="text-[9px] font-mono text-gray-600 mt-0.5">
            {gesture.hands.length} hand{gesture.hands.length !== 1 ? 's' : ''} detected
          </div>
        </div>
        <div className="ml-auto pl-3 border-l border-white/10">
          <div className="text-[10px] font-mono font-bold" style={{ color: fpsColor }}>{fps}</div>
          <div className="text-[8px] font-mono text-gray-600">fps</div>
        </div>
      </motion.div>

      {/* Center: System status */}
      <motion.div
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
        className="glass-bright rounded-2xl px-5 py-3 text-center min-w-[160px]"
      >
        <div className="text-[8px] font-mono tracking-[0.3em] text-gray-500 uppercase mb-1">Solar System</div>
        <div
          className="text-sm font-bold font-mono tracking-wider"
          style={{
            color: solarSystem.isSpawned ? '#00f5ff' : '#444',
            textShadow: solarSystem.isSpawned ? '0 0 12px rgba(0,245,255,0.6)' : 'none',
          }}
        >
          {solarSystem.isSpawning ? 'SPAWNING...' : solarSystem.isSpawned ? 'ACTIVE' : 'STANDBY'}
        </div>
        {solarSystem.isSpawned && (
          <div className="text-[9px] font-mono text-gray-500 mt-1">
            {solarSystem.scale.toFixed(2)}x scale
          </div>
        )}
      </motion.div>

      {/* Right: Planet info */}
      <AnimatePresence mode="wait">
        {display && (
          <motion.div
            key={display.id}
            initial={{ y: 60, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 10, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="glass-bright rounded-2xl px-4 py-3 min-w-[200px]"
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: display.color, boxShadow: `0 0 8px ${display.color}` }}
              />
              <span className="text-sm font-bold text-white font-sans">{display.name}</span>
            </div>
            <p className="text-[10px] text-gray-400 leading-relaxed mb-2">{display.description}</p>
            {display.distanceFromSun && (
              <div className="flex justify-between text-[9px] font-mono">
                <span className="text-gray-600">Distance</span>
                <span className="text-gray-300">{display.distanceFromSun}</span>
              </div>
            )}
            {display.yearLength && (
              <div className="flex justify-between text-[9px] font-mono mt-0.5">
                <span className="text-gray-600">Year</span>
                <span className="text-gray-300">{display.yearLength}</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
