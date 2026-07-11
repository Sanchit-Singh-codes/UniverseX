'use client'

import { motion } from 'framer-motion'
import { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import dynamic from 'next/dynamic'
import type { GestureState } from '@/lib/types'

// Dynamically import hand overlay to avoid SSR issues
const HandOverlay = dynamic(() => import('./hand-overlay'), { ssr: false })

interface CameraFeedProps {
  gestureState: GestureState
  isTracking: boolean
}

const CameraFeed = forwardRef<HTMLVideoElement, CameraFeedProps>(
  function CameraFeed({ gestureState, isTracking }, ref) {
    const [showCamera, setShowCamera] = useState(true)
    const W = 240
    const H = 180

    return (
      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.5 }}
        className="absolute bottom-6 left-6 z-50"
      >
        <div
          className="rounded-2xl overflow-hidden"
          style={{
            border: '1px solid rgba(0, 200, 255, 0.2)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.5)',
          }}
        >
          {/* Header bar */}
          <div className="flex items-center justify-between px-3 py-2 bg-[rgba(0,10,30,0.85)]">
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${isTracking ? 'bg-cyan-400 animate-pulse-glow' : 'bg-gray-600'}`} />
              <span className="text-[9px] font-mono tracking-widest text-gray-400 uppercase">
                Camera Feed
              </span>
            </div>
            <button
              onClick={() => setShowCamera((v) => !v)}
              className="text-gray-500 hover:text-cyan-400 transition-colors"
              aria-label={showCamera ? 'Hide camera' : 'Show camera'}
            >
              {showCamera ? <EyeOff size={12} /> : <Eye size={12} />}
            </button>
          </div>

          {/* Video + overlay */}
          {showCamera && (
            <div style={{ width: W, height: H }} className="relative bg-black">
              <video
                ref={ref}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
              <HandOverlay
                gesture={gestureState}
                width={W}
                height={H}
              />
              {/* Corner decorations */}
              <div className="absolute top-1 left-1 w-4 h-4 border-t border-l border-cyan-400/40" />
              <div className="absolute top-1 right-1 w-4 h-4 border-t border-r border-cyan-400/40" />
              <div className="absolute bottom-1 left-1 w-4 h-4 border-b border-l border-cyan-400/40" />
              <div className="absolute bottom-1 right-1 w-4 h-4 border-b border-r border-cyan-400/40" />
            </div>
          )}
        </div>
      </motion.div>
    )
  }
)

export default CameraFeed
