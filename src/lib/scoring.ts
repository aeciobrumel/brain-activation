import type { ExerciseScore } from '../features/exercises/types'

// ─── Core formula ────────────────────────────────────────────────────────────
// Weighted composite: accuracy 40%, consistency 30%, completion 30%
// Each component is normalised to [0, 1] before being combined.

export function computeNeuralScore(
  accuracy: number,
  consistency: number,
  completionRate: number,
): number {
  const raw = accuracy * 0.4 + consistency * 0.3 + completionRate * 0.3
  return Math.round(Math.min(Math.max(raw, 0), 1) * 100)
}

// ─── Grade label ─────────────────────────────────────────────────────────────

export function gradeFromScore(score: number): 'S' | 'A' | 'B' | 'C' | 'D' {
  if (score >= 90) return 'S'
  if (score >= 75) return 'A'
  if (score >= 60) return 'B'
  if (score >= 40) return 'C'
  return 'D'
}

// ─── Exercise-specific scorers ────────────────────────────────────────────────

export interface BreathingScoreParams {
  exerciseId: string
  completedCycles: number
  expectedCycles: number   // based on duration / cycle length
  pauseCount: number
  durationMs: number       // actual active time (elapsed while running)
  totalDurationMs: number  // full exercise duration
}

export function scoreBreathing(params: BreathingScoreParams): ExerciseScore {
  // accuracy  — did the user complete the expected number of breath cycles?
  const accuracy = Math.min(params.completedCycles / Math.max(params.expectedCycles, 1), 1)

  // consistency — penalise each pause by 15%, floor at 0
  const consistency = Math.max(0, 1 - params.pauseCount * 0.15)

  // completionRate — how much of the total duration was spent active
  const completionRate = Math.min(params.durationMs / Math.max(params.totalDurationMs, 1), 1)

  return {
    exerciseId: params.exerciseId,
    timestamp: Date.now(),
    neuralScore: computeNeuralScore(accuracy, consistency, completionRate),
    accuracy,
    consistency,
    completionRate,
    durationMs: params.durationMs,
    raw: {
      completedCycles: params.completedCycles,
      expectedCycles: params.expectedCycles,
      pauseCount: params.pauseCount,
    },
  }
}

export interface ReactionScoreParams {
  exerciseId: string
  correctResponses: number
  totalResponses: number
  averageReactionMs: number
  pauseCount: number
  durationMs: number
  totalDurationMs: number
}

export function scoreReactionExercise(params: ReactionScoreParams): ExerciseScore {
  // accuracy — ratio of correct to total responses (false-alarm penalised)
  const accuracy =
    params.totalResponses === 0
      ? 0
      : Math.min(params.correctResponses / params.totalResponses, 1)

  // consistency — reaction speed bonus (300ms = 1.0, 800ms = 0.0)
  const reactionBonus =
    params.averageReactionMs > 0
      ? Math.max(0, 1 - (params.averageReactionMs - 300) / 500)
      : 0

  const consistency = Math.max(0, reactionBonus - params.pauseCount * 0.1)
  const completionRate = Math.min(params.durationMs / Math.max(params.totalDurationMs, 1), 1)

  return {
    exerciseId: params.exerciseId,
    timestamp: Date.now(),
    neuralScore: computeNeuralScore(accuracy, consistency, completionRate),
    accuracy,
    consistency,
    completionRate,
    durationMs: params.durationMs,
    raw: {
      correctResponses: params.correctResponses,
      totalResponses: params.totalResponses,
      averageReactionMs: Math.round(params.averageReactionMs),
    },
  }
}

export interface DecisionScoreParams {
  exerciseId: string
  correctAnswers: number
  mistakes: number
  timeouts: number
  averageDecisionMs: number
  pauseCount: number
  durationMs: number
  totalDurationMs: number
}

