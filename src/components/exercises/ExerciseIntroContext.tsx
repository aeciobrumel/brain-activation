import type { ReactNode } from 'react'
import { createContext, useContext } from 'react'

import type { Exercise, ExerciseIntroMedia } from '../../features/exercises/types'

export interface ExerciseIntroContent {
  id: string
  title: string
  description: string
  duration: number
  instructions: string[]
  introMedia?: ExerciseIntroMedia
}

const ExerciseIntroContext = createContext<ExerciseIntroContent | null>(null)

interface ExerciseIntroProviderProps {
  exercise: Exercise
  children: ReactNode
}

export function ExerciseIntroProvider({
  exercise,
  children,
}: ExerciseIntroProviderProps) {
  const value: ExerciseIntroContent = {
    id: exercise.id,
    title: exercise.title,
    description: exercise.description,
    duration: exercise.duration,
    instructions: exercise.instructions,
    introMedia: exercise.introMedia,
  }

  return (
    <ExerciseIntroContext.Provider value={value}>
      {children}
    </ExerciseIntroContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useExerciseIntro() {
  return useContext(ExerciseIntroContext)
}
