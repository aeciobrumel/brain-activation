import { useCallback, useEffect, useRef, useState } from 'react'

interface UsePromptCountdownOptions {
  durationMs: number
  onExpire: () => void
}

export function usePromptCountdown({
  durationMs,
  onExpire,
}: UsePromptCountdownOptions) {
  const [timeLeftMs, setTimeLeftMs] = useState(durationMs)
  const activeDurationRef = useRef(durationMs)
  const deadlineRef = useRef<number | null>(null)
  const remainingRef = useRef(durationMs)
  const frameRef = useRef<number | null>(null)
  const expireRef = useRef(onExpire)

  useEffect(() => {
    expireRef.current = onExpire
  }, [onExpire])

  const clearFrame = useCallback(() => {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }
  }, [])

  const tick = useCallback(
    function tick(now: number) {
      if (deadlineRef.current === null) {
        return
      }

      const nextTimeLeft = Math.max(deadlineRef.current - now, 0)
      remainingRef.current = nextTimeLeft
      setTimeLeftMs(nextTimeLeft)

      if (nextTimeLeft <= 0) {
        clearFrame()
        deadlineRef.current = null
        expireRef.current()
        return
      }

      frameRef.current = window.requestAnimationFrame(tick)
    },
    [clearFrame],
  )

  const start = useCallback(
    (nextDurationMs = durationMs) => {
      clearFrame()
      activeDurationRef.current = nextDurationMs
      remainingRef.current = nextDurationMs
      setTimeLeftMs(nextDurationMs)
      deadlineRef.current = performance.now() + nextDurationMs
      frameRef.current = window.requestAnimationFrame(tick)
    },
    [clearFrame, durationMs, tick],
  )

  const pause = useCallback(() => {
    if (deadlineRef.current === null) {
      return
    }

    remainingRef.current = Math.max(deadlineRef.current - performance.now(), 0)
    setTimeLeftMs(remainingRef.current)
    deadlineRef.current = null
    clearFrame()
  }, [clearFrame])

  const resume = useCallback(() => {
    if (deadlineRef.current !== null || remainingRef.current <= 0) {
      return
    }

    deadlineRef.current = performance.now() + remainingRef.current
    frameRef.current = window.requestAnimationFrame(tick)
  }, [tick])

  const reset = useCallback(
    (nextDurationMs = durationMs) => {
      clearFrame()
      deadlineRef.current = null
      activeDurationRef.current = nextDurationMs
      remainingRef.current = nextDurationMs
      setTimeLeftMs(nextDurationMs)
    },
    [clearFrame, durationMs],
  )

  useEffect(() => () => clearFrame(), [clearFrame])

  return {
    timeLeftMs,
    progress:
      activeDurationRef.current === 0 ? 0 : (timeLeftMs / activeDurationRef.current) * 100,
    start,
    pause,
    resume,
    reset,
  }
}
