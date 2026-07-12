'use client'

import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface OrbitDustProps {
  radius: number
  particleCount: number
  color: string
}

export function OrbitDust({ radius, particleCount, color }: OrbitDustProps) {
  const pointsRef = useRef<THREE.Points>(null)

  const { geometry, velocities } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3)
    const velocities = new Float32Array(particleCount * 3)
    
    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const yOffset = (Math.random() - 0.5) * 0.3
      
      positions[i * 3] = x
      positions[i * 3 + 1] = yOffset
      positions[i * 3 + 2] = z
      
      // Tangential velocity for orbital motion
      const vx = -Math.sin(angle) * 0.02
      const vz = Math.cos(angle) * 0.02
      velocities[i * 3] = vx
      velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.001
      velocities[i * 3 + 2] = vz
    }
    
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    return { geometry: geo, velocities }
  }, [radius, particleCount])

  const material = useMemo(() => {
    return new THREE.PointsMaterial({
      color: new THREE.Color(color),
      size: 0.12,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
      sizeAttenuation: true,
    })
  }, [color])

  useFrame(() => {
    if (!pointsRef.current) return
    
    const positions = geometry.getAttribute('position') as THREE.BufferAttribute
    for (let i = 0; i < particleCount; i++) {
      const x = positions.getX(i) + velocities[i * 3]
      const y = positions.getY(i) + velocities[i * 3 + 1]
      const z = positions.getZ(i) + velocities[i * 3 + 2]
      
      // Keep particles in orbital plane with soft twinkle
      const dist = Math.sqrt(x * x + z * z)
      if (dist > 0.01) {
        const normalizedX = (x / dist) * radius
        const normalizedZ = (z / dist) * radius
        positions.setXYZ(i, normalizedX, y, normalizedZ)
      }
    }
    positions.needsUpdate = true
    
    // Gentle twinkle effect
    material.opacity = 0.55 + Math.sin(Date.now() * 0.001) * 0.05
  })

  return <points ref={pointsRef} geometry={geometry} material={material} />
}
