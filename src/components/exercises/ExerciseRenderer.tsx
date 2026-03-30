import type { ReactNode } from 'react'

import type { Exercise } from '../../features/exercises/types'
import { BreathingExercise, TacticalBreathing } from './BreathingExercise'
import { EyeTracking } from './EyeTracking'
import { StroopTest } from './StroopTest'
import { NumberScan } from './NumberScan'
import { ReactionTest } from './ReactionTest'
import { Association } from './Association'
import { PeripheralAttention } from './PeripheralAttention'
import { HemisphereCoordination } from './HemisphereCoordination'
import { AlternativeUses } from './AlternativeUses'
import { InfinityTrace } from './InfinityTrace'
import { IdeaChain } from './IdeaChain'
import { LogicSequence } from './LogicSequence'
import { MemoryMatch } from './MemoryMatch'
import { MentalRotation } from './MentalRotation'
import { MirrorDraw } from './MirrorDraw'
import { NumberPattern } from './NumberPattern'
import { OddEven } from './OddEven'
import { OddOneOut } from './OddOneOut'
import { RapidAnalogies } from './RapidAnalogies'
import { RapidDecision } from './RapidDecision'
import { ReverseCount } from './ReverseCount'
import { SymbolNumberSwitch } from './SymbolNumberSwitch'
import { VisualSequence } from './VisualSequence'
import { WordRecall } from './WordRecall'
import { ExerciseIntroProvider } from './ExerciseIntroContext'
import {
  AlternateNostrilBreathing,
  HandBreathCoordination,
  MantraCounting,
  MudraBreathing,
  SymmetricVisualization,
} from './SomaticPractices'

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

const EXERCISE_COMPONENTS: Record<string, ExerciseComponent> = {
  'respiracao-478': BreathingExercise,
  'rastreamento-ocular': EyeTracking,
  'palavra-vs-cor': StroopTest,
  'numeros-em-ordem': NumberScan,
  'reacao-rapida': ReactionTest,
  'associacao-visual': Association,
  'atencao-periferica': PeripheralAttention,
  'contagem-reversa': ReverseCount,
  'lista-de-palavras': WordRecall,
  'sequencia-visual': VisualSequence,
  'jogo-da-memoria': MemoryMatch,
  'toque-cruzado': HemisphereCoordination,
  'desenho-espelhado': MirrorDraw,
  'alternancia-simbolo-numero': SymbolNumberSwitch,
  'tracar-infinito': InfinityTrace,
  'usos-alternativos': AlternativeUses,
  'cadeia-de-ideias': IdeaChain,
  'respiracao-tatica': TacticalBreathing,
  'padrao-numerico': NumberPattern,
  'rotacao-mental': MentalRotation,
  'simbolo-diferente': OddOneOut,
  'sequencia-logica': LogicSequence,
  'analogias-rapidas': RapidAnalogies,
  'decisao-rapida': RapidDecision,
  'par-ou-impar': OddEven,
  'respiracao-alternada': AlternateNostrilBreathing,
  'mantra-contagem-mental': MantraCounting,
  'mudras-respiracao': MudraBreathing,
  'coordenacao-mao-respiracao': HandBreathCoordination,
  'visualizacao-simetrica': SymmetricVisualization,
}

export function ExerciseRenderer({
  exercise,
  onComplete,
  footerAction,
}: ExerciseRendererProps) {
  const Component = EXERCISE_COMPONENTS[exercise.id]
  if (!Component) {
    return null
  }

  return (
    <ExerciseIntroProvider exercise={exercise}>
      <Component
        duration={exercise.duration}
        title={exercise.title}
        onComplete={onComplete}
        footerAction={footerAction}
      />
    </ExerciseIntroProvider>
  )
}
