import type { PropsWithChildren } from 'react'

interface ExerciseViewportProps {
  className?: string
}

export function ExerciseViewport({
  children,
  className = '',
}: PropsWithChildren<ExerciseViewportProps>) {
  return <div className={`relative h-full min-h-0 w-full min-w-0 overflow-hidden ${className}`}>{children}</div>
}
