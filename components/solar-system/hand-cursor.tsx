'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { PLANETS } from '@/lib/planet-data'
import type { HandLandmark } from '@/lib/types'

interface HandCursorProps {
  indexPosition: { x: number; y: number } | null
  onHover: (id: string | null) => void
  onDoubleClick: (id: string) => void
}

export function HandCursor({ indexPosition, onHover, onDoubleClick }: HandCursorProps) {
  const { camera, scene } = useThree()
  const cursorMeshRef = useRef<THREE.Mesh>(null!)
  const smoothedPosRef = useRef(new THREE.Vector3())
  const raycasterRef = useRef(new THREE.Raycaster())
  const dwellTimerRef = useRef<{ planet: string; time: number } | null>(null)
  const lastHoveredRef = useRef<string | null>(null)
  const lastIndexPosRef = useRef<{ x: number; y: number } | null>(null)
  const DWELL_TIME = 1.0 // 1 second
  const MOVEMENT_TOLERANCE = 0.02 // 2% of screen

  // Create cursor geometry and material
  const { geometry, material } = useMemo(() => {
    const geo = new THREE.SphereGeometry(0.5, 16, 16) // 8-10px will be scaled by camera distance
    const mat = new THREE.MeshBasicMaterial({
      color: '#36d9ff',
      transparent: true,
      opacity: 0.85,
      fog: false,
    })
    return { geometry: geo, material: mat }
  }, [])

  // Create glow halo
  const glowMesh = useRef<THREE.Mesh>(null!)
  const { glowGeometry, glowMaterial } = useMemo(() => {
    const geo = new THREE.SphereGeometry(1.2, 16, 16)
    const mat = new THREE.MeshBasicMaterial({
      color: '#36d9ff',
      transparent: true,
      opacity: 0.2,
      fog: false,
      side: THREE.BackSide,
    })
    return { glowGeometry: geo, glowMaterial: mat }
  }, [])

  useFrame(() => {
    if (!indexPosition) {
      if (cursorMeshRef.current) cursorMeshRef.current.visible = false
      if (glowMesh.current) glowMesh.current.visible = false
      return
    }

    if (cursorMeshRef.current) cursorMeshRef.current.visible = true
    if (glowMesh.current) glowMesh.current.visible = true

    // Normalize screen coordinates to NDC (-1 to 1)
    const ndcCoords = new THREE.Vector2(indexPosition.x * 2 - 1, -(indexPosition.y * 2 - 1))

    // Convert NDC to world position at a fixed distance from camera
    const worldPos = new THREE.Vector3(ndcCoords.x, ndcCoords.y, 0.5)
    worldPos.unproject(camera)
    const direction = worldPos.sub(camera.position).normalize()
    const distance = 100 // Distance from camera where cursor appears
    const targetPos = camera.position.clone().add(direction.multiplyScalar(distance))

    // Smooth interpolation (exponential moving average)
    const alpha = 0.3 // Smoothing factor
    smoothedPosRef.current.lerp(targetPos, alpha)

    // Update cursor position
    if (cursorMeshRef.current) {
      cursorMeshRef.current.position.copy(smoothedPosRef.current)
      // Scale cursor so it appears ~8-10px on screen
      const fov = (camera as THREE.PerspectiveCamera).fov ?? 50
      const screenScale = distance * Math.tan((fov * Math.PI) / 360) / (window.innerHeight / 2)
      cursorMeshRef.current.scale.setScalar(screenScale * 0.15)
    }

    // Update glow halo
    if (glowMesh.current) {
      glowMesh.current.position.copy(smoothedPosRef.current)
      const fov = (camera as THREE.PerspectiveCamera).fov ?? 50
      const screenScale = distance * Math.tan((fov * Math.PI) / 360) / (window.innerHeight / 2)
      glowMesh.current.scale.setScalar(screenScale * 0.35)
    }

    // Raycast from camera through cursor to detect planets
    raycasterRef.current.setFromCamera(ndcCoords, camera)
    const planetMeshes = scene.children
      .filter((child) => child.userData.isPlanet)
      .map((group) => group.children.find((m) => m instanceof THREE.Mesh) || group)

    const intersects = raycasterRef.current.intersectObjects(planetMeshes, true)
    const hoveredPlanet = intersects.length > 0 ? intersects[0].object.userData.planetId : null

    // Handle dwell timer and hover
    const currentIndex = indexPosition
    const movedTooMuch =
      lastIndexPosRef.current &&
      Math.hypot(
        currentIndex.x - lastIndexPosRef.current.x,
        currentIndex.y - lastIndexPosRef.current.y
      ) > MOVEMENT_TOLERANCE

    if (hoveredPlanet && hoveredPlanet === lastHoveredRef.current && !movedTooMuch) {
      // Cursor stayed on same planet
      if (dwellTimerRef.current && dwellTimerRef.current.planet === hoveredPlanet) {
        dwellTimerRef.current.time += 0.016 // ~60 FPS
        if (dwellTimerRef.current.time >= DWELL_TIME) {
          // Trigger double-click animation
          onDoubleClick(hoveredPlanet)
          dwellTimerRef.current = null
          lastIndexPosRef.current = null
        }
      } else {
        dwellTimerRef.current = { planet: hoveredPlanet, time: 0 }
      }
    } else {
      // Cursor moved or changed planet
      dwellTimerRef.current = null
    }

    // Update hover state
    if (hoveredPlanet !== lastHoveredRef.current) {
      onHover(hoveredPlanet)
      lastHoveredRef.current = hoveredPlanet
    }

    lastIndexPosRef.current = { x: currentIndex.x, y: currentIndex.y }
  })

  return (
    <group>
      <mesh ref={cursorMeshRef} geometry={geometry} material={material} />
      <mesh ref={glowMesh} geometry={glowGeometry} material={glowMaterial} />
    </group>
  )
}
