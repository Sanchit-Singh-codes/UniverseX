'use client'

import { useEffect, useRef, useCallback } from 'react'
import type { GestureState } from '@/lib/types'
import { HAND_CONNECTIONS, FINGERTIP_INDICES } from '@/lib/hand-tracker'

interface HandOverlayProps {
  gesture: GestureState
}

export default function HandOverlay({ gesture }: HandOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const smoothedLandmarksRef = useRef<Map<number, Map<number, { x: number; y: number }>>>(new Map())

  // Initialize smoothed landmarks map
  useEffect(() => {
    if (gesture.hands.length === 0) {
      smoothedLandmarksRef.current.clear()
    }
  }, [gesture.hands.length])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (!gesture.isTracking || gesture.hands.length === 0) {
      animRef.current = requestAnimationFrame(draw)
      return
    }

    // Draw each hand
    for (let handIdx = 0; handIdx < gesture.hands.length; handIdx++) {
      const hand = gesture.hands[handIdx]
      const landmarks = hand.landmarks

      if (!smoothedLandmarksRef.current.has(handIdx)) {
        smoothedLandmarksRef.current.set(handIdx, new Map())
      }
      const handSmoothed = smoothedLandmarksRef.current.get(handIdx)!

      // Convert normalized coords to screen coords (mirror horizontally)
      const toScreenX = (normX: number) => (1 - normX) * canvas.width
      const toScreenY = (normY: number) => normY * canvas.height

      // Smooth each landmark (interpolation for jitter removal)
      const smoothedPts: { x: number; y: number }[] = []
      for (let i = 0; i < landmarks.length; i++) {
        const lm = landmarks[i]
        const screenX = toScreenX(lm.x)
        const screenY = toScreenY(lm.y)

        if (!handSmoothed.has(i)) {
          handSmoothed.set(i, { x: screenX, y: screenY })
        }
        const prev = handSmoothed.get(i)!
        // Exponential smoothing: alpha = 0.4 for responsive-but-smooth feel
        const alpha = 0.4
        const smoothX = prev.x + (screenX - prev.x) * alpha
        const smoothY = prev.y + (screenY - prev.y) * alpha
        handSmoothed.set(i, { x: smoothX, y: smoothY })
        smoothedPts.push({ x: smoothX, y: smoothY })
      }

      // Draw connection lines (thin glowing cyan)
      ctx.lineWidth = 1.5
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      for (const [a, b] of HAND_CONNECTIONS) {
        if (a >= smoothedPts.length || b >= smoothedPts.length) continue
        const p1 = smoothedPts[a]
        const p2 = smoothedPts[b]

        // Gradient line from cyan to brighter cyan
        const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y)
        grad.addColorStop(0, 'rgba(54, 217, 255, 0.6)')
        grad.addColorStop(1, 'rgba(100, 240, 255, 0.8)')
        ctx.strokeStyle = grad
        ctx.shadowColor = 'rgba(54, 217, 255, 0.8)'
        ctx.shadowBlur = 6
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.stroke()
        ctx.shadowBlur = 0
      }

      // Draw small glowing cyan dots on all 21 joints
      for (let i = 0; i < smoothedPts.length; i++) {
        const pt = smoothedPts[i]
        const dotRadius = 2.0 // Small dots
        const pulseAmount = Math.sin(Date.now() * 0.004 + i) * 0.3 + 0.7
        const radius = dotRadius * pulseAmount

        // Glow effect
        ctx.shadowColor = 'rgba(54, 217, 255, 0.9)'
        ctx.shadowBlur = 8
        ctx.fillStyle = 'rgba(54, 217, 255, 0.9)'
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, radius, 0, Math.PI * 2)
        ctx.fill()
        ctx.shadowBlur = 0

        // Bright core
        ctx.fillStyle = 'rgba(200, 245, 255, 1)'
        ctx.beginPath()
        ctx.arc(pt.x, pt.y, radius * 0.5, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    animRef.current = requestAnimationFrame(draw)
  }, [gesture])

  useEffect(() => {
    animRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(animRef.current)
  }, [draw])

  // Set canvas size to match window
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth
        canvasRef.current.height = window.innerHeight
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 35, background: 'transparent' }}
    />
  )
}
