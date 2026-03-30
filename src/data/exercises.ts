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
  somatic: {
    label: 'Bodhichitta',
    description: 'Respiração consciente, mudras, visualização e ritmo corporal — ativação da mente integrada.',
    color: '#0ea5e9',
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
      duration: 120,
      description: 'Coordena lados opostos do corpo e melhora sincronização.',
      instructions: [
        'Escolha a duração de 2, 3 ou 5 minutos.',
        'Acompanhe o ritmo visual: mão direita no joelho esquerdo, depois troque o lado.',
        'Mantenha respiração nasal e movimento contínuo até o timer zerar.',
      ],
      introMedia: {
        type: 'video',
        alt: 'Espaco reservado para um video demonstrando o toque cruzado.',
        title: 'Video demonstrativo do toque cruzado',
        caption:
          'A estrutura ja aceita um video ou animacao local para explicar o movimento antes de iniciar.',
        expectedPath: '/exercises/toque-cruzado-demo.mp4',
      },
    },
    {
      id: 'desenho-espelhado',
      title: 'Desenho espelhado',
      duration: 75,
      description: 'Estimula bilateralidade com movimento simultâneo.',
      instructions: [
        'Leia a instrução e observe a mídia explicativa antes de iniciar.',
        'Siga a forma-guia e mantenha um traço contínuo.',
        'Use o espelho visual para sustentar simetria e ritmo até o fim do tempo.',
      ],
      introMedia: {
        type: 'video',
        alt: 'Espaco reservado para um video ou imagem demonstrando o desenho espelhado.',
        title: 'Midia explicativa do desenho espelhado',
        caption:
          'Adicione depois uma imagem ou video curto mostrando o gesto bilateral para reduzir ambiguidade.',
        expectedPath: '/exercises/desenho-espelhado-demo.mp4',
      },
      benefits: ['Integração hemisférica', 'Coordenação bilateral', 'Foco motor'],
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
      description: 'Usa formas organicas em movimento continuo para organizar ritmo, foco e coordenação bilateral.',
      instructions: [
        'Comece com a mão esquerda e siga a forma organica com o cursor.',
        'Acompanhe o ponto-guia sem cortar a curva e mantenha o traçado continuo.',
        'Na metade do tempo, troque para a mão direita sem perder o ritmo.',
      ],
      benefits: ['Fluidez bilateral', 'Coordenação olho-mão', 'Ritmo hemisférico'],
    },
    {
      id: 'movimento-ocular-infinito',
      title: 'Movimento ocular em infinito',
      duration: 60,
      description: 'Rastreamento ocular no padrão ∞ ativa integração visual bilateral e sincroniza hemisférios.',
      instructions: [
        'Sem mover a cabeça, trace lentamente o símbolo ∞ com os olhos.',
        'Comece pelo centro, vá para a esquerda, suba, cruze o centro e complete a alça direita.',
        'Complete 6 ciclos lentos, depois 6 rápidos.',
        'Feche os olhos por 5 segundos ao final e observe a sensação.',
      ],
      difficulty: 1,
      benefits: ['Integração visual bilateral', 'Sincronização hemisférica', 'Redução de tensão ocular'],
    },
    {
      id: 'marcha-cruzada',
      title: 'Marcha cruzada',
      duration: 90,
      description: 'Movimento alternado joelho-cotovelo oposto ativa o corpo caloso e melhora comunicação inter-hemisférica.',
      instructions: [
        'De pé ou sentado, eleve o joelho direito tocando com o cotovelo esquerdo.',
        'Alterne: joelho esquerdo com cotovelo direito, mantendo ritmo constante.',
        'Respire pelo nariz durante todo o movimento.',
        'Realize 3 séries de 20 alternâncias, aumentando o ritmo gradualmente.',
      ],
      difficulty: 1,
      introMedia: {
        type: 'video',
        alt: 'Video demonstrando a marcha cruzada com alternância joelho-cotovelo.',
        title: 'Demonstração da marcha cruzada',
        caption: 'Adicione um video curto mostrando o padrão de movimento cruzado para facilitar a execução.',
        expectedPath: '/exercises/marcha-cruzada-demo.mp4',
      },
      benefits: ['Ativação do corpo caloso', 'Integração motor-cognitiva', 'Coordenação rítmica bilateral'],
    },
    {
      id: 'caminhada-cruzada',
      title: 'Caminhada consciente cruzada',
      duration: 120,
      description: 'Caminhada lenta com atenção plena ao padrão cruzado — integra movimento, respiração e presença.',
      instructions: [
        'Caminhe devagar num espaço livre (pelo menos 3 metros).',
        'A cada passo, toque conscientemente a coxa oposta com a mão — direita toca esquerda e vice-versa.',
        'Sincronize: inspire em 2 passos, expire em 2 passos.',
        'Se não houver espaço, simule o padrão no lugar, elevando os joelhos suavemente.',
      ],
      difficulty: 1,
      introMedia: {
        type: 'video',
        alt: 'Video demonstrando a caminhada consciente cruzada com toque de mão na coxa oposta.',
        title: 'Demonstração da caminhada cruzada',
        caption: 'Adicione um video mostrando o padrão de caminhada e sincronização respiratória.',
        expectedPath: '/exercises/caminhada-cruzada-demo.mp4',
      },
      benefits: ['Atenção plena em movimento', 'Integração sensório-motora', 'Regulação ritmo respiratório'],
    },
    {
      id: 'escrita-mao-nao-dominante',
      title: 'Escrita com mão não dominante',
      duration: 90,
      description: 'Escrever com a mão menos usada força novos circuitos neurais e ativa o hemisfério não dominante.',
      instructions: [
        'Pegue papel e caneta — você vai escrever fisicamente neste exercício.',
        'Escolha uma palavra simples (ex: seu nome, uma cor, um animal).',
        'Escreva-a devagar com a mão não dominante, letra por letra.',
        'Aumente a complexidade: escreva uma frase curta com atenção total ao traçado.',
        'Alternativa sem papel: trace letras no ar com a mão não dominante.',
      ],
      difficulty: 2,
      introMedia: {
        type: 'image',
        alt: 'Imagem mostrando papel, caneta e mão não dominante em posição de escrita.',
        title: 'Material necessário: papel e caneta',
        caption: 'Tenha papel e caneta (ou lápis) à mão antes de iniciar este exercício.',
        expectedPath: '/exercises/escrita-mao-nao-dominante-material.jpg',
      },
      benefits: ['Ativação hemisférica cruzada', 'Neuroplasticidade', 'Atenção e controle motor fino'],
    },
  ]),
  ...byCategory('somatic', [
    {
      id: 'respiracao-alternada',
      title: 'Respiração alternada (Nadi Shodhana)',
      duration: 120,
      description: 'Técnica pranayâmica que equilibra os canais de energia e sincroniza os dois hemisférios cerebrais.',
      instructions: [
        'Sente-se confortavelmente com a coluna ereta.',
        'Feche a narina direita com o polegar direito e inspire pela narina esquerda por 4 segundos.',
        'Feche ambas as narinas e segure por 4 segundos.',
        'Abra a narina direita e expire por 4 segundos.',
        'Inspire pela narina direita por 4 segundos, segure, e expire pela esquerda.',
        'Isso é 1 ciclo completo. Realize 6 ciclos sem pressa.',
      ],
      difficulty: 2,
      benefits: ['Equilíbrio hemisférico', 'Redução de ansiedade', 'Clareza mental', 'Regulação do sistema nervoso'],
    },
    {
      id: 'mantra-contagem-mental',
      title: 'Mantra com contagem mental',
      duration: 90,
      description: 'Combina repetição silenciosa de sílaba âncora com contagem simultânea — treina foco dividido e calma ativa.',
      instructions: [
        'Escolha uma sílaba âncora simples: "OM", "SO", "HUM" ou apenas "UN".',
        'Repita a sílaba mentalmente em sincronia com sua respiração.',
        'Ao mesmo tempo, conte cada repetição de 1 a 21 sem perder o fio.',
        'Se perder a conta, retome do 1 com calma.',
        'O objetivo é manter os dois processos simultâneos com leveza.',
      ],
      difficulty: 2,
      benefits: ['Foco dividido', 'Calma ativa', 'Ancoragem atenção', 'Redução de ruído mental'],
    },
    {
      id: 'mudras-respiracao',
      title: 'Mudras com coordenação respiratória',
      duration: 90,
      description: 'Posições específicas das mãos combinadas com respiração rítmica ativam vias neurais e regulam o estado mental.',
      instructions: [
        'Observe a imagem de referência dos mudras antes de iniciar.',
        'Adote o Chin Mudra: polegar e indicador unidos, demais dedos relaxados, palmas para cima.',
        'Inspire por 4 segundos enquanto pressiona suavemente os dedos.',
        'Expire por 6 segundos relaxando a pressão.',
        'Após 3 ciclos, troque para Dhyana Mudra: mãos sobrepostas no colo, polegares unidos.',
        'Continue mais 3 ciclos nessa posição.',
      ],
      difficulty: 1,
      introMedia: {
        type: 'image',
        alt: 'Imagem mostrando as posições dos mudras Chin e Dhyana para referência.',
        title: 'Referência visual dos mudras',
        caption: 'Adicione uma imagem com as posições das mãos para Chin Mudra e Dhyana Mudra.',
        expectedPath: '/exercises/mudras-referencia.jpg',
      },
      benefits: ['Ativação de pontos reflexos', 'Regulação autonômica', 'Ancoragem corporal', 'Foco interoceptivo'],
    },
    {
      id: 'coordenacao-mao-respiracao',
      title: 'Coordenação mão-respiração',
      duration: 75,
      description: 'Sincronizar movimentos das mãos com fases da respiração cria coerência entre ação motora e estado interno.',
      instructions: [
        'Deite os braços relaxados ao lado do corpo ou sobre as coxas.',
        'Na inspiração (4 s): abra lentamente as mãos, dedos se afastando como flores.',
        'Na retenção (2 s): mãos abertas e imóveis.',
        'Na expiração (6 s): feche lentamente as mãos em punho suave.',
        'Mantenha atenção total na sensação das mãos enquanto respira.',
        'Complete pelo menos 8 ciclos contínuos.',
      ],
      difficulty: 1,
      benefits: ['Coerência corpo-mente', 'Interoceptividade', 'Regulação do ritmo cardíaco', 'Presença plena'],
    },
    {
      id: 'visualizacao-simetrica',
      title: 'Visualização simétrica',
      duration: 75,
      description: 'Construir e manter imagens perfeitamente simétricas na mente treina integração bilateral e controle visual interno.',
      instructions: [
        'Feche os olhos e imagine um ponto de luz no centro do seu campo visual.',
        'A partir dele, expanda uma forma simétrica — comece com um triângulo, depois um hexágono.',
        'Mantenha a simetria perfeita: se um lado muda, o outro reflete instantaneamente.',
        'Adicione cor gradualmente — cada metade tem a mesma tonalidade.',
        'Sustente a imagem por 20 segundos antes de dissolvê-la.',
        'Repita com uma forma diferente mais complexa.',
      ],
      difficulty: 2,
      benefits: ['Integração visual bilateral', 'Controle da atenção interna', 'Visualização criativa', 'Equilíbrio hemisférico'],
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
      duration: 105,
      description: 'Treina tomada de decisão sob regra ativa, tempo curto e ambiguidade controlada.',
      instructions: [
        'Cada rodada traz uma regra ativa e um cenário curto.',
        'Escolha entre 3 opções qual melhor responde à regra.',
        'A janela de resposta encurta conforme você avança.',
        'Decida rápido sem perder clareza.',
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
        'Aguarde o estímulo visual e sonoro aparecer de forma imprevisível.',
        'Pressione espaço o mais rápido possível em cada rodada.',
        'Se antecipar, a rodada reinicia com um novo atraso randômico.',
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
  'somatic',
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
    somatic: [],
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
