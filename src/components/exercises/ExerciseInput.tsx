import { SendHorizontal } from 'lucide-react'

import { cn } from '../../lib/helpers'
import type { TextInputFeedback } from './hooks/useTextInput'

interface ExerciseInputProps {
  value: string
  onChange: (value: string) => void
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void
  onSubmit: () => void
  placeholder: string
  type?: 'text' | 'number'
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
  disabled?: boolean
  feedback?: TextInputFeedback
}

export function ExerciseInput({
  value,
  onChange,
  onKeyDown,
  onSubmit,
  placeholder,
  type = 'text',
  inputMode,
  disabled = false,
  feedback = 'idle',
}: ExerciseInputProps) {
  return (
    <div
      className={cn(
        'flex w-full items-center gap-3 rounded-[1.5rem] border px-3 py-3 shadow-[0_24px_90px_rgba(15,23,42,0.18)] transition sm:px-4',
        feedback === 'success' && 'border-emerald-400/70 bg-emerald-500/10',
        feedback === 'error' && 'border-rose-400/70 bg-rose-500/10',
        feedback === 'idle' && 'border-white/10 bg-slate-900/80',
      )}
    >
      <input
        autoFocus
        value={value}
        type={type}
        inputMode={inputMode}
        disabled={disabled}
        aria-label={placeholder}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={onKeyDown}
        className="h-12 flex-1 bg-transparent px-1 text-base font-medium text-white outline-none placeholder:text-white/35 disabled:cursor-not-allowed disabled:text-white/35"
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={disabled}
        aria-label="Enviar resposta"
        className={cn(
          'inline-flex h-11 min-w-[7rem] items-center justify-center gap-2 rounded-2xl px-4 text-sm font-semibold transition',
          disabled
            ? 'cursor-not-allowed bg-white/10 text-white/35'
            : 'bg-white text-slate-950 hover:-translate-y-0.5',
        )}
      >
        <SendHorizontal className="h-4 w-4" />
        Enviar
      </button>
    </div>
  )
}
