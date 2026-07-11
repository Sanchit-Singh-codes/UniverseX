'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { HandData, GestureState } from '@/lib/types'
import {
  FINGERTIP_INDICES,
  HAND_CONNECTIONS,
  getPalmCenter,
  getLandmarkVelocity,
} from '@/lib/hand-tracker'

interface Trail {
  x: number
  y: number
  opacity: number
  size: number
}

const MAX_TRAIL = 16

interface HandOverlayProps {
  gesture: GestureState
  width: number
  height: number
}

export default function HandOverlay({ gesture, width, height }: HandOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const trailsRef = useRef<Map<number, Trail[]>>(new Map())
  const prevLandmarksRef = useRef<{ x: number; y: number; z: number }[][]>([])
  const animRef = useRef<number>(0)
  const timeRef = useRef(0)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    timeRef.current += 1

    if (!gesture.isTracking || gesture.hands.length === 0) {
      trailsRef.current.clear()
      animRef.current = requestAnimationFrame(draw)
      return
    }

    for (const hand of gesture.hands) {
      const lm = hand.landmarks
      const velocity = getLandmarkVelocity(
        prevLandmarksRef.current[0] ?? null,
        lm.map((l) => ({ x: l.x, y: l.y, z: l.z }))
      )
      const speedFactor = Math.min(velocity * 60, 1)

      // Map normalized coords to canvas
      const toX = (x: number) => (1 - x) * canvas.width // Mirror for natural feel
      const toY = (y: number) => y * canvas.height

      // Update trails for fingertips
      for (const tipIdx of FINGERTIP_INDICES) {
        const pt = lm[tipIdx]
        const cx = toX(pt.x)
        const cy = toY(pt.y)

        if (!trailsRef.current.has(tipIdx)) {
          trailsRef.current.set(tipIdx, [])
        }
        const trail = trailsRef.current.get(tipIdx)!
        trail.unshift({ x: cx, y: cy, opacity: 0.6, size: 3 + speedFactor * 4 })
        if (trail.length > MAX_TRAIL) trail.pop()
        for (let i = 0; i < trail.length; i++) {
          trail[i].opacity *= 0.82
        }
      }

      // Draw connection lines (neon blue)
      ctx.lineWidth = 1.2
      for (const [a, b] of HAND_CONNECTIONS) {
        if (a >= lm.length || b >= lm.length) continue
        const ax = toX(lm[a].x)
        const ay = toY(lm[a].y)
        const bx = toX(lm[b].x)
        const by = toY(lm[b].y)

        const grad = ctx.createLinearGradient(ax, ay, bx, by)
        grad.addColorStop(0, 'rgba(0, 150, 255, 0.7)')
        grad.addColorStop(1, 'rgba(0, 245, 255, 0.7)')
        ctx.strokeStyle = grad
        ctx.shadowColor = '#0066ff'
        ctx.shadowBlur = 8
        ctx.beginPath()
        ctx.moveTo(ax, ay)
        ctx.lineTo(bx, by)
        ctx.stroke()
      }

      ctx.shadowBlur = 0

      // Draw fingertip trails
      for (const tipIdx of FINGERTIP_INDICES) {
        const trail = trailsRef.current.get(tipIdx)
        if (!trail || trail.length < 2) continue
        for (let i = 0; i < trail.length - 1; i++) {
          const op = trail[i].opacity
          if (op < 0.02) continue
          ctx.strokeStyle = `rgba(0, 245, 255, ${op * 0.6})`
          ctx.lineWidth = trail[i].size * 0.5 * (1 - i / trail.length)
          ctx.shadowColor = '#00f5ff'
          ctx.shadowBlur = 6
          ctx.beginPath()
          ctx.moveTo(trail[i].x, trail[i].y)
          ctx.lineTo(trail[i + 1].x, trail[i + 1].y)
          ctx.stroke()
        }
        ctx.shadowBlur = 0
      }

      // Draw joint dots (non-fingertip)
      for (let i = 0; i < lm.length; i++) {
        const pt = lm[i]
        const cx = toX(pt.x)
        const cy = toY(pt.y)
        const isTip = FINGERTIP_INDICES.includes(i)

        if (!isTip) {
          ctx.shadowColor = '#0066ff'
          ctx.shadowBlur = 8
          ctx.fillStyle = 'rgba(0, 120, 255, 0.7)'
          ctx.beginPath()
          ctx.arc(cx, cy, 3, 0, Math.PI * 2)
          ctx.fill()
          ctx.shadowBlur = 0
        }
      }

      // Draw fingertip orbs
      for (const tipIdx of FINGERTIP_INDICES) {
        const pt = lm[tipIdx]
        const cx = toX(pt.x)
        const cy = toY(pt.y)
        const glowSize = 10 + speedFactor * 8
        const pulse = 1 + Math.sin(timeRef.current * 0.12 + tipIdx) * 0.15

        // Outer glow
        const outerGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowSize * 2.5 * pulse)
        outerGrad.addColorStop(0, `rgba(0, 245, 255, ${0.35 + speedFactor * 0.2})`)
        outerGrad.addColorStop(0.4, `rgba(0, 200, 255, ${0.15 + speedFactor * 0.1})`)
        outerGrad.addColorStop(1, 'rgba(0, 100, 255, 0)')
        ctx.fillStyle = outerGrad
        ctx.beginPath()
        ctx.arc(cx, cy, glowSize * 2.5 * pulse, 0, Math.PI * 2)
        ctx.fill()

        // Core orb
        const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, glowSize * pulse)
        coreGrad.addColorStop(0, 'rgba(255, 255, 255, 0.95)')
        coreGrad.addColorStop(0.3, `rgba(100, 240, 255, 0.9)`)
        coreGrad.addColorStop(0.8, `rgba(0, 180, 255, 0.6)`)
        coreGrad.addColorStop(1, 'rgba(0, 100, 255, 0)')
        ctx.shadowColor = '#00f5ff'
        ctx.shadowBlur = 20 + speedFactor * 15
        ctx.fillStyle = coreGrad
        ctx.beginPath()
        ctx.arc(cx, cy, glowSize * pulse, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0
      }

      // Draw palm orb
      const palm = getPalmCenter(lm)
      const palmX = toX(palm.x)
      const palmY = toY(palm.y)
      const palmSize = 16 + speedFactor * 6
      const palmPulse = 1 + Math.sin(timeRef.current * 0.08) * 0.12

      const palmOuter = ctx.createRadialGradient(palmX, palmY, 0, palmX, palmY, palmSize * 3)
      palmOuter.addColorStop(0, `rgba(0, 200, 255, ${0.2 + speedFactor * 0.15})`)
      palmOuter.addColorStop(1, 'rgba(0, 50, 150, 0)')
      ctx.fillStyle = palmOuter
      ctx.beginPath()
      ctx.arc(palmX, palmY, palmSize * 3 * palmPulse, 0, Math.PI * 2)
      ctx.fill()

      const palmCore = ctx.createRadialGradient(palmX, palmY, 0, palmX, palmY, palmSize)
      palmCore.addColorStop(0, 'rgba(200, 245, 255, 0.7)')
      palmCore.addColorStop(0.5, 'rgba(0, 200, 255, 0.5)')
      palmCore.addColorStop(1, 'rgba(0, 100, 255, 0)')
      ctx.shadowColor = '#00ccff'
      ctx.shadowBlur = 25
      ctx.fillStyle = palmCore
      ctx.beginPath()
      ctx.arc(palmX, palmY, palmSize * palmPulse, 0, Math.PI * 2)
      ctx.fill()
      ctx.shadowBlur = 0

      // Store for velocity calculation
      prevLandmarksRef.current[0] = lm.map((l) => ({ x: l.x, y: l.y, z: l.z }))
    }

    animRef.current = requestAnimationFrame(draw)
  }, [gesture])

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [draw])

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 20 }}
    />
  )
}
