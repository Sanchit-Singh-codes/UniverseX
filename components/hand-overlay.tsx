'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { GestureState } from '@/lib/types'
import { FINGERTIP_INDICES, HAND_CONNECTIONS, getPalmCenter } from '@/lib/hand-tracker'

interface HandOverlayProps {
  gesture: GestureState
  width: number
  height: number
}

// Smooth interpolation store
interface SmoothPoint { x: number; y: number }

export default function HandOverlay({ gesture, width, height }: HandOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const timeRef = useRef(0)
  // Smoothed landmark positions per hand
  const smoothedRef = useRef<SmoothPoint[][]>([])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    timeRef.current += 1

    if (!gesture.isTracking || gesture.hands.length === 0) {
      smoothedRef.current = []
      animRef.current = requestAnimationFrame(draw)
      return
    }

    // Mirror: x is flipped so it feels like a mirror
    const toX = (x: number) => (1 - x) * canvas.width
    const toY = (y: number) => y * canvas.height

    for (let hi = 0; hi < gesture.hands.length; hi++) {
      const hand = gesture.hands[hi]
      const raw = hand.landmarks

      // Ensure smoothed array exists for this hand
      if (!smoothedRef.current[hi] || smoothedRef.current[hi].length !== raw.length) {
        smoothedRef.current[hi] = raw.map((l) => ({ x: toX(l.x), y: toY(l.y) }))
      } else {
        // Lerp each point toward raw for smooth feel
        for (let i = 0; i < raw.length; i++) {
          const tx = toX(raw[i].x)
          const ty = toY(raw[i].y)
          smoothedRef.current[hi][i].x += (tx - smoothedRef.current[hi][i].x) * 0.45
          smoothedRef.current[hi][i].y += (ty - smoothedRef.current[hi][i].y) * 0.45
        }
      }

      const pts = smoothedRef.current[hi]

      // ── Thin neon connection lines ────────────────────────────────────
      ctx.save()
      ctx.lineWidth = 1.0
      ctx.shadowBlur = 0
      for (const [a, b] of HAND_CONNECTIONS) {
        if (a >= pts.length || b >= pts.length) continue
        const isFingertipA = FINGERTIP_INDICES.includes(a)
        const isFingertipB = FINGERTIP_INDICES.includes(b)
        const alpha = (isFingertipA || isFingertipB) ? 0.55 : 0.35
        ctx.strokeStyle = `rgba(30, 160, 255, ${alpha})`
        ctx.shadowColor = 'rgba(0, 120, 255, 0.4)'
        ctx.shadowBlur = 3
        ctx.beginPath()
        ctx.moveTo(pts[a].x, pts[a].y)
        ctx.lineTo(pts[b].x, pts[b].y)
        ctx.stroke()
      }
      ctx.restore()

      // ── Small joint dots (non-fingertip) ──────────────────────────────
      for (let i = 0; i < pts.length; i++) {
        if (FINGERTIP_INDICES.includes(i)) continue
        ctx.save()
        ctx.fillStyle = 'rgba(40, 140, 255, 0.55)'
        ctx.shadowColor = 'rgba(0, 100, 255, 0.35)'
        ctx.shadowBlur = 4
        ctx.beginPath()
        ctx.arc(pts[i].x, pts[i].y, 2.0, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      // ── Fingertip orbs — small, tight, premium ────────────────────────
      const pulse = 1 + Math.sin(timeRef.current * 0.1) * 0.08
      for (const tipIdx of FINGERTIP_INDICES) {
        const p = pts[tipIdx]
        const orbRadius = 4.5 * pulse

        // Tiny outer glow
        ctx.save()
        const outerGlow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, orbRadius * 3.2)
        outerGlow.addColorStop(0, 'rgba(0, 230, 255, 0.18)')
        outerGlow.addColorStop(1, 'rgba(0, 100, 255, 0)')
        ctx.fillStyle = outerGlow
        ctx.beginPath()
        ctx.arc(p.x, p.y, orbRadius * 3.2, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()

        // Core orb
        ctx.save()
        ctx.shadowColor = '#00e5ff'
        ctx.shadowBlur = 8
        const coreGrad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, orbRadius)
        coreGrad.addColorStop(0, 'rgba(220, 250, 255, 0.98)')
        coreGrad.addColorStop(0.5, 'rgba(0, 210, 255, 0.85)')
        coreGrad.addColorStop(1, 'rgba(0, 80, 220, 0)')
        ctx.fillStyle = coreGrad
        ctx.beginPath()
        ctx.arc(p.x, p.y, orbRadius, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }

      // ── Small glowing palm center ─────────────────────────────────────
      const rawPalm = getPalmCenter(raw)
      const palmX = toX(rawPalm.x)
      const palmY = toY(rawPalm.y)
      const palmPulse = 1 + Math.sin(timeRef.current * 0.07 + hi) * 0.06

      ctx.save()
      const palmGlow = ctx.createRadialGradient(palmX, palmY, 0, palmX, palmY, 9 * palmPulse)
      palmGlow.addColorStop(0, 'rgba(0, 200, 255, 0.22)')
      palmGlow.addColorStop(1, 'rgba(0, 60, 180, 0)')
      ctx.fillStyle = palmGlow
      ctx.beginPath()
      ctx.arc(palmX, palmY, 9 * palmPulse, 0, Math.PI * 2)
      ctx.fill()

      // Tiny bright core
      ctx.shadowColor = '#00ccff'
      ctx.shadowBlur = 6
      ctx.fillStyle = 'rgba(180, 240, 255, 0.7)'
      ctx.beginPath()
      ctx.arc(palmX, palmY, 2.8, 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      // ── Right hand laser beam from index tip ──────────────────────────
      if (hand.handedness === 'Right' && gesture.rightGesture === 'point') {
        const indexTip = pts[8]  // INDEX_TIP
        const indexMid = pts[7]  // INDEX_DIP — direction guide
        const dx = indexTip.x - indexMid.x
        const dy = indexTip.y - indexMid.y
        const len = Math.sqrt(dx * dx + dy * dy) || 1
        const nx = dx / len
        const ny = dy / len
        const beamEnd = { x: indexTip.x + nx * canvas.width * 0.6, y: indexTip.y + ny * canvas.height * 0.6 }

        ctx.save()
        const laserGrad = ctx.createLinearGradient(indexTip.x, indexTip.y, beamEnd.x, beamEnd.y)
        laserGrad.addColorStop(0, 'rgba(0, 200, 255, 0.75)')
        laserGrad.addColorStop(0.3, 'rgba(0, 140, 255, 0.45)')
        laserGrad.addColorStop(1, 'rgba(0, 60, 200, 0)')
        ctx.strokeStyle = laserGrad
        ctx.lineWidth = 1.2
        ctx.shadowColor = '#00aaff'
        ctx.shadowBlur = 10
        ctx.beginPath()
        ctx.moveTo(indexTip.x, indexTip.y)
        ctx.lineTo(beamEnd.x, beamEnd.y)
        ctx.stroke()
        ctx.restore()
      }
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
