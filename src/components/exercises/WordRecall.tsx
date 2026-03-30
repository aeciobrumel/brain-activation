import { useCallback, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { scoreMemoryRecall } from '../../lib/scoring'
import { slugify } from '../../lib/helpers'
import { saveExerciseScore } from '../../lib/storage'
import { getPlayerDifficulty } from '../../lib/difficultyAdapter'
import { getRecentIds, markManyUsed } from '../../lib/repetitionGuard'
import { getWordList } from '../../data/wordBank'
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

const MEMORIZATION_MS = 30000
const TRANSITION_MS = 3000
const WORD_COUNT = 7

function pickWordList() {
  const difficulty = getPlayerDifficulty('lista-de-palavras')
  const exclude = getRecentIds('word-recall')
  const words = getWordList(difficulty, WORD_COUNT, exclude)
  markManyUsed('word-recall', words)
  return words
}

function normalizeWord(value: string) {
  return slugify(value)
}

export function WordRecall({ duration, onComplete, footerAction }: ExerciseModuleProps) {
  const [wordList, setWordList] = useState(() => pickWordList())
  const [guessedWords, setGuessedWords] = useState<string[]>([])
  const [correctInOrder, setCorrectInOrder] = useState(0)
  const [pauseCount, setPauseCount] = useState(0)
  const [statusMessage, setStatusMessage] = useState(
    'Observe a lista com calma. A fase de recall chega em seguida.',
  )

  const normalizedList = useMemo(() => wordList.map((word) => normalizeWord(word)), [wordList])
  const guessedSet = useMemo(() => new Set(guessedWords.map((word) => normalizeWord(word))), [guessedWords])

  const pauseCountRef = useRef(0)
  const activeStartRef = useRef<number | null>(null)
  const totalActiveMsRef = useRef(0)
  const orderIndexRef = useRef(0)

  const handleComplete = useCallback(() => {
    if (activeStartRef.current !== null) {
      totalActiveMsRef.current += performance.now() - activeStartRef.current
      activeStartRef.current = null
    }

    saveExerciseScore(
      scoreMemoryRecall({
        exerciseId: 'lista-de-palavras',
        correctAnswers: guessedWords.length,
        totalPrompts: wordList.length,
        correctInOrder,
        pauseCount: pauseCountRef.current,
        durationMs: totalActiveMsRef.current,
        totalDurationMs: duration * 1000,
      }),
    )

    onComplete()
  }, [correctInOrder, duration, guessedWords.length, onComplete, wordList.length])

  const timer = useTimer({ duration, onComplete: handleComplete })

  const phase = useMemo(() => {
    if (timer.elapsedMs < MEMORIZATION_MS) {
      return 'memorize' as const
    }
    if (timer.elapsedMs < MEMORIZATION_MS + TRANSITION_MS) {
      return 'transition' as const
    }
    return 'recall' as const
  }, [timer.elapsedMs])

  const wordIndex = Math.min(Math.floor(timer.elapsedMs / 4000), wordList.length - 1)
  const currentWord = wordList[wordIndex] ?? wordList[0]
  const transitionSeconds = Math.max(
    Math.ceil((MEMORIZATION_MS + TRANSITION_MS - timer.elapsedMs) / 1000),
    0,
  )

  const input = useTextInput({
    onSubmit: (rawValue) => {
      if (!timer.isRunning || phase !== 'recall') {
        return false
      }

      const normalizedGuess = normalizeWord(rawValue)
      if (guessedSet.has(normalizedGuess)) {
        setStatusMessage('Essa palavra ja foi enviada.')
        return false
      }

      const foundIndex = normalizedList.indexOf(normalizedGuess)
      if (foundIndex === -1) {
        setStatusMessage('Nao entrou na lista. Tente outra lembranca.')
        return false
      }

      setGuessedWords((current) => [...current, wordList[foundIndex]])

      if (normalizedGuess === normalizedList[orderIndexRef.current]) {
        orderIndexRef.current += 1
        setCorrectInOrder(orderIndexRef.current)
      }

      setStatusMessage('Boa. Continue esvaziando a memoria de curto prazo.')
      return true
    },
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

    activeStartRef.current = performance.now()
    timer.start()
  }

  const handleRestart = () => {
    setWordList(pickWordList())
    setGuessedWords([])
    setCorrectInOrder(0)
    setPauseCount(0)
    setStatusMessage('Observe a lista com calma. A fase de recall chega em seguida.')
    pauseCountRef.current = 0
    activeStartRef.current = null
    totalActiveMsRef.current = 0
    orderIndexRef.current = 0
    input.setValue('')
    timer.reset()
  }

  return (
    <ExerciseFrame
      accentColor="#22c55e"
      timeLeftSeconds={timer.timeLeftSeconds}
      timerProgress={timer.progress}
      moduleProgress={(guessedWords.length / wordList.length) * 100}
      isRunning={timer.isRunning}
      onStartPause={handleStartPause}
      onRestart={handleRestart}
      footerAction={footerAction}
      metrics={
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Lembradas: <span className="font-semibold text-slate-950">{guessedWords.length} / {wordList.length}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Na ordem: <span className="font-semibold text-slate-950">{correctInOrder}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Pausas: <span className="font-semibold text-slate-950">{pauseCount}</span>
          </div>
        </div>
      }
    >
      <ExerciseViewport>
        <div className="grid h-full min-h-0 w-full grid-rows-[minmax(0,1fr)_auto] gap-4 rounded-[1.75rem] bg-[radial-gradient(circle_at_top,_rgba(34,197,94,0.16),_transparent_34%),linear-gradient(180deg,_#052e16_0%,_#0f172a_100%)] px-4 py-5 text-white sm:px-6">
          <div className="flex min-h-0 flex-col items-center justify-center gap-5 text-center">
            {phase === 'memorize' ? (
              <>
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200/60">
                  Memorizacao
                </div>
                <div className="font-display text-[clamp(2.4rem,7vw,5rem)] tracking-[-0.04em]">
                  {timer.elapsedMs < 28000 ? currentWord : 'Fixe a lista'}
                </div>
                <div className="max-w-xl text-sm leading-7 text-white/55">
                  Observe uma palavra por vez. Forme uma cena simples para cada termo.
                </div>
              </>
            ) : phase === 'transition' ? (
              <>
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200/60">
                  Transicao
                </div>
                <div className="text-[clamp(3rem,8vw,5rem)] font-semibold tracking-[-0.04em]">
                  {transitionSeconds}
                </div>
                <div className="max-w-xl text-sm leading-7 text-white/55">
                  Agora lembre-se da lista sem ajuda visual.
                </div>
              </>
            ) : (
              <>
                <div className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200/60">
                  Recall
                </div>
                <div className="max-w-xl text-sm leading-7 text-white/60">{statusMessage}</div>
                <div className="flex max-w-3xl flex-wrap justify-center gap-2">
                  {guessedWords.length > 0 ? (
                    guessedWords.map((word) => (
                      <span
                        key={word}
                        className="rounded-full bg-emerald-500/16 px-3 py-2 text-sm font-medium text-emerald-100"
                      >
                        {word}
                      </span>
                    ))
                  ) : (
                    <div className="text-sm leading-7 text-white/35">
                      As palavras lembradas aparecem aqui.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {phase === 'recall' ? (
            <ExerciseInput
              value={input.value}
              onChange={input.setValue}
              onKeyDown={input.handleKeyDown}
              onSubmit={input.submit}
              feedback={input.feedback}
              disabled={!timer.isRunning}
              placeholder="Digite uma palavra que voce lembra"
            />
          ) : null}
        </div>
      </ExerciseViewport>
    </ExerciseFrame>
  )
}
