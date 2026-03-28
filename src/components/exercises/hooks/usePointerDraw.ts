import { useCallback, useRef, useState } from 'react'

export interface DrawPoint {
  x: number
  y: number
  t: number
}

function getRelativePoint(event: React.PointerEvent<HTMLElement>): DrawPoint {
  const rect = event.currentTarget.getBoundingClientRect()
  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top,
    t: performance.now(),
  }
}

export function usePointerDraw() {
  const [points, setPoints] = useState<DrawPoint[]>([])
  const [isDrawing, setIsDrawing] = useState(false)
  const isDrawingRef = useRef(false)
  const latestPointRef = useRef<DrawPoint | null>(null)
  const totalDistanceRef = useRef(0)
  const totalActiveMsRef = useRef(0)
  const drawStartedAtRef = useRef<number | null>(null)

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
    const point = getRelativePoint(event)
    setIsDrawing(true)
    isDrawingRef.current = true
    setPoints((current) => [...current, point])
    latestPointRef.current = point
    drawStartedAtRef.current = point.t
    event.currentTarget.setPointerCapture(event.pointerId)
  }, [])

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLElement>) => {
    if (!isDrawingRef.current) {
      return
    }

    const point = getRelativePoint(event)
    const previousPoint = latestPointRef.current
    if (previousPoint) {
      totalDistanceRef.current += Math.hypot(point.x - previousPoint.x, point.y - previousPoint.y)
    }

    latestPointRef.current = point
    setPoints((current) => [...current, point])
  }, [])

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

  return {
    points,
    isDrawing,
    latestPointRef,
    totalDistanceRef,
    totalActiveMsRef,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    clear,
  }
}
