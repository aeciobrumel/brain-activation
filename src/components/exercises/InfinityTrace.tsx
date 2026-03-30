import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { TRACE_SHAPE_CATALOG } from '../../data/traceShapes'
import { scoreTrackingExercise } from '../../lib/scoring'
import { saveExerciseScore } from '../../lib/storage'
import { ExerciseFrame } from './ExerciseFrame'
import { ExerciseViewport } from './ExerciseViewport'
import { usePointerDraw } from './hooks/usePointerDraw'
import { useTimer } from './hooks/useTimer'

interface ExerciseModuleProps {
  duration: number
  title: string
  onComplete: () => void
  footerAction?: ReactNode
}

const GREEN_ZONE_DISTANCE = 24

function getRandomShapeIndex(excludeIndex?: number) {
  if (TRACE_SHAPE_CATALOG.length <= 1) {
    return 0
  }

  let nextIndex = Math.floor(Math.random() * TRACE_SHAPE_CATALOG.length)
  while (nextIndex === excludeIndex) {
    nextIndex = Math.floor(Math.random() * TRACE_SHAPE_CATALOG.length)
  }

  return nextIndex
}

export function InfinityTrace({ duration, onComplete, footerAction }: ExerciseModuleProps) {
  const [shapeIndex, setShapeIndex] = useState(() => getRandomShapeIndex())
  const shape = useMemo(() => TRACE_SHAPE_CATALOG[shapeIndex]!, [shapeIndex])
  const viewBoxWidth = shape.viewBox.w
  const viewBoxHeight = shape.viewBox.h
  const pathRef = useRef<SVGPathElement | null>(null)
  const svgRef = useRef<SVGSVGElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const [dotPosition, setDotPosition] = useState(() => ({ ...shape.startPoint }))
  const [averageDistance, setAverageDistance] = useState(0)
  const [greenRatio, setGreenRatio] = useState(0)
  const [pauseCount, setPauseCount] = useState(0)
  const [cycles, setCycles] = useState(0)
  const [liveDistance, setLiveDistance] = useState(0)

  const mapPointToViewbox = useCallback(
    (point: { x: number; y: number; t: number }, event: React.PointerEvent<HTMLElement>) => {
      const svg = svgRef.current
      const screenMatrix = svg?.getScreenCTM()
      if (!svg || !screenMatrix) {
        return point
      }

      const svgPoint = svg.createSVGPoint()
      svgPoint.x = event.clientX
      svgPoint.y = event.clientY
      const projectedPoint = svgPoint.matrixTransform(screenMatrix.inverse())

      return {
        x: Math.min(Math.max(projectedPoint.x, 0), viewBoxWidth),
        y: Math.min(Math.max(projectedPoint.y, 0), viewBoxHeight),
        t: point.t,
      }
    },
    [viewBoxHeight, viewBoxWidth],
  )

  const pointer = usePointerDraw({
    mapPoint: mapPointToViewbox,
    stabilization: 0.3,
    getStabilization: (event) => (event.pointerType === 'mouse' ? 0.08 : 0.3),
    minDistance: 0.6,
  })
  const getLatestPoint = pointer.getLatestPoint
  const distanceSamplesRef = useRef(0)
  const totalDistanceRef = useRef(0)
  const greenSamplesRef = useRef(0)
  const pauseCountRef = useRef(0)
  const activeStartRef = useRef<number | null>(null)
  const totalActiveMsRef = useRef(0)

  const timer = useTimer({
    duration,
    onComplete: () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }

      if (activeStartRef.current !== null) {
        totalActiveMsRef.current += performance.now() - activeStartRef.current
        activeStartRef.current = null
      }

      saveExerciseScore(
        scoreTrackingExercise({
          exerciseId: 'tracar-infinito',
          averageDistance: averageDistance || 100,
          targetDistance: 80,
          greenZoneRatio: greenRatio,
          coverageRatio: Math.min(cycles / 3, 1),
          pauseCount: pauseCountRef.current,
          durationMs: totalActiveMsRef.current,
          totalDurationMs: duration * 1000,
          raw: { cycles, shapeIndex },
        }),
      )

      onComplete()
    },
  })

  useEffect(() => {
    if (!timer.isRunning) {
      return
    }

    const path = pathRef.current
    if (!path) {
      return
    }

    const totalLength = path.getTotalLength()
    const startedAt = performance.now()

    const loop = (now: number) => {
      const elapsed = now - startedAt
      const progress = (elapsed * 0.09) % totalLength
      const point = path.getPointAtLength(progress)
      setDotPosition({ x: point.x, y: point.y })
      setCycles(Math.floor((elapsed * 0.09) / totalLength))

      const latestPoint = getLatestPoint()
      if (latestPoint) {
        const distance = Math.hypot(latestPoint.x - point.x, latestPoint.y - point.y)
        setLiveDistance(distance)
        distanceSamplesRef.current += 1
        totalDistanceRef.current += distance
        if (distance < GREEN_ZONE_DISTANCE) {
          greenSamplesRef.current += 1
        }
        setAverageDistance(totalDistanceRef.current / distanceSamplesRef.current)
        setGreenRatio(greenSamplesRef.current / distanceSamplesRef.current)
      }

      rafRef.current = window.requestAnimationFrame(loop)
    }

    rafRef.current = window.requestAnimationFrame(loop)

    return () => {
      if (rafRef.current !== null) {
        window.cancelAnimationFrame(rafRef.current)
      }
    }
  }, [getLatestPoint, timer.isRunning])

  const trailColor = useMemo(() => {
    if (averageDistance < GREEN_ZONE_DISTANCE) return '#4ade80'
    if (averageDistance < 42) return '#facc15'
    return '#f87171'
  }, [averageDistance])

  const precisionLabel = useMemo(() => {
    if (averageDistance === 0) return 'Aquecendo'
    if (averageDistance < GREEN_ZONE_DISTANCE) return 'Alta'
    if (averageDistance < 42) return 'Media'
    return 'Baixa'
  }, [averageDistance])

  const handleStartPause = () => {
    if (timer.isRunning) {
      pauseCountRef.current += 1
      setPauseCount(pauseCountRef.current)
      if (activeStartRef.current !== null) {
        totalActiveMsRef.current += performance.now() - activeStartRef.current
        activeStartRef.current = null
      }
      timer.pause()
      return
    }

    activeStartRef.current = performance.now()
    timer.start()
  }

  const handleRestart = () => {
    const nextShapeIndex = getRandomShapeIndex(shapeIndex)
    const nextShape = TRACE_SHAPE_CATALOG[nextShapeIndex]!

    setShapeIndex(nextShapeIndex)
    setDotPosition({ ...nextShape.startPoint })
    setAverageDistance(0)
    setGreenRatio(0)
    setPauseCount(0)
    setCycles(0)
    setLiveDistance(0)
    distanceSamplesRef.current = 0
    totalDistanceRef.current = 0
    greenSamplesRef.current = 0
    pauseCountRef.current = 0
    activeStartRef.current = null
    totalActiveMsRef.current = 0
    pointer.clear()
    timer.reset()
  }

  return (
    <ExerciseFrame
      accentColor="#f97316"
      timeLeftSeconds={timer.timeLeftSeconds}
      timerProgress={timer.progress}
      moduleProgress={Math.min(cycles / 3, 1) * 100}
      isRunning={timer.isRunning}
      onStartPause={handleStartPause}
      onRestart={handleRestart}
      footerAction={footerAction}
      metrics={
        <div className="grid gap-2 sm:grid-cols-6">
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Distância média: <span className="font-semibold text-slate-950">{Math.round(averageDistance)} px</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Zona verde: <span className="font-semibold text-slate-950">{Math.round(greenRatio * 100)}%</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Precisão: <span className="font-semibold text-slate-950">{precisionLabel}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Ciclos: <span className="font-semibold text-slate-950">{cycles}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Pausas: <span className="font-semibold text-slate-950">{pauseCount}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Mao: <span className="font-semibold text-slate-950">{timer.elapsedMs < duration * 500 ? 'Esquerda' : 'Direita'}</span>
          </div>
        </div>
      }
    >
      <ExerciseViewport>
        <div className="grid h-full min-h-0 w-full max-h-full grid-rows-[auto_minmax(0,1fr)] gap-4 rounded-[1.75rem] bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.12),_transparent_34%),linear-gradient(180deg,_#431407_0%,_#0f172a_100%)] px-4 py-5 text-white sm:px-6 [@media(max-height:800px)]:gap-3 [@media(max-height:800px)]:px-3 [@media(max-height:800px)]:py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-100/55">
                Tracado estabilizado
              </div>
              <div className="mt-2 text-lg font-semibold text-white">
                Coordenadas normalizadas e movimento suavizado para mouse
              </div>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75">
              Distancia atual: <span className="font-semibold text-white">{Math.round(liveDistance)} px</span>
            </div>
          </div>

          <div
            className="relative h-full min-h-0 max-h-full overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/15"
            onPointerDown={pointer.handlePointerDown}
            onPointerMove={pointer.handlePointerMove}
            onPointerUp={pointer.handlePointerUp}
            style={{ touchAction: 'none' }}
          >
            <svg
              ref={svgRef}
              viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
              className="h-full max-h-full w-full"
            >
              <path
                d={shape.path}
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="22"
                strokeLinecap="round"
              />
              <path
                ref={pathRef}
                d={shape.path}
                fill="none"
                stroke="rgba(255,255,255,0.18)"
                strokeWidth="8"
                strokeLinecap="round"
              />
              <path
                d={shape.path}
                fill="none"
                stroke="rgba(74,222,128,0.14)"
                strokeWidth="48"
                strokeLinecap="round"
                strokeDasharray="2 28"
              />
              <polyline
                points={pointer.points.map((point) => `${point.x},${point.y}`).join(' ')}
                fill="none"
                stroke={trailColor}
                strokeWidth="5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx={dotPosition.x} cy={dotPosition.y} r="12" fill="#f8fafc" />
              <circle cx={dotPosition.x} cy={dotPosition.y} r="24" fill="rgba(248,250,252,0.12)" />
            </svg>

            <div className="absolute left-4 top-4 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/65 [@media(max-height:800px)]:left-3 [@media(max-height:800px)]:top-3 [@media(max-height:800px)]:px-2.5 [@media(max-height:800px)]:py-1.5">
              Comece com a mao esquerda e acompanhe o ponto guia
            </div>
            <div className="absolute right-4 top-4 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/65 [@media(max-height:800px)]:right-3 [@media(max-height:800px)]:top-3 [@media(max-height:800px)]:px-2.5 [@media(max-height:800px)]:py-1.5">
              Forma organica: {shape.label}
            </div>
          </div>
        </div>
      </ExerciseViewport>
    </ExerciseFrame>
  )
}
