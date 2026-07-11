'use client'

import { motion } from 'framer-motion'
import { forwardRef, useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import dynamic from 'next/dynamic'
import type { GestureState } from '@/lib/types'

const HandOverlay = dynamic(() => import('./hand-overlay'), { ssr: false })

interface CameraFeedProps {
  gestureState: GestureState
  isTracking: boolean
}

const CameraFeed = forwardRef<HTMLVideoElement, CameraFeedProps>(
  function CameraFeed({ gestureState, isTracking }, ref) {
    const [showCamera, setShowCamera] = useState(true)
    const W = 220
    const H = 160

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
            border: '1px solid rgba(0, 200, 255, 0.18)',
            boxShadow: '0 4px 24px rgba(0, 0, 0, 0.5), 0 0 12px rgba(0, 180, 255, 0.06)',
          }}
        >
          {/* Header bar */}
          <div className="flex items-center justify-between px-3 py-2 bg-[rgba(0,10,30,0.9)]">
            <div className="flex items-center gap-2">
              <div
                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                  isTracking ? 'bg-cyan-400 animate-pulse-glow' : 'bg-gray-600'
                }`}
              />
              <span className="text-[9px] font-mono tracking-widest text-gray-400 uppercase">
                Camera
              </span>
              {isTracking && (
                <span className="text-[8px] font-mono text-cyan-500/60 tracking-wider">LIVE</span>
              )}
            </div>
            <button
              onClick={() => setShowCamera((v) => !v)}
              className="text-gray-600 hover:text-cyan-400 transition-colors"
              aria-label={showCamera ? 'Hide camera' : 'Show camera'}
            >
              {showCamera ? <EyeOff size={11} /> : <Eye size={11} />}
            </button>
          </div>

          {/* Video + hand overlay */}
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
              {/* Corner scan lines */}
              <div className="absolute top-1 left-1 w-3 h-3 border-t border-l border-cyan-400/30" />
              <div className="absolute top-1 right-1 w-3 h-3 border-t border-r border-cyan-400/30" />
              <div className="absolute bottom-1 left-1 w-3 h-3 border-b border-l border-cyan-400/30" />
              <div className="absolute bottom-1 right-1 w-3 h-3 border-b border-r border-cyan-400/30" />

              {/* Gesture label overlay */}
              {gestureState.gesture !== 'none' && (
                <div
                  className="absolute bottom-2 left-2 right-2 text-center"
                >
                  <span
                    className="text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-full"
                    style={{
                      background: 'rgba(0, 20, 50, 0.7)',
                      border: '1px solid rgba(0, 245, 255, 0.2)',
                      color: '#00f5ff',
                    }}
                  >
                    {gestureState.gesture.replace(/_/g, ' ')}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    )
  }
)

export default CameraFeed
