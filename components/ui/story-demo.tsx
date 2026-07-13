'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Pause, Instagram, Sparkles } from 'lucide-react'

// Left Hand Closed → Rotate
function HandClosed({ color }: { color: string }) {
  return (
    <svg width="120" height="120" viewBox="0 0 60 70" fill="none" aria-hidden="true" className="filter drop-shadow-[0_0_15px_rgba(0,245,255,0.4)]">
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

// Left Hand Open → Stop
function HandOpen({ color }: { color: string }) {
  return (
    <svg width="120" height="120" viewBox="0 0 60 70" fill="none" aria-hidden="true" className="filter drop-shadow-[0_0_15px_rgba(0,245,255,0.4)]">
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

// Right Hand Point → Select
function HandPointing({ color }: { color: string }) {
  return (
    <svg width="120" height="120" viewBox="0 0 60 70" fill="none" aria-hidden="true" className="filter drop-shadow-[0_0_15px_rgba(0,245,255,0.4)]">
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

// Both Hands Spread → Zoom
function BothHandsSpread({ color }: { color: string }) {
  return (
    <svg width="150" height="120" viewBox="0 0 80 65" fill="none" aria-hidden="true" className="filter drop-shadow-[0_0_15px_rgba(0,245,255,0.4)]">
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

interface Slide {
  title: string
  subtitle: string
  description: string
  illustration: (color: string) => React.ReactNode
  color: string
  accentText?: string
}

const STORY_SLIDES: Slide[] = [
  {
    title: "UNIVERSE X",
    subtitle: "GESTURE-CONTROLLED SOLAR SYSTEM",
    description: "Welcome to UniverseX! Point at planets to fly to them, pinch to zoom, and scale the cosmos with your bare hands. Running client-side via WebAssembly hand tracking.",
    illustration: (color: string) => (
      <div className="relative w-36 h-36 flex items-center justify-center">
        {/* Neon cosmic rings */}
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/20 animate-[spin_30s_linear_infinite]" />
        <div className="absolute inset-3 rounded-full border border-cyan-400/40 animate-[spin_20s_linear_infinite]" style={{ borderStyle: 'double' }} />
        <div className="absolute inset-7 rounded-full border border-cyan-300/60" />
        <div className="absolute inset-11 rounded-full border-2 border-cyan-200/80 animate-pulse" />
        <div className="absolute inset-16 rounded-full bg-cyan-400/90 shadow-[0_0_30px_#00f5ff,0_0_60px_rgba(0,245,255,0.4)] flex items-center justify-center">
          <Sparkles className="text-space-black w-6 h-6 animate-pulse" />
        </div>
      </div>
    ),
    color: "#00f5ff",
    accentText: "INTERACTIVE DEMO"
  },
  {
    title: "ROTATE SYSTEM",
    subtitle: "LEFT HAND CLOSED FIST ✊",
    description: "Form a fist with your Left Hand. The Solar System will begin continuous, smooth orbital rotation. Rotate the system to view celestial alignments from any perspective.",
    illustration: (color: string) => <HandClosed color={color} />,
    color: "#36d9ff",
    accentText: "LEFT HAND ROTATION"
  },
  {
    title: "FREEZE SYSTEM",
    subtitle: "LEFT HAND OPEN PALM 🖐️",
    description: "Open your Left Hand wide. The system locks rotation immediately, holding the solar simulation frozen in its current angle. Useful for analyzing orbital spacing.",
    illustration: (color: string) => <HandOpen color={color} />,
    color: "#88ddff",
    accentText: "FREEZE VIEW"
  },
  {
    title: "FLY TO PLANETS",
    subtitle: "RIGHT HAND POINT 👆",
    description: "Extend your Right index finger to project a glowing tracking laser. Hover over any planet for 0.8 seconds to engage locks and fly directly to it.",
    illustration: (color: string) => <HandPointing color={color} />,
    color: "#00ffff",
    accentText: "SELECT celestial body"
  },
  {
    title: "SCALE COSMOS",
    subtitle: "TWO HANDS ZOOM 👐",
    description: "Pinch (🤏) with your right hand, or raise both hands and move them apart to scale the entire Solar System up. Move them closer to scale it down.",
    illustration: (color: string) => <BothHandsSpread color={color} />,
    color: "#36d9ff",
    accentText: "3D MULTI-TOUCH SCALE"
  }
]

const STORY_DURATION = 6000 // 6 seconds per story

interface StoryDemoProps {
  isOpen: boolean
  onClose: () => void
}

export function StoryDemo({ isOpen, onClose }: StoryDemoProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [progress, setProgress] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const progressIntervalRef = useRef<number | null>(null)
  const lastTimeRef = useRef<number>(0)

  const currentSlide = STORY_SLIDES[currentSlideIndex]

  const handleNext = useCallback(() => {
    setProgress(0)
    setCurrentSlideIndex((prev) => {
      if (prev === STORY_SLIDES.length - 1) {
        onClose() // Close story at the end
        return 0
      }
      return prev + 1
    })
  }, [onClose])

  const handlePrev = useCallback(() => {
    setProgress(0)
    setCurrentSlideIndex((prev) => {
      if (prev === 0) return 0
      return prev - 1
    })
  }, [])

  // Timing/progress loop
  useEffect(() => {
    if (!isOpen) return

    if (!isPlaying) {
      if (progressIntervalRef.current) {
        cancelAnimationFrame(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
      return
    }

    lastTimeRef.current = performance.now()

    const updateProgress = (timestamp: number) => {
      const delta = timestamp - lastTimeRef.current
      lastTimeRef.current = timestamp

      setProgress((prev) => {
        const nextProgress = prev + (delta / STORY_DURATION) * 100
        if (nextProgress >= 100) {
          handleNext()
          return 0
        }
        return nextProgress
      })

      progressIntervalRef.current = requestAnimationFrame(updateProgress)
    }

    progressIntervalRef.current = requestAnimationFrame(updateProgress)

    return () => {
      if (progressIntervalRef.current) {
        cancelAnimationFrame(progressIntervalRef.current)
      }
    }
  }, [isOpen, isPlaying, handleNext])

  // Handle pointer down (pause story) and release (resume)
  const handlePointerDown = () => {
    setIsPlaying(false)
  }

  const handlePointerUp = () => {
    setIsPlaying(true)
  }

  // Key navigation
  useEffect(() => {
    if (!isOpen) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext()
      if (e.key === 'ArrowLeft') handlePrev()
      if (e.key === 'Escape') onClose()
      if (e.key === ' ') setIsPlaying((p) => !p)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, handleNext, handlePrev, onClose])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-space-black/90 backdrop-blur-md">
        {/* Background Click to Close */}
        <div className="absolute inset-0" onClick={onClose} />

        {/* Story Player Container */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative w-[360px] h-[640px] max-w-full max-h-screen rounded-[32px] overflow-hidden glass-bright flex flex-col justify-between p-6 shadow-[0_0_50px_rgba(0,0,0,0.8),0_0_30px_rgba(0,245,255,0.15)] select-none border border-cyan-400/35"
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Top bars: Progress indicators */}
          <div className="absolute top-4 left-6 right-6 flex gap-1.5 z-50">
            {STORY_SLIDES.map((_, index) => (
              <div
                key={index}
                className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden"
              >
                <div
                  className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-75 ease-linear"
                  style={{
                    width:
                      index < currentSlideIndex
                        ? '100%'
                        : index === currentSlideIndex
                        ? `${progress}%`
                        : '0%',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Header Info */}
          <div className="flex items-center justify-between w-full mt-4 z-50">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full border border-cyan-400/40 p-0.5 flex items-center justify-center bg-cyan-950/40">
                <Instagram size={14} className="text-cyan-400 animate-pulse" />
              </div>
              <div>
                <div className="text-[11px] font-bold font-mono tracking-wider text-white flex items-center gap-1.5 leading-none">
                  UNIVERSE_X
                  {currentSlide.accentText && (
                    <span className="text-[7px] bg-cyan-400/20 text-cyan-400 px-1.5 py-0.5 rounded-full uppercase border border-cyan-400/30">
                      {currentSlide.accentText}
                    </span>
                  )}
                </div>
                <div className="text-[8px] text-gray-500 font-mono mt-0.5 uppercase tracking-widest">
                  Sponsored Tutorial
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setIsPlaying(!isPlaying)
                }}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                {isPlaying ? <Pause size={12} /> : <Play size={12} />}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onClose()
                }}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          </div>

          {/* Left/Right click triggers for navigating stories */}
          <div className="absolute inset-0 flex" style={{ zIndex: 10 }}>
            <div
              className="w-[30%] h-full cursor-w-resize"
              onClick={(e) => {
                e.stopPropagation()
                handlePrev()
              }}
            />
            <div className="w-[40%] h-full" />
            <div
              className="w-[30%] h-full cursor-e-resize"
              onClick={(e) => {
                e.stopPropagation()
                handleNext()
              }}
            />
          </div>

          {/* Story Visual Area */}
          <div className="flex-1 flex flex-col items-center justify-center z-20 px-4 mt-6">
            <motion.div
              key={currentSlideIndex}
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.4 }}
              className="w-full flex flex-col items-center justify-center text-center gap-8"
            >
              {/* Core Visual Illustration */}
              <div className="h-44 flex items-center justify-center">
                {currentSlide.illustration(currentSlide.color)}
              </div>

              {/* Title & Subtitle */}
              <div className="space-y-2 mt-4">
                <span
                  className="text-[9px] font-mono tracking-[0.3em] font-bold block uppercase"
                  style={{ color: currentSlide.color }}
                >
                  {currentSlide.subtitle}
                </span>
                <h2
                  className="text-2xl font-bold font-mono tracking-widest text-white uppercase text-shadow-glow"
                  style={{
                    textShadow: `0 0 12px ${currentSlide.color}55`,
                  }}
                >
                  {currentSlide.title}
                </h2>
              </div>

              {/* Details Paragraph */}
              <p className="text-[12px] text-gray-400 leading-relaxed font-mono font-light px-2 mt-2">
                {currentSlide.description}
              </p>
            </motion.div>
          </div>

          {/* Footer Interactive Actions */}
          <div className="w-full mt-4 flex flex-col gap-2 z-50">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onClose()
              }}
              className="w-full py-3 rounded-2xl font-mono text-[11px] font-bold tracking-[0.2em] transition-all duration-300 uppercase shadow-[0_0_15px_rgba(0,245,255,0.1)] border border-cyan-400/40 text-cyan-400 hover:text-white bg-cyan-950/20 hover:bg-cyan-900/30"
            >
              Skip Tutorial
            </button>
            <div className="flex justify-between items-center px-2 text-[8px] text-gray-600 font-mono tracking-widest uppercase">
              <span>← Click Left to Back</span>
              <span>Click Right to Next →</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
