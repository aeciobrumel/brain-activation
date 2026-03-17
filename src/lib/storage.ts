import { getISODate } from './helpers'

export interface ProgressState {
  streakDays: number
  completedSessions: number
  completedExercises: number
  completedExerciseIds: string[]
  quickActivations: number
  lastCompletedDate: string | null
}

export interface SavedMemory {
  id: string
  input: string
  prompt: string
  imageUrl: string
  createdAt: string
}

const STORAGE_KEY = 'brain-activation-progress'
const SAVED_MEMORIES_KEY = 'brain-activation-memories'

const initialProgressState: ProgressState = {
  streakDays: 0,
  completedSessions: 0,
  completedExercises: 0,
  completedExerciseIds: [],
  quickActivations: 0,
  lastCompletedDate: null,
}

function safeWrite(progress: ProgressState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  return progress
}

export function getStoredProgress(): ProgressState {
  if (typeof window === 'undefined') {
    return initialProgressState
  }

  const raw = localStorage.getItem(STORAGE_KEY)

  if (!raw) {
    return initialProgressState
  }

  try {
    return { ...initialProgressState, ...JSON.parse(raw) }
  } catch {
    return initialProgressState
  }
}

function computeNextStreak(lastCompletedDate: string | null, nextDate: string) {
  if (!lastCompletedDate) {
    return 1
  }

  const previous = new Date(`${lastCompletedDate}T00:00:00`)
  const current = new Date(`${nextDate}T00:00:00`)
  const diffDays = Math.round((current.getTime() - previous.getTime()) / 86400000)

  if (diffDays <= 0) {
    return null
  }

  if (diffDays === 1) {
    return 'increment'
  }

  return 'reset'
}

export function incrementCompletedExercise(
  progress: ProgressState,
  exerciseId: string,
): ProgressState {
  const nextProgress = {
    ...progress,
    completedExercises: progress.completedExercises + 1,
    completedExerciseIds: progress.completedExerciseIds.includes(exerciseId)
      ? progress.completedExerciseIds
      : [...progress.completedExerciseIds, exerciseId],
  }

  return safeWrite(nextProgress)
}

export function incrementSessionCompletion(
  progress: ProgressState,
  exerciseIds: string[],
): ProgressState {
  const today = getISODate()
  const streakMode = computeNextStreak(progress.lastCompletedDate, today)

  const nextProgress = {
    ...progress,
    completedSessions: progress.completedSessions + 1,
    completedExerciseIds: Array.from(
      new Set([...progress.completedExerciseIds, ...exerciseIds]),
    ),
    streakDays:
      streakMode === null
        ? progress.streakDays
        : streakMode === 'increment'
          ? progress.streakDays + 1
          : 1,
    lastCompletedDate: today,
  }

  return safeWrite(nextProgress)
}

export function incrementQuickActivation(progress: ProgressState): ProgressState {
  const today = getISODate()
  const streakMode = computeNextStreak(progress.lastCompletedDate, today)

  return safeWrite({
    ...progress,
    quickActivations: progress.quickActivations + 1,
    lastCompletedDate: today,
    streakDays:
      streakMode === null
        ? progress.streakDays
        : streakMode === 'increment'
          ? progress.streakDays + 1
          : 1,
  })
}

export function resetStoredProgress() {
  return safeWrite(initialProgressState)
}

export function getSavedMemories(): SavedMemory[] {
  if (typeof window === 'undefined') {
    return []
  }

  const raw = localStorage.getItem(SAVED_MEMORIES_KEY)

  if (!raw) {
    return []
  }

  try {
    return JSON.parse(raw) as SavedMemory[]
  } catch {
    return []
  }
}

export function saveMemory(memory: SavedMemory) {
  const current = getSavedMemories()
  const next = [memory, ...current].slice(0, 12)
  localStorage.setItem(SAVED_MEMORIES_KEY, JSON.stringify(next))
  return next
}
