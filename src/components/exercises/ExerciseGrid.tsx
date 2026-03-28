import type { ReactNode } from 'react'

import { cn, hexToRgba } from '../../lib/helpers'

interface ExerciseGridItem {
  id: string
  front: ReactNode
  back?: ReactNode
  accentColor?: string
}

interface ExerciseGridProps {
  items: ExerciseGridItem[]
  columns: number
  onSelect: (index: number, event: React.MouseEvent<HTMLButtonElement>) => void
  revealedIndices?: number[]
  selectedIndices?: number[]
  matchedIndices?: number[]
  shakeIndices?: number[]
  disabled?: boolean
  flip?: boolean
  className?: string
}

function includes(items: number[] | undefined, value: number) {
  return items?.includes(value) ?? false
}

export function ExerciseGrid({
  items,
  columns,
  onSelect,
  revealedIndices = [],
  selectedIndices = [],
  matchedIndices = [],
  shakeIndices = [],
  disabled = false,
  flip = false,
  className,
}: ExerciseGridProps) {
  return (
    <div
      className={cn('grid gap-3', className)}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {items.map((item, index) => {
        const isRevealed = includes(revealedIndices, index)
        const isSelected = includes(selectedIndices, index)
        const isMatched = includes(matchedIndices, index)
        const shouldShake = includes(shakeIndices, index)
        const accentColor = item.accentColor ?? '#3b82f6'

        return (
          <button
            key={item.id}
            type="button"
            disabled={disabled}
            onClick={(event) => onSelect(index, event)}
            className={cn(
              'group relative aspect-square overflow-hidden rounded-[1.35rem] border border-white/10 bg-white/5 text-white transition',
              disabled ? 'cursor-not-allowed' : 'hover:-translate-y-0.5',
            )}
            style={{
              opacity: isMatched ? 0.46 : 1,
              boxShadow: isSelected
                ? `0 0 0 1px ${hexToRgba(accentColor, 0.9)}, 0 18px 42px ${hexToRgba(accentColor, 0.22)}`
                : undefined,
              transform: shouldShake ? 'translateX(-2px)' : undefined,
            }}
          >
            <div
              className="relative h-full w-full"
              style={{
                transformStyle: 'preserve-3d',
                transition: 'transform 320ms ease',
                transform: flip && (isRevealed || isMatched) ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              <div
                className="absolute inset-0 flex items-center justify-center rounded-[1.35rem] bg-slate-900/78"
                style={{ backfaceVisibility: 'hidden' }}
              >
                {item.back ?? (
                  <div className="text-2xl font-semibold tracking-[0.12em] text-white/35">?</div>
                )}
              </div>

              <div
                className="absolute inset-0 flex items-center justify-center rounded-[1.35rem] border border-white/8"
                style={{
                  background: `linear-gradient(180deg, ${hexToRgba(accentColor, 0.22)} 0%, rgba(15,23,42,0.94) 100%)`,
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                {item.front}
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
