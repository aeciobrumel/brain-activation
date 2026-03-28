import type { CategoryTheme, Exercise, ExerciseCategory } from '../features/exercises/types'

export const categoryThemes: Record<ExerciseCategory, CategoryTheme> = {
  focus: {
    label: 'Foco',
    description: 'Estabilidade atencional, presença e controle de distrações.',
    color: '#3b82f6',
  },
  memory: {
    label: 'Memória',
    description: 'Associação visual, retenção rápida e recuperação mental.',
    color: '#22c55e',
  },
  logic: {
    label: 'Lógica',
    description: 'Padrões, raciocínio estruturado e tomada de decisão.',
    color: '#8b5cf6',
  },
  hemispheric: {
    label: 'Coordenação Hemisférica',
    description: 'Integração bilateral, ritmo e fluidez motora.',
    color: '#f97316',
  },
  speed: {
    label: 'Velocidade Mental',
    description: 'Resposta rápida, agilidade e processamento instantâneo.',
    color: '#ef4444',
  },
  creativity: {
    label: 'Criatividade',
    description: 'Pensamento divergente, associações remotas e inteligência fluida.',
    color: '#ec4899',
  },
  pressure: {
    label: 'Clareza sob Pressão',
    description: 'Manutenção de desempenho cognitivo em situações de alta demanda.',
    color: '#14b8a6',
  },
}

const byCategory = <T extends ExerciseCategory>(category: T, entries: Omit<Exercise, 'category' | 'color'>[]) =>
  entries.map((entry) => ({
    ...entry,
    category,
    color: categoryThemes[category].color,
  }))

