import { useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { scoreTrackingExercise } from '../../lib/scoring'
import { saveExerciseScore } from '../../lib/storage'
import { ExerciseFrame } from './ExerciseFrame'
import { ExerciseViewport } from './ExerciseViewport'
import type { DrawPoint } from './hooks/usePointerDraw'
import { usePointerDraw } from './hooks/usePointerDraw'
import { useTimer } from './hooks/useTimer'

interface ExerciseModuleProps {
  duration: number
  title: string
  onComplete: () => void
  footerAction?: ReactNode
}

const TEMPLATES = ['círculo', 'triângulo', 'espiral', 'onda']

function drawPath(
  ctx: CanvasRenderingContext2D,
  points: DrawPoint[],
  width: number,
  height: number,
  mirrored = false,
) {
  ctx.clearRect(0, 0, width, height)
  ctx.lineWidth = 4
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = '#f8fafc'
  ctx.beginPath()

  points.forEach((point, index) => {
    const x = mirrored ? width - point.x : point.x
    const y = point.y
    if (index === 0) {
      ctx.moveTo(x, y)
      return
    }

    const previous = points[index - 1]
    const previousX = mirrored ? width - previous.x : previous.x
    const previousY = previous.y
    const midX = (previousX + x) / 2
    const midY = (previousY + y) / 2
    ctx.quadraticCurveTo(previousX, previousY, midX, midY)
  })

  ctx.stroke()
}

export function MirrorDraw({ duration, onComplete, footerAction }: ExerciseModuleProps) {
  const leftCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const rightCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const [pauseCount, setPauseCount] = useState(0)

  const pointer = usePointerDraw()
  const pauseCountRef = useRef(0)
  const activeStartRef = useRef<number | null>(null)
  const totalActiveMsRef = useRef(0)

  const timer = useTimer({
    duration,
    onComplete: () => {
      if (activeStartRef.current !== null) {
        totalActiveMsRef.current += performance.now() - activeStartRef.current
        activeStartRef.current = null
      }

      const coverageRatio = Math.min(pointer.totalDistanceRef.current / 900, 1)
      const symmetryRatio = pointer.points.length > 8 ? 1 : 0

      saveExerciseScore(
        scoreTrackingExercise({
          exerciseId: 'desenho-espelhado',
          averageDistance: (1 - symmetryRatio) * 100,
          targetDistance: 100,
          greenZoneRatio: symmetryRatio,
          coverageRatio,
          pauseCount: pauseCountRef.current,
          durationMs: totalActiveMsRef.current,
          totalDurationMs: duration * 1000,
          raw: {
            totalDistance: Math.round(pointer.totalDistanceRef.current),
            drawActiveMs: Math.round(pointer.totalActiveMsRef.current),
          },
        }),
      )

      onComplete()
    },
  })

  useEffect(() => {
    const leftCanvas = leftCanvasRef.current
    const rightCanvas = rightCanvasRef.current
    if (!leftCanvas || !rightCanvas) {
      return
    }

    const leftContext = leftCanvas.getContext('2d')
    const rightContext = rightCanvas.getContext('2d')
    if (!leftContext || !rightContext) {
      return
    }

    drawPath(leftContext, pointer.points, leftCanvas.width, leftCanvas.height, false)
    drawPath(rightContext, pointer.points, rightCanvas.width, rightCanvas.height, true)
  }, [pointer.points])

  const currentTemplate = useMemo(
    () => TEMPLATES[Math.floor(timer.elapsedMs / 10000) % TEMPLATES.length] ?? TEMPLATES[0],
    [timer.elapsedMs],
  )

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
    setPauseCount(0)
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
      moduleProgress={Math.min(pointer.totalDistanceRef.current / 900, 100)}
      isRunning={timer.isRunning}
      onStartPause={handleStartPause}
      onRestart={handleRestart}
      footerAction={footerAction}
      metrics={
        <div className="grid gap-2 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Template: <span className="font-semibold text-slate-950">{currentTemplate}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Traço: <span className="font-semibold text-slate-950">{Math.round(pointer.totalDistanceRef.current)} px</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Simetria: <span className="font-semibold text-slate-950">{pointer.points.length > 8 ? '100%' : '0%'}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Pausas: <span className="font-semibold text-slate-950">{pauseCount}</span>
          </div>
        </div>
      }
    >
      <ExerciseViewport>
        <div
          className="grid h-full min-h-0 w-full grid-cols-2 gap-4 rounded-[1.75rem] bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.12),_transparent_34%),linear-gradient(180deg,_#431407_0%,_#0f172a_100%)] px-4 py-5"
          onPointerDown={pointer.handlePointerDown}
          onPointerMove={pointer.handlePointerMove}
          onPointerUp={pointer.handlePointerUp}
        >
          <div className="relative rounded-[1.5rem] border border-white/10 bg-black/15">
            <canvas ref={leftCanvasRef} width={480} height={480} className="h-full w-full rounded-[1.5rem]" />
          </div>
          <div className="relative rounded-[1.5rem] border border-white/10 bg-black/15">
            <canvas ref={rightCanvasRef} width={480} height={480} className="h-full w-full rounded-[1.5rem]" />
          </div>
        </div>
      </ExerciseViewport>
    </ExerciseFrame>
  )
}
