'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

/* Left Hand Closed → Rotate */
function HandClosed({ color }: { color: string }) {
  return (
    <svg width="48" height="56" viewBox="0 0 60 70" fill="none" aria-hidden="true">
      <path d="M14 30 C14 25 17 22 22 22 C24 22 26 23 28 22 C30 21.5 32 21.5 34 22 C36 22.5 38 22 40 22 C44 22 47 25 47 30" stroke={color} strokeWidth="3.5" strokeLinecap="round" fill={color + '20'} />
      <path d="M14 30 L14 46 C14 51 17 55 22 56 L40 56 C45 55 47 51 47 46 L47 30" stroke={color} strokeWidth="3.5" fill={color + '20'} strokeLinejoin="round" />
      <path d="M14 30 C12 27 11 23 12 20 C13 17 16 17 18 19 L18 30" stroke={color} strokeWidth="3" strokeLinecap="round" fill="none" />
      <line x1="22" y1="30" x2="22" y2="37" stroke={color} strokeWidth="1.8" opacity="0.4" />
      <line x1="28" y1="30" x2="28" y2="37" stroke={color} strokeWidth="1.8" opacity="0.4" />
      <line x1="34" y1="30" x2="34" y2="37" stroke={color} strokeWidth="1.8" opacity="0.4" />
      <line x1="40" y1="30" x2="40" y2="37" stroke={color} strokeWidth="1.8" opacity="0.4" />
      {/* Curved arrow showing rotation */}
      <path d="M52 28 Q56 35 52 42" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" />
      <polygon points="50,24 54,27 51,32" fill={color} opacity="0.8" />
    </svg>
  )
}

/* Left Hand Open → Stop */
function HandOpen({ color }: { color: string }) {
  return (
    <svg width="48" height="56" viewBox="0 0 60 70" fill="none" aria-hidden="true">
      <path d="M12 48 C10 44 9 38 10 32 C11 27 14 25 17 26 L17 44" stroke={color} strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M19 44 L19 12 C19 9 21 7 23.5 7 C26 7 28 9 28 12 L28 40" stroke={color} strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M28 40 L28 9 C28 6 30 4 32.5 4 C35 4 37 6 37 9 L37 40" stroke={color} strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M37 41 L37 12 C37 9 39 7 41.5 7 C44 7 46 9 46 12 L46 43" stroke={color} strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M46 43 L46 18 C46 15 48 13 50 13 C52 13 54 15 54 18 L54 44" stroke={color} strokeWidth="3.5" strokeLinecap="round" fill="none" />
      <path d="M17 44 C15 47 15 53 18 56 C21 59 28 60 33 59 C40 58 46 55 47 51 L47 44" stroke={color} strokeWidth="3.5" fill={color + '22'} strokeLinejoin="round" />
      <path d="M54 44 C54 47 52 51 49 53" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M12 48 C12 51 14 55 17 56" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
      {/* Stop symbol */}
      <rect x="50" y="48" width="8" height="8" stroke={color} strokeWidth="2" fill="none" opacity="0.7" rx="1" />
    </svg>
  )
}

/* Right Hand Point → Select */
function HandPointing({ color }: { color: string }) {
  return (
    <svg width="48" height="56" viewBox="0 0 60 70" fill="none" aria-hidden="true">
      <path d="M24 46 L24 10 C24 7 26 5 28.5 5 C31 5 33 7 33 10 L33 46" stroke={color} strokeWidth="4" strokeLinecap="round" fill="none" />
      <circle cx="28.5" cy="4" r="3.5" fill={color} opacity="0.9" />
      <circle cx="28.5" cy="4" r="6" fill={color} opacity="0.3" />
      <line x1="28.5" y1="0" x2="28.5" y2="5" stroke={color} strokeWidth="2" strokeDasharray="2 2" opacity="0.6" />
      <path d="M33 46 C35 42 35 37 34 33" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.45" />
      <path d="M36 47 C38 43 38 38 37 34" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.45" />
      <path d="M39 48 C41 45 41 41 40 37" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.45" />
      <path d="M23 46 C20 42 19 38 20 34" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.45" />
      <path d="M20 46 C18 50 19 57 22 59 L34 59 C38 57 39 50 37 46" stroke={color} strokeWidth="3.5" fill={color + '22'} strokeLinejoin="round" />
      {/* Glowing target reticle */}
      <circle cx="38" cy="18" r="12" stroke={color} strokeWidth="1.5" fill="none" opacity="0.6" />
      <circle cx="38" cy="18" r="8" stroke={color} strokeWidth="1.5" fill="none" opacity="0.4" />
      <line x1="38" y1="10" x2="38" y2="5" stroke={color} strokeWidth="1.5" opacity="0.5" />
      <line x1="38" y1="30" x2="38" y2="26" stroke={color} strokeWidth="1.5" opacity="0.5" />
      <line x1="46" y1="18" x2="50" y2="18" stroke={color} strokeWidth="1.5" opacity="0.5" />
      <line x1="30" y1="18" x2="26" y2="18" stroke={color} strokeWidth="1.5" opacity="0.5" />
    </svg>
  )
}

