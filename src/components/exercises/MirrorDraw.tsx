import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

interface TemplateGuide {
  name: string
  hint: string
  path: string
}

const CANVAS_SIZE = 480

const TEMPLATES: TemplateGuide[] = [
  {
    name: 'circulo',
    hint: 'Faça um movimento amplo e continuo.',
    path: 'M 240 110 C 312 110, 368 168, 368 240 C 368 312, 312 370, 240 370 C 168 370, 112 312, 112 240 C 112 168, 168 110, 240 110',
  },
  {
    name: 'triangulo',
    hint: 'Mantenha cantos limpos sem travar a troca.',
    path: 'M 240 112 L 356 332 L 124 332 Z',
  },
  {
    name: 'espiral',
    hint: 'Entre e saia da curva com a mesma velocidade.',
    path: 'M 240 136 C 302 136, 338 182, 338 220 C 338 284, 288 328, 228 328 C 170 328, 132 284, 132 228 C 132 174, 172 144, 218 144 C 264 144, 292 174, 292 208 C 292 248, 260 272, 226 272',
  },
  {
    name: 'onda',
    hint: 'Relaxe os ombros e siga um fluxo uniforme.',
    path: 'M 88 254 C 148 118, 226 118, 282 254 S 412 390, 456 254',
  },
]

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
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [pauseCount, setPauseCount] = useState(0)

  const mapPointToCanvas = useCallback(
    (point: DrawPoint, event: React.PointerEvent<HTMLElement>) => {
      const rect = event.currentTarget.getBoundingClientRect()

      return {
        x: Math.min(Math.max((point.x / Math.max(rect.width, 1)) * CANVAS_SIZE, 0), CANVAS_SIZE),
        y: Math.min(Math.max((point.y / Math.max(rect.height, 1)) * CANVAS_SIZE, 0), CANVAS_SIZE),
        t: point.t,
      }
    },
    [],
  )

  const pointer = usePointerDraw({
    mapPoint: mapPointToCanvas,
    stabilization: 0.14,
    getStabilization: (event) => (event.pointerType === 'mouse' ? 0.04 : 0.14),
    minDistance: 0.35,
  })
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

      const totalDistance = pointer.getTotalDistance()
      const coverageRatio = Math.min(totalDistance / 1100, 1)
      const flowRatio = Math.min(pointer.points.length / 48, 1)

      saveExerciseScore(
        scoreTrackingExercise({
          exerciseId: 'desenho-espelhado',
          averageDistance: (1 - flowRatio) * 100,
          targetDistance: 100,
          greenZoneRatio: flowRatio,
          coverageRatio,
          pauseCount: pauseCountRef.current,
          durationMs: totalActiveMsRef.current,
          totalDurationMs: duration * 1000,
          raw: {
            totalDistance: Math.round(totalDistance),
            drawActiveMs: Math.round(pointer.getTotalActiveMs()),
          },
        }),
      )

      onComplete()
    },
  })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) {
      return
    }

    const context = canvas.getContext('2d')
    if (!context) {
      return
    }

    drawPath(context, pointer.points, canvas.width, canvas.height, true)
  }, [pointer.points])

  const currentTemplate = useMemo(
    () => TEMPLATES[Math.floor(timer.elapsedMs / 10000) % TEMPLATES.length] ?? TEMPLATES[0],
    [timer.elapsedMs],
  )

  const flowRatio = Math.min(pointer.points.length / 48, 1)

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
      moduleProgress={Math.min((pointer.getTotalDistance() / 1100) * 100, 100)}
      isRunning={timer.isRunning}
      onStartPause={handleStartPause}
      onRestart={handleRestart}
      footerAction={footerAction}
      metrics={
        <div className="grid gap-2 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Template: <span className="font-semibold text-slate-950">{currentTemplate.name}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Traço: <span className="font-semibold text-slate-950">{Math.round(pointer.getTotalDistance())} px</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Fluidez: <span className="font-semibold text-slate-950">{Math.round(flowRatio * 100)}%</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Pausas: <span className="font-semibold text-slate-950">{pauseCount}</span>
          </div>
        </div>
      }
    >
      <ExerciseViewport>
        <div className="grid h-full min-h-0 w-full max-h-full grid-rows-[auto_minmax(0,1fr)] gap-4 rounded-[1.75rem] bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.12),_transparent_34%),linear-gradient(180deg,_#431407_0%,_#0f172a_100%)] px-4 py-5 text-white sm:px-6 [@media(max-height:800px)]:gap-3 [@media(max-height:800px)]:px-3 [@media(max-height:800px)]:py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-100/55">
                Espelho guiado
              </div>
              <div className="mt-2 text-lg font-semibold text-white">
                Trace dentro do quadro espelhado com resposta mais fiel ao mouse
              </div>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75">
              Guia atual: <span className="font-semibold text-white">{currentTemplate.hint}</span>
            </div>
          </div>

          <div className="flex h-full min-h-0 items-center justify-center">
            <div
              className="relative aspect-square h-full max-h-full w-full max-w-[42rem] overflow-hidden rounded-[1.5rem] border border-white/10 bg-black/15 shadow-[0_22px_64px_rgba(15,23,42,0.32)]"
              onPointerDown={pointer.handlePointerDown}
              onPointerMove={pointer.handlePointerMove}
              onPointerUp={pointer.handlePointerUp}
              style={{ touchAction: 'none' }}
            >
              <div className="pointer-events-none absolute left-4 top-4 z-10 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-white/65">
                Espelho
              </div>
              <svg viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`} className="pointer-events-none absolute inset-0 h-full w-full scale-x-[-1]">
                <path
                  d={currentTemplate.path}
                  fill="none"
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="18 14"
                />
              </svg>
              <canvas
                ref={canvasRef}
                width={CANVAS_SIZE}
                height={CANVAS_SIZE}
                className="h-full max-h-full w-full rounded-[1.5rem]"
              />
            </div>
          </div>
        </div>
      </ExerciseViewport>
    </ExerciseFrame>
  )
}
