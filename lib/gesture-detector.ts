import type { GestureType, HandData, HandLandmark } from './types'
import {
  dist3d,
  isFingerExtended,
  getPalmCenter,
  LANDMARK_INDICES,
  FINGERTIP_INDICES,
} from './hand-tracker'

const { THUMB_TIP, INDEX_TIP, MIDDLE_TIP, RING_TIP, PINKY_TIP, WRIST } = LANDMARK_INDICES

export function detectGesture(hands: HandData[]): GestureType {
  if (hands.length === 0) return 'none'

  if (hands.length >= 2) {
    // Two-hand pinch: both hands pinching
    const h1 = hands[0].landmarks
    const h2 = hands[1].landmarks
    const pinch1 = dist3d(h1[THUMB_TIP], h1[INDEX_TIP]) < 0.05
    const pinch2 = dist3d(h2[THUMB_TIP], h2[INDEX_TIP]) < 0.05
    if (pinch1 && pinch2) return 'two_hand_pinch'
  }

  const lm = hands[0].landmarks

  // Closed fist: all fingers curled
  const allCurled =
    !isFingerExtended(lm, 'index') &&
    !isFingerExtended(lm, 'middle') &&
    !isFingerExtended(lm, 'ring') &&
    !isFingerExtended(lm, 'pinky')

  if (allCurled) return 'fist'

  // Open palm: all fingers extended
  const allExtended =
    isFingerExtended(lm, 'index') &&
    isFingerExtended(lm, 'middle') &&
    isFingerExtended(lm, 'ring') &&
    isFingerExtended(lm, 'pinky')

  if (allExtended) return 'open_palm'

  // Pinch: thumb and index close together
  const pinchDist = dist3d(lm[THUMB_TIP], lm[INDEX_TIP])
  if (pinchDist < 0.045) return 'pinch'

  // Point: only index extended
  const indexOnly =
    isFingerExtended(lm, 'index') &&
    !isFingerExtended(lm, 'middle') &&
    !isFingerExtended(lm, 'ring') &&
    !isFingerExtended(lm, 'pinky')

  if (indexOnly) return 'point'

  return 'none'
}

export function getPinchPoint(lm: HandLandmark[]): { x: number; y: number } {
  return {
    x: (lm[THUMB_TIP].x + lm[INDEX_TIP].x) / 2,
    y: (lm[THUMB_TIP].y + lm[INDEX_TIP].y) / 2,
  }
}

export function getPinchDistance(hands: HandData[]): number {
  if (hands.length < 2) return 0
  const lm1 = hands[0].landmarks
  const lm2 = hands[1].landmarks
  const palm1 = getPalmCenter(lm1)
  const palm2 = getPalmCenter(lm2)
  return dist3d(palm1, palm2)
}

export function getHandRotation(lm: HandLandmark[]): number {
  const wrist = lm[WRIST]
  const middle = lm[LANDMARK_INDICES.MIDDLE_MCP]
  return Math.atan2(middle.y - wrist.y, middle.x - wrist.x)
}

export function getTrackingQuality(hands: HandData[]): number {
  if (hands.length === 0) return 0
  return hands[0].score
}
