import { useCallback, useEffect, useRef, useState } from 'react'

interface UseTimerOptions {
  duration: number
  autoStart?: boolean
  onComplete?: () => void
}

export function useTimer({
  duration,
  autoStart = false,
  onComplete,
}: UseTimerOptions) {
  const durationMs = duration * 1000
  const [elapsedMs, setElapsedMs] = useState(0)
  const [isRunning, setIsRunning] = useState(autoStart)
  const completedRef = useRef(false)
  const elapsedMsRef = useRef(0)
  const onCompleteRef = useRef(onComplete)

  useEffect(() => {
    onCompleteRef.current = onComplete
  }, [onComplete])

  useEffect(() => {
    if (!isRunning) {
      return
    }

    const startedAt = performance.now() - elapsedMsRef.current
    let frameId = 0

    const loop = (now: number) => {
      const nextElapsed = Math.min(now - startedAt, durationMs)
      elapsedMsRef.current = nextElapsed
      setElapsedMs(nextElapsed)

      if (nextElapsed >= durationMs) {
        if (!completedRef.current) {
          completedRef.current = true
          setIsRunning(false)
          onCompleteRef.current?.()
        }

        return
      }

      frameId = window.requestAnimationFrame(loop)
    }

    frameId = window.requestAnimationFrame(loop)
    return () => window.cancelAnimationFrame(frameId)
  }, [durationMs, isRunning])

  // `start` resumes from the current elapsed time; use `restart` to begin from zero.
  const start = useCallback(() => {
    if (elapsedMsRef.current >= durationMs) {
      return
    }

    completedRef.current = false
    setIsRunning(true)
  }, [durationMs])

  const pause = useCallback(() => {
    setIsRunning(false)
  }, [])

  const reset = useCallback(() => {
    completedRef.current = false
    elapsedMsRef.current = 0
    setElapsedMs(0)
    setIsRunning(false)
  }, [])

  const restart = useCallback(() => {
    completedRef.current = false
    elapsedMsRef.current = 0
    setElapsedMs(0)
    setIsRunning(true)
  }, [])

  return {
    elapsedMs,
    timeLeftMs: Math.max(durationMs - elapsedMs, 0),
    timeLeftSeconds: Math.ceil(Math.max(durationMs - elapsedMs, 0) / 1000),
    progress: durationMs === 0 ? 0 : (elapsedMs / durationMs) * 100,
    isRunning,
    isFinished: elapsedMs >= durationMs,
    start,
    pause,
    restart,
    reset,
  }
}
