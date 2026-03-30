import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { scoreRoutineExercise } from '../../lib/scoring'
import { saveExerciseScore } from '../../lib/storage'
import { ExerciseFrame } from './ExerciseFrame'
import { ExerciseViewport } from './ExerciseViewport'
import { useTimer } from './hooks/useTimer'

interface ExerciseModuleProps {
  duration: number
  title: string
  onComplete: () => void
  footerAction?: React.ReactNode
}

interface CrossTouchStep {
  id: string
  headline: string
  detail: string
  hand: 'left' | 'right'
  knee: 'left' | 'right'
}

const DURATION_OPTIONS = [
  { label: '2 min', value: 120 },
  { label: '3 min', value: 180 },
  { label: '5 min', value: 300 },
]

const CROSS_TOUCH_STEPS: CrossTouchStep[] = [
  {
    id: 'right-to-left',
    headline: 'Mao direita no joelho esquerdo',
    detail: 'Cruze o centro do corpo, toque e volte ao eixo.',
    hand: 'right',
    knee: 'left',
  },
  {
    id: 'left-to-right',
    headline: 'Mao esquerda no joelho direito',
    detail: 'Mantenha o peito aberto e troque o lado sem travar.',
    hand: 'left',
    knee: 'right',
  },
]

const CUE_INTERVAL_MS = 1050

function getNodeClasses(isActive: boolean) {
  return isActive
    ? 'border-orange-300 bg-orange-400/22 text-white shadow-[0_0_32px_rgba(251,146,60,0.28)]'
    : 'border-white/12 bg-white/5 text-white/65'
}

