interface ShapeTokenProps {
  shape: 'circle' | 'square' | 'triangle'
  color: string
  size?: number
  rotation?: number
  scale?: number
}

export function ShapeToken({
  shape,
  color,
  size = 72,
  rotation = 0,
  scale = 1,
}: ShapeTokenProps) {
  const transform = `rotate(${rotation}deg) scale(${scale})`

  return (
    <svg width={size} height={size} viewBox="0 0 72 72" aria-hidden="true">
      <g style={{ transform, transformOrigin: 'center', transformBox: 'fill-box' }}>
        {shape === 'circle' ? <circle cx="36" cy="36" r="20" fill={color} /> : null}
        {shape === 'square' ? <rect x="18" y="18" width="36" height="36" rx="6" fill={color} /> : null}
        {shape === 'triangle' ? <polygon points="36,14 56,54 16,54" fill={color} /> : null}
      </g>
    </svg>
  )
}
