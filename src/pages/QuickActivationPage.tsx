import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

import { Button } from '../components/ui/Button'
import { fadeInUp } from '../lib/helpers'

export function QuickActivationPage() {
  return (
    <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="space-y-6 [@media(max-height:800px)]:space-y-4">
      <section className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-calm backdrop-blur lg:p-8 [@media(max-height:800px)]:p-4">
        <p className="text-sm uppercase tracking-[0.3em] text-slate-500">Modo Ativação Rápida</p>
        <h1 className="mt-3 font-display text-5xl text-slate-950">Recupere energia mental em poucos minutos</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-600">
          Execute três exercícios curtos em sequência automática para recentrar respiração,
          olhos e coordenação corporal.
        </p>
      </section>

      <section className="rounded-[2rem] border border-white/60 bg-white/80 p-6 shadow-calm backdrop-blur lg:p-8 [@media(max-height:800px)]:p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <p className="max-w-2xl text-base leading-8 text-slate-600">
            A ativação rápida também abre em modo imersivo com o exercício ocupando o foco principal.
          </p>
          <Link to="/session/quick">
            <Button size="lg">Iniciar exercício</Button>
          </Link>
        </div>
      </section>
    </motion.div>
  )
}
