import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { scoreGridExercise } from '../../lib/scoring'
import { saveExerciseScore } from '../../lib/storage'
import { ExerciseFrame } from './ExerciseFrame'
import { ExerciseViewport } from './ExerciseViewport'
import { usePromptCountdown } from './hooks/usePromptCountdown'
import { useTimer } from './hooks/useTimer'

interface ExerciseModuleProps {
  duration: number
  title: string
  onComplete: () => void
  footerAction?: ReactNode
}

const SYMBOLS = ['★', '▲', '●', '◆', '■', '✦', '◇', '♦', '☆']
const INITIAL_RESPONSE_LIMIT_MS = 3000
const MID_RESPONSE_LIMIT_MS = 2000
const FAST_RESPONSE_LIMIT_MS = 1500
const EXPIRE_FLASH_RESET_MS = 180
const WRONG_FLASH_RESET_MS = 160
const CORRECT_FLASH_RESET_MS = 140

type PromptState =
  | { type: 'number'; value: number }
  | { type: 'symbol'; value: string }

function buildPrompt(index: number): PromptState {
  if (index % 2 === 0) {
    return { type: 'number', value: (index / 2) % 9 + 1 }
  }
  return { type: 'symbol', value: SYMBOLS[Math.floor(index / 2) % SYMBOLS.length] ?? SYMBOLS[0] }
}

function getResponseLimitMs(completed: number) {
  if (completed < 5) {
    return INITIAL_RESPONSE_LIMIT_MS
  }

  if (completed < 10) {
    return MID_RESPONSE_LIMIT_MS
  }

  return FAST_RESPONSE_LIMIT_MS
}

