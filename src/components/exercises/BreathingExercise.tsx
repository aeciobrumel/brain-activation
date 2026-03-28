import { useCallback, useEffect, useRef, useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'

import { ExerciseFrame } from './ExerciseFrame'
import { ExerciseViewport } from './ExerciseViewport'
import { useTimer } from './hooks/useTimer'
import { scoreBreathing } from '../../lib/scoring'
import { saveExerciseScore } from '../../lib/storage'

interface BreathPhaseConfig {
  id: string
  label: string
  sublabel: string
  durationMs: number
  bgColor: string
  glowColor: string
  scale: number
  tone?: number
}

// ─── Audio ────────────────────────────────────────────────────────────────────

function playTone(frequency: number, durationMs: number) {
  try {
    const ctx = new AudioContext()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.type = 'sine'
    osc.frequency.value = frequency

    const now = ctx.currentTime
    const dur = durationMs / 1000
    const ramp = Math.min(0.4, dur * 0.15)

    gain.gain.setValueAtTime(0, now)
    gain.gain.linearRampToValueAtTime(0.025, now + ramp)
    gain.gain.setValueAtTime(0.025, now + Math.max(ramp, dur - ramp))
    gain.gain.linearRampToValueAtTime(0, now + dur)

    osc.start(now)
    osc.stop(now + dur)
  } catch {
    // Web Audio not available in this environment
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ExerciseModuleProps {
  duration: number
  title: string
  onComplete: () => void
  footerAction?: ReactNode
}

interface BreathingEngineProps extends ExerciseModuleProps {
  exerciseId: string
  accentColor: string
  expectedCycles: number
  phases: BreathPhaseConfig[]
}

function BreathingEngine({
  duration,
  onComplete,
  footerAction,
  exerciseId,
  accentColor,
  expectedCycles,
  phases,
}: BreathingEngineProps) {
  const [phaseIndex, setPhaseIndex] = useState<number | null>(null)
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(0)
  const [completedCycles, setCompletedCycles] = useState(0)
  const [pauseCount, setPauseCount] = useState(0)

  // Refs for closures that need fresh values without re-renders
  const phaseTimeoutRef = useRef<number | null>(null)
  const phaseIntervalRef = useRef<number | null>(null)
  const cyclesRef = useRef(0)
  const pauseCountRef = useRef(0)
  const activeStartRef = useRef<number | null>(null)
  const totalActiveMs = useRef(0)

  // startPhaseRef breaks recursive closure without stale deps
  const startPhaseRef = useRef<((nextIndex: number) => void) | null>(null)

  function clearPhaseTimers() {
    if (phaseTimeoutRef.current !== null) {
      window.clearTimeout(phaseTimeoutRef.current)
      phaseTimeoutRef.current = null
    }
    if (phaseIntervalRef.current !== null) {
      window.clearInterval(phaseIntervalRef.current)
      phaseIntervalRef.current = null
    }
  }

  const startPhase = useCallback(
    (nextIndex: number) => {
      const nextPhase = phases[nextIndex]
      if (!nextPhase) {
        return
      }

      if (typeof nextPhase.tone === 'number') {
        playTone(nextPhase.tone, nextPhase.durationMs)
      }

      setPhaseIndex(nextIndex)
      setPhaseSecondsLeft(Math.ceil(nextPhase.durationMs / 1000))

      const intervalStart = performance.now()
      phaseIntervalRef.current = window.setInterval(() => {
        const elapsed = performance.now() - intervalStart
        const remaining = Math.ceil((nextPhase.durationMs - elapsed) / 1000)
        setPhaseSecondsLeft(Math.max(0, remaining))
      }, 100)

      phaseTimeoutRef.current = window.setTimeout(() => {
        clearPhaseTimers()

        const upcomingIndex = (nextIndex + 1) % phases.length
        if (upcomingIndex === 0) {
          cyclesRef.current += 1
          setCompletedCycles(cyclesRef.current)
        }

        startPhaseRef.current?.(upcomingIndex)
      }, nextPhase.durationMs)
    },
    [phases],
  )

  useEffect(() => {
    startPhaseRef.current = startPhase
  }, [startPhase])

  useEffect(() => () => clearPhaseTimers(), [])

  const handleComplete = useCallback(() => {
    clearPhaseTimers()
    setPhaseIndex(null)

    // Finalise active duration
    if (activeStartRef.current !== null) {
      totalActiveMs.current += performance.now() - activeStartRef.current
      activeStartRef.current = null
    }

    const score = scoreBreathing({
      exerciseId,
      completedCycles: cyclesRef.current,
      expectedCycles,
      pauseCount: pauseCountRef.current,
      durationMs: totalActiveMs.current,
      totalDurationMs: duration * 1000,
    })

    saveExerciseScore(score)
    onComplete()
  }, [duration, exerciseId, expectedCycles, onComplete])

  const timer = useTimer({ duration, onComplete: handleComplete })

  // ─── Circle animation ───────────────────────────────────────────────────────
  // CSS transitions animate FROM current computed value TO new value.
  // Each phase sets the transition duration to match that phase's duration.
  const currentPhase = phaseIndex === null ? null : phases[phaseIndex]
  const circleStyle: CSSProperties = {
    transform: `scale(${currentPhase?.scale ?? 0.28})`,
    backgroundColor: currentPhase?.bgColor ?? '#0f172a',
    boxShadow: `0 0 100px 30px ${currentPhase?.glowColor ?? 'rgba(0,0,0,0)'}`,
    transition: [
      `transform ${currentPhase?.durationMs ?? 600}ms ease-in-out`,
      'background-color 600ms ease',
      'box-shadow 600ms ease',
    ].join(', '),
  }

  // ─── Start / Pause handlers ─────────────────────────────────────────────────

  function handleStartPause() {
    if (timer.isRunning) {
      clearPhaseTimers()
      setPhaseIndex(null)
      pauseCountRef.current += 1
      setPauseCount(pauseCountRef.current)

      if (activeStartRef.current !== null) {
        totalActiveMs.current += performance.now() - activeStartRef.current
        activeStartRef.current = null
      }

      timer.pause()
      return
    }

    activeStartRef.current = performance.now()
    startPhaseRef.current?.(0)
    timer.start()
  }

  function handleRestart() {
    clearPhaseTimers()
    setPhaseIndex(null)
    setCompletedCycles(0)
    setPauseCount(0)
    setPhaseSecondsLeft(0)
    cyclesRef.current = 0
    pauseCountRef.current = 0
    totalActiveMs.current = 0
    activeStartRef.current = null
    timer.reset()
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <ExerciseFrame
      accentColor={accentColor}
      timeLeftSeconds={timer.timeLeftSeconds}
      timerProgress={timer.progress}
      moduleProgress={(completedCycles / expectedCycles) * 100}
      isRunning={timer.isRunning}
      onStartPause={handleStartPause}
      onRestart={handleRestart}
      footerAction={footerAction}
      metrics={
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Ciclos:{' '}
            <span className="font-semibold text-slate-950">
              {completedCycles} / {expectedCycles}
            </span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Pausas:{' '}
            <span className="font-semibold text-slate-950">{pauseCount}</span>
          </div>
        </div>
      }
    >
      <ExerciseViewport>
        <div className="flex h-full w-full flex-col items-center justify-center gap-5 rounded-[1.75rem] bg-slate-950 px-6 py-6">
          {/* Phase label + countdown */}
          <div className="flex min-h-[4.5rem] flex-col items-center justify-center text-center">
            <div
              className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-semibold tracking-tight text-white"
              style={{ color: phaseIndex === null ? 'rgba(255,255,255,0.4)' : 'white' }}
            >
              {currentPhase?.label ?? 'Pronto'}
            </div>
            {phaseIndex !== null && (
              <div className="mt-0.5 text-[clamp(1.5rem,2.5vw,2rem)] font-light tabular-nums text-white/50">
                {phaseSecondsLeft}s
              </div>
            )}
          </div>

          {/* Breathing circle */}
          <div className="flex h-48 w-48 flex-shrink-0 items-center justify-center sm:h-56 sm:w-56 lg:h-64 lg:w-64">
            <div className="h-full w-full rounded-full" style={circleStyle} />
          </div>

          {/* Sub-label */}
          <div className="min-h-[1.25rem] text-center text-[clamp(0.7rem,1vw,0.85rem)] text-white/35">
            {currentPhase?.sublabel ?? 'Pressione Iniciar para começar'}
          </div>

          {/* Pattern key */}
          <div className="flex items-center gap-3 text-[0.65rem] font-semibold uppercase tracking-[0.18em]">
            {phases.map((phase, index) => (
              <div key={`${phase.id}-${index}`} className="flex items-center gap-3">
                <span style={{ color: phase.glowColor.replace('0.5', '1').replace('0.55', '1') }}>
                  {Math.round(phase.durationMs / 1000)}s {phase.label.toLowerCase()}
                </span>
                {index < phases.length - 1 ? <span className="text-white/20">·</span> : null}
              </div>
            ))}
          </div>
        </div>
      </ExerciseViewport>
    </ExerciseFrame>
  )
}

const BREATHING_478_PHASES: BreathPhaseConfig[] = [
  {
    id: 'inhale',
    label: 'Inspire',
    sublabel: '4 segundos — lento e profundo pelo nariz',
    durationMs: 4000,
    bgColor: '#1e3a8a',
    glowColor: 'rgba(59,130,246,0.55)',
    scale: 1,
    tone: 396,
  },
  {
    id: 'hold',
    label: 'Segure',
    sublabel: '7 segundos — mantenha o ar completamente',
    durationMs: 7000,
    bgColor: '#78350f',
    glowColor: 'rgba(245,158,11,0.5)',
    scale: 1,
  },
  {
    id: 'exhale',
    label: 'Expire',
    sublabel: '8 segundos — solte pela boca devagar',
    durationMs: 8000,
    bgColor: '#3b0764',
    glowColor: 'rgba(139,92,246,0.5)',
    scale: 0.28,
    tone: 285,
  },
]

const TACTICAL_BREATHING_PHASES: BreathPhaseConfig[] = [
  {
    id: 'inhale',
    label: 'Inspire',
    sublabel: '4 segundos — estabilize a entrada de ar',
    durationMs: 4000,
    bgColor: '#134e4a',
    glowColor: 'rgba(20,184,166,0.55)',
    scale: 1,
    tone: 392,
  },
  {
    id: 'hold-in',
    label: 'Segure',
    sublabel: '4 segundos — mantenha o corpo imóvel',
    durationMs: 4000,
    bgColor: '#115e59',
    glowColor: 'rgba(45,212,191,0.46)',
    scale: 1,
  },
  {
    id: 'exhale',
    label: 'Expire',
    sublabel: '4 segundos — solte o ar em ritmo constante',
    durationMs: 4000,
    bgColor: '#0f3d3c',
    glowColor: 'rgba(13,148,136,0.45)',
    scale: 0.3,
    tone: 294,
  },
  {
    id: 'hold-out',
    label: 'Segure',
    sublabel: '4 segundos — pause com calma antes do próximo ciclo',
    durationMs: 4000,
    bgColor: '#0b3b39',
    glowColor: 'rgba(94,234,212,0.36)',
    scale: 0.3,
  },
]

export function BreathingExercise(props: ExerciseModuleProps) {
  return (
    <BreathingEngine
      {...props}
      exerciseId="respiracao-478"
      accentColor="#3b82f6"
      expectedCycles={4}
      phases={BREATHING_478_PHASES}
    />
  )
}

export function TacticalBreathing(props: ExerciseModuleProps) {
  return (
    <BreathingEngine
      {...props}
      exerciseId="respiracao-tatica"
      accentColor="#14b8a6"
      expectedCycles={3}
      phases={TACTICAL_BREATHING_PHASES}
    />
  )
}
