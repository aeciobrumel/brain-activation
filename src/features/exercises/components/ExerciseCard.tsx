import { Clock3, Sparkles } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '../../../components/ui/Button'
import { CategoryBadge } from '../../../components/ui/CategoryBadge'
import { Card } from '../../../components/ui/Card'
import type { Exercise } from '../types'
import { hexToRgba } from '../../../lib/helpers'

interface ExerciseCardProps {
  exercise: Exercise
  compact?: boolean
}

export function ExerciseCard({ exercise, compact = false }: ExerciseCardProps) {
  return (
    <Card
      className="overflow-hidden border-0"
      style={{
        background: `linear-gradient(180deg, ${hexToRgba(exercise.color, 0.14)} 0%, rgba(255,255,255,0.92) 42%)`,
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-4">
          <CategoryBadge category={exercise.category} />
          <h3 className="text-2xl font-semibold text-slate-950">{exercise.title}</h3>
        </div>
        <div
          className="flex h-11 w-11 items-center justify-center rounded-2xl"
          style={{ backgroundColor: hexToRgba(exercise.color, 0.18), color: exercise.color }}
        >
          <Sparkles className="h-5 w-5" />
        </div>
      </div>

      <p className="mt-4 text-sm leading-7 text-slate-600">{exercise.description}</p>

      <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/80 px-3 py-2 text-sm text-slate-600">
        <Clock3 className="h-4 w-4" style={{ color: exercise.color }} />
        {Math.ceil(exercise.duration / 60)} min
      </div>

      {!compact && (
        <>
          <ul className="mt-5 space-y-3 text-sm leading-6 text-slate-700">
            {exercise.instructions.map((instruction) => (
              <li key={instruction} className="flex gap-3">
                <span
                  className="mt-2 h-2 w-2 rounded-full"
                  style={{ backgroundColor: exercise.color }}
                />
                <span>{instruction}</span>
              </li>
            ))}
          </ul>
          <Link to={`/exercise/${exercise.id}`} className="mt-6 inline-flex">
            <Button>Start Exercise</Button>
          </Link>
        </>
      )}
    </Card>
  )
}