export function SymbolNumberSwitch({ duration, onComplete, footerAction }: ExerciseModuleProps) {
  const [promptIndex, setPromptIndex] = useState(0)
  const [errors, setErrors] = useState(0)
  const [completed, setCompleted] = useState(0)
  const [averageReactionMs, setAverageReactionMs] = useState(0)
  const [pauseCount, setPauseCount] = useState(0)
  const [flashValue, setFlashValue] = useState<'idle' | 'correct' | 'wrong'>('idle')

  const promptStartedAtRef = useRef<number | null>(null)
  const activeStartRef = useRef<number | null>(null)
  const totalActiveMsRef = useRef(0)
  const pauseCountRef = useRef(0)
  const attemptsRef = useRef(0)
  const completedRef = useRef(0)
  const errorsRef = useRef(0)
  const averageReactionRef = useRef(0)
  const flashTimeoutRef = useRef<number | null>(null)
  const elapsedMsRef = useRef(0)
  const countdownControlsRef = useRef<{
    start: (nextDurationMs?: number) => void
    pause: () => void
    reset: (nextDurationMs?: number) => void
  } | null>(null)

  const currentPrompt = buildPrompt(promptIndex)
  const responseLimitMs = getResponseLimitMs(completed)

  const clearFlashTimeout = useCallback(() => {
    if (flashTimeoutRef.current !== null) {
      window.clearTimeout(flashTimeoutRef.current)
      flashTimeoutRef.current = null
    }
  }, [])

  useEffect(() => () => clearFlashTimeout(), [clearFlashTimeout])

  const timer = useTimer({
    duration,
    onComplete: () => {
      clearFlashTimeout()

      if (activeStartRef.current !== null) {
        totalActiveMsRef.current += duration * 1000 - activeStartRef.current
        activeStartRef.current = null
      }

      saveExerciseScore(
        scoreGridExercise({
          exerciseId: 'alternancia-simbolo-numero',
          correctSelections: completedRef.current,
          totalSelections: Math.max(attemptsRef.current, 1),
          consistencyOverride:
            attemptsRef.current === 0 ? 0 : Math.max(0, 1 - errorsRef.current / attemptsRef.current),
          pauseCount: pauseCountRef.current,
          durationMs: totalActiveMsRef.current,
          totalDurationMs: duration * 1000,
          raw: { errors: errorsRef.current },
        }),
      )

      onComplete()
    },
  })

  useEffect(() => {
    elapsedMsRef.current = timer.elapsedMs
  }, [timer.elapsedMs])

  const restartPromptWindow = (nextDurationMs: number) => {
    countdownControlsRef.current?.start(nextDurationMs)
    promptStartedAtRef.current = elapsedMsRef.current
  }

  const countdown = usePromptCountdown({
    durationMs: responseLimitMs,
    // `usePromptCountdown` keeps `onExpire` fresh via ref, so this stays aligned with the latest limit.
    onExpire: () => {
      errorsRef.current += 1
      setErrors(errorsRef.current)
      attemptsRef.current += 1
      setFlashValue('wrong')
      clearFlashTimeout()
      flashTimeoutRef.current = window.setTimeout(() => {
        setFlashValue('idle')
        flashTimeoutRef.current = null
      }, EXPIRE_FLASH_RESET_MS)
      restartPromptWindow(responseLimitMs)
    },
  })

  useLayoutEffect(() => {
    countdownControlsRef.current = {
      start: countdown.start,
      pause: countdown.pause,
      reset: countdown.reset,
    }
  }, [countdown.pause, countdown.reset, countdown.start])

  const handleSelect = (value: string | number) => {
    if (!timer.isRunning || promptStartedAtRef.current === null) {
      return
    }

    attemptsRef.current += 1
    const isCorrect = value === currentPrompt.value

    if (!isCorrect) {
      errorsRef.current += 1
      setErrors(errorsRef.current)
      setFlashValue('wrong')
      clearFlashTimeout()
      flashTimeoutRef.current = window.setTimeout(() => {
        setFlashValue('idle')
        flashTimeoutRef.current = null
      }, WRONG_FLASH_RESET_MS)
      restartPromptWindow(responseLimitMs)
      return
    }

    completedRef.current += 1
    setCompleted(completedRef.current)
    const reactionMs = Math.max(timer.elapsedMs - promptStartedAtRef.current, 0)
    averageReactionRef.current =
      completedRef.current === 1
        ? reactionMs
        : (averageReactionRef.current * (completedRef.current - 1) + reactionMs) / completedRef.current
    setAverageReactionMs(averageReactionRef.current)
    setFlashValue('correct')
    clearFlashTimeout()
    flashTimeoutRef.current = window.setTimeout(() => {
      setFlashValue('idle')
      flashTimeoutRef.current = null
    }, CORRECT_FLASH_RESET_MS)
    setPromptIndex((current) => current + 1)
    restartPromptWindow(getResponseLimitMs(completedRef.current))
  }

  const handleStartPause = () => {
    if (timer.isRunning) {
      pauseCountRef.current += 1
      setPauseCount(pauseCountRef.current)
      countdown.pause()
      clearFlashTimeout()
      if (activeStartRef.current !== null) {
        totalActiveMsRef.current += timer.elapsedMs - activeStartRef.current
        activeStartRef.current = null
      }
      timer.pause()
      return
    }

    activeStartRef.current = timer.elapsedMs
    promptStartedAtRef.current = timer.elapsedMs
    countdown.start(responseLimitMs)
    timer.start()
  }

  const handleRestart = () => {
    setPromptIndex(0)
    setErrors(0)
    setCompleted(0)
    setAverageReactionMs(0)
    setPauseCount(0)
    setFlashValue('idle')
    clearFlashTimeout()
    promptStartedAtRef.current = null
    activeStartRef.current = null
    totalActiveMsRef.current = 0
    pauseCountRef.current = 0
    attemptsRef.current = 0
    completedRef.current = 0
    errorsRef.current = 0
    averageReactionRef.current = 0
    countdown.reset(INITIAL_RESPONSE_LIMIT_MS)
    timer.reset()
  }

  return (
    <ExerciseFrame
      accentColor="#f97316"
      timeLeftSeconds={timer.timeLeftSeconds}
      timerProgress={timer.progress}
      moduleProgress={(completed / 15) * 100}
      isRunning={timer.isRunning}
      onStartPause={handleStartPause}
      onRestart={handleRestart}
      footerAction={footerAction}
      metrics={
        <div className="grid gap-2 sm:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Completos: <span className="font-semibold text-slate-950">{completed}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Erros: <span className="font-semibold text-slate-950">{errors}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Pausas: <span className="font-semibold text-slate-950">{pauseCount}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Limite: <span className="font-semibold text-slate-950">{responseLimitMs / 1000}s</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Média:{' '}
            <span className="font-semibold text-slate-950">
              {completed > 0 ? `${Math.round(averageReactionMs)} ms` : 'Sem respostas'}
            </span>
          </div>
        </div>
      }
    >
      <ExerciseViewport>
        <div className="grid h-full min-h-0 w-full grid-rows-[auto_minmax(0,1fr)_auto] gap-4 rounded-[1.75rem] bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.12),_transparent_34%),linear-gradient(180deg,_#431407_0%,_#0f172a_100%)] px-4 py-5 text-white sm:px-6">
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-orange-400 transition-[width] duration-100" style={{ width: `${countdown.progress}%` }} />
          </div>
          <div className="flex min-h-0 flex-col items-center justify-center gap-6 text-center">
            <div className="text-xs uppercase tracking-[0.28em] text-white/42">
              {currentPrompt.type === 'number' ? 'Clique o número' : 'Clique o símbolo'}
            </div>
            <div
              className="rounded-[2rem] border px-12 py-10 text-[clamp(3rem,10vw,6rem)] font-semibold"
              style={{
                borderColor: flashValue === 'correct' ? '#4ade80' : flashValue === 'wrong' ? '#fb7185' : 'rgba(255,255,255,0.1)',
                backgroundColor: flashValue === 'correct' ? 'rgba(34,197,94,0.16)' : flashValue === 'wrong' ? 'rgba(244,63,94,0.16)' : 'rgba(255,255,255,0.05)',
              }}
            >
              {currentPrompt.value}
            </div>
          </div>
          <div className="grid gap-3">
            <div className="grid grid-cols-3 gap-3">
              {Array.from({ length: 9 }, (_, index) => index + 1).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleSelect(value)}
                  aria-label={`Selecionar número ${value}`}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-lg font-semibold text-white transition hover:-translate-y-0.5"
                >
                  {value}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-3">
              {SYMBOLS.map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleSelect(value)}
                  aria-label={`Selecionar símbolo ${value}`}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xl font-semibold text-white transition hover:-translate-y-0.5"
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
        </div>
      </ExerciseViewport>
    </ExerciseFrame>
  )
}
