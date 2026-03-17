import type { Variants } from 'framer-motion'

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ')
}

export function formatSeconds(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function getISODate(date = new Date()) {
  return date.toISOString().split('T')[0]
}

export function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace('#', '')
  const bigint = Number.parseInt(normalized, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export function slugify(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function createFallbackMemoryImage({
  title,
  prompt,
  color,
}: {
  title: string
  prompt: string
  color: string
}) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900">
      <defs>
        <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stop-color="#fff8ef" />
          <stop offset="100%" stop-color="${color}" stop-opacity="0.92" />
        </linearGradient>
      </defs>
      <rect width="1200" height="900" rx="56" fill="url(#bg)" />
      <circle cx="180" cy="180" r="120" fill="${color}" fill-opacity="0.22" />
      <circle cx="1000" cy="220" r="160" fill="#ffffff" fill-opacity="0.16" />
      <circle cx="920" cy="720" r="220" fill="#111827" fill-opacity="0.09" />
      <text x="90" y="300" fill="#111827" font-size="78" font-family="Arial, sans-serif" font-weight="700">
        ${title}
      </text>
      <foreignObject x="90" y="360" width="1020" height="380">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Arial, sans-serif; font-size: 34px; line-height: 1.45; color: #1f2937;">
          ${prompt}
        </div>
      </foreignObject>
      <text x="90" y="820" fill="#111827" fill-opacity="0.72" font-size="24" font-family="Arial, sans-serif">
        Brain Activation • Visual Memory Generator
      </text>
    </svg>
  `

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
}
