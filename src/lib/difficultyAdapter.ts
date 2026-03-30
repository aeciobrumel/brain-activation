import { getExerciseScores } from './storage'

export type Difficulty = 'easy' | 'medium' | 'hard'

/**
 * Calculates the ideal difficulty for a player based on their
 * last 5 scores for the given exercise.
 *
 * - Average score >= 75 → hard
 * - Average score >= 45 → medium
 * - Otherwise → easy
 */
export function getPlayerDifficulty(exerciseId: string): Difficulty {
  const scores = getExerciseScores(exerciseId)
  const recent = scores.slice(0, 5)

  if (recent.length === 0) return 'easy'

  const avg = recent.reduce((sum, s) => sum + s.neuralScore, 0) / recent.length

  if (avg >= 75) return 'hard'
  if (avg >= 45) return 'medium'
  return 'easy'
}
