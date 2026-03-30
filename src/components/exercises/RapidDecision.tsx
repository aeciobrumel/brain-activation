import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import type { ReactNode } from 'react'

import { scoreDecisionExercise } from '../../lib/scoring'
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
  tag: string
  ruleLabel: string
  prompt: string
  options: { label: string; description: string }[]
  bestOptionIndex: number
}

const SCENARIOS: Scenario[] = [
  {
    tag: 'producao',
    ruleLabel: 'Reduza o risco imediato',
    prompt: 'Uma release acabou de quebrar o checkout de clientes ativos.',
    options: [
      { label: 'Reverter release', description: 'Restaura o fluxo critico em segundos.' },
      { label: 'Abrir ticket', description: 'Documenta o problema sem conter o dano.' },
      { label: 'Esperar logs', description: 'Coleta mais dados antes de agir.' },
    ],
    bestOptionIndex: 0,
  },
  {
    tag: 'foco',
    ruleLabel: 'Proteja a tarefa principal',
    prompt: 'Voce esta em flow e chega uma ideia paralela interessante.',
    options: [
      { label: 'Trocar agora', description: 'Aproveita a energia nova, mas quebra o foco.' },
      { label: 'Anotar e seguir', description: 'Preserva o trabalho atual sem perder a ideia.' },
      { label: 'Abrir mais abas', description: 'Mantem tudo aberto ao mesmo tempo.' },
    ],
    bestOptionIndex: 1,
  },
  {
    tag: 'comunicacao',
    ruleLabel: 'Corte ambiguidade rapido',
    prompt: 'Uma reuniao importante foi marcada sem pauta e sem objetivo.',
    options: [
      { label: 'Pedir pauta', description: 'Define expectativa antes da conversa.' },
      { label: 'Entrar assim mesmo', description: 'Espera descobrir o contexto ao vivo.' },
      { label: 'Ignorar convite', description: 'Evita o ruido sem alinhar o motivo.' },
    ],
    bestOptionIndex: 0,
  },
  {
    tag: 'prioridade',
    ruleLabel: 'Escolha a maior alavanca',
    prompt: 'Voce ganhou 50 minutos livres entre dois blocos do dia.',
    options: [
      { label: 'Limpar inbox', description: 'Resolve pendencias pequenas e difusas.' },
      { label: 'Atacar o gargalo', description: 'Empurra a tarefa mais importante.' },
      { label: 'Abrir rede social', description: 'Usa o tempo para dispersar.' },
    ],
    bestOptionIndex: 1,
  },
  {
    tag: 'qualidade',
    ruleLabel: 'Resolva a causa principal',
    prompt: 'O mesmo bug reapareceu pela terceira vez nesta semana.',
    options: [
      { label: 'Patch rapido', description: 'Esconde o sintoma por mais uma rodada.' },
      { label: 'Investigar causa raiz', description: 'Diminui recorrencia futura.' },
      { label: 'Delegar sem contexto', description: 'Passa a frente sem clareza.' },
    ],
    bestOptionIndex: 1,
  },
  {
    tag: 'energia',
    ruleLabel: 'Recupere clareza primeiro',
    prompt: 'Voce percebe fadiga mental forte antes de uma tarefa critica.',
    options: [
      { label: 'Respirar 2 min', description: 'Recupera presenca antes de continuar.' },
      { label: 'Forcar no impulso', description: 'Tenta terminar com baixa qualidade.' },
      { label: 'Abrir outra tarefa', description: 'Troca de contexto sem recuperar energia.' },
    ],
    bestOptionIndex: 0,
  },
  {
    tag: 'incidente',
    ruleLabel: 'Estabilize antes de otimizar',
    prompt: 'Uma fila de processamento cresceu subitamente e o sistema atrasou.',
    options: [
      { label: 'Aumentar observabilidade', description: 'Entende o problema sem conter a fila agora.' },
      { label: 'Aplicar mitigacao', description: 'Segura o impacto enquanto investiga.' },
      { label: 'Reescrever modulo', description: 'Escolhe a via mais longa em pleno incidente.' },
    ],
    bestOptionIndex: 1,
  },
  {
    tag: 'estudo',
    ruleLabel: 'Maximize retencao',
    prompt: 'Voce tem 25 minutos antes de uma prova ou entrevista tecnica.',
    options: [
      { label: 'Revisar pontos fracos', description: 'Recupera o que mais pesa no desempenho.' },
      { label: 'Consumir conteudo novo', description: 'Expande escopo perto da hora.' },
      { label: 'Organizar pasta', description: 'Gera movimento sem ganho cognitivo.' },
    ],
    bestOptionIndex: 0,
  },
  {
    tag: 'colaboracao',
    ruleLabel: 'Responder sem quebrar o bloco',
    prompt: 'Um colega pede ajuda enquanto voce esta fechando uma entrega.',
    options: [
      { label: 'Parar tudo agora', description: 'Ajuda no ato, mas interrompe o fechamento.' },
      { label: 'Combinar horario curto', description: 'Responde e preserva o checkpoint atual.' },
      { label: 'Ignorar mensagem', description: 'Protege o foco sem alinhamento minimo.' },
    ],
    bestOptionIndex: 1,
  },
  {
    tag: 'planejamento',
    ruleLabel: 'Escolha o proximo passo concreto',
    prompt: 'Uma tarefa esta vaga demais e voce sente travamento para comecar.',
    options: [
      { label: 'Definir primeiro passo', description: 'Reduz friccao de inicio imediatamente.' },
      { label: 'Esperar motivacao', description: 'Adia a entrada em acao.' },
      { label: 'Abrir mais referencias', description: 'Aumenta contexto sem iniciar.' },
    ],
    bestOptionIndex: 0,
  },
  {
    tag: 'pressao',
    ruleLabel: 'Comunique cedo',
    prompt: 'Ficou claro que um prazo prometido nao vai ser cumprido.',
    options: [
      { label: 'Avisar cedo', description: 'Permite realinhamento enquanto ainda ha margem.' },
      { label: 'Segurar silencio', description: 'Protege a conversa agora, piora depois.' },
      { label: 'Prometer mais horas', description: 'Aumenta risco e fadiga sem negociar escopo.' },
    ],
    bestOptionIndex: 0,
  },
  {
    tag: 'aprendizado',
    ruleLabel: 'Priorize feedback rapido',
    prompt: 'Voce terminou um rascunho inicial de uma feature importante.',
    options: [
      { label: 'Pedir review cedo', description: 'Corrige direcao antes de investir demais.' },
      { label: 'Polir sozinho', description: 'Gasta tempo antes de validar rumo.' },
      { label: 'Comecar outra feature', description: 'Abre nova frente sem fechar a primeira.' },
    ],
    bestOptionIndex: 0,
  },
  {
    tag: 'atencao',
    ruleLabel: 'Remova distracoes do caminho',
    prompt: 'Seu ambiente esta barulhento e voce precisa de foco profundo.',
    options: [
      { label: 'Trocar ambiente', description: 'Ataca a fonte da distracao.' },
      { label: 'Reclamar e seguir', description: 'Mantem o ruido no mesmo lugar.' },
      { label: 'Alternar tarefas', description: 'Aceita a fragmentacao mental.' },
    ],
    bestOptionIndex: 0,
  },
  {
    tag: 'delegacao',
    ruleLabel: 'Facilite execucao alheia',
    prompt: 'Voce vai passar uma tarefa importante para outra pessoa.',
    options: [
      { label: 'Mandar resumo vago', description: 'Entrega baixa clareza e alto retrabalho.' },
      { label: 'Dar contexto e criterio', description: 'Aumenta autonomia e chance de acerto.' },
      { label: 'Esperar ela adivinhar', description: 'Evita preparacao, perde eficiencia.' },
    ],
    bestOptionIndex: 1,
  },
  {
    tag: 'decisao',
    ruleLabel: 'Evite abrir frentes demais',
    prompt: 'Tres melhorias boas apareceram ao mesmo tempo no seu backlog.',
    options: [
      { label: 'Fazer um pouco de cada', description: 'Espalha energia e reduz conclusao.' },
      { label: 'Escolher uma e fechar', description: 'Gera progresso real e mensuravel.' },
      { label: 'Adicionar mais ideias', description: 'Aumenta dispersao antes de decidir.' },
    ],
    bestOptionIndex: 1,
  },
  {
    tag: 'falha',
    ruleLabel: 'Recupere estado estavel',
    prompt: 'Um experimento falhou e deixou a base em condicao incerta.',
    options: [
      { label: 'Voltar ao ultimo estado bom', description: 'Recupera confianca operacional.' },
      { label: 'Continuar mexendo', description: 'Aumenta variacao em cima do erro.' },
      { label: 'Trocar de contexto', description: 'Abandona o problema sem estabilizar.' },
    ],
    bestOptionIndex: 0,
  },
]

