import type { HandData, HandLandmark } from './types'

// MediaPipe Hand Landmark indices
export const LANDMARK_INDICES = {
  WRIST: 0,
  THUMB_CMC: 1,
  THUMB_MCP: 2,
  THUMB_IP: 3,
  THUMB_TIP: 4,
  INDEX_MCP: 5,
  INDEX_PIP: 6,
  INDEX_DIP: 7,
  INDEX_TIP: 8,
  MIDDLE_MCP: 9,
  MIDDLE_PIP: 10,
  MIDDLE_DIP: 11,
  MIDDLE_TIP: 12,
  RING_MCP: 13,
  RING_PIP: 14,
  RING_DIP: 15,
  RING_TIP: 16,
  PINKY_MCP: 17,
  PINKY_PIP: 18,
  PINKY_DIP: 19,
  PINKY_TIP: 20,
}

export const FINGERTIP_INDICES = [4, 8, 12, 16, 20]

export const HAND_CONNECTIONS: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4],      // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],      // Index
  [5, 9], [9, 10], [10, 11], [11, 12], // Middle
  [9, 13], [13, 14], [14, 15], [15, 16],// Ring
  [13, 17], [17, 18], [18, 19], [19, 20],// Pinky
  [0, 17], [5, 9],                      // Palm
]

export function dist3d(a: HandLandmark, b: HandLandmark): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const dz = a.z - b.z
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

export function getPalmCenter(lm: HandLandmark[]): HandLandmark {
  const indices = [0, 5, 9, 13, 17]
  const sum = indices.reduce(
    (acc, i) => ({ x: acc.x + lm[i].x, y: acc.y + lm[i].y, z: acc.z + lm[i].z }),
    { x: 0, y: 0, z: 0 }
  )
  return { x: sum.x / indices.length, y: sum.y / indices.length, z: sum.z / indices.length }
}

export function isFingerExtended(lm: HandLandmark[], finger: 'index' | 'middle' | 'ring' | 'pinky' | 'thumb'): boolean {
  const fingers = {
    thumb: { tip: 4, pip: 2, mcp: 1 },
    index: { tip: 8, pip: 6, mcp: 5 },
    middle: { tip: 12, pip: 10, mcp: 9 },
    ring: { tip: 16, pip: 14, mcp: 13 },
    pinky: { tip: 20, pip: 18, mcp: 17 },
  }
  const f = fingers[finger]
  if (finger === 'thumb') {
    return Math.abs(lm[f.tip].x - lm[f.mcp].x) > 0.06
  }
  return lm[f.tip].y < lm[f.pip].y
}

export function smoothLandmarks(
  prev: HandLandmark[] | null,
  next: HandLandmark[],
  alpha = 0.35
): HandLandmark[] {
  if (!prev || prev.length !== next.length) return next
  return next.map((pt, i) => ({
    x: prev[i].x + (pt.x - prev[i].x) * alpha,
    y: prev[i].y + (pt.y - prev[i].y) * alpha,
    z: prev[i].z + (pt.z - prev[i].z) * alpha,
  }))
}

export function getLandmarkVelocity(
  prev: HandLandmark[] | null,
  curr: HandLandmark[]
): number {
  if (!prev) return 0
  let total = 0
  for (let i = 0; i < Math.min(prev.length, curr.length); i++) {
    total += dist3d(prev[i], curr[i])
  }
  return total / curr.length
}
