import { ProgressBar } from '../ui/ProgressBar'
import { cn, hexToRgba } from '../../lib/helpers'

interface ExerciseChoiceOption {
  label: string
  description?: string
  ariaLabel?: string
}

interface ExerciseChoicesProps {
  options: ExerciseChoiceOption[]
  onSelect: (index: number, event: React.MouseEvent<HTMLButtonElement>) => void
  countdownPercent?: number
  countdownLabel?: string
  accentColor?: string
  disabled?: boolean
  selectedIndex?: number | null
  feedback?: 'idle' | 'confirm' | 'timeout' | 'error'
  layout?: 'row' | 'grid'
}

export function ExerciseChoices({
  options,
  onSelect,
  countdownPercent,
  countdownLabel,
  accentColor = '#14b8a6',
  disabled = false,
  selectedIndex = null,
  feedback = 'idle',
  layout = 'grid',
}: ExerciseChoicesProps) {
  return (
    <div className="grid gap-3">
      {typeof countdownPercent === 'number' ? (
        <div className="grid gap-1.5">
          <div className="flex items-center justify-between text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/40">
            <span>Janela de resposta</span>
            <span>{countdownLabel}</span>
          </div>
          <ProgressBar value={countdownPercent} color={accentColor} />
        </div>
      ) : null}

      <div className={cn(layout === 'row' ? 'flex flex-col gap-3 sm:flex-row' : 'grid gap-3 sm:grid-cols-2')}>
        {options.map((option, index) => {
          const isSelected = selectedIndex === index

          return (
            <button
              key={option.label}
              type="button"
              disabled={disabled}
              onClick={(event) => onSelect(index, event)}
              aria-label={option.ariaLabel ?? `Opção ${String.fromCharCode(65 + index)}: ${option.label}`}
              className={cn(
                'min-h-[6.25rem] rounded-[1.5rem] border px-4 py-4 text-left transition',
                layout === 'row' && 'sm:flex-1',
                disabled ? 'cursor-not-allowed opacity-80' : 'hover:-translate-y-0.5',
              )}
              style={{
                borderColor:
                  feedback === 'error' && isSelected
                    ? '#ef4444'
                    : isSelected
                      ? accentColor
                      : feedback === 'error'
                        ? 'rgba(248,113,113,0.28)'
                        : feedback === 'timeout'
                          ? 'rgba(251,191,36,0.28)'
                          : 'rgba(255,255,255,0.10)',
                backgroundColor:
                  feedback === 'error' && isSelected
                    ? 'rgba(239,68,68,0.18)'
                    : isSelected
                      ? hexToRgba(accentColor, 0.18)
                      : feedback === 'error'
                        ? 'rgba(239,68,68,0.12)'
                        : feedback === 'timeout'
                          ? 'rgba(245,158,11,0.12)'
                          : 'rgba(255,255,255,0.05)',
              }}
            >
              <div className="text-sm font-semibold uppercase tracking-[0.18em] text-white/70">
                {String.fromCharCode(65 + index)}
              </div>
              <div className="mt-2 text-lg font-semibold leading-7 text-white">{option.label}</div>
              {option.description ? (
                <div className="mt-2 text-sm leading-6 text-white/70">{option.description}</div>
              ) : null}
            </button>
          )
        })}
      </div>
    </div>
  )
}