const TARGET_ROUNDS = 14
const FEEDBACK_DELAY_MS = 260

function shuffleScenarios() {
  const shuffled = [...SCENARIOS]

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]]
  }

  return shuffled
}

function getWindowMsForRound(resolvedRounds: number) {
  return Math.max(4200, 7000 - resolvedRounds * 180)
}

function getPressureLabel(windowMs: number) {
  if (windowMs <= 4800) return 'Alta pressao'
  if (windowMs <= 5800) return 'Ritmo forte'
  return 'Leitura rapida'
}

interface RapidDecisionState {
  scenarios: Scenario[]
  scenarioIndex: number
  correctAnswers: number
  mistakes: number
  timeouts: number
  averageDecisionMs: number
  pauseCount: number
  selectedIndex: number | null
  feedback: 'idle' | 'confirm' | 'timeout' | 'error'
  currentWindowMs: number
  hasStarted: boolean
  reactionCount: number
}

type RapidDecisionAction =
  | { type: 'start'; windowMs: number }
  | { type: 'pause' }
  | { type: 'record-answer'; index: number; isCorrect: boolean; decisionMs: number }
  | { type: 'record-timeout' }
  | {
      type: 'advance-scenario'
      nextScenarioIndex: number
      nextScenarios: Scenario[]
      nextWindowMs: number
    }
  | { type: 'reset'; scenarios: Scenario[] }

