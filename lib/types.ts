export type GestureType =
  | 'none'
  | 'open_palm'
  | 'point'
  | 'pinch'
  | 'fist'
  | 'two_hand_pinch'
  | 'rotate'

export interface HandLandmark {
  x: number
  y: number
  z: number
}

export interface HandData {
  landmarks: HandLandmark[]
  handedness: 'Left' | 'Right'
  score: number
}

export interface GestureState {
  gesture: GestureType
  hands: HandData[]
  palmCenter: { x: number; y: number } | null
  pinchPoint: { x: number; y: number } | null
  pinchDistance: number
  handRotation: number
  isTracking: boolean
  trackingQuality: number // 0-1
}

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
