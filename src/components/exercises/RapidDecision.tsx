import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { scoreReactionExercise } from '../../lib/scoring'
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

interface Scenario {
  prompt: string
  options: { label: string; description: string }[]
}

const SCENARIOS: Scenario[] = [
  {
    prompt: 'Voce ganhou 1 hora livre inesperada no meio do dia.',
    options: [
      { label: 'Estudar', description: 'Ganhar tracao rapida com algo importante.' },
      { label: 'Descansar', description: 'Recuperar energia antes do proximo bloco.' },
    ],
  },
  {
    prompt: 'O projeto atrasou e o prazo parece irrealista.',
    options: [
      { label: 'Avisar o cliente', description: 'Realinhar expectativa imediatamente.' },
      { label: 'Tentar entregar', description: 'Segurar a comunicacao e correr mais.' },
    ],
  },
  {
    prompt: 'Um colega pede ajuda enquanto voce esta em flow.',
    options: [
      { label: 'Ajudar agora', description: 'Resolver a necessidade no momento.' },
      { label: 'Pedir 20 min', description: 'Proteger o foco e responder depois.' },
    ],
  },
  {
    prompt: 'Surgiu uma ideia nova no meio da tarefa atual.',
    options: [
      { label: 'Anotar e seguir', description: 'Capturar a ideia sem trocar de trilho.' },
      { label: 'Explorar ja', description: 'Aproveitar a energia criativa do momento.' },
    ],
  },
  {
    prompt: 'Uma reuniao ficou vaga e sem pauta definida.',
    options: [
      { label: 'Pedir pauta', description: 'Reduzir ambiguidade antes de entrar.' },
      { label: 'Entrar assim mesmo', description: 'Descobrir o contexto ao vivo.' },
    ],
  },
  {
    prompt: 'Voce percebe um erro pequeno perto da entrega.',
    options: [
      { label: 'Corrigir agora', description: 'Evitar que vire ruído maior.' },
      { label: 'Registrar depois', description: 'Preservar a entrega no horario.' },
    ],
  },
]
const QUESTION_DURATION_MS = 5000

function shuffleScenarios() {
  return [...SCENARIOS].sort(() => Math.random() - 0.5)
}

