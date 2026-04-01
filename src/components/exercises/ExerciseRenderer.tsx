import { lazy, Suspense, type ReactNode } from 'react'

import type { Exercise } from '../../features/exercises/types'
import { ExerciseIntroProvider } from './ExerciseIntroContext'

interface ExerciseRendererProps {
  exercise: Exercise
  onComplete: () => void
  footerAction?: ReactNode
}

type ExerciseComponent = (props: {
  duration: number
  title: string
  onComplete: () => void
  footerAction?: ReactNode
}) => ReactNode

const EXERCISE_COMPONENTS: Record<string, React.LazyExoticComponent<(props: { duration: number; title: string; onComplete: () => void; footerAction?: ReactNode }) => ReactNode>> = {
  'respiracao-478': lazy(() => import('./BreathingExercise').then((m) => ({ default: m.BreathingExercise }))),
  'respiracao-tatica': lazy(() => import('./BreathingExercise').then((m) => ({ default: m.TacticalBreathing }))),
  'rastreamento-ocular': lazy(() => import('./EyeTracking').then((m) => ({ default: m.EyeTracking }))),
  'palavra-vs-cor': lazy(() => import('./StroopTest').then((m) => ({ default: m.StroopTest }))),
  'numeros-em-ordem': lazy(() => import('./NumberScan').then((m) => ({ default: m.NumberScan }))),
  'reacao-rapida': lazy(() => import('./ReactionTest').then((m) => ({ default: m.ReactionTest }))),
  'associacao-visual': lazy(() => import('./Association').then((m) => ({ default: m.Association }))),
  'atencao-periferica': lazy(() => import('./PeripheralAttention').then((m) => ({ default: m.PeripheralAttention }))),
  'toque-cruzado': lazy(() => import('./HemisphereCoordination').then((m) => ({ default: m.HemisphereCoordination }))),
  'usos-alternativos': lazy(() => import('./AlternativeUses').then((m) => ({ default: m.AlternativeUses }))),
  'tracar-infinito': lazy(() => import('./InfinityTrace').then((m) => ({ default: m.InfinityTrace }))),
  'cadeia-de-ideias': lazy(() => import('./IdeaChain').then((m) => ({ default: m.IdeaChain }))),
  'sequencia-logica': lazy(() => import('./LogicSequence').then((m) => ({ default: m.LogicSequence }))),
  'jogo-da-memoria': lazy(() => import('./MemoryMatch').then((m) => ({ default: m.MemoryMatch }))),
  'rotacao-mental': lazy(() => import('./MentalRotation').then((m) => ({ default: m.MentalRotation }))),
  'desenho-espelhado': lazy(() => import('./MirrorDraw').then((m) => ({ default: m.MirrorDraw }))),
  'padrao-numerico': lazy(() => import('./NumberPattern').then((m) => ({ default: m.NumberPattern }))),
  'par-ou-impar': lazy(() => import('./OddEven').then((m) => ({ default: m.OddEven }))),
  'simbolo-diferente': lazy(() => import('./OddOneOut').then((m) => ({ default: m.OddOneOut }))),
  'analogias-rapidas': lazy(() => import('./RapidAnalogies').then((m) => ({ default: m.RapidAnalogies }))),
  'decisao-rapida': lazy(() => import('./RapidDecision').then((m) => ({ default: m.RapidDecision }))),
  'contagem-reversa': lazy(() => import('./ReverseCount').then((m) => ({ default: m.ReverseCount }))),
  'alternancia-simbolo-numero': lazy(() => import('./SymbolNumberSwitch').then((m) => ({ default: m.SymbolNumberSwitch }))),
  'sequencia-visual': lazy(() => import('./VisualSequence').then((m) => ({ default: m.VisualSequence }))),
  'lista-de-palavras': lazy(() => import('./WordRecall').then((m) => ({ default: m.WordRecall }))),
  'respiracao-alternada': lazy(() => import('./SomaticPractices').then((m) => ({ default: m.AlternateNostrilBreathing }))),
  'mantra-contagem-mental': lazy(() => import('./SomaticPractices').then((m) => ({ default: m.MantraCounting }))),
  'mudras-respiracao': lazy(() => import('./SomaticPractices').then((m) => ({ default: m.MudraBreathing }))),
  'coordenacao-mao-respiracao': lazy(() => import('./SomaticPractices').then((m) => ({ default: m.HandBreathCoordination }))),
  'visualizacao-simetrica': lazy(() => import('./SomaticPractices').then((m) => ({ default: m.SymmetricVisualization }))),
}

export function ExerciseRenderer({
  exercise,
  onComplete,
  footerAction,
}: ExerciseRendererProps) {
  const Component = EXERCISE_COMPONENTS[exercise.id] as ExerciseComponent | undefined
  if (!Component) {
    return null
  }

  return (
    <ExerciseIntroProvider exercise={exercise}>
      <Suspense fallback={null}>
        <Component
          duration={exercise.duration}
          title={exercise.title}
          onComplete={onComplete}
          footerAction={footerAction}
        />
      </Suspense>
    </ExerciseIntroProvider>
  )
}
