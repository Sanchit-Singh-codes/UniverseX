'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { ChevronRight } from 'lucide-react'

function HandOpenPalm({ color }: { color: string }) {
  return (
    <svg width="32" height="42" viewBox="0 0 32 42" fill="none" aria-hidden="true">
      <path d="M5 27 C3 25 3 21 4 17 C5 14.5 7.5 14 9 15 L9 26" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M11 26 L11 9 C11 7 12.5 6 14 6 C15.5 6 17 7 17 9 L17 24" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M17 24 L17 7 C17 5.5 18 4.5 19.5 4.5 C21 4.5 22 5.5 22 7 L22 24" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M22 25 L22 9 C22 7 23 6 24.5 6 C26 6 27 7 27 9 L27 26" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M27 26 L27 13 C27 11.5 28 10.5 29 10.5 C30 10.5 31 11.5 31 13 L31 27" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M9 26 C8 28 8 32 10 34 C12 36 18 36.5 22 35 C25 34 27 31 27 27" stroke={color} strokeWidth="2" fill={color + '20'} strokeLinejoin="round" />
      <path d="M31 27 C31 29 30 31 28 33" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M5 27 C5 29 6.5 32 9 33" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  )
}

function HandPoint({ color }: { color: string }) {
  return (
    <svg width="32" height="42" viewBox="0 0 32 42" fill="none" aria-hidden="true">
      <path d="M13 27 L13 7 C13 5 14.5 4 16 4 C17.5 4 19 5 19 7 L19 27" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <circle cx="16" cy="2.5" r="1.8" fill={color} opacity="0.9" />
      <line x1="16" y1="0" x2="16" y2="4" stroke={color} strokeWidth="1.5" strokeDasharray="1.5 1.5" opacity="0.5" />
      <path d="M19 27 C20 24 20 21 19.5 19" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <path d="M20.5 28 C21.5 25 21.5 22 21 21" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <path d="M22 28 C23 26 23 24 22.5 22.5" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <path d="M12 27 C11 25 11 22 11.5 20" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.4" />
      <path d="M11 27 C10 32 11 36 15 37 L18 37 C22 36 23 32 22 27" stroke={color} strokeWidth="2" fill={color + '20'} strokeLinejoin="round" />
    </svg>
  )
}

function HandFist({ color }: { color: string }) {
  return (
    <svg width="32" height="42" viewBox="0 0 32 42" fill="none" aria-hidden="true">
      <path d="M8 20 C8 17 10 15 13 15 C14 15 15 15.8 16.5 15.5 C18 15.2 19 15 20 15 C22 15 24 17 24 20" stroke={color} strokeWidth="2.2" strokeLinecap="round" fill={color + '18'} />
      <path d="M8 20 L8 30 C8 33 10 35.5 13.5 36 L20 36 C23 35.5 24.5 33 24.5 30 L24.5 20" stroke={color} strokeWidth="2.2" fill={color + '18'} strokeLinejoin="round" />
      <path d="M8 20 C7 18 6 16 7 14 C8 12 10 12 11 13.5 L11 20" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none" />
      <line x1="13.5" y1="20" x2="13.5" y2="25" stroke={color} strokeWidth="1.3" opacity="0.4" />
      <line x1="17" y1="20" x2="17" y2="25" stroke={color} strokeWidth="1.3" opacity="0.4" />
      <line x1="20.5" y1="20" x2="20.5" y2="25" stroke={color} strokeWidth="1.3" opacity="0.4" />
    </svg>
  )
}

function HandTwoOpen({ color }: { color: string }) {
  return (
    <svg width="52" height="38" viewBox="0 0 52 38" fill="none" aria-hidden="true">
      <g transform="scale(0.6,0.6) translate(0,0)">
        <path d="M5 27 C3 25 3 21 5 17 L9 15 L9 26" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M11 26 L11 9 C11 7 14 6 17 9 L17 24" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M17 24 L17 7 C17 5.5 19.5 4.5 22 7 L22 24" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M22 25 L22 9 C22 7 24.5 6 27 9 L27 26" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M27 26 L27 13 C27 11.5 29 10.5 31 13 L31 27" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M9 26 C8 31 11 36 18 36 C25 36 27 31 27 26" stroke={color} strokeWidth="2.5" fill={color + '18'} />
        <path d="M31 27 C31 30 29.5 33 27.5 34" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M5 27 C5 30 7 33 9.5 34" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      </g>
      <path d="M20 18 L24 18 M28 18 L32 18" stroke={color} strokeWidth="1.5" strokeDasharray="2 1.5" opacity="0.65" strokeLinecap="round" />
      <g transform="translate(26,0) scale(0.6,0.6)">
        <path d="M5 27 C3 25 3 21 5 17 L9 15 L9 26" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M11 26 L11 9 C11 7 14 6 17 9 L17 24" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M17 24 L17 7 C17 5.5 19.5 4.5 22 7 L22 24" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M22 25 L22 9 C22 7 24.5 6 27 9 L27 26" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M27 26 L27 13 C27 11.5 29 10.5 31 13 L31 27" stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M9 26 C8 31 11 36 18 36 C25 36 27 31 27 26" stroke={color} strokeWidth="2.5" fill={color + '18'} />
        <path d="M31 27 C31 30 29.5 33 27.5 34" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M5 27 C5 30 7 33 9.5 34" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      </g>
    </svg>
  )
}

interface GestureItem {
  Hand: React.FC<{ color: string }>
  name: string
  hand: string
  action: string
  color: string
  step: string
}

const GESTURES: GestureItem[] = [
  { Hand: HandOpenPalm, name: 'Open Palm',      hand: 'Either hand', action: 'Spawn the solar system',         color: '#00f5ff', step: '1' },
  { Hand: HandPoint,    name: 'Point',           hand: 'Right hand',  action: 'Aim at planet — hold to select',  color: '#4db8ff', step: '2' },
  { Hand: HandFist,     name: 'Closed Fist',     hand: 'Left hand',   action: 'Start auto-rotation',             color: '#ff9944', step: '3' },
  { Hand: HandOpenPalm, name: 'Open Palm',       hand: 'Left hand',   action: 'Stop rotation',                   color: '#00e090', step: '4' },
  { Hand: HandTwoOpen,  name: 'Both Open Palms', hand: 'Both hands',  action: 'Spread to scale up / down',       color: '#88aaff', step: '5' },
]

export function GestureGuide() {
  const [open, setOpen] = useState(true)

  return (
    <motion.div
      initial={{ x: 120, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.8 }}
      className="absolute right-5 top-1/2 -translate-y-1/2 z-50"
      style={{ width: 240 }}
    >
      <div className="glass-bright rounded-2xl overflow-hidden">
        <button
          className="flex items-center justify-between w-full px-4 py-3 hover:bg-white/5 transition-colors"
          onClick={() => setOpen(v => !v)}
          aria-expanded={open}
          aria-label="Toggle gesture guide"
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse-glow" />
            <span className="text-[10px] font-mono tracking-[0.28em] text-cyan-300 uppercase font-semibold">
              Gesture Guide
            </span>
          </div>
          <motion.div animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronRight size={13} className="text-cyan-500/50" />
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
              <div className="border-t border-white/5 divide-y divide-white/[0.04]">
                {GESTURES.map((g, i) => (
                  <motion.div
                    key={g.step}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.25 }}
                    className="flex items-center gap-3 px-3 py-2.5"
                  >
                    <div
                      className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold font-mono"
                      style={{ background: g.color + '20', border: '1px solid ' + g.color + '40', color: g.color }}
                    >
                      {g.step}
                    </div>
                    <div
                      className="flex-shrink-0 flex items-center justify-center rounded-xl"
                      style={{ width: 56, height: 46, background: g.color + '0c', border: '1px solid ' + g.color + '1e' }}
                    >
                      <g.Hand color={g.color} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-semibold font-mono leading-tight" style={{ color: g.color }}>
                        {g.name}
                      </div>
                      <div className="text-[9px] text-gray-500 font-mono leading-tight mt-0.5">
                        {g.hand}
                      </div>
                      <div className="text-[9px] text-gray-400 leading-snug mt-1">
                        {g.action}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="px-4 py-2.5 border-t border-white/5 bg-cyan-500/[0.04]">
                <p className="text-[9px] text-cyan-400/45 font-mono text-center">
                  Hold pointing finger still 0.8s to select
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
