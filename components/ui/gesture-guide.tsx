'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

// Minimal inline SVG hand icons — no emoji
function IconOpenPalm() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="8" y1="18" x2="8" y2="6" />
      <line x1="11" y1="18" x2="11" y2="4" />
      <line x1="14" y1="18" x2="14" y2="5" />
      <line x1="17" y1="18" x2="17" y2="7" />
      <path d="M5 18 Q5 22 9 22 L17 22 Q21 22 21 18 L21 10" />
      <line x1="5" y1="10" x2="5" y2="18" />
    </svg>
  )
}

function IconPoint() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="18" x2="12" y2="4" />
      <path d="M9 18 Q8 22 12 22 Q16 22 15 18" />
      <path d="M9 12 Q8 18 8 18 L15 18 Q15 18 15 12" />
      <line x1="8" y1="12" x2="8" y2="9" />
      <line x1="15" y1="12" x2="15" y2="10" />
    </svg>
  )
}

function IconPinch() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 14 C 6 12 6 8 8 7 C 9 6.5 10 7 10 8 L10 12" />
      <path d="M10 10 C 10 8 11 7.5 12 8 L12 11" />
      <path d="M12 10 C 12 8 13 7.5 14 8 L14 12" />
      <path d="M14 10 C 14 8 15 7.5 16 8 L16 14" />
      <path d="M8 14 Q 8 18 12 18 L16 18 Q 18 18 18 14 L16 14" />
      <circle cx="9" cy="6" r="1.5" />
      <circle cx="12" cy="6" r="1.5" />
    </svg>
  )
}

function IconFist() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="7" y="9" width="10" height="6" rx="2" />
      <path d="M7 13 L7 16 Q7 19 10 19 L14 19 Q17 19 17 16 L17 15" />
      <path d="M7 9 L7 7 Q7 5 9 5 L9 9" />
    </svg>
  )
}

function IconTwoHandPinch() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="2.5" />
      <path d="M5 12 C5 10 6 8 8 8" />
      <path d="M5 12 C5 14 6 16 8 16" />
      <path d="M19 12 C19 10 18 8 16 8" />
      <path d="M19 12 C19 14 18 16 16 16" />
      <line x1="2" y1="12" x2="5" y2="12" />
      <line x1="19" y1="12" x2="22" y2="12" />
    </svg>
  )
}

const GESTURES = [
  {
    Icon: IconOpenPalm,
    name: 'Open Palm',
    action: 'Spawn Solar System',
    color: '#00f5ff',
  },
  {
    Icon: IconPoint,
    name: 'Point',
    action: 'Highlight nearest planet',
    color: '#4db8ff',
  },
  {
    Icon: IconPinch,
    name: 'Pinch',
    action: 'Grab highlighted planet',
    color: '#00e0ff',
  },
  {
    Icon: IconFist,
    name: 'Fist',
    action: 'Reset everything',
    color: '#ff6644',
  },
  {
    Icon: IconTwoHandPinch,
    name: '2-Hand Pinch',
    action: 'Resize Solar System',
    color: '#88ccff',
  },
]

export function GestureGuide() {
  const [open, setOpen] = useState(true)

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
      className="absolute right-6 top-1/2 -translate-y-1/2 z-50"
      style={{ maxWidth: 200 }}
    >
      <div className="glass-bright rounded-2xl overflow-hidden">
        <button
          className="flex items-center justify-between gap-4 px-4 py-3 w-full hover:bg-cyan-500/5 transition-colors"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label="Toggle gesture guide"
        >
          <span className="text-[9px] font-mono tracking-[0.25em] text-cyan-400 uppercase">
            Gesture Guide
          </span>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={12} className="text-gray-500" />
          </motion.div>
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
              <div className="px-4 pb-4 space-y-1 border-t border-white/5">
                {GESTURES.map((g) => (
                  <div key={g.name} className="flex items-center gap-3 py-2">
                    <div
                      className="flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-lg"
                      style={{
                        color: g.color,
                        background: `${g.color}12`,
                        border: `1px solid ${g.color}28`,
                      }}
                    >
                      <g.Icon />
                    </div>
                    <div>
                      <div className="text-[11px] font-mono text-cyan-200 font-medium leading-tight">
                        {g.name}
                      </div>
                      <div className="text-[9px] text-gray-500 font-mono leading-tight mt-0.5">
                        {g.action}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
