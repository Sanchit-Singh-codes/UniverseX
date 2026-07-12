'use client'

import { useRef, useMemo, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import type { PlanetData } from '@/lib/types'

interface PlanetProps {
  data: PlanetData
  isHovered: boolean
  isSelected: boolean
  isGrabbed: boolean
  grabOffset?: { x: number; y: number; z: number } | null
  systemRotation: number
  systemScale: number
  onHover: (id: string | null) => void
  onSelect: (id: string | null) => void
  orbitAngleRef: { current: number }
}

function SaturnRings({ innerRadius, outerRadius }: { innerRadius: number; outerRadius: number }) {
  const ringMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color('#c8a882'),
    transparent: true,
    opacity: 0.65,
    side: THREE.DoubleSide,
    depthWrite: false,
  }), [])

  const ringGeo = useMemo(() => {
    const geo = new THREE.RingGeometry(innerRadius, outerRadius, 128)
    // Taper opacity with UV-like trick using vertex colors
    return geo
  }, [innerRadius, outerRadius])

  return (
    <mesh geometry={ringGeo} material={ringMat} rotation={[Math.PI * 0.42, 0.1, 0.3]}>
    </mesh>
  )
}

function AtmosphereGlow({ radius, color }: { radius: number; color: string }) {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity: 0.12,
    side: THREE.BackSide,
    depthWrite: false,
  }), [color])

  return (
    <mesh material={mat}>
      <sphereGeometry args={[radius * 1.12, 32, 32]} />
    </mesh>
  )
}

function OrbitRing({ radius, hovered, selected }: { radius: number; hovered: boolean; selected: boolean }) {
  const color   = selected ? '#00ffff' : hovered ? '#88ddff' : '#2266aa'
  const opacity = selected ? 0.95 : hovered ? 0.75 : 0.45

  const mat = useMemo(() => new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
    linewidth: 2,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [color, opacity])

  const geo = useMemo(() => {
    const pts: THREE.Vector3[] = []
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius))
    }
    return new THREE.BufferGeometry().setFromPoints(pts)
  }, [radius])

  return <lineLoop geometry={geo} material={mat} />
}

function Moon({ planetRef }: { planetRef: React.RefObject<THREE.Group | null> }) {
  const moonRef = useRef<THREE.Mesh>(null)
  const moonAngleRef = useRef(Math.random() * Math.PI * 2)

  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#aaaaaa',
    emissive: '#111111',
    roughness: 0.95,
    metalness: 0.0,
  }), [])

  useFrame(() => {
    moonAngleRef.current += 0.025
    if (moonRef.current) {
      const r = 0.75
      moonRef.current.position.set(
        Math.cos(moonAngleRef.current) * r,
        Math.sin(moonAngleRef.current * 0.3) * 0.1,
        Math.sin(moonAngleRef.current) * r,
      )
      moonRef.current.rotation.y += 0.01
    }
  })

  return (
    <mesh ref={moonRef} material={mat} castShadow>
      <sphereGeometry args={[0.1, 16, 16]} />
    </mesh>
  )
}

