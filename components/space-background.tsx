'use client'

import { useEffect, useRef, useCallback } from 'react'

interface Star {
  x: number
  y: number
  z: number
  size: number
  brightness: number
  twinkleSpeed: number
  twinkleOffset: number
  color: string
}

interface ShootingStar {
  x: number
  y: number
  angle: number
  speed: number
  length: number
  opacity: number
  life: number
  maxLife: number
}

interface NebulaCloud {
  x: number
  y: number
  radius: number
  color: string
  opacity: number
  driftX: number
  driftY: number
}

const STAR_COLORS = ['#e8f4ff', '#c8e4ff', '#ffe8c8', '#ffeeff', '#c8ffee']

export default function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const shootingStarsRef = useRef<ShootingStar[]>([])
  const nebulasRef = useRef<NebulaCloud[]>([])
  const animFrameRef = useRef<number>(0)
  const timeRef = useRef(0)

  const initStars = useCallback((w: number, h: number) => {
    const stars: Star[] = []
    for (let i = 0; i < 2200; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        z: Math.random(),
        size: Math.random() * 1.8 + 0.2,
        brightness: Math.random() * 0.6 + 0.4,
        twinkleSpeed: Math.random() * 0.02 + 0.005,
        twinkleOffset: Math.random() * Math.PI * 2,
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      })
    }
    starsRef.current = stars
  }, [])

  const initNebulas = useCallback((w: number, h: number) => {
    const nebulas: NebulaCloud[] = [
      { x: w * 0.15, y: h * 0.25, radius: w * 0.25, color: '#0020ff', opacity: 0.04, driftX: 0.015, driftY: 0.008 },
      { x: w * 0.8, y: h * 0.15, radius: w * 0.2, color: '#6600aa', opacity: 0.035, driftX: -0.01, driftY: 0.012 },
      { x: w * 0.5, y: h * 0.7, radius: w * 0.3, color: '#003366', opacity: 0.05, driftX: 0.008, driftY: -0.01 },
      { x: w * 0.9, y: h * 0.6, radius: w * 0.22, color: '#004422', opacity: 0.03, driftX: -0.012, driftY: -0.008 },
      { x: w * 0.3, y: h * 0.85, radius: w * 0.18, color: '#220044', opacity: 0.04, driftX: 0.01, driftY: 0.006 },
    ]
    nebulasRef.current = nebulas
  }, [])

  const spawnShootingStar = useCallback((w: number, h: number) => {
    shootingStarsRef.current.push({
      x: Math.random() * w * 0.8,
      y: Math.random() * h * 0.4,
      angle: (Math.random() * 30 + 20) * (Math.PI / 180),
      speed: Math.random() * 8 + 6,
      length: Math.random() * 120 + 80,
      opacity: 1,
      life: 0,
      maxLife: Math.random() * 60 + 40,
    })
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initStars(canvas.width, canvas.height)
      initNebulas(canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    let shootingStarTimer = 0

    const draw = () => {
      const w = canvas.width
      const h = canvas.height
      timeRef.current += 1

      // Clear with deep space gradient
      const bg = ctx.createLinearGradient(0, 0, w * 0.5, h)
      bg.addColorStop(0, '#000008')
      bg.addColorStop(0.5, '#00010f')
      bg.addColorStop(1, '#000308')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)

      // Draw nebula clouds
      for (const neb of nebulasRef.current) {
        neb.x += neb.driftX
        neb.y += neb.driftY
        if (neb.x > w + neb.radius) neb.x = -neb.radius
        if (neb.x < -neb.radius) neb.x = w + neb.radius
        if (neb.y > h + neb.radius) neb.y = -neb.radius
        if (neb.y < -neb.radius) neb.y = h + neb.radius

        // Parse hex color to rgba
        const r = parseInt(neb.color.slice(1, 3), 16)
        const g = parseInt(neb.color.slice(3, 5), 16)
        const b = parseInt(neb.color.slice(5, 7), 16)
        const grad2 = ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, neb.radius)
        grad2.addColorStop(0, `rgba(${r},${g},${b},${neb.opacity})`)
        grad2.addColorStop(0.5, `rgba(${r},${g},${b},${neb.opacity * 0.5})`)
        grad2.addColorStop(1, `rgba(${r},${g},${b},0)`)

        ctx.fillStyle = grad2
        ctx.beginPath()
        ctx.arc(neb.x, neb.y, neb.radius, 0, Math.PI * 2)
        ctx.fill()
      }

      // Draw stars
      for (const star of starsRef.current) {
        const twinkle = Math.sin(timeRef.current * star.twinkleSpeed + star.twinkleOffset)
        const alpha = star.brightness * (0.7 + twinkle * 0.3)
        const size = star.size * (0.8 + twinkle * 0.2)

        ctx.globalAlpha = alpha
        ctx.fillStyle = star.color

        if (star.size > 1.2) {
          // Add glow to larger stars
          const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, size * 3)
          glow.addColorStop(0, star.color)
          glow.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = glow
          ctx.beginPath()
          ctx.arc(star.x, star.y, size * 3, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.fillStyle = star.color
        ctx.beginPath()
        ctx.arc(star.x, star.y, size, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      // Shooting stars
      shootingStarTimer++
      if (shootingStarTimer > 180 + Math.random() * 300) {
        shootingStarTimer = 0
        spawnShootingStar(w, h)
      }

      for (let i = shootingStarsRef.current.length - 1; i >= 0; i--) {
        const ss = shootingStarsRef.current[i]
        ss.life++
        const progress = ss.life / ss.maxLife
        ss.opacity = progress < 0.2 ? progress / 0.2 : 1 - (progress - 0.2) / 0.8

        const dx = Math.cos(ss.angle) * ss.length
        const dy = Math.sin(ss.angle) * ss.length
        const tailX = ss.x - dx * 0.3
        const tailY = ss.y - dy * 0.3

        ss.x += Math.cos(ss.angle) * ss.speed
        ss.y += Math.sin(ss.angle) * ss.speed

        const grad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y)
        grad.addColorStop(0, `rgba(255,255,255,0)`)
        grad.addColorStop(0.6, `rgba(180,220,255,${ss.opacity * 0.5})`)
        grad.addColorStop(1, `rgba(255,255,255,${ss.opacity})`)

        ctx.globalAlpha = ss.opacity
        ctx.strokeStyle = grad
        ctx.lineWidth = 1.5
        ctx.beginPath()
        ctx.moveTo(tailX, tailY)
        ctx.lineTo(ss.x, ss.y)
        ctx.stroke()
        ctx.globalAlpha = 1

        if (ss.life >= ss.maxLife || ss.x > w + 200 || ss.y > h + 200) {
          shootingStarsRef.current.splice(i, 1)
        }
      }

      // Subtle cosmic dust overlay
      ctx.fillStyle = 'rgba(0, 20, 60, 0.02)'
      ctx.fillRect(0, 0, w, h)

      animFrameRef.current = requestAnimationFrame(draw)
    }

    animFrameRef.current = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animFrameRef.current)
    }
  }, [initStars, initNebulas, spawnShootingStar])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
