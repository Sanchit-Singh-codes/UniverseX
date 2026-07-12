import type { GestureType, HandData, HandLandmark } from './types'
import { isFingerExtended, LANDMARK_INDICES } from './hand-tracker'

const { INDEX_TIP, INDEX_PIP, MIDDLE_TIP, RING_TIP, PINKY_TIP, WRIST } = LANDMARK_INDICES

function distance(a: HandLandmark, b: HandLandmark) {
  return Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)
}

/**
 * Classify a single hand's gesture
 * Returns: 'point' | 'open_palm' | 'closed_palm' | 'none'
 */
export function classifyHand(hand: Pick<HandData, 'landmarks'>): GestureType {
  const lm = hand.landmarks
  if (lm.length < 21) return 'none'

  const index = isFingerExtended(lm, 'index')
  const middle = isFingerExtended(lm, 'middle')
  const ring = isFingerExtended(lm, 'ring')
  const pinky = isFingerExtended(lm, 'pinky')
  const thumb = isFingerExtended(lm, 'thumb')

  // Point: only index extended, pointing up
  if (index && !middle && !ring && !pinky && lm[INDEX_TIP].y < lm[INDEX_PIP].y) {
    return 'point'
  }

  // Open palm: 4+ fingers extended
  const extendedCount = [index, middle, ring, pinky, thumb].filter(Boolean).length
  if (extendedCount >= 4) {
    return 'open_palm'
  }

  // Closed palm: fist with curled fingers
  const palmSpan = Math.max(distance(lm[WRIST], lm[9]), 0.04)
  const curled = [INDEX_TIP, MIDDLE_TIP, RING_TIP, PINKY_TIP]
    .filter((tip) => distance(lm[tip], lm[WRIST]) < palmSpan * 1.55).length
  if (curled >= 3 || extendedCount <= 1) {
    return 'closed_palm'
  }

  return 'none'
}

/**
 * Get index finger tip position (mirrored for screen coords)
 */
export function getIndexPoint(lm: HandLandmark[]) {
  return { x: 1 - lm[INDEX_TIP].x, y: lm[INDEX_TIP].y }
}

/**
 * Calculate hand spread distance (distance between index and pinky)
 */
export function getHandSpread(lm: HandLandmark[]): number {
  return distance(lm[INDEX_TIP], lm[PINKY_TIP])
}
