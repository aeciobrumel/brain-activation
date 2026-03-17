import { useEffect, useRef, useState } from 'react'

import { clamp } from '../../lib/helpers'
import { ExerciseFrame } from './ExerciseFrame'
import { ExerciseViewport } from './ExerciseViewport'
import { useTimer } from './hooks/useTimer'

interface ExerciseModuleProps {
  duration: number
  title: string
  onComplete: () => void
  footerAction?: React.ReactNode
}

const patterns = ['left-right', 'right-left', 'up-down', 'down-up', 'diagonal', 'figure8'] as const

export function EyeTracking({ duration, onComplete, footerAction }: ExerciseModuleProps) {
  const areaRef = useRef<HTMLDivElement | null>(null)
  const [position, setPosition] = useState({ x: 0.5, y: 0.5 })
  const timer = useTimer({ duration, onComplete })

  useEffect(() => {
    let frameId = 0

    const animate = () => {
      if (areaRef.current) {
        const progress = timer.progress / 100
        const patternIndex = Math.min(
          Math.floor(progress * patterns.length),
          patterns.length - 1,
        )
        const patternProgress = (progress * patterns.length) % 1
        const t = patternProgress * Math.PI * 2
        const speedGain = 1 + progress * 0.35
        let x = 0.5
        let y = 0.5

        switch (patterns[patternIndex]) {
          case 'left-right':
            x = 0.1 + 0.8 * ((Math.sin(t * speedGain - Math.PI / 2) + 1) / 2)
            y = 0.5
            break
          case 'right-left':
            x = 0.9 - 0.8 * ((Math.sin(t * speedGain - Math.PI / 2) + 1) / 2)
            y = 0.5
            break
          case 'up-down':
            x = 0.5
            y = 0.1 + 0.8 * ((Math.sin(t * speedGain - Math.PI / 2) + 1) / 2)
            break
          case 'down-up':
            x = 0.5
            y = 0.9 - 0.8 * ((Math.sin(t * speedGain - Math.PI / 2) + 1) / 2)
            break
          case 'diagonal':
            x = 0.1 + 0.8 * ((Math.sin(t * speedGain - Math.PI / 2) + 1) / 2)
            y = 0.1 + 0.8 * ((Math.sin(t * speedGain - Math.PI / 2) + 1) / 2)
            break
          case 'figure8':
            x = 0.5 + 0.34 * Math.sin(t * speedGain)
            y = 0.5 + 0.22 * Math.sin(t * 2 * speedGain) / 1.2
            break
        }

        setPosition({ x: clamp(x, 0.08, 0.92), y: clamp(y, 0.08, 0.92) })
      }

      if (timer.isRunning && !timer.isFinished) {
        frameId = window.requestAnimationFrame(animate)
      }
    }

    if (timer.isRunning && !timer.isFinished) {
      frameId = window.requestAnimationFrame(animate)
    }

    return () => window.cancelAnimationFrame(frameId)
  }, [timer.isFinished, timer.isRunning, timer.progress])

  return (
    <ExerciseFrame
      accentColor="#ef4444"
      timeLeftSeconds={timer.timeLeftSeconds}
      timerProgress={timer.progress}
      moduleProgress={timer.progress}
      isRunning={timer.isRunning}
      onStartPause={timer.isRunning ? timer.pause : timer.start}
      onRestart={timer.restart}
      footerAction={footerAction}
      metrics={
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600">
          Siga o ponto vermelho apenas com os olhos. O padrão muda ao longo do tempo e a
          velocidade aumenta levemente.
        </div>
      }
    >
      <ExerciseViewport>
        <div
          ref={areaRef}
          className="relative h-full w-full overflow-hidden rounded-[1.75rem] border border-slate-200 bg-white"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(239,68,68,0.08),_transparent_52%)]" />
          <div
            className="absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.6)]"
            style={{
              left: `${position.x * 100}%`,
              top: `${position.y * 100}%`,
            }}
          />
          <div className="absolute bottom-4 left-4 rounded-full bg-white/85 px-3 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
            {patterns[Math.min(Math.floor((timer.progress / 100) * patterns.length), patterns.length - 1)]}
          </div>
        </div>
      </ExerciseViewport>
    </ExerciseFrame>
  )
}
