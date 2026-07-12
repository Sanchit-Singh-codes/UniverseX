'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

/* ─────────────────────────────────────────────────────────────────────────
   Large, clear hand gesture SVG illustrations
   Each is drawn on a 60×70 viewBox — fingers pointing up, palm facing viewer
───────────────────────────────────────────────────────────────────────── */

function HandOpenPalm({ color }: { color: string }) {
  return (
    <svg width="48" height="56" viewBox="0 0 60 70" fill="none" aria-hidden="true">
      {/* Thumb */}
      <path
        d="M12 48 C10 44 9 38 10 32 C11 27 14 25 17 26 L17 44"
        stroke={color} strokeWidth="3.5" strokeLinecap="round" fill="none"
      />
      {/* Index */}
      <path
        d="M19 44 L19 12 C19 9 21 7 23.5 7 C26 7 28 9 28 12 L28 40"
        stroke={color} strokeWidth="3.5" strokeLinecap="round" fill="none"
      />
      {/* Middle */}
      <path
        d="M28 40 L28 9 C28 6 30 4 32.5 4 C35 4 37 6 37 9 L37 40"
        stroke={color} strokeWidth="3.5" strokeLinecap="round" fill="none"
      />
      {/* Ring */}
      <path
        d="M37 41 L37 12 C37 9 39 7 41.5 7 C44 7 46 9 46 12 L46 43"
        stroke={color} strokeWidth="3.5" strokeLinecap="round" fill="none"
      />
      {/* Pinky */}
      <path
        d="M46 43 L46 18 C46 15 48 13 50 13 C52 13 54 15 54 18 L54 44"
        stroke={color} strokeWidth="3.5" strokeLinecap="round" fill="none"
      />
      {/* Palm */}
      <path
        d="M17 44 C15 47 15 53 18 56 C21 59 28 60 33 59 C40 58 46 55 47 51 L47 44"
        stroke={color} strokeWidth="3.5" fill={color + '22'} strokeLinejoin="round"
      />
      <path d="M54 44 C54 47 52 51 49 53" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
      <path d="M12 48 C12 51 14 55 17 56" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  )
}

function HandPoint({ color }: { color: string }) {
  return (
    <svg width="48" height="56" viewBox="0 0 60 70" fill="none" aria-hidden="true">
      {/* Index extended upward */}
      <path
        d="M24 46 L24 10 C24 7 26 5 28.5 5 C31 5 33 7 33 10 L33 46"
        stroke={color} strokeWidth="4" strokeLinecap="round" fill="none"
      />
      {/* Glowing tip dot */}
      <circle cx="28.5" cy="4" r="3.5" fill={color} opacity="0.9" />
      <circle cx="28.5" cy="4" r="6" fill={color} opacity="0.3" />
      {/* Dashed laser line going up */}
      <line x1="28.5" y1="0" x2="28.5" y2="5" stroke={color} strokeWidth="2" strokeDasharray="2 2" opacity="0.6" />
      {/* Middle — curled */}
      <path d="M33 46 C35 42 35 37 34 33" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.45" />
      {/* Ring — curled */}
      <path d="M36 47 C38 43 38 38 37 34" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.45" />
      {/* Pinky — curled */}
      <path d="M39 48 C41 45 41 41 40 37" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.45" />
      {/* Thumb — curled */}
      <path d="M23 46 C20 42 19 38 20 34" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.45" />
      {/* Palm */}
      <path
        d="M20 46 C18 50 19 57 22 59 L34 59 C38 57 39 50 37 46"
        stroke={color} strokeWidth="3.5" fill={color + '22'} strokeLinejoin="round"
      />
    </svg>
  )
}

function HandFist({ color }: { color: string }) {
  return (
    <svg width="48" height="56" viewBox="0 0 60 70" fill="none" aria-hidden="true">
      {/* Knuckle row */}
      <path
        d="M14 30 C14 25 17 22 22 22 C24 22 26 23 28 22 C30 21.5 32 21.5 34 22 C36 22.5 38 22 40 22 C44 22 47 25 47 30"
        stroke={color} strokeWidth="3.5" strokeLinecap="round" fill={color + '20'}
      />
      {/* Fist body */}
      <path
        d="M14 30 L14 46 C14 51 17 55 22 56 L40 56 C45 55 47 51 47 46 L47 30"
        stroke={color} strokeWidth="3.5" fill={color + '20'} strokeLinejoin="round"
      />
      {/* Thumb tucked at side */}
      <path
        d="M14 30 C12 27 11 23 12 20 C13 17 16 17 18 19 L18 30"
        stroke={color} strokeWidth="3" strokeLinecap="round" fill="none"
      />
      {/* Knuckle indent lines */}
      <line x1="22" y1="30" x2="22" y2="37" stroke={color} strokeWidth="1.8" opacity="0.4" />
      <line x1="28" y1="30" x2="28" y2="37" stroke={color} strokeWidth="1.8" opacity="0.4" />
      <line x1="34" y1="30" x2="34" y2="37" stroke={color} strokeWidth="1.8" opacity="0.4" />
      <line x1="40" y1="30" x2="40" y2="37" stroke={color} strokeWidth="1.8" opacity="0.4" />
    </svg>
  )
}

