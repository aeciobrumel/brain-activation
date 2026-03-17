import { useCallback, useState } from 'react'

export function useRandom<T>(items: T[]) {
  const [current, setCurrent] = useState<T | null>(items[0] ?? null)

  const pick = useCallback(() => {
    if (items.length === 0) {
      return null
    }

    const next = items[Math.floor(Math.random() * items.length)]
    setCurrent(next)
    return next
  }, [items])

  const pickExcluding = useCallback(
    (excluded: T) => {
      const allowed = items.filter((item) => item !== excluded)

      if (allowed.length === 0) {
        setCurrent(excluded)
        return excluded
      }

      const next = allowed[Math.floor(Math.random() * allowed.length)]
      setCurrent(next)
      return next
    },
    [items],
  )

  return {
    current,
    setCurrent,
    pick,
    pickExcluding,
  }
}
