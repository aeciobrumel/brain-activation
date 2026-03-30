import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'

import { scoreReactionExercise } from '../../lib/scoring'
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

type StimulusState = 'idle' | 'waiting' | 'ready'
type StimulusShape = 'circle' | 'square' | 'diamond' | 'ring'

interface StimulusVariant {
  id: string
  label: string
  color: string
  shape: StimulusShape
  tone: number
}

const STIMULUS_VARIANTS: StimulusVariant[] = [
  { id: 'pulse-red', label: 'Pulso vermelho', color: '#ef4444', shape: 'circle', tone: 620 },
  { id: 'signal-cyan', label: 'Sinal ciano', color: '#06b6d4', shape: 'square', tone: 760 },
  { id: 'flash-amber', label: 'Flash amber', color: '#f59e0b', shape: 'diamond', tone: 540 },
  { id: 'ring-lime', label: 'Anel limao', color: '#84cc16', shape: 'ring', tone: 700 },
]

const MIN_DELAY_MS = 900
const MAX_DELAY_MS = 2600
const TARGET_ROUNDS = 8

interface ReactionViewState {
  stimulusState: StimulusState
  stimulus: StimulusVariant
  reactionTime: number | null
  averageReaction: number | null
  completedRounds: number
  falseStarts: number
  pauseCount: number
  reactionCount: number
}

type ReactionAction =
  | { type: 'schedule' }
  | { type: 'stimulus-ready'; stimulus: StimulusVariant }
  | { type: 'record-false-start' }
  | { type: 'record-reaction'; reactionMs: number }
  | { type: 'pause' }
  | { type: 'reset' }

function createInitialReactionState(): ReactionViewState {
  return {
    stimulusState: 'idle',
    stimulus: STIMULUS_VARIANTS[0],
    reactionTime: null,
    averageReaction: null,
    completedRounds: 0,
    falseStarts: 0,
    pauseCount: 0,
    reactionCount: 0,
  }
}

function reactionReducer(
  state: ReactionViewState,
  action: ReactionAction,
): ReactionViewState {
  switch (action.type) {
    case 'schedule':
      return {
        ...state,
        stimulusState: 'waiting',
      }
    case 'stimulus-ready':
      return {
        ...state,
        stimulus: action.stimulus,
        stimulusState: 'ready',
      }
    case 'record-false-start':
      return {
        ...state,
        falseStarts: state.falseStarts + 1,
        reactionTime: null,
        stimulusState: 'idle',
      }
    case 'record-reaction': {
      const nextReactionCount = state.reactionCount + 1
      const nextAverageReaction =
        nextReactionCount === 1
          ? action.reactionMs
          : (((state.averageReaction ?? 0) * state.reactionCount) + action.reactionMs) /
            nextReactionCount

      return {
        ...state,
        stimulusState: 'idle',
        reactionTime: action.reactionMs,
        averageReaction: nextAverageReaction,
        completedRounds: state.completedRounds + 1,
        reactionCount: nextReactionCount,
      }
    }
    case 'pause':
      return {
        ...state,
        stimulusState: 'idle',
        pauseCount: state.pauseCount + 1,
      }
    case 'reset':
      return createInitialReactionState()
    default:
      return state
  }
}

function getRandomDelay() {
  return MIN_DELAY_MS + Math.random() * (MAX_DELAY_MS - MIN_DELAY_MS)
}

function pickNextStimulus(previousId: string | null) {
  const pool = STIMULUS_VARIANTS.filter((item) => item.id !== previousId)
  return pool[Math.floor(Math.random() * pool.length)] ?? STIMULUS_VARIANTS[0]
}

