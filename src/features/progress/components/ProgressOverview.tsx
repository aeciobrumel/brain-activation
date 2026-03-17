import { Activity, Brain, Flame, Sparkles, Trophy } from 'lucide-react'

import { Button } from '../../../components/ui/Button'
import { ProgressBar } from '../../../components/ui/ProgressBar'
import { StatCard } from '../../../components/ui/StatCard'
import { categoryThemes } from '../../../data/exercises'
import type { ProgressState } from '../../../lib/storage'
import { Card } from '../../../components/ui/Card'

interface ProgressOverviewProps {
  progress: ProgressState
  onReset: () => void
}

export function ProgressOverview({ progress, onReset }: ProgressOverviewProps) {
  const weeklyProgress = Math.min((progress.streakDays / 7) * 100, 100)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Streak"
          value={progress.streakDays}
          description="dias consecutivos com ativação ou treino completo."
          icon={Flame}
          color={categoryThemes.speed.color}
        />
        <StatCard
          label="Sessões"
          value={progress.completedSessions}
          description="rotinas completas de 5 a 10 minutos finalizadas."
          icon={Trophy}
          color={categoryThemes.logic.color}
        />
        <StatCard
          label="Exercícios"
          value={progress.completedExercises}
          description="etapas executadas ao longo de sessões e ativações."
          icon={Brain}
          color={categoryThemes.focus.color}
        />
        <StatCard
          label="Rápidas"
          value={progress.quickActivations}
          description="circuitos curtos para recuperar foco em poucos minutos."
          icon={Sparkles}
          color={categoryThemes.hemispheric.color}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.7fr_0.3fr]">
        <Card className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-sm uppercase tracking-[0.24em] text-slate-500">Meta semanal</div>
              <h2 className="mt-2 font-display text-4xl text-slate-950">{Math.round(weeklyProgress)}%</h2>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-900">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <ProgressBar value={weeklyProgress} color={categoryThemes.memory.color} />
          <p className="text-sm leading-7 text-slate-600">
            A meta considera frequência diária. Progresso constante vale mais do que sessões
            longas e esporádicas.
          </p>
        </Card>

        <Card className="space-y-4">
          <div className="text-sm uppercase tracking-[0.24em] text-slate-500">Resumo local</div>
          <div className="rounded-3xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
            Última atividade: {progress.lastCompletedDate ?? 'Nenhuma ainda'}
          </div>
          <div className="rounded-3xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
            Exercícios únicos concluídos: {progress.completedExerciseIds.length}
          </div>
          <Button variant="ghost" onClick={onReset}>
            Resetar progresso
          </Button>
        </Card>
      </div>
    </div>
  )
}
