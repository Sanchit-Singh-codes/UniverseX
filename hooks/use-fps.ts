'use client'

import { useState, useRef, useEffect } from 'react'

export function useFPS() {
  const [fps, setFps] = useState(0)
  const frameTimesRef = useRef<number[]>([])
  const rafRef = useRef<number>(0)

  useEffect(() => {
    let last = performance.now()

    const tick = () => {
      const now = performance.now()
      const delta = now - last
      last = now

      frameTimesRef.current.push(delta)
      if (frameTimesRef.current.length > 60) frameTimesRef.current.shift()

      const avg = frameTimesRef.current.reduce((a, b) => a + b, 0) / frameTimesRef.current.length
      setFps(Math.round(1000 / avg))

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return fps
}
