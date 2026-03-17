import { motion } from 'framer-motion'

import { categoryOrder, categoryThemes, exercisesByCategory } from '../data/exercises'
import { ExerciseCard } from '../features/exercises/components/ExerciseCard'
import { fadeInUp } from '../lib/helpers'

export function ExerciseLibraryPage() {
  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="space-y-6">
      <section className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-calm backdrop-blur lg:p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Biblioteca</p>
        <h1 className="mt-3 font-display text-5xl text-slate-950">Exercícios por categoria e cor</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
          Azul para foco, verde para memória, roxo para lógica, laranja para coordenação
          hemisférica e vermelho para velocidade mental.
        </p>
      </section>

      {categoryOrder.map((category) => (
        <section key={category} className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl text-slate-950">{categoryThemes[category].label}</h2>
              <p className="mt-2 text-sm text-slate-600">{categoryThemes[category].description}</p>
            </div>
            <div
              className="rounded-full px-4 py-2 text-sm font-semibold"
              style={{
                color: categoryThemes[category].color,
                backgroundColor: `${categoryThemes[category].color}22`,
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
      ))}
    </motion.div>
  )
}
