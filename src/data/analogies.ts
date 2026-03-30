export type AnalogyType =
  | 'funcao'
  | 'oposicao'
  | 'parte_todo'
  | 'causa_efeito'
  | 'categoria'

export type AnalogyDifficulty = 'easy' | 'medium' | 'hard'

export interface AnalogyEntry {
  a: string
  b: string
  c: string
  answer: string
  distractors: string[]
  type: AnalogyType
  difficulty: AnalogyDifficulty
}

const ANALOGIES: AnalogyEntry[] = [
  // ─── Funcao ─────────────────────────────────────────────────────
  // easy
  { a: 'FACA', b: 'CORTAR', c: 'MARTELO', answer: 'PREGAR', distractors: ['QUEBRAR', 'BATER', 'CONSTRUIR'], type: 'funcao', difficulty: 'easy' },
  { a: 'OLHO', b: 'VER', c: 'OUVIDO', answer: 'OUVIR', distractors: ['FALAR', 'SENTIR', 'TOCAR'], type: 'funcao', difficulty: 'easy' },
  { a: 'CANETA', b: 'ESCREVER', c: 'PINCEL', answer: 'PINTAR', distractors: ['DESENHAR', 'COLORIR', 'MISTURAR'], type: 'funcao', difficulty: 'easy' },
  { a: 'CARRO', b: 'DIRIGIR', c: 'AVIAO', answer: 'PILOTAR', distractors: ['VOAR', 'DECOLAR', 'NAVEGAR'], type: 'funcao', difficulty: 'easy' },
  { a: 'TESOURA', b: 'CORTAR', c: 'VASSOURA', answer: 'VARRER', distractors: ['LIMPAR', 'ESFREGAR', 'SACUDIR'], type: 'funcao', difficulty: 'easy' },
  { a: 'RELOGIO', b: 'MEDIR TEMPO', c: 'TERMOMETRO', answer: 'MEDIR TEMPERATURA', distractors: ['AQUECER', 'RESFRIAR', 'CALCULAR'], type: 'funcao', difficulty: 'easy' },
  // medium
  { a: 'OLHO', b: 'CAMERA', c: 'OUVIDO', answer: 'MICROFONE', distractors: ['RADIO', 'ANTENA', 'CAIXA'], type: 'funcao', difficulty: 'medium' },
  { a: 'PINTOR', b: 'PINCEL', c: 'ESCRITOR', answer: 'CANETA', distractors: ['LIVRO', 'PAPEL', 'TINTA'], type: 'funcao', difficulty: 'medium' },
  { a: 'MOTOR', b: 'CARRO', c: 'CORACAO', answer: 'CORPO', distractors: ['SANGUE', 'PULMAO', 'PEITO'], type: 'funcao', difficulty: 'medium' },
  { a: 'CHAVE', b: 'PORTA', c: 'SENHA', answer: 'CONTA', distractors: ['CELULAR', 'TECLADO', 'SITE'], type: 'funcao', difficulty: 'medium' },
  // hard
  { a: 'BUSSOLA', b: 'DIRECAO', c: 'RELOGIO', answer: 'TEMPO', distractors: ['HORA', 'PONTEIRO', 'SEGUNDOS'], type: 'funcao', difficulty: 'hard' },
  { a: 'RADAR', b: 'DETECTAR', c: 'SONAR', answer: 'SONDAR', distractors: ['MERGULHAR', 'ECOAR', 'VIBRAR'], type: 'funcao', difficulty: 'hard' },

  // ─── Oposicao ───────────────────────────────────────────────────
  // easy
  { a: 'QUENTE', b: 'FRIO', c: 'ALTO', answer: 'BAIXO', distractors: ['GRANDE', 'LARGO', 'CURTO'], type: 'oposicao', difficulty: 'easy' },
  { a: 'DIA', b: 'NOITE', c: 'LUZ', answer: 'ESCURIDAO', distractors: ['SOMBRA', 'TREVAS', 'CREPUSCULO'], type: 'oposicao', difficulty: 'easy' },
  { a: 'RAPIDO', b: 'LENTO', c: 'GRANDE', answer: 'PEQUENO', distractors: ['FINO', 'MINUSCULO', 'CURTO'], type: 'oposicao', difficulty: 'easy' },
  { a: 'CHEIO', b: 'VAZIO', c: 'ABERTO', answer: 'FECHADO', distractors: ['TRANCADO', 'COBERTO', 'SELADO'], type: 'oposicao', difficulty: 'easy' },
  { a: 'FORTE', b: 'FRACO', c: 'DURO', answer: 'MOLE', distractors: ['MACIO', 'LEVE', 'FRAGIL'], type: 'oposicao', difficulty: 'easy' },
  { a: 'JOVEM', b: 'VELHO', c: 'NOVO', answer: 'ANTIGO', distractors: ['USADO', 'GASTO', 'VELHO'], type: 'oposicao', difficulty: 'easy' },
  // medium
  { a: 'DIA', b: 'NOITE', c: 'VERAO', answer: 'INVERNO', distractors: ['CHUVA', 'OUTONO', 'JANEIRO'], type: 'oposicao', difficulty: 'medium' },
  { a: 'COMECAR', b: 'TERMINAR', c: 'NASCER', answer: 'MORRER', distractors: ['VIVER', 'CRESCER', 'ENVELHECER'], type: 'oposicao', difficulty: 'medium' },
  { a: 'BARULHO', b: 'SILENCIO', c: 'GUERRA', answer: 'PAZ', distractors: ['CALMA', 'TRÉGUA', 'ACORDO'], type: 'oposicao', difficulty: 'medium' },
  { a: 'GENEROSO', b: 'AVARENTO', c: 'CORAJOSO', answer: 'COVARDE', distractors: ['TIMIDO', 'MEDROSO', 'FRAGIL'], type: 'oposicao', difficulty: 'medium' },
  // hard
  { a: 'EFEMERO', b: 'ETERNO', c: 'CONCRETO', answer: 'ABSTRATO', distractors: ['INVISIVEL', 'FILOSOFICO', 'TEORICO'], type: 'oposicao', difficulty: 'hard' },
  { a: 'ABUNDANCIA', b: 'ESCASSEZ', c: 'ORDEM', answer: 'CAOS', distractors: ['DESORDEM', 'ENTROPIA', 'CONFUSAO'], type: 'oposicao', difficulty: 'hard' },

  // ─── Parte-Todo ─────────────────────────────────────────────────
  // easy
  { a: 'RODA', b: 'CARRO', c: 'PAGINA', answer: 'LIVRO', distractors: ['CADERNO', 'REVISTA', 'JORNAL'], type: 'parte_todo', difficulty: 'easy' },
  { a: 'DEDO', b: 'MAO', c: 'GALHO', answer: 'ARVORE', distractors: ['FOLHA', 'FLORESTA', 'RAIZ'], type: 'parte_todo', difficulty: 'easy' },
  { a: 'TECLA', b: 'TECLADO', c: 'DENTE', answer: 'BOCA', distractors: ['MANDIBULA', 'LINGUA', 'ROSTO'], type: 'parte_todo', difficulty: 'easy' },
  { a: 'PETALA', b: 'FLOR', c: 'GOTA', answer: 'OCEANO', distractors: ['RIO', 'CHUVA', 'NUVEM'], type: 'parte_todo', difficulty: 'easy' },
  { a: 'LETRA', b: 'PALAVRA', c: 'NOTA', answer: 'MUSICA', distractors: ['PIANO', 'SOM', 'MELODIA'], type: 'parte_todo', difficulty: 'easy' },
  // medium
  { a: 'TIJOLO', b: 'PAREDE', c: 'CELULA', answer: 'ORGANISMO', distractors: ['CORPO', 'TECIDO', 'ORGAO'], type: 'parte_todo', difficulty: 'medium' },
  { a: 'PIXEL', b: 'IMAGEM', c: 'ATOMO', answer: 'MATERIA', distractors: ['MOLECULA', 'ELEMENTO', 'SUBSTANCIA'], type: 'parte_todo', difficulty: 'medium' },
  { a: 'PARAFUSO', b: 'MAQUINA', c: 'NEURONIO', answer: 'CEREBRO', distractors: ['MENTE', 'CRANIO', 'SINAPSE'], type: 'parte_todo', difficulty: 'medium' },
  // hard
  { a: 'VERSO', b: 'POEMA', c: 'CENA', answer: 'FILME', distractors: ['TEATRO', 'ESPETACULO', 'ROTEIRO'], type: 'parte_todo', difficulty: 'hard' },
  { a: 'INDIVIDUO', b: 'SOCIEDADE', c: 'ESTRELA', answer: 'GALAXIA', distractors: ['UNIVERSO', 'CONSTELACAO', 'NEBULOSA'], type: 'parte_todo', difficulty: 'hard' },

  // ─── Causa-Efeito ───────────────────────────────────────────────
  // easy
  { a: 'CHUVA', b: 'MOLHADO', c: 'FOGO', answer: 'CINZAS', distractors: ['FUMACA', 'CALOR', 'BRASA'], type: 'causa_efeito', difficulty: 'easy' },
  { a: 'SOL', b: 'SOMBRA', c: 'LAMPADA', answer: 'LUZ', distractors: ['CALOR', 'ENERGIA', 'BRILHO'], type: 'causa_efeito', difficulty: 'easy' },
  { a: 'EXERCICIO', b: 'SUOR', c: 'ESTUDO', answer: 'CONHECIMENTO', distractors: ['CANSACO', 'LIVRO', 'PROVA'], type: 'causa_efeito', difficulty: 'easy' },
  { a: 'SEMENTE', b: 'PLANTA', c: 'OVO', answer: 'PASSARO', distractors: ['NINHO', 'PENA', 'ASA'], type: 'causa_efeito', difficulty: 'easy' },
  { a: 'VENTO', b: 'ONDAS', c: 'TERREMOTO', answer: 'TSUNAMI', distractors: ['DESTRUICAO', 'RACHADURA', 'TREMOR'], type: 'causa_efeito', difficulty: 'easy' },
  // medium
  { a: 'PRATICA', b: 'HABILIDADE', c: 'LEITURA', answer: 'VOCABULARIO', distractors: ['CULTURA', 'INTELIGENCIA', 'SABEDORIA'], type: 'causa_efeito', difficulty: 'medium' },
  { a: 'PRESSAO', b: 'DIAMANTE', c: 'TEMPO', answer: 'FOSSIL', distractors: ['RUINA', 'MEMORIA', 'EROSAO'], type: 'causa_efeito', difficulty: 'medium' },
  { a: 'GRAVIDADE', b: 'QUEDA', c: 'MAGNETISMO', answer: 'ATRACAO', distractors: ['CAMPO', 'POLO', 'FORCA'], type: 'causa_efeito', difficulty: 'medium' },
  // hard
  { a: 'EROSAO', b: 'CANYON', c: 'PRESSAO', answer: 'CRISTAL', distractors: ['MINERIO', 'ROCHA', 'MAGMA'], type: 'causa_efeito', difficulty: 'hard' },
  { a: 'MUTACAO', b: 'EVOLUCAO', c: 'INOVACAO', answer: 'PROGRESSO', distractors: ['TECNOLOGIA', 'FUTURO', 'CIENCIA'], type: 'causa_efeito', difficulty: 'hard' },

  // ─── Categoria ──────────────────────────────────────────────────
  // easy
  { a: 'MACA', b: 'FRUTA', c: 'CACHORRO', answer: 'ANIMAL', distractors: ['MAMIFERO', 'PET', 'BICHO'], type: 'categoria', difficulty: 'easy' },
  { a: 'ROSA', b: 'FLOR', c: 'CARVALHO', answer: 'ARVORE', distractors: ['MADEIRA', 'PLANTA', 'FOLHA'], type: 'categoria', difficulty: 'easy' },
  { a: 'GUITARRA', b: 'INSTRUMENTO', c: 'FUTEBOL', answer: 'ESPORTE', distractors: ['JOGO', 'BOLA', 'COMPETICAO'], type: 'categoria', difficulty: 'easy' },
  { a: 'BRASIL', b: 'PAIS', c: 'PARIS', answer: 'CIDADE', distractors: ['CAPITAL', 'LUGAR', 'FRANCA'], type: 'categoria', difficulty: 'easy' },
  { a: 'VERMELHO', b: 'COR', c: 'CIRCULO', answer: 'FORMA', distractors: ['GEOMETRIA', 'FIGURA', 'DESENHO'], type: 'categoria', difficulty: 'easy' },
  // medium
  { a: 'PEIXE', b: 'AGUA', c: 'PASSARO', answer: 'AR', distractors: ['NINHO', 'ASA', 'VENTO'], type: 'categoria', difficulty: 'medium' },
  { a: 'OXIGENIO', b: 'GAS', c: 'FERRO', answer: 'METAL', distractors: ['MINERAL', 'ELEMENTO', 'SOLIDO'], type: 'categoria', difficulty: 'medium' },
  { a: 'MARTE', b: 'PLANETA', c: 'SOL', answer: 'ESTRELA', distractors: ['ASTRO', 'GALAXIA', 'SISTEMA'], type: 'categoria', difficulty: 'medium' },
  { a: 'PORTUGUES', b: 'IDIOMA', c: 'PYTHON', answer: 'LINGUAGEM', distractors: ['CODIGO', 'PROGRAMA', 'COMPUTADOR'], type: 'categoria', difficulty: 'medium' },
  // hard
  { a: 'DEMOCRACIA', b: 'GOVERNO', c: 'CAPITALISMO', answer: 'ECONOMIA', distractors: ['SISTEMA', 'POLITICA', 'MERCADO'], type: 'categoria', difficulty: 'hard' },
  { a: 'SINFONIA', b: 'MUSICA', c: 'ROMANCE', answer: 'LITERATURA', distractors: ['LIVRO', 'ESCRITA', 'PROSA'], type: 'categoria', difficulty: 'hard' },
]

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j]!, copy[i]!]
  }
  return copy
}

/**
 * Get a list of analogies filtered by difficulty, excluding already-used IDs.
 * ID is derived from `a-b-c`.
 */
export function getAnalogies(
  difficulty: AnalogyDifficulty,
  count: number,
  exclude: Set<string> = new Set(),
): Array<AnalogyEntry & { id: string; options: string[] }> {
  const pool = ANALOGIES.filter(
    (a) => a.difficulty === difficulty && !exclude.has(analogyId(a)),
  )

  // Fallback if not enough
  const source = pool.length >= count ? pool : ANALOGIES.filter((a) => a.difficulty === difficulty)

  const selected = shuffle(source).slice(0, count)

  return selected.map((entry) => ({
    ...entry,
    id: analogyId(entry),
    options: shuffle([entry.answer, ...entry.distractors]).slice(0, 4),
  }))
}

/**
 * Get a single random analogy for the given difficulty.
 */
export function getRandomAnalogy(
  difficulty: AnalogyDifficulty,
  exclude: Set<string> = new Set(),
): AnalogyEntry & { id: string; options: string[] } {
  return getAnalogies(difficulty, 1, exclude)[0]!
}

export function analogyId(entry: { a: string; b: string; c: string }): string {
  return `${entry.a}-${entry.b}-${entry.c}`
}
