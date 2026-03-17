import { useCallback, useState } from 'react'

import { ExerciseFrame } from './ExerciseFrame'
import { ExerciseViewport } from './ExerciseViewport'
import { useProgress } from './hooks/useProgress'
import { useRandom } from './hooks/useRandom'
import { useTimer } from './hooks/useTimer'

interface ExerciseModuleProps {
  duration: number
  title: string
  onComplete: () => void
  footerAction?: React.ReactNode
}

const words = ['VERMELHO', 'AZUL', 'VERDE', 'AMARELO'] as const
const colors = [
  { id: 'red', label: 'Vermelho', value: '#ef4444' },
  { id: 'blue', label: 'Azul', value: '#3b82f6' },
  { id: 'green', label: 'Verde', value: '#22c55e' },
  { id: 'yellow', label: 'Amarelo', value: '#eab308' },
] as const

export function StroopTest({ duration, onComplete, footerAction }: ExerciseModuleProps) {
  const timer = useTimer({ duration, onComplete })
  const wordRandom = useRandom([...words])
  const colorRandom = useRandom([...colors])
  const progress = useProgress(8)
  const [roundStartedAt, setRoundStartedAt] = useState<number | null>(null)
  const [question, setQuestion] = useState({
    word: words[0] as (typeof words)[number],
    color: colors[1] as (typeof colors)[number],
  })
  const [averageReaction, setAverageReaction] = useState<number | null>(null)
  const [totalResponses, setTotalResponses] = useState(0)

  const nextQuestion = useCallback(() => {
    const nextWord = wordRandom.pick() ?? words[0]
    const pickedColor = colorRandom.pick() ?? colors[1]
    const nextColor =
      pickedColor.label.toUpperCase() === nextWord
        ? colors.find((entry) => entry.label.toUpperCase() !== nextWord) ?? colors[1]
        : pickedColor

    setQuestion({ word: nextWord, color: nextColor })
    setRoundStartedAt(timer.elapsedMs)
  }, [colorRandom, timer.elapsedMs, wordRandom])

  const handleAnswer = (colorId: string) => {
    if (!timer.isRunning || roundStartedAt === null) {
      return
    }

    const reaction = Math.max(timer.elapsedMs - roundStartedAt, 0)
    const nextTotal = totalResponses + 1
    const isCorrect = colorId === question.color.id

    setAverageReaction((current) => {
      if (current === null) {
        return reaction
      }

      return (current * totalResponses + reaction) / nextTotal
    })
    setTotalResponses(nextTotal)

    if (isCorrect) {
      progress.advance()
    }

    nextQuestion()
  }

  return (
    <ExerciseFrame
      accentColor="#8b5cf6"
      timeLeftSeconds={timer.timeLeftSeconds}
      timerProgress={timer.progress}
      moduleProgress={progress.percentage}
      isRunning={timer.isRunning}
      onStartPause={() => {
        if (timer.isRunning) {
          timer.pause()
          return
        }

        if (roundStartedAt === null) {
          nextQuestion()
        }

        timer.start()
      }}
      onRestart={() => {
        progress.reset()
        setAverageReaction(null)
        setTotalResponses(0)
        setRoundStartedAt(null)
        timer.reset()
      }}
      footerAction={footerAction}
      metrics={
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Acertos: <span className="font-semibold text-slate-950">{progress.current}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Tempo médio:{' '}
            <span className="font-semibold text-slate-950">
              {averageReaction ? `${Math.round(averageReaction)} ms` : 'Sem respostas'}
            </span>
          </div>
        </div>
      }
    >
      <ExerciseViewport>
        <div className="grid h-full min-h-0 w-full grid-rows-[auto_minmax(0,1fr)_auto] gap-3 text-center">
          <div className="flex items-center justify-center">
            <div className="rounded-full bg-white px-4 py-2 text-[clamp(0.72rem,0.9vw,0.85rem)] font-semibold uppercase tracking-[0.24em] text-slate-400 shadow-sm">
              Escolha a cor da tinta, não a palavra
            </div>
          </div>

          <div className="flex min-h-0 items-center justify-center rounded-[1.75rem] bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-6">
            <div
              className="break-words text-[clamp(2rem,7vw,4.75rem)] font-bold leading-none"
              style={{ color: question.color.value }}
            >
              {question.word}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            {colors.map((color) => (
              <button
                key={color.id}
                type="button"
                onClick={() => handleAnswer(color.id)}
                className="min-h-[3.25rem] rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 sm:min-h-[3.5rem]"
              >
                <span className="inline-flex items-center gap-2">
                  <span
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: color.value }}
                  />
                  {color.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </ExerciseViewport>
    </ExerciseFrame>
  )
}
