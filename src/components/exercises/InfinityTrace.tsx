import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

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

const INFINITY_PATH = 'M 120 180 C 120 80, 240 80, 240 180 S 360 280, 360 180 C 360 80, 480 80, 480 180 S 360 280, 240 180 S 120 280, 120 180'

export function InfinityTrace({ duration, onComplete, footerAction }: ExerciseModuleProps) {
  const pathRef = useRef<SVGPathElement | null>(null)
  const rafRef = useRef<number | null>(null)
  const [dotPosition, setDotPosition] = useState({ x: 120, y: 180 })
  const [averageDistance, setAverageDistance] = useState(0)
  const [greenRatio, setGreenRatio] = useState(0)
  const [pauseCount, setPauseCount] = useState(0)
  const [cycles, setCycles] = useState(0)

  const pointer = usePointerDraw()
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
          raw: { cycles },
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

      const latestPoint = pointer.latestPointRef.current
      if (latestPoint) {
        const distance = Math.hypot(latestPoint.x - point.x, latestPoint.y - point.y)
        distanceSamplesRef.current += 1
        totalDistanceRef.current += distance
        if (distance < 20) {
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
  }, [pointer.latestPointRef, timer.isRunning])

  const trailColor = useMemo(() => {
    if (averageDistance < 20) return '#4ade80'
    if (averageDistance < 40) return '#facc15'
    return '#f87171'
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
    setDotPosition({ x: 120, y: 180 })
    setAverageDistance(0)
    setGreenRatio(0)
    setPauseCount(0)
    setCycles(0)
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
        <div className="grid gap-2 sm:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Distância média: <span className="font-semibold text-slate-950">{Math.round(averageDistance)} px</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Zona verde: <span className="font-semibold text-slate-950">{Math.round(greenRatio * 100)}%</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Ciclos: <span className="font-semibold text-slate-950">{cycles}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Pausas: <span className="font-semibold text-slate-950">{pauseCount}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Mão: <span className="font-semibold text-slate-950">{timer.elapsedMs < duration * 500 ? 'Atual' : 'Trocar mão'}</span>
          </div>
        </div>
      }
    >
      <ExerciseViewport>
        <div
          className="relative h-full w-full rounded-[1.75rem] bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.12),_transparent_34%),linear-gradient(180deg,_#431407_0%,_#0f172a_100%)]"
          onPointerDown={pointer.handlePointerDown}
          onPointerMove={pointer.handlePointerMove}
          onPointerUp={pointer.handlePointerUp}
        >
          <svg viewBox="0 0 600 360" className="h-full w-full">
            <path ref={pathRef} d={INFINITY_PATH} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" strokeLinecap="round" />
            <polyline
              points={pointer.points.map((point) => `${point.x},${point.y}`).join(' ')}
              fill="none"
              stroke={trailColor}
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx={dotPosition.x} cy={dotPosition.y} r="10" fill="#f8fafc" />
          </svg>
        </div>
      </ExerciseViewport>
    </ExerciseFrame>
  )
}
