import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { saveExerciseScore } from '../../lib/storage'
import { scoreReactionExercise } from '../../lib/scoring'
import { ExerciseFrame } from './ExerciseFrame'
import { ExerciseViewport } from './ExerciseViewport'
import { useTimer } from './hooks/useTimer'

interface ExerciseModuleProps {
  duration: number
  title: string
  onComplete: () => void
  footerAction?: ReactNode
}

type Choice = 'par' | 'impar'
type FeedbackState = 'idle' | 'correct' | 'wrong'

function randomNumber() {
  return Math.floor(Math.random() * 99) + 1
}

export function OddEven({ duration, onComplete, footerAction }: ExerciseModuleProps) {
  const [currentNumber, setCurrentNumber] = useState<number | null>(null)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [wrongAnswers, setWrongAnswers] = useState(0)
  const [averageReaction, setAverageReaction] = useState<number>(0)
  const [feedback, setFeedback] = useState<FeedbackState>('idle')
  const [lastChoice, setLastChoice] = useState<Choice | null>(null)
  const [pauseCount, setPauseCount] = useState(0)

  const promptStartedAtRef = useRef<number | null>(null)
  const feedbackTimeoutRef = useRef<number | null>(null)
  const pauseCountRef = useRef(0)
  const activeStartRef = useRef<number | null>(null)
  const totalActiveMsRef = useRef(0)
  const correctAnswersRef = useRef(0)
  const wrongAnswersRef = useRef(0)
  const averageReactionRef = useRef(0)

  const showNextNumber = useCallback(() => {
    const nextNumber = randomNumber()
    setCurrentNumber(nextNumber)
    promptStartedAtRef.current = performance.now()
  }, [])

  const clearFeedbackTimeout = useCallback(() => {
    if (feedbackTimeoutRef.current !== null) {
      window.clearTimeout(feedbackTimeoutRef.current)
      feedbackTimeoutRef.current = null
    }
  }, [])

  useEffect(() => () => clearFeedbackTimeout(), [clearFeedbackTimeout])

  const handleComplete = useCallback(() => {
    clearFeedbackTimeout()

    if (activeStartRef.current !== null) {
      totalActiveMsRef.current += performance.now() - activeStartRef.current
      activeStartRef.current = null
    }

    saveExerciseScore(
      scoreReactionExercise({
        exerciseId: 'par-ou-impar',
        correctResponses: correctAnswersRef.current,
        totalResponses: correctAnswersRef.current + wrongAnswersRef.current,
        averageReactionMs: averageReactionRef.current,
        pauseCount: pauseCountRef.current,
        durationMs: totalActiveMsRef.current,
        totalDurationMs: duration * 1000,
      }),
    )

    onComplete()
  }, [clearFeedbackTimeout, duration, onComplete])

  const timer = useTimer({ duration, onComplete: handleComplete })

  const handleAnswer = (choice: Choice, event: React.MouseEvent<HTMLButtonElement>) => {
    if (!timer.isRunning || currentNumber === null || promptStartedAtRef.current === null) {
      return
    }

    const reactionMs = event.timeStamp - promptStartedAtRef.current
    const isCorrect =
      (currentNumber % 2 === 0 && choice === 'par') ||
      (currentNumber % 2 !== 0 && choice === 'impar')
    const totalResponses = correctAnswersRef.current + wrongAnswersRef.current + 1

    const nextAverage =
      totalResponses === 1
        ? reactionMs
        : (averageReactionRef.current * (totalResponses - 1) + reactionMs) / totalResponses

    averageReactionRef.current = nextAverage
    setAverageReaction(nextAverage)
    setLastChoice(choice)
    setFeedback(isCorrect ? 'correct' : 'wrong')

    if (isCorrect) {
      correctAnswersRef.current += 1
      setCorrectAnswers(correctAnswersRef.current)
    } else {
      wrongAnswersRef.current += 1
      setWrongAnswers(wrongAnswersRef.current)
    }

    clearFeedbackTimeout()
    feedbackTimeoutRef.current = window.setTimeout(
      () => {
        setFeedback('idle')
        feedbackTimeoutRef.current = null
      },
      correctAnswersRef.current >= 10 ? 140 : 220,
    )

    showNextNumber()
  }

  const handleStartPause = () => {
    if (timer.isRunning) {
      clearFeedbackTimeout()
      setFeedback('idle')
      pauseCountRef.current += 1
      setPauseCount(pauseCountRef.current)

      if (activeStartRef.current !== null) {
        totalActiveMsRef.current += performance.now() - activeStartRef.current
        activeStartRef.current = null
      }

      timer.pause()
      return
    }

    if (currentNumber === null) {
      showNextNumber()
    } else {
      promptStartedAtRef.current = performance.now()
    }

    activeStartRef.current = performance.now()
    timer.start()
  }

  const handleRestart = () => {
    clearFeedbackTimeout()
    setCurrentNumber(null)
    setCorrectAnswers(0)
    setWrongAnswers(0)
    setAverageReaction(0)
    setFeedback('idle')
    setLastChoice(null)
    setPauseCount(0)
    promptStartedAtRef.current = null
    pauseCountRef.current = 0
    activeStartRef.current = null
    totalActiveMsRef.current = 0
    correctAnswersRef.current = 0
    wrongAnswersRef.current = 0
    averageReactionRef.current = 0
    timer.reset()
  }

  const totalResponses = correctAnswers + wrongAnswers

  return (
    <ExerciseFrame
      accentColor="#ef4444"
      timeLeftSeconds={timer.timeLeftSeconds}
      timerProgress={timer.progress}
      moduleProgress={Math.min((correctAnswers / 10) * 100, 100)}
      isRunning={timer.isRunning}
      onStartPause={handleStartPause}
      onRestart={handleRestart}
      footerAction={footerAction}
      metrics={
        <div className="grid gap-2 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Acertos: <span className="font-semibold text-slate-950">{correctAnswers}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Erros: <span className="font-semibold text-slate-950">{wrongAnswers}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Pausas: <span className="font-semibold text-slate-950">{pauseCount}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Média:{' '}
            <span className="font-semibold text-slate-950">
              {totalResponses > 0 ? `${Math.round(averageReaction)} ms` : 'Sem respostas'}
            </span>
          </div>
        </div>
      }
    >
      <ExerciseViewport>
        <div className="grid h-full min-h-0 w-full grid-rows-[auto_minmax(0,1fr)_auto] gap-4 rounded-[1.75rem] bg-slate-950 px-4 py-5 text-white sm:px-6">
          <div className="text-center">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-white/45">
              Classifique o número o mais rápido possível
            </div>
          </div>

          <div className="flex min-h-0 items-center justify-center">
            <div className="text-[clamp(4rem,14vw,8rem)] font-semibold tracking-[-0.04em]">
              {currentNumber ?? '—'}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {([
              { id: 'par', label: 'PAR' },
              { id: 'impar', label: 'ÍMPAR' },
            ] as const).map((choice) => {
              const isSelected = lastChoice === choice.id
              const isCorrect = feedback === 'correct' && isSelected
              const isWrong = feedback === 'wrong' && isSelected

              return (
                <button
                  key={choice.id}
                  type="button"
                  onClick={(event) => handleAnswer(choice.id, event)}
                  className="min-h-[4.25rem] rounded-[1.5rem] border px-4 py-4 text-base font-semibold transition"
                  style={{
                    borderColor: isCorrect ? '#4ade80' : isWrong ? '#fb7185' : 'rgba(255,255,255,0.12)',
                    backgroundColor: isCorrect
                      ? 'rgba(34,197,94,0.2)'
                      : isWrong
                        ? 'rgba(244,63,94,0.18)'
                        : 'rgba(255,255,255,0.06)',
                    transform: isSelected ? 'scale(0.98)' : 'scale(1)',
                  }}
                >
                  {choice.label}
                </button>
              )
            })}
          </div>
        </div>
      </ExerciseViewport>
    </ExerciseFrame>
  )
}
