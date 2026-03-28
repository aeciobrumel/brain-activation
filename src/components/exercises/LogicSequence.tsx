import { useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { scoreGridExercise } from '../../lib/scoring'
import { saveExerciseScore } from '../../lib/storage'
import { ExerciseChoices } from './ExerciseChoices'
import { ExerciseFrame } from './ExerciseFrame'
import { ExerciseViewport } from './ExerciseViewport'
import { ShapeToken } from './ShapeToken'
import { useTimer } from './hooks/useTimer'

interface ExerciseModuleProps {
  duration: number
  title: string
  onComplete: () => void
  footerAction?: ReactNode
}

type SequenceShape = 'circle' | 'square' | 'triangle'

interface LogicItem {
  id: string
  shape: SequenceShape
  color: string
  scale: number
}

interface LogicQuestion {
  items: LogicItem[]
  answer: LogicItem
  options: LogicItem[]
  correctIndex: number
}

const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b']
const SHAPES: SequenceShape[] = ['circle', 'square', 'triangle']
const SCALES = [0.78, 1, 1.18]
const MODULE_PROGRESS_TARGET = 12

function getLogicLevel(correctAnswers: number): 1 | 2 | 3 {
  if (correctAnswers < 4) {
    return 1
  }

  if (correctAnswers < 8) {
    return 2
  }

  return 3
}

function createLogicItem(id: string, shape: SequenceShape, color: string, scale: number): LogicItem {
  return { id, shape, color, scale }
}

function buildLogicQuestion(level: number): LogicQuestion {
  const baseShape = SHAPES[Math.floor(Math.random() * SHAPES.length)] ?? 'circle'
  const items: LogicItem[] = []

  for (let index = 0; index < 4; index += 1) {
    items.push(
      createLogicItem(
        `sequence-${index}`,
        level >= 2 ? SHAPES[index % SHAPES.length] ?? baseShape : baseShape,
        COLORS[index % COLORS.length] ?? COLORS[0],
        level >= 3 ? SCALES[index % SCALES.length] ?? 1 : 1,
      ),
    )
  }

  const answerShape = level >= 2 ? SHAPES[4 % SHAPES.length] ?? baseShape : baseShape
  const answerColor = COLORS[4 % COLORS.length] ?? COLORS[0]
  const answerScale = level >= 3 ? SCALES[4 % SCALES.length] ?? 1 : 1
  const answer = createLogicItem('option-answer', answerShape, answerColor, answerScale)

  const otherShape = SHAPES.find((shape) => shape !== answer.shape) ?? 'circle'
  const otherColor = COLORS.find((color) => color !== answer.color) ?? COLORS[0]
  const otherScale = SCALES.find((scale) => scale !== answer.scale) ?? 1

  const options: LogicItem[] = [
    answer,
    createLogicItem('option-color', answer.shape, otherColor, answer.scale),
    createLogicItem('option-shape', otherShape, answer.color, answer.scale),
    createLogicItem('option-scale', answer.shape, answer.color, otherScale),
  ].sort(() => Math.random() - 0.5)

  return {
    items,
    answer,
    options,
    correctIndex: options.findIndex((option) => option.id === answer.id),
  }
}

export function LogicSequence({ duration, onComplete, footerAction }: ExerciseModuleProps) {
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [totalAnswers, setTotalAnswers] = useState(0)
  const [averageReactionMs, setAverageReactionMs] = useState(0)
  const [pauseCount, setPauseCount] = useState(0)
  const [question, setQuestion] = useState<LogicQuestion>(() => buildLogicQuestion(1))

  const promptStartedAtRef = useRef<number | null>(null)
  const activeStartRef = useRef<number | null>(null)
  const totalActiveMsRef = useRef(0)
  const pauseCountRef = useRef(0)
  const totalAnswersRef = useRef(0)
  const correctAnswersRef = useRef(0)
  const averageReactionRef = useRef(0)

  const level = getLogicLevel(correctAnswers)

  const timer = useTimer({
    duration,
    onComplete: () => {
      if (activeStartRef.current !== null) {
        totalActiveMsRef.current += performance.now() - activeStartRef.current
        activeStartRef.current = null
      }

      saveExerciseScore(
        scoreGridExercise({
          exerciseId: 'sequencia-logica',
          correctSelections: correctAnswersRef.current,
          totalSelections: Math.max(totalAnswersRef.current, 1),
          averageReactionMs: averageReactionRef.current,
          pauseCount: pauseCountRef.current,
          durationMs: totalActiveMsRef.current,
          totalDurationMs: duration * 1000,
          raw: { level: getLogicLevel(correctAnswersRef.current) },
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

    const nextLevel = getLogicLevel(nextCorrectAnswers)
    setQuestion(buildLogicQuestion(nextLevel))
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
    setQuestion(buildLogicQuestion(1))
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
      moduleProgress={Math.min((correctAnswers / MODULE_PROGRESS_TARGET) * 100, 100)}
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
        <div className="grid h-full min-h-0 w-full grid-rows-[auto_minmax(0,1fr)] gap-5 rounded-[1.75rem] bg-[radial-gradient(circle_at_top,_rgba(139,92,246,0.12),_transparent_34%),linear-gradient(180deg,_#1e1b4b_0%,_#0f172a_100%)] px-4 py-5 text-white sm:px-6">
          <div className="flex items-center justify-center gap-3 rounded-[1.75rem] border border-white/10 bg-white/5 px-4 py-6">
            {question.items.map((item) => (
              <div key={item.id} className="grid place-items-center">
                <ShapeToken shape={item.shape} color={item.color} scale={item.scale} />
              </div>
            ))}
            <div className="text-3xl text-white/35">?</div>
          </div>
          <ExerciseChoices
            options={question.options.map((item) => ({
              label: `${item.shape} ${item.color}`,
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
