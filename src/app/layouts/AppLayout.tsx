import { Bolt, Brain, ChartSpline, Library, Menu, Sparkles, X } from 'lucide-react'
import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'

import { Button } from '../../components/ui/Button'
import { cn } from '../../lib/helpers'

const navigation = [
  { to: '/', label: 'Home', icon: Sparkles },
  { to: '/daily-training', label: 'Treino Diário', icon: Brain },
  { to: '/quick-activation', label: 'Ativação Rápida', icon: Bolt },
  { to: '/library', label: 'Biblioteca', icon: Library },
  { to: '/progress', label: 'Progresso', icon: ChartSpline },
]

export function AppLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(34,197,94,0.1),_transparent_30%),linear-gradient(180deg,_#fffaf5_0%,_#eef4ff_100%)]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 pb-10 pt-4 sm:px-6 lg:px-8">
        <header className="sticky top-4 z-20 mb-8 rounded-[2rem] border border-white/70 bg-white/80 px-4 py-3 shadow-calm backdrop-blur">
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-white">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <div className="font-display text-xl leading-none text-slate-950">Brain Activation</div>
                <div className="text-sm text-slate-500">Ativar Cérebro em 5-10 minutos</div>
              </div>
            </Link>

            <nav className="hidden items-center gap-2 lg:flex">
              {navigation.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition',
                      isActive
                        ? 'bg-slate-950 text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950',
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </nav>

            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen((value) => !value)}
                aria-label="Alternar menu"
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {isMenuOpen && (
            <nav className="mt-4 grid gap-2 border-t border-slate-200 pt-4 lg:hidden">
              {navigation.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setIsMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition',
                      isActive ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700',
                    )
                  }
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </NavLink>
              ))}
            </nav>
          )}
        </header>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
