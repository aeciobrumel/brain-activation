import { createElement } from 'react'

import { categoryThemes } from '../../data/exercises'
import { getCategoryIcon } from '../../data/icons'
import type { ExerciseCategory } from '../../features/exercises/types'
import { hexToRgba } from '../../lib/helpers'

interface CategoryBadgeProps {
  category: ExerciseCategory
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  const theme = categoryThemes[category]
  const icon = getCategoryIcon(category)

  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.24em]"
      style={{
        color: theme.color,
        backgroundColor: hexToRgba(theme.color, 0.14),
      }}
    >
      {createElement(icon, { className: 'h-3.5 w-3.5' })}
      {theme.label}
    </span>
  )
}