export function Planet({
  data,
  isHovered,
  isSelected,
  isGrabbed,
  grabOffset,
  systemRotation,
  systemScale,
  onHover,
  onSelect,
  orbitAngleRef,
}: PlanetProps) {
  const groupRef = useRef<THREE.Group>(null!)
  const meshRef = useRef<THREE.Mesh>(null!)
  const glowRef = useRef<THREE.Mesh>(null)
  const particlesRef = useRef<THREE.Points>(null)

  const mat = useMemo(() => new THREE.MeshStandardMaterial({
    color: new THREE.Color(data.color),
    emissive: new THREE.Color(data.emissive ?? '#000000'),
    emissiveIntensity: 0.6,
    roughness: data.roughness ?? 0.8,
    metalness: data.metalness ?? 0.1,
  }), [data])

  const glowMat = useMemo(() => new THREE.MeshBasicMaterial({
    color: new THREE.Color(data.color),
    transparent: true,
    opacity: 0.0,
    side: THREE.BackSide,
    depthWrite: false,
  }), [data.color])

  const particleGeo = useMemo(() => {
    const count = 60
    const positions = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      const r = data.radius * (1.5 + Math.random() * 1.5)
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      positions[i * 3 + 2] = r * Math.cos(phi)
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return geo
  }, [data.radius])

  const particleMat = useMemo(() => new THREE.PointsMaterial({
    color: new THREE.Color(data.color),
    size: 0.04,
    transparent: true,
    opacity: 0.0,
    depthWrite: false,
    sizeAttenuation: true,
  }), [data.color])

  useFrame((state) => {
    const t = state.clock.elapsedTime

    if (!isGrabbed) {
      orbitAngleRef.current += data.orbitSpeed * 0.016
    }

    const angle = orbitAngleRef.current
    const orbitR = data.orbitRadius * systemScale
    const baseX = Math.cos(angle) * orbitR
    const baseZ = Math.sin(angle) * orbitR

    if (isGrabbed && grabOffset) {
      if (groupRef.current) {
        groupRef.current.position.x += (grabOffset.x - groupRef.current.position.x) * 0.1
        groupRef.current.position.y += (grabOffset.y - groupRef.current.position.y) * 0.1
        groupRef.current.position.z += (grabOffset.z - groupRef.current.position.z) * 0.1
      }
    } else {
      if (groupRef.current) {
        groupRef.current.position.x += (baseX - groupRef.current.position.x) * 0.05
        groupRef.current.position.y += (0 - groupRef.current.position.y) * 0.05
        groupRef.current.position.z += (baseZ - groupRef.current.position.z) * 0.05
      }
    }

    if (meshRef.current) {
      meshRef.current.rotation.y += data.rotationSpeed
      const targetScale = isGrabbed ? 1.4 : isHovered ? 1.15 : 1.0
      meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.08)
    }

    if (glowMat) {
      const targetOpacity = isGrabbed ? 0.4 : isHovered ? 0.25 : isSelected ? 0.15 : 0.0
      glowMat.opacity += (targetOpacity - glowMat.opacity) * 0.1
    }

    if (particleMat) {
      const targetOpacity = isHovered || isGrabbed ? 0.6 : 0.0
      particleMat.opacity += (targetOpacity - particleMat.opacity) * 0.08
    }

    if (particlesRef.current) {
      particlesRef.current.rotation.y += 0.01
      particlesRef.current.rotation.x += 0.005
    }

    // Emissive pulse when hovered
    if (mat) {
      const targetEmissive = isGrabbed ? 1.5 : isHovered ? 0.8 : 0.3
      mat.emissiveIntensity += (targetEmissive - mat.emissiveIntensity) * 0.1
    }
  })

  return (
    <group ref={groupRef}>
      <OrbitRing
        radius={data.orbitRadius * systemScale}
        hovered={isHovered}
        selected={isSelected}
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
        <sphereGeometry args={[data.radius, 48, 48]} />
      </mesh>

      {/* Glow overlay */}
      <mesh ref={glowRef} material={glowMat}>
        <sphereGeometry args={[data.radius * 1.25, 32, 32]} />
      </mesh>

      {/* Atmosphere */}
      {data.atmosphereColor && (
        <AtmosphereGlow radius={data.radius} color={data.atmosphereColor} />
      )}

      {/* Saturn rings */}
      {data.hasRings && (
        <SaturnRings innerRadius={data.radius * 1.3} outerRadius={data.radius * 2.4} />
      )}

      {/* Moon */}
      {data.hasMoon && <Moon planetRef={groupRef as React.RefObject<THREE.Group>} />}

      {/* Hover particles */}
      <points ref={particlesRef} geometry={particleGeo} material={particleMat} />
    </group>
  )
}
