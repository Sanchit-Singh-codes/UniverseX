'use client'

import { useRef, useMemo, useCallback, useState } from 'react'
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

// Spawn animation particles
function SpawnParticles({ active }: { active: boolean }) {
  const pointsRef = useRef<THREE.Points>(null)
  const countRef = useRef(0)

  const geo = useMemo(() => {
    const count = 400
    const positions = new Float32Array(count * 3)
    const velocities = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      const r = Math.random() * 5
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)
      const speed = 0.5 + Math.random() * 1.5
      velocities[i * 3] = (Math.random() - 0.5) * speed
      velocities[i * 3 + 1] = (Math.random() - 0.5) * speed
      velocities[i * 3 + 2] = (Math.random() - 0.5) * speed
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    g.userData.velocities = velocities
    return g
  }, [])

  const mat = useMemo(() => new THREE.PointsMaterial({
    color: '#00f5ff',
    size: 0.08,
    transparent: true,
    opacity: 0.8,
    depthWrite: false,
    sizeAttenuation: true,
  }), [])

  useFrame((_, delta) => {
    if (!active || !pointsRef.current) return
    countRef.current += delta
    const positions = geo.getAttribute('position') as THREE.BufferAttribute
    const velocities = geo.userData.velocities as Float32Array
    for (let i = 0; i < positions.count; i++) {
      positions.setXYZ(
        i,
        positions.getX(i) + velocities[i * 3] * delta,
        positions.getY(i) + velocities[i * 3 + 1] * delta,
        positions.getZ(i) + velocities[i * 3 + 2] * delta,
      )
    }
    positions.needsUpdate = true
    mat.opacity = Math.max(0, 0.8 - countRef.current * 0.5)
  })

  if (!active) return null

  return <points ref={pointsRef} geometry={geo} material={mat} />
}

// Space dust floating particles
function SpaceDust() {
  const ref = useRef<THREE.Points>(null)
  const geo = useMemo(() => {
    const count = 800
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 120
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40
      positions[i * 3 + 2] = (Math.random() - 0.5) * 120
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return g
  }, [])

  const mat = useMemo(() => new THREE.PointsMaterial({
    color: '#4488aa',
    size: 0.05,
    transparent: true,
    opacity: 0.35,
    depthWrite: false,
    sizeAttenuation: true,
  }), [])

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.005
    }
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

  // Camera target for planet focus
  const cameraTarget = useRef<THREE.Vector3>(new THREE.Vector3(0, 8, 40))
  const cameraPos = useRef<THREE.Vector3>(new THREE.Vector3(0, 8, 40))

  // Animated spawn scale — spring from 0 to target
  const animatedScaleRef = useRef(0.001)

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime

    // Always spring the animated scale toward target
    const targetScale = solarSystem.isSpawned ? solarSystem.scale : 0.0001
    animatedScaleRef.current += (targetScale - animatedScaleRef.current) * 0.07

    if (!solarSystem.isSpawned && !solarSystem.isSpawning) return

    // Apply system rotation + animated scale
    if (groupRef.current) {
      const targetRot = solarSystem.rotation
      groupRef.current.rotation.y += (targetRot - groupRef.current.rotation.y) * 0.05
      const s = animatedScaleRef.current
      groupRef.current.scale.set(s, s, s)
    }

    // Camera smooth motion
    if (solarSystem.selectedPlanet) {
      const planet = PLANETS.find((p) => p.id === solarSystem.selectedPlanet)
      if (planet) {
        const angle = orbitAngles.current[planet.id]?.current ?? 0
        const px = Math.cos(angle) * planet.orbitRadius * solarSystem.scale
        const pz = Math.sin(angle) * planet.orbitRadius * solarSystem.scale
        cameraTarget.current.set(px, 0, pz)
        const dist = planet.radius * 8 + 4
        cameraPos.current.set(px + dist, planet.radius * 3, pz + dist)
      }
    } else {
      cameraTarget.current.set(0, 0, 0)
      cameraPos.current.set(0, 18, 55)
    }

    camera.position.lerp(cameraPos.current, 0.03)
    camera.lookAt(cameraTarget.current)
  })

  return (
    <group ref={groupRef}>
      <SpaceDust />
      <SpawnParticles active={solarSystem.isSpawning} />
      <ambientLight intensity={0.06} color="#112244" />
      <Sun radius={SUN_DATA.radius} visible={solarSystem.isSpawned} />

      {PLANETS.map((planet) => (
        <Planet
          key={planet.id}
          data={planet}
          isHovered={solarSystem.hoveredPlanet === planet.id}
          isSelected={solarSystem.selectedPlanet === planet.id}
          isGrabbed={solarSystem.grabbedPlanet === planet.id}
          grabOffset={solarSystem.grabbedPlanet === planet.id ? solarSystem.planetOffset : null}
          systemRotation={solarSystem.rotation}
          systemScale={solarSystem.scale}
          onHover={onPlanetHover}
          onSelect={onPlanetSelect}
          orbitAngleRef={orbitAngles.current[planet.id] as React.MutableRefObject<number>}
        />
      ))}
    </group>
  )
}
