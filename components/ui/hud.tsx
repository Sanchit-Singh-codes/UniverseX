'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { GestureState, SolarSystemState } from '@/lib/types'
import { PLANETS } from '@/lib/planet-data'

interface HUDProps {
  gesture: GestureState
  solarSystem: SolarSystemState
  fps: number
}

const GESTURE_LABELS: Record<string, string> = {
  none: 'None',
  open_palm: 'Open Palm',
  point: 'Point',
  pinch: 'Pinch',
  fist: 'Fist',
  two_hand_pinch: 'Two-Hand Pinch',
  rotate: 'Rotate',
}

const GESTURE_ACTIONS: Record<string, string> = {
  none: 'Waiting...',
  open_palm: 'Spawn Solar System',
  point: 'Highlight Planet',
  pinch: 'Grab Planet',
  fist: 'Reset System',
  two_hand_pinch: 'Resize System',
  rotate: 'Rotate System',
}

function HUDRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-[10px] font-mono tracking-wider text-gray-500 uppercase">{label}</span>
      <span className={`text-[11px] font-mono font-medium ${highlight ? 'neon-cyan' : 'text-gray-300'}`}>
        {value}
      </span>
    </div>
  )
}

function GestureIndicator({ gesture }: { gesture: string }) {
  const isActive = gesture !== 'none'
  return (
    <div className={`flex items-center gap-2 py-2 px-3 rounded-lg transition-all duration-300 ${
      isActive ? 'bg-cyan-500/10 border border-cyan-500/20' : 'bg-transparent'
    }`}>
      <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
        isActive
          ? 'bg-cyan-400 animate-pulse-glow'
          : 'bg-gray-600'
      }`} />
      <div>
        <div className={`text-xs font-bold font-mono transition-colors duration-300 ${
          isActive ? 'text-cyan-300' : 'text-gray-500'
        }`}>
          {GESTURE_LABELS[gesture] ?? gesture}
        </div>
        <div className="text-[9px] text-gray-500 font-mono">
          {GESTURE_ACTIONS[gesture] ?? ''}
        </div>
      </div>
    </div>
  )
}

export function HUD({ gesture, solarSystem, fps }: HUDProps) {
  const selectedPlanetData = solarSystem.selectedPlanet
    ? PLANETS.find((p) => p.id === solarSystem.selectedPlanet)
    : null

  const hoveredPlanetData = solarSystem.hoveredPlanet
    ? PLANETS.find((p) => p.id === solarSystem.hoveredPlanet)
    : null

  const displayPlanet = hoveredPlanetData ?? selectedPlanetData

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.4 }}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-end gap-4 pointer-events-none"
    >
      {/* Left panel: Hand info */}
      <div className="glass-bright rounded-2xl p-4 min-w-[200px]">
        <div className="flex items-center gap-2 mb-3">
          <div className={`w-2 h-2 rounded-full ${gesture.isTracking ? 'bg-cyan-400 animate-pulse-glow' : 'bg-gray-600'}`} />
          <span className="text-[9px] font-mono tracking-[0.2em] text-gray-400 uppercase">
            Hand Detection
          </span>
        </div>

        <GestureIndicator gesture={gesture.gesture} />

        <div className="mt-2 border-t border-white/5 pt-2 space-y-0">
          <HUDRow
            label="Hands"
            value={`${gesture.hands.length} detected`}
            highlight={gesture.hands.length > 0}
          />
          <HUDRow
            label="Quality"
            value={gesture.isTracking ? `${Math.round(gesture.trackingQuality * 100)}%` : '—'}
            highlight={gesture.trackingQuality > 0.8}
          />
          <HUDRow
            label="FPS"
            value={`${fps}`}
            highlight={fps >= 50}
          />
        </div>
      </div>

      {/* Center: System status */}
      <div className="glass-bright rounded-2xl p-4 min-w-[180px] text-center">
        <div className="mb-2">
          <div className="text-[9px] font-mono tracking-[0.2em] text-gray-400 uppercase mb-1">
            Solar System
          </div>
          <div className={`text-xs font-bold font-mono ${
            solarSystem.isSpawned ? 'neon-cyan' : 'text-gray-500'
          }`}>
            {solarSystem.isSpawning ? 'SPAWNING...' : solarSystem.isSpawned ? 'ACTIVE' : 'STANDBY'}
          </div>
        </div>

        {solarSystem.isSpawned && (
          <>
            <div className="border-t border-white/5 pt-2 mt-2 space-y-0">
              <HUDRow label="Scale" value={`${solarSystem.scale.toFixed(2)}x`} />
              <HUDRow
                label="Selected"
                value={selectedPlanetData?.name ?? '—'}
                highlight={!!selectedPlanetData}
              />
              <HUDRow
                label="Grabbed"
                value={solarSystem.grabbedPlanet
                  ? PLANETS.find((p) => p.id === solarSystem.grabbedPlanet)?.name ?? '—'
                  : '—'}
                highlight={!!solarSystem.grabbedPlanet}
              />
            </div>
          </>
        )}
      </div>

      {/* Right: Planet info */}
      <AnimatePresence>
        {displayPlanet && (
          <motion.div
            key={displayPlanet.id}
            initial={{ opacity: 0, x: 20, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="glass-bright rounded-2xl p-4 min-w-[190px]"
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{
                  backgroundColor: displayPlanet.color,
                  boxShadow: `0 0 8px ${displayPlanet.color}`,
                }}
              />
              <span className="text-sm font-bold text-white tracking-wide">
                {displayPlanet.name}
              </span>
            </div>

            <p className="text-[10px] text-gray-400 mb-3 leading-relaxed">
              {displayPlanet.description}
            </p>

            <div className="space-y-0 border-t border-white/5 pt-2">
              {displayPlanet.distanceFromSun && (
                <HUDRow label="Distance" value={displayPlanet.distanceFromSun} />
              )}
              {displayPlanet.dayLength && (
                <HUDRow label="Day" value={displayPlanet.dayLength} />
              )}
              {displayPlanet.yearLength && (
                <HUDRow label="Year" value={displayPlanet.yearLength} />
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
