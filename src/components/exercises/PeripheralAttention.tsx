import { useEffect, useMemo, useState } from 'react'

import { ExerciseFrame } from './ExerciseFrame'
import { ExerciseViewport } from './ExerciseViewport'
import { useTimer } from './hooks/useTimer'

interface ExerciseModuleProps {
  duration: number
  title: string
  onComplete: () => void
  footerAction?: React.ReactNode
}

const symbols = ['▲', '◆', '●', '✦', '■']
const positions = [
  { top: '8%', left: '10%' },
  { top: '8%', right: '10%' },
  { top: '50%', left: '4%' },
  { top: '50%', right: '4%' },
  { bottom: '8%', left: '12%' },
  { bottom: '8%', right: '12%' },
]

export function PeripheralAttention({ duration, onComplete, footerAction }: ExerciseModuleProps) {
  const timer = useTimer({ duration, onComplete })
  const [activeSymbol, setActiveSymbol] = useState<null | { symbol: string; index: number }>(null)
  const [hits, setHits] = useState(0)
  const [falseAlarms, setFalseAlarms] = useState(0)

  useEffect(() => {
    if (!timer.isRunning) {
      return
    }

    const spawn = window.setInterval(() => {
      const index = Math.floor(Math.random() * positions.length)
      const symbol = symbols[Math.floor(Math.random() * symbols.length)]
      setActiveSymbol({ symbol, index })

      window.setTimeout(() => {
        setActiveSymbol(null)
      }, 700)
    }, 1400)

    return () => window.clearInterval(spawn)
  }, [timer.isRunning])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.code !== 'Space' || !timer.isRunning) {
        return
      }

      event.preventDefault()

      if (activeSymbol) {
        setHits((value) => value + 1)
        setActiveSymbol(null)
        return
      }

      setFalseAlarms((value) => value + 1)
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [activeSymbol, timer.isRunning])

  const moduleProgress = useMemo(() => {
    const total = hits + falseAlarms
    if (total === 0) {
      return 0
    }

    return (hits / total) * 100
  }, [falseAlarms, hits])

  return (
    <ExerciseFrame
      accentColor="#3b82f6"
      timeLeftSeconds={timer.timeLeftSeconds}
      timerProgress={timer.progress}
      moduleProgress={moduleProgress}
      isRunning={timer.isRunning}
      onStartPause={timer.isRunning ? timer.pause : timer.start}
      onRestart={() => {
        setHits(0)
        setFalseAlarms(0)
        setActiveSymbol(null)
        timer.restart()
      }}
      footerAction={footerAction}
      metrics={
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Detecções: <span className="font-semibold text-slate-950">{hits}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
            Falsos alarmes: <span className="font-semibold text-slate-950">{falseAlarms}</span>
          </div>
        </div>
      }
    >
      <ExerciseViewport>
        <div className="relative h-full w-full rounded-[1.75rem] border border-slate-200 bg-white">
          <div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-950" />
          {activeSymbol && (
            <div
              className="absolute text-3xl font-bold text-blue-500 sm:text-4xl"
              style={positions[activeSymbol.index]}
            >
              {activeSymbol.symbol}
            </div>
          )}
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-slate-100 px-3 py-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500 sm:text-[11px]">
            Olhe para o centro e pressione ESPACO ao detectar um símbolo na borda
          </div>
        </div>
      </ExerciseViewport>
    </ExerciseFrame>
  )
}
