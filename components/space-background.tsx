'use client'

import { useEffect, useRef, useCallback } from 'react'

interface Star {
  x: number
  y: number
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
  r: number
  g: number
  b: number
  opacity: number
  driftX: number
  driftY: number
}

// Only bright blue/white stars — just a few dozen
const STAR_COLORS = ['#ffffff', '#e8f4ff', '#c8e4ff', '#d0eeff', '#f0f8ff']

export default function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const shootingStarsRef = useRef<ShootingStar[]>([])
  const nebulasRef = useRef<NebulaCloud[]>([])
  const animFrameRef = useRef<number>(0)
  const timeRef = useRef(0) // elapsed seconds

  const initStars = useCallback((w: number, h: number) => {
    // ~80% fewer stars — only ~450 bright ones
    const stars: Star[] = []
    for (let i = 0; i < 420; i++) {
      stars.push({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 2.0 + 0.3,
        brightness: Math.random() * 0.55 + 0.45,
        twinkleSpeed: Math.random() * 0.018 + 0.004,
        twinkleOffset: Math.random() * Math.PI * 2,
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      })
    }
    starsRef.current = stars
  }, [])

  const hexToRgb = (hex: string): [number, number, number] => {
    const clean = hex.replace('#', '')
    return [
      parseInt(clean.substring(0, 2), 16),
      parseInt(clean.substring(2, 4), 16),
      parseInt(clean.substring(4, 6), 16),
    ]
  }

  const initNebulas = useCallback((w: number, h: number) => {
    const defs = [
      // Soft blue nebula — left
      { x: w * 0.12, y: h * 0.3,  radius: w * 0.32, color: '#0033cc', opacity: 0.055, driftX: 0.012, driftY: 0.006 },
      // Purple nebula — top right
      { x: w * 0.82, y: h * 0.18, radius: w * 0.28, color: '#5500bb', opacity: 0.05,  driftX: -0.009, driftY: 0.01 },
      // Deep blue — bottom center
      { x: w * 0.5,  y: h * 0.75, radius: w * 0.35, color: '#002266', opacity: 0.06,  driftX: 0.006, driftY: -0.008 },
      // Cosmic fog — faint wide teal
      { x: w * 0.6,  y: h * 0.45, radius: w * 0.45, color: '#003344', opacity: 0.04,  driftX: -0.005, driftY: 0.004 },
      // Purple dust — bottom left
      { x: w * 0.2,  y: h * 0.8,  radius: w * 0.22, color: '#330055', opacity: 0.045, driftX: 0.008, driftY: 0.005 },
      // Faint cosmic dust — center top
      { x: w * 0.45, y: h * 0.12, radius: w * 0.28, color: '#001133', opacity: 0.05,  driftX: 0.004, driftY: 0.007 },
    ]

    nebulasRef.current = defs.map((d) => {
      const [r, g, b] = hexToRgb(d.color)
      return { x: d.x, y: d.y, radius: d.radius, r, g, b, opacity: d.opacity, driftX: d.driftX, driftY: d.driftY }
    })
  }, [hexToRgb])

  const spawnShootingStar = useCallback((w: number, h: number) => {
    shootingStarsRef.current.push({
      x: Math.random() * w * 0.7,
      y: Math.random() * h * 0.35,
      angle: (Math.random() * 25 + 18) * (Math.PI / 180),
      speed: Math.random() * 7 + 5,
      length: Math.random() * 100 + 60,
      opacity: 1,
      life: 0,
      maxLife: Math.random() * 0.9 + 0.5, // 0.5–1.4 seconds
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
    let lastTime = performance.now()

    const draw = (now: number) => {
      const delta = Math.min((now - lastTime) / 1000, 0.05) // seconds, capped at 50ms
      lastTime = now
      const w = canvas.width
      const h = canvas.height
      timeRef.current += delta

      // Deep space gradient background
      const bg = ctx.createLinearGradient(0, 0, w * 0.3, h)
      bg.addColorStop(0, '#00000a')
      bg.addColorStop(0.5, '#00010e')
      bg.addColorStop(1, '#000209')
      ctx.fillStyle = bg
      ctx.fillRect(0, 0, w, h)

      // Nebula clouds
      for (const neb of nebulasRef.current) {
        neb.x += neb.driftX
        neb.y += neb.driftY
        if (neb.x > w + neb.radius) neb.x = -neb.radius
        if (neb.x < -neb.radius) neb.x = w + neb.radius
        if (neb.y > h + neb.radius) neb.y = -neb.radius
        if (neb.y < -neb.radius) neb.y = h + neb.radius

        const g = ctx.createRadialGradient(neb.x, neb.y, 0, neb.x, neb.y, neb.radius)
        g.addColorStop(0,   `rgba(${neb.r},${neb.g},${neb.b},${neb.opacity})`)
        g.addColorStop(0.45,`rgba(${neb.r},${neb.g},${neb.b},${neb.opacity * 0.55})`)
        g.addColorStop(1,   `rgba(${neb.r},${neb.g},${neb.b},0)`)
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(neb.x, neb.y, neb.radius, 0, Math.PI * 2)
        ctx.fill()
      }

      // Stars
      for (const star of starsRef.current) {
        const twinkle = Math.sin(timeRef.current * star.twinkleSpeed + star.twinkleOffset)
        const alpha = star.brightness * (0.65 + twinkle * 0.35)
        const size = star.size * (0.85 + twinkle * 0.15)
        ctx.globalAlpha = alpha

        if (star.size > 1.3) {
          // Soft glow halo for brighter stars
          const glow = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, size * 3.5)
          glow.addColorStop(0, star.color)
          glow.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.fillStyle = glow
          ctx.beginPath()
          ctx.arc(star.x, star.y, size * 3.5, 0, Math.PI * 2)
          ctx.fill()
        }

        ctx.fillStyle = star.color
        ctx.beginPath()
        ctx.arc(star.x, star.y, size, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalAlpha = 1

      // Shooting stars — spawn every 4–10 seconds
      shootingStarTimer += delta
      if (shootingStarTimer > 4 + Math.random() * 6) {
        shootingStarTimer = 0
        spawnShootingStar(w, h)
      }
      for (let i = shootingStarsRef.current.length - 1; i >= 0; i--) {
        const ss = shootingStarsRef.current[i]
        ss.life += delta
        const progress = ss.life / ss.maxLife
        ss.opacity = progress < 0.2 ? progress / 0.2 : 1 - (progress - 0.2) / 0.8
        const dx = Math.cos(ss.angle) * ss.length
        const dy = Math.sin(ss.angle) * ss.length
        const tailX = ss.x - dx * 0.3
        const tailY = ss.y - dy * 0.3
        ss.x += Math.cos(ss.angle) * ss.speed * delta * 60
        ss.y += Math.sin(ss.angle) * ss.speed * delta * 60
        const grad = ctx.createLinearGradient(tailX, tailY, ss.x, ss.y)
        grad.addColorStop(0, `rgba(255,255,255,0)`)
        grad.addColorStop(0.7, `rgba(180,220,255,${ss.opacity * 0.45})`)
        grad.addColorStop(1, `rgba(255,255,255,${ss.opacity})`)
        ctx.globalAlpha = ss.opacity
        ctx.strokeStyle = grad
        ctx.lineWidth = 1.2
        ctx.beginPath()
        ctx.moveTo(tailX, tailY)
        ctx.lineTo(ss.x, ss.y)
        ctx.stroke()
        ctx.globalAlpha = 1
        if (ss.life >= ss.maxLife || ss.x > w + 200 || ss.y > h + 200) {
          shootingStarsRef.current.splice(i, 1)
        }
      }

      // Very faint cosmic dust vignette
      ctx.fillStyle = 'rgba(0, 10, 40, 0.018)'
      ctx.fillRect(0, 0, w, h)

      animFrameRef.current = requestAnimationFrame(draw)
    }

    animFrameRef.current = requestAnimationFrame(draw)
    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animFrameRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initStars, initNebulas, spawnShootingStar])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
