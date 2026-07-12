'use client'

import { motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react'
import type { GestureState, CameraStatus, ModelStatus, HandLandmark } from '@/lib/types'
import type { RefObject } from 'react'
import { HAND_CONNECTIONS } from '@/lib/hand-tracker'

interface CameraFeedProps {
  videoRef: RefObject<HTMLVideoElement | null>
  gestureState: GestureState
  cameraStatus: CameraStatus
  modelStatus: ModelStatus
}

export default function CameraFeed({ videoRef, gestureState, cameraStatus, modelStatus }: CameraFeedProps) {
  const [showCamera, setShowCamera] = useState(true)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const W = 220, H = 160
  const isLive = cameraStatus === 'live' && gestureState.isTracking

  // Draw hand skeleton on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, W, H)

    // Draw hands if available
    if (gestureState.hands.length > 0) {
      for (const hand of gestureState.hands) {
        if (hand.landmarks.length === 0) continue

        // Draw connections (lines between joints)
        ctx.strokeStyle = '#36d9ff'
        ctx.lineWidth = 1.2
        ctx.globalAlpha = 0.6

        for (const connection of HAND_CONNECTIONS) {
          const start = hand.landmarks[connection[0]]
          const end = hand.landmarks[connection[1]]
          if (start && end) {
            ctx.beginPath()
            ctx.moveTo(start.x * W, start.y * H)
            ctx.lineTo(end.x * W, end.y * H)
            ctx.stroke()
          }
        }

        // Draw landmarks (dots on joints)
        ctx.globalAlpha = 0.8
        ctx.fillStyle = '#36d9ff'
        for (const landmark of hand.landmarks) {
          ctx.beginPath()
          ctx.arc(landmark.x * W, landmark.y * H, 2.5, 0, Math.PI * 2)
          ctx.fill()

          // Small glow effect
          ctx.strokeStyle = '#36d9ff'
          ctx.lineWidth = 0.8
          ctx.globalAlpha = 0.3
          ctx.beginPath()
          ctx.arc(landmark.x * W, landmark.y * H, 4, 0, Math.PI * 2)
          ctx.stroke()
          ctx.globalAlpha = 0.8
        }
      }
    }
  }, [gestureState.hands])

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
      className="absolute top-20 right-6 z-50"
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          border: '1px solid rgba(54, 217, 255, 0.18)',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.5), 0 0 12px rgba(54, 217, 255, 0.06)',
        }}
      >
        <div className="flex items-center justify-between px-3 py-2 bg-card/90">
          <div className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full transition-all ${isLive ? 'bg-primary animate-pulse' : 'bg-muted-foreground/40'}`} />
            <span className="text-[9px] font-mono tracking-widest text-muted-foreground uppercase">Camera</span>
            {isLive && <span className="text-[8px] font-mono text-primary/60 tracking-wider">LIVE</span>}
            {modelStatus === 'loading' && <Loader2 size={10} className="animate-spin text-muted-foreground" />}
            {cameraStatus === 'denied' && <AlertCircle size={10} className="text-destructive" />}
          </div>
          <button
            onClick={() => setShowCamera((v) => !v)}
            className="text-muted-foreground hover:text-primary transition-colors"
            aria-label={showCamera ? 'Hide camera' : 'Show camera'}
          >
            {showCamera ? <EyeOff size={11} /> : <Eye size={11} />}
          </button>
        </div>
        {showCamera && (
          <div style={{ width: W, height: H }} className="relative bg-black">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
            <canvas
              ref={canvasRef}
              width={W}
              height={H}
              className="absolute inset-0 w-full h-full"
              style={{ transform: 'scaleX(-1)' }}
            />
            <div className="absolute top-1 left-1 w-3 h-3 border-t border-l border-primary/30" />
            <div className="absolute top-1 right-1 w-3 h-3 border-t border-r border-primary/30" />
            <div className="absolute bottom-1 left-1 w-3 h-3 border-b border-l border-primary/30" />
            <div className="absolute bottom-1 right-1 w-3 h-3 border-b border-r border-primary/30" />
            {(gestureState.leftGesture !== 'none' || gestureState.rightGesture !== 'none') && (
              <div className="absolute bottom-2 left-2 right-2 flex justify-center gap-1 z-10">
                {gestureState.leftGesture !== 'none' && (
                  <span className="text-[8px] font-mono tracking-widest uppercase px-1.5 py-0.5 rounded bg-card/70 border border-primary/20 text-primary">
                    L: {gestureState.leftGesture.replace(/_/g, ' ')}
                  </span>
                )}
                {gestureState.rightGesture !== 'none' && (
                  <span className="text-[8px] font-mono tracking-widest uppercase px-1.5 py-0.5 rounded bg-card/70 border border-primary/20 text-primary">
                    R: {gestureState.rightGesture.replace(/_/g, ' ')}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  )
}