/* Both Hands Spread → Zoom */
function BothHandsSpread({ color }: { color: string }) {
  return (
    <svg width="64" height="52" viewBox="0 0 80 65" fill="none" aria-hidden="true">
      {/* Left hand open (mirrored) */}
      <g transform="scale(-0.65,0.65) translate(-56,2)">
        <path d="M12 48 C10 44 9 38 10 32 C11 27 14 25 17 26 L17 44" stroke={color} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M19 44 L19 12 C19 9 23 7 26 12 L26 40" stroke={color} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M26 40 L26 9 C26 6 30 4 34 9 L34 40" stroke={color} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M34 41 L34 12 C34 9 38 7 41 12 L41 43" stroke={color} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M41 43 L41 18 C41 15 44 13 47 18 L47 44" stroke={color} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M17 44 C15 50 17 58 24 59 C32 60 42 57 44 51 L44 44" stroke={color} strokeWidth="4" fill={color + '20'} />
      </g>
      {/* Spread arrows */}
      <path d="M28 30 L20 30" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M52 30 L60 30" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <polygon points="19,27 15,30 19,33" fill={color} opacity="0.8" />
      <polygon points="61,27 65,30 61,33" fill={color} opacity="0.8" />
      {/* Right hand open */}
      <g transform="translate(32,2) scale(0.65,0.65)">
        <path d="M12 48 C10 44 9 38 10 32 C11 27 14 25 17 26 L17 44" stroke={color} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M19 44 L19 12 C19 9 23 7 26 12 L26 40" stroke={color} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M26 40 L26 9 C26 6 30 4 34 9 L34 40" stroke={color} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M34 41 L34 12 C34 9 38 7 41 12 L41 43" stroke={color} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M41 43 L41 18 C41 15 44 13 47 18 L47 44" stroke={color} strokeWidth="4" strokeLinecap="round" fill="none" />
        <path d="M17 44 C15 50 17 58 24 59 C32 60 42 57 44 51 L44 44" stroke={color} strokeWidth="4" fill={color + '20'} />
      </g>
    </svg>
  )
}

interface GestureEntry {
  Hand: React.FC<{ color: string }>
  name: string
  hand: string
  action: string
  color: string
}

const GESTURES: GestureEntry[] = [
  {
    Hand: HandClosed,
    name: 'Left Hand Closed',
    hand: 'Left fist',
    action: 'Start continuous rotation of the solar system',
    color: '#36d9ff',
  },
  {
    Hand: HandOpen,
    name: 'Left Hand Open',
    hand: 'Left palm',
    action: 'Stop rotation, keep current angle',
    color: '#88ddff',
  },
  {
    Hand: HandPointing,
    name: 'Right Hand Point',
    hand: 'Right index',
    action: 'Show cursor, hover over planets. Hold 1s to select and zoom',
    color: '#00ffff',
  },
  {
    Hand: BothHandsSpread,
    name: 'Both Hands',
    hand: 'Both palms',
    action: 'Spread apart to zoom in, closer to zoom out',
    color: '#36d9ff',
  },
]

export function GestureGuide() {
  const [open, setOpen] = useState(true)

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
      className="absolute right-5 z-50"
      style={{ top: '50%', transform: 'translateY(-50%)', width: 280 }}
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(2, 5, 11, 0.92)',
          border: '1px solid rgba(54, 217, 255, 0.2)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.7), 0 0 20px rgba(54,217,255,0.08)',
        }}
      >
        {/* Header */}
        <button
          className="flex items-center justify-between w-full px-4 py-3 transition-colors"
          style={{ background: 'rgba(54, 217, 255, 0.08)' }}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle gesture guide"
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: '#36d9ff',
                boxShadow: '0 0 8px rgba(54,217,255,0.9)',
              }}
            />
            <span
              className="text-[11px] font-mono font-bold tracking-[0.25em] uppercase"
              style={{ color: '#36d9ff' }}
            >
              Gesture Guide
            </span>
          </div>
          <div style={{ color: 'rgba(54,217,255,0.5)' }}>
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div style={{ borderTop: '1px solid rgba(54,217,255,0.1)' }}>
                {GESTURES.map((g, i) => (
                  <motion.div
                    key={g.name}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.28 }}
                    className="flex items-start gap-3 px-4 py-3"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                  >
                    {/* Step number */}
                    <div
                      className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono mt-0.5"
                      style={{
                        background: g.color + '22',
                        border: '1.5px solid ' + g.color + '55',
                        color: g.color,
                      }}
                    >
                      {i + 1}
                    </div>

                    {/* Hand illustration */}
                    <div
                      className="flex-shrink-0 flex items-center justify-center rounded-xl"
                      style={{
                        width: 70,
                        height: 62,
                        background: g.color + '0f',
                        border: '1px solid ' + g.color + '2a',
                      }}
                    >
                      <g.Hand color={g.color} />
                    </div>

                    {/* Text */}
                    <div className="min-w-0 flex-1">
                      <div
                        className="text-[12px] font-bold font-mono leading-tight"
                        style={{ color: g.color }}
                      >
                        {g.name}
                      </div>
                      <div className="text-[9px] font-mono leading-tight mt-0.5" style={{ color: 'rgba(100,170,200,0.6)' }}>
                        {g.hand}
                      </div>
                      <div className="text-[10px] leading-snug mt-1" style={{ color: 'rgba(200,220,240,0.5)' }}>
                        {g.action}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Footer */}
              <div
                className="px-4 py-2.5 text-center"
                style={{
                  background: 'rgba(54,217,255,0.05)',
                  borderTop: '1px solid rgba(54,217,255,0.1)',
                }}
              >
                <p className="text-[9px] font-mono" style={{ color: 'rgba(54,217,255,0.45)' }}>
                  Hold right-hand point for 1 second to select a planet
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
