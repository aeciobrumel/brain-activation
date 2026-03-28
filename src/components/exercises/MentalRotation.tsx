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

const LETTERS = ['F', 'R', 'P', 'J', 'G']

interface RotationOption {
  rotation: number
  mirrored?: boolean
}

interface RotationQuestion {
  letter: string
  target: RotationOption
  options: RotationOption[]
  correctIndex: number
}

function buildRotationQuestion(level: number): RotationQuestion {
  const baseRotations = level === 1 ? [0, 90, 180, 270] : [0, 45, 90, 180]
  const letter = LETTERS[Math.floor(Math.random() * LETTERS.length)] ?? 'F'
  const correct = { rotation: baseRotations[Math.floor(Math.random() * baseRotations.length)] ?? 0 }
  const options: RotationOption[] = [
    correct,
    { rotation: baseRotations[(baseRotations.indexOf(correct.rotation) + 1) % baseRotations.length] ?? 90 },
    { rotation: baseRotations[(baseRotations.indexOf(correct.rotation) + 2) % baseRotations.length] ?? 180 },
    level >= 3 ? { rotation: correct.rotation, mirrored: true } : { rotation: baseRotations[(baseRotations.indexOf(correct.rotation) + 3) % baseRotations.length] ?? 270 },
  ].sort(() => Math.random() - 0.5)

  return {
    letter,
    target: correct,
    options,
    correctIndex: options.findIndex((option) => option.rotation === correct.rotation && option.mirrored !== true),
  }
}

function RenderGlyph({ letter, rotation, mirrored = false }: { letter: string; rotation: number; mirrored?: boolean }) {
  return (
    <div
      className="text-[clamp(2.6rem,6vw,4rem)] font-black leading-none text-white"
      style={{ transform: `rotate(${rotation}deg) scaleX(${mirrored ? -1 : 1})` }}
    >
      {letter}
    </div>
  )
}

export function MentalRotation({ duration, onComplete, footerAction }: ExerciseModuleProps) {
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [totalAnswers, setTotalAnswers] = useState(0)
  const [averageReactionMs, setAverageReactionMs] = useState(0)
  const [pauseCount, setPauseCount] = useState(0)
  const [question, setQuestion] = useState<RotationQuestion>(() => buildRotationQuestion(1))

  const promptStartedAtRef = useRef<number | null>(null)
  const activeStartRef = useRef<number | null>(null)
  const totalActiveMsRef = useRef(0)
  const pauseCountRef = useRef(0)
  const totalAnswersRef = useRef(0)
  const correctAnswersRef = useRef(0)
  const averageReactionRef = useRef(0)

  const level = Math.min(correctAnswers < 4 ? 1 : correctAnswers < 8 ? 2 : 3, 3)

  const timer = useTimer({
    duration,
    onComplete: () => {
      if (activeStartRef.current !== null) {
        totalActiveMsRef.current += performance.now() - activeStartRef.current
        activeStartRef.current = null
      }

      saveExerciseScore(
        scoreGridExercise({
          exerciseId: 'rotacao-mental',
          correctSelections: correctAnswersRef.current,
          totalSelections: Math.max(totalAnswersRef.current, 1),
          averageReactionMs: averageReactionRef.current,
          pauseCount: pauseCountRef.current,
          durationMs: totalActiveMsRef.current,
          totalDurationMs: duration * 1000,
          raw: { level },
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

    if (index === question.correctIndex) {
      correctAnswersRef.current += 1
      setCorrectAnswers(correctAnswersRef.current)
      nextCorrectAnswers = correctAnswersRef.current
    }

    const nextLevel = Math.min(nextCorrectAnswers < 4 ? 1 : nextCorrectAnswers < 8 ? 2 : 3, 3)
    setQuestion(buildRotationQuestion(nextLevel))
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
    setQuestion(buildRotationQuestion(1))
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
            Nível: <span className="font-semibold text-slate-950">{level}</span>
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
        <div className="grid h-full min-h-0 w-full grid-rows-[auto_minmax(0,1fr)] gap-5 rounded-[1.75rem] bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.12),_transparent_34%),linear-gradient(180deg,_#312e81_0%,_#0f172a_100%)] px-4 py-5 text-white sm:px-6">
          <div className="grid place-items-center rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-6">
            <RenderGlyph letter={question.letter} rotation={question.target.rotation} />
          </div>
          <ExerciseChoices
            options={question.options.map((option) => ({
              label: `${option.mirrored ? 'Espelhada' : 'Rotação'} ${option.rotation}°`,
              description: '',
            }))}
            onSelect={handleSelect}
            disabled={!timer.isRunning}
            accentColor="#8b5cf6"
          />
        </div>
      </ExerciseViewport>
    </ExerciseFrame>
  )
}
