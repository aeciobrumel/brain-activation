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

  useEffect(() => {
    if (!isRunning) {
      return
    }

    const startedAt = performance.now() - elapsedMs
    let frameId = 0

    const loop = (now: number) => {
      const nextElapsed = Math.min(now - startedAt, durationMs)
      setElapsedMs(nextElapsed)

      if (nextElapsed >= durationMs) {
        if (!completedRef.current) {
          completedRef.current = true
          setIsRunning(false)
          onComplete?.()
        }

        return
      }

      frameId = window.requestAnimationFrame(loop)
    }

    frameId = window.requestAnimationFrame(loop)
    return () => window.cancelAnimationFrame(frameId)
  }, [durationMs, elapsedMs, isRunning, onComplete])

  const start = useCallback(() => {
    completedRef.current = false
    setIsRunning(true)
  }, [])

  const pause = useCallback(() => {
    setIsRunning(false)
  }, [])

  const reset = useCallback(() => {
    completedRef.current = false
    setElapsedMs(0)
    setIsRunning(false)
  }, [])

  const restart = useCallback(() => {
    completedRef.current = false
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
