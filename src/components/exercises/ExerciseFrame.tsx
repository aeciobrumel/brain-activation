import { Pause, Play, RotateCcw } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '../ui/Button'
import { ProgressBar } from '../ui/ProgressBar'
import { formatSeconds, hexToRgba } from '../../lib/helpers'

interface ExerciseFrameProps {
  accentColor: string
  timeLeftSeconds: number
  timerProgress: number
  moduleProgress: number
  isRunning: boolean
  onStartPause: () => void
  onRestart: () => void
  children: ReactNode
  metrics?: ReactNode
  footerAction?: ReactNode
}

export function ExerciseFrame({
  accentColor,
  timeLeftSeconds,
  timerProgress,
  moduleProgress,
  isRunning,
  onStartPause,
  onRestart,
  children,
  metrics,
  footerAction,
}: ExerciseFrameProps) {
  return (
    <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto] gap-3 lg:gap-4">
      <section className="min-h-0 min-w-0 overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-50/80 p-2 sm:p-3 lg:p-4">
        {children}
      </section>

      <footer className="min-w-0 rounded-[2rem] border border-slate-200 bg-white/90 px-3 py-3 shadow-sm backdrop-blur sm:px-4 sm:py-3">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="grid gap-3">
            <div className="grid gap-3 sm:grid-cols-[auto_auto_minmax(0,1fr)] sm:items-start">
              <div className="min-w-0">
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                  Timer
                </div>
                <div className="mt-1 text-[clamp(1rem,1.2vw,1.2rem)] font-semibold text-slate-950">
                  {formatSeconds(timeLeftSeconds)}
                </div>
              </div>
              <div
                className="w-fit rounded-2xl px-3 py-1.5"
                style={{ backgroundColor: hexToRgba(accentColor, 0.12) }}
              >
                <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
                  Ativação
                </div>
                <div
                  className="mt-1 text-[clamp(0.95rem,1.2vw,1.1rem)] font-semibold"
                  style={{ color: accentColor }}
                >
                  {Math.round(moduleProgress)}%
                </div>
              </div>
              {metrics ? <div className="hidden min-w-0 lg:block">{metrics}</div> : null}
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              <div className="min-w-0">
                <div className="mb-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Tempo
                </div>
                <ProgressBar value={timerProgress} color={accentColor} />
              </div>
              <div className="min-w-0">
                <div className="mb-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                  Progresso
                </div>
                <ProgressBar value={moduleProgress} color={accentColor} />
              </div>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3 lg:w-[22rem]">
            <Button onClick={onStartPause} className="h-10 px-3 text-sm">
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isRunning ? 'Pausar' : 'Iniciar'}
            </Button>
            <Button variant="secondary" onClick={onRestart} className="h-10 px-3 text-sm">
              <RotateCcw className="h-4 w-4" />
              Reiniciar
            </Button>
            <div className="[&>*]:h-10 [&>*]:w-full [&>*]:px-3 [&>*]:text-sm">{footerAction}</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
