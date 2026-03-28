import { useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { scoreGridExercise } from '../../lib/scoring'
import { saveExerciseScore } from '../../lib/storage'
import { ExerciseChoices } from './ExerciseChoices'
import { ExerciseFrame } from './ExerciseFrame'
import { ExerciseViewport } from './ExerciseViewport'
import { usePromptCountdown } from './hooks/usePromptCountdown'
import { useTimer } from './hooks/useTimer'

interface ExerciseModuleProps {
  duration: number
  title: string
  onComplete: () => void
  footerAction?: ReactNode
}

interface AnalogyQuestion {
  a: string
  b: string
  c: string
  answer: string
  options: string[]
}

const ANALOGIES: AnalogyQuestion[] = [
  { a: 'OLHO', b: 'CAMERA', c: 'OUVIDO', answer: 'MICROFONE', options: ['MICROFONE', 'RADIO', 'ANTENA', 'CAIXA'] },
  { a: 'PEIXE', b: 'AGUA', c: 'PASSARO', answer: 'AR', options: ['AR', 'NINHO', 'ASA', 'VENTO'] },
  { a: 'PINTOR', b: 'PINCEL', c: 'ESCRITOR', answer: 'CANETA', options: ['CANETA', 'LIVRO', 'PAPEL', 'TINTA'] },
  { a: 'DIA', b: 'NOITE', c: 'VERAO', answer: 'INVERNO', options: ['INVERNO', 'CHUVA', 'OUTONO', 'JANEIRO'] },
  { a: 'MOTOR', b: 'CARRO', c: 'CORACAO', answer: 'CORPO', options: ['CORPO', 'SANGUE', 'PULMAO', 'PEITO'] },
  { a: 'CHAVE', b: 'PORTA', c: 'SENHA', answer: 'CONTA', options: ['CONTA', 'CELULAR', 'TECLADO', 'SITE'] },
]

function nextAnalogy(index: number) {
  return ANALOGIES[index % ANALOGIES.length] ?? ANALOGIES[0]
}

export function RapidAnalogies({ duration, onComplete, footerAction }: ExerciseModuleProps) {
  const [questionIndex, setQuestionIndex] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [totalAnswers, setTotalAnswers] = useState(0)
  const [streak, setStreak] = useState(0)
  const [maxStreak, setMaxStreak] = useState(0)
  const [averageReactionMs, setAverageReactionMs] = useState(0)
  const [pauseCount, setPauseCount] = useState(0)

  const promptStartedAtRef = useRef<number | null>(null)
  const activeStartRef = useRef<number | null>(null)
  const totalActiveMsRef = useRef(0)
  const pauseCountRef = useRef(0)
  const totalAnswersRef = useRef(0)
  const correctAnswersRef = useRef(0)
  const averageReactionRef = useRef(0)
  const maxStreakRef = useRef(0)

  const question = nextAnalogy(questionIndex)

  const countdown = usePromptCountdown({
    durationMs: 8000,
    onExpire: () => {
      totalAnswersRef.current += 1
      setTotalAnswers(totalAnswersRef.current)
      setStreak(0)
      setQuestionIndex((current) => current + 1)
      countdown.start(8000)
      promptStartedAtRef.current = timer.elapsedMs
    },
  })

  const timer = useTimer({
    duration,
    onComplete: () => {
      if (activeStartRef.current !== null) {
        totalActiveMsRef.current += performance.now() - activeStartRef.current
        activeStartRef.current = null
      }

      saveExerciseScore(
        scoreGridExercise({
          exerciseId: 'analogias-rapidas',
          correctSelections: correctAnswersRef.current,
          totalSelections: Math.max(totalAnswersRef.current, 1),
          averageReactionMs: averageReactionRef.current,
          pauseCount: pauseCountRef.current,
          durationMs: totalActiveMsRef.current,
          totalDurationMs: duration * 1000,
          raw: { maxStreak: maxStreakRef.current },
        }),
      )

      onComplete()
    },
  })

  const handleSelect = (index: number) => {
    if (!timer.isRunning || promptStartedAtRef.current === null) {
      return
    }

    totalAnswersRef.current += 1
    setTotalAnswers(totalAnswersRef.current)
    const reactionMs = Math.max(timer.elapsedMs - promptStartedAtRef.current, 0)
    averageReactionRef.current =
      totalAnswersRef.current === 1
        ? reactionMs
        : (averageReactionRef.current * (totalAnswersRef.current - 1) + reactionMs) / totalAnswersRef.current
    setAverageReactionMs(averageReactionRef.current)

    if (question.options[index] === question.answer) {
      correctAnswersRef.current += 1
      setCorrectAnswers(correctAnswersRef.current)
      setStreak((current) => {
        const next = current + 1
        maxStreakRef.current = Math.max(maxStreakRef.current, next)
        setMaxStreak(maxStreakRef.current)
        return next
      })
    } else {
      setStreak(0)
    }

    setQuestionIndex((current) => current + 1)
    countdown.start(8000)
    promptStartedAtRef.current = timer.elapsedMs
  }

  const handleStartPause = () => {
    if (timer.isRunning) {
      pauseCountRef.current += 1
      setPauseCount(pauseCountRef.current)
      countdown.pause()
      if (activeStartRef.current !== null) {
        totalActiveMsRef.current += timer.elapsedMs - activeStartRef.current
        activeStartRef.current = null
      }
      timer.pause()
      return
    }

    promptStartedAtRef.current = timer.elapsedMs
    activeStartRef.current = timer.elapsedMs
    countdown.start(8000)
    timer.start()
  }

  const handleRestart = () => {
    setQuestionIndex(0)
    setCorrectAnswers(0)
    setTotalAnswers(0)
    setStreak(0)
    setMaxStreak(0)
    setAverageReactionMs(0)
    setPauseCount(0)
    promptStartedAtRef.current = null
    activeStartRef.current = null
    totalActiveMsRef.current = 0
    pauseCountRef.current = 0
    totalAnswersRef.current = 0
    correctAnswersRef.current = 0
    averageReactionRef.current = 0
    maxStreakRef.current = 0
    countdown.reset(8000)
    timer.reset()
  }

  return (
    <ExerciseFrame
      accentColor="#ec4899"
      timeLeftSeconds={timer.timeLeftSeconds}
      timerProgress={timer.progress}
      moduleProgress={(correctAnswers / 10) * 100}
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
            Atual: <span className="font-semibold text-slate-950">{streak}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Streak: <span className="font-semibold text-slate-950">{maxStreak}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Pausas: <span className="font-semibold text-slate-950">{pauseCount}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Janela: <span className="font-semibold text-slate-950">8s</span>
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
        <div className="grid h-full min-h-0 w-full grid-rows-[auto_minmax(0,1fr)] gap-5 rounded-[1.75rem] bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.12),_transparent_34%),linear-gradient(180deg,_#4a044e_0%,_#0f172a_100%)] px-4 py-5 text-white sm:px-6">
          <div className="h-3 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-pink-400 transition-[width] duration-100" style={{ width: `${countdown.progress}%` }} />
          </div>
          <div className="grid gap-4 rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-6 text-center">
            <div className="text-xl font-semibold">{question.a} : {question.b}</div>
            <div className="text-[clamp(1.8rem,4vw,2.8rem)] font-semibold tracking-[-0.04em]">
              {question.c} : ?
            </div>
          </div>
          <ExerciseChoices
            options={question.options.map((option) => ({ label: option }))}
            onSelect={handleSelect}
            disabled={!timer.isRunning}
            countdownPercent={countdown.progress}
            countdownLabel={`${Math.ceil(countdown.timeLeftMs / 1000)}s`}
            accentColor="#ec4899"
          />
        </div>
      </ExerciseViewport>
    </ExerciseFrame>
  )
}
