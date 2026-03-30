import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { scoreBreathing } from '../../lib/scoring'
import { saveExerciseScore } from '../../lib/storage'
import { ExerciseFrame } from './ExerciseFrame'
import { ExerciseViewport } from './ExerciseViewport'
import { useTimer } from './hooks/useTimer'

interface ExerciseModuleProps {
  duration: number
  title: string
  onComplete: () => void
  footerAction?: ReactNode
}

interface SomaticPhase {
  id: string
  label: string
  sublabel: string
  durationMs: number
  bgColor: string
  glowColor: string
  scale: number
  cueTitle: string
  cueText: string
}

interface SomaticContext {
  completedCycles: number
  expectedCycles: number
  currentPhase: SomaticPhase | null
  elapsedMs: number
}

interface SomaticPanel {
  badge: string
  title: string
  detail: string
  mantra?: string
}

interface GuidedSomaticPracticeProps extends ExerciseModuleProps {
  exerciseId: string
  accentColor: string
  summary: string
  helperLines: string[]
  expectedCycles: number
  phases: SomaticPhase[]
  getPanel: (context: SomaticContext) => SomaticPanel
}

function GuidedSomaticPractice({
  duration,
  title,
  onComplete,
  footerAction,
  exerciseId,
  accentColor,
  summary,
  helperLines,
  expectedCycles,
  phases,
  getPanel,
}: GuidedSomaticPracticeProps) {
  const [phaseIndex, setPhaseIndex] = useState<number | null>(null)
  const [phaseSecondsLeft, setPhaseSecondsLeft] = useState(0)
  const [completedCycles, setCompletedCycles] = useState(0)
  const [pauseCount, setPauseCount] = useState(0)

  const phaseTimeoutRef = useRef<number | null>(null)
  const phaseIntervalRef = useRef<number | null>(null)
  const cyclesRef = useRef(0)
  const pauseCountRef = useRef(0)
  const activeStartRef = useRef<number | null>(null)
  const totalActiveMsRef = useRef(0)
  const startPhaseRef = useRef<((nextIndex: number) => void) | null>(null)

  const clearPhaseTimers = useCallback(() => {
    if (phaseTimeoutRef.current !== null) {
      window.clearTimeout(phaseTimeoutRef.current)
      phaseTimeoutRef.current = null
    }

    if (phaseIntervalRef.current !== null) {
      window.clearInterval(phaseIntervalRef.current)
      phaseIntervalRef.current = null
    }
  }, [])

  const startPhase = useCallback(
    (nextIndex: number) => {
      const nextPhase = phases[nextIndex]
      if (!nextPhase) {
        return
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
    [clearPhaseTimers, phases],
  )

  useEffect(() => {
    startPhaseRef.current = startPhase
  }, [startPhase])

  useEffect(() => () => clearPhaseTimers(), [clearPhaseTimers])

  const handleComplete = useCallback(() => {
    clearPhaseTimers()
    setPhaseIndex(null)

    if (activeStartRef.current !== null) {
      totalActiveMsRef.current += performance.now() - activeStartRef.current
      activeStartRef.current = null
    }

    saveExerciseScore(
      scoreBreathing({
        exerciseId,
        completedCycles: cyclesRef.current,
        expectedCycles,
        pauseCount: pauseCountRef.current,
        durationMs: totalActiveMsRef.current,
        totalDurationMs: duration * 1000,
      }),
    )

    onComplete()
  }, [clearPhaseTimers, duration, exerciseId, expectedCycles, onComplete])

  const timer = useTimer({ duration, onComplete: handleComplete })

  const currentPhase = phaseIndex === null ? null : phases[phaseIndex]
  const panel = useMemo(
    () =>
      getPanel({
        completedCycles,
        expectedCycles,
        currentPhase,
        elapsedMs: timer.elapsedMs,
      }),
    [completedCycles, currentPhase, expectedCycles, getPanel, timer.elapsedMs],
  )

  const visualStyle = {
    transform: `scale(${currentPhase?.scale ?? 0.34})`,
    backgroundColor: currentPhase?.bgColor ?? '#082f49',
    boxShadow: `0 0 100px 26px ${currentPhase?.glowColor ?? 'rgba(14,165,233,0.12)'}`,
    transition: [
      `transform ${currentPhase?.durationMs ?? 600}ms ease-in-out`,
      'background-color 600ms ease',
      'box-shadow 600ms ease',
    ].join(', '),
  }

  const handleStartPause = () => {
    if (timer.isRunning) {
      clearPhaseTimers()
      setPhaseIndex(null)
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
    startPhaseRef.current?.(0)
    timer.start()
  }

  const handleRestart = () => {
    clearPhaseTimers()
    setPhaseIndex(null)
    setPhaseSecondsLeft(0)
    setCompletedCycles(0)
    setPauseCount(0)
    cyclesRef.current = 0
    pauseCountRef.current = 0
    totalActiveMsRef.current = 0
    activeStartRef.current = null
    timer.reset()
  }

  return (
    <ExerciseFrame
      accentColor={accentColor}
      timeLeftSeconds={timer.timeLeftSeconds}
      timerProgress={timer.progress}
      moduleProgress={Math.min((completedCycles / Math.max(expectedCycles, 1)) * 100, 100)}
      isRunning={timer.isRunning}
      onStartPause={handleStartPause}
      onRestart={handleRestart}
      footerAction={footerAction}
      metrics={
        <div className="grid gap-2 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Ciclos:{' '}
            <span className="font-semibold text-slate-950">
              {completedCycles} / {expectedCycles}
            </span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Fase: <span className="font-semibold text-slate-950">{currentPhase?.label ?? 'Pronto'}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Pausas: <span className="font-semibold text-slate-950">{pauseCount}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Ritmo: <span className="font-semibold text-slate-950">{panel.badge}</span>
          </div>
        </div>
      }
    >
      <ExerciseViewport>
        <div className="grid h-full min-h-0 w-full content-start items-start gap-4 overflow-y-auto rounded-[1.75rem] bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.16),_transparent_34%),linear-gradient(180deg,_#082f49_0%,_#020617_100%)] px-4 py-5 pb-6 text-white sm:px-6 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] [@media(max-height:820px)]:gap-3 [@media(max-height:820px)]:px-3 [@media(max-height:820px)]:py-3 [@media(max-height:820px)]:pb-5 [@media(max-height:820px)]:sm:px-4 [@media(max-height:768px)]:gap-2.5 [@media(max-height:768px)]:px-2.5 [@media(max-height:768px)]:py-2.5 [@media(max-height:768px)]:pb-4">
          <div className="flex min-h-0 self-start flex-col justify-between gap-4 rounded-[1.5rem] border border-white/10 bg-white/6 px-5 py-5 [@media(max-height:820px)]:justify-start [@media(max-height:820px)]:gap-3 [@media(max-height:820px)]:px-4 [@media(max-height:820px)]:py-4 [@media(max-height:768px)]:gap-2.5 [@media(max-height:768px)]:px-3.5 [@media(max-height:768px)]:py-3">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-sky-100/50">
                Pratica somatica
              </div>
              <h2 className="mt-3 text-[clamp(1.8rem,3.5vw,2.8rem)] font-semibold tracking-tight text-white [@media(max-height:820px)]:text-[clamp(1.5rem,3vw,2.2rem)] [@media(max-height:768px)]:mt-2 [@media(max-height:768px)]:text-[clamp(1.15rem,2.2vw,1.75rem)]">
                {title}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/62 [@media(max-height:820px)]:leading-6 [@media(max-height:768px)]:mt-1.5 [@media(max-height:768px)]:text-[0.76rem] [@media(max-height:768px)]:leading-[1.15rem]">
                {summary}
              </p>
            </div>

            <div className="flex shrink-0 flex-col items-center justify-center gap-5 py-2 text-center [@media(max-height:820px)]:gap-3 [@media(max-height:820px)]:py-1 [@media(max-height:768px)]:gap-1.5 [@media(max-height:768px)]:py-0">
              <div className="min-h-[4.5rem] [@media(max-height:820px)]:min-h-[3.5rem] [@media(max-height:768px)]:min-h-[2.4rem]">
                <div className="text-[clamp(1.75rem,3.8vw,3rem)] font-semibold tracking-tight text-white [@media(max-height:820px)]:text-[clamp(1.4rem,3vw,2.4rem)] [@media(max-height:768px)]:text-[clamp(1.05rem,2.2vw,1.75rem)]">
                  {currentPhase?.label ?? 'Pronto'}
                </div>
                <div className="mt-1 text-base text-white/55 [@media(max-height:820px)]:text-sm [@media(max-height:768px)]:text-[0.76rem]">
                  {currentPhase?.sublabel ?? 'Inicie quando estiver estavel e confortavel.'}
                </div>
                {phaseIndex !== null ? (
                  <div className="mt-2 text-2xl font-light tabular-nums text-white/45 [@media(max-height:820px)]:text-xl [@media(max-height:768px)]:mt-1 [@media(max-height:768px)]:text-base">
                    {phaseSecondsLeft}s
                  </div>
                ) : null}
              </div>

              <div className="flex h-48 w-48 items-center justify-center sm:h-56 sm:w-56 [@media(max-height:820px)]:h-40 [@media(max-height:820px)]:w-40 [@media(max-height:820px)]:sm:h-44 [@media(max-height:820px)]:sm:w-44 [@media(max-height:768px)]:h-28 [@media(max-height:768px)]:w-28 [@media(max-height:768px)]:sm:h-32 [@media(max-height:768px)]:sm:w-32">
                <div
                  className="flex h-full w-full items-center justify-center rounded-full text-center"
                  style={visualStyle}
                >
                  <div className="max-w-[10rem] px-6 text-sm font-semibold uppercase tracking-[0.22em] text-white/88 [@media(max-height:820px)]:px-4 [@media(max-height:820px)]:text-xs [@media(max-height:768px)]:px-2.5 [@media(max-height:768px)]:text-[0.62rem]">
                    {panel.badge}
                  </div>
                </div>
              </div>

              <div className="w-full rounded-[1.5rem] border border-white/10 bg-black/18 px-4 py-4 text-left [@media(max-height:820px)]:px-4 [@media(max-height:820px)]:py-3 [@media(max-height:768px)]:px-3 [@media(max-height:768px)]:py-2">
                <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/40">
                  Pista atual
                </div>
                <div className="mt-2 text-lg font-semibold text-white [@media(max-height:820px)]:text-base [@media(max-height:768px)]:mt-1 [@media(max-height:768px)]:text-[0.82rem]">
                  {currentPhase?.cueTitle ?? panel.title}
                </div>
                <p className="mt-1.5 text-sm leading-7 text-white/65 [@media(max-height:820px)]:leading-6 [@media(max-height:768px)]:text-[0.76rem] [@media(max-height:768px)]:leading-[1.1rem]">
                  {currentPhase?.cueText ?? panel.detail}
                </p>
              </div>
            </div>
          </div>

          <div className="grid min-h-0 self-start content-start gap-4 [@media(max-height:820px)]:gap-3 [@media(max-height:768px)]:gap-2.5">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/6 px-5 py-5 [@media(max-height:820px)]:px-4 [@media(max-height:820px)]:py-4 [@media(max-height:768px)]:px-3 [@media(max-height:768px)]:py-2.5">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/38">
                Foco atual
              </div>
              <div className="mt-3 text-2xl font-semibold text-white [@media(max-height:820px)]:text-xl [@media(max-height:768px)]:mt-1.5 [@media(max-height:768px)]:text-base">
                {panel.title}
              </div>
              <p className="mt-2 text-sm leading-7 text-white/62 [@media(max-height:820px)]:leading-6 [@media(max-height:768px)]:mt-1.5 [@media(max-height:768px)]:text-[0.76rem] [@media(max-height:768px)]:leading-[1.1rem]">
                {panel.detail}
              </p>
              {panel.mantra ? (
                <div className="mt-5 rounded-2xl border border-sky-300/20 bg-sky-400/10 px-4 py-3 [@media(max-height:820px)]:mt-4 [@media(max-height:768px)]:mt-2.5 [@media(max-height:768px)]:px-3 [@media(max-height:768px)]:py-2">
                  <div className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-sky-100/45">
                    Ancora
                  </div>
                  <div className="mt-1.5 text-lg font-semibold tracking-[0.24em] text-sky-100 [@media(max-height:820px)]:text-base [@media(max-height:768px)]:text-[0.82rem]">
                    {panel.mantra}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-black/15 px-5 py-5 [@media(max-height:820px)]:px-4 [@media(max-height:820px)]:py-4 [@media(max-height:768px)]:px-3 [@media(max-height:768px)]:py-2.5">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-white/38">
                Guia rapido
              </div>
              <div className="mt-4 grid gap-3 [@media(max-height:820px)]:mt-3 [@media(max-height:768px)]:mt-2 [@media(max-height:768px)]:gap-2">
                {helperLines.map((line) => (
                  <div
                    key={line}
                    className="rounded-2xl border border-white/8 bg-white/6 px-4 py-3 text-sm leading-6 text-white/68 [@media(max-height:820px)]:py-2.5 [@media(max-height:768px)]:px-3 [@media(max-height:768px)]:py-1.5 [@media(max-height:768px)]:text-[0.76rem] [@media(max-height:768px)]:leading-[1.1rem]"
                  >
                    {line}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ExerciseViewport>
    </ExerciseFrame>
  )
}

const ALTERNATE_NOSTRIL_PHASES: SomaticPhase[] = [
  {
    id: 'inhale-left',
    label: 'Inspire esquerda',
    sublabel: '4 segundos pela narina esquerda',
    durationMs: 4000,
    bgColor: '#075985',
    glowColor: 'rgba(56,189,248,0.50)',
    scale: 0.96,
    cueTitle: 'Polegar fecha a direita',
    cueText: 'Sinta o ar entrando pela esquerda sem pressa e com a coluna estavel.',
  },
  {
    id: 'hold',
    label: 'Segure',
    sublabel: '4 segundos com ambas fechadas',
    durationMs: 4000,
    bgColor: '#155e75',
    glowColor: 'rgba(34,211,238,0.36)',
    scale: 1,
    cueTitle: 'Suspensao suave',
    cueText: 'Segure sem tensao no rosto. O objetivo e equilibrio, nao esforco.',
  },
  {
    id: 'exhale-right',
    label: 'Expire direita',
    sublabel: '4 segundos pela narina direita',
    durationMs: 4000,
    bgColor: '#0f766e',
    glowColor: 'rgba(45,212,191,0.40)',
    scale: 0.34,
    cueTitle: 'Solte lentamente',
    cueText: 'Abra a direita e esvazie o ar de forma continua.',
  },
  {
    id: 'inhale-right',
    label: 'Inspire direita',
    sublabel: '4 segundos pela narina direita',
    durationMs: 4000,
    bgColor: '#0369a1',
    glowColor: 'rgba(14,165,233,0.42)',
    scale: 0.94,
    cueTitle: 'Troca de lado',
    cueText: 'Mantenha o peito calmo e a inspiracao precisa.',
  },
  {
    id: 'hold-right',
    label: 'Segure',
    sublabel: '4 segundos com ambas fechadas',
    durationMs: 4000,
    bgColor: '#164e63',
    glowColor: 'rgba(125,211,252,0.26)',
    scale: 1,
    cueTitle: 'Centro neutro',
    cueText: 'Use a pausa para perceber simetria entre os dois lados.',
  },
  {
    id: 'exhale-left',
    label: 'Expire esquerda',
    sublabel: '4 segundos pela narina esquerda',
    durationMs: 4000,
    bgColor: '#083344',
    glowColor: 'rgba(103,232,249,0.24)',
    scale: 0.34,
    cueTitle: 'Feche o ciclo',
    cueText: 'Expire pela esquerda e prepare o proximo ciclo com calma.',
  },
]

const MANTRA_PHASES: SomaticPhase[] = [
  {
    id: 'inhale',
    label: 'Inspirar',
    sublabel: '4 segundos para estabilizar a atencao',
    durationMs: 4000,
    bgColor: '#0f766e',
    glowColor: 'rgba(45,212,191,0.38)',
    scale: 0.92,
    cueTitle: 'Encontre o ritmo',
    cueText: 'Use a inspiracao para abrir espaco mental sem acelerar.',
  },
  {
    id: 'anchor',
    label: 'Mantra',
    sublabel: '2 segundos repetindo a silaba ancora',
    durationMs: 2000,
    bgColor: '#0f172a',
    glowColor: 'rgba(148,163,184,0.24)',
    scale: 1,
    cueTitle: 'Repita internamente',
    cueText: 'Escolha uma ancora simples, como OM, SO ou HUM, e mantenha constancia.',
  },
  {
    id: 'count',
    label: 'Contagem',
    sublabel: '2 segundos para marcar o numero atual',
    durationMs: 2000,
    bgColor: '#1e293b',
    glowColor: 'rgba(148,163,184,0.20)',
    scale: 0.52,
    cueTitle: 'Marque o numero',
    cueText: 'Conte mentalmente o ciclo atual sem perder o fio do mantra.',
  },
]

const MUDRA_PHASES: SomaticPhase[] = [
  {
    id: 'inhale',
    label: 'Pressione e inspire',
    sublabel: '4 segundos de respiracao com toque leve',
    durationMs: 4000,
    bgColor: '#1d4ed8',
    glowColor: 'rgba(96,165,250,0.38)',
    scale: 0.92,
    cueTitle: 'Ative os dedos com delicadeza',
    cueText: 'Nao aperte demais. O gesto deve ancorar a atencao, nao gerar tensao.',
  },
  {
    id: 'exhale',
    label: 'Relaxe e expire',
    sublabel: '6 segundos soltando a pressao',
    durationMs: 6000,
    bgColor: '#0f172a',
    glowColor: 'rgba(148,163,184,0.20)',
    scale: 0.42,
    cueTitle: 'Solte e observe',
    cueText: 'Perceba a diferenca de estado enquanto a expiracao desacelera o corpo.',
  },
]

const HAND_BREATH_PHASES: SomaticPhase[] = [
  {
    id: 'open',
    label: 'Abrir',
    sublabel: '4 segundos abrindo as maos',
    durationMs: 4000,
    bgColor: '#0c4a6e',
    glowColor: 'rgba(14,165,233,0.42)',
    scale: 0.92,
    cueTitle: 'Dedos se afastam',
    cueText: 'Abra as maos como flores, com movimento lento e controlado.',
  },
  {
    id: 'hold',
    label: 'Sustentar',
    sublabel: '2 segundos com as maos imoveis',
    durationMs: 2000,
    bgColor: '#164e63',
    glowColor: 'rgba(103,232,249,0.24)',
    scale: 1,
    cueTitle: 'Imobilidade breve',
    cueText: 'Segure o gesto e mantenha a atencao total na sensacao das maos.',
  },
  {
    id: 'close',
    label: 'Fechar',
    sublabel: '6 segundos fechando em punho suave',
    durationMs: 6000,
    bgColor: '#082f49',
    glowColor: 'rgba(56,189,248,0.22)',
    scale: 0.36,
    cueTitle: 'Feche sem rigidez',
    cueText: 'O movimento deve terminar macio, sem travar punhos ou ombros.',
  },
]

const VISUALIZATION_PHASES: SomaticPhase[] = [
  {
    id: 'center',
    label: 'Ponto central',
    sublabel: '5 segundos fixando a luz no centro',
    durationMs: 5000,
    bgColor: '#1e293b',
    glowColor: 'rgba(148,163,184,0.24)',
    scale: 0.28,
    cueTitle: 'Um ponto de luz',
    cueText: 'Imagine um centro estavel antes de expandir qualquer forma.',
  },
  {
    id: 'expand',
    label: 'Expandir',
    sublabel: '7 segundos deixando a forma crescer',
    durationMs: 7000,
    bgColor: '#1d4ed8',
    glowColor: 'rgba(96,165,250,0.36)',
    scale: 0.86,
    cueTitle: 'A estrutura aparece',
    cueText: 'Deixe a forma surgir com bordas simples e proporcionais.',
  },
  {
    id: 'mirror',
    label: 'Espelhar',
    sublabel: '8 segundos mantendo os dois lados identicos',
    durationMs: 8000,
    bgColor: '#0f766e',
    glowColor: 'rgba(45,212,191,0.28)',
    scale: 1,
    cueTitle: 'Simetria perfeita',
    cueText: 'Se um lado muda, o outro acompanha instantaneamente.',
  },
  {
    id: 'color',
    label: 'Colorir',
    sublabel: '5 segundos aplicando a mesma tonalidade',
    durationMs: 5000,
    bgColor: '#7c3aed',
    glowColor: 'rgba(196,181,253,0.24)',
    scale: 0.94,
    cueTitle: 'Mesma cor, mesmo peso',
    cueText: 'A cor deve preencher as duas metades com a mesma intensidade.',
  },
  {
    id: 'dissolve',
    label: 'Dissolver',
    sublabel: '5 segundos desfazendo a imagem com suavidade',
    durationMs: 5000,
    bgColor: '#0f172a',
    glowColor: 'rgba(148,163,184,0.14)',
    scale: 0.24,
    cueTitle: 'Deixe ir',
    cueText: 'Solte a imagem sem forcar. O controle aparece tambem ao encerrar.',
  },
]

function getCountingTarget(duration: number, cycleSeconds: number) {
  return Math.max(1, Math.ceil(duration / cycleSeconds))
}

export function AlternateNostrilBreathing(props: ExerciseModuleProps) {
  return (
    <GuidedSomaticPractice
      {...props}
      exerciseId="respiracao-alternada"
      accentColor="#0ea5e9"
      expectedCycles={getCountingTarget(props.duration, 24)}
      phases={ALTERNATE_NOSTRIL_PHASES}
      summary="Respiracao alternada para equilibrar foco, reduzir ruido mental e sincronizar os dois lados da atencao."
      helperLines={[
        'Use a mao direita para alternar as narinas sem pressionar com forca.',
        'Mantenha o rosto relaxado e a coluna ereta do inicio ao fim.',
        'Se faltar ar, reduza a intensidade e preserve o ritmo em vez de acelerar.',
      ]}
      getPanel={({ completedCycles, expectedCycles, currentPhase }) => ({
        badge:
          currentPhase?.id.includes('left')
            ? 'Lado esquerdo'
            : currentPhase?.id.includes('right')
              ? 'Lado direito'
              : 'Centro',
        title: 'Alternancia nasal',
        detail: `Ciclo ${Math.min(completedCycles + 1, expectedCycles)} de ${expectedCycles}. Deixe a troca de lado acontecer sem pressa e com atencao simetrica.`,
      })}
    />
  )
}

export function MantraCounting(props: ExerciseModuleProps) {
  return (
    <GuidedSomaticPractice
      {...props}
      exerciseId="mantra-contagem-mental"
      accentColor="#14b8a6"
      expectedCycles={getCountingTarget(props.duration, 8)}
      phases={MANTRA_PHASES}
      summary="Uma ancora mental simples combinada com contagem ritmica para treinar calma ativa e foco dividido."
      helperLines={[
        'Escolha uma silaba curta e mantenha a mesma ancora por toda a pratica.',
        'A contagem deve ser silenciosa e limpa, sem competir com a respiracao.',
        'Se perder o fio, volte ao numero 1 e retome com leveza.',
      ]}
      getPanel={({ completedCycles, expectedCycles }) => ({
        badge: `Contagem ${Math.min(completedCycles + 1, 21)}`,
        title: 'Mantra + numero atual',
        detail: `Voce esta marcando o ciclo ${Math.min(completedCycles + 1, expectedCycles)} de ${expectedCycles}. Priorize estabilidade e nao velocidade.`,
        mantra: 'OM · SO · HUM',
      })}
    />
  )
}

export function MudraBreathing(props: ExerciseModuleProps) {
  return (
    <GuidedSomaticPractice
      {...props}
      exerciseId="mudras-respiracao"
      accentColor="#3b82f6"
      expectedCycles={getCountingTarget(props.duration, 10)}
      phases={MUDRA_PHASES}
      summary="Mudras simples combinados com respiracao lenta para ancorar corpo, foco e regulacao interna."
      helperLines={[
        'Nos tres primeiros ciclos use Chin Mudra: polegar e indicador unidos.',
        'Nos tres ciclos seguintes troque para Dhyana Mudra com as maos apoiadas no colo.',
        'Alterne em blocos de tres ciclos se a pratica durar mais tempo.',
      ]}
      getPanel={({ completedCycles, expectedCycles }) => {
        const mudraIndex = Math.floor(completedCycles / 3) % 2
        const mudra = mudraIndex === 0 ? 'Chin Mudra' : 'Dhyana Mudra'

        return {
          badge: mudra,
          title: 'Mudra ativo',
          detail: `Ciclo ${Math.min(completedCycles + 1, expectedCycles)} de ${expectedCycles}. Mantenha o gesto atual por tres ciclos antes de trocar.`,
        }
      }}
    />
  )
}

export function HandBreathCoordination(props: ExerciseModuleProps) {
  return (
    <GuidedSomaticPractice
      {...props}
      exerciseId="coordenacao-mao-respiracao"
      accentColor="#0ea5e9"
      expectedCycles={getCountingTarget(props.duration, 12)}
      phases={HAND_BREATH_PHASES}
      summary="Sincronize o gesto das maos com a respiracao para construir coerencia entre movimento, sensacao e presenca."
      helperLines={[
        'Abra na inspiracao, sustente por um instante e feche devagar na expiracao.',
        'Evite rigidez em antebracos, ombros e mandibula.',
        'Toda a pratica deve parecer macia, como um unico movimento continuo.',
      ]}
      getPanel={({ completedCycles, expectedCycles, currentPhase }) => ({
        badge:
          currentPhase?.id === 'open'
            ? 'Abrindo'
            : currentPhase?.id === 'hold'
              ? 'Sustentando'
              : currentPhase?.id === 'close'
                ? 'Fechando'
                : 'Presenca',
        title: 'Estado das maos',
        detail: `Ciclo ${Math.min(completedCycles + 1, expectedCycles)} de ${expectedCycles}. Sinta as maos como o ponto principal de atencao da pratica.`,
      })}
    />
  )
}

const VISUAL_SHAPES = ['TRIANGULO', 'HEXAGONO', 'FLOR', 'MANDALA']

export function SymmetricVisualization(props: ExerciseModuleProps) {
  return (
    <GuidedSomaticPractice
      {...props}
      exerciseId="visualizacao-simetrica"
      accentColor="#8b5cf6"
      expectedCycles={getCountingTarget(props.duration, 30)}
      phases={VISUALIZATION_PHASES}
      summary="Visualizacao interna em simetria para treinar estabilidade mental, controle visual e integracao bilateral."
      helperLines={[
        'Comece sempre do ponto central antes de abrir a forma.',
        'Se um lado se perder, reconstrua dos dois lados ao mesmo tempo.',
        'Use a dissolucao final para encerrar a imagem com suavidade e controle.',
      ]}
      getPanel={({ completedCycles, expectedCycles, currentPhase }) => {
        const shape = VISUAL_SHAPES[completedCycles % VISUAL_SHAPES.length] ?? VISUAL_SHAPES[0]

        return {
          badge: shape,
          title: 'Forma mental ativa',
          detail: `Ciclo ${Math.min(completedCycles + 1, expectedCycles)} de ${expectedCycles}. ${currentPhase?.id === 'color' ? 'Pinte as duas metades com a mesma tonalidade.' : 'Mantenha a forma equilibrada dos dois lados.'}`,
        }
      }}
    />
  )
}
