import { useState } from 'react'
import { Activity, Pause, Play, RotateCcw } from 'lucide-react'
import { isValidElement } from 'react'
import type { ReactNode } from 'react'

import { Button } from '../ui/Button'
import { ProgressBar } from '../ui/ProgressBar'
import { formatSeconds, hexToRgba } from '../../lib/helpers'
import { ExerciseIntroOverlay } from './ExerciseIntroOverlay'
import { useExerciseIntro } from './ExerciseIntroContext'

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

function HudTooltip({
  label,
  children,
}: {
  label?: string
  children: ReactNode
}) {
  return (
    <div className="group relative flex">
      {children}
      {label ? (
        <div className="pointer-events-none absolute bottom-[calc(100%+0.5rem)] left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-950 px-2.5 py-1 text-[0.68rem] font-semibold text-white opacity-0 shadow-[0_10px_24px_rgba(15,23,42,0.32)] transition duration-150 group-hover:-translate-y-0.5 group-hover:opacity-100 group-focus-within:-translate-y-0.5 group-focus-within:opacity-100">
          {label}
        </div>
      ) : null}
    </div>
  )
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
  const intro = useExerciseIntro()
  const [dismissedIntroId, setDismissedIntroId] = useState<string | null>(null)
  const [isMetricsOpen, setIsMetricsOpen] = useState(false)
  const isIntroOpen = Boolean(intro) && intro?.id !== dismissedIntroId

  const handleStartPause = () => {
    if (!isRunning && isIntroOpen && intro) {
      setDismissedIntroId(intro.id)
    }

    onStartPause()
  }

  const handleRestart = () => {
    onRestart()
    setDismissedIntroId(null)
    setIsMetricsOpen(false)
  }

  const footerActionTooltip =
    isValidElement<{ title?: string; 'aria-label'?: string }>(footerAction)
      ? footerAction.props.title ?? footerAction.props['aria-label']
      : undefined

  return (
    <div className="relative isolate h-full min-h-0 w-full min-w-0 overflow-hidden [--hud-gap:0.75rem] [--hud-height:5.5rem] [--hud-total-offset:calc(var(--hud-height)+var(--hud-gap)+env(safe-area-inset-bottom))] sm:[--hud-gap:1rem] sm:[--hud-height:4.5rem] [@media(max-height:700px)]:[--hud-gap:0.5rem] [@media(max-height:700px)]:[--hud-height:4rem] [@media(max-height:500px)]:[--hud-height:3.5rem]">
      <section className="relative h-[calc(100%-var(--hud-total-offset))] min-h-0 w-full min-w-0 overflow-hidden [will-change:transform]">
        {children}
      </section>

      {metrics && isMetricsOpen ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-[calc(var(--hud-total-offset)+0.5rem)] z-20 hidden px-3 lg:block lg:px-4 [@media(max-height:700px)]:hidden">
          <div className="pointer-events-auto ml-auto w-full max-w-[30rem] overflow-hidden rounded-[1.5rem] border border-white/20 bg-slate-900/85 p-3 text-white shadow-[0_18px_48px_rgba(15,23,42,0.32)] backdrop-blur-xl">
            <div className="mb-3 text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-white/50">
              Métricas secundárias
            </div>
            <div className="max-h-[min(40dvh,20rem)] overflow-y-auto pr-1">{metrics}</div>
          </div>
        </div>
      ) : null}

      <footer className="pointer-events-none absolute inset-x-0 bottom-[calc(env(safe-area-inset-bottom)+var(--hud-gap))] z-20 px-3 sm:px-4">
        <div className="pointer-events-auto mx-auto grid h-[var(--hud-height)] max-w-full grid-cols-[minmax(0,1fr)_auto] grid-rows-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-2 overflow-hidden rounded-[1.75rem] border border-white/20 bg-slate-900/70 px-3 py-2 text-white shadow-[0_-18px_48px_rgba(15,23,42,0.28)] backdrop-blur-xl [will-change:transform] md:grid-cols-[auto_minmax(0,1fr)_auto] md:grid-rows-1 md:gap-4 md:px-4 [@media(max-height:700px)]:px-2.5 [@media(max-height:700px)]:py-1.5">
          <div className="col-start-1 row-start-1 flex min-w-0 items-center gap-3 self-center">
            <div className="min-w-[4.5rem] [@media(max-height:700px)]:min-w-[4rem]">
              <div className="text-[0.65rem] font-semibold uppercase tracking-[0.28em] text-white/50 [@media(max-height:500px)]:hidden">
                Tempo
              </div>
              <div className="mt-1 text-lg font-semibold text-white [@media(max-height:700px)]:mt-0 [@media(max-height:700px)]:text-base">
                {formatSeconds(timeLeftSeconds)}
              </div>
            </div>
            <div
              className="hidden rounded-full px-3 py-1.5 text-sm font-semibold md:inline-flex"
              style={{ backgroundColor: hexToRgba(accentColor, 0.18), color: accentColor }}
            >
              {Math.round(moduleProgress)}%
            </div>
          </div>

          <div className="col-span-2 row-start-2 min-w-0 self-end md:col-span-1 md:col-start-2 md:row-start-1 md:self-center">
            <div className="grid gap-1.5 md:gap-2">
              <ProgressBar
                value={moduleProgress}
                color={accentColor}
                className="h-1.5 bg-white/12"
              />
              <div className="hidden md:block">
                <ProgressBar value={timerProgress} color={accentColor} className="h-1.5 bg-white/12" />
              </div>
            </div>
          </div>

          <div className="col-start-2 row-start-1 flex items-center gap-2 self-center md:col-start-3 md:row-start-1">
            {metrics ? (
              <HudTooltip label={isMetricsOpen ? 'Ocultar métricas' : 'Mostrar métricas'}>
                <Button
                  variant="secondary"
                  onClick={() => setIsMetricsOpen((open) => !open)}
                  size="icon"
                  title={isMetricsOpen ? 'Ocultar métricas' : 'Mostrar métricas'}
                  aria-label={isMetricsOpen ? 'Ocultar métricas' : 'Mostrar métricas'}
                  aria-pressed={isMetricsOpen}
                  className="hidden h-11 w-11 bg-white/[0.15] text-white ring-1 ring-white/20 shadow-none hover:bg-white/[0.25] lg:inline-flex [@media(max-height:700px)]:hidden"
                >
                  <Activity className="h-5 w-5 drop-shadow-[0_1px_2px_rgba(15,23,42,0.45)]" />
                </Button>
              </HudTooltip>
            ) : null}
            <HudTooltip label="Reiniciar">
              <Button
                variant="secondary"
                onClick={handleRestart}
                size="icon"
                title="Reiniciar"
                aria-label="Reiniciar"
                className="h-11 w-11 bg-gray-200 text-slate-950 ring-1 ring-white/20 shadow-none hover:bg-white/90 [@media(max-height:700px)]:h-9 [@media(max-height:700px)]:w-9 [@media(max-height:500px)]:h-8 [@media(max-height:500px)]:w-8"
              >
                <RotateCcw className="h-5 w-5 text-slate-950 drop-shadow-[0_1px_2px_rgba(15,23,42,0.18)]" />
              </Button>
            </HudTooltip>
            <HudTooltip label={footerActionTooltip}>
              <div className="[&>*]:h-11 [&>*]:w-11 [&>*]:rounded-full [&>*]:bg-white/[0.15] [&>*]:px-0 [&>*]:text-white [&>*]:ring-1 [&>*]:ring-white/20 [&>*]:shadow-none [&>*]:hover:bg-white/[0.25] [@media(max-height:700px)]:[&>*]:h-9 [@media(max-height:700px)]:[&>*]:w-9 [@media(max-height:500px)]:[&>*]:h-8 [@media(max-height:500px)]:[&>*]:w-8">
                {footerAction}
              </div>
            </HudTooltip>
            <HudTooltip label={isRunning ? 'Pausar' : 'Iniciar'}>
              <Button
                onClick={handleStartPause}
                size="icon"
                title={isRunning ? 'Pausar' : 'Iniciar'}
                aria-label={isRunning ? 'Pausar' : 'Iniciar'}
                className="h-11 w-11 bg-white text-slate-950 shadow-none hover:bg-white/90 [@media(max-height:700px)]:h-9 [@media(max-height:700px)]:w-9 [@media(max-height:500px)]:h-8 [@media(max-height:500px)]:w-8"
              >
                {isRunning ? (
                  <Pause className="h-5 w-5 text-slate-950 drop-shadow-[0_1px_2px_rgba(15,23,42,0.18)]" />
                ) : (
                  <Play className="h-5 w-5 text-slate-950 drop-shadow-[0_1px_2px_rgba(15,23,42,0.18)]" />
                )}
              </Button>
            </HudTooltip>
          </div>
        </div>
      </footer>

      {intro && isIntroOpen ? (
        <ExerciseIntroOverlay intro={intro} onStart={handleStartPause} />
      ) : null}
    </div>
  )
}