function createInitialRapidDecisionState(scenarios = shuffleScenarios()): RapidDecisionState {
  return {
    scenarios,
    scenarioIndex: 0,
    correctAnswers: 0,
    mistakes: 0,
    timeouts: 0,
    averageDecisionMs: 0,
    pauseCount: 0,
    selectedIndex: null,
    feedback: 'idle',
    currentWindowMs: getWindowMsForRound(0),
    hasStarted: false,
    reactionCount: 0,
  }
}

function rapidDecisionReducer(
  state: RapidDecisionState,
  action: RapidDecisionAction,
): RapidDecisionState {
  switch (action.type) {
    case 'start':
      return {
        ...state,
        hasStarted: true,
        currentWindowMs: action.windowMs,
      }
    case 'pause':
      return {
        ...state,
        pauseCount: state.pauseCount + 1,
      }
    case 'record-answer': {
      const nextReactionCount = state.reactionCount + 1
      const nextAverageDecisionMs =
        nextReactionCount === 1
          ? action.decisionMs
          : (state.averageDecisionMs * state.reactionCount + action.decisionMs) / nextReactionCount

      return {
        ...state,
        averageDecisionMs: nextAverageDecisionMs,
        selectedIndex: action.index,
        feedback: action.isCorrect ? 'confirm' : 'error',
        correctAnswers: action.isCorrect ? state.correctAnswers + 1 : state.correctAnswers,
        mistakes: action.isCorrect ? state.mistakes : state.mistakes + 1,
        reactionCount: nextReactionCount,
      }
    }
    case 'record-timeout':
      return {
        ...state,
        timeouts: state.timeouts + 1,
        selectedIndex: null,
        feedback: 'timeout',
      }
    case 'advance-scenario':
      return {
        ...state,
        scenarios: action.nextScenarios,
        scenarioIndex: action.nextScenarioIndex,
        selectedIndex: null,
        feedback: 'idle',
        currentWindowMs: action.nextWindowMs,
      }
    case 'reset':
      return createInitialRapidDecisionState(action.scenarios)
    default:
      return state
  }
}

function getResolvedRounds(state: RapidDecisionState) {
  return state.correctAnswers + state.mistakes + state.timeouts
}

function getNextScenarioState(state: RapidDecisionState) {
  const nextIndex = state.scenarioIndex + 1
  if (nextIndex >= state.scenarios.length) {
    return {
      nextScenarioIndex: 0,
      nextScenarios: shuffleScenarios(),
    }
  }

  return {
    nextScenarioIndex: nextIndex,
    nextScenarios: state.scenarios,
  }
}