export function scoreDecisionExercise(params: DecisionScoreParams): ExerciseScore {
  const answeredResponses = params.correctAnswers + params.mistakes
  const totalPrompts = answeredResponses + params.timeouts
  const accuracy =
    answeredResponses === 0 ? 0 : Math.min(params.correctAnswers / answeredResponses, 1)

  const reactionBonus =
    params.averageDecisionMs > 0
      ? Math.max(0, 1 - (params.averageDecisionMs - 300) / 500)
      : 0
  const responseRate =
    totalPrompts === 0 ? 0 : Math.min(answeredResponses / totalPrompts, 1)
  const consistency = Math.max(0, reactionBonus * responseRate - params.pauseCount * 0.1)
  const completionRate = Math.min(params.durationMs / Math.max(params.totalDurationMs, 1), 1)

  return {
    exerciseId: params.exerciseId,
    timestamp: Date.now(),
    neuralScore: computeNeuralScore(accuracy, consistency, completionRate),
    accuracy,
    consistency,
    completionRate,
    durationMs: params.durationMs,
    raw: {
      correctAnswers: params.correctAnswers,
      mistakes: params.mistakes,
      timeouts: params.timeouts,
      averageDecisionMs: Math.round(params.averageDecisionMs),
    },
  }
}

export interface CountdownScoreParams {
  exerciseId: string
  completedSteps: number
  errors: number
  streakMax: number
  durationMs: number
  totalDurationMs: number
}

export function scoreCountdown(params: CountdownScoreParams): ExerciseScore {
  const totalAttempts = params.completedSteps + params.errors
  const accuracy =
    totalAttempts === 0 ? 0 : Math.min(params.completedSteps / totalAttempts, 1)
  const consistency =
    totalAttempts === 0 ? 0 : Math.min(params.streakMax / totalAttempts, 1)
  const completionRate = Math.min(params.durationMs / Math.max(params.totalDurationMs, 1), 1)

  return {
    exerciseId: params.exerciseId,
    timestamp: Date.now(),
    neuralScore: computeNeuralScore(accuracy, consistency, completionRate),
    accuracy,
    consistency,
    completionRate,
    durationMs: params.durationMs,
    raw: {
      completedSteps: params.completedSteps,
      errors: params.errors,
      streakMax: params.streakMax,
    },
  }
}

export interface CreativityScoreParams {
  exerciseId: string
  totalOutputs: number
  targetOutputs: number
  qualityOutputs: number
  pauseCount?: number
  durationMs: number
  totalDurationMs: number
}

export function scoreCreativity(params: CreativityScoreParams): ExerciseScore {
  const accuracy =
    params.targetOutputs <= 0 ? 0 : Math.min(params.totalOutputs / params.targetOutputs, 1)
  const qualityRatio =
    params.totalOutputs <= 0 ? 0 : Math.min(params.qualityOutputs / params.totalOutputs, 1)
  const consistency = Math.max(0, qualityRatio - (params.pauseCount ?? 0) * 0.05)
  const completionRate = Math.min(params.durationMs / Math.max(params.totalDurationMs, 1), 1)

  return {
    exerciseId: params.exerciseId,
    timestamp: Date.now(),
    neuralScore: computeNeuralScore(accuracy, consistency, completionRate),
    accuracy,
    consistency,
    completionRate,
    durationMs: params.durationMs,
    raw: {
      totalOutputs: params.totalOutputs,
      targetOutputs: params.targetOutputs,
      qualityOutputs: params.qualityOutputs,
      pauseCount: params.pauseCount ?? 0,
    },
  }
}

export interface MemoryRecallScoreParams {
  exerciseId: string
  correctAnswers: number
  totalPrompts: number
  correctInOrder: number
  pauseCount?: number
  durationMs: number
  totalDurationMs: number
}

export function scoreMemoryRecall(params: MemoryRecallScoreParams): ExerciseScore {
  const accuracy =
    params.totalPrompts <= 0 ? 0 : Math.min(params.correctAnswers / params.totalPrompts, 1)
  const orderRatio =
    params.correctAnswers <= 0 ? 0 : Math.min(params.correctInOrder / params.correctAnswers, 1)
  const consistency = Math.max(0, orderRatio - (params.pauseCount ?? 0) * 0.04)
  const completionRate = Math.min(params.durationMs / Math.max(params.totalDurationMs, 1), 1)

  return {
    exerciseId: params.exerciseId,
    timestamp: Date.now(),
    neuralScore: computeNeuralScore(accuracy, consistency, completionRate),
    accuracy,
    consistency,
    completionRate,
    durationMs: params.durationMs,
    raw: {
      correctAnswers: params.correctAnswers,
      totalPrompts: params.totalPrompts,
      correctInOrder: params.correctInOrder,
      pauseCount: params.pauseCount ?? 0,
    },
  }
}

