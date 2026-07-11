'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import type { PlanetData } from '@/lib/types'

interface PlanetInfoOverlayProps {
  planet: PlanetData | null
  onClose: () => void
}

const STAT_ROWS = [
  { key: 'distanceFromSun', label: 'Distance from Sun' },
  { key: 'dayLength', label: 'Day Length' },
  { key: 'yearLength', label: 'Year Length' },
] as const

export function PlanetInfoOverlay({ planet, onClose }: PlanetInfoOverlayProps) {
  return (
    <AnimatePresence>
      {planet && (
        <motion.div
          key={planet.id}
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-8 top-1/2 -translate-y-1/2 z-50 pointer-events-auto"
          style={{ maxWidth: 280 }}
        >
          <div className="glass-bright rounded-3xl overflow-hidden">
            {/* Color band header */}
            <div
              className="h-1 w-full"
              style={{
                background: `linear-gradient(90deg, ${planet.color}cc, ${planet.color}44)`,
                boxShadow: `0 0 12px ${planet.color}66`,
              }}
            />

            <div className="p-6">
              {/* Planet identity */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex-shrink-0"
                    style={{
                      background: `radial-gradient(circle at 35% 35%, ${planet.color}ee, ${planet.color}66)`,
                      boxShadow: `0 0 20px ${planet.color}60, 0 0 8px ${planet.color}40`,
                    }}
                  />
                  <div>
                    <h2 className="text-xl font-bold tracking-wider text-white leading-none">
                      {planet.name}
                    </h2>
                    <p className="text-[10px] font-mono text-gray-500 tracking-wider mt-0.5 uppercase">
                      Solar System
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-600 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all"
                  aria-label="Close planet info"
                >
                  <X size={14} />
                </button>
              </div>

              {/* Description */}
              <p className="text-xs text-gray-400 leading-relaxed mb-4 font-mono">
                {planet.description}
              </p>

              {/* Stats */}
              <div className="space-y-0 border-t border-white/5 pt-3">
                {STAT_ROWS.map(({ key, label }) => {
                  const val = planet[key]
                  if (!val) return null
                  return (
                    <div key={key} className="flex items-center justify-between py-1.5">
                      <span className="text-[10px] font-mono tracking-wider text-gray-500 uppercase">
                        {label}
                      </span>
                      <span
                        className="text-[11px] font-mono font-medium"
                        style={{ color: planet.color }}
                      >
                        {val}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Feature badges */}
              <div className="flex flex-wrap gap-2 mt-4">
                {planet.hasMoon && (
                  <span
                    className="text-[9px] font-mono tracking-wider px-2 py-1 rounded-full uppercase"
                    style={{
                      background: 'rgba(0, 180, 255, 0.08)',
                      border: '1px solid rgba(0, 180, 255, 0.2)',
                      color: '#4db8ff',
                    }}
                  >
                    Moon
                  </span>
                )}
                {planet.hasRings && (
                  <span
                    className="text-[9px] font-mono tracking-wider px-2 py-1 rounded-full uppercase"
                    style={{
                      background: 'rgba(200, 168, 130, 0.08)',
                      border: '1px solid rgba(200, 168, 130, 0.2)',
                      color: '#c8a882',
                    }}
                  >
                    Rings
                  </span>
                )}
                {planet.atmosphereColor && (
                  <span
                    className="text-[9px] font-mono tracking-wider px-2 py-1 rounded-full uppercase"
                    style={{
                      background: 'rgba(100, 200, 100, 0.06)',
                      border: '1px solid rgba(100, 200, 100, 0.15)',
                      color: '#88cc88',
                    }}
                  >
                    Atmosphere
                  </span>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
