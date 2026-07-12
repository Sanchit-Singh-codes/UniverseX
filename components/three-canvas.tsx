'use client'

import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing'
import { BlendFunction } from 'postprocessing'
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
      camera={{ position: [0, 35, 90], fov: 55, near: 0.1, far: 1000 }}
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
      <fog attach="fog" args={['#000008', 120, 380]} />

      <SolarSystemScene
        solarSystem={solarSystem}
        gesture={gesture}
        onPlanetHover={onPlanetHover}
        onPlanetSelect={onPlanetSelect}
        onSystemUpdate={onSystemUpdate}
      />

      {/* Post-processing effects */}
      <EffectComposer>
        <Bloom
          intensity={1.4}
          luminanceThreshold={0.2}
          luminanceSmoothing={0.7}
          mipmapBlur
        />
        <ChromaticAberration
          blendFunction={BlendFunction.NORMAL}
          offset={[0.0003, 0.0003]}
          radialModulation={false}
          modulationOffset={0}
        />
        <Vignette
          offset={0.4}
          darkness={0.7}
          blendFunction={BlendFunction.NORMAL}
        />
      </EffectComposer>
    </Canvas>
  )
}