export interface GridScoreParams {
  exerciseId: string
  correctSelections: number
  totalSelections: number
  averageReactionMs?: number
  consistencyOverride?: number
  pauseCount?: number
  durationMs: number
  totalDurationMs: number
  raw?: Record<string, number>
}

export function scoreGridExercise(params: GridScoreParams): ExerciseScore {
  const accuracy =
    params.totalSelections <= 0 ? 0 : Math.min(params.correctSelections / params.totalSelections, 1)

  const speedConsistency =
    typeof params.averageReactionMs === 'number' && params.averageReactionMs > 0
      ? Math.max(0, 1 - (params.averageReactionMs - 600) / 1200)
      : 0

  const consistency = Math.max(
    0,
    (params.consistencyOverride ?? speedConsistency) - (params.pauseCount ?? 0) * 0.05,
  )
  const completionRate = Math.min(params.durationMs / Math.max(params.totalDurationMs, 1), 1)

  return {
    exerciseId: params.exerciseId,
    timestamp: Date.now(),
    neuralScore: computeNeuralScore(accuracy, consistency, completionRate),
    accuracy,
    consistency,
    completionRate,
    durationMs: params.durationMs,
    raw: {
      correctSelections: params.correctSelections,
      totalSelections: params.totalSelections,
      averageReactionMs: Math.round(params.averageReactionMs ?? 0),
      pauseCount: params.pauseCount ?? 0,
      ...(params.raw ?? {}),
    },
  }
}

export interface TrackingScoreParams {
  exerciseId: string
  averageDistance: number
  targetDistance: number
  greenZoneRatio: number
  coverageRatio?: number
  pauseCount?: number
  durationMs: number
  totalDurationMs: number
  raw?: Record<string, number>
}

export function scoreTrackingExercise(params: TrackingScoreParams): ExerciseScore {
  const accuracy = Math.max(0, 1 - params.averageDistance / Math.max(params.targetDistance, 1))
  const consistency = Math.max(
    0,
    ((params.greenZoneRatio + (params.coverageRatio ?? params.greenZoneRatio)) / 2) -
      (params.pauseCount ?? 0) * 0.05,
  )
  const completionRate = Math.min(params.durationMs / Math.max(params.totalDurationMs, 1), 1)

  return {
    exerciseId: params.exerciseId,
    timestamp: Date.now(),
    neuralScore: computeNeuralScore(accuracy, consistency, completionRate),
    accuracy,
    consistency,
    completionRate,
    durationMs: params.durationMs,
    raw: {
      averageDistance: Math.round(params.averageDistance),
      targetDistance: params.targetDistance,
      greenZoneRatio: Math.round(params.greenZoneRatio * 100),
      coverageRatio: Math.round((params.coverageRatio ?? 0) * 100),
      pauseCount: params.pauseCount ?? 0,
      ...(params.raw ?? {}),
    },
  }
}

export interface RoutineScoreParams {
  exerciseId: string
  completedCues: number
  expectedCues: number
  pauseCount?: number
  durationMs: number
  totalDurationMs: number
  raw?: Record<string, number>
}

export function scoreRoutineExercise(params: RoutineScoreParams): ExerciseScore {
  const accuracy =
    params.expectedCues <= 0 ? 0 : Math.min(params.completedCues / params.expectedCues, 1)
  const consistency = Math.max(0, 1 - (params.pauseCount ?? 0) * 0.08)
  const completionRate = Math.min(params.durationMs / Math.max(params.totalDurationMs, 1), 1)

  return {
    exerciseId: params.exerciseId,
    timestamp: Date.now(),
    neuralScore: computeNeuralScore(accuracy, consistency, completionRate),
    accuracy,
    consistency,
    completionRate,
    durationMs: params.durationMs,
    raw: {
      completedCues: params.completedCues,
      expectedCues: params.expectedCues,
      pauseCount: params.pauseCount ?? 0,
      ...(params.raw ?? {}),
    },
  }
}
