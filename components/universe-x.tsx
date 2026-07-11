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
import type { SolarSystemState, GestureState } from '@/lib/types'
import { PLANETS } from '@/lib/planet-data'
import { LANDMARK_INDICES } from '@/lib/hand-tracker'

const ThreeCanvas = dynamic(() => import('./three-canvas'), { ssr: false })

const INITIAL_SOLAR_SYSTEM: SolarSystemState = {
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

const DWELL_TIME = 0.8 // seconds to auto-select

export default function UniverseX() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasStarted, setHasStarted] = useState(false)
  const [solarSystem, setSolarSystem] = useState<SolarSystemState>(INITIAL_SOLAR_SYSTEM)
  const fps = useFPS()

  const { gestureState, isReady, error, startTracking, stopTracking } = useHandTracking(videoRef)

  // ── Scale (two-hand) ──────────────────────────────────────────────────
  const prevPalmDistRef = useRef<number | null>(null)
  const baseScaleRef = useRef(1.0)

  // ── Laser dwell timer ─────────────────────────────────────────────────
  const dwellPlanetRef = useRef<string | null>(null)
  const dwellStartRef = useRef<number | null>(null)
  const dwellProgressRef = useRef(0)
  const dwellRafRef = useRef<number>(0)

  // ── Start flow ────────────────────────────────────────────────────────
  // After hasStarted + isReady are both true AND the video element has mounted,
  // call startTracking. We do this in an effect so React has had time to render
  // CameraFeed (which mounts the <video> the ref points to).
  const hasStartedRef = useRef(false)
  useEffect(() => { if (hasStarted) hasStartedRef.current = true }, [hasStarted])

  useEffect(() => {
    if (!hasStarted || !isReady) return
    // Small timeout lets React flush the DOM (mount <video>) before we grab it
    const t = setTimeout(() => { startTracking() }, 100)
    return () => clearTimeout(t)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasStarted, isReady])

  const handleStart = useCallback(() => {
    setHasStarted(true)
  }, [])

  // ── Planet callbacks (mouse / pointer events from Three.js) ──────────
  const handlePlanetHover = useCallback((id: string | null) => {
    setSolarSystem((prev) => ({ ...prev, hoveredPlanet: id }))
  }, [])

  const handlePlanetSelect = useCallback((id: string | null) => {
    setSolarSystem((prev) => ({
      ...prev,
      selectedPlanet: prev.selectedPlanet === id ? null : id,
    }))
  }, [])

  const handleSystemUpdate = useCallback((updates: Partial<SolarSystemState>) => {
    setSolarSystem((prev) => ({ ...prev, ...updates }))
  }, [])

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {})
    else document.exitFullscreen().catch(() => {})
  }, [])

  // ── Find nearest planet from right-hand index fingertip ──────────────
  const findNearestPlanetToFinger = useCallback((normX: number, normY: number, scale: number): string | null => {
    // Map normalized screen coords to approximate world XZ
    const worldX = (0.5 - normX) * 90 * scale
    const worldZ = (normY - 0.5) * 70 * scale
    let nearestId: string | null = null
    let nearestDist = Infinity
    // Only match within a reasonable radius (selection sphere)
    const SELECTION_RADIUS = 8 * scale
    for (const planet of PLANETS) {
      // We don't have live orbit angles here, so approximate with orbitRadius only
      // The scene drives actual positions — we use orbit radius in XZ as a proxy
      const dist = Math.sqrt(worldX * worldX + worldZ * worldZ) - planet.orbitRadius * scale
      const ringProximity = Math.abs(dist)
      if (ringProximity < SELECTION_RADIUS && ringProximity < nearestDist) {
        nearestDist = ringProximity
        nearestId = planet.id
      }
    }
    return nearestId
  }, [])

  // ── Dwell loop ────────────────────────────────────────────────────────
  const runDwell = useCallback((planetId: string) => {
    cancelAnimationFrame(dwellRafRef.current)
    dwellPlanetRef.current = planetId
    dwellStartRef.current = performance.now()

    const tick = () => {
      if (dwellPlanetRef.current !== planetId) return
      const elapsed = (performance.now() - (dwellStartRef.current ?? 0)) / 1000
      const progress = Math.min(elapsed / DWELL_TIME, 1)
      dwellProgressRef.current = progress
      setSolarSystem((prev) => ({ ...prev, laserDwellProgress: progress }))

      if (progress >= 1) {
        // Auto-select
        setSolarSystem((prev) => ({
          ...prev,
          selectedPlanet: planetId,
          laserTarget: null,
          laserDwellProgress: 0,
        }))
        dwellPlanetRef.current = null
        return
      }
      dwellRafRef.current = requestAnimationFrame(tick)
    }
    dwellRafRef.current = requestAnimationFrame(tick)
  }, [])

  const cancelDwell = useCallback(() => {
    cancelAnimationFrame(dwellRafRef.current)
    dwellPlanetRef.current = null
    dwellProgressRef.current = 0
    setSolarSystem((prev) => ({ ...prev, laserTarget: null, laserDwellProgress: 0 }))
  }, [])

  // ── Gesture → Solar System ────────────────────────────────────────────
  useEffect(() => {
    const { leftGesture, rightGesture, twoHandScale, hands, pinchDistance } = gestureState

    // ── BOTH HANDS: scale ──────────────────────────────────────────────
    if (twoHandScale) {
      if (prevPalmDistRef.current === null) {
        prevPalmDistRef.current = pinchDistance
        baseScaleRef.current = solarSystem.scale
      } else if (pinchDistance > 0.02) {
        const ratio = pinchDistance / prevPalmDistRef.current
        const newScale = Math.max(0.3, Math.min(3.5, baseScaleRef.current * ratio))
        setSolarSystem((prev) => ({ ...prev, scale: newScale }))
      }
      // While two hands are out, freeze individual hand logic
      return
    } else {
      // Freeze scale when hands stop/separate
      if (prevPalmDistRef.current !== null) {
        baseScaleRef.current = solarSystem.scale
        prevPalmDistRef.current = null
      }
    }

    // ── LEFT HAND: rotation control ────────────────────────────────────
    // closed_palm → start auto-rotation | open_palm → stop immediately
    if (leftGesture === 'closed_palm') {
      setSolarSystem((prev) => {
        if (prev.isAutoRotating) return prev
        return { ...prev, isAutoRotating: true }
      })
    } else if (leftGesture === 'open_palm') {
      setSolarSystem((prev) => {
        if (!prev.isAutoRotating) return prev
        return { ...prev, isAutoRotating: false }
      })
    }

    // ── RIGHT HAND: laser point ────────────────────────────────────────
    if (rightGesture === 'point') {
      const rightHand = hands.find((h) => h.handedness === 'Right')
      if (rightHand) {
        const indexTip = rightHand.landmarks[LANDMARK_INDICES.INDEX_TIP]
        const nearestId = findNearestPlanetToFinger(indexTip.x, indexTip.y, solarSystem.scale)

        if (nearestId) {
          // New target — start/continue dwell
          if (dwellPlanetRef.current !== nearestId) {
            runDwell(nearestId)
            setSolarSystem((prev) => ({ ...prev, laserTarget: nearestId, laserDwellProgress: 0 }))
          }
        } else {
          if (dwellPlanetRef.current !== null) cancelDwell()
        }
      }
    } else {
      // Right hand not pointing — cancel any dwell
      if (dwellPlanetRef.current !== null) cancelDwell()
    }

    // ── Spawn: any open palm (left or right) when nothing spawned ──────
    const anyOpenPalm = leftGesture === 'open_palm' || rightGesture === 'open_palm'
    if (anyOpenPalm && !solarSystem.isSpawned && !solarSystem.isSpawning) {
      setSolarSystem((prev) => ({ ...prev, isSpawning: true }))
      setTimeout(() => {
        setSolarSystem((prev) => ({ ...prev, isSpawned: true, isSpawning: false }))
      }, 1400)
    }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gestureState])

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#00000a]">
      {/* Layer 0: Star field */}
      <SpaceBackground />

      {/* Layer 1: 3D Solar System */}
      <div className="absolute inset-0" style={{ zIndex: 10 }}>
        <ThreeCanvas
          solarSystem={solarSystem}
          gesture={gestureState}
          onPlanetHover={handlePlanetHover}
          onPlanetSelect={handlePlanetSelect}
          onSystemUpdate={handleSystemUpdate}
        />
      </div>

      {/* Layer 2: UI */}
      <AnimatePresence>
        {!hasStarted && (
          <StartScreen
            isLoading={!isReady}
            onStart={handleStart}
            error={error}
          />
        )}
      </AnimatePresence>

      {hasStarted && (
        <>
          <TopNav
            fps={fps}
            isTracking={gestureState.isTracking}
            trackingQuality={gestureState.trackingQuality}
            onFullscreen={handleFullscreen}
            onSettings={() => {}}
          />

          <CameraFeed
            ref={videoRef}
            gestureState={gestureState}
            isTracking={gestureState.isTracking}
          />

          <HUD
            gesture={gestureState}
            solarSystem={solarSystem}
            fps={fps}
          />

          <PlanetInfoOverlay
            planet={
              solarSystem.selectedPlanet
                ? PLANETS.find((p) => p.id === solarSystem.selectedPlanet) ?? null
                : null
            }
            onClose={() => setSolarSystem((prev) => ({ ...prev, selectedPlanet: null }))}
          />

          <GestureGuide />

          <GestureToast gesture={gestureState.gesture} />

          {/* Spawn prompt */}
          <AnimatePresence>
            {!solarSystem.isSpawned && !solarSystem.isSpawning && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                style={{ zIndex: 30 }}
              >
                <div className="text-center">
                  <motion.p
                    animate={{ opacity: [0.18, 0.45, 0.18] }}
                    transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                    className="text-2xl font-bold tracking-[0.2em] text-white/25 font-mono uppercase"
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
