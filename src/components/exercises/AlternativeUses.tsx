import { useCallback, useMemo, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { scoreCreativity } from '../../lib/scoring'
import { slugify } from '../../lib/helpers'
import { saveExerciseScore } from '../../lib/storage'
import { ExerciseFrame } from './ExerciseFrame'
import { ExerciseInput } from './ExerciseInput'
import { ExerciseViewport } from './ExerciseViewport'
import { useTextInput } from './hooks/useTextInput'
import { useTimer } from './hooks/useTimer'

interface ExerciseModuleProps {
  duration: number
  title: string
  onComplete: () => void
  footerAction?: ReactNode
}

interface AlternativeObject {
  noun: string
  commonUses: string[]
}

interface SubmittedUse {
  text: string
  isOriginal: boolean
}

const OBJECTS: AlternativeObject[] = [
  { noun: 'TIJOLO', commonUses: ['peso de papel', 'calco de porta', 'apoio de livros', 'base para vaso', 'construcao'] },
  { noun: 'CLIPE', commonUses: ['organizar papeis', 'marcador de pagina', 'abrir bandeja de chip', 'gancho pequeno', 'fecho improvisado'] },
  { noun: 'JORNAL', commonUses: ['embrulhar objetos', 'forrar superficie', 'limpar vidro', 'acender fogo', 'proteger caixa'] },
  { noun: 'GARRAFA', commonUses: ['vaso de plantas', 'armazenar agua', 'peso de treino', 'funil improvisado', 'porta moedas'] },
  { noun: 'LAPIS', commonUses: ['marcar papel', 'prender coque', 'apontar detalhe', 'medir pequeno espaco', 'calco curto'] },
  { noun: 'MEIA', commonUses: ['limpar poeira', 'proteger objeto fragil', 'bolsa pequena', 'aquecedor improvisado', 'fantoche'] },
  { noun: 'PNEU', commonUses: ['balanco', 'vaso grande', 'peso de academia', 'barreira de treino', 'assento improvisado'] },
  { noun: 'CAIXA', commonUses: ['organizacao', 'apoio de notebook', 'embalagem', 'gaveta improvisada', 'banquinho leve'] },
  { noun: 'GARFO', commonUses: ['misturar massa', 'marcar sulcos', 'segurar alimento', 'desfazer no', 'raspar etiqueta'] },
  { noun: 'CORDA', commonUses: ['amarrar carga', 'pular corda', 'varal improvisado', 'delimitar espaco', 'tracao'] },
]

function pickRandomObject() {
  return OBJECTS[Math.floor(Math.random() * OBJECTS.length)] ?? OBJECTS[0]
}

function normalizeValue(value: string) {
  return slugify(value).replace(/-/g, ' ')
}

export function AlternativeUses({ duration, onComplete, footerAction }: ExerciseModuleProps) {
  const [currentObject, setCurrentObject] = useState<AlternativeObject>(() => pickRandomObject())
  const [submittedUses, setSubmittedUses] = useState<SubmittedUse[]>([])
  const [originalCount, setOriginalCount] = useState(0)
  const [averageResponseMs, setAverageResponseMs] = useState(0)
  const [pauseCount, setPauseCount] = useState(0)
  const [statusMessage, setStatusMessage] = useState(
    'Digite um uso incomum. Respostas fora do óbvio contam mais.',
  )

  const usedValuesRef = useRef<Set<string>>(new Set())
  const promptStartedAtRef = useRef<number | null>(null)
  const pauseCountRef = useRef(0)
  const activeStartRef = useRef<number | null>(null)
  const totalActiveMsRef = useRef(0)
  const originalCountRef = useRef(0)
  const responseCountRef = useRef(0)
  const averageResponseRef = useRef(0)

  const commonUses = useMemo(
    () => new Set(currentObject.commonUses.map((value) => normalizeValue(value))),
    [currentObject.commonUses],
  )

  const handleComplete = useCallback(() => {
    if (activeStartRef.current !== null) {
      totalActiveMsRef.current += performance.now() - activeStartRef.current
      activeStartRef.current = null
    }

    saveExerciseScore(
      scoreCreativity({
        exerciseId: 'usos-alternativos',
        totalOutputs: submittedUses.length,
        targetOutputs: 8,
        qualityOutputs: originalCountRef.current,
        pauseCount: pauseCountRef.current,
        durationMs: totalActiveMsRef.current,
        totalDurationMs: duration * 1000,
      }),
    )

    onComplete()
  }, [duration, onComplete, submittedUses.length])

  const timer = useTimer({ duration, onComplete: handleComplete })

  const input = useTextInput({
    onSubmit: (rawValue) => {
      if (!timer.isRunning) {
        return false
      }

      const normalizedValue = normalizeValue(rawValue)
      if (usedValuesRef.current.has(normalizedValue)) {
        setStatusMessage('Essa ideia ja apareceu. Tente fugir da repeticao.')
        return false
      }

      const responseMs =
        promptStartedAtRef.current === null ? 0 : performance.now() - promptStartedAtRef.current
      responseCountRef.current += 1
      averageResponseRef.current =
        responseCountRef.current === 1
          ? responseMs
          : (averageResponseRef.current * (responseCountRef.current - 1) + responseMs) /
            responseCountRef.current
      setAverageResponseMs(averageResponseRef.current)

      const isOriginal = !commonUses.has(normalizedValue)
      usedValuesRef.current.add(normalizedValue)

      setSubmittedUses((current) => [...current, { text: rawValue, isOriginal }])
      if (isOriginal) {
        originalCountRef.current += 1
        setOriginalCount(originalCountRef.current)
        setStatusMessage('Original. Continue explorando o improvavel.')
      } else {
        setStatusMessage('Valido, mas comum. Agora tente algo mais distante do uso obvio.')
      }

      promptStartedAtRef.current = performance.now()
      return true
    },
  })

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
    const nextObject = pickRandomObject()

    setCurrentObject(nextObject)
    setSubmittedUses([])
    setOriginalCount(0)
    setAverageResponseMs(0)
    setPauseCount(0)
    setStatusMessage('Digite um uso incomum. Respostas fora do obvio contam mais.')
    usedValuesRef.current = new Set()
    promptStartedAtRef.current = null
    pauseCountRef.current = 0
    activeStartRef.current = null
    totalActiveMsRef.current = 0
    originalCountRef.current = 0
    responseCountRef.current = 0
    averageResponseRef.current = 0
    input.setValue('')
    timer.reset()
  }

  return (
    <ExerciseFrame
      accentColor="#ec4899"
      timeLeftSeconds={timer.timeLeftSeconds}
      timerProgress={timer.progress}
      moduleProgress={Math.min((submittedUses.length / 8) * 100, 100)}
      isRunning={timer.isRunning}
      onStartPause={handleStartPause}
      onRestart={handleRestart}
      footerAction={footerAction}
      metrics={
        <div className="grid gap-2 sm:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Respostas: <span className="font-semibold text-slate-950">{submittedUses.length}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Originais: <span className="font-semibold text-slate-950">{originalCount}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Pausas: <span className="font-semibold text-slate-950">{pauseCount}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Media:{' '}
            <span className="font-semibold text-slate-950">
              {submittedUses.length > 0 ? `${Math.round(averageResponseMs)} ms` : 'Sem respostas'}
            </span>
          </div>
        </div>
      }
    >
      <ExerciseViewport>
        <div className="grid h-full min-h-0 w-full grid-rows-[auto_minmax(0,1fr)_auto] gap-4 rounded-[1.75rem] bg-[radial-gradient(circle_at_top,_rgba(236,72,153,0.14),_transparent_32%),linear-gradient(180deg,_#0f172a_0%,_#111827_100%)] px-4 py-5 text-white sm:px-6">
          <div className="text-center">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-white/40">
              Objeto da rodada
            </div>
            <div className="mt-2 text-[clamp(2.25rem,6vw,4rem)] font-semibold tracking-[-0.04em]">
              {currentObject.noun}
            </div>
          </div>

          <div className="grid min-h-0 gap-4 lg:grid-cols-[0.48fr_0.52fr]">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-5">
              <div className="text-sm uppercase tracking-[0.24em] text-pink-200/65">
                Direcao criativa
              </div>
              <div className="mt-3 text-lg font-semibold text-white">
                Pense em funcoes absurdas, praticas ou inesperadas.
              </div>
              <p className="mt-3 text-sm leading-7 text-white/55">{statusMessage}</p>
            </div>

            <div className="min-h-0 rounded-[1.5rem] border border-white/10 bg-black/15 p-4">
              <div className="text-sm uppercase tracking-[0.24em] text-white/40">
                Ideias capturadas
              </div>
              <div className="mt-4 flex max-h-full min-h-[11rem] flex-wrap content-start gap-2 overflow-y-auto">
                {submittedUses.length > 0 ? (
                  submittedUses.map((entry) => (
                    <span
                      key={`${entry.text}-${entry.isOriginal}`}
                      className="rounded-full px-3 py-2 text-sm font-medium"
                      style={{
                        backgroundColor: entry.isOriginal
                          ? 'rgba(236,72,153,0.2)'
                          : 'rgba(148,163,184,0.18)',
                        color: entry.isOriginal ? '#f9a8d4' : '#cbd5e1',
                      }}
                    >
                      {entry.text}
                    </span>
                  ))
                ) : (
                  <div className="text-sm leading-7 text-white/35">
                    Suas respostas aparecem aqui conforme voce envia.
                  </div>
                )}
              </div>
            </div>
          </div>

          <ExerciseInput
            value={input.value}
            onChange={input.setValue}
            onKeyDown={input.handleKeyDown}
            onSubmit={input.submit}
            feedback={input.feedback}
            disabled={!timer.isRunning}
            placeholder={timer.isRunning ? 'Digite um novo uso para o objeto' : 'Inicie o exercicio para responder'}
          />
        </div>
      </ExerciseViewport>
    </ExerciseFrame>
  )
}
