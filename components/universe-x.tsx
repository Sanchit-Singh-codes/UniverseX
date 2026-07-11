'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import SpaceBackground from './space-background'
import CameraFeed from './camera-feed'
import { TopNav } from './ui/top-nav'
import { HUD } from './ui/hud'
import { GestureGuide } from './ui/gesture-guide'
import { StartScreen } from './ui/start-screen'
import { GestureToast } from './ui/gesture-toast'
import { useHandTracking } from '@/hooks/use-hand-tracking'
import { useFPS } from '@/hooks/use-fps'
import type { SolarSystemState, GestureState } from '@/lib/types'
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
  const videoRef = useRef<HTMLVideoElement>(null)
  const [hasStarted, setHasStarted] = useState(false)
  const [solarSystem, setSolarSystem] = useState<SolarSystemState>(INITIAL_SOLAR_SYSTEM)
  const fps = useFPS()

  const { gestureState, isReady, error, startTracking, stopTracking } = useHandTracking(videoRef)

  // Track initial pinch scale
  const initialPinchRef = useRef<number | null>(null)
  const initialScaleRef = useRef(1.0)
  const prevGestureRef = useRef(gestureState.gesture)

  const handleStart = useCallback(async () => {
    setHasStarted(true)
    await startTracking()
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

  // Gesture → Solar System logic
  useEffect(() => {
    const { gesture, hands, pinchDistance, handRotation } = gestureState
    const prevGesture = prevGestureRef.current
    prevGestureRef.current = gesture

    // Open Palm → spawn
    if (gesture === 'open_palm' && prevGesture !== 'open_palm' && !solarSystem.isSpawned && !solarSystem.isSpawning) {
      setSolarSystem((prev) => ({ ...prev, isSpawning: true }))
      setTimeout(() => {
        setSolarSystem((prev) => ({ ...prev, isSpawned: true, isSpawning: false }))
      }, 1500)
      return
    }

    // Fist → reset
    if (gesture === 'fist' && prevGesture !== 'fist') {
      setSolarSystem(INITIAL_SOLAR_SYSTEM)
      initialPinchRef.current = null
      return
    }

    // Pinch → grab nearest planet
    if (gesture === 'pinch' && prevGesture !== 'pinch' && solarSystem.isSpawned) {
      const pinchPt = gestureState.pinchPoint
      if (pinchPt && !solarSystem.grabbedPlanet) {
        // Find nearest planet based on pinch position (normalized to -1..1)
        const nearestPlanet = PLANETS[0]?.id ?? null
        if (nearestPlanet) {
          const grabX = (pinchPt.x - 0.5) * 40
          const grabY = -(pinchPt.y - 0.5) * 30
          setSolarSystem((prev) => ({
            ...prev,
            grabbedPlanet: solarSystem.hoveredPlanet ?? nearestPlanet,
            planetOffset: { x: grabX, y: grabY, z: 0 },
          }))
        }
      }
    }

    // Update grabbed planet position while pinching
    if (gesture === 'pinch' && solarSystem.grabbedPlanet && gestureState.pinchPoint) {
      const px = gestureState.pinchPoint.x
      const py = gestureState.pinchPoint.y
      const worldX = (1 - px - 0.5) * 40
      const worldY = -(py - 0.5) * 30
      setSolarSystem((prev) => ({
        ...prev,
        planetOffset: { x: worldX, y: worldY, z: 2 },
      }))
    }

    // Release pinch → return planet to orbit
    if (gesture !== 'pinch' && prevGesture === 'pinch' && solarSystem.grabbedPlanet) {
      setSolarSystem((prev) => ({
        ...prev,
        grabbedPlanet: null,
        planetOffset: null,
      }))
    }

    // Two-hand pinch → resize
    if (gesture === 'two_hand_pinch' && solarSystem.isSpawned) {
      if (initialPinchRef.current === null) {
        initialPinchRef.current = pinchDistance
        initialScaleRef.current = solarSystem.scale
      } else if (pinchDistance > 0.01) {
        const ratio = pinchDistance / initialPinchRef.current
        const newScale = Math.max(0.3, Math.min(3.0, initialScaleRef.current * ratio))
        setSolarSystem((prev) => ({ ...prev, scale: newScale }))
      }
    } else {
      initialPinchRef.current = null
    }

    // Hand rotation → rotate system
    if (gesture === 'open_palm' && solarSystem.isSpawned && hands.length > 0) {
      setSolarSystem((prev) => ({ ...prev, rotation: handRotation * 2 }))
    }
  }, [gestureState, solarSystem.isSpawned, solarSystem.isSpawning, solarSystem.hoveredPlanet, solarSystem.grabbedPlanet, solarSystem.scale])

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#000008]">
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

      {/* Layer 2: UI overlays */}
      <AnimatePresence>
        {!hasStarted && (
          <StartScreen
            isLoading={hasStarted && !isReady}
            onStart={handleStart}
            error={error}
          />
        )}
      </AnimatePresence>

      {hasStarted && (
        <>
          {/* Hidden video element for MediaPipe */}
          <video
            ref={videoRef}
            className="absolute opacity-0 pointer-events-none"
            style={{ width: 1, height: 1, zIndex: -1 }}
          />

          {/* Top navigation */}
          <TopNav
            fps={fps}
            isTracking={gestureState.isTracking}
            trackingQuality={gestureState.trackingQuality}
            onFullscreen={handleFullscreen}
            onSettings={() => {}}
          />

          {/* Camera feed with hand overlay */}
          <CameraFeed
            ref={videoRef}
            gestureState={gestureState}
            isTracking={gestureState.isTracking}
          />

          {/* Bottom HUD */}
          <HUD
            gesture={gestureState}
            solarSystem={solarSystem}
            fps={fps}
          />

          {/* Right side gesture guide */}
          <GestureGuide />

          {/* Gesture toast notifications */}
          <GestureToast gesture={gestureState.gesture} />

          {/* Instructions if solar system not yet spawned */}
          {!solarSystem.isSpawned && !solarSystem.isSpawning && (
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              style={{ zIndex: 30 }}
            >
              <div className="text-center">
                <p className="text-2xl font-bold tracking-widest text-white/20 font-mono uppercase">
                  Show Open Palm to Spawn
                </p>
                <p className="text-sm text-cyan-400/20 font-mono mt-2 tracking-wider">
                  Point all five fingers at the screen
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
