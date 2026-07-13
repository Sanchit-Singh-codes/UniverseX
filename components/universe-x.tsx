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
import { StoryDemo } from './ui/story-demo'
import { GestureToast } from './ui/gesture-toast'
import { PlanetInfoOverlay } from './ui/planet-info-overlay'
import { useHandTracking } from '@/hooks/use-hand-tracking'
import { useFPS } from '@/hooks/use-fps'
import type { SolarSystemState } from '@/lib/types'
import { PLANETS } from '@/lib/planet-data'

const ThreeCanvas = dynamic(() => import('./three-canvas'), { ssr: false })

const INITIAL_SOLAR_SYSTEM: SolarSystemState = {
  isSpawned: false,
  isSpawning: false,
  scale: 1.0,
  rotation: 0,
  selectedPlanet: null,
  hoveredPlanet: null,
  grabbedPlanet: null,
  planetOffset: null,
}

export default function UniverseX() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [hasStarted, setHasStarted] = useState(false)
  const [isDemoOpen, setIsDemoOpen] = useState(false)
  const [solarSystem, setSolarSystem] = useState<SolarSystemState>(INITIAL_SOLAR_SYSTEM)
  const fps = useFPS()

  const { gestureState, cameraStatus, modelStatus, error, startTracking, stopTracking } = useHandTracking(videoRef)

  // Store current orbit angles in a ref for nearest-planet lookups
  const orbitAnglesRef = useRef<Record<string, number>>(
    Object.fromEntries(PLANETS.map((p) => [p.id, Math.random() * Math.PI * 2]))
  )

  const handleStart = useCallback(async () => {
    setHasStarted(true)
    await startTracking()
    setSolarSystem((prev) => ({ ...prev, isSpawned: true }))
  }, [startTracking])

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
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }, [])

  // Gesture → Solar System logic: new 3-gesture model
  const prevHandDistanceRef = useRef<number | null>(null)

  useEffect(() => {
    const { leftGesture, rightGesture, hands } = gestureState
    if (!solarSystem.isSpawned) return

    // LEFT HAND: Closed → rotate, Open → stop
    if (leftGesture === 'closed_palm') {
      setSolarSystem((prev) => ({ ...prev, rotation: (prev.rotation + 0.015) % (Math.PI * 2) }))
    }

    // BOTH HANDS: measure distance between hands for zoom control
    if (hands.length === 2) {
      const hand1 = hands[0]
      const hand2 = hands[1]
      if (hand1.landmarks.length > 0 && hand2.landmarks.length > 0) {
        const p1 = hand1.landmarks[9]
        const p2 = hand2.landmarks[9]
        const currentDistance = Math.hypot(p1.x - p2.x, p1.y - p2.y, p1.z - p2.z)

        if (prevHandDistanceRef.current !== null) {
          const delta = currentDistance - prevHandDistanceRef.current
          const scaleDelta = delta * 0.5
          setSolarSystem((prev) => ({
            ...prev,
            scale: Math.max(0.3, Math.min(3.0, prev.scale + scaleDelta)),
          }))
        }
        prevHandDistanceRef.current = currentDistance
      }
    } else {
      prevHandDistanceRef.current = null
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gestureState, solarSystem.isSpawned])

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      {/* Layer 0: Star field background */}
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

      {/* Layer 2: Start Screen */}
      <AnimatePresence>
        {!hasStarted && (
          <StartScreen
            isLoading={hasStarted && modelStatus === 'loading'}
            onStart={handleStart}
            error={error}
            onWatchDemo={() => setIsDemoOpen(true)}
          />
        )}
      </AnimatePresence>

      {hasStarted && (
        <>
          {/* Top navigation */}
          <TopNav
            fps={fps}
            isTracking={gestureState.isTracking}
            trackingQuality={gestureState.trackingQuality}
            onFullscreen={handleFullscreen}
            onSettings={() => {}}
            onWatchDemo={() => setIsDemoOpen(true)}
          />

          {/* Bottom HUD */}
          <HUD
            gesture={gestureState}
            solarSystem={solarSystem}
            fps={fps}
          />

          {/* Small camera feed panel - top right corner */}
          <CameraFeed
            videoRef={videoRef}
            gestureState={gestureState}
            cameraStatus={cameraStatus}
            modelStatus={modelStatus}
          />

          {/* Planet info overlay — left side when selected */}
          <PlanetInfoOverlay
            planet={solarSystem.selectedPlanet
              ? PLANETS.find((p) => p.id === solarSystem.selectedPlanet) ?? null
              : null
            }
            onClose={() => setSolarSystem((prev) => ({ ...prev, selectedPlanet: null }))}
          />

          {/* Right side gesture guide */}
          <GestureGuide />

          {/* Gesture toast notifications */}
          <GestureToast gesture={gestureState.gesture} />

          {/* Instructions if solar system not yet spawned */}
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
                    animate={{ opacity: [0.2, 0.5, 0.2] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                    className="text-2xl font-bold tracking-[0.2em] text-white/30 font-mono uppercase"
                  >
                    Open Palm to Spawn Solar System
                  </motion.p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Story Demo Popup */}
      <StoryDemo isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </div>
  )
}
