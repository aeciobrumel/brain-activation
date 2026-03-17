export type ExerciseCategory =
  | 'focus'
  | 'memory'
  | 'logic'
  | 'hemispheric'
  | 'speed'

export interface Exercise {
  id: string
  title: string
  category: ExerciseCategory
  color: string
  duration: number
  description: string
  instructions: string[]
}

export interface CategoryTheme {
  label: string
  description: string
  color: string
}
