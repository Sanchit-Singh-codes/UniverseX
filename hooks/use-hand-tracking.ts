'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import type { GestureState, HandData, HandLandmark } from '@/lib/types'
import { smoothLandmarks } from '@/lib/hand-tracker'
import {
  detectGesture,
  getPinchPoint,
  getPinchDistance,
  getHandRotation,
  getTrackingQuality,
} from '@/lib/gesture-detector'
import { getPalmCenter } from '@/lib/hand-tracker'

const WASM_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm'
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'

const DEFAULT_GESTURE_STATE: GestureState = {
  gesture: 'none',
  hands: [],
  palmCenter: null,
  pinchPoint: null,
  pinchDistance: 0,
  handRotation: 0,
  isTracking: false,
  trackingQuality: 0,
}

export function useHandTracking(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [gestureState, setGestureState] = useState<GestureState>(DEFAULT_GESTURE_STATE)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const landmarkerRef = useRef<unknown>(null)
  const prevLandmarksRef = useRef<HandLandmark[][] | null[]>([null, null])
  const animFrameRef = useRef<number>(0)
  const lastVideoTimeRef = useRef(-1)
  const gestureHistoryRef = useRef<string[]>([])
  const HISTORY_SIZE = 5

  const getStableGesture = useCallback((newGesture: string): string => {
    gestureHistoryRef.current.push(newGesture)
    if (gestureHistoryRef.current.length > HISTORY_SIZE) {
      gestureHistoryRef.current.shift()
    }
    const counts: Record<string, number> = {}
    for (const g of gestureHistoryRef.current) {
      counts[g] = (counts[g] ?? 0) + 1
    }
    let maxCount = 0
    let stableGesture = newGesture
    for (const [g, count] of Object.entries(counts)) {
      if (count > maxCount) {
        maxCount = count
        stableGesture = g
      }
    }
    return stableGesture
  }, [])

  useEffect(() => {
    let cancelled = false

    async function init() {
      try {
        const { HandLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision')
        const vision = await FilesetResolver.forVisionTasks(WASM_CDN)
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_URL,
            delegate: 'GPU',
          },
          numHands: 2,
          runningMode: 'VIDEO',
          minHandDetectionConfidence: 0.5,
          minHandPresenceConfidence: 0.5,
          minTrackingConfidence: 0.5,
        })

        if (!cancelled) {
          landmarkerRef.current = landmarker
          setIsReady(true)
        }
      } catch (err) {
        console.error('[v0] HandLandmarker init error:', err)
        if (!cancelled) setError('Hand tracking unavailable')
      }
    }

    init()
    return () => { cancelled = true }
  }, [])

  const startTracking = useCallback(async () => {
    const video = videoRef.current
    if (!video || !landmarkerRef.current) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      })
      video.srcObject = stream
      await video.play()
    } catch (err) {
      setError('Camera access denied')
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const landmarker = landmarkerRef.current as any

    const detect = () => {
      const video = videoRef.current
      if (!video || video.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(detect)
        return
      }

      if (video.currentTime === lastVideoTimeRef.current) {
        animFrameRef.current = requestAnimationFrame(detect)
        return
      }
      lastVideoTimeRef.current = video.currentTime

      try {
        const result = landmarker.detectForVideo(video, performance.now())
        const rawHands: HandData[] = []

        if (result.landmarks && result.landmarks.length > 0) {
          for (let i = 0; i < result.landmarks.length; i++) {
            const rawLm = result.landmarks[i] as HandLandmark[]
            const smoothed = smoothLandmarks(prevLandmarksRef.current[i] ?? null, rawLm, 0.4)
            prevLandmarksRef.current[i] = smoothed

            rawHands.push({
              landmarks: smoothed,
              handedness: result.handedness?.[i]?.[0]?.categoryName as 'Left' | 'Right' ?? 'Right',
              score: result.handedness?.[i]?.[0]?.score ?? 0.8,
            })
          }
        } else {
          prevLandmarksRef.current = [null, null]
        }

        const rawGesture = detectGesture(rawHands)
        const stableGesture = getStableGesture(rawGesture)

        const primaryHand = rawHands[0]
        const palmCenter = primaryHand
          ? (() => {
              const c = getPalmCenter(primaryHand.landmarks)
              return { x: c.x, y: c.y }
            })()
          : null

        const pinchPoint =
          primaryHand && (stableGesture === 'pinch' || stableGesture === 'two_hand_pinch')
            ? getPinchPoint(primaryHand.landmarks)
            : null

        const pinchDistance = getPinchDistance(rawHands)
        const handRotation = primaryHand ? getHandRotation(primaryHand.landmarks) : 0
        const trackingQuality = getTrackingQuality(rawHands)

        setGestureState({
          gesture: stableGesture as GestureState['gesture'],
          hands: rawHands,
          palmCenter,
          pinchPoint,
          pinchDistance,
          handRotation,
          isTracking: rawHands.length > 0,
          trackingQuality,
        })
      } catch {
        // ignore frame errors
      }

      animFrameRef.current = requestAnimationFrame(detect)
    }

    animFrameRef.current = requestAnimationFrame(detect)
  }, [videoRef, getStableGesture])

  const stopTracking = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current)
    const video = videoRef.current
    if (video?.srcObject) {
      const tracks = (video.srcObject as MediaStream).getTracks()
      tracks.forEach((t) => t.stop())
      video.srcObject = null
    }
    setGestureState(DEFAULT_GESTURE_STATE)
  }, [videoRef])

  return { gestureState, isReady, error, startTracking, stopTracking }
}
