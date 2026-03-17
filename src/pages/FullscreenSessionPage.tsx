import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { dailyTrainingExercises, quickActivationExercises } from '../data/exercises'
import { TrainingSession } from '../features/training/components/TrainingSession'

export function FullscreenSessionPage() {
  const { mode } = useParams()
  const isQuick = mode === 'quick'

  return (
    <div className="grid h-dvh min-h-dvh w-full grid-rows-[auto_minmax(0,1fr)] overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.08),_transparent_30%),linear-gradient(180deg,_#fffdf9_0%,_#f8fafc_100%)]">
      <header className="flex h-12 items-center px-3 sm:px-4 lg:px-6">
        <Link
          to={isQuick ? '/quick-activation' : '/daily-training'}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Sair
        </Link>
      </header>

      <main className="min-h-0 px-3 py-3 sm:px-5 sm:py-4 lg:px-8 lg:py-6">
        <div className="grid h-full min-h-0">
          <TrainingSession
            exercises={isQuick ? quickActivationExercises : dailyTrainingExercises}
            mode={isQuick ? 'quick' : 'daily'}
            immersive
          />
        </div>
      </main>
    </div>
  )
}
