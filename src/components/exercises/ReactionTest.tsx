import { useCallback, useEffect, useRef, useState } from 'react'

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

type StimulusState = 'idle' | 'waiting' | 'ready'

export function ReactionTest({ duration, onComplete, footerAction }: ExerciseModuleProps) {
  const timer = useTimer({ duration, onComplete })
  const progress = useProgress(6)
  const [stimulusState, setStimulusState] = useState<StimulusState>('idle')
  const [reactionTime, setReactionTime] = useState<number | null>(null)
  const [averageReaction, setAverageReaction] = useState<number | null>(null)
  const readyAtRef = useRef<number | null>(null)
  const timeoutRef = useRef<number | null>(null)

  const playBeep = () => {
    const AudioContextClass = window.AudioContext

    if (!AudioContextClass) {
      return
    }

    const context = new AudioContextClass()
    const oscillator = context.createOscillator()
    const gain = context.createGain()

    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.frequency.value = 660
    gain.gain.value = 0.03
    oscillator.start()
    oscillator.stop(context.currentTime + 0.1)
  }

  const scheduleStimulus = useCallback(() => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current)
    }

    setStimulusState('waiting')
    timeoutRef.current = window.setTimeout(() => {
      readyAtRef.current = performance.now()
      setStimulusState('ready')
      playBeep()
    }, 1200 + Math.random() * 1600)
  }, [])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || !timer.isRunning) {
        return
      }

      event.preventDefault()

      if (stimulusState !== 'ready' || readyAtRef.current === null) {
        setReactionTime(null)
        setStimulusState('idle')
        scheduleStimulus()
        return
      }

      const result = Math.max(event.timeStamp - readyAtRef.current, 0)
      const totalResponses = progress.current + 1

      setReactionTime(result)
      setAverageReaction((current) => {
        if (current === null) {
          return result
        }

        return (current * progress.current + result) / totalResponses
      })
      progress.advance()
      setStimulusState('idle')
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [progress, scheduleStimulus, stimulusState, timer.isRunning])

  return (
    <ExerciseFrame
      accentColor="#ef4444"
      timeLeftSeconds={timer.timeLeftSeconds}
      timerProgress={timer.progress}
      moduleProgress={progress.percentage}
      isRunning={timer.isRunning}
      onStartPause={() => {
        if (timer.isRunning) {
          if (timeoutRef.current) {
            window.clearTimeout(timeoutRef.current)
          }
          readyAtRef.current = null
          setStimulusState('idle')
          timer.pause()
          return
        }

        if (stimulusState === 'idle') {
          scheduleStimulus()
        }

        timer.start()
      }}
      onRestart={() => {
        progress.reset()
        setReactionTime(null)
        setAverageReaction(null)
        setStimulusState('idle')
        readyAtRef.current = null
        timer.reset()
      }}
      footerAction={footerAction}
      metrics={
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Última reação:{' '}
            <span className="font-semibold text-slate-950">
              {reactionTime ? `${Math.round(reactionTime)} ms` : 'Aguardando'}
            </span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Média:{' '}
            <span className="font-semibold text-slate-950">
              {averageReaction ? `${Math.round(averageReaction)} ms` : 'Sem tentativas'}
            </span>
          </div>
        </div>
      }
    >
      <ExerciseViewport>
        <div className="flex h-full w-full flex-col justify-center gap-4 text-center">
          <div
            className="flex h-full w-full items-center justify-center rounded-[1.75rem] border border-slate-200 transition"
            style={{
              backgroundColor:
                stimulusState === 'ready' ? 'rgba(239,68,68,0.14)' : 'rgba(255,255,255,0.9)',
              transform: stimulusState === 'ready' ? 'scale(1.02)' : 'scale(1)',
            }}
          >
            <div
              className={`rounded-full transition-all ${
                stimulusState === 'ready'
                  ? 'h-28 w-28 bg-red-500 shadow-[0_0_60px_rgba(239,68,68,0.45)] sm:h-32 sm:w-32'
                  : 'h-16 w-16 bg-slate-200 sm:h-20 sm:w-20'
              }`}
            />
          </div>
          <p className="text-[clamp(0.75rem,1vw,0.95rem)] leading-5 text-slate-600">
            Pressione <span className="font-semibold text-slate-950">ESPACO</span> assim que o
            estímulo aparecer. Se antecipar, o ciclo reinicia.
          </p>
        </div>
      </ExerciseViewport>
    </ExerciseFrame>
  )
}
