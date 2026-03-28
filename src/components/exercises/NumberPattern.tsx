import { useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { scoreGridExercise } from '../../lib/scoring'
import { saveExerciseScore } from '../../lib/storage'
import { ExerciseChoices } from './ExerciseChoices'
import { ExerciseFrame } from './ExerciseFrame'
import { ExerciseViewport } from './ExerciseViewport'
import { useTimer } from './hooks/useTimer'

interface ExerciseModuleProps {
  duration: number
  title: string
  onComplete: () => void
  footerAction?: ReactNode
}

interface PatternQuestion {
  sequence: number[]
  answer: number
  options: number[]
  rule: string
}

function uniqueOptions(answer: number, distractors: number[]) {
  return Array.from(new Set([answer, ...distractors])).slice(0, 4).sort(() => Math.random() - 0.5)
}

function buildQuestion(tier: number): PatternQuestion {
  switch (tier) {
    case 0: {
      const step = [2, 3, 5, 7][Math.floor(Math.random() * 4)] ?? 2
      const start = [4, 6, 8, 10, 12][Math.floor(Math.random() * 5)] ?? 4
      const sequence = Array.from({ length: 4 }, (_, index) => start + index * step)
      const answer = start + 4 * step
      return { sequence, answer, options: uniqueOptions(answer, [answer + 1, answer - step, answer + step]), rule: `+${step}` }
    }
    case 1: {
      const ratio = [2, 3][Math.floor(Math.random() * 2)] ?? 2
      const start = [2, 3, 4][Math.floor(Math.random() * 3)] ?? 2
      const sequence = Array.from({ length: 4 }, (_, index) => start * ratio ** index)
      const answer = start * ratio ** 4
      return { sequence, answer, options: uniqueOptions(answer, [answer / ratio, answer + ratio, answer - ratio]), rule: `x${ratio}` }
    }
    case 2: {
      const first = [1, 2, 3][Math.floor(Math.random() * 3)] ?? 1
      const second = [2, 3, 5][Math.floor(Math.random() * 3)] ?? 2
      const sequence = [first, second]
      while (sequence.length < 4) {
        sequence.push(sequence.at(-1)! + sequence.at(-2)!)
      }
      const answer = sequence.at(-1)! + sequence.at(-2)!
      return { sequence, answer, options: uniqueOptions(answer, [answer - 1, answer + 2, sequence.at(-1)! * 2]), rule: 'fibonacci' }
    }
    case 3: {
      const start = [3, 5, 7][Math.floor(Math.random() * 3)] ?? 3
      const sequence = [start]
      const deltas = [2, -1]
      while (sequence.length < 4) {
        sequence.push(sequence.at(-1)! + deltas[(sequence.length - 1) % deltas.length]!)
      }
      const answer = sequence.at(-1)! + deltas[(sequence.length - 1) % deltas.length]!
      return { sequence, answer, options: uniqueOptions(answer, [answer + 1, answer - 2, answer + 3]), rule: '+2 -1' }
    }
    default: {
      const sequence = [1, 4, 9, 16]
      const answer = 25
      return { sequence, answer, options: uniqueOptions(answer, [24, 26, 36]), rule: 'quadrado' }
    }
  }
}

export function NumberPattern({ duration, onComplete, footerAction }: ExerciseModuleProps) {
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [totalAnswers, setTotalAnswers] = useState(0)
  const [averageReactionMs, setAverageReactionMs] = useState(0)
  const [pauseCount, setPauseCount] = useState(0)
  const [lastRule, setLastRule] = useState<string | null>(null)
  const [question, setQuestion] = useState<PatternQuestion>(() => buildQuestion(0))

  const promptStartedAtRef = useRef<number | null>(null)
  const activeStartRef = useRef<number | null>(null)
  const totalActiveMsRef = useRef(0)
  const pauseCountRef = useRef(0)
  const totalAnswersRef = useRef(0)
  const correctAnswersRef = useRef(0)
  const averageReactionRef = useRef(0)

  const tier = Math.min(Math.floor(correctAnswers / 3), 4)

  const timer = useTimer({
    duration,
    onComplete: () => {
      if (activeStartRef.current !== null) {
        totalActiveMsRef.current += performance.now() - activeStartRef.current
        activeStartRef.current = null
      }

      saveExerciseScore(
        scoreGridExercise({
          exerciseId: 'padrao-numerico',
          correctSelections: correctAnswersRef.current,
          totalSelections: Math.max(totalAnswersRef.current, 1),
          averageReactionMs: averageReactionRef.current,
          pauseCount: pauseCountRef.current,
          durationMs: totalActiveMsRef.current,
          totalDurationMs: duration * 1000,
          raw: { tier: tier + 1 },
        }),
      )

      onComplete()
    },
  })

  const handleSelect = (index: number, event: React.MouseEvent<HTMLButtonElement>) => {
    if (!timer.isRunning || promptStartedAtRef.current === null) {
      return
    }

    totalAnswersRef.current += 1
    setTotalAnswers(totalAnswersRef.current)
    const reactionMs = event.timeStamp - promptStartedAtRef.current
    averageReactionRef.current =
      totalAnswersRef.current === 1
        ? reactionMs
        : (averageReactionRef.current * (totalAnswersRef.current - 1) + reactionMs) / totalAnswersRef.current
    setAverageReactionMs(averageReactionRef.current)

    let nextCorrectAnswers = correctAnswersRef.current

    if (question.options[index] === question.answer) {
      correctAnswersRef.current += 1
      setCorrectAnswers(correctAnswersRef.current)
      nextCorrectAnswers = correctAnswersRef.current
      setLastRule(null)
    } else {
      setLastRule(question.rule)
    }

    setQuestion(buildQuestion(Math.min(Math.floor(nextCorrectAnswers / 3), 4)))
    promptStartedAtRef.current = performance.now()
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
    setCorrectAnswers(0)
    setTotalAnswers(0)
    setAverageReactionMs(0)
    setPauseCount(0)
    setLastRule(null)
    setQuestion(buildQuestion(0))
    promptStartedAtRef.current = null
    activeStartRef.current = null
    totalActiveMsRef.current = 0
    pauseCountRef.current = 0
    totalAnswersRef.current = 0
    correctAnswersRef.current = 0
    averageReactionRef.current = 0
    timer.reset()
  }

  return (
    <ExerciseFrame
      accentColor="#8b5cf6"
      timeLeftSeconds={timer.timeLeftSeconds}
      timerProgress={timer.progress}
      moduleProgress={(correctAnswers / 12) * 100}
      isRunning={timer.isRunning}
      onStartPause={handleStartPause}
      onRestart={handleRestart}
      footerAction={footerAction}
      metrics={
        <div className="grid gap-2 sm:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Acertos: <span className="font-semibold text-slate-950">{correctAnswers}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Total: <span className="font-semibold text-slate-950">{totalAnswers}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Nível: <span className="font-semibold text-slate-950">{tier + 1}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Pausas: <span className="font-semibold text-slate-950">{pauseCount}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Média:{' '}
            <span className="font-semibold text-slate-950">
              {totalAnswers > 0 ? `${Math.round(averageReactionMs)} ms` : 'Sem respostas'}
            </span>
          </div>
        </div>
      }
    >
      <ExerciseViewport>
        <div className="grid h-full min-h-0 w-full grid-rows-[auto_minmax(0,1fr)] gap-5 rounded-[1.75rem] bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.12),_transparent_34%),linear-gradient(180deg,_#2e1065_0%,_#0f172a_100%)] px-4 py-5 text-white sm:px-6">
          <div className="grid gap-2 text-center">
            <div className="text-xs uppercase tracking-[0.28em] text-white/40">Descubra o próximo número</div>
            <div className="text-[clamp(2rem,5vw,3.5rem)] font-semibold tracking-[-0.04em]">
              {question.sequence.join(' · ')} · ?
            </div>
            {lastRule ? <div className="text-sm text-violet-200/75">Regra anterior: {lastRule}</div> : null}
          </div>
          <div className="flex min-h-0 items-center">
            <ExerciseChoices
              options={question.options.map((option) => ({ label: String(option) }))}
              onSelect={handleSelect}
              disabled={!timer.isRunning}
              accentColor="#8b5cf6"
            />
          </div>
        </div>
      </ExerciseViewport>
    </ExerciseFrame>
  )
}
