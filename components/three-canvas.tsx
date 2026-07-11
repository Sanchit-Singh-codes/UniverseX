'use client'

import { Canvas } from '@react-three/fiber'
import { SolarSystemScene } from './solar-system/solar-system-scene'
import type { SolarSystemState, GestureState } from '@/lib/types'

interface ThreeCanvasProps {
  solarSystem: SolarSystemState
  gesture: GestureState
  onPlanetHover: (id: string | null) => void
  onPlanetSelect: (id: string | null) => void
  onSystemUpdate: (updates: Partial<SolarSystemState>) => void
}

export default function ThreeCanvas({
  solarSystem,
  gesture,
  onPlanetHover,
  onPlanetSelect,
  onSystemUpdate,
}: ThreeCanvasProps) {
  return (
    <Canvas
      camera={{ position: [0, 18, 55], fov: 50, near: 0.1, far: 1000 }}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        logarithmicDepthBuffer: true,
      }}
      shadows
      style={{ background: 'transparent' }}
      className="absolute inset-0"
    >
      <fog attach="fog" args={['#000008', 80, 260]} />
      <SolarSystemScene
        solarSystem={solarSystem}
        gesture={gesture}
        onPlanetHover={onPlanetHover}
        onPlanetSelect={onPlanetSelect}
        onSystemUpdate={onSystemUpdate}
      />
    </Canvas>
  )
}
