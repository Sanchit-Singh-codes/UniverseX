'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import type { PlanetData } from '@/lib/types'

interface PlanetInfoOverlayProps {
  planet: PlanetData | null
  onClose: () => void
}

export function PlanetInfoOverlay({ planet, onClose }: PlanetInfoOverlayProps) {
  return (
    <AnimatePresence>
      {planet && (
        <motion.div
          key={planet.id}
          initial={{ opacity: 0, x: -40, scale: 0.94 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: -40, scale: 0.94 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="absolute left-6 top-1/2 -translate-y-1/2 z-50 pointer-events-auto"
          style={{ width: 288 }}
        >
          <div
            className="rounded-3xl overflow-hidden"
            style={{
              background: 'rgba(4, 8, 20, 0.82)',
              backdropFilter: 'blur(24px)',
              WebkitBackdropFilter: 'blur(24px)',
              border: '1px solid rgba(255,255,255,0.07)',
              boxShadow: `0 0 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)`,
            }}
          >
            {/* Color accent bar */}
            <div
              className="h-0.5 w-full"
              style={{ background: `linear-gradient(90deg, ${planet.color}dd 0%, ${planet.color}22 100%)` }}
            />

            <div className="p-6">
              {/* Header */}
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div
                    className="w-11 h-11 rounded-full flex-shrink-0"
                    style={{
                      background: `radial-gradient(circle at 32% 32%, ${planet.color}ee, ${planet.color}55)`,
                      boxShadow: `0 0 18px ${planet.color}55, 0 0 6px ${planet.color}33`,
                    }}
                  />
                  <div>
                    <h2 className="text-lg font-bold tracking-wider text-white leading-none font-mono">
                      {planet.name.toUpperCase()}
                    </h2>
                    <p className="text-[10px] font-mono text-white/25 tracking-widest mt-1 uppercase">
                      Solar System
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 rounded-xl flex items-center justify-center transition-all"
                  style={{ color: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.04)' }}
                  aria-label="Close"
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#00e5ff')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
                >
                  <X size={13} />
                </button>
              </div>

              {/* Description */}
              {planet.description && (
                <p className="text-[11px] text-white/40 leading-relaxed mb-5 font-mono">
                  {planet.description}
                </p>
              )}

              {/* Stats grid */}
              <div className="border-t border-white/[0.06] pt-4 space-y-0">
                {[
                  { label: 'Radius', value: planet.radiusKm },
                  { label: 'Gravity', value: planet.gravity },
                  { label: 'Distance', value: planet.distanceFromSun },
                  { label: 'Orbital Period', value: planet.yearLength },
                  { label: 'Day Length', value: planet.dayLength },
                  { label: 'Moons', value: planet.moons !== undefined ? String(planet.moons) : undefined },
                ].map(({ label, value }) => {
                  if (!value) return null
                  return (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.05 }}
                      className="flex items-center justify-between py-1.5"
                    >
                      <span className="text-[10px] font-mono tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {label}
                      </span>
                      <span className="text-[11px] font-mono font-semibold" style={{ color: planet.color }}>
                        {value}
                      </span>
                    </motion.div>
                  )
                })}
              </div>

              {/* Interesting fact */}
              {planet.interestingFact && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mt-4 pt-3 border-t border-white/[0.06]"
                >
                  <p className="text-[10px] font-mono tracking-widest uppercase mb-1.5" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    Interesting Fact
                  </p>
                  <p className="text-[11px] font-mono leading-relaxed" style={{ color: `${planet.color}cc` }}>
                    {planet.interestingFact}
                  </p>
                </motion.div>
              )}

              {/* Feature badges */}
              <div className="flex flex-wrap gap-1.5 mt-4">
                {planet.hasMoon && (
                  <span className="text-[9px] font-mono tracking-widest px-2 py-0.5 rounded-full uppercase"
                    style={{ background: 'rgba(0,180,255,0.07)', border: '1px solid rgba(0,180,255,0.18)', color: '#55bbff' }}>
                    Moon
                  </span>
                )}
                {planet.hasRings && (
                  <span className="text-[9px] font-mono tracking-widest px-2 py-0.5 rounded-full uppercase"
                    style={{ background: 'rgba(200,168,130,0.07)', border: '1px solid rgba(200,168,130,0.18)', color: '#c8a882' }}>
                    Rings
                  </span>
                )}
                {planet.atmosphereColor && (
                  <span className="text-[9px] font-mono tracking-widest px-2 py-0.5 rounded-full uppercase"
                    style={{ background: 'rgba(80,200,100,0.06)', border: '1px solid rgba(80,200,100,0.15)', color: '#66cc88' }}>
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