function HandPinch({ color }: { color: string }) {
  return (
    <svg width="48" height="56" viewBox="0 0 60 70" fill="none" aria-hidden="true">
      {/* Thumb coming up and right */}
      <path
        d="M18 52 C14 48 12 42 14 35 C15 30 18 27 22 28 L24 38"
        stroke={color} strokeWidth="3.5" strokeLinecap="round" fill="none"
      />
      {/* Index finger curling down toward thumb */}
      <path
        d="M26 46 L26 20 C26 17 28 15 30 15 C32 15 34 17 34 20 L34 38 C34 42 32 44 30 44 L26 44"
        stroke={color} strokeWidth="3.5" strokeLinecap="round" fill="none"
      />
      {/* Pinch contact point glow */}
      <circle cx="25" cy="40" r="5" fill={color} opacity="0.4" />
      <circle cx="25" cy="40" r="2.5" fill={color} opacity="0.9" />
      {/* Middle — half extended */}
      <path d="M34 45 L34 25 C34 22 36 20 38 21 L38 45" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.55" />
      {/* Ring — curled */}
      <path d="M38 46 C40 43 41 39 40 35" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.4" />
      {/* Pinky — curled */}
      <path d="M41 47 C43 44 44 40 43 37" stroke={color} strokeWidth="3" strokeLinecap="round" opacity="0.4" />
      {/* Palm */}
      <path
        d="M22 46 C20 50 20 56 24 58 L38 58 C43 56 44 50 43 46"
        stroke={color} strokeWidth="3.5" fill={color + '18'} strokeLinejoin="round"
      />
    </svg>
  )
}

function HandTwoOpen({ color }: { color: string }) {
  return (
    <svg width="64" height="52" viewBox="0 0 80 65" fill="none" aria-hidden="true">
      {/* === LEFT HAND (mirrored) === */}
      <g transform="scale(-0.7,0.7) translate(-54,0)">
        {/* Thumb */}
        <path d="M12 48 C10 44 9 38 10 32 C11 27 14 25 17 26 L17 44" stroke={color} strokeWidth="4.5" strokeLinecap="round" fill="none" />
        {/* Index */}
        <path d="M19 44 L19 12 C19 9 23 7 26 12 L26 40" stroke={color} strokeWidth="4.5" strokeLinecap="round" fill="none" />
        {/* Middle */}
        <path d="M26 40 L26 9 C26 6 30 4 34 9 L34 40" stroke={color} strokeWidth="4.5" strokeLinecap="round" fill="none" />
        {/* Ring */}
        <path d="M34 41 L34 12 C34 9 38 7 41 12 L41 43" stroke={color} strokeWidth="4.5" strokeLinecap="round" fill="none" />
        {/* Pinky */}
        <path d="M41 43 L41 18 C41 15 44 13 47 18 L47 44" stroke={color} strokeWidth="4.5" strokeLinecap="round" fill="none" />
        {/* Palm */}
        <path d="M17 44 C15 50 17 58 24 59 C32 60 42 57 44 51 L44 44" stroke={color} strokeWidth="4.5" fill={color + '20'} />
        <path d="M47 44 C47 48 45 52 42 54" stroke={color} strokeWidth="4.5" strokeLinecap="round" />
        <path d="M12 48 C12 52 14 56 17 57" stroke={color} strokeWidth="4.5" strokeLinecap="round" />
      </g>
      {/* === ARROWS indicating spread === */}
      <path d="M27 30 L23 30" stroke={color} strokeWidth="2" strokeLinecap="round" markerEnd="url(#arrowL)" opacity="0.8" />
      <path d="M53 30 L57 30" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.8" />
      {/* Arrow heads manually */}
      <polygon points="22,27 18,30 22,33" fill={color} opacity="0.8" />
      <polygon points="58,27 62,30 58,33" fill={color} opacity="0.8" />
      {/* === RIGHT HAND === */}
      <g transform="translate(36,0) scale(0.7,0.7)">
        {/* Thumb */}
        <path d="M12 48 C10 44 9 38 10 32 C11 27 14 25 17 26 L17 44" stroke={color} strokeWidth="4.5" strokeLinecap="round" fill="none" />
        {/* Index */}
        <path d="M19 44 L19 12 C19 9 23 7 26 12 L26 40" stroke={color} strokeWidth="4.5" strokeLinecap="round" fill="none" />
        {/* Middle */}
        <path d="M26 40 L26 9 C26 6 30 4 34 9 L34 40" stroke={color} strokeWidth="4.5" strokeLinecap="round" fill="none" />
        {/* Ring */}
        <path d="M34 41 L34 12 C34 9 38 7 41 12 L41 43" stroke={color} strokeWidth="4.5" strokeLinecap="round" fill="none" />
        {/* Pinky */}
        <path d="M41 43 L41 18 C41 15 44 13 47 18 L47 44" stroke={color} strokeWidth="4.5" strokeLinecap="round" fill="none" />
        {/* Palm */}
        <path d="M17 44 C15 50 17 58 24 59 C32 60 42 57 44 51 L44 44" stroke={color} strokeWidth="4.5" fill={color + '20'} />
        <path d="M47 44 C47 48 45 52 42 54" stroke={color} strokeWidth="4.5" strokeLinecap="round" />
        <path d="M12 48 C12 52 14 56 17 57" stroke={color} strokeWidth="4.5" strokeLinecap="round" />
      </g>
    </svg>
  )
}