export function RapidDecision({ duration, onComplete, footerAction }: ExerciseModuleProps) {
  const [scenarios, setScenarios] = useState(() => shuffleScenarios())
  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [decisionsTaken, setDecisionsTaken] = useState(0)
  const [timeouts, setTimeouts] = useState(0)
  const [averageDecisionMs, setAverageDecisionMs] = useState(0)
  const [pauseCount, setPauseCount] = useState(0)
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<'idle' | 'confirm' | 'timeout'>('idle')

  const hasStartedRef = useRef(false)
  const promptStartedAtRef = useRef<number | null>(null)
  const pauseCountRef = useRef(0)
  const activeStartRef = useRef<number | null>(null)
  const totalActiveMsRef = useRef(0)
  const decisionsRef = useRef(0)
  const timeoutsRef = useRef(0)
  const averageDecisionRef = useRef(0)
  const reactionCountRef = useRef(0)
  const feedbackTimeoutRef = useRef<number | null>(null)

  const clearFeedbackTimeout = useCallback(() => {
    if (feedbackTimeoutRef.current !== null) {
      window.clearTimeout(feedbackTimeoutRef.current)
      feedbackTimeoutRef.current = null
    }
  }, [])

  useEffect(() => () => clearFeedbackTimeout(), [clearFeedbackTimeout])

  const cycleScenario = useCallback(() => {
    setScenarioIndex((current) => (current + 1) % scenarios.length)
    promptStartedAtRef.current = performance.now()
  }, [scenarios.length])

  const questionCountdown = usePromptCountdown({
    durationMs: QUESTION_DURATION_MS,
    onExpire: () => {
      timeoutsRef.current += 1
      setTimeouts(timeoutsRef.current)
      setFeedback('timeout')
      setSelectedIndex(null)
      clearFeedbackTimeout()
      feedbackTimeoutRef.current = window.setTimeout(() => {
        setFeedback('idle')
        feedbackTimeoutRef.current = null
        cycleScenario()
        questionCountdown.start(QUESTION_DURATION_MS)
      }, 220)
    },
  })

  const timer = useTimer({
    duration,
    onComplete: () => {
      clearFeedbackTimeout()

      if (activeStartRef.current !== null) {
        totalActiveMsRef.current += performance.now() - activeStartRef.current
        activeStartRef.current = null
      }

      saveExerciseScore(
        scoreReactionExercise({
          exerciseId: 'decisao-rapida',
          correctResponses: decisionsRef.current,
          totalResponses: decisionsRef.current + timeoutsRef.current,
          averageReactionMs: averageDecisionRef.current,
          pauseCount: pauseCountRef.current,
          durationMs: totalActiveMsRef.current,
          totalDurationMs: duration * 1000,
        }),
      )

      onComplete()
    },
  })

  const currentScenario = useMemo(
    () => scenarios[scenarioIndex % scenarios.length] ?? scenarios[0],
    [scenarioIndex, scenarios],
  )

  const handleSelect = (index: number, event: React.MouseEvent<HTMLButtonElement>) => {
    if (!timer.isRunning || promptStartedAtRef.current === null) {
      return
    }

    decisionsRef.current += 1
    reactionCountRef.current += 1
    const decisionMs = event.timeStamp - promptStartedAtRef.current
    averageDecisionRef.current =
      reactionCountRef.current === 1
        ? decisionMs
        : (averageDecisionRef.current * (reactionCountRef.current - 1) + decisionMs) /
          reactionCountRef.current

    setDecisionsTaken(decisionsRef.current)
    setAverageDecisionMs(averageDecisionRef.current)
    setSelectedIndex(index)
    setFeedback('confirm')
    clearFeedbackTimeout()
    questionCountdown.pause()

    feedbackTimeoutRef.current = window.setTimeout(() => {
      setFeedback('idle')
      setSelectedIndex(null)
      feedbackTimeoutRef.current = null
      cycleScenario()
      questionCountdown.start(QUESTION_DURATION_MS)
    }, 180)
  }

  const handleStartPause = () => {
    if (timer.isRunning) {
      pauseCountRef.current += 1
      setPauseCount(pauseCountRef.current)
      questionCountdown.pause()
      clearFeedbackTimeout()

      if (activeStartRef.current !== null) {
        totalActiveMsRef.current += performance.now() - activeStartRef.current
        activeStartRef.current = null
      }

      timer.pause()
      return
    }

    activeStartRef.current = performance.now()
    promptStartedAtRef.current = performance.now()

    if (!hasStartedRef.current) {
      hasStartedRef.current = true
      questionCountdown.start(QUESTION_DURATION_MS)
    } else {
      questionCountdown.resume()
    }

    timer.start()
  }

  const handleRestart = () => {
    clearFeedbackTimeout()
    hasStartedRef.current = false
    setScenarios(shuffleScenarios())
    setScenarioIndex(0)
    setDecisionsTaken(0)
    setTimeouts(0)
    setAverageDecisionMs(0)
    setPauseCount(0)
    setSelectedIndex(null)
    setFeedback('idle')
    promptStartedAtRef.current = null
    pauseCountRef.current = 0
    activeStartRef.current = null
    totalActiveMsRef.current = 0
    decisionsRef.current = 0
    timeoutsRef.current = 0
    averageDecisionRef.current = 0
    reactionCountRef.current = 0
    questionCountdown.reset(QUESTION_DURATION_MS)
    timer.reset()
  }

  return (
    <ExerciseFrame
      accentColor="#14b8a6"
      timeLeftSeconds={timer.timeLeftSeconds}
      timerProgress={timer.progress}
      moduleProgress={Math.min(((decisionsTaken + timeouts) / 12) * 100, 100)}
      isRunning={timer.isRunning}
      onStartPause={handleStartPause}
      onRestart={handleRestart}
      footerAction={footerAction}
      metrics={
        <div className="grid gap-2 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Decisoes: <span className="font-semibold text-slate-950">{decisionsTaken}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Hesitacoes: <span className="font-semibold text-slate-950">{timeouts}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Pausas: <span className="font-semibold text-slate-950">{pauseCount}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Media:{' '}
            <span className="font-semibold text-slate-950">
              {decisionsTaken > 0 ? `${Math.round(averageDecisionMs)} ms` : 'Sem decisoes'}
            </span>
          </div>
        </div>
      }
    >
      <ExerciseViewport>
        <div className="grid h-full min-h-0 w-full grid-rows-[auto_minmax(0,1fr)] gap-4 rounded-[1.75rem] bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.16),_transparent_32%),linear-gradient(180deg,_#042f2e_0%,_#0f172a_100%)] px-4 py-5 text-white sm:px-6">
          <div className="text-center">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-100/55">
              Decisao binaria sob tempo
            </div>
          </div>

          <div className="flex min-h-0 flex-col justify-center gap-5">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-6 text-center">
              <div className="text-[clamp(1.15rem,2.2vw,1.65rem)] font-semibold leading-8 text-white">
                {currentScenario.prompt}
              </div>
            </div>

            <ExerciseChoices
              options={currentScenario.options}
              onSelect={handleSelect}
              selectedIndex={selectedIndex}
              feedback={feedback}
              disabled={!timer.isRunning}
              countdownPercent={questionCountdown.progress}
              countdownLabel={`${Math.ceil(questionCountdown.timeLeftMs / 1000)}s`}
              accentColor="#14b8a6"
              layout="row"
            />
          </div>
        </div>
      </ExerciseViewport>
    </ExerciseFrame>
  )
}