export function HemisphereCoordination({
  duration,
  onComplete,
  footerAction,
}: ExerciseModuleProps) {
  const [selectedDuration, setSelectedDuration] = useState(Math.max(duration, 120))
  const [stepIndex, setStepIndex] = useState(0)
  const [completedCues, setCompletedCues] = useState(0)
  const [pauseCount, setPauseCount] = useState(0)

  const cueIntervalRef = useRef<number | null>(null)
  const completedCuesRef = useRef(0)
  const pauseCountRef = useRef(0)
  const activeStartRef = useRef<number | null>(null)
  const totalActiveMsRef = useRef(0)

  const clearCueInterval = useCallback(() => {
    if (cueIntervalRef.current !== null) {
      window.clearInterval(cueIntervalRef.current)
      cueIntervalRef.current = null
    }
  }, [])

  const timer = useTimer({
    duration: selectedDuration,
    onComplete: () => {
      clearCueInterval()

      if (activeStartRef.current !== null) {
        totalActiveMsRef.current += performance.now() - activeStartRef.current
        activeStartRef.current = null
      }

      const expectedCues = Math.max(Math.floor((selectedDuration * 1000) / CUE_INTERVAL_MS), 1)

      saveExerciseScore(
        scoreRoutineExercise({
          exerciseId: 'toque-cruzado',
          completedCues: completedCuesRef.current,
          expectedCues,
          pauseCount: pauseCountRef.current,
          durationMs: totalActiveMsRef.current,
          totalDurationMs: selectedDuration * 1000,
          raw: {
            selectedDurationSeconds: selectedDuration,
          },
        }),
      )

      onComplete()
    },
  })

  useEffect(() => {
    if (!timer.isRunning) {
      clearCueInterval()
      return
    }

    cueIntervalRef.current = window.setInterval(() => {
      completedCuesRef.current += 1
      setCompletedCues(completedCuesRef.current)
      setStepIndex((current) => (current + 1) % CROSS_TOUCH_STEPS.length)
    }, CUE_INTERVAL_MS)

    return () => {
      clearCueInterval()
    }
  }, [clearCueInterval, timer.isRunning])

  const currentStep = CROSS_TOUCH_STEPS[stepIndex] ?? CROSS_TOUCH_STEPS[0]
  const expectedCues = useMemo(
    () => Math.max(Math.floor((selectedDuration * 1000) / CUE_INTERVAL_MS), 1),
    [selectedDuration],
  )

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
    clearCueInterval()

    completedCuesRef.current = 0
    pauseCountRef.current = 0
    activeStartRef.current = null
    totalActiveMsRef.current = 0
    setCompletedCues(0)
    setPauseCount(0)
    setStepIndex(0)
    timer.reset()
  }

  const isLeftHandActive = currentStep.hand === 'left'
  const isRightHandActive = currentStep.hand === 'right'
  const isLeftKneeActive = currentStep.knee === 'left'
  const isRightKneeActive = currentStep.knee === 'right'
  const crossLineRotation = currentStep.id === 'right-to-left' ? '-24deg' : '24deg'

  return (
    <ExerciseFrame
      accentColor="#f97316"
      timeLeftSeconds={timer.timeLeftSeconds}
      timerProgress={timer.progress}
      moduleProgress={Math.min((completedCues / expectedCues) * 100, 100)}
      isRunning={timer.isRunning}
      onStartPause={handleStartPause}
      onRestart={handleRestart}
      footerAction={footerAction}
      metrics={
        <div className="grid gap-2 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Duracao:{' '}
            <span className="font-semibold text-slate-950">{selectedDuration / 60} min</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Ritmos:{' '}
            <span className="font-semibold text-slate-950">{completedCues}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Pausas:{' '}
            <span className="font-semibold text-slate-950">{pauseCount}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Cadencia:{' '}
            <span className="font-semibold text-slate-950">
              {Math.round(60000 / CUE_INTERVAL_MS)} bpm
            </span>
          </div>
        </div>
      }
    >
      <ExerciseViewport>
        <div className="grid h-full min-h-0 w-full max-h-full grid-rows-[auto_auto_minmax(0,1fr)] gap-4 rounded-[1.75rem] bg-[radial-gradient(circle_at_top,_rgba(249,115,22,0.18),_transparent_32%),linear-gradient(180deg,_#431407_0%,_#0f172a_100%)] px-4 py-5 text-white sm:px-6 [@media(max-height:800px)]:gap-3 [@media(max-height:800px)]:px-3 [@media(max-height:800px)]:py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-orange-100/55">
                Movimento guiado
              </div>
              <div className="mt-2 text-xl font-semibold text-white">{currentStep.headline}</div>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75">
              Sem sensores: siga o ritmo visual da tela.
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {DURATION_OPTIONS.map((option) => {
              const isSelected = selectedDuration === option.value
              const isDisabled = timer.isRunning || timer.elapsedMs > 0

              return (
                <button
                  key={option.value}
                  type="button"
                  disabled={isDisabled}
                  onClick={() => setSelectedDuration(option.value)}
                  aria-label={`${option.label}${isSelected ? ', selecionado' : ''}${isDisabled ? ', indisponivel durante a sessao' : ''}`}
                  aria-pressed={isSelected}
                  className="rounded-full border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-45"
                  style={{
                    borderColor: isSelected
                      ? 'rgba(251,146,60,0.9)'
                      : 'rgba(255,255,255,0.14)',
                    backgroundColor: isSelected
                      ? 'rgba(251,146,60,0.18)'
                      : 'rgba(255,255,255,0.04)',
                    color: '#ffffff',
                  }}
                >
                  {option.label}
                </button>
              )
            })}
          </div>

          <div className="grid h-full min-h-0 gap-4 [@media(max-height:800px)]:gap-3 lg:grid-cols-[minmax(0,1.2fr)_minmax(260px,0.8fr)]">
            <div className="relative h-full min-h-0 overflow-hidden rounded-[1.75rem] border border-white/10 bg-black/15">
              <div className="absolute inset-x-1/2 top-[16%] h-[60%] w-px -translate-x-1/2 bg-white/10" />
              <div
                className="absolute left-1/2 top-1/2 h-1 w-[44%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-r from-orange-300/80 via-white/70 to-orange-300/80 transition-transform duration-300"
                style={{ transform: `translate(-50%, -50%) rotate(${crossLineRotation})` }}
              />

              <div
                className={`absolute left-[14%] top-[14%] flex h-20 w-20 items-center justify-center rounded-full border text-sm font-semibold transition-all [@media(max-height:800px)]:h-16 [@media(max-height:800px)]:w-16 [@media(max-height:800px)]:text-xs sm:h-24 sm:w-24 ${getNodeClasses(
                  isLeftHandActive,
                )}`}
              >
                Mao E
              </div>
              <div
                className={`absolute right-[14%] top-[14%] flex h-20 w-20 items-center justify-center rounded-full border text-sm font-semibold transition-all [@media(max-height:800px)]:h-16 [@media(max-height:800px)]:w-16 [@media(max-height:800px)]:text-xs sm:h-24 sm:w-24 ${getNodeClasses(
                  isRightHandActive,
                )}`}
              >
                Mao D
              </div>
              <div
                className={`absolute bottom-[14%] left-[22%] flex h-20 w-20 items-center justify-center rounded-full border text-sm font-semibold transition-all [@media(max-height:800px)]:h-16 [@media(max-height:800px)]:w-16 [@media(max-height:800px)]:text-xs sm:h-24 sm:w-24 ${getNodeClasses(
                  isLeftKneeActive,
                )}`}
              >
                Joelho E
              </div>
              <div
                className={`absolute bottom-[14%] right-[22%] flex h-20 w-20 items-center justify-center rounded-full border text-sm font-semibold transition-all [@media(max-height:800px)]:h-16 [@media(max-height:800px)]:w-16 [@media(max-height:800px)]:text-xs sm:h-24 sm:w-24 ${getNodeClasses(
                  isRightKneeActive,
                )}`}
              >
                Joelho D
              </div>

              <div className="absolute inset-x-6 bottom-6 rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4 text-center [@media(max-height:800px)]:inset-x-4 [@media(max-height:800px)]:bottom-4 [@media(max-height:800px)]:px-3 [@media(max-height:800px)]:py-3">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-100/55">
                  Cue atual
                </div>
                <div className="mt-2 text-lg font-semibold text-white [@media(max-height:800px)]:text-base">
                  {currentStep.headline}
                </div>
                <p className="mt-2 text-sm leading-6 text-white/70 [@media(max-height:800px)]:leading-5">
                  {currentStep.detail}
                </p>
              </div>
            </div>

            <div className="grid min-h-0 content-start gap-3 [@media(max-height:800px)]:gap-2">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-100/55">
                  Execucao
                </div>
                <p className="mt-3 text-sm leading-7 text-white/75">
                  Inicie e acompanhe as trocas na tela. A animacao faz o papel de metrônomo e o
                  timer comeca logo apos a instrucao inicial.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-100/55">
                  Preparado para midia
                </div>
                <p className="mt-3 text-sm leading-7 text-white/75">
                  O modal inicial deste exercicio ja aceita um video local para demonstracao. Basta
                  adicionar o arquivo depois e apontar o caminho no cadastro do exercicio.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ExerciseViewport>
    </ExerciseFrame>
  )
}
