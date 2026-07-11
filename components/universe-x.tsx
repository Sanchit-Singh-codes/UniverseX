'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import SpaceBackground from './space-background'
import CameraFeed from './camera-feed'
import { TopNav } from './ui/top-nav'
import { HUD } from './ui/hud'
import { GestureGuide } from './ui/gesture-guide'
import { StartScreen } from './ui/start-screen'
import { GestureToast } from './ui/gesture-toast'
import { PlanetInfoOverlay } from './ui/planet-info-overlay'
import { useHandTracking } from '@/hooks/use-hand-tracking'
import { useFPS } from '@/hooks/use-fps'
import type { SolarSystemState } from '@/lib/types'

const ThreeCanvas = dynamic(() => import('./three-canvas'), { ssr: false })

const INITIAL: SolarSystemState = {
  isSpawned: false,
  isSpawning: false,
  scale: 1.0,
  rotation: 0,
  isAutoRotating: false,
  selectedPlanet: null,
  hoveredPlanet: null,
  laserTarget: null,
  laserDwellProgress: 0,
  grabbedPlanet: null,
  planetOffset: null,
}

export default function UniverseX() {
  const videoRef   = useRef<HTMLVideoElement>(null)
  const [started, setStarted] = useState(false)
  const [ss, setSS] = useState<SolarSystemState>(INITIAL)
  const fps = useFPS()

  const { gestureState, isReady, error, startTracking, stopTracking } = useHandTracking(videoRef)

  // ── Two-hand scale refs ──────────────────────────────────────────────
  const prevDistRef   = useRef<number | null>(null)
  const baseScaleRef  = useRef(1.0)

  // ── Dwell (pointer-select) refs ──────────────────────────────────────
  const dwellPlanetRef = useRef<string | null>(null)
  const dwellStartRef  = useRef<number | null>(null)
  const dwellRafRef    = useRef<number>(0)
  const DWELL_TIME     = 0.8   // seconds to auto-select

  // ── Start flow ────────────────────────────────────────────────────────
  // Only call startTracking after the <video> element is in the DOM
  const handleStart = useCallback(() => {
    setStarted(true)
  }, [])

  useEffect(() => {
    if (!started || !isReady) return
    // Give React one tick to mount <video> before we grab the stream
    const id = setTimeout(() => { startTracking() }, 80)
    return () => clearTimeout(id)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, isReady])

  // ── Three.js callbacks ────────────────────────────────────────────────
  const handlePlanetHover  = useCallback((id: string | null) => {
    setSS(p => ({ ...p, hoveredPlanet: id }))
  }, [])

  const handlePlanetSelect = useCallback((id: string | null) => {
    setSS(p => ({ ...p, selectedPlanet: p.selectedPlanet === id ? null : id }))
  }, [])

  const handleSystemUpdate = useCallback((u: Partial<SolarSystemState>) => {
    setSS(p => ({ ...p, ...u }))
  }, [])

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {})
    else document.exitFullscreen().catch(() => {})
  }, [])

  // ── Cancel dwell ──────────────────────────────────────────────────────
  const cancelDwell = useCallback(() => {
    cancelAnimationFrame(dwellRafRef.current)
    dwellPlanetRef.current = null
    setSS(p => ({ ...p, laserTarget: null, laserDwellProgress: 0 }))
  }, [])

  // ── Gesture → Solar System ────────────────────────────────────────────
  useEffect(() => {
    if (!started) return
    const { gesture, leftGesture, rightGesture, twoHandScale, pinchDistance } = gestureState

    // ── Two-hand scale ─────────────────────────────────────────────────
    if (twoHandScale) {
      if (prevDistRef.current === null) {
        prevDistRef.current = pinchDistance
        setSS(p => { baseScaleRef.current = p.scale; return p })
      } else if (pinchDistance > 0.02) {
        const ratio    = pinchDistance / prevDistRef.current
        const newScale = Math.max(0.3, Math.min(3.5, baseScaleRef.current * ratio))
        setSS(p => ({ ...p, scale: newScale }))
      }
      if (dwellPlanetRef.current) cancelDwell()
      return
    } else {
      if (prevDistRef.current !== null) {
        setSS(p => { baseScaleRef.current = p.scale; prevDistRef.current = null; return p })
      }
    }

    // ── Left hand: rotation ────────────────────────────────────────────
    if (leftGesture === 'fist') {
      setSS(p => p.isAutoRotating ? p : { ...p, isAutoRotating: true })
    } else if (leftGesture === 'open_palm') {
      setSS(p => p.isAutoRotating ? { ...p, isAutoRotating: false } : p)
    }

    // ── Right hand: laser point + dwell ───────────────────────────────
    if (rightGesture === 'point') {
      const rightHand = gestureState.hands.find(h => h.handedness === 'Right')
      if (rightHand) {
        // The gesture is detected — trigger laserTarget on the currently hovered planet
        // (Three.js pointer events drive hoveredPlanet; we just hook into that)
        setSS(p => {
          if (p.hoveredPlanet) {
            const pid = p.hoveredPlanet
            // Start dwell if new target
            if (dwellPlanetRef.current !== pid) {
              cancelAnimationFrame(dwellRafRef.current)
              dwellPlanetRef.current = pid
              dwellStartRef.current  = performance.now()

              const tick = () => {
                if (dwellPlanetRef.current !== pid) return
                const elapsed  = (performance.now() - (dwellStartRef.current ?? 0)) / 1000
                const progress = Math.min(elapsed / DWELL_TIME, 1)
                setSS(prev => ({ ...prev, laserDwellProgress: progress }))
                if (progress >= 1) {
                  setSS(prev => ({ ...prev, selectedPlanet: pid, laserTarget: null, laserDwellProgress: 0 }))
                  dwellPlanetRef.current = null
                  return
                }
                dwellRafRef.current = requestAnimationFrame(tick)
              }
              dwellRafRef.current = requestAnimationFrame(tick)
            }
            return { ...p, laserTarget: pid }
          }
          return { ...p, laserTarget: null }
        })
      }
    } else {
      if (dwellPlanetRef.current) cancelDwell()
      setSS(p => p.laserTarget ? { ...p, laserTarget: null, laserDwellProgress: 0 } : p)
    }

    // ── Spawn: any open palm when system not yet spawned ───────────────
    if (
      (gesture === 'open_palm') &&
      !gestureState.twoHandScale
    ) {
      setSS(p => {
        if (p.isSpawned || p.isSpawning) return p
        setTimeout(() => setSS(prev => ({ ...prev, isSpawned: true, isSpawning: false })), 1400)
        return { ...p, isSpawning: true }
      })
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gestureState])

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#00000c]">
      {/* Layer 0: Starfield canvas */}
      <SpaceBackground />

      {/* Layer 1: 3D Solar System */}
      <div className="absolute inset-0" style={{ zIndex: 10 }}>
        <ThreeCanvas
          solarSystem={ss}
          gesture={gestureState}
          onPlanetHover={handlePlanetHover}
          onPlanetSelect={handlePlanetSelect}
          onSystemUpdate={handleSystemUpdate}
        />
      </div>

      {/* Layer 2: Start screen */}
      <AnimatePresence>
        {!started && (
          <StartScreen isLoading={!isReady} onStart={handleStart} error={error} />
        )}
      </AnimatePresence>

      {/* Layer 3: In-game UI */}
      {started && (
        <>
          <TopNav
            fps={fps}
            isTracking={gestureState.isTracking}
            trackingQuality={gestureState.trackingQuality}
            onFullscreen={handleFullscreen}
            onSettings={() => {}}
          />

          <CameraFeed ref={videoRef} gestureState={gestureState} isTracking={gestureState.isTracking} />

          <HUD gesture={gestureState} solarSystem={ss} fps={fps} />

          <PlanetInfoOverlay
            planet={ss.selectedPlanet ? null : null}
            onClose={() => setSS(p => ({ ...p, selectedPlanet: null }))}
          />

          <GestureGuide />

          <GestureToast gesture={gestureState.gesture} />

          {/* Spawn prompt — shown after start until system spawns */}
          <AnimatePresence>
            {!ss.isSpawned && !ss.isSpawning && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ zIndex: 20 }}
              >
                <div className="text-center">
                  <motion.p
                    animate={{ opacity: [0.15, 0.5, 0.15] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="text-2xl font-bold tracking-[0.22em] text-white/20 font-mono uppercase"
                  >
                    Open Palm to Spawn
                  </motion.p>
                  <p className="text-xs text-cyan-400/15 font-mono mt-2 tracking-[0.3em]">
                    Hold either hand open toward the camera
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  )
}
