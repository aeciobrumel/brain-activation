import { CheckCircle2, RotateCcw } from 'lucide-react'
import { Link } from 'react-router-dom'

import { categoryThemes } from '../../../data/exercises'
import { ExerciseRenderer } from '../../../components/exercises/ExerciseRenderer'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { CategoryBadge } from '../../../components/ui/CategoryBadge'
import { ProgressBar } from '../../../components/ui/ProgressBar'
import { useProgress } from '../../progress/hooks/useProgress'
import type { Exercise } from '../../exercises/types'
import { useTrainingSession } from '../hooks/useTrainingSession'
import { formatSeconds, hexToRgba } from '../../../lib/helpers'

interface TrainingSessionProps {
  exercises: Exercise[]
  mode: 'daily' | 'quick'
  immersive?: boolean
}

export function TrainingSession({ exercises, mode, immersive = false }: TrainingSessionProps) {
  const { completeExercise, completeQuickActivation, completeSession } = useProgress()
  const {
    currentExercise,
    currentIndex,
    isComplete,
    progress,
    totalExercises,
    advance,
    restart,
  } = useTrainingSession({
    exercises,
    onCompleteExercise: completeExercise,
    onFinish: (exerciseIds) => {
      if (mode === 'quick') {
        completeQuickActivation()
        return
      }

      completeSession(exerciseIds)
    },
  })

  if (!currentExercise && !isComplete) {
    return null
  }

  if (isComplete || !currentExercise) {
    return (
      <Card className="border-0 bg-slate-950 text-white">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm">
            <CheckCircle2 className="h-4 w-4" />
            {mode === 'quick' ? 'Ativação concluída' : 'Sessão concluída'}
          </div>
          <div>
            <h2 className="font-display text-4xl">
              {mode === 'quick' ? 'Cérebro ativado' : 'Treino finalizado'}
            </h2>
            <p className="mt-3 text-base leading-7 text-white/72">
              {mode === 'quick'
                ? 'Você executou um circuito rápido para recuperar atenção e prontidão mental.'
                : 'Você concluiu a sessão completa com foco, memória, lógica, coordenação e velocidade mental.'}
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-white/55">Exercícios</div>
              <div className="mt-2 text-2xl font-semibold">{totalExercises}</div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-white/55">Duração</div>
              <div className="mt-2 text-2xl font-semibold">
                {formatSeconds(exercises.reduce((sum, exercise) => sum + exercise.duration, 0))}
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-white/55">Status</div>
              <div className="mt-2 text-2xl font-semibold">100%</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button variant="secondary" onClick={restart} className="w-full sm:w-auto">
              <RotateCcw className="h-4 w-4" />
              Repetir
            </Button>
            {immersive && (
              <Link to={mode === 'quick' ? '/quick-activation' : '/daily-training'}>
                <Button variant="ghost">Sair do modo imersivo</Button>
              </Link>
            )}
          </div>
        </div>
      </Card>
    )
  }

  const theme = categoryThemes[currentExercise.category]
  const interactiveModule = (
    <ExerciseRenderer
      exercise={currentExercise}
      onComplete={advance}
      footerAction={<Button onClick={advance}>Próximo</Button>}
    />
  )

  if (immersive) {
    return interactiveModule
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[0.72fr_0.28fr]">
      <Card
        className="space-y-6 border-0"
        style={{
          background: `linear-gradient(180deg, ${hexToRgba(theme.color, 0.16)} 0%, rgba(255,255,255,0.95) 36%)`,
        }}
      >
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-3">
              <CategoryBadge category={currentExercise.category} />
            </div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500">
              Etapa {currentIndex + 1} de {totalExercises}
            </p>
            <h2 className="mt-3 text-4xl font-semibold text-slate-950">{currentExercise.title}</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">
              {currentExercise.description}
            </p>
          </div>
          <div className="rounded-3xl bg-white/85 px-5 py-4 text-right">
            <div className="text-sm text-slate-500">Duração</div>
            <div className="mt-1 text-2xl font-semibold" style={{ color: theme.color }}>
              {formatSeconds(currentExercise.duration)}
            </div>
          </div>
        </div>

        {interactiveModule ?? (
          <div className="space-y-4 rounded-[1.75rem] bg-white/75 p-5">
            <div className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              Instruções
            </div>
            <ul className="space-y-3 text-base leading-7 text-slate-700">
              {currentExercise.instructions.map((instruction) => (
                <li key={instruction} className="flex gap-3">
                  <span
                    className="mt-2 h-2 w-2 rounded-full"
                    style={{ backgroundColor: theme.color }}
                  />
                  <span>{instruction}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      <Card className="space-y-6">
        <div>
          <div className="text-sm uppercase tracking-[0.3em] text-slate-500">Progresso</div>
          <div className="mt-2 text-3xl font-semibold text-slate-950">{Math.round(progress)}%</div>
        </div>
        <ProgressBar value={progress} color={theme.color} />
        <div className="space-y-3">
          {exercises.map((exercise, index) => {
            const isActive = exercise.id === currentExercise.id
            const isDone = index < currentIndex
            const categoryColor = categoryThemes[exercise.category].color

            return (
              <div
                key={exercise.id}
                className="rounded-2xl px-4 py-3 transition"
                style={{
                  backgroundColor: isActive
                    ? categoryColor
                    : isDone
                      ? hexToRgba(categoryColor, 0.14)
                      : '#f8fafc',
                  color: isActive ? '#ffffff' : '#0f172a',
                }}
              >
                <div className="text-sm opacity-70">Etapa {index + 1}</div>
                <div className="font-medium">{exercise.title}</div>
              </div>
            )
          })}
        </div>
      </Card>
    </div>
  )
}
