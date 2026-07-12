'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import type { GestureState, HandData, HandLandmark, GestureType, CameraStatus, ModelStatus } from '@/lib/types'
import { smoothLandmarks } from '@/lib/hand-tracker'
import { classifyHand, getIndexPoint } from '@/lib/gesture-detector'

const WASM_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm'
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task'

const DEFAULT_GESTURE_STATE: GestureState = {
  gesture: 'none', leftGesture: 'none', rightGesture: 'none', hands: [], rightIndex: null,
  palmCenter: null, pinchPoint: null, pinchDistance: 0, handRotation: 0, isTracking: false, trackingQuality: 0,
}

export function useHandTracking(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [gestureState, setGestureState] = useState<GestureState>(DEFAULT_GESTURE_STATE)
  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle')
  const [modelStatus, setModelStatus] = useState<ModelStatus>('loading')
  const [error, setError] = useState<string | null>(null)
  const landmarkerRef = useRef<any>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const prevLandmarksRef = useRef<Record<string, HandLandmark[] | null>>({ Left: null, Right: null })
  const historiesRef = useRef<Record<string, GestureType[]>>({ Left: [], Right: [] })
  const animationRef = useRef(0)
  const lastVideoTimeRef = useRef(-1)
  const requestedRef = useRef(false)

  const stabilize = useCallback((side: 'Left' | 'Right', next: GestureType) => {
    const history = historiesRef.current[side]
    history.push(next)
    if (history.length > 5) history.shift()
    const counts = history.reduce<Record<string, number>>((acc, item) => ({ ...acc, [item]: (acc[item] ?? 0) + 1 }), {})
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] as GestureType ?? 'none'
  }, [])

  const runDetection = useCallback(() => {
    const video = videoRef.current
    const landmarker = landmarkerRef.current
    if (!video || !landmarker || !streamRef.current) return

    const frame = () => {
      if (!streamRef.current) return
      if (video.readyState >= 2 && video.currentTime !== lastVideoTimeRef.current) {
        lastVideoTimeRef.current = video.currentTime
        try {
          const result = landmarker.detectForVideo(video, performance.now())
          const hands: HandData[] = []
          for (let i = 0; i < Math.min(result.landmarks?.length ?? 0, 2); i++) {
            const category = result.handednesses?.[i]?.[0]
            // The preview is mirrored; MediaPipe's label still describes the physical hand.
            const handedness = (category?.categoryName === 'Left' ? 'Left' : 'Right') as 'Left' | 'Right'
            const smoothed = smoothLandmarks(prevLandmarksRef.current[handedness], result.landmarks[i], 0.5)
            prevLandmarksRef.current[handedness] = smoothed
            const gesture = stabilize(handedness, classifyHand({ landmarks: smoothed }))
            hands.push({ landmarks: smoothed, handedness, score: category?.score ?? 0, gesture })
          }
          const left = hands.find((hand) => hand.handedness === 'Left')
          const right = hands.find((hand) => hand.handedness === 'Right')
          const leftGesture = left?.gesture ?? 'none'
          const rightGesture = right?.gesture ?? 'none'
          setGestureState({
            ...DEFAULT_GESTURE_STATE,
            gesture: rightGesture !== 'none' ? rightGesture : leftGesture,
            leftGesture,
            rightGesture,
            hands,
            rightIndex: right?.gesture === 'point' ? getIndexPoint(right.landmarks) : null,
            isTracking: hands.length > 0,
            trackingQuality: hands.length ? hands.reduce((sum, hand) => sum + hand.score, 0) / hands.length : 0,
          })
        } catch {
          // A dropped inference frame is harmless; the next animation frame recovers.
        }
      }
      animationRef.current = requestAnimationFrame(frame)
    }
    cancelAnimationFrame(animationRef.current)
    animationRef.current = requestAnimationFrame(frame)
  }, [stabilize, videoRef])

  const startCamera = useCallback(async () => {
    const video = videoRef.current
    if (!video || streamRef.current) return
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraStatus('unavailable')
      setError('Camera access is not supported in this browser.')
      return
    }
    setCameraStatus('requesting')
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480, facingMode: 'user' }, audio: false })
      streamRef.current = stream
      video.srcObject = stream
      await video.play()
      setCameraStatus('live')
      if (landmarkerRef.current) runDetection()
    } catch (reason) {
      console.error('[v0] Camera permission error:', reason)
      setCameraStatus('denied')
      setError('Camera permission was blocked. Allow camera access in the browser, then try again.')
    }
  }, [runDetection, videoRef])

  useEffect(() => {
    let cancelled = false
    async function initializeModel() {
      try {
        const { HandLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision')
        const vision = await FilesetResolver.forVisionTasks(WASM_CDN)
        const landmarker = await HandLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' }, runningMode: 'VIDEO', numHands: 2,
          minHandDetectionConfidence: 0.5, minHandPresenceConfidence: 0.5, minTrackingConfidence: 0.5,
        })
        if (!cancelled) {
          landmarkerRef.current = landmarker
          setModelStatus('ready')
          if (streamRef.current) runDetection()
        }
      } catch (reason) {
        console.error('[v0] Hand model error:', reason)
        if (!cancelled) { setModelStatus('error'); setError('The hand-tracking model could not load.') }
      }
    }
    initializeModel()
    return () => { cancelled = true }
  }, [runDetection])

  const startTracking = useCallback(async () => {
    requestedRef.current = true
    await startCamera()
  }, [startCamera])

  const stopTracking = useCallback(() => {
    cancelAnimationFrame(animationRef.current)
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
    setCameraStatus('idle')
    setGestureState(DEFAULT_GESTURE_STATE)
  }, [videoRef])

  useEffect(() => () => {
    cancelAnimationFrame(animationRef.current)
    streamRef.current?.getTracks().forEach((track) => track.stop())
  }, [])

  return { gestureState, cameraStatus, modelStatus, error, startTracking, stopTracking }
}
