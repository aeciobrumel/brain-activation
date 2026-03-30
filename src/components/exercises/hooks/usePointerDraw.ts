import { useCallback, useRef, useState } from 'react'

export interface DrawPoint {
  x: number
  y: number
  t: number
}

interface UsePointerDrawOptions {
  mapPoint?: (point: DrawPoint, event: React.PointerEvent<HTMLElement>) => DrawPoint
  stabilization?: number
  getStabilization?: (event: React.PointerEvent<HTMLElement>) => number
  minDistance?: number
}

function getRelativePoint(event: React.PointerEvent<HTMLElement>): DrawPoint {
  const rect = event.currentTarget.getBoundingClientRect()
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
    t: performance.now(),
  }
}

export function usePointerDraw({
  mapPoint,
  stabilization = 0,
  getStabilization,
  minDistance = 0,
}: UsePointerDrawOptions = {}) {
  const [points, setPoints] = useState<DrawPoint[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const isDrawingRef = useRef(false)
  const latestPointRef = useRef<DrawPoint | null>(null)
  const totalDistanceRef = useRef(0)
  const totalActiveMsRef = useRef(0)
  const drawStartedAtRef = useRef<number | null>(null)

  const resolvePoint = useCallback(
    (event: React.PointerEvent<HTMLElement>) => {
      const point = getRelativePoint(event)
      return mapPoint ? mapPoint(point, event) : point
    },
    [mapPoint],
  )

  const clear = useCallback(() => {
    setPoints([])
    setIsDrawing(false)
    isDrawingRef.current = false
    latestPointRef.current = null
    totalDistanceRef.current = 0
    totalActiveMsRef.current = 0
    drawStartedAtRef.current = null
  }, [])

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLElement>) => {
    const point = resolvePoint(event)
    setIsDrawing(true)
    isDrawingRef.current = true
    setPoints((current) => [...current, point])
    latestPointRef.current = point
    drawStartedAtRef.current = point.t
    event.currentTarget.setPointerCapture(event.pointerId)
  }, [resolvePoint])

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (!isDrawingRef.current) {
      return
    }

    const rawPoint = resolvePoint(event)
    const previousPoint = latestPointRef.current
    const currentStabilization = getStabilization?.(event) ?? stabilization
    const point =
      previousPoint && currentStabilization > 0
        ? {
            x: previousPoint.x * currentStabilization + rawPoint.x * (1 - currentStabilization),
            y: previousPoint.y * currentStabilization + rawPoint.y * (1 - currentStabilization),
            t: rawPoint.t,
          }
        : rawPoint

    if (previousPoint) {
      const delta = Math.hypot(point.x - previousPoint.x, point.y - previousPoint.y)
      if (delta < minDistance) {
        return
      }

      totalDistanceRef.current += delta
    }

    latestPointRef.current = point
    setPoints((current) => [...current, point])
  }, [getStabilization, minDistance, resolvePoint, stabilization])

  const finishDrawing = useCallback((timeStamp?: number) => {
    if (drawStartedAtRef.current !== null) {
      totalActiveMsRef.current += (timeStamp ?? performance.now()) - drawStartedAtRef.current
    }
    drawStartedAtRef.current = null
    setIsDrawing(false)
    isDrawingRef.current = false
  }, [])

  const handlePointerUp = useCallback((event: React.PointerEvent<HTMLElement>) => {
    finishDrawing(event.timeStamp)
    event.currentTarget.releasePointerCapture(event.pointerId)
  }, [finishDrawing])

  const getLatestPoint = useCallback(() => latestPointRef.current, [])
  const getTotalDistance = useCallback(() => totalDistanceRef.current, [])
  const getTotalActiveMs = useCallback(() => totalActiveMsRef.current, [])

  return {
    points,
    isDrawing,
    getLatestPoint,
    getTotalDistance,
    getTotalActiveMs,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    clear,
  }
}
