'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const GESTURES = [
  { icon: '✋', name: 'Open Palm', action: 'Spawn Solar System' },
  { icon: '☝️', name: 'Point', action: 'Highlight nearest planet' },
  { icon: '🤌', name: 'Pinch', action: 'Grab highlighted planet' },
  { icon: '✊', name: 'Fist', action: 'Reset everything' },
  { icon: '🤲', name: '2-Hand Pinch', action: 'Resize Solar System' },
]

export function GestureGuide() {
  const [open, setOpen] = useState(false)

  return (
    <motion.div
      initial={{ x: 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1], delay: 0.6 }}
      className="absolute right-6 top-1/2 -translate-y-1/2 z-50"
    >
      <div className="glass-bright rounded-2xl overflow-hidden">
        <button
          className="flex items-center justify-between gap-4 px-4 py-3 w-full hover:bg-cyan-500/5 transition-colors"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <span className="text-[9px] font-mono tracking-[0.25em] text-cyan-400 uppercase">
            Gesture Guide
          </span>
          <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={12} className="text-gray-500" />
          </motion.div>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-2 border-t border-white/5">
                {GESTURES.map((g) => (
                  <div key={g.name} className="flex items-center gap-3 py-1.5">
                    <span className="text-base w-6 flex-shrink-0">{g.icon}</span>
                    <div>
                      <div className="text-[11px] font-mono text-cyan-300 font-medium">{g.name}</div>
                      <div className="text-[9px] text-gray-500 font-mono">{g.action}</div>
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
