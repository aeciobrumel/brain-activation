import type { LucideIcon } from 'lucide-react'

import { Card } from './Card'
import { hexToRgba } from '../../lib/helpers'

interface StatCardProps {
  label: string
  value: string | number
  description: string
  icon: LucideIcon
  color?: string
}

export function StatCard({
  label,
  value,
  description,
  icon: Icon,
  color = '#0f172a',
}: StatCardProps) {
  return (
    <Card>
      <div
        className="flex h-12 w-12 items-center justify-center rounded-2xl"
        style={{ backgroundColor: hexToRgba(color, 0.16), color }}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-5 text-sm uppercase tracking-[0.24em] text-slate-500">{label}</div>
      <div className="mt-2 text-4xl font-semibold text-slate-950">{value}</div>
      <p className="mt-3 text-sm leading-7 text-slate-600">{description}</p>
    </Card>
  )
}
