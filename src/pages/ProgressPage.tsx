import { motion } from 'framer-motion'

import { ProgressOverview } from '../features/progress/components/ProgressOverview'
import { useProgress } from '../features/progress/hooks/useProgress'
import { fadeInUp } from '../lib/helpers'

export function ProgressPage() {
  const { progress, resetProgress } = useProgress()

  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="space-y-6">
      <section className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-calm backdrop-blur lg:p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Progresso</p>
        <h1 className="mt-3 font-display text-5xl text-slate-950">Consistência salva no navegador</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
          O progresso do Brain Activation é persistido com `localStorage`, sem conta e sem
          backend obrigatório.
        </p>
      </section>

      <ProgressOverview progress={progress} onReset={resetProgress} />
    </motion.div>
  )
}
