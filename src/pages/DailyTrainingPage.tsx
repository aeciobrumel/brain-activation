import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

import { Button } from '../components/ui/Button'
import { fadeInUp } from '../lib/helpers'

export function DailyTrainingPage() {
  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="space-y-6">
      <section className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-calm backdrop-blur lg:p-8">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Treino Diário</p>
        <h1 className="mt-3 font-display text-5xl text-slate-950">Sequência guiada de ativação completa</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
          Uma sessão enxuta com cinco categorias: foco, memória, lógica, coordenação
          hemisférica e velocidade mental. Ideal para começar trabalho, estudo ou retomada.
        </p>
      </section>

      <section className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-calm backdrop-blur lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="max-w-2xl text-base leading-8 text-slate-600">
            Ao iniciar, o treino abre em tela cheia com visual calmo, sem navegação e sem distrações.
          </p>
          <Link to="/session/daily">
            <Button size="lg">Start Exercise</Button>
          </Link>
        </div>
      </section>
    </motion.div>
  )
}
