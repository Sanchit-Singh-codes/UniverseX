import type { GestureType, GestureState, HandData, HandLandmark } from './types'
import {
  dist3d,
  isFingerExtended,
  getPalmCenter,
  LANDMARK_INDICES,
} from './hand-tracker'

const { THUMB_TIP, INDEX_TIP, WRIST } = LANDMARK_INDICES

// ─── Per-hand gesture helpers ─────────────────────────────────────────────────

export function isOpenPalm(lm: HandLandmark[]): boolean {
  // Require index + middle + ring extended. Pinky often semi-curls in natural hand.
  return (
    isFingerExtended(lm, 'index') &&
    isFingerExtended(lm, 'middle') &&
    isFingerExtended(lm, 'ring')
  )
}

export function isClosedPalm(lm: HandLandmark[]): boolean {
  return (
    !isFingerExtended(lm, 'index') &&
    !isFingerExtended(lm, 'middle') &&
    !isFingerExtended(lm, 'ring') &&
    !isFingerExtended(lm, 'pinky')
  )
}

export function isPointing(lm: HandLandmark[]): boolean {
  // Index extended; middle + ring + pinky all curled.
  return (
    isFingerExtended(lm, 'index') &&
    !isFingerExtended(lm, 'middle') &&
    !isFingerExtended(lm, 'ring') &&
    !isFingerExtended(lm, 'pinky')
  )
}

// Both palms open AND spread apart — explicit two-hand scale gesture
export function isTwoHandScale(left: HandLandmark[], right: HandLandmark[]): boolean {
  return isOpenPalm(left) && isOpenPalm(right)
}

// ─── Main detector ────────────────────────────────────────────────────────────

export function detectGestures(hands: HandData[]): Pick<GestureState, 'gesture' | 'leftGesture' | 'rightGesture' | 'twoHandScale'> {
  let leftGesture: GestureState['leftGesture'] = 'none'
  let rightGesture: GestureState['rightGesture'] = 'none'
  let twoHandScale = false

  const leftHand = hands.find((h) => h.handedness === 'Left')
  const rightHand = hands.find((h) => h.handedness === 'Right')

  // Left hand gestures
  if (leftHand) {
    const lm = leftHand.landmarks
    if (isOpenPalm(lm)) leftGesture = 'open_palm'
    else if (isClosedPalm(lm)) leftGesture = 'closed_palm'
  }

  // Right hand gestures
  if (rightHand) {
    const lm = rightHand.landmarks
    if (isPointing(lm)) rightGesture = 'point'
    else if (isOpenPalm(lm)) rightGesture = 'open_palm'
  }

  // Two-hand scale: ONLY when both hands are open palms simultaneously
  if (leftHand && rightHand && isTwoHandScale(leftHand.landmarks, rightHand.landmarks)) {
    twoHandScale = true
  }

  // Legacy composite gesture for HUD/toast
  let gesture: GestureType = 'none'
  if (twoHandScale) gesture = 'two_hand_scale'
  else if (rightGesture === 'point') gesture = 'point'
  else if (leftGesture === 'closed_palm') gesture = 'closed_palm'
  else if (leftGesture === 'open_palm') gesture = 'open_palm'

  return { gesture, leftGesture, rightGesture, twoHandScale }
}

// Legacy single-hand gesture for backward compat (used by getStableGesture in hook)
export function detectGesture(hands: HandData[]): GestureType {
  return detectGestures(hands).gesture
}

export function getPinchPoint(lm: HandLandmark[]): { x: number; y: number } {
  return {
    x: (lm[THUMB_TIP].x + lm[INDEX_TIP].x) / 2,
    y: (lm[THUMB_TIP].y + lm[INDEX_TIP].y) / 2,
  }
}

export function getPalmDistance(hands: HandData[]): number {
  if (hands.length < 2) return 0
  const palm1 = getPalmCenter(hands[0].landmarks)
  const palm2 = getPalmCenter(hands[1].landmarks)
  return dist3d(palm1, palm2)
}

// Keep old export name for hook compatibility
export const getPinchDistance = getPalmDistance

export function getHandRotation(lm: HandLandmark[]): number {
  const wrist = lm[WRIST]
  const middle = lm[LANDMARK_INDICES.MIDDLE_MCP]
  return Math.atan2(middle.y - wrist.y, middle.x - wrist.x)
}

export function getTrackingQuality(hands: HandData[]): number {
  if (hands.length === 0) return 0
  return hands[0].score
}
