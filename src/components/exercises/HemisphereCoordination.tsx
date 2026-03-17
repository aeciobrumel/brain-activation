import { useEffect, useMemo, useState } from 'react'

import { ExerciseFrame } from './ExerciseFrame'
import { ExerciseViewport } from './ExerciseViewport'
import { useProgress } from './hooks/useProgress'
import { useTimer } from './hooks/useTimer'

interface ExerciseModuleProps {
  duration: number
  title: string
  onComplete: () => void
  footerAction?: React.ReactNode
}

type Cue = 'left' | 'right' | 'cross-left' | 'cross-right'

export function HemisphereCoordination({
  duration,
  onComplete,
  footerAction,
}: ExerciseModuleProps) {
  const timer = useTimer({ duration, onComplete })
  const progress = useProgress(14)
  const [cue, setCue] = useState<Cue>('left')
  const [hits, setHits] = useState(0)
  const [misses, setMisses] = useState(0)

  useEffect(() => {
    if (!timer.isRunning) {
      return
    }

    const interval = window.setInterval(
      () => {
        const cues: Cue[] = ['left', 'right', 'cross-left', 'cross-right']
        setCue(cues[Math.floor(Math.random() * cues.length)])
      },
      Math.max(420, 760 - timer.progress * 2.4),
    )

    return () => window.clearInterval(interval)
  }, [timer.isRunning, timer.progress])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!timer.isRunning) {
        return
      }

      const expected = cue.endsWith('left') ? 'KeyA' : 'KeyL'

      if (event.code !== 'KeyA' && event.code !== 'KeyL') {
        return
      }

      if (event.code === expected) {
        setHits((value) => value + 1)
        progress.advance()
      } else {
        setMisses((value) => value + 1)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [cue, progress, timer.isRunning])

  const accuracy = useMemo(() => {
    const total = hits + misses
    if (total === 0) {
      return 0
    }

    return (hits / total) * 100
  }, [hits, misses])

  return (
    <ExerciseFrame
      accentColor="#f97316"
      timeLeftSeconds={timer.timeLeftSeconds}
      timerProgress={timer.progress}
      moduleProgress={accuracy}
      isRunning={timer.isRunning}
      onStartPause={timer.isRunning ? timer.pause : timer.start}
      onRestart={() => {
        progress.reset()
        setHits(0)
        setMisses(0)
        setCue('left')
        timer.restart()
      }}
      footerAction={footerAction}
      metrics={
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Acertos: <span className="font-semibold text-slate-950">{hits}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Erros: <span className="font-semibold text-slate-950">{misses}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Precisão: <span className="font-semibold text-slate-950">{Math.round(accuracy)}%</span>
          </div>
        </div>
      }
    >
      <ExerciseViewport>
        <div className="flex h-full w-full flex-col justify-center gap-3 text-center">
          <div className="relative flex h-full w-full items-center justify-center rounded-[1.75rem] border border-slate-200 bg-white px-4 sm:px-6">
            <div className="absolute inset-x-[10%] top-1/2 h-px -translate-y-1/2 bg-slate-200" />
            {(cue === 'cross-left' || cue === 'cross-right') && (
              <>
                <div className="absolute inset-x-[12%] top-[22%] h-px rotate-[22deg] bg-orange-200" />
                <div className="absolute inset-x-[12%] bottom-[22%] h-px -rotate-[22deg] bg-orange-200" />
              </>
            )}
            <div className="flex items-center gap-3 sm:gap-8">
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full border-8 text-lg transition sm:h-20 sm:w-20 sm:text-xl"
                style={{
                  borderColor: cue === 'left' || cue === 'cross-left' ? '#f97316' : '#e2e8f0',
                  backgroundColor:
                    cue === 'left' || cue === 'cross-left' ? 'rgba(249,115,22,0.16)' : '#f8fafc',
                }}
              >
                A
              </div>
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400 sm:text-sm">
                {cue.startsWith('cross') ? 'cross' : 'rhythm'}
              </div>
              <div
                className="flex h-16 w-16 items-center justify-center rounded-full border-8 text-lg transition sm:h-20 sm:w-20 sm:text-xl"
                style={{
                  borderColor: cue === 'right' || cue === 'cross-right' ? '#f97316' : '#e2e8f0',
                  backgroundColor:
                    cue === 'right' || cue === 'cross-right' ? 'rgba(249,115,22,0.16)' : '#f8fafc',
                }}
              >
                L
              </div>
            </div>
          </div>
          <p className="text-[clamp(0.75rem,1vw,0.95rem)] leading-5 text-slate-600">
            Toque <span className="font-semibold text-slate-950">A</span> para o lado esquerdo e{' '}
            <span className="font-semibold text-slate-950">L</span> para o lado direito.
          </p>
        </div>
      </ExerciseViewport>
    </ExerciseFrame>
  )
}
