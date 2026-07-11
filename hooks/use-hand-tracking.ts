'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import type { GestureState, HandData, HandLandmark } from '@/lib/types'
import { smoothLandmarks } from '@/lib/hand-tracker'
import {
  detectGestures,
  getPinchPoint,
  getPalmDistance,
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
  leftGesture: 'none',
  rightGesture: 'none',
  twoHandScale: false,
}

export function useHandTracking(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [gestureState, setGestureState] = useState<GestureState>(DEFAULT_GESTURE_STATE)
  const [isReady, setIsReady] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const landmarkerRef = useRef<unknown>(null)
  const prevLandmarksRef = useRef<(HandLandmark[] | null)[]>([null, null])
  const animFrameRef = useRef<number>(0)
  const lastVideoTimeRef = useRef(-1)

  useEffect(() => {
    let cancelled = false
    async function init() {
      try {
        const { HandLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision')
        const vision = await FilesetResolver.forVisionTasks(WASM_CDN)
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
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
        if (!cancelled) setError('Hand tracking unavailable')
      }
    }
    init()
    return () => { cancelled = true }
  }, [])

  const startTracking = useCallback(async () => {
    const video = videoRef.current
    if (!video || !landmarkerRef.current) return

    if (video.srcObject) {
      const tracks = (video.srcObject as MediaStream).getTracks()
      tracks.forEach((t) => t.stop())
      video.srcObject = null
    }

    let stream: MediaStream
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480, facingMode: 'user' },
      })
    } catch {
      setError('Camera access denied — check browser permissions')
      return
    }

    video.srcObject = stream
    video.muted = true
    video.playsInline = true

    await new Promise<void>((resolve) => {
      if (video.readyState >= 1) return resolve()
      video.addEventListener('loadedmetadata', () => resolve(), { once: true })
    })

    try {
      await video.play()
    } catch {
      setError('Could not start video playback')
      return
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const landmarker = landmarkerRef.current as any

    const detect = () => {
      const v = videoRef.current
      if (!v || v.readyState < 2 || v.videoWidth === 0) {
        animFrameRef.current = requestAnimationFrame(detect)
        return
      }
      if (v.currentTime === lastVideoTimeRef.current) {
        animFrameRef.current = requestAnimationFrame(detect)
        return
      }
      lastVideoTimeRef.current = v.currentTime

      try {
        const result = landmarker.detectForVideo(v, performance.now())
        const rawHands: HandData[] = []

        if (result.landmarks?.length > 0) {
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

        const detected = detectGestures(rawHands)
        const primaryHand = rawHands[0]

        const palmCenter = primaryHand
          ? (() => { const c = getPalmCenter(primaryHand.landmarks); return { x: c.x, y: c.y } })()
          : null

        const rightHand = rawHands.find((h) => h.handedness === 'Right')
        const pinchPoint = rightHand ? getPinchPoint(rightHand.landmarks) : null
        const pinchDistance = getPalmDistance(rawHands)
        const handRotation = primaryHand ? getHandRotation(primaryHand.landmarks) : 0
        const trackingQuality = getTrackingQuality(rawHands)

        setGestureState({
          ...detected,
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
  }, [videoRef])

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
