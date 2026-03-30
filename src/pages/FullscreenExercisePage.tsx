import { CheckCircle2, SkipForward, X } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMemo, useState } from 'react'

import { ExerciseRenderer } from '../components/exercises/ExerciseRenderer'
import { Button } from '../components/ui/Button'
import { exercises } from '../data/exercises'

export function FullscreenExercisePage() {
  const { exerciseId } = useParams()
  const navigate = useNavigate()
  const [isComplete, setIsComplete] = useState(false)
  const [attemptKey, setAttemptKey] = useState(0)

  const exercise = useMemo(
    () => exercises.find((item) => item.id === exerciseId),
    [exerciseId],
  )

  const handleClose = () => {
    if (window.history.length > 1) {
      navigate(-1)
      return
    }

    navigate('/library', { replace: true })
  }

  if (!exercise) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="rounded-[2rem] border border-slate-200 bg-white/85 p-8 text-center">
          <p className="text-slate-600">Exercício não encontrado.</p>
          <Link to="/library" className="mt-4 inline-flex">
            <Button>Voltar para a biblioteca</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex h-[100dvh] min-h-[100dvh] w-full flex-col overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.08),_transparent_30%),linear-gradient(180deg,_#fffdf9_0%,_#f8fafc_100%)]">
      <div className="pointer-events-none absolute inset-x-0 top-0 z-30 flex justify-start p-3 sm:p-4">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Sair do exercício"
          title="Sair"
          className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-slate-950/40 text-white shadow-[0_12px_30px_rgba(15,23,42,0.22)] backdrop-blur-md transition hover:bg-slate-950/55"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <main className="relative flex-1 min-h-0">
        {isComplete ? (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/[0.58] px-6 text-white backdrop-blur-md">
            <div className="w-full max-w-xl text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-400/[0.18] text-emerald-300">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="mt-6 text-3xl font-semibold text-white">Exercício concluído</h2>
              <p className="mt-3 text-white/75">
                A sessão individual terminou. Você pode retornar para a biblioteca ou iniciar outro módulo.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link to="/library">
                  <Button>Voltar para biblioteca</Button>
                </Link>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setIsComplete(false)
                    setAttemptKey((current) => current + 1)
                  }}
                  className="bg-white text-black hover:bg-white/[0.18]"
                >
                  Repetir exercício
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full min-h-0 flex-col overflow-hidden">
            <ExerciseRenderer
              key={`${exercise.id}:${attemptKey}`}
              exercise={exercise}
              onComplete={() => setIsComplete(true)}
              footerAction={
                <Button
                  // This shortcut only opens the completion overlay. The renderer still
                  // does not expose an imperative completion API to trigger module-specific
                  // score/progress finalisation before leaving the exercise early.
                  onClick={() => setIsComplete(true)}
                  size="icon"
                  title="Próximo"
                  aria-label="Próximo"
                  className="bg-white/[0.15] text-white ring-1 ring-white/20 hover:bg-white/[0.25]"
                >
                  <SkipForward className="h-5 w-5 drop-shadow-[0_1px_2px_rgba(15,23,42,0.45)]" />
                </Button>
              }
            />
          </div>
        )}
      </main>
    </div>
  )
}
