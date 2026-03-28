import { motion } from 'framer-motion'
import {
  ArrowRight,
  BrainCircuit,
  Flame,
  Orbit,
  Sparkles,
  TimerReset,
  Zap,
} from 'lucide-react'
import { Link } from 'react-router-dom'

import { categoryOrder, categoryThemes, exercises, quickActivationExercises } from '../data/exercises'
import { ExerciseCard } from '../features/exercises/components/ExerciseCard'
import { useProgress } from '../features/progress/hooks/useProgress'
import { Button } from '../components/ui/Button'
import { Card } from '../components/ui/Card'
import { CategoryBadge } from '../components/ui/CategoryBadge'
import { StatCard } from '../components/ui/StatCard'
import { fadeInUp, hexToRgba } from '../lib/helpers'

const categoryIcons = {
  focus: Zap,
  memory: BrainCircuit,
  logic: Flame,
  hemispheric: Orbit,
  speed: TimerReset,
  creativity: Sparkles,
  pressure: BrainCircuit,
}

export function HomePage() {
  const { progress } = useProgress()

  return (
    <div className="space-y-8">
      <motion.section
        variants={fadeInUp}
        initial="hidden"
        animate="visible"
        className="grid gap-6 overflow-hidden rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-calm backdrop-blur xl:grid-cols-[1.05fr_0.95fr] xl:p-8"
      >
        <div className="space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
            <TimerReset className="h-4 w-4" />
            Sessão ideal de 5 a 10 minutos
          </div>
          <div className="space-y-4">
            <h1 className="max-w-3xl font-display text-5xl leading-tight text-slate-950 sm:text-6xl">
              Ativar o cérebro deve ser rápido, claro e agradável.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-slate-600">
              Brain Activation organiza foco, memória, raciocínio, coordenação hemisférica e
              velocidade mental em um webapp responsivo, leve e intuitivo.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/daily-training">
              <Button size="lg" className="w-full sm:w-auto">
                Ativar Cérebro
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/quick-activation">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Modo Ativação Rápida
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <StatCard
            label="Streak"
            value={progress.streakDays}
            description="dias de constância cognitiva registrados localmente."
            icon={Flame}
            color={categoryThemes.speed.color}
          />
          <StatCard
            label="Sessões"
            value={progress.completedSessions}
            description="treinos completos feitos no navegador."
            icon={BrainCircuit}
            color={categoryThemes.logic.color}
          />
          <StatCard
            label="Exercícios"
            value={progress.completedExercises}
            description="etapas concluídas entre sessões e ativações rápidas."
            icon={Zap}
            color={categoryThemes.focus.color}
          />
          <Card className="border-0 bg-slate-950 text-white">
            <div className="text-sm uppercase tracking-[0.24em] text-white/50">Quick mode</div>
            <div className="mt-3 text-4xl font-semibold">{quickActivationExercises.length}</div>
            <p className="mt-3 text-sm leading-7 text-white/72">
              exercícios em sequência para reiniciar atenção em cerca de 3 minutos.
            </p>
          </Card>
        </div>
      </motion.section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {categoryOrder.map((category, index) => {
          const theme = categoryThemes[category]
          const Icon = categoryIcons[category]

          return (
            <motion.div
              key={category}
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className="h-full border-0"
                style={{ backgroundColor: hexToRgba(theme.color, 0.12) }}
              >
                <div
                  className="flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: hexToRgba(theme.color, 0.16), color: theme.color }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="mt-5">
                  <CategoryBadge category={category} />
                </div>
                <p className="mt-4 text-sm leading-7 text-slate-600">{theme.description}</p>
              </Card>
            </motion.div>
          )
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Como funciona</p>
              <h2 className="mt-3 font-display text-4xl text-slate-950">Ative antes de produzir</h2>
            </div>
            <div className="rounded-full bg-slate-100 px-4 py-2 text-sm text-slate-700">
              Mobile-first
            </div>
          </div>
          <div className="mt-6 space-y-4 text-base leading-8 text-slate-600">
            <p>1. Abra o site e toque em Ativar Cérebro.</p>
            <p>2. Execute a sequência guiada com timer, progresso e instruções simples.</p>
            <p>3. Finalize em poucos minutos e acumule consistência no `localStorage`.</p>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Biblioteca</p>
              <h2 className="mt-3 font-display text-4xl text-slate-950">20 exercícios cognitivos</h2>
            </div>
            <Link to="/library" className="text-sm font-semibold text-slate-900">
              Ver todos
            </Link>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {exercises.slice(0, 4).map((exercise) => (
              <ExerciseCard key={exercise.id} exercise={exercise} compact />
            ))}
          </div>
        </Card>
      </section>
    </div>
  )
}