export function ReactionTest({ duration, onComplete, footerAction }: ExerciseModuleProps) {
  const [state, dispatch] = useReducer(reactionReducer, undefined, createInitialReactionState)
  const stateRef = useRef(state)

  const readyAtRef = useRef<number | null>(null)
  const timeoutRef = useRef<number | null>(null)
  const previousStimulusIdRef = useRef<string | null>(null)
  const activeStartRef = useRef<number | null>(null)
  const totalActiveMsRef = useRef(0)
  const audioContextRef = useRef<AudioContext | null>(null)

  const dispatchState = useCallback((action: ReactionAction) => {
    stateRef.current = reactionReducer(stateRef.current, action)
    dispatch(action)
  }, [])

  const clearScheduledStimulus = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const ensureAudioContext = useCallback(() => {
    const AudioContextClass = window.AudioContext
    if (!AudioContextClass) {
      return null
    }

    if (audioContextRef.current === null) {
      audioContextRef.current = new AudioContextClass()
    }

    const context = audioContextRef.current
    if (context?.state === 'suspended') {
      void context.resume().catch(() => undefined)
    }

    return context
  }, [])

  const playBeep = useCallback((frequency: number) => {
    const context = audioContextRef.current
    if (!context || context.state === 'closed') {
      return
    }

    const oscillator = context.createOscillator()
    const gain = context.createGain()

    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.type = 'sine'
    oscillator.frequency.value = frequency
    gain.gain.value = 0.04
    oscillator.start()
    oscillator.stop(context.currentTime + 0.1)
  }, [])

  const scheduleStimulus = useCallback(() => {
    clearScheduledStimulus()
    readyAtRef.current = null
    dispatchState({ type: 'schedule' })

    const delay = getRandomDelay()
    timeoutRef.current = window.setTimeout(() => {
      const nextStimulus = pickNextStimulus(previousStimulusIdRef.current)
      previousStimulusIdRef.current = nextStimulus.id
      readyAtRef.current = performance.now()
      dispatchState({ type: 'stimulus-ready', stimulus: nextStimulus })
      playBeep(nextStimulus.tone)
    }, delay)
  }, [clearScheduledStimulus, dispatchState, playBeep])

  const timer = useTimer({
    duration,
    onComplete: () => {
      clearScheduledStimulus()

      if (activeStartRef.current !== null) {
        totalActiveMsRef.current += performance.now() - activeStartRef.current
        activeStartRef.current = null
      }

      saveExerciseScore(
        scoreReactionExercise({
          exerciseId: 'reacao-rapida',
          correctResponses: stateRef.current.completedRounds,
          totalResponses: stateRef.current.completedRounds + stateRef.current.falseStarts,
          averageReactionMs: stateRef.current.averageReaction ?? 0,
          pauseCount: stateRef.current.pauseCount,
          durationMs: totalActiveMsRef.current,
          totalDurationMs: duration * 1000,
        }),
      )

      onComplete()
    },
  })

  useEffect(() => () => clearScheduledStimulus(), [clearScheduledStimulus])
  useEffect(
    () => () => {
      const context = audioContextRef.current
      audioContextRef.current = null
      if (context && context.state !== 'closed') {
        void context.close().catch(() => undefined)
      }
    },
    [],
  )

  const registerResponse = useCallback(() => {
    if (!timer.isRunning) {
      return
    }

    const currentState = stateRef.current

    if (currentState.stimulusState !== 'ready' || readyAtRef.current === null) {
      dispatchState({ type: 'record-false-start' })
      scheduleStimulus()
      return
    }

    const result = Math.max(performance.now() - readyAtRef.current, 0)
    dispatchState({ type: 'record-reaction', reactionMs: result })
    scheduleStimulus()
  }, [dispatchState, scheduleStimulus, timer.isRunning])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || !timer.isRunning) {
        return
      }

      event.preventDefault()
      registerResponse()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [registerResponse, timer.isRunning])

  const handleStartPause = () => {
    if (timer.isRunning) {
      clearScheduledStimulus()
      readyAtRef.current = null
      dispatchState({ type: 'pause' })

      if (activeStartRef.current !== null) {
        totalActiveMsRef.current += performance.now() - activeStartRef.current
        activeStartRef.current = null
      }

      timer.pause()
      return
    }

    ensureAudioContext()
    activeStartRef.current = performance.now()

    if (stateRef.current.stimulusState === 'idle') {
      scheduleStimulus()
    }

    timer.start()
  }

  const handleRestart = () => {
    clearScheduledStimulus()
    readyAtRef.current = null
    previousStimulusIdRef.current = null
    activeStartRef.current = null
    totalActiveMsRef.current = 0
    dispatchState({ type: 'reset' })
    timer.reset()
  }

  const stimulusStyle = useMemo(() => {
    switch (state.stimulus.shape) {
      case 'square':
        return {
          borderRadius: '1.4rem',
          transform: state.stimulusState === 'ready' ? 'scale(1.02)' : 'scale(0.92)',
          borderWidth: 0,
        }
      case 'diamond':
        return {
          borderRadius: '1rem',
          transform:
            state.stimulusState === 'ready'
              ? 'rotate(45deg) scale(1)'
              : 'rotate(45deg) scale(0.88)',
          borderWidth: 0,
        }
      case 'ring':
        return {
          borderRadius: '9999px',
          transform: state.stimulusState === 'ready' ? 'scale(1.02)' : 'scale(0.92)',
          borderWidth: 14,
        }
      default:
        return {
          borderRadius: '9999px',
          transform: state.stimulusState === 'ready' ? 'scale(1.02)' : 'scale(0.92)',
          borderWidth: 0,
        }
    }
  }, [state.stimulus.shape, state.stimulusState])

  const statusLabel =
    state.stimulusState === 'ready'
      ? 'Responda agora'
      : state.stimulusState === 'waiting'
        ? 'Aguarde o proximo estimulo'
        : 'Pronto para uma nova rodada'

  const handlePointerResponse = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) {
      return
    }

    registerResponse()
  }

  return (
    <ExerciseFrame
      accentColor="#ef4444"
      timeLeftSeconds={timer.timeLeftSeconds}
      timerProgress={timer.progress}
      moduleProgress={Math.min((state.completedRounds / TARGET_ROUNDS) * 100, 100)}
      isRunning={timer.isRunning}
      onStartPause={handleStartPause}
      onRestart={handleRestart}
      footerAction={footerAction}
      metrics={
        <div className="grid gap-2 sm:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Rodadas:{' '}
            <span className="font-semibold text-slate-950">{state.completedRounds}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Ultima:{' '}
            <span className="font-semibold text-slate-950">
              {state.reactionTime !== null ? `${Math.round(state.reactionTime)} ms` : 'Aguardando'}
            </span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Media:{' '}
            <span className="font-semibold text-slate-950">
              {state.averageReaction !== null
                ? `${Math.round(state.averageReaction)} ms`
                : 'Sem tentativas'}
            </span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Antecipos:{' '}
            <span className="font-semibold text-slate-950">{state.falseStarts}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Pausas:{' '}
            <span className="font-semibold text-slate-950">{state.pauseCount}</span>
          </div>
        </div>
      }
    >
      <ExerciseViewport>
        <div className="grid h-full min-h-0 w-full grid-rows-[auto_minmax(0,1fr)_auto] gap-4 rounded-[1.75rem] bg-[radial-gradient(circle_at_top,_rgba(239,68,68,0.18),_transparent_28%),linear-gradient(180deg,_#2b0a0a_0%,_#0f172a_100%)] px-4 py-5 text-center text-white sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3 text-left">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-red-100/55">
                Multi-rodada com atraso randomico
              </div>
              <div className="mt-2 text-lg font-semibold text-white">{statusLabel}</div>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/75">
              Estimulo atual: <span className="font-semibold text-white">{state.stimulus.label}</span>
            </div>
          </div>

          <button
            type="button"
            disabled={!timer.isRunning}
            onPointerDown={handlePointerResponse}
            aria-label="Toque na area do estimulo assim que ele aparecer"
            className="relative flex min-h-0 items-center justify-center overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 text-left disabled:cursor-default"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle,_rgba(255,255,255,0.08)_1px,_transparent_1px)] [background-size:22px_22px] opacity-30" />
            <div
              className="relative flex h-64 w-64 items-center justify-center transition-all duration-150 sm:h-72 sm:w-72"
              style={{
                backgroundColor:
                  state.stimulusState === 'ready'
                    ? `${state.stimulus.color}22`
                    : 'rgba(255,255,255,0.02)',
                borderRadius: '2rem',
                transform: state.stimulusState === 'ready' ? 'scale(1.03)' : 'scale(1)',
              }}
            >
              <div
                className="transition-all duration-150"
                style={{
                  ...stimulusStyle,
                  width: state.stimulusState === 'ready' ? 130 : 92,
                  height: state.stimulusState === 'ready' ? 130 : 92,
                  backgroundColor:
                    state.stimulus.shape === 'ring'
                      ? 'transparent'
                      : state.stimulusState === 'ready'
                        ? state.stimulus.color
                        : '#334155',
                  borderColor: state.stimulus.color,
                  boxShadow:
                    state.stimulusState === 'ready'
                      ? `0 0 60px ${state.stimulus.color}55`
                      : '0 0 0 rgba(0,0,0,0)',
                }}
              />
            </div>
          </button>

          <p className="text-[clamp(0.78rem,1vw,0.98rem)] leading-6 text-white/70">
            Pressione <span className="font-semibold text-white">ESPACO</span> ou toque na tela
            assim que o estimulo aparecer. Se antecipar, a rodada reinicia com um novo atraso.
          </p>
        </div>
      </ExerciseViewport>
    </ExerciseFrame>
  )
}
