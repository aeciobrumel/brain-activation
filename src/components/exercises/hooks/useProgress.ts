import { useMemo, useState } from 'react'

import { clamp } from '../../../lib/helpers'

export function useProgress(total: number) {
  const [current, setCurrent] = useState(0)

  const percentage = useMemo(() => {
    if (total <= 0) {
      return 0
    }

    return clamp((current / total) * 100, 0, 100)
  }, [current, total])

  return {
    current,
    setCurrent,
    percentage,
    advance: () => setCurrent((value) => Math.min(value + 1, total)),
    reset: () => setCurrent(0),
  }
}
