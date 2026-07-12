'use client'

import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

interface HandCursorProps {
  indexPosition: { x: number; y: number } | null
  onHover: (id: string | null) => void
  onDoubleClick: (id: string) => void
}

export function HandCursor({ indexPosition, onHover, onDoubleClick }: HandCursorProps) {
  const { camera, scene } = useThree()
  const cursorMeshRef = useRef<THREE.Mesh>(null!)
  const glowMeshRef = useRef<THREE.Mesh>(null!)
  const smoothedPosRef = useRef(new THREE.Vector3())
  const raycasterRef = useRef(new THREE.Raycaster())
  
  // Dwell tracking
  const dwellTimerRef = useRef<{ planet: string; time: number } | null>(null)
  const lastHoveredRef = useRef<string | null>(null)
  const lastIndexPosRef = useRef<{ x: number; y: number } | null>(null)
  
  const DWELL_TIME = 1.0 // 1 second
  const MOVEMENT_TOLERANCE = 0.02 // 2% of screen

  // Create cursor sphere
  const cursorMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: '#36d9ff',
      transparent: true,
      opacity: 0.9,
      fog: false,
    })
  }, [])

  // Create glow halo
  const glowMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: '#36d9ff',
      transparent: true,
      opacity: 0.25,
      fog: false,
      side: THREE.BackSide,
    })
  }, [])

  useFrame(({ camera, scene }, delta) => {
    // Hide cursor if no hand detected
    if (!indexPosition) {
      if (cursorMeshRef.current) cursorMeshRef.current.visible = false
      if (glowMeshRef.current) glowMeshRef.current.visible = false
      return
    }

    // Show cursor
    if (cursorMeshRef.current) cursorMeshRef.current.visible = true
    if (glowMeshRef.current) glowMeshRef.current.visible = true

    // Convert normalized screen coordinates to NDC
    const ndcCoords = new THREE.Vector2(
      indexPosition.x * 2 - 1,
      -(indexPosition.y * 2 - 1)
    )

    // Create ray from camera through screen point
    raycasterRef.current.setFromCamera(ndcCoords, camera)
    const rayOrigin = raycasterRef.current.ray.origin
    const rayDir = raycasterRef.current.ray.direction

    // Position cursor at fixed distance along ray
    const cursorDistance = 100
    const targetPos = new THREE.Vector3()
      .copy(rayOrigin)
      .addScaledVector(rayDir, cursorDistance)

    // Smooth interpolation
    smoothedPosRef.current.lerp(targetPos, 0.25)

    // Update cursor position
    if (cursorMeshRef.current) {
      cursorMeshRef.current.position.copy(smoothedPosRef.current)

      // Scale based on distance and camera FOV
      const fov = (camera as THREE.PerspectiveCamera).fov || 50
      const height = 2 * Math.tan((fov * Math.PI) / 360) * cursorDistance
      const screenScale = height / window.innerHeight
      cursorMeshRef.current.scale.setScalar(screenScale * 0.12)
    }

    // Update glow halo
    if (glowMeshRef.current) {
      glowMeshRef.current.position.copy(smoothedPosRef.current)
      const fov = (camera as THREE.PerspectiveCamera).fov || 50
      const height = 2 * Math.tan((fov * Math.PI) / 360) * cursorDistance
      const screenScale = height / window.innerHeight
      glowMeshRef.current.scale.setScalar(screenScale * 0.3)
    }

    // Raycast to find intersected planets
    const intersects = raycasterRef.current.intersectObjects(scene.children, true)
    let hoveredPlanet: string | null = null

    for (const intersection of intersects) {
      const obj = intersection.object
      // Check if object or its parent has planetId
      if (obj.userData?.planetId) {
        hoveredPlanet = obj.userData.planetId
        break
      }
      if (obj.parent?.userData?.planetId) {
        hoveredPlanet = obj.parent.userData.planetId
        break
      }
    }

    // Track cursor movement
    const currentIndex = indexPosition
    const movedTooMuch =
      lastIndexPosRef.current &&
      Math.hypot(
        currentIndex.x - lastIndexPosRef.current.x,
        currentIndex.y - lastIndexPosRef.current.y
      ) > MOVEMENT_TOLERANCE

    // Update dwell timer
    if (hoveredPlanet && hoveredPlanet === lastHoveredRef.current && !movedTooMuch) {
      // Cursor stayed on same planet
      if (dwellTimerRef.current?.planet === hoveredPlanet) {
        dwellTimerRef.current.time += delta
        if (dwellTimerRef.current.time >= DWELL_TIME) {
          // Trigger zoom animation
          onDoubleClick(hoveredPlanet)
          dwellTimerRef.current = null
          lastIndexPosRef.current = null
        }
      } else {
        dwellTimerRef.current = { planet: hoveredPlanet, time: 0 }
      }
    } else {
      // Reset timer if moved or planet changed
      dwellTimerRef.current = null
    }

    // Emit hover event if planet changed
    if (hoveredPlanet !== lastHoveredRef.current) {
      onHover(hoveredPlanet)
      lastHoveredRef.current = hoveredPlanet
    }

    lastIndexPosRef.current = { x: currentIndex.x, y: currentIndex.y }
  })

  return (
    <group>
      <mesh
        ref={cursorMeshRef}
        material={cursorMaterial}
      >
        <sphereGeometry args={[0.5, 16, 16]} />
      </mesh>
      <mesh
        ref={glowMeshRef}
        material={glowMaterial}
      >
        <sphereGeometry args={[1.2, 16, 16]} />
      </mesh>
    </group>
  )
}
