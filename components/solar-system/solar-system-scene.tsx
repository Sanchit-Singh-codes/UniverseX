'use client'

import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { Sun } from './sun'
import { Planet } from './planet'
import { PLANETS, SUN_DATA } from '@/lib/planet-data'
import type { SolarSystemState, GestureState } from '@/lib/types'

interface SolarSystemSceneProps {
  solarSystem: SolarSystemState
  gesture: GestureState
  onPlanetHover: (id: string | null) => void
  onPlanetSelect: (id: string | null) => void
  onSystemUpdate: (updates: Partial<SolarSystemState>) => void
}

// Spawn burst particles
function SpawnParticles({ active }: { active: boolean }) {
  const ref = useRef<THREE.Points>(null)
  const lifeRef = useRef(0)

  const geo = useMemo(() => {
    const count = 300
    const pos = new Float32Array(count * 3)
    const vel = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = Math.random() * 4
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi)
      const spd = 0.4 + Math.random() * 1.2
      vel[i * 3] = (Math.random() - 0.5) * spd
      vel[i * 3 + 1] = (Math.random() - 0.5) * spd
      vel[i * 3 + 2] = (Math.random() - 0.5) * spd
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.userData.vel = vel
    return g
  }, [])

  const mat = useMemo(() => new THREE.PointsMaterial({
    color: '#00e5ff', size: 0.07, transparent: true, opacity: 0.9, depthWrite: false, sizeAttenuation: true,
  }), [])

  useFrame((_, delta) => {
    if (!active || !ref.current) return
    lifeRef.current += delta
    const pos = geo.getAttribute('position') as THREE.BufferAttribute
    const vel = geo.userData.vel as Float32Array
    for (let i = 0; i < pos.count; i++) {
      pos.setXYZ(i, pos.getX(i) + vel[i * 3] * delta, pos.getY(i) + vel[i * 3 + 1] * delta, pos.getZ(i) + vel[i * 3 + 2] * delta)
    }
    pos.needsUpdate = true
    mat.opacity = Math.max(0, 0.9 - lifeRef.current * 0.6)
  })

  if (!active) return null
  return <points ref={ref} geometry={geo} material={mat} />
}

// Subtle floating space dust inside the scene
function SpaceDust() {
  const ref = useRef<THREE.Points>(null)
  const geo = useMemo(() => {
    const count = 500
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 160
      pos[i * 3 + 1] = (Math.random() - 0.5) * 30
      pos[i * 3 + 2] = (Math.random() - 0.5) * 160
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    return g
  }, [])
  const mat = useMemo(() => new THREE.PointsMaterial({
    color: '#334466', size: 0.04, transparent: true, opacity: 0.3, depthWrite: false, sizeAttenuation: true,
  }), [])
  useFrame((state) => {
    if (ref.current) ref.current.rotation.y = state.clock.elapsedTime * 0.003
  })
  return <points ref={ref} geometry={geo} material={mat} />
}

export function SolarSystemScene({
  solarSystem,
  gesture,
  onPlanetHover,
  onPlanetSelect,
  onSystemUpdate,
}: SolarSystemSceneProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const { camera } = useThree()

  // Per-planet orbit angle refs
  const orbitAngles = useRef<Record<string, { current: number }>>(
    Object.fromEntries(PLANETS.map((p) => [p.id, { current: Math.random() * Math.PI * 2 }]))
  )

  // Camera targets
  const camPosTarget = useRef(new THREE.Vector3(0, 18, 60))
  const camLookTarget = useRef(new THREE.Vector3(0, 0, 0))
  const camPos = useRef(new THREE.Vector3(0, 18, 60))
  const camLook = useRef(new THREE.Vector3(0, 0, 0))

  // Spawn scale spring
  const animScale = useRef(0.001)

  // Auto-rotation accumulator
  const autoRotRef = useRef(0)

  useFrame((_, delta) => {
    // Spring spawn scale
    const targetScale = solarSystem.isSpawned ? solarSystem.scale : 0.0001
    animScale.current += (targetScale - animScale.current) * 0.07

    if (!solarSystem.isSpawned && !solarSystem.isSpawning) return

    if (groupRef.current) {
      // Auto-rotation (left closed palm = rotate, left open palm = stop)
      if (solarSystem.isAutoRotating) {
        autoRotRef.current += delta * 0.18
      }
      // Manual rotation from universe-x can also override via solarSystem.rotation
      groupRef.current.rotation.y = autoRotRef.current + solarSystem.rotation
      const s = animScale.current
      groupRef.current.scale.set(s, s, s)
    }

    // Camera smooth fly-to
    if (solarSystem.selectedPlanet) {
      const planet = PLANETS.find((p) => p.id === solarSystem.selectedPlanet)
      if (planet) {
        const angle = orbitAngles.current[planet.id]?.current ?? 0
        const px = Math.cos(angle) * planet.orbitRadius * solarSystem.scale
        const pz = Math.sin(angle) * planet.orbitRadius * solarSystem.scale
        const dist = planet.radius * 7 + 5
        camPosTarget.current.set(px + dist, planet.radius * 2.5, pz + dist)
        camLookTarget.current.set(px, 0, pz)
      }
    } else {
      camPosTarget.current.set(0, 18, 60)
      camLookTarget.current.set(0, 0, 0)
    }

    // Eased camera interpolation
    camPos.current.lerp(camPosTarget.current, 0.025)
    camLook.current.lerp(camLookTarget.current, 0.025)
    camera.position.copy(camPos.current)
    camera.lookAt(camLook.current)
  })

  return (
    <group ref={groupRef}>
      <SpaceDust />
      <SpawnParticles active={solarSystem.isSpawning} />
      <ambientLight intensity={0.07} color="#0a1a33" />
      <Sun radius={SUN_DATA.radius} visible={solarSystem.isSpawned} />

      {PLANETS.map((planet) => (
        <Planet
          key={planet.id}
          data={planet}
          isHovered={solarSystem.hoveredPlanet === planet.id}
          isSelected={solarSystem.selectedPlanet === planet.id}
          isLaserTarget={solarSystem.laserTarget === planet.id}
          laserDwellProgress={solarSystem.laserTarget === planet.id ? solarSystem.laserDwellProgress : 0}
          systemScale={solarSystem.scale}
          onHover={onPlanetHover}
          onSelect={onPlanetSelect}
          orbitAngleRef={orbitAngles.current[planet.id]}
        />
      ))}
    </group>
  )
}
