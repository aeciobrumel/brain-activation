import { useMemo } from 'react'
import { X } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'

import { buildDailySession, buildQuickSession } from '../lib/sessionBuilder'
import { TrainingSession } from '../features/training/components/TrainingSession'

export function FullscreenSessionPage() {
  const { mode } = useParams()
  const isQuick = mode === 'quick'

  // Build a dynamic session once per mount — exercises rotate based on
  // past scores and recency so each session feels fresh.
  const exercises = useMemo(
    () => (isQuick ? buildQuickSession() : buildDailySession()),
    [isQuick],
  )

  return (
    <div className="relative flex h-[100dvh] min-h-[100dvh] w-full flex-col overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.08),_transparent_30%),linear-gradient(180deg,_#fffdf9_0%,_#f8fafc_100%)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex justify-start p-3 sm:p-4">
        <Link
          to={isQuick ? '/quick-activation' : '/daily-training'}
          aria-label="Sair da sessão"
          title="Sair"
          className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-slate-950/40 text-white shadow-[0_12px_30px_rgba(15,23,42,0.22)] backdrop-blur-md transition hover:bg-slate-950/55"
        >
          <X className="h-4 w-4" />
        </Link>
      </div>

      <main className="flex-1 min-h-0">
        <div className="flex h-full min-h-0 flex-col">
          <TrainingSession
            exercises={exercises}
            mode={isQuick ? 'quick' : 'daily'}
            immersive
          />
        </div>
      </main>
    </div>
  )
}
