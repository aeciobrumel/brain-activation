import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { scoreCountdown } from '../../lib/scoring'
import { saveExerciseScore } from '../../lib/storage'
import { ExerciseFrame } from './ExerciseFrame'
import { ExerciseInput } from './ExerciseInput'
import { ExerciseViewport } from './ExerciseViewport'
import { useTextInput } from './hooks/useTextInput'
import { useTimer } from './hooks/useTimer'

interface ExerciseModuleProps {
  duration: number
  title: string
  onComplete: () => void
  footerAction?: ReactNode
}

interface CountdownStage {
  start: number
  step: number
}

const COUNTDOWN_STAGES: CountdownStage[] = [
  { start: 60, step: 3 },
  { start: 80, step: 4 },
  { start: 120, step: 6 },
]

function getRandomStage() {
  return COUNTDOWN_STAGES[Math.floor(Math.random() * COUNTDOWN_STAGES.length)] ?? COUNTDOWN_STAGES[0]
}

function getInitialState(stage: CountdownStage) {
  return {
    stage,
    lastCorrect: stage.start,
    expectedNumber: stage.start - stage.step,
  }
}

export function ReverseCount({ duration, onComplete, footerAction }: ExerciseModuleProps) {
  const [initialStage] = useState<CountdownStage>(() => getRandomStage())
  const [countdownState, setCountdownState] = useState(() => getInitialState(initialStage))
  const [errors, setErrors] = useState(0)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [streakMax, setStreakMax] = useState(0)
  const [completedSteps, setCompletedSteps] = useState(0)
  const [averageResponseMs, setAverageResponseMs] = useState(0)
  const [pauseCount, setPauseCount] = useState(0)
  const [statusMessage, setStatusMessage] = useState(
    () => `Modo sorteado: começar em ${initialStage.start} e descer de ${initialStage.step} em ${initialStage.step}.`,
  )
  const [isLocked, setIsLocked] = useState(false)

  const pauseCountRef = useRef(0)
  const activeStartRef = useRef<number | null>(null)
  const totalActiveMsRef = useRef(0)
  const promptStartedAtRef = useRef<number | null>(null)
  const completedStepsRef = useRef(0)
  const errorsRef = useRef(0)
  const streakMaxRef = useRef(0)
  const responseCountRef = useRef(0)
  const averageResponseRef = useRef(0)
  const unlockTimeoutRef = useRef<number | null>(null)

  const clearUnlockTimeout = useCallback(() => {
    if (unlockTimeoutRef.current !== null) {
      window.clearTimeout(unlockTimeoutRef.current)
      unlockTimeoutRef.current = null
    }
  }, [])

  useEffect(() => () => clearUnlockTimeout(), [clearUnlockTimeout])

  const handleComplete = useCallback(() => {
    clearUnlockTimeout()

    if (activeStartRef.current !== null) {
      totalActiveMsRef.current += performance.now() - activeStartRef.current
      activeStartRef.current = null
    }

    saveExerciseScore(
      scoreCountdown({
        exerciseId: 'contagem-reversa',
        completedSteps: completedStepsRef.current,
        errors: errorsRef.current,
        streakMax: streakMaxRef.current,
        durationMs: totalActiveMsRef.current,
        totalDurationMs: duration * 1000,
      }),
    )

    onComplete()
  }, [clearUnlockTimeout, duration, onComplete])

  const timer = useTimer({ duration, onComplete: handleComplete })

  const advanceState = useCallback((expectedNumber: number) => {
    if (expectedNumber <= 0) {
      return getInitialState(getRandomStage())
    }

    return {
      stage: countdownState.stage,
      lastCorrect: expectedNumber,
      expectedNumber: expectedNumber - countdownState.stage.step,
    }
  }, [countdownState.stage])

  const handleSubmission = useCallback(
    (rawValue: string) => {
      if (!timer.isRunning || isLocked) {
        return false
      }

      const submittedNumber = Number(rawValue)
      if (Number.isNaN(submittedNumber)) {
        setStatusMessage('Digite apenas números.')
        return false
      }

      const responseMs =
        promptStartedAtRef.current === null ? 0 : performance.now() - promptStartedAtRef.current
      responseCountRef.current += 1
      averageResponseRef.current =
        responseCountRef.current === 1
          ? responseMs
          : (averageResponseRef.current * (responseCountRef.current - 1) + responseMs) /
            responseCountRef.current
      setAverageResponseMs(averageResponseRef.current)

      if (submittedNumber === countdownState.expectedNumber) {
        completedStepsRef.current += 1
        setCompletedSteps(completedStepsRef.current)
        setCurrentStreak((previous) => {
          const nextStreak = previous + 1
          if (nextStreak > streakMaxRef.current) {
            streakMaxRef.current = nextStreak
            setStreakMax(nextStreak)
          }
          return nextStreak
        })
        const nextState = advanceState(submittedNumber)
        if (submittedNumber <= 0) {
          setStatusMessage(
            `Sequência concluída. Novo ritmo: começar em ${nextState.stage.start} descendo de ${nextState.stage.step} em ${nextState.stage.step}.`,
          )
        } else {
          setStatusMessage('Boa. Continue no mesmo ritmo.')
        }
        setCountdownState(nextState)
        promptStartedAtRef.current = performance.now()
        return true
      }

      errorsRef.current += 1
      setErrors(errorsRef.current)
      setCurrentStreak(0)
      setIsLocked(true)
      setStatusMessage(`Correto: ${countdownState.expectedNumber}. Retome a partir dele.`)
      clearUnlockTimeout()
      unlockTimeoutRef.current = window.setTimeout(() => {
        setIsLocked(false)
        setStatusMessage('Siga a sequência com calma e sem pular etapas.')
        promptStartedAtRef.current = performance.now()
        unlockTimeoutRef.current = null
      }, 1500)

      return false
    },
    [advanceState, clearUnlockTimeout, countdownState.expectedNumber, isLocked, timer.isRunning],
  )

  const input = useTextInput({
    onSubmit: handleSubmission,
  })

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

    promptStartedAtRef.current = performance.now()
    activeStartRef.current = performance.now()
    timer.start()
  }

  const handleRestart = () => {
    clearUnlockTimeout()
    const nextStage = getRandomStage()
    setCountdownState(getInitialState(nextStage))
    setErrors(0)
    setCurrentStreak(0)
    setStreakMax(0)
    setCompletedSteps(0)
    setAverageResponseMs(0)
    setPauseCount(0)
    setStatusMessage(
      `Novo modo sorteado: começar em ${nextStage.start} e descer de ${nextStage.step} em ${nextStage.step}.`,
    )
    setIsLocked(false)
    pauseCountRef.current = 0
    activeStartRef.current = null
    totalActiveMsRef.current = 0
    promptStartedAtRef.current = null
    completedStepsRef.current = 0
    errorsRef.current = 0
    streakMaxRef.current = 0
    responseCountRef.current = 0
    averageResponseRef.current = 0
    input.setValue('')
    timer.reset()
  }

  const moduleProgress = useMemo(() => {
    const baselineTarget = 20
    return Math.min((completedSteps / baselineTarget) * 100, 100)
  }, [completedSteps])

  return (
    <ExerciseFrame
      accentColor="#3b82f6"
      timeLeftSeconds={timer.timeLeftSeconds}
      timerProgress={timer.progress}
      moduleProgress={moduleProgress}
      isRunning={timer.isRunning}
      onStartPause={handleStartPause}
      onRestart={handleRestart}
      footerAction={footerAction}
      metrics={
        <div className="grid gap-2 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Erros: <span className="font-semibold text-slate-950">{errors}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Melhor streak: <span className="font-semibold text-slate-950">{streakMax}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Pausas: <span className="font-semibold text-slate-950">{pauseCount}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Média:{' '}
            <span className="font-semibold text-slate-950">
              {completedSteps + errors > 0 ? `${Math.round(averageResponseMs)} ms` : 'Sem respostas'}
            </span>
          </div>
        </div>
      }
    >
      <ExerciseViewport>
        <div className="grid h-full min-h-0 w-full grid-rows-[auto_minmax(0,1fr)_auto] gap-4 rounded-[1.75rem] bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_38%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] px-4 py-5 text-white sm:px-6">
          <div className="text-center">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-white/45">
              Referência atual
            </div>
            <div className="mt-2 text-[clamp(1.75rem,4vw,2.5rem)] font-semibold">
              {countdownState.lastCorrect}
            </div>
          </div>

          <div className="flex min-h-0 flex-col items-center justify-center gap-4 text-center">
            <div className="text-sm uppercase tracking-[0.24em] text-blue-200/70">
              Qual é o próximo número?
            </div>
            <div className="text-[clamp(2.75rem,8vw,5rem)] font-semibold tracking-[-0.04em]">
              ?
            </div>
            <div className="max-w-xl text-sm leading-6 text-white/60">{statusMessage}</div>
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/40">
              <span>Streak atual {currentStreak}</span>
              <span className="text-white/20">·</span>
              <span>Etapa {countdownState.stage.start}/-{countdownState.stage.step}</span>
            </div>
          </div>

          <ExerciseInput
            type="number"
            inputMode="numeric"
            value={input.value}
            onChange={input.setValue}
            onKeyDown={input.handleKeyDown}
            onSubmit={input.submit}
            feedback={input.feedback}
            disabled={!timer.isRunning || isLocked}
            placeholder={timer.isRunning ? 'Digite o próximo número' : 'Inicie o exercício para responder'}
          />
        </div>
      </ExerciseViewport>
    </ExerciseFrame>
  )
}
