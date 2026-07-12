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
  selectedPlanet: null,
  hoveredPlanet: null,
  grabbedPlanet: null,
  planetOffset: null,
}

export default function UniverseX() {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [hasStarted, setHasStarted] = useState(false)

  // Create the video element once imperatively so it is never unmounted by React
  useEffect(() => {
    if (videoRef.current) return
    const video = document.createElement('video')
    video.autoplay = true
    video.muted = true
    video.playsInline = true
    video.setAttribute('playsinline', '')
    video.style.position = 'fixed'
    video.style.top = '0'
    video.style.left = '0'
    video.style.width = '1px'
    video.style.height = '1px'
    video.style.opacity = '0'
    video.style.pointerEvents = 'none'
    video.style.zIndex = '-1'
    document.body.appendChild(video)
    videoRef.current = video
    return () => {
      if (video.parentElement) video.parentElement.removeChild(video)
    }
  }, [])
  const [solarSystem, setSolarSystem] = useState<SolarSystemState>(INITIAL_SOLAR_SYSTEM)
  const fps = useFPS()

  const { gestureState, isReady, error, startTracking, stopTracking } = useHandTracking(videoRef)

  // Track initial pinch scale
  const initialPinchRef = useRef<number | null>(null)
  const initialScaleRef = useRef(1.0)
  const prevGestureRef = useRef(gestureState.gesture)

  // Store current orbit angles in a ref for nearest-planet lookups
  // The solar system scene drives these — we read them via onSystemUpdate
  const orbitAnglesRef = useRef<Record<string, number>>(
    Object.fromEntries(PLANETS.map((p) => [p.id, Math.random() * Math.PI * 2]))
  )

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

  /**
   * Find the nearest planet to a normalized screen position (0-1, 0-1).
   * Maps finger position to approximate world-space and compares with orbit positions.
   */
  const findNearestPlanet = useCallback((normX: number, normY: number): string | null => {
    // Map normalized screen to approximate world XZ plane at Y=0
    // Camera is at ~(0, 18, 55) with fov=50, looking toward origin
    const worldX = (0.5 - normX) * 80 * solarSystem.scale
    const worldZ = (normY - 0.5) * 60 * solarSystem.scale

    let nearestId: string | null = null
    let nearestDist = Infinity

    for (const planet of PLANETS) {
      const angle = orbitAnglesRef.current[planet.id] ?? 0
      const px = Math.cos(angle) * planet.orbitRadius * solarSystem.scale
      const pz = Math.sin(angle) * planet.orbitRadius * solarSystem.scale
      const dx = worldX - px
      const dz = worldZ - pz
      const dist = Math.sqrt(dx * dx + dz * dz)
      if (dist < nearestDist) {
        nearestDist = dist
        nearestId = planet.id
      }
    }

    return nearestId
  }, [solarSystem.scale])

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
      }, 1400)
      return
    }

    // Fist → reset
    if (gesture === 'fist' && prevGesture !== 'fist') {
      setSolarSystem(INITIAL_SOLAR_SYSTEM)
      initialPinchRef.current = null
      return
    }

    // Point → highlight nearest planet using index fingertip position
    if (gesture === 'point' && solarSystem.isSpawned) {
      const primaryHand = hands[0]
      if (primaryHand) {
        const indexTip = primaryHand.landmarks[LANDMARK_INDICES.INDEX_TIP]
        const nearestId = findNearestPlanet(indexTip.x, indexTip.y)
        setSolarSystem((prev) => ({ ...prev, hoveredPlanet: nearestId }))
      }
    } else if (gesture !== 'point' && prevGesture === 'point') {
      // Clear hover when leaving point gesture
      setSolarSystem((prev) => ({ ...prev, hoveredPlanet: null }))
    }

    // Pinch → grab the hovered planet (or nearest)
    if (gesture === 'pinch' && prevGesture !== 'pinch' && solarSystem.isSpawned) {
      const pinchPt = gestureState.pinchPoint
      if (pinchPt && !solarSystem.grabbedPlanet) {
        const targetPlanet = solarSystem.hoveredPlanet ?? findNearestPlanet(pinchPt.x, pinchPt.y)
        if (targetPlanet) {
          const grabX = (0.5 - pinchPt.x) * 80 * solarSystem.scale
          const grabZ = (pinchPt.y - 0.5) * 60 * solarSystem.scale
          setSolarSystem((prev) => ({
            ...prev,
            grabbedPlanet: targetPlanet,
            planetOffset: { x: grabX, y: 2, z: grabZ },
          }))
        }
      }
    }

    // Update grabbed planet position while pinching
    if (gesture === 'pinch' && solarSystem.grabbedPlanet && gestureState.pinchPoint) {
      const px = gestureState.pinchPoint.x
      const py = gestureState.pinchPoint.y
      const worldX = (0.5 - px) * 80 * solarSystem.scale
      const worldZ = (py - 0.5) * 60 * solarSystem.scale
      setSolarSystem((prev) => ({
        ...prev,
        planetOffset: { x: worldX, y: 3, z: worldZ },
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

    // Open palm rotation → rotate system
    if (gesture === 'open_palm' && solarSystem.isSpawned && hands.length > 0) {
      setSolarSystem((prev) => ({ ...prev, rotation: handRotation * 2 }))
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gestureState])

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
          {/* Top navigation */}
          <TopNav
            fps={fps}
            isTracking={gestureState.isTracking}
            trackingQuality={gestureState.trackingQuality}
            onFullscreen={handleFullscreen}
            onSettings={() => {}}
          />

          {/* Camera feed with hand overlay - top right corner */}
          <CameraFeed
            videoRef={videoRef}
            gestureState={gestureState}
            isTracking={gestureState.isTracking}
          />

          {/* Bottom HUD */}
          <HUD
            gesture={gestureState}
            solarSystem={solarSystem}
            fps={fps}
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
                    Open Palm to Spawn
                  </motion.p>
                  <p className="text-xs text-cyan-400/20 font-mono mt-2 tracking-[0.3em]">
                    Point all five fingers at the screen
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
