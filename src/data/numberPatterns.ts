export type PatternDifficulty = 'easy' | 'medium' | 'hard'

export interface GeneratedPattern {
  sequence: number[]
  answer: number
  rule: string
}

interface PatternTemplate {
  name: string
  difficulty: PatternDifficulty
  generate: () => GeneratedPattern
}

function randItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!
}

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

const TEMPLATES: PatternTemplate[] = [
  // ─── Easy: progressões lineares ───────────────────────────────
  {
    name: 'linear-add',
    difficulty: 'easy',
    generate() {
      const step = randItem([2, 3, 4, 5])
      const start = randInt(1, 10)
      const seq = Array.from({ length: 5 }, (_, i) => start + i * step)
      const answer = start + 5 * step
      return { sequence: seq, answer, rule: `+${step}` }
    },
  },
  {
    name: 'linear-sub',
    difficulty: 'easy',
    generate() {
      const step = randItem([2, 3, 4])
      const start = randInt(40, 60)
      const seq = Array.from({ length: 5 }, (_, i) => start - i * step)
      const answer = start - 5 * step
      return { sequence: seq, answer, rule: `-${step}` }
    },
  },
  {
    name: 'block-repeat-3',
    difficulty: 'easy',
    generate() {
      const a = randInt(1, 5)
      const b = a + randItem([2, 3, 4])
      const c = b + randItem([2, 3, 4])
      const seq = [a, b, c, a, b, c]
      const answer = a
      return { sequence: seq, answer, rule: 'bloco repetido' }
    },
  },
  {
    name: 'block-repeat-2',
    difficulty: 'easy',
    generate() {
      const a = randInt(2, 8)
      const b = a + randItem([3, 5, 7])
      const seq = [a, b, a, b, a]
      const answer = b
      return { sequence: seq, answer, rule: 'alternancia' }
    },
  },
  {
    name: 'count-by-ten',
    difficulty: 'easy',
    generate() {
      const start = randItem([10, 20, 5])
      const seq = Array.from({ length: 5 }, (_, i) => start + i * 10)
      const answer = start + 50
      return { sequence: seq, answer, rule: '+10' }
    },
  },

  // ─── Medium: alternados e progressivos leves ──────────────────
  {
    name: 'alternating-add-sub',
    difficulty: 'medium',
    generate() {
      const add = randItem([2, 3, 4])
      const sub = randItem([1, 2])
      const start = randInt(2, 8)
      const seq = [start]
      const deltas = [add, -sub]
      for (let i = 0; i < 5; i++) {
        seq.push(seq.at(-1)! + deltas[i % 2]!)
      }
      const shown = seq.slice(0, -1)
      return { sequence: shown, answer: seq.at(-1)!, rule: `+${add} -${sub}` }
    },
  },
  {
    name: 'progressive-increment',
    difficulty: 'medium',
    generate() {
      const start = randItem([1, 2, 3])
      const seq = [start]
      for (let i = 1; i <= 5; i++) {
        seq.push(seq.at(-1)! + i)
      }
      const shown = seq.slice(0, -1)
      return { sequence: shown, answer: seq.at(-1)!, rule: '+1,+2,+3...' }
    },
  },
  {
    name: 'progressive-decrement',
    difficulty: 'medium',
    generate() {
      const start = randInt(50, 70)
      const seq = [start]
      for (let i = 1; i <= 5; i++) {
        seq.push(seq.at(-1)! - i)
      }
      const shown = seq.slice(0, -1)
      return { sequence: shown, answer: seq.at(-1)!, rule: '-1,-2,-3...' }
    },
  },
  {
    name: 'double-step',
    difficulty: 'medium',
    generate() {
      const step = randItem([2, 3])
      const start = randInt(1, 5)
      const seq = [start]
      let currentStep = step
      for (let i = 0; i < 5; i++) {
        seq.push(seq.at(-1)! + currentStep)
        currentStep += step
      }
      const shown = seq.slice(0, -1)
      return { sequence: shown, answer: seq.at(-1)!, rule: `passo +${step}` }
    },
  },
  {
    name: 'alternating-values-growing',
    difficulty: 'medium',
    generate() {
      // Two interleaved sequences growing: 2,10, 4,12, 6,14 → answer is 8
      const startA = randInt(1, 4)
      const startB = startA + randInt(6, 10)
      const step = randItem([2, 3])
      const seq = []
      for (let i = 0; i < 3; i++) {
        seq.push(startA + i * step, startB + i * step)
      }
      const answer = startA + 3 * step
      return { sequence: seq, answer, rule: 'duas series' }
    },
  },

  // ─── Hard: multiplicação, posicional, mistos ──────────────────
  {
    name: 'multiply-simple',
    difficulty: 'hard',
    generate() {
      const ratio = randItem([2, 3])
      const start = randItem([2, 3, 4])
      const seq = Array.from({ length: 4 }, (_, i) => start * ratio ** i)
      const answer = start * ratio ** 4
      // Cap: if answer > 100, use ratio=2, start=2
      if (answer > 100) {
        const s = [2, 4, 8, 16]
        return { sequence: s, answer: 32, rule: 'x2' }
      }
      return { sequence: seq, answer, rule: `x${ratio}` }
    },
  },
  {
    name: 'positional-odd-even',
    difficulty: 'hard',
    generate() {
      // Odd positions: +2, Even positions: +2, but different series
      const a = randInt(2, 5)
      const b = a + randInt(2, 4)
      const step = randItem([2, 3])
      const seq = []
      for (let i = 0; i < 3; i++) {
        seq.push(a + i * step, b + i * step)
      }
      const answer = a + 3 * step
      return { sequence: seq, answer, rule: 'posicional' }
    },
  },
  {
    name: 'fibonacci-lite',
    difficulty: 'hard',
    generate() {
      const a = randItem([1, 2, 3])
      const b = randItem([2, 3, 5])
      const seq = [a, b]
      while (seq.length < 5) {
        seq.push(seq.at(-1)! + seq.at(-2)!)
      }
      const answer = seq.at(-1)! + seq.at(-2)!
      return { sequence: seq, answer, rule: 'soma anterior' }
    },
  },
  {
    name: 'squares',
    difficulty: 'hard',
    generate() {
      const offset = randItem([0, 1])
      const seq = Array.from({ length: 5 }, (_, i) => (i + 1 + offset) ** 2)
      const answer = (6 + offset) ** 2
      return { sequence: seq, answer, rule: 'quadrados' }
    },
  },
  {
    name: 'add-then-double',
    difficulty: 'hard',
    generate() {
      const start = randItem([1, 2, 3])
      // Pattern: +1, x2, +1, x2, +1
      const seq = [start]
      const ops = [1, 2, 1, 2, 1] // 1=add1, 2=double
      for (let i = 0; i < 5; i++) {
        seq.push(ops[i] === 1 ? seq.at(-1)! + 1 : seq.at(-1)! * 2)
      }
      const shown = seq.slice(0, -1)
      if (seq.at(-1)! > 100) {
        // Fallback to simple
        return { sequence: [1, 2, 4, 5, 10], answer: 11, rule: '+1 x2' }
      }
      return { sequence: shown, answer: seq.at(-1)!, rule: '+1 x2' }
    },
  },
]

