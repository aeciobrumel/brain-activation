import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { scoreGridExercise } from '../../lib/scoring'
import { saveExerciseScore } from '../../lib/storage'
import { ExerciseFrame } from './ExerciseFrame'
import { ExerciseGrid } from './ExerciseGrid'
import { ExerciseViewport } from './ExerciseViewport'
import { ShapeToken } from './ShapeToken'
import { useTimer } from './hooks/useTimer'

interface ExerciseModuleProps {
  duration: number
  title: string
  onComplete: () => void
  footerAction?: ReactNode
}

type Shape = 'circle' | 'square' | 'triangle'

interface RoundState {
  gridSize: number
  oddIndex: number
  shape: Shape
  color: string
  oddColor: string
  rotation: number
  oddRotation: number
  scale: number
  oddScale: number
}

const LEVEL_CONFIG = {
  1: { gridSize: 3, rotation: 0, oddRotation: 0, scale: 1, oddScale: 1, color: '#f8fafc', oddColor: '#fb7185' },
  2: { gridSize: 4, rotation: 0, oddRotation: 15, scale: 1, oddScale: 1, color: '#f8fafc', oddColor: '#f8fafc' },
  3: { gridSize: 5, rotation: 0, oddRotation: 0, scale: 1, oddScale: 0.92, color: '#f8fafc', oddColor: '#f8fafc' },
} as const
const MODULE_PROGRESS_TARGET = 12
const SHAKE_RESET_DELAY_MS = 220

function getPromotedLevel(level: 1 | 2 | 3, streak: number): 1 | 2 | 3 {
  if (streak > 0 && streak % 3 === 0) {
    return Math.min(level + 1, 3) as 1 | 2 | 3
  }

  return level
}

function buildRound(level: 1 | 2 | 3): RoundState {
  const config = LEVEL_CONFIG[level]
  const shapes: Shape[] = ['circle', 'square', 'triangle']
  return {
    gridSize: config.gridSize,
    oddIndex: Math.floor(Math.random() * (config.gridSize * config.gridSize)),
    shape: shapes[Math.floor(Math.random() * shapes.length)] ?? 'circle',
    color: config.color,
    oddColor: config.oddColor,
    rotation: config.rotation,
    oddRotation: config.oddRotation,
    scale: config.scale,
    oddScale: config.oddScale,
  }
}

