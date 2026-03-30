import {
  ArrowLeftRight,
  ArrowRightLeft,
  Binary,
  BookMarked,
  Crosshair,
  Divide,
  Eye,
  Flame,
  FlipHorizontal2,
  Footprints,
  GitBranch,
  GitCompareArrows,
  HandHeart,
  HandMetal,
  Hash,
  Images,
  Infinity as InfinityIcon,
  LayoutGrid,
  Lightbulb,
  Link as LinkIcon,
  List,
  ListOrdered,
  MousePointerClick,
  Network,
  Palette,
  PenLine,
  PersonStanding,
  Repeat,
  RotateCw,
  ScanEye,
  SearchCode,
  Shield,
  Shuffle,
  Sparkles,
  Spline,
  Timer,
  Waves,
  Wind,
  Zap,
  type LucideIcon,
} from 'lucide-react'

import type { ExerciseCategory } from '../features/exercises/types'

export const categoryIcons: Record<ExerciseCategory, LucideIcon> = {
  focus: Crosshair,
  memory: BookMarked,
  logic: GitBranch,
  hemispheric: InfinityIcon,
  speed: Zap,
  creativity: Sparkles,
  pressure: Flame,
  somatic: Wind,
}

export const exerciseIcons: Record<string, LucideIcon> = {
  'respiracao-478': Wind,
  'rastreamento-ocular': Eye,
  'atencao-periferica': ScanEye,
  'contagem-reversa': Hash,
  'sequencia-visual': Images,
  'jogo-da-memoria': LayoutGrid,
  'lista-de-palavras': List,
  'associacao-visual': LinkIcon,
  'padrao-numerico': Binary,
  'rotacao-mental': RotateCw,
  'simbolo-diferente': SearchCode,
  'sequencia-logica': ArrowRightLeft,
  'toque-cruzado': HandMetal,
  'desenho-espelhado': Spline,
  'alternancia-simbolo-numero': Shuffle,
  'tracar-infinito': InfinityIcon,
  'movimento-ocular-infinito': ScanEye,
  'marcha-cruzada': Footprints,
  'caminhada-cruzada': PersonStanding,
  'escrita-mao-nao-dominante': PenLine,
  'reacao-rapida': MousePointerClick,
  'numeros-em-ordem': ListOrdered,
  'palavra-vs-cor': Palette,
  'par-ou-impar': Divide,
  'usos-alternativos': Lightbulb,
  'cadeia-de-ideias': Network,
  'analogias-rapidas': GitCompareArrows,
  'respiracao-tatica': Shield,
  'decisao-rapida': Timer,
  'respiracao-alternada': ArrowLeftRight,
  'mantra-contagem-mental': Repeat,
  'mudras-respiracao': HandHeart,
  'coordenacao-mao-respiracao': Waves,
  'visualizacao-simetrica': FlipHorizontal2,
}

export function getCategoryIcon(category: ExerciseCategory): LucideIcon {
  return categoryIcons[category]
}

export function getExerciseIcon(
  exerciseId: string,
  fallbackCategory?: ExerciseCategory,
): LucideIcon {
  if (exerciseIcons[exerciseId]) {
    return exerciseIcons[exerciseId]
  }

  if (fallbackCategory) {
    return categoryIcons[fallbackCategory]
  }

  return Sparkles
}
