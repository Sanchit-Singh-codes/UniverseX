export type GestureType = 'none' | 'open_palm' | 'closed_palm' | 'point'

export interface HandLandmark {
  x: number
  y: number
  z: number
}

export interface HandData {
  landmarks: HandLandmark[]
  handedness: 'Left' | 'Right'
  score: number
  gesture: GestureType
}

export interface GestureState {
  gesture: GestureType
  leftGesture: GestureType
  rightGesture: GestureType
  hands: HandData[]
  rightIndex: { x: number; y: number } | null
  palmCenter: { x: number; y: number } | null
  pinchPoint: { x: number; y: number } | null
  pinchDistance: number
  handRotation: number
  isTracking: boolean
  trackingQuality: number
}

export type CameraStatus = 'idle' | 'requesting' | 'live' | 'denied' | 'unavailable'
export type ModelStatus = 'loading' | 'ready' | 'error'

export interface PlanetData {
  id: string
  name: string
  radius: number
  orbitRadius: number
  orbitSpeed: number
  rotationSpeed: number
  color: string
  emissive?: string
  roughness?: number
  metalness?: number
  hasRings?: boolean
  hasMoon?: boolean
  atmosphereColor?: string
  description?: string
  distanceFromSun?: string
  dayLength?: string
  yearLength?: string
  diameter?: string
  gravity?: string
  orbitalPeriod?: string
  moonCount?: string
  fact?: string
}

export interface SolarSystemState {
  isSpawned: boolean
  isSpawning: boolean
  scale: number
  rotation: number
  selectedPlanet: string | null
  hoveredPlanet: string | null
  grabbedPlanet: string | null
  planetOffset: { x: number; y: number; z: number } | null
}

export interface AppState {
  gesture: GestureState
  solarSystem: SolarSystemState
  fps: number
  isFullscreen: boolean
}
