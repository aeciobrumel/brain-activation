import { useMemo, useState } from 'react'

import type { Exercise } from '../../exercises/types'

interface UseTrainingSessionOptions {
  exercises: Exercise[]
  onCompleteExercise: (exerciseId: string) => void
  onFinish: (exerciseIds: string[]) => void
}

export function useTrainingSession({
  exercises,
  onCompleteExercise,
  onFinish,
}: UseTrainingSessionOptions) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [completedIds, setCompletedIds] = useState<string[]>([])
  const [finished, setFinished] = useState(false)

  const currentExercise = exercises[currentIndex]
  const isComplete = currentIndex >= exercises.length

  const advance = () => {
    if (!currentExercise) {
      return
    }

    const nextCompletedIds = completedIds.includes(currentExercise.id)
      ? completedIds
      : [...completedIds, currentExercise.id]

    if (!completedIds.includes(currentExercise.id)) {
      onCompleteExercise(currentExercise.id)
      setCompletedIds(nextCompletedIds)
    }

    if (currentIndex === exercises.length - 1 && !finished) {
      onFinish(nextCompletedIds)
      setFinished(true)
    }

    setCurrentIndex((value) => value + 1)
  }

  const restart = () => {
    setCurrentIndex(0)
    setCompletedIds([])
    setFinished(false)
  }

  const progress = useMemo(() => {
    if (exercises.length === 0) {
      return 0
    }

    return (completedIds.length / exercises.length) * 100
  }, [completedIds.length, exercises.length])

  return {
    currentExercise,
    currentIndex,
    totalExercises: exercises.length,
    progress,
    isComplete,
    restart,
    advance,
  }
}
