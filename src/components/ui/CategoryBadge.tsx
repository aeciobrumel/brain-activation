import { categoryThemes } from '../../data/exercises'
import type { ExerciseCategory } from '../../features/exercises/types'
import { hexToRgba } from '../../lib/helpers'

interface CategoryBadgeProps {
  category: ExerciseCategory
}

export function CategoryBadge({ category }: CategoryBadgeProps) {
  const theme = categoryThemes[category]

  return (
    <span
      className="inline-flex rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.24em]"
      style={{
        color: theme.color,
        backgroundColor: hexToRgba(theme.color, 0.14),
      }}
    >
      {theme.label}
    </span>
  )
}
