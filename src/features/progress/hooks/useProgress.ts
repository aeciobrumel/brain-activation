import { useCallback, useMemo, useState } from 'react'

import {
  getStoredProgress,
  incrementCompletedExercise,
  incrementQuickActivation,
  incrementSessionCompletion,
  resetStoredProgress,
} from '../../../lib/storage'

export function useProgress() {
  const [progress, setProgress] = useState(() => getStoredProgress())

  const completeExercise = useCallback((exerciseId: string) => {
    setProgress((current) => incrementCompletedExercise(current, exerciseId))
  }, [])

  const completeSession = useCallback((exerciseIds: string[]) => {
    setProgress((current) => incrementSessionCompletion(current, exerciseIds))
  }, [])

  const completeQuickActivation = useCallback(() => {
    setProgress((current) => incrementQuickActivation(current))
  }, [])

  const resetProgress = useCallback(() => {
    setProgress(resetStoredProgress())
  }, [])

  return useMemo(
    () => ({
      progress,
      completeExercise,
      completeSession,
      completeQuickActivation,
      resetProgress,
    }),
    [
      completeExercise,
      completeQuickActivation,
      completeSession,
      progress,
      resetProgress,
    ],
  )
}
