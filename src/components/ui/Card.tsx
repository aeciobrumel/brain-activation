import type { HTMLAttributes, PropsWithChildren } from 'react'

import { cn } from '../../lib/helpers'

export function Card({
  children,
  className,
  ...props
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div
      className={cn(
        'rounded-[2rem] border border-white/60 bg-white/75 p-5 shadow-calm backdrop-blur sm:p-6',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
