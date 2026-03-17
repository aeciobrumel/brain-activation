import { Pause, Play, RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'

import { formatSeconds } from '../../lib/helpers'
import { Button } from './Button'

interface TimerProps {
  duration: number
  onComplete?: () => void
  accentColor?: string
}

export function Timer({ duration, onComplete, accentColor = '#0f172a' }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const [isRunning, setIsRunning] = useState(true)

  useEffect(() => {
    if (!isRunning || timeLeft <= 0) {
      return
    }

    const interval = window.setInterval(() => {
      setTimeLeft((current) => {
        if (current <= 1) {
          window.clearInterval(interval)
          onComplete?.()
          return 0
        }

        return current - 1
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [isRunning, onComplete, timeLeft])

  const reset = () => {
    setTimeLeft(duration)
    setIsRunning(true)
  }

  return (
    <div
      className="flex flex-col gap-4 rounded-[1.75rem] px-5 py-4 text-white sm:flex-row sm:items-center"
      style={{ backgroundColor: accentColor }}
    >
      <div className="min-w-28">
        <div className="text-sm uppercase tracking-[0.24em] text-white/65">Timer</div>
        <div className="mt-1 font-display text-4xl">{formatSeconds(timeLeft)}</div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          onClick={() => setIsRunning((value) => !value)}
          className="bg-white text-slate-900 hover:bg-white/90"
        >
          {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {isRunning ? 'Pausar' : 'Retomar'}
        </Button>
        <Button
          variant="ghost"
          onClick={reset}
          className="border border-white/15 text-white hover:bg-white/10"
        >
          <RotateCcw className="h-4 w-4" />
          Reiniciar
        </Button>
      </div>
    </div>
  )
}