function getTemplatesByDifficulty(difficulty: PatternDifficulty): PatternTemplate[] {
  return TEMPLATES.filter((t) => t.difficulty === difficulty)
}

/**
 * Maps tier (0-4) to difficulty level.
 * Tier 0-1 = easy, 2-3 = medium, 4 = hard
 */
export function tierToDifficulty(tier: number): PatternDifficulty {
  if (tier <= 1) return 'easy'
  if (tier <= 3) return 'medium'
  return 'hard'
}

/**
 * Generates a pattern question for the given tier.
 * Returns 4 shuffled options including the correct answer.
 */
export function generatePattern(tier: number): {
  sequence: number[]
  answer: number
  options: number[]
  rule: string
} {
  const difficulty = tierToDifficulty(tier)
  const templates = getTemplatesByDifficulty(difficulty)
  const template = randItem(templates)
  const { sequence, answer, rule } = template.generate()

  // Build distractors close to the answer
  const distractors = new Set<number>()
  const offsets = [-3, -2, -1, 1, 2, 3, 4, 5]
  for (const off of offsets) {
    if (distractors.size >= 3) break
    const d = answer + off
    if (d !== answer && d > 0) {
      distractors.add(d)
    }
  }

  const options = Array.from(new Set([answer, ...distractors]))
    .slice(0, 4)
    .sort(() => Math.random() - 0.5)

  return { sequence, answer, options, rule }
}
