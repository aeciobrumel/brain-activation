import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
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

interface CardItem {
  id: string
  symbol: string
}

const SYMBOLS = ['☀', '☾', '★', '♥', '◆', '✦', '✿', '⚡', '⬢', '⬡']
const INITIAL_PAIR_COUNT = 6
const MAX_PAIR_COUNT = 8
const MATCH_FEEDBACK_DELAY_MS = 260
const MISMATCH_FEEDBACK_DELAY_MS = 800

function shuffleItems<T>(items: T[]) {
  const shuffled = [...items]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }

  return shuffled
}

function getRoundPairCount(roundNumber: number) {
  return Math.min(INITIAL_PAIR_COUNT + roundNumber - 1, MAX_PAIR_COUNT)
}

function getTotalPairsSeen(roundsStarted: number) {
  let total = 0

  for (let roundNumber = 1; roundNumber <= roundsStarted; roundNumber += 1) {
    total += getRoundPairCount(roundNumber)
  }

  return total
}

function buildDeck(pairCount: number) {
  const selected = shuffleItems(SYMBOLS).slice(0, pairCount)
  return shuffleItems([...selected, ...selected].map((symbol, index) => ({ id: `${symbol}-${index}`, symbol })))
}

export function MemoryMatch({ duration, onComplete, footerAction }: ExerciseModuleProps) {
  const [pairCount, setPairCount] = useState(INITIAL_PAIR_COUNT)
  const [deck, setDeck] = useState<CardItem[]>(() => buildDeck(INITIAL_PAIR_COUNT))
  const [revealed, setRevealed] = useState<number[]>([])
  const [matched, setMatched] = useState<number[]>([])
  const [totalFlips, setTotalFlips] = useState(0)
  const [pairsFound, setPairsFound] = useState(0)
  const [pauseCount, setPauseCount] = useState(0)

  const timeoutRef = useRef<number | null>(null)
  const activeStartRef = useRef<number | null>(null)
  const totalActiveMsRef = useRef(0)
  const pauseCountRef = useRef(0)
  const totalFlipsRef = useRef(0)
  const pairsFoundRef = useRef(0)
  const pairCountRef = useRef(INITIAL_PAIR_COUNT)
  const roundsStartedRef = useRef(1)

  const clearTimeoutRef = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  useEffect(() => () => clearTimeoutRef(), [clearTimeoutRef])

  const resetRound = useCallback((nextPairs: number) => {
    pairCountRef.current = nextPairs
    roundsStartedRef.current += 1
    setPairCount(nextPairs)
    setDeck(buildDeck(nextPairs))
    setRevealed([])
    setMatched([])
  }, [])

  const timer = useTimer({
    duration,
    onComplete: () => {
      clearTimeoutRef()
      if (activeStartRef.current !== null) {
        totalActiveMsRef.current += performance.now() - activeStartRef.current
        activeStartRef.current = null
      }

      const efficiency =
        totalFlipsRef.current === 0 ? 0 : pairsFoundRef.current / Math.max(totalFlipsRef.current / 2, 1)

      saveExerciseScore(
        scoreGridExercise({
          exerciseId: 'jogo-da-memoria',
          correctSelections: pairsFoundRef.current,
          totalSelections: Math.max(getTotalPairsSeen(roundsStartedRef.current), 1),
          consistencyOverride: Math.min(efficiency, 1),
          pauseCount: pauseCountRef.current,
          durationMs: totalActiveMsRef.current,
          totalDurationMs: duration * 1000,
          raw: {
            pairsFound: pairsFoundRef.current,
            totalFlips: totalFlipsRef.current,
          },
        }),
      )

      onComplete()
    },
  })

  const handleSelect = (index: number) => {
    if (!timer.isRunning || revealed.length === 2 || matched.includes(index) || revealed.includes(index)) {
      return
    }

    const nextRevealed = [...revealed, index]
    totalFlipsRef.current += 1
    setTotalFlips(totalFlipsRef.current)
    setRevealed(nextRevealed)

    if (nextRevealed.length < 2) {
      return
    }

    const [firstIndex, secondIndex] = nextRevealed
    const first = deck[firstIndex]
    const second = deck[secondIndex]

    if (first.symbol === second.symbol) {
      timeoutRef.current = window.setTimeout(() => {
        const nextMatched = [...matched, firstIndex, secondIndex]
        setMatched(nextMatched)
        setRevealed([])
        pairsFoundRef.current += 1
        setPairsFound(pairsFoundRef.current)
        timeoutRef.current = null

        if (nextMatched.length === deck.length) {
          resetRound(Math.min(pairCountRef.current + 1, MAX_PAIR_COUNT))
        }
      }, MATCH_FEEDBACK_DELAY_MS)
      return
    }

    timeoutRef.current = window.setTimeout(() => {
      setRevealed([])
      timeoutRef.current = null
    }, MISMATCH_FEEDBACK_DELAY_MS)
  }

  const handleStartPause = () => {
    if (timer.isRunning) {
      pauseCountRef.current += 1
      setPauseCount(pauseCountRef.current)
      clearTimeoutRef()
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
    clearTimeoutRef()
    pairCountRef.current = INITIAL_PAIR_COUNT
    roundsStartedRef.current = 1
    setPairCount(INITIAL_PAIR_COUNT)
    setDeck(buildDeck(INITIAL_PAIR_COUNT))
    setRevealed([])
    setMatched([])
    setTotalFlips(0)
    setPairsFound(0)
    setPauseCount(0)
    activeStartRef.current = null
    totalActiveMsRef.current = 0
    pauseCountRef.current = 0
    totalFlipsRef.current = 0
    pairsFoundRef.current = 0
    timer.reset()
  }

  const items = useMemo(
    () =>
      deck.map((card) => ({
        id: card.id,
        accentColor: '#22c55e',
        front: <div className="text-[clamp(1.8rem,4vw,2.8rem)] font-semibold text-white">{card.symbol}</div>,
        back: <div className="text-2xl font-semibold text-white/28">◆</div>,
      })),
    [deck],
  )

  return (
    <ExerciseFrame
      accentColor="#22c55e"
      timeLeftSeconds={timer.timeLeftSeconds}
      timerProgress={timer.progress}
      moduleProgress={deck.length === 0 ? 0 : (matched.length / deck.length) * 100}
      isRunning={timer.isRunning}
      onStartPause={handleStartPause}
      onRestart={handleRestart}
      footerAction={footerAction}
      metrics={
        <div className="grid gap-2 sm:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Pares: <span className="font-semibold text-slate-950">{pairsFound}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Flips: <span className="font-semibold text-slate-950">{totalFlips}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Grade: <span className="font-semibold text-slate-950">{pairCount * 2} cartas</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Pausas: <span className="font-semibold text-slate-950">{pauseCount}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Eficiência:{' '}
            <span className="font-semibold text-slate-950">
              {totalFlips > 0 ? `${Math.round((pairsFound / Math.max(totalFlips / 2, 1)) * 100)}%` : '0%'}
            </span>
          </div>
        </div>
      }
    >
      <ExerciseViewport>
        <div className="flex h-full min-h-0 w-full items-center justify-center rounded-[1.75rem] bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.12),_transparent_34%),linear-gradient(180deg,_#052e16_0%,_#0f172a_100%)] px-4 py-5">
          <div className="w-full max-w-[40rem]">
            <ExerciseGrid
              items={items}
              columns={4}
              onSelect={(index) => handleSelect(index)}
              revealedIndices={revealed}
              matchedIndices={matched}
              disabled={!timer.isRunning}
              flip
            />
          </div>
        </div>
      </ExerciseViewport>
    </ExerciseFrame>
  )
}
