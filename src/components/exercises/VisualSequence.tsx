import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { scoreGridExercise } from '../../lib/scoring'
import { saveExerciseScore } from '../../lib/storage'
import { ExerciseFrame } from './ExerciseFrame'
import { ExerciseGrid } from './ExerciseGrid'
import { ExerciseViewport } from './ExerciseViewport'
import { useTimer } from './hooks/useTimer'

interface ExerciseModuleProps {
  duration: number
  title: string
  onComplete: () => void
  footerAction?: ReactNode
}

type SequencePhase = 'idle' | 'show' | 'input'

const SEQUENCE_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#ec4899', '#f97316']

function buildSequence(length: number) {
  return Array.from({ length }, () => Math.floor(Math.random() * 9))
}

export function VisualSequence({ duration, onComplete, footerAction }: ExerciseModuleProps) {
  const [level, setLevel] = useState(3)
  const [sequence, setSequence] = useState<number[]>([])
  const [phase, setPhase] = useState<SequencePhase>('idle')
  const [revealedIndices, setRevealedIndices] = useState<number[]>([])
  const [selectedIndices, setSelectedIndices] = useState<number[]>([])
  const [attemptsLeft, setAttemptsLeft] = useState(2)
  const [currentInputIndex, setCurrentInputIndex] = useState(0)
  const [maxLevel, setMaxLevel] = useState(0)
  const [firstTryWins, setFirstTryWins] = useState(0)
  const [totalRounds, setTotalRounds] = useState(0)
  const [pauseCount, setPauseCount] = useState(0)

  const animationTimeoutRef = useRef<number | null>(null)
  const promptStartedAtRef = useRef<number | null>(null)
  const activeStartRef = useRef<number | null>(null)
  const totalActiveMsRef = useRef(0)
  const pauseCountRef = useRef(0)
  const firstTryWinsRef = useRef(0)
  const totalRoundsRef = useRef(0)
  const maxLevelRef = useRef(0)

  const clearAnimationTimeout = useCallback(() => {
    if (animationTimeoutRef.current !== null) {
      window.clearTimeout(animationTimeoutRef.current)
      animationTimeoutRef.current = null
    }
  }, [])

  const prepareLevel = useCallback((nextLevel: number, reuseSequence?: number[]) => {
    clearAnimationTimeout()
    const nextSequence = reuseSequence ?? buildSequence(nextLevel)
    setLevel(nextLevel)
    setSequence(nextSequence)
    setPhase('show')
    setAttemptsLeft(2)
    setCurrentInputIndex(0)
    setSelectedIndices([])
    setRevealedIndices([])
    totalRoundsRef.current += 1
    setTotalRounds(totalRoundsRef.current)
  }, [clearAnimationTimeout])

  useEffect(() => () => clearAnimationTimeout(), [clearAnimationTimeout])

  useEffect(() => {
    if (!sequence.length || phase !== 'show') {
      return
    }

    let step = 0

    const revealNext = () => {
      if (step >= sequence.length) {
        setRevealedIndices([])
        setPhase('input')
        setSelectedIndices([])
        setCurrentInputIndex(0)
        promptStartedAtRef.current = performance.now()
        animationTimeoutRef.current = null
        return
      }

      setRevealedIndices([sequence[step]])
      animationTimeoutRef.current = window.setTimeout(() => {
        setRevealedIndices([])
        step += 1
        animationTimeoutRef.current = window.setTimeout(revealNext, 180)
      }, 500)
    }

    revealNext()

    return () => clearAnimationTimeout()
  }, [clearAnimationTimeout, phase, sequence])

  const timer = useTimer({
    duration,
    onComplete: () => {
      clearAnimationTimeout()
      if (activeStartRef.current !== null) {
        totalActiveMsRef.current += performance.now() - activeStartRef.current
        activeStartRef.current = null
      }

      saveExerciseScore(
        scoreGridExercise({
          exerciseId: 'sequencia-visual',
          correctSelections: maxLevelRef.current,
          totalSelections: 9,
          consistencyOverride:
            totalRoundsRef.current === 0 ? 0 : firstTryWinsRef.current / totalRoundsRef.current,
          pauseCount: pauseCountRef.current,
          durationMs: totalActiveMsRef.current,
          totalDurationMs: duration * 1000,
          raw: {
            maxLevel: maxLevelRef.current,
            firstTryWins: firstTryWinsRef.current,
            totalRounds: totalRoundsRef.current,
          },
        }),
      )

      onComplete()
    },
  })

  const handleSelect = (index: number) => {
    if (!timer.isRunning || phase !== 'input') {
      return
    }

    const expectedIndex = sequence[currentInputIndex]
    if (index === expectedIndex) {
      const nextSelected = [...selectedIndices, index]
      setSelectedIndices(nextSelected)

      if (currentInputIndex === sequence.length - 1) {
        if (attemptsLeft === 2) {
          firstTryWinsRef.current += 1
          setFirstTryWins(firstTryWinsRef.current)
        }
        maxLevelRef.current = Math.max(maxLevelRef.current, sequence.length)
        setMaxLevel(maxLevelRef.current)
        prepareLevel(Math.min(sequence.length + 1, 9))
        return
      }

      setCurrentInputIndex((current) => current + 1)
      return
    }

    if (attemptsLeft > 1) {
      setAttemptsLeft(1)
      setPhase('show')
      setSelectedIndices([])
      setCurrentInputIndex(0)
      return
    }

    setSelectedIndices([])
    setCurrentInputIndex(0)
    prepareLevel(sequence.length)
  }

  const handleStartPause = () => {
    if (timer.isRunning) {
      pauseCountRef.current += 1
      setPauseCount(pauseCountRef.current)
      clearAnimationTimeout()
      if (activeStartRef.current !== null) {
        totalActiveMsRef.current += performance.now() - activeStartRef.current
        activeStartRef.current = null
      }
      timer.pause()
      return
    }

    if (!sequence.length) {
      prepareLevel(3)
    }

    activeStartRef.current = performance.now()
    timer.start()
  }

  const handleRestart = () => {
    clearAnimationTimeout()
    setLevel(3)
    setSequence([])
    setPhase('idle')
    setRevealedIndices([])
    setSelectedIndices([])
    setAttemptsLeft(2)
    setCurrentInputIndex(0)
    setMaxLevel(0)
    setFirstTryWins(0)
    setTotalRounds(0)
    setPauseCount(0)
    promptStartedAtRef.current = null
    activeStartRef.current = null
    totalActiveMsRef.current = 0
    pauseCountRef.current = 0
    firstTryWinsRef.current = 0
    totalRoundsRef.current = 0
    maxLevelRef.current = 0
    timer.reset()
  }

  const items = Array.from({ length: 9 }, (_, index) => ({
    id: `sequence-${index}`,
    accentColor: SEQUENCE_COLORS[index % SEQUENCE_COLORS.length],
    front: <div className="h-10 w-10 rounded-2xl" style={{ backgroundColor: SEQUENCE_COLORS[index % SEQUENCE_COLORS.length] }} />,
    back: <div className="h-10 w-10 rounded-2xl bg-white/10" />,
  }))

  return (
    <ExerciseFrame
      accentColor="#22c55e"
      timeLeftSeconds={timer.timeLeftSeconds}
      timerProgress={timer.progress}
      moduleProgress={(maxLevel / 9) * 100}
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
            Máximo: <span className="font-semibold text-slate-950">{maxLevel}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            1ª tentativa: <span className="font-semibold text-slate-950">{firstTryWins}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Rodadas: <span className="font-semibold text-slate-950">{totalRounds}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Pausas: <span className="font-semibold text-slate-950">{pauseCount}</span>
          </div>
        </div>
      }
    >
      <ExerciseViewport>
        <div className="grid h-full min-h-0 w-full grid-rows-[auto_minmax(0,1fr)] gap-4 rounded-[1.75rem] bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.14),_transparent_32%),linear-gradient(180deg,_#052e16_0%,_#0f172a_100%)] px-4 py-5 text-white sm:px-6">
          <div className="text-center text-sm uppercase tracking-[0.24em] text-white/42">
            {phase === 'show' ? 'Observe a sequência' : phase === 'input' ? 'Repita na mesma ordem' : 'Inicie para começar'}
          </div>
          <div className="flex min-h-0 items-center justify-center">
            <div className="w-full max-w-[32rem]">
              <ExerciseGrid
                items={items}
                columns={3}
                onSelect={(index) => handleSelect(index)}
                revealedIndices={revealedIndices}
                selectedIndices={selectedIndices}
                disabled={!timer.isRunning || phase !== 'input'}
                flip
              />
            </div>
          </div>
        </div>
      </ExerciseViewport>
    </ExerciseFrame>
  )
}
