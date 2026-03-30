export interface TraceShape {
  id: string
  label: string
  path: string
  startPoint: { x: number; y: number }
  viewBox: { w: number; h: number }
}

const DEFAULT_VIEWBOX = { w: 600, h: 360 } as const

export const TRACE_SHAPE_CATALOG: TraceShape[] = [
  {
    id: 'infinito',
    label: 'Infinito',
    path: 'M 120 180 C 120 80, 240 80, 240 180 S 360 280, 360 180 C 360 80, 480 80, 480 180 S 360 280, 240 180 S 120 280, 120 180',
    startPoint: { x: 120, y: 180 },
    viewBox: DEFAULT_VIEWBOX,
  },
  {
    id: 'orbita-suave',
    label: 'Orbita suave',
    path: 'M 300 64 C 406 42, 484 106, 470 188 C 456 270, 382 322, 300 294 C 218 322, 144 270, 130 188 C 116 106, 194 42, 300 64',
    startPoint: { x: 300, y: 64 },
    viewBox: DEFAULT_VIEWBOX,
  },
  {
    id: 'gota-fluida',
    label: 'Gota fluida',
    path: 'M 300 42 C 376 74, 432 142, 424 226 C 416 298, 366 334, 300 318 C 234 334, 184 298, 176 226 C 168 142, 224 74, 300 42',
    startPoint: { x: 300, y: 42 },
    viewBox: DEFAULT_VIEWBOX,
  },
  {
    id: 'trevo-fluido',
    label: 'Trevo fluido',
    path: 'M 300 92 C 344 18, 430 50, 384 142 C 474 150, 474 252, 360 244 C 380 330, 300 350, 260 262 C 146 252, 146 150, 216 142 C 170 50, 256 18, 300 92',
    startPoint: { x: 300, y: 92 },
    viewBox: DEFAULT_VIEWBOX,
  },
  {
    id: 'figura-8-vertical',
    label: 'Figura 8 vertical',
    path: 'M 300 40 C 390 40, 390 130, 300 150 S 210 260, 300 260 C 390 260, 390 350, 300 320 S 210 260, 300 150 S 210 40, 300 40',
    startPoint: { x: 300, y: 40 },
    viewBox: DEFAULT_VIEWBOX,
  },
  {
    id: 'serpentina',
    label: 'Serpentina',
    path: 'M 132 180 C 180 92, 268 92, 312 180 S 438 268, 470 180 C 500 112, 442 54, 364 84 C 302 108, 270 248, 194 272 C 126 294, 92 234, 132 180',
    startPoint: { x: 132, y: 180 },
    viewBox: DEFAULT_VIEWBOX,
  },
]
