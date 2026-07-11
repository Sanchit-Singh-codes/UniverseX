'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { PlanetData } from '@/lib/types'

interface PlanetProps {
  data: PlanetData
  isHovered: boolean
  isSelected: boolean
  isLaserTarget: boolean
  laserDwellProgress: number // 0-1
  systemScale: number
  onHover: (id: string | null) => void
  onSelect: (id: string | null) => void
  orbitAngleRef: { current: number }
}

function SaturnRings({ radius }: { radius: number }) {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color('#d4b896'),
    transparent: true,
    opacity: 0.72,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), [])

  // Three layered rings for richness
  return (
    <group rotation={[Math.PI * 0.42, 0.1, 0.25]}>
      <mesh material={mat}>
        <ringGeometry args={[radius * 1.28, radius * 1.9, 128]} />
      </mesh>
      <mesh material={useMemo(() => new THREE.MeshBasicMaterial({ color: '#c8a878', transparent: true, opacity: 0.45, side: THREE.DoubleSide, depthWrite: false }), [])}>
        <ringGeometry args={[radius * 1.9, radius * 2.5, 128]} />
      </mesh>
      <mesh material={useMemo(() => new THREE.MeshBasicMaterial({ color: '#b09060', transparent: true, opacity: 0.25, side: THREE.DoubleSide, depthWrite: false }), [])}>
        <ringGeometry args={[radius * 2.5, radius * 3.1, 128]} />
      </mesh>
    </group>
  )
}

function AtmosphereGlow({ radius, color }: { radius: number; color: string }) {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity: 0.1,
    side: THREE.BackSide,
    depthWrite: false,
  }), [color])
  return <mesh material={mat}><sphereGeometry args={[radius * 1.1, 32, 32]} /></mesh>
}

function OrbitRing({ radius, hovered, selected, laserTarget }: { radius: number; hovered: boolean; selected: boolean; laserTarget: boolean }) {
  const color = selected ? '#00f5ff' : laserTarget ? '#4db8ff' : hovered ? '#3388cc' : '#162840'
  const opacity = selected ? 0.75 : laserTarget ? 0.6 : hovered ? 0.45 : 0.18
  const mat = useMemo(() => new THREE.LineBasicMaterial({ color, transparent: true, opacity, linewidth: 1 }), [color, opacity])
  const points = useMemo(() => {
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius))
    }
    return pts
  }, [radius])
  const geo = useMemo(() => new THREE.BufferGeometry().setFromPoints(points), [points])
  return <lineLoop geometry={geo} material={mat} />
}

function Moon() {
  const moonRef = useRef<THREE.Mesh>(null)
  const angleRef = useRef(Math.random() * Math.PI * 2)
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#aaaaaa', roughness: 0.95, metalness: 0 }), [])
  useFrame(() => {
    angleRef.current += 0.022
    if (moonRef.current) {
      moonRef.current.position.set(
        Math.cos(angleRef.current) * 0.9,
        Math.sin(angleRef.current * 0.25) * 0.08,
        Math.sin(angleRef.current) * 0.9,
      )
    }
  })
  return <mesh ref={moonRef} material={mat} castShadow><sphereGeometry args={[0.12, 16, 16]} /></mesh>
}

// Animated dwell ring — fills in a circle arc over 0.8s as progress goes 0→1
function DwellRing({ radius, progress }: { radius: number; progress: number }) {
  const ringRef = useRef<THREE.Mesh>(null)

  const mat = useMemo(() => new THREE.MeshBasicMaterial({
    color: '#00e5ff',
    transparent: true,
    opacity: 0.9,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), [])

  // Rebuild arc geometry each frame based on progress
  const arcGeo = useMemo(() => {
    const thetaLength = progress * Math.PI * 2
    return new THREE.RingGeometry(radius * 1.42, radius * 1.55, 80, 1, 0, thetaLength)
  }, [radius, progress])

  useFrame(() => {
    if (ringRef.current) {
      ringRef.current.rotation.y = Math.PI / 2
    }
  })

  if (progress <= 0) return null

  return (
    <mesh ref={ringRef} geometry={arcGeo} material={mat} rotation={[Math.PI / 2, 0, 0]}>
    </mesh>
  )
}

export function Planet({
  data,
  isHovered,
  isSelected,
  isLaserTarget,
  laserDwellProgress,
  systemScale,
  onHover,
  onSelect,
  orbitAngleRef,
}: PlanetProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const meshRef = useRef<THREE.Mesh>(null!)

  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color(data.color),
    emissive: new THREE.Color(data.emissive ?? '#000000'),
    emissiveIntensity: 0.3,
    roughness: data.roughness ?? 0.8,
    metalness: data.metalness ?? 0.1,
  }), [data])

  const glowMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color(data.color),
    transparent: true,
    opacity: 0,
    side: THREE.BackSide,
    depthWrite: false,
  }), [data.color])

  useFrame(() => {
    orbitAngleRef.current += data.orbitSpeed * 0.016

    const angle = orbitAngleRef.current
    const orbitR = data.orbitRadius * systemScale
    const targetX = Math.cos(angle) * orbitR
    const targetZ = Math.sin(angle) * orbitR

    if (groupRef.current) {
      groupRef.current.position.x += (targetX - groupRef.current.position.x) * 0.06
      groupRef.current.position.y += (0 - groupRef.current.position.y) * 0.06
      groupRef.current.position.z += (targetZ - groupRef.current.position.z) * 0.06
    }

    if (meshRef.current) {
      meshRef.current.rotation.y += data.rotationSpeed
      // 15% scale increase when laser-targeted or hovered
      const targetScale = isSelected ? 1.2 : (isLaserTarget || isHovered) ? 1.15 : 1.0
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.09)
    }

    if (glowMat) {
      const targetOpacity = isSelected ? 0.22 : (isLaserTarget || isHovered) ? 0.18 : 0
      glowMat.opacity += (targetOpacity - glowMat.opacity) * 0.1
    }

    if (mat) {
      const targetEmissive = isSelected ? 1.2 : (isLaserTarget || isHovered) ? 0.75 : 0.3
      mat.emissiveIntensity += (targetEmissive - mat.emissiveIntensity) * 0.1
    }
  })

  return (
    <group ref={groupRef}>
      <OrbitRing
        radius={data.orbitRadius * systemScale}
        hovered={isHovered}
        selected={isSelected}
        laserTarget={isLaserTarget}
      />

      <mesh
        ref={meshRef}
        material={mat}
        castShadow
        receiveShadow
        onPointerEnter={(e) => { e.stopPropagation(); onHover(data.id) }}
        onPointerLeave={() => onHover(null)}
        onClick={(e) => { e.stopPropagation(); onSelect(data.id) }}
      >
        <sphereGeometry args={[data.radius, 52, 52]} />
      </mesh>

      {/* Glow */}
      <mesh material={glowMat}>
        <sphereGeometry args={[data.radius * 1.28, 32, 32]} />
      </mesh>

      {/* Atmosphere */}
      {data.atmosphereColor && <AtmosphereGlow radius={data.radius} color={data.atmosphereColor} />}

      {/* Saturn rings */}
      {data.hasRings && <SaturnRings radius={data.radius} />}

      {/* Moon */}
      {data.hasMoon && <Moon />}

      {/* Dwell progress ring */}
      {isLaserTarget && laserDwellProgress > 0 && (
        <DwellRing radius={data.radius} progress={laserDwellProgress} />
      )}
    </group>
  )
}
