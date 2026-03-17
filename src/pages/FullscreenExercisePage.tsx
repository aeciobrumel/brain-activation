import { ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMemo, useState } from 'react'

import { ExerciseRenderer } from '../components/exercises/ExerciseRenderer'
import { Button } from '../components/ui/Button'
import { exercises } from '../data/exercises'

export function FullscreenExercisePage() {
  const { exerciseId } = useParams()
  const navigate = useNavigate()
  const [isComplete, setIsComplete] = useState(false)

  const exercise = useMemo(
    () => exercises.find((item) => item.id === exerciseId),
    [exerciseId],
  )

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
    <div className="grid h-dvh min-h-dvh w-full grid-rows-[auto_minmax(0,1fr)] overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.08),_transparent_30%),linear-gradient(180deg,_#fffdf9_0%,_#f8fafc_100%)]">
      <header className="flex h-12 items-center px-3 sm:px-4 lg:px-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Sair
        </button>
      </header>

      <main className="min-h-0 px-3 py-3 sm:px-5 sm:py-4 lg:px-8 lg:py-6">
        {isComplete ? (
          <div className="flex h-full min-h-0 min-w-0 items-center justify-center rounded-[2rem] border border-slate-200 bg-white/85 p-6 sm:p-8">
            <div className="w-full text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="mt-6 text-3xl font-semibold text-slate-950">Exercício concluído</h2>
              <p className="mt-3 text-slate-600">
                A sessão individual terminou. Você pode retornar para a biblioteca ou iniciar outro módulo.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link to="/library">
                  <Button>Voltar para biblioteca</Button>
                </Link>
                <Button variant="secondary" onClick={() => setIsComplete(false)}>
                  Repetir exercício
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid h-full min-h-0 overflow-hidden">
            <ExerciseRenderer
              exercise={exercise}
              onComplete={() => setIsComplete(true)}
              footerAction={<Button onClick={() => setIsComplete(true)}>Próximo</Button>}
            />
          </div>
        )}
      </main>
    </div>
  )
}
