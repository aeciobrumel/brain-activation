import type { PropsWithChildren } from 'react'

interface ExerciseViewportProps {
  className?: string
}

export function ExerciseViewport({
  children,
  className = '',
}: PropsWithChildren<ExerciseViewportProps>) {
  return (
    <div className="relative flex h-full min-h-0 w-full flex-1 items-center justify-center overflow-hidden">
      <div className={`relative h-full min-h-0 w-full ${className}`}>{children}</div>
    </div>
  )
}
