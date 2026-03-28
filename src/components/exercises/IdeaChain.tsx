import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { scoreCreativity } from '../../lib/scoring'
import { saveExerciseScore } from '../../lib/storage'
import { ExerciseFrame } from './ExerciseFrame'
import { ExerciseInput } from './ExerciseInput'
import { ExerciseViewport } from './ExerciseViewport'
import { usePromptCountdown } from './hooks/usePromptCountdown'
import { useTextInput } from './hooks/useTextInput'
import { useTimer } from './hooks/useTimer'

interface ExerciseModuleProps {
  duration: number
  title: string
  onComplete: () => void
  footerAction?: ReactNode
}

interface TrailEntry {
  word: string
  broken?: boolean
}

const SEED_WORDS = ['OCEANO', 'FOGO', 'SOMBRA', 'CRISTAL', 'VENTO', 'RAIZ', 'SILENCIO', 'METAL']

function pickSeed() {
  return SEED_WORDS[Math.floor(Math.random() * SEED_WORDS.length)] ?? SEED_WORDS[0]
}

export function IdeaChain({ duration, onComplete, footerAction }: ExerciseModuleProps) {
  const [currentWord, setCurrentWord] = useState(() => pickSeed())
  const [trail, setTrail] = useState<TrailEntry[]>([])
  const [totalLinks, setTotalLinks] = useState(0)
  const [currentChain, setCurrentChain] = useState(0)
  const [longestChain, setLongestChain] = useState(0)
  const [averageResponseMs, setAverageResponseMs] = useState(0)
  const [pauseCount, setPauseCount] = useState(0)
  const [statusMessage, setStatusMessage] = useState(
    'Associe livremente. Cada resposta vira a proxima palavra.',
  )

  const hasStartedRef = useRef(false)
  const promptStartedAtRef = useRef<number | null>(null)
  const pauseCountRef = useRef(0)
  const activeStartRef = useRef<number | null>(null)
  const totalActiveMsRef = useRef(0)
  const totalLinksRef = useRef(0)
  const longestChainRef = useRef(0)
  const responseCountRef = useRef(0)
  const averageResponseRef = useRef(0)
  const restartPromptCountdownRef = useRef<() => void>(() => {})

  const handleBreak = useCallback(() => {
    setTrail((current) => [...current.slice(-4), { word: `${currentWord} · quebra`, broken: true }])
    setCurrentWord(pickSeed())
    setCurrentChain(0)
    setStatusMessage('A cadeia quebrou. Recomece rapido com uma nova ancora.')
    promptStartedAtRef.current = performance.now()
    restartPromptCountdownRef.current()
  }, [currentWord])

  const {
    progress: promptProgress,
    start: startPromptCountdown,
    pause: pausePromptCountdown,
    resume: resumePromptCountdown,
    reset: resetPromptCountdown,
  } = usePromptCountdown({
    durationMs: 5000,
    onExpire: handleBreak,
  })

  useEffect(() => {
    restartPromptCountdownRef.current = () => startPromptCountdown(5000)
  }, [startPromptCountdown])

  const timer = useTimer({
    duration,
    onComplete: () => {
      if (activeStartRef.current !== null) {
        totalActiveMsRef.current += performance.now() - activeStartRef.current
        activeStartRef.current = null
      }

      saveExerciseScore(
        scoreCreativity({
          exerciseId: 'cadeia-de-ideias',
          totalOutputs: totalLinksRef.current,
          targetOutputs: Math.max(Math.floor(duration / 5), 1),
          qualityOutputs: longestChainRef.current,
          pauseCount: pauseCountRef.current,
          durationMs: totalActiveMsRef.current,
          totalDurationMs: duration * 1000,
        }),
      )

      onComplete()
    },
  })

  const input = useTextInput({
    onSubmit: (rawValue) => {
      if (!timer.isRunning) {
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

      totalLinksRef.current += 1
      setTotalLinks(totalLinksRef.current)
      setTrail((current) => [...current.slice(-4), { word: currentWord }])
      setCurrentWord(rawValue.toUpperCase())
      setCurrentChain((previous) => {
        const nextValue = previous + 1
        if (nextValue > longestChainRef.current) {
          longestChainRef.current = nextValue
          setLongestChain(nextValue)
        }
        return nextValue
      })
      setStatusMessage('Boa. Continue conectando sem travar.')
      promptStartedAtRef.current = performance.now()
      startPromptCountdown(5000)
      return true
    },
  })

  const handleStartPause = () => {
    if (timer.isRunning) {
      pauseCountRef.current += 1
      setPauseCount(pauseCountRef.current)
      pausePromptCountdown()

      if (activeStartRef.current !== null) {
        totalActiveMsRef.current += performance.now() - activeStartRef.current
        activeStartRef.current = null
      }

      timer.pause()
      return
    }

    promptStartedAtRef.current = performance.now()
    activeStartRef.current = performance.now()

    if (!hasStartedRef.current) {
      hasStartedRef.current = true
      startPromptCountdown(5000)
    } else {
      resumePromptCountdown()
    }

    timer.start()
  }

  const handleRestart = () => {
    hasStartedRef.current = false
    setCurrentWord(pickSeed())
    setTrail([])
    setTotalLinks(0)
    setCurrentChain(0)
    setLongestChain(0)
    setAverageResponseMs(0)
    setPauseCount(0)
    setStatusMessage('Associe livremente. Cada resposta vira a proxima palavra.')
    promptStartedAtRef.current = null
    pauseCountRef.current = 0
    activeStartRef.current = null
    totalActiveMsRef.current = 0
    totalLinksRef.current = 0
    longestChainRef.current = 0
    responseCountRef.current = 0
    averageResponseRef.current = 0
    input.setValue('')
    resetPromptCountdown(5000)
    timer.reset()
  }

  const visibleTrail = useMemo(() => trail.slice(-5).reverse(), [trail])

  return (
    <ExerciseFrame
      accentColor="#ec4899"
      timeLeftSeconds={timer.timeLeftSeconds}
      timerProgress={timer.progress}
      moduleProgress={Math.min((totalLinks / Math.max(Math.floor(duration / 5), 1)) * 100, 100)}
      isRunning={timer.isRunning}
      onStartPause={handleStartPause}
      onRestart={handleRestart}
      footerAction={footerAction}
      metrics={
        <div className="grid gap-2 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Links: <span className="font-semibold text-slate-950">{totalLinks}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Melhor cadeia: <span className="font-semibold text-slate-950">{longestChain}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Pausas: <span className="font-semibold text-slate-950">{pauseCount}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Media:{' '}
            <span className="font-semibold text-slate-950">
              {totalLinks > 0 ? `${Math.round(averageResponseMs)} ms` : 'Sem links'}
            </span>
          </div>
        </div>
      }
    >
      <ExerciseViewport>
        <div className="grid h-full min-h-0 w-full grid-rows-[auto_minmax(0,1fr)_auto] gap-4 rounded-[1.75rem] bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.12),_transparent_36%),linear-gradient(180deg,_#111827_0%,_#020617_100%)] px-4 py-5 text-white sm:px-6">
          <div className="text-center">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-white/35">
              Palavra atual
            </div>
            <div className="mt-3 text-[clamp(2.25rem,7vw,4.8rem)] font-semibold tracking-[-0.05em]">
              {currentWord}
            </div>
          </div>

          <div className="grid min-h-0 gap-4 lg:grid-cols-[0.42fr_0.58fr]">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-5">
              <div className="text-sm uppercase tracking-[0.22em] text-pink-200/70">Ritmo</div>
              <div className="mt-3 text-sm leading-7 text-white/55">{statusMessage}</div>
              <div className="mt-4 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.22em] text-white/40">
                Cadeia atual {currentChain}
              </div>
              <div className="mt-5">
                <div className="mb-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/35">
                  Tempo por link
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full transition-[width] duration-100"
                    style={{
                      width: `${promptProgress}%`,
                      backgroundColor: '#ec4899',
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="min-h-0 rounded-[1.5rem] border border-white/10 bg-black/15 px-5 py-5">
              <div className="text-sm uppercase tracking-[0.22em] text-white/35">Trail</div>
              <div className="mt-4 flex min-h-[12rem] flex-col justify-end gap-2 overflow-y-auto">
                {visibleTrail.length > 0 ? (
                  visibleTrail.map((entry, index) => (
                    <div
                      key={`${entry.word}-${index}`}
                      className="rounded-2xl px-4 py-3 text-sm font-medium"
                      style={{
                        opacity: 1 - index * 0.16,
                        backgroundColor: entry.broken
                          ? 'rgba(244,63,94,0.15)'
                          : 'rgba(255,255,255,0.05)',
                        color: entry.broken ? '#fda4af' : '#ffffff',
                      }}
                    >
                      {entry.word}
                    </div>
                  ))
                ) : (
                  <div className="text-sm leading-7 text-white/35">
                    As ultimas conexoes aparecem aqui em ordem decrescente.
                  </div>
                )}
              </div>
            </div>
          </div>

          <ExerciseInput
            value={input.value}
            onChange={input.setValue}
            onKeyDown={input.handleKeyDown}
            onSubmit={input.submit}
            feedback={input.feedback}
            disabled={!timer.isRunning}
            placeholder={timer.isRunning ? 'Digite a proxima associacao' : 'Inicie o exercicio para associar'}
          />
        </div>
      </ExerciseViewport>
    </ExerciseFrame>
  )
}
