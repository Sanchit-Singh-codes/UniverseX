'use client'

import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface SunProps {
  radius: number
  visible: boolean
}

export function Sun({ radius, visible }: SunProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  const glowRef = useRef<THREE.Mesh>(null)
  const coronaRef = useRef<THREE.Mesh>(null)
  const flare1Ref = useRef<THREE.Mesh>(null)
  const flare2Ref = useRef<THREE.Mesh>(null)

  const sunMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#fff3a8'),
      emissive: new THREE.Color('#ff6600'),
      emissiveIntensity: 2.5,
      roughness: 0.3,
      metalness: 0.0,
    })
  }, [])

  const glowMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color('#ff8800'),
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
      depthWrite: false,
    })
  }, [])

  const coronaMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color('#ffaa00'),
      transparent: true,
      opacity: 0.06,
      side: THREE.BackSide,
      depthWrite: false,
    })
  }, [])

  const flareMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: new THREE.Color('#ff4400'),
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
    })
  }, [])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.002
    }
    if (glowRef.current) {
      const pulse = 1 + Math.sin(t * 1.5) * 0.04
      glowRef.current.scale.setScalar(pulse)
    }
    if (coronaRef.current) {
      const pulse = 1 + Math.sin(t * 0.8 + 1) * 0.06
      coronaRef.current.scale.setScalar(pulse)
    }
    if (flare1Ref.current) {
      flare1Ref.current.rotation.z = t * 0.3
      const s = 0.8 + Math.sin(t * 2) * 0.3
      flare1Ref.current.scale.setScalar(s)
      if (flareMaterial) flareMaterial.opacity = 0.2 + Math.sin(t * 2) * 0.2
    }
    if (flare2Ref.current) {
      flare2Ref.current.rotation.z = -t * 0.2
      const s = 0.6 + Math.sin(t * 1.5 + 2) * 0.3
      flare2Ref.current.scale.setScalar(s)
    }
  })

  if (!visible) return null

  return (
    <group>
      {/* Point light from sun */}
      <pointLight
        color="#ffcc66"
        intensity={180}
        distance={200}
        decay={1.2}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />

      {/* Sun sphere */}
      <mesh ref={meshRef} castShadow material={sunMaterial}>
        <sphereGeometry args={[radius, 64, 64]} />
      </mesh>

      {/* Inner glow */}
      <mesh ref={glowRef} material={glowMaterial}>
        <sphereGeometry args={[radius * 1.18, 32, 32]} />
      </mesh>

      {/* Corona */}
      <mesh ref={coronaRef} material={coronaMaterial}>
        <sphereGeometry args={[radius * 1.5, 32, 32]} />
      </mesh>

      {/* Solar flares */}
      <mesh ref={flare1Ref} material={flareMaterial} position={[0, 0, 0]}>
        <torusGeometry args={[radius * 1.1, radius * 0.08, 8, 32]} />
      </mesh>
      <mesh ref={flare2Ref} material={flareMaterial} position={[0, 0, 0]}>
        <torusGeometry args={[radius * 1.3, radius * 0.05, 8, 32]} />
      </mesh>
    </group>
  )
}
