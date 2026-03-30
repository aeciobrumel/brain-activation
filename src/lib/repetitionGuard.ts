const STORAGE_KEY = 'brain-activation-recent-items'
const MAX_AGE_MS = 72 * 60 * 60 * 1000 // 72 hours

interface RecentEntry {
  exerciseType: string
  itemId: string
  timestamp: number
}

function loadEntries(): RecentEntry[] {
  if (typeof window === 'undefined') return []
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return []
  try {
    return JSON.parse(raw) as RecentEntry[]
  } catch {
    return []
  }
}

function saveEntries(entries: RecentEntry[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

function pruneOldEntries(entries: RecentEntry[]): RecentEntry[] {
  const cutoff = Date.now() - MAX_AGE_MS
  return entries.filter((e) => e.timestamp >= cutoff)
}

export function markUsed(exerciseType: string, itemId: string): void {
  const entries = pruneOldEntries(loadEntries())
  entries.push({ exerciseType, itemId, timestamp: Date.now() })
  saveEntries(entries)
}

export function markManyUsed(exerciseType: string, itemIds: string[]): void {
  const entries = pruneOldEntries(loadEntries())
  const now = Date.now()
  for (const itemId of itemIds) {
    entries.push({ exerciseType, itemId, timestamp: now })
  }
  saveEntries(entries)
}

export function getRecentIds(exerciseType: string): Set<string> {
  const entries = pruneOldEntries(loadEntries())
  return new Set(
    entries.filter((e) => e.exerciseType === exerciseType).map((e) => e.itemId),
  )
}

/**
 * Filters items removing recently used ones.
 * If all items are recent, returns the full list (reset).
 */
export function filterAvailable<T>(
  exerciseType: string,
  items: T[],
  getId: (item: T) => string,
): T[] {
  const recent = getRecentIds(exerciseType)
  const available = items.filter((item) => !recent.has(getId(item)))
  return available.length > 0 ? available : items
}
