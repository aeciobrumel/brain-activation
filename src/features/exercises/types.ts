export type ExerciseCategory =
  | 'focus'
  | 'memory'
  | 'logic'
  | 'hemispheric'
  | 'speed'
  | 'creativity'
  | 'pressure'

export interface Exercise {
  id: string
  title: string
  category: ExerciseCategory
  color: string
  duration: number
  description: string
  instructions: string[]
  difficulty?: 1 | 2 | 3
  benefits?: string[]
}

export interface CategoryTheme {
  label: string
  description: string
  color: string
}

// Neural Score — composite of accuracy, consistency and completion rate
export interface ExerciseScore {
  exerciseId: string
  timestamp: number
  neuralScore: number      // 0–100 composite
  accuracy: number         // 0–1, exercise-specific (cycles done, correct answers, etc.)
  consistency: number      // 0–1, how uninterrupted the session was
  completionRate: number   // 0–1, elapsed / total duration
  durationMs: number       // actual ms spent in active state
  raw: Record<string, number> // exercise-specific raw metrics
}
