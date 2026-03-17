import type { ReactNode } from 'react'

import type { Exercise } from '../../features/exercises/types'
import { EyeTracking } from './EyeTracking'
import { StroopTest } from './StroopTest'
import { NumberScan } from './NumberScan'
import { ReactionTest } from './ReactionTest'
import { Association } from './Association'
import { PeripheralAttention } from './PeripheralAttention'
import { HemisphereCoordination } from './HemisphereCoordination'

interface ExerciseRendererProps {
  exercise: Exercise
  onComplete: () => void
  footerAction?: ReactNode
}

export function ExerciseRenderer({
  exercise,
  onComplete,
  footerAction,
}: ExerciseRendererProps) {
  switch (exercise.id) {
    case 'rastreamento-ocular':
      return (
        <EyeTracking
          duration={exercise.duration}
          title={exercise.title}
          onComplete={onComplete}
          footerAction={footerAction}
        />
      )
    case 'palavra-vs-cor':
      return (
        <StroopTest
          duration={exercise.duration}
          title={exercise.title}
          onComplete={onComplete}
          footerAction={footerAction}
        />
      )
    case 'numeros-em-ordem':
      return (
        <NumberScan
          duration={exercise.duration}
          title={exercise.title}
          onComplete={onComplete}
          footerAction={footerAction}
        />
      )
    case 'reacao-rapida':
      return (
        <ReactionTest
          duration={exercise.duration}
          title={exercise.title}
          onComplete={onComplete}
          footerAction={footerAction}
        />
      )
    case 'associacao-visual':
      return (
        <Association
          duration={exercise.duration}
          title={exercise.title}
          onComplete={onComplete}
          footerAction={footerAction}
        />
      )
    case 'atencao-periferica':
      return (
        <PeripheralAttention
          duration={exercise.duration}
          title={exercise.title}
          onComplete={onComplete}
          footerAction={footerAction}
        />
      )
    case 'toque-cruzado':
      return (
        <HemisphereCoordination
          duration={exercise.duration}
          title={exercise.title}
          onComplete={onComplete}
          footerAction={footerAction}
        />
      )
    default:
      return null
  }
}
