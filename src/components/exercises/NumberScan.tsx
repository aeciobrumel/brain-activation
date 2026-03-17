import { useMemo, useState } from 'react'

import { ExerciseFrame } from './ExerciseFrame'
import { ExerciseViewport } from './ExerciseViewport'
import { useTimer } from './hooks/useTimer'

interface ExerciseModuleProps {
  duration: number
  title: string
  onComplete: () => void
  footerAction?: React.ReactNode
}

function shuffledNumbers() {
  return [...Array.from({ length: 9 }, (_, index) => index + 1)].sort(
    () => Math.random() - 0.5,
  )
}

export function NumberScan({ duration, onComplete, footerAction }: ExerciseModuleProps) {
  const timer = useTimer({ duration, onComplete })
  const [grid, setGrid] = useState<number[]>(() => shuffledNumbers())
  const [nextExpected, setNextExpected] = useState(1)
  const [bestSequence, setBestSequence] = useState(0)

  const progress = useMemo(() => ((nextExpected - 1) / 9) * 100, [nextExpected])

  const handleCellClick = (value: number) => {
    if (!timer.isRunning) {
      return
    }

    if (value === nextExpected) {
      setBestSequence((current) => Math.max(current, value))
      if (value === 9) {
        setGrid(shuffledNumbers())
        setNextExpected(1)
        return
      }

      const next = nextExpected + 1
      setNextExpected(next)
      return
    }

    setNextExpected(1)
  }

  const restart = () => {
    setGrid(shuffledNumbers())
    setNextExpected(1)
    setBestSequence(0)
    timer.reset()
  }

  return (
    <ExerciseFrame
      accentColor="#ef4444"
      timeLeftSeconds={timer.timeLeftSeconds}
      timerProgress={timer.progress}
      moduleProgress={progress}
      isRunning={timer.isRunning}
      onStartPause={timer.isRunning ? timer.pause : timer.start}
      onRestart={restart}
      footerAction={footerAction}
      metrics={
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
            Próximo número: <span className="font-semibold text-slate-950">{nextExpected}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
            Melhor sequência: <span className="font-semibold text-slate-950">{bestSequence}</span>
          </div>
        </div>
      }
    >
      <ExerciseViewport>
        <div className="flex h-full min-h-0 w-full items-center justify-center">
          <div className="grid h-full max-h-full w-auto max-w-full aspect-square grid-cols-3 gap-2 sm:gap-3 md:gap-4">
            {grid.map((value) => {
              const isCorrect = value < nextExpected

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleCellClick(value)}
                  className="aspect-square min-h-0 rounded-[1.25rem] border border-slate-200 text-[clamp(1.1rem,3vw,2rem)] font-semibold transition sm:rounded-[1.5rem]"
                  style={{
                    backgroundColor: isCorrect ? '#fee2e2' : '#ffffff',
                    color: isCorrect ? '#b91c1c' : '#0f172a',
                  }}
                >
                  {value}
                </button>
              )
            })}
          </div>
        </div>
      </ExerciseViewport>
    </ExerciseFrame>
  )
}
