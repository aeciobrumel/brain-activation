import { cn } from '../../lib/helpers'

interface ProgressBarProps {
  value: number
  color?: string
  className?: string
}

export function ProgressBar({ value, color = '#0f172a', className }: ProgressBarProps) {
  return (
    <div className={cn('h-3 w-full overflow-hidden rounded-full bg-slate-200/80', className)}>
      <div
        className="h-full rounded-full transition-[width] duration-500"
        style={{
          backgroundColor: color,
          width: `${Math.min(Math.max(value, 0), 100)}%`,
        }}
      />
    </div>
  )
}