export const exercises: Exercise[] = [
  ...byCategory('focus', [
    {
      id: 'respiracao-478',
      title: 'Respiração 4-7-8',
      duration: 90,
      description: 'Activa o sistema parassimpático. Reduz cortisol e prepara o cérebro para foco profundo.',
      instructions: [
        'Inspire pelo nariz por 4 segundos.',
        'Segure o ar por 7 segundos.',
        'Expire pela boca por 8 segundos — lento, completo.',
        'Repita o ciclo. Complete pelo menos 4 ciclos para efeito máximo.',
      ],
      difficulty: 1,
      benefits: ['Reduz ansiedade', 'Activa parassimpático', 'Prepara foco profundo'],
    },
    {
      id: 'rastreamento-ocular',
      title: 'Rastreamento ocular',
      duration: 60,
      description: 'Organiza atenção visual e desperta percepção espacial.',
      instructions: [
        'Mantenha a cabeça parada.',
        'Mova apenas os olhos da esquerda para a direita por 20 segundos.',
        'Repita para cima/baixo e depois em diagonais suaves.',
      ],
    },
    {
      id: 'atencao-periferica',
      title: 'Atenção periférica',
      duration: 75,
      description: 'Expande o campo atencional sem perder o ponto central.',
      instructions: [
        'Olhe para um ponto fixo no centro da tela.',
        'Sem mover os olhos, note o que existe nas bordas do ambiente.',
        'Respire lentamente enquanto amplia sua percepção lateral.',
      ],
    },
    {
      id: 'contagem-reversa',
      title: 'Contagem reversa',
      duration: 60,
      description: 'Treina foco sustentado e controle de impulsividade.',
      instructions: [
        'O sistema sorteia uma sequência de contagem reversa.',
        'Você pode descer de 3 em 3, 4 em 4 ou 6 em 6, com início proporcional.',
        'Sempre que errar, retome calmamente do último número correto.',
        'Mantenha o ritmo estável até concluir o tempo.',
      ],
    },
  ]),
  ...byCategory('memory', [
    {
      id: 'sequencia-visual',
      title: 'Sequência visual',
      duration: 90,
      description: 'Ativa memória de curto prazo com imagens mentais rápidas.',
      instructions: [
        'Imagine 4 objetos em sequência.',
        'Repita a ordem duas vezes mentalmente.',
        'Troque a ordem final e recite de trás para frente.',
      ],
    },
    {
      id: 'jogo-da-memoria',
      title: 'Jogo da memória',
      duration: 75,
      description: 'Reforça pares e associação imediata entre elementos.',
      instructions: [
        'Escolha mentalmente 3 pares de objetos.',
        'Associe cada par com uma cena exagerada.',
        'Recupere os pares sem olhar para qualquer anotação.',
      ],
    },
    {
      id: 'lista-de-palavras',
      title: 'Lista de palavras rápida',
      duration: 78,
      description: 'Melhora retenção verbal com encadeamento breve.',
      instructions: [
        'Crie uma lista mental de 5 palavras.',
        'Una todas numa pequena história absurda.',
        'Repita a lista duas vezes e depois inverta a ordem.',
      ],
    },
    {
      id: 'associacao-visual',
      title: 'Associação visual',
      duration: 90,
      description: 'Transforma conceitos abstratos em imagens memoráveis.',
      instructions: [
        'Uma palavra abstrata é sorteada a cada rodada.',
        'Converta em uma imagem exagerada e em movimento.',
        'Observe mentalmente essa cena por alguns segundos e recupere-a.',
      ],
    },
  ]),
  ...byCategory('logic', [
    {
      id: 'padrao-numerico',
      title: 'Padrão numérico',
      duration: 90,
      description: 'Fortalece detecção de regularidades e sequência lógica.',
      instructions: [
        'Crie uma série curta, como 2, 4, 8.',
        'Descubra a regra e continue por mais cinco números.',
        'Troque a regra e repita sem perder a coerência.',
      ],
    },
    {
      id: 'rotacao-mental',
      title: 'Rotação mental',
      duration: 75,
      description: 'Trabalha visualização espacial e manipulação interna de formas.',
      instructions: [
        'Imagine uma letra simples, como F ou R.',
        'Gire a forma 90 graus mentalmente.',
        'Descreva como ela ficaria após nova rotação.',
      ],
    },
    {
      id: 'simbolo-diferente',
      title: 'Símbolo diferente',
      duration: 75,
      description: 'Treina discriminação rápida entre padrões semelhantes.',
      instructions: [
        'Imagine uma fileira com símbolos quase iguais.',
        'Defina mentalmente apenas um diferente.',
        'Localize esse elemento o mais rápido possível.',
      ],
    },
    {
      id: 'sequencia-logica',
      title: 'Sequência lógica',
      duration: 90,
      description: 'Aumenta clareza na progressão de regras simples.',
      instructions: [
        'Monte uma sequência com formas ou números.',
        'Descubra a lógica de alternância entre os elementos.',
        'Estenda a série por três passos adicionais.',
      ],
    },
  ]),
  ...byCategory('hemispheric', [
    {
      id: 'toque-cruzado',
      title: 'Toque cruzado',
      duration: 75,
      description: 'Coordena lados opostos do corpo e melhora sincronização.',
      instructions: [
        'Toque joelho esquerdo com mão direita.',
        'Depois toque joelho direito com mão esquerda.',
        'Mantenha o ritmo constante e a respiração nasal.',
      ],
    },
    {
      id: 'desenho-espelhado',
      title: 'Desenho espelhado',
      duration: 75,
      description: 'Estimula bilateralidade com movimento simultâneo.',
      instructions: [
        'Levante as duas mãos.',
        'Desenhe círculos espelhados no ar ao mesmo tempo.',
        'Mantenha simetria e suavidade até o fim do tempo.',
      ],
    },
    {
      id: 'alternancia-simbolo-numero',
      title: 'Alternância símbolo número',
      duration: 75,
      description: 'Troca rápida entre códigos diferentes ativa integração cortical.',
      instructions: [
        'Alterne entre dizer um número e imaginar um símbolo.',
        'Exemplo: 1, estrela, 2, triângulo, 3, raio.',
        'Aumente a velocidade sem perder a ordem.',
      ],
    },
    {
      id: 'tracar-infinito',
      title: 'Traçar infinito',
      duration: 60,
      description: 'Usa o movimento em oito para organizar ritmo e atenção.',
      instructions: [
        'Desenhe um símbolo de infinito no ar com o dedo.',
        'Siga a linha com os olhos.',
        'Troque de mão depois da metade do tempo.',
      ],
    },
  ]),
  ...byCategory('creativity', [
    {
      id: 'usos-alternativos',
      title: 'Usos alternativos',
      duration: 60,
      description: 'Activa pensamento divergente forçando a mente a escapar da função óbvia dos objetos.',
      instructions: [
        'Um objeto comum será exibido (ex: TIJOLO).',
        'Liste mentalmente o máximo de usos incomuns em 60 segundos.',
        'Ignore os usos óbvios — quanto mais improvável, melhor.',
        'Tente atingir pelo menos 8 usos únicos.',
      ],
      difficulty: 1,
      benefits: ['Pensamento divergente', 'Flexibilidade cognitiva', 'Fluência criativa'],
    },
    {
      id: 'cadeia-de-ideias',
      title: 'Cadeia de ideias',
      duration: 75,
      description: 'Treina associação livre e velocidade de pensamento divergente.',
      instructions: [
        'Uma palavra-âncora será exibida.',
        'Pense em uma palavra associada — qualquer associação serve.',
        'Cada resposta torna-se o próximo ponto de partida.',
        'Construa a cadeia mais longa possível sem travar.',
      ],
      difficulty: 2,
      benefits: ['Associação livre', 'Fluidez verbal', 'Inteligência fluida'],
    },
    {
      id: 'analogias-rapidas',
      title: 'Analogias rápidas',
      duration: 90,
      description: 'Compara estruturas entre domínios distintos — base do pensamento criativo avançado.',
      instructions: [
        'Um par de conceitos será apresentado (ex: OLHO : CÂMERA).',
        'Identifique a relação entre os dois.',
        'Aplique a mesma relação a um novo par.',
        'Velocidade e precisão são igualmente importantes.',
      ],
      difficulty: 2,
      benefits: ['Raciocínio analógico', 'Integração de domínios', 'Abstração'],
    },
  ]),
  ...byCategory('pressure', [
    {
      id: 'respiracao-tatica',
      title: 'Respiração tática',
      duration: 60,
      description: 'Protocolo 4-4-4-4 usado por forças especiais para recuperar clareza sob estresse.',
      instructions: [
        'Inspire por 4 segundos.',
        'Segure por 4 segundos.',
        'Expire por 4 segundos.',
        'Segure por 4 segundos. Repita sem pausar o ritmo.',
      ],
      difficulty: 1,
      benefits: ['Controle emocional', 'Clareza sob pressão', 'Regulação do SNA'],
    },
    {
      id: 'decisao-rapida',
      title: 'Decisão rápida',
      duration: 75,
      description: 'Treina tomada de decisão binária sob restrição de tempo e carga cognitiva.',
      instructions: [
        'Um cenário simples será descrito.',
        'Você tem 3 segundos para decidir A ou B.',
        'Não existe resposta errada — o treino é a velocidade de decisão.',
        'Reduza a hesitação sem perder a intenção.',
      ],
      difficulty: 3,
      benefits: ['Velocidade de decisão', 'Tolerância à ambiguidade', 'Foco sob pressão'],
    },
  ]),
  ...byCategory('speed', [
    {
      id: 'reacao-rapida',
      title: 'Reação rápida',
      duration: 60,
      description: 'Acelera resposta motora e prontidão mental.',
      instructions: [
        'Defina um estímulo imaginário, como ouvir um clique.',
        'Sempre que pensar nele, bata uma palma leve ou toque na mesa.',
        'Tente reduzir o tempo entre estímulo e resposta.',
      ],
    },
    {
      id: 'numeros-em-ordem',
      title: 'Clique números em ordem',
      duration: 60,
      description: 'Treina escaneamento rápido e sequência visual.',
      instructions: [
        'Imagine números espalhados de 1 a 9.',
        'Encontre-os mentalmente em ordem crescente.',
        'Repita tentando acelerar sem pular etapas.',
      ],
    },
    {
      id: 'palavra-vs-cor',
      title: 'Palavra vs cor',
      duration: 60,
      description: 'Desafia interferência cognitiva e leitura automática.',
      instructions: [
        'Pense em nomes de cores escritos com tinta errada.',
        'Diga a cor da tinta, não a palavra.',
        'Mantenha a velocidade com precisão.',
      ],
    },
    {
      id: 'par-ou-impar',
      title: 'Par ou ímpar',
      duration: 45,
      description: 'Exige classificação instantânea com baixa latência.',
      instructions: [
        'Imagine números aleatórios surgindo rapidamente.',
        'Classifique cada um como par ou ímpar.',
        'Não pare o ritmo até o timer zerar.',
      ],
    },
  ]),
]

export const categoryOrder: ExerciseCategory[] = [
  'focus',
  'memory',
  'logic',
  'hemispheric',
  'speed',
  'creativity',
  'pressure',
]

export const exercisesByCategory = exercises.reduce<Record<ExerciseCategory, Exercise[]>>(
  (accumulator, exercise) => {
    accumulator[exercise.category].push(exercise)
    return accumulator
  },
  {
    focus: [],
    memory: [],
    logic: [],
    hemispheric: [],
    speed: [],
    creativity: [],
    pressure: [],
  },
)

export const dailyTrainingExercises = [
  'respiracao-478',       // pré-sessão: ativa parassimpático
  'rastreamento-ocular',
  'atencao-periferica',
  'associacao-visual',
  'toque-cruzado',
  'numeros-em-ordem',
  'palavra-vs-cor',
  'reacao-rapida',
].map((id) => exercises.find((exercise) => exercise.id === id)!)

export const quickActivationExercises = [
  'rastreamento-ocular',
  'atencao-periferica',
  'toque-cruzado',
].map((id) => exercises.find((exercise) => exercise.id === id)!)
