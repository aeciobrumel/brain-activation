import { motion } from 'framer-motion'

import { categoryOrder, categoryThemes, exercisesByCategory } from '../data/exercises'
import { categoryIcons } from '../data/icons'
import { ExerciseCard } from '../features/exercises/components/ExerciseCard'
import { fadeInUp, hexToRgba } from '../lib/helpers'

export function ExerciseLibraryPage() {
  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="space-y-6">
      <section className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-calm backdrop-blur lg:p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Biblioteca</p>
        <h1 className="mt-3 font-display text-5xl text-slate-950">Exercícios por categoria e cor</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
          Cada trilha cognitiva combina cor, descrição e agora um ícone próprio para facilitar
          reconhecimento rápido durante a navegação.
        </p>
      </section>

      {categoryOrder.map((category) => {
        const theme = categoryThemes[category]
        const Icon = categoryIcons[category]

        return (
          <section key={category} className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl"
                  style={{
                    color: theme.color,
                    backgroundColor: hexToRgba(theme.color, 0.14),
                  }}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-display text-3xl text-slate-950">{theme.label}</h2>
                  <p className="mt-2 text-sm text-slate-600">{theme.description}</p>
                </div>
              </div>
              <div
                className="rounded-full px-4 py-2 text-sm font-semibold"
                style={{
                  color: theme.color,
                  backgroundColor: hexToRgba(theme.color, 0.14),
                }}
              >
                {exercisesByCategory[category].length} exercícios
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {exercisesByCategory[category].map((exercise) => (
                <ExerciseCard key={exercise.id} exercise={exercise} />
              ))}
            </div>
          </section>
        )
      })}
    </motion.div>
  )
}