/* ─────────────────────────────────────────────────────────────────────────
   Gesture data
───────────────────────────────────────────────────────────────────────── */

interface GestureEntry {
  Hand: React.FC<{ color: string }>
  name: string
  hand: string
  action: string
  color: string
}

const GESTURES: GestureEntry[] = [
  {
    Hand: HandOpenPalm,
    name: 'Open Palm',
    hand: 'Either hand',
    action: 'Spawn the solar system',
    color: '#00f5ff',
  },
  {
    Hand: HandPoint,
    name: 'Point Finger',
    hand: 'Either hand',
    action: 'Aim at a planet to highlight it',
    color: '#4db8ff',
  },
  {
    Hand: HandPinch,
    name: 'Pinch',
    hand: 'Either hand',
    action: 'Grab & move highlighted planet',
    color: '#aa88ff',
  },
  {
    Hand: HandFist,
    name: 'Closed Fist',
    hand: 'Either hand',
    action: 'Reset the solar system',
    color: '#ff6644',
  },
  {
    Hand: HandTwoOpen,
    name: 'Two Palms',
    hand: 'Both hands',
    action: 'Spread apart to scale up',
    color: '#44ffaa',
  },
]

/* ─────────────────────────────────────────────────────────────────────────
   Component
───────────────────────────────────────────────────────────────────────── */

export function GestureGuide() {
  const [open, setOpen] = useState(true)

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
      className="absolute right-5 z-50"
      style={{ top: '50%', transform: 'translateY(-50%)', width: 260 }}
    >
      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(0, 8, 24, 0.88)',
          border: '1px solid rgba(0, 200, 255, 0.22)',
          backdropFilter: 'blur(16px)',
          boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 20px rgba(0,180,255,0.06)',
        }}
      >
        {/* Header */}
        <button
          className="flex items-center justify-between w-full px-4 py-3 transition-colors"
          style={{ background: 'rgba(0, 180, 255, 0.06)' }}
          onClick={() => setOpen(v => !v)}
          aria-expanded={open}
          aria-label="Toggle gesture guide"
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: '#00f5ff',
                boxShadow: '0 0 6px rgba(0,245,255,0.8)',
              }}
            />
            <span
              className="text-[11px] font-mono font-bold tracking-[0.3em] uppercase"
              style={{ color: '#00f5ff' }}
            >
              Gesture Guide
            </span>
          </div>
          <div style={{ color: 'rgba(0,200,255,0.5)' }}>
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
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {GESTURES.map((g, i) => (
                  <motion.div
                    key={g.name}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.28 }}
                    className="flex items-center gap-3 px-4 py-3"
                    style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                  >
                    {/* Step number */}
                    <div
                      className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold font-mono"
                      style={{
                        background: g.color + '22',
                        border: '1px solid ' + g.color + '55',
                        color: g.color,
                      }}
                    >
                      {i + 1}
                    </div>

                    {/* Hand illustration */}
                    <div
                      className="flex-shrink-0 flex items-center justify-center rounded-xl"
                      style={{
                        width: 68,
                        height: 60,
                        background: g.color + '0e',
                        border: '1px solid ' + g.color + '28',
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
                      <div className="text-[9px] font-mono leading-tight mt-0.5" style={{ color: 'rgba(100,160,200,0.6)' }}>
                        {g.hand}
                      </div>
                      <div className="text-[10px] leading-snug mt-1" style={{ color: 'rgba(200,220,240,0.55)' }}>
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
                  background: 'rgba(0,200,255,0.04)',
                  borderTop: '1px solid rgba(0,200,255,0.08)',
                }}
              >
                <p className="text-[9px] font-mono" style={{ color: 'rgba(0,200,255,0.4)' }}>
                  Hold point gesture still for 0.8s to select a planet
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