export function OddOneOut({ duration, onComplete, footerAction }: ExerciseModuleProps) {
  const [level, setLevel] = useState<1 | 2 | 3>(1)
  const [streak, setStreak] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [totalAttempts, setTotalAttempts] = useState(0)
  const [averageReactionMs, setAverageReactionMs] = useState(0)
  const [pauseCount, setPauseCount] = useState(0)
  const [shakeIndices, setShakeIndices] = useState<number[]>([])
  const [round, setRound] = useState<RoundState>(() => buildRound(1))

  const promptStartedAtRef = useRef<number | null>(null)
  const activeStartRef = useRef<number | null>(null)
  const totalActiveMsRef = useRef(0)
  const pauseCountRef = useRef(0)
  const averageReactionRef = useRef(0)
  const levelRef = useRef<1 | 2 | 3>(1)
  const streakRef = useRef(0)
  const correctAnswersRef = useRef(0)
  const attemptsRef = useRef(0)
  const shakeTimeoutRef = useRef<number | null>(null)

  const clearShakeTimeout = useCallback(() => {
    if (shakeTimeoutRef.current !== null) {
      window.clearTimeout(shakeTimeoutRef.current)
      shakeTimeoutRef.current = null
    }
  }, [])

  useEffect(() => () => clearShakeTimeout(), [clearShakeTimeout])

  const timer = useTimer({
    duration,
    onComplete: () => {
      clearShakeTimeout()

      if (activeStartRef.current !== null) {
        totalActiveMsRef.current += performance.now() - activeStartRef.current
        activeStartRef.current = null
      }

      saveExerciseScore(
        scoreGridExercise({
          exerciseId: 'simbolo-diferente',
          correctSelections: correctAnswersRef.current,
          totalSelections: Math.max(attemptsRef.current, 1),
          averageReactionMs: averageReactionRef.current,
          pauseCount: pauseCountRef.current,
          durationMs: totalActiveMsRef.current,
          totalDurationMs: duration * 1000,
          raw: { level: levelRef.current },
        }),
      )

      onComplete()
    },
  })

  const items = useMemo(
    () =>
      Array.from({ length: round.gridSize * round.gridSize }, (_, index) => {
        const isOdd = index === round.oddIndex
        return {
          id: `odd-one-${index}`,
          accentColor: '#8b5cf6',
          front: (
            <ShapeToken
              shape={round.shape}
              color={isOdd ? round.oddColor : round.color}
              rotation={isOdd ? round.oddRotation : round.rotation}
              scale={isOdd ? round.oddScale : round.scale}
            />
          ),
          back: (
            <ShapeToken
              shape={round.shape}
              color={isOdd ? round.oddColor : round.color}
              rotation={isOdd ? round.oddRotation : round.rotation}
              scale={isOdd ? round.oddScale : round.scale}
            />
          ),
        }
      }),
    [round],
  )

  const handleSelect = (index: number, event: React.MouseEvent<HTMLButtonElement>) => {
    if (!timer.isRunning || promptStartedAtRef.current === null) {
      return
    }

    attemptsRef.current += 1
    setTotalAttempts(attemptsRef.current)
    const reactionMs = event.timeStamp - promptStartedAtRef.current
    averageReactionRef.current =
      attemptsRef.current === 1
        ? reactionMs
        : (averageReactionRef.current * (attemptsRef.current - 1) + reactionMs) / attemptsRef.current
    setAverageReactionMs(averageReactionRef.current)

    if (index === round.oddIndex) {
      const nextStreak = streakRef.current + 1
      const nextLevel = getPromotedLevel(levelRef.current, nextStreak)

      correctAnswersRef.current += 1
      levelRef.current = nextLevel
      streakRef.current = nextStreak
      setCorrectAnswers(correctAnswersRef.current)
      setStreak(nextStreak)
      setLevel(nextLevel)
      setRound(buildRound(nextLevel))
      promptStartedAtRef.current = performance.now()
      return
    }

    streakRef.current = 0
    setStreak(0)
    setShakeIndices([index])
    clearShakeTimeout()
    shakeTimeoutRef.current = window.setTimeout(() => {
      setShakeIndices([])
      shakeTimeoutRef.current = null
    }, SHAKE_RESET_DELAY_MS)
  }

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
    setLevel(1)
    setStreak(0)
    setCorrectAnswers(0)
    setTotalAttempts(0)
    setAverageReactionMs(0)
    setPauseCount(0)
    setShakeIndices([])
    setRound(buildRound(1))
    clearShakeTimeout()
    promptStartedAtRef.current = null
    activeStartRef.current = null
    totalActiveMsRef.current = 0
    pauseCountRef.current = 0
    averageReactionRef.current = 0
    levelRef.current = 1
    streakRef.current = 0
    correctAnswersRef.current = 0
    attemptsRef.current = 0
    timer.reset()
  }

  return (
    <ExerciseFrame
      accentColor="#8b5cf6"
      timeLeftSeconds={timer.timeLeftSeconds}
      timerProgress={timer.progress}
      moduleProgress={Math.min((correctAnswers / MODULE_PROGRESS_TARGET) * 100, 100)}
      isRunning={timer.isRunning}
      onStartPause={handleStartPause}
      onRestart={handleRestart}
      footerAction={footerAction}
      metrics={
        <div className="grid gap-2 sm:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Nível: <span className="font-semibold text-slate-950">{level}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Acertos: <span className="font-semibold text-slate-950">{correctAnswers}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Streak: <span className="font-semibold text-slate-950">{streak}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Pausas: <span className="font-semibold text-slate-950">{pauseCount}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Média:{' '}
            <span className="font-semibold text-slate-950">
              {totalAttempts > 0 ? `${Math.round(averageReactionMs)} ms` : 'Sem rodadas'}
            </span>
          </div>
        </div>
      }
    >
      <ExerciseViewport>
        <div className="flex h-full min-h-0 w-full items-center justify-center rounded-[1.75rem] bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.12),_transparent_34%),linear-gradient(180deg,_#1e1b4b_0%,_#0f172a_100%)] px-4 py-5">
          <div className="w-full max-w-[44rem]">
            <ExerciseGrid
              items={items}
              columns={round.gridSize}
              onSelect={(index, event) => handleSelect(index, event)}
              revealedIndices={Array.from({ length: items.length }, (_, index) => index)}
              shakeIndices={shakeIndices}
              disabled={!timer.isRunning}
            />
          </div>
        </div>
      </ExerciseViewport>
    </ExerciseFrame>
  )
}
