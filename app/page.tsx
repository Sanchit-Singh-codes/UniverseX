'use client'

import dynamic from 'next/dynamic'

// Load UniverseX client-only (Three.js and MediaPipe are not SSR-compatible)
const UniverseX = dynamic(() => import('@/components/universe-x'), {
  ssr: false,
  loading: () => (
    <div className="w-screen h-screen flex items-center justify-center bg-[#000008]">
      <div className="text-center">
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 rounded-full border border-cyan-400/30 animate-ping" />
          <div className="absolute inset-3 rounded-full border border-cyan-400/50" />
          <div className="absolute inset-5 rounded-full bg-cyan-400/80" />
        </div>
        <p className="text-[10px] font-mono tracking-[0.4em] text-cyan-400/50 uppercase">
          Initializing UniverseX
        </p>
      </div>
    </div>
  ),
})

export default function Home() {
  return <UniverseX />
}
