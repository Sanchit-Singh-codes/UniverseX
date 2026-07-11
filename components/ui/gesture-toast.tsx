'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState, useRef } from 'react'
import type { GestureType } from '@/lib/types'

interface GestureToastProps {
  gesture: GestureType
}

const GESTURE_MESSAGES: Partial<Record<GestureType, string>> = {
  open_palm: 'Spawning Solar System...',
  fist: 'Resetting Solar System',
  pinch: 'Planet Grabbed',
  two_hand_scale: 'Resizing System',
  point: 'Targeting Planet',
}

export function GestureToast({ gesture }: GestureToastProps) {
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prevGestureRef = useRef<GestureType>('none')

  useEffect(() => {
    if (gesture !== 'none' && gesture !== prevGestureRef.current) {
      const msg = GESTURE_MESSAGES[gesture]
      if (msg) {
        setMessage(msg)
        setVisible(true)
        if (timerRef.current) clearTimeout(timerRef.current)
        timerRef.current = setTimeout(() => setVisible(false), 2200)
      }
    }
    prevGestureRef.current = gesture
  }, [gesture])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key={message}
          initial={{ y: -30, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: -20, opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="absolute top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none"
        >
          <div
            className="px-6 py-3 rounded-2xl text-sm font-mono font-bold tracking-wider"
            style={{
              background: 'rgba(0, 20, 50, 0.85)',
              border: '1px solid rgba(0, 245, 255, 0.3)',
              color: '#00f5ff',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 0 30px rgba(0, 180, 255, 0.2), 0 8px 32px rgba(0,0,0,0.4)',
              textShadow: '0 0 12px rgba(0, 245, 255, 0.6)',
            }}
          >
            {message}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
