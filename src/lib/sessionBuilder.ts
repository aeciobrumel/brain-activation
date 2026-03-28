import type { Exercise, ExerciseCategory } from '../features/exercises/types'
import { exercises, exercisesByCategory, categoryOrder } from '../data/exercises'
import { getExerciseScores, getBestScore } from './storage'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function shuffle<T>(array: T[]): T[] {
  const copy = [...array]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/** Lower score = higher priority (never-attempted exercises get score 0). */
function getExercisePriority(exerciseId: string): number {
  const best = getBestScore(exerciseId)
  return best ? best.neuralScore : 0
}

/** IDs of exercises completed in the last N sessions (approximated from score timestamps). */
function getRecentExerciseIds(withinMs: number = 24 * 60 * 60 * 1000): Set<string> {
  const scores = getExerciseScores()
  const cutoff = Date.now() - withinMs
  return new Set(scores.filter((s) => s.timestamp >= cutoff).map((s) => s.exerciseId))
}

/**
 * Pick the best exercise from a category considering:
 * 1. Avoid recently-done exercises (last 24h) when possible
 * 2. Prefer exercises with lower best-scores (weaker areas)
 * 3. Random tie-breaking for variety
 */
function pickFromCategory(
  category: ExerciseCategory,
  exclude: Set<string>,
  recentIds: Set<string>,
): Exercise {
  const pool = exercisesByCategory[category]
  if (pool.length === 0) throw new Error(`No exercises in category: ${category}`)

  // Filter out already-selected exercises
  const available = pool.filter((e) => !exclude.has(e.id))
  const candidates = available.length > 0 ? available : pool

  // Prefer non-recent, then sort by lowest score (weakest first)
  const nonRecent = candidates.filter((e) => !recentIds.has(e.id))
  const ranked = (nonRecent.length > 0 ? nonRecent : candidates)
    .map((e) => ({ exercise: e, priority: getExercisePriority(e.id) }))
    .sort((a, b) => a.priority - b.priority)

  // Among exercises with the same (or similar) priority, pick randomly
  const lowestPriority = ranked[0].priority
  const topTier = ranked.filter((r) => r.priority <= lowestPriority + 10)
  const pick = topTier[Math.floor(Math.random() * topTier.length)]

  return pick.exercise
}

/** Find the category where the user has the lowest average score. */
function getWeakestCategory(exclude?: ExerciseCategory): ExerciseCategory {
  const scores = getExerciseScores()
  const categoryScores: Record<string, { total: number; count: number }> = {}

  for (const cat of categoryOrder) {
    if (cat === exclude) continue
    categoryScores[cat] = { total: 0, count: 0 }
  }

  for (const score of scores) {
    const exercise = exercises.find((e) => e.id === score.exerciseId)
    if (!exercise || exercise.category === exclude) continue
    const entry = categoryScores[exercise.category]
    if (entry) {
      entry.total += score.neuralScore
      entry.count += 1
    }
  }

  let weakest: ExerciseCategory = categoryOrder.find((c) => c !== exclude) ?? 'focus'
  let lowestAvg = Infinity

  for (const [cat, data] of Object.entries(categoryScores)) {
    // Categories with 0 attempts get avg = 0 (highest priority)
    const avg = data.count === 0 ? 0 : data.total / data.count
    if (avg < lowestAvg) {
      lowestAvg = avg
      weakest = cat as ExerciseCategory
    }
  }

  return weakest
}

// ─── Session Builders ────────────────────────────────────────────────────────

/**
 * Build a Daily Training session (8 exercises):
 * - 1 from each of the 7 categories
 * - 1 extra from the weakest category
 * - Always starts with a focus/breathing exercise for parasympathetic activation
 * - Remaining order: memory → logic → hemispheric → creativity → pressure → speed → extra
 */
export function buildDailySession(): Exercise[] {
  const recentIds = getRecentExerciseIds()
  const selected = new Set<string>()
  const session: Exercise[] = []

  // Pick one from each category in a deliberate order
  const orderedCategories: ExerciseCategory[] = [
    'focus',
    'memory',
    'logic',
    'hemispheric',
    'creativity',
    'pressure',
    'speed',
  ]

  for (const category of orderedCategories) {
    const pick = pickFromCategory(category, selected, recentIds)
    session.push(pick)
    selected.add(pick.id)
  }

  // 8th exercise: extra from weakest category
  const weakest = getWeakestCategory()
  const extra = pickFromCategory(weakest, selected, recentIds)
  session.push(extra)

  return session
}

const QUICK_CATEGORIES: ExerciseCategory[] = ['focus', 'hemispheric', 'speed']

/**
 * Build a Quick Activation session (3 exercises):
 * - 1 focus (breathing/attention)
 * - 1 hemispheric (coordination)
 * - 1 speed (reaction/processing)
 * - Rotates within each category based on scores and recency
 */
export function buildQuickSession(): Exercise[] {
  const recentIds = getRecentExerciseIds()
  const selected = new Set<string>()
  const session: Exercise[] = []

  for (const category of QUICK_CATEGORIES) {
    const pick = pickFromCategory(category, selected, recentIds)
    session.push(pick)
    selected.add(pick.id)
  }

  return session
}