export function RapidDecision({ duration, onComplete, footerAction }: ExerciseModuleProps) {
  const [state, dispatch] = useReducer(
    rapidDecisionReducer,
    undefined,
    createInitialRapidDecisionState,
  )
  const stateRef = useRef(state)

  const promptStartedAtRef = useRef<number | null>(null)
  const promptElapsedBeforePauseRef = useRef(0)
  const activeStartRef = useRef<number | null>(null)
  const totalActiveMsRef = useRef(0)
  const feedbackTimeoutRef = useRef<number | null>(null)

  const dispatchState = useCallback((action: RapidDecisionAction) => {
    stateRef.current = rapidDecisionReducer(stateRef.current, action)
    dispatch(action)
  }, [])

  const clearFeedbackTimeout = useCallback(() => {
    if (feedbackTimeoutRef.current !== null) {
      window.clearTimeout(feedbackTimeoutRef.current)
      feedbackTimeoutRef.current = null
    }
  }, [])

  const questionCountdown = usePromptCountdown({
    durationMs: state.currentWindowMs,
    onExpire: () => {
      dispatchState({ type: 'record-timeout' })
      clearFeedbackTimeout()

      feedbackTimeoutRef.current = window.setTimeout(() => {
        feedbackTimeoutRef.current = null
        advanceToNextScenario()
      }, FEEDBACK_DELAY_MS)
    },
  })

  const advanceToNextScenario = () => {
    const currentState = stateRef.current
    const nextWindowMs = getWindowMsForRound(getResolvedRounds(currentState))
    const nextScenarioState = getNextScenarioState(currentState)

    dispatchState({
      type: 'advance-scenario',
      nextWindowMs,
      ...nextScenarioState,
    })

    promptElapsedBeforePauseRef.current = 0
    promptStartedAtRef.current = performance.now()
    questionCountdown.start(nextWindowMs)
  }

  useEffect(() => () => clearFeedbackTimeout(), [clearFeedbackTimeout])

  const timer = useTimer({
    duration,
    onComplete: () => {
      clearFeedbackTimeout()

      if (activeStartRef.current !== null) {
        totalActiveMsRef.current += performance.now() - activeStartRef.current
        activeStartRef.current = null
      }

      saveExerciseScore(
        scoreDecisionExercise({
          exerciseId: 'decisao-rapida',
          correctAnswers: stateRef.current.correctAnswers,
          mistakes: stateRef.current.mistakes,
          timeouts: stateRef.current.timeouts,
          averageDecisionMs: stateRef.current.averageDecisionMs,
          pauseCount: stateRef.current.pauseCount,
          durationMs: totalActiveMsRef.current,
          totalDurationMs: duration * 1000,
        }),
      )

      onComplete()
    },
  })

  const currentScenario = useMemo(
    () => state.scenarios[state.scenarioIndex % state.scenarios.length] ?? state.scenarios[0],
    [state.scenarioIndex, state.scenarios],
  )

  const handleSelect = (index: number) => {
    if (!timer.isRunning || promptStartedAtRef.current === null) {
      return
    }

    const decisionMs = Math.max(performance.now() - promptStartedAtRef.current, 0)
    questionCountdown.pause()

    const isCorrect = index === currentScenario.bestOptionIndex

    dispatchState({ type: 'record-answer', index, isCorrect, decisionMs })

    clearFeedbackTimeout()
    feedbackTimeoutRef.current = window.setTimeout(() => {
      feedbackTimeoutRef.current = null
      advanceToNextScenario()
    }, FEEDBACK_DELAY_MS)
  }

  const handleStartPause = () => {
    if (feedbackTimeoutRef.current !== null) {
      return
    }

    if (timer.isRunning) {
      dispatchState({ type: 'pause' })
      questionCountdown.pause()

      if (promptStartedAtRef.current !== null) {
        promptElapsedBeforePauseRef.current = performance.now() - promptStartedAtRef.current
      }

      if (activeStartRef.current !== null) {
        totalActiveMsRef.current += performance.now() - activeStartRef.current
        activeStartRef.current = null
      }

      timer.pause()
      return
    }

    activeStartRef.current = performance.now()

    if (!stateRef.current.hasStarted) {
      const initialWindow = getWindowMsForRound(0)
      dispatchState({ type: 'start', windowMs: initialWindow })
      promptElapsedBeforePauseRef.current = 0
      promptStartedAtRef.current = performance.now()
      questionCountdown.start(initialWindow)
    } else {
      promptStartedAtRef.current = performance.now() - promptElapsedBeforePauseRef.current
      questionCountdown.resume()
    }

    timer.start()
  }

  const handleRestart = () => {
    clearFeedbackTimeout()
    dispatchState({ type: 'reset', scenarios: shuffleScenarios() })
    promptStartedAtRef.current = null
    promptElapsedBeforePauseRef.current = 0
    activeStartRef.current = null
    totalActiveMsRef.current = 0
    questionCountdown.reset(getWindowMsForRound(0))
    timer.reset()
  }

  const resolvedRounds = getResolvedRounds(state)
  const answeredRounds = state.correctAnswers + state.mistakes

  return (
    <ExerciseFrame
      accentColor="#14b8a6"
      timeLeftSeconds={timer.timeLeftSeconds}
      timerProgress={timer.progress}
      moduleProgress={Math.min((resolvedRounds / TARGET_ROUNDS) * 100, 100)}
      isRunning={timer.isRunning}
      onStartPause={handleStartPause}
      onRestart={handleRestart}
      footerAction={footerAction}
      metrics={
        <div className="grid gap-2 sm:grid-cols-5">
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Acertos: <span className="font-semibold text-slate-950">{state.correctAnswers}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Erros: <span className="font-semibold text-slate-950">{state.mistakes}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Timeouts: <span className="font-semibold text-slate-950">{state.timeouts}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Media:{' '}
            <span className="font-semibold text-slate-950">
              {state.reactionCount > 0
                ? `${Math.round(state.averageDecisionMs)} ms`
                : 'Sem respostas'}
            </span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Pausas: <span className="font-semibold text-slate-950">{state.pauseCount}</span>
          </div>
        </div>
      }
    >
      <ExerciseViewport>
        <div className="grid h-full min-h-0 w-full grid-rows-[auto_minmax(0,1fr)] gap-4 rounded-[1.75rem] bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.16),_transparent_32%),linear-gradient(180deg,_#042f2e_0%,_#0f172a_100%)] px-4 py-5 text-white sm:px-6">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
            <div>
              <div className="text-xs font-semibold uppercase tracking-[0.28em] text-teal-100/55">
                Decisao com regra ativa
              </div>
              <div className="mt-2 text-lg font-semibold text-white">
                Mais contexto, 3 opcoes e janela de resposta progressiva
              </div>
            </div>

            <div className="grid gap-2 sm:grid-cols-3">
              <div className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3">
                <div className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-teal-100/45">
                  Regra
                </div>
                <div className="mt-2 text-sm font-semibold text-white">{currentScenario.ruleLabel}</div>
              </div>
              <div className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3">
                <div className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-teal-100/45">
                  Pressao
                </div>
                <div className="mt-2 text-sm font-semibold text-white">
                  {getPressureLabel(state.currentWindowMs)}
                </div>
              </div>
              <div className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3">
                <div className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-teal-100/45">
                  Rodada
                </div>
                <div className="mt-2 text-sm font-semibold text-white">
                  {Math.min(resolvedRounds + 1, TARGET_ROUNDS)}
                </div>
              </div>
            </div>
          </div>

          <div className="grid min-h-0 gap-5">
            <div className="rounded-[1.75rem] border border-white/10 bg-white/5 px-5 py-6">
              <div className="text-xs font-semibold uppercase tracking-[0.24em] text-teal-100/45">
                Cenário {currentScenario.tag}
              </div>
              <div className="mt-3 text-[clamp(1.2rem,2.35vw,1.8rem)] font-semibold leading-9 text-white">
                {currentScenario.prompt}
              </div>
            </div>

            <ExerciseChoices
              options={currentScenario.options}
              onSelect={handleSelect}
              selectedIndex={state.selectedIndex}
              feedback={state.feedback}
              disabled={!timer.isRunning}
              countdownPercent={questionCountdown.progress}
              countdownLabel={`${Math.ceil(questionCountdown.timeLeftMs / 1000)}s`}
              accentColor="#14b8a6"
              layout="grid"
            />

            <div className="rounded-[1.2rem] border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
              Precisao atual baseada em respostas dadas:{' '}
              <span className="font-semibold text-white">
                {answeredRounds > 0
                  ? `${Math.round((state.correctAnswers / answeredRounds) * 100)}%`
                  : 'Sem respostas'}
              </span>
            </div>
          </div>
        </div>
      </ExerciseViewport>
    </ExerciseFrame>
  )
}
