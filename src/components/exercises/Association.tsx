import { useMemo, useState } from 'react'

import { ExerciseFrame } from './ExerciseFrame'
import { ExerciseViewport } from './ExerciseViewport'
import { useTimer } from './hooks/useTimer'

interface ExerciseModuleProps {
  duration: number
  title: string
  onComplete: () => void
  footerAction?: React.ReactNode
}

const abstractWords = [
  'FOCO',
  'ENERGIA',
  'CLAREZA',
  'FLUXO',
  'INTUICAO',
  'PRESENCA',
  'DISCIPLINA',
  'MEMORIA',
  'ATENCAO',
  'PRIORIDADE',
  'RITMO',
  'CONFIANCA',
  'CALMA',
  'PRESSAO',
  'RESILIENCIA',
  'ORDEM',
  'CAOS',
  'CRIATIVIDADE',
  'IMPACTO',
  'PRECISAO',
  'VELOCIDADE',
  'SILENCIO',
  'CONEXAO',
  'EQUILIBRIO',
  'DECISAO',
  'CORAGEM',
  'DIRECAO',
  'PACIENCIA',
  'PERSISTENCIA',
  'CURIOSIDADE',
  'LUCIDEZ',
  'EXPANSAO',
  'INTENCAO',
  'POTENCIA',
  'VISAO',
  'ESTRATEGIA',
  'IMAGINACAO',
  'CONTROLE',
  'LEVEZA',
  'ESTABILIDADE',
  'OBJETIVO',
  'ABUNDANCIA',
  'TENSAO',
  'ALINHAMENTO',
  'CONSTRUCAO',
  'ADAPTACAO',
  'PRESICAO',
  'ORGANIZACAO',
  'PLANEJAMENTO',
  'PERCEPCAO',
  'SINCRONIA',
  'INTENSIDADE',
  'CONSISTENCIA',
  'CONCENTRACAO',
  'SERENIDADE',
  'VITALIDADE',
]

export function Association({ duration, onComplete, footerAction }: ExerciseModuleProps) {
  const timer = useTimer({ duration, onComplete })
  const [wordOrder, setWordOrder] = useState(() =>
    [...abstractWords].sort(() => Math.random() - 0.5),
  )
  const roundIndex = Math.floor(timer.elapsedMs / 10000)
  const roundProgress = timer.elapsedMs % 10000
  const phase = roundProgress < 5000 ? 'imagine' : 'recall'
  const currentWord = useMemo(
    () => wordOrder[roundIndex % wordOrder.length] ?? abstractWords[0],
    [roundIndex, wordOrder],
  )

  return (
    <ExerciseFrame
      accentColor="#22c55e"
      timeLeftSeconds={timer.timeLeftSeconds}
      timerProgress={timer.progress}
      moduleProgress={phase === 'recall' ? 100 : (timer.elapsedMs % 5000) / 50}
      isRunning={timer.isRunning}
      onStartPause={timer.isRunning ? timer.pause : timer.start}
      onRestart={() => {
        setWordOrder([...abstractWords].sort(() => Math.random() - 0.5))
        timer.reset()
      }}
      footerAction={footerAction}
      metrics={
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Fase atual:{' '}
            <span className="font-semibold text-slate-950">
              {phase === 'imagine' ? 'Crie a imagem mental' : 'Recupere a imagem agora'}
            </span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Banco ativo:{' '}
            <span className="font-semibold text-slate-950">{abstractWords.length} palavras</span>
          </div>
        </div>
      }
    >
      <ExerciseViewport>
        <div className="flex h-full w-full flex-col justify-center gap-3 text-center">
          <div className="rounded-[1.75rem] bg-white px-4 py-8 sm:px-6 sm:py-10">
            <div className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
              Palavra abstrata
            </div>
            <div className="mt-3 text-[clamp(2rem,6vw,4.5rem)] font-bold text-slate-950">{currentWord}</div>
          </div>
          <div className="rounded-[1.75rem] border border-slate-200 bg-emerald-50 px-4 py-5 sm:px-6 sm:py-6">
            <div className="text-[clamp(0.95rem,1.4vw,1.125rem)] font-semibold text-slate-950">
              {phase === 'imagine'
                ? 'Crie uma imagem exagerada, absurda e memorável para essa palavra.'
                : 'Recupere a imagem agora e torne a cena mais vívida na mente.'}
            </div>
          </div>
        </div>
      </ExerciseViewport>
    </ExerciseFrame>
  )
}
