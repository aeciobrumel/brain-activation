import { ImagePlus, Save, WandSparkles } from 'lucide-react'
import { useState } from 'react'

import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { useAIMemoryGenerator } from '../hooks/useAIMemoryGenerator'

export function AIMemoryGenerator() {
  const [input, setInput] = useState('H2O')
  const {
    result,
    savedMemories,
    isLoading,
    error,
    generate,
    saveCurrentMemory,
    isUsingFallback,
  } = useAIMemoryGenerator()

  return (
    <Card className="overflow-hidden border-0 bg-slate-950 text-white">
      <div className="grid gap-6 xl:grid-cols-[0.46fr_0.54fr]">
        <div className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm">
            <WandSparkles className="h-4 w-4" />
            Gerador de Memória Visual com IA
          </div>
          <div>
            <h2 className="font-display text-4xl">Transforme conceitos em imagens absurdamente memoráveis</h2>
            <p className="mt-4 text-base leading-8 text-white/75">
              Digite uma palavra, sigla ou conceito. O sistema cria um prompt visual exagerado
              para facilitar associação e retenção, inspirado por técnicas de campeões de memória.
            </p>
          </div>

          <label className="block">
            <span className="mb-3 block text-sm uppercase tracking-[0.24em] text-white/50">
              Conceito
            </span>
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ex.: H2O, ATP, Contrato, Cliente"
              className="h-14 w-full rounded-3xl border border-white/10 bg-white/10 px-5 text-base text-white outline-none placeholder:text-white/35 focus:border-white/25"
            />
          </label>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button className="w-full sm:w-auto" onClick={() => void generate(input)}>
              <ImagePlus className="h-4 w-4" />
              {isLoading ? 'Gerando...' : 'Gerar imagem mental'}
            </Button>
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              onClick={saveCurrentMemory}
              disabled={!result}
            >
              <Save className="h-4 w-4" />
              Salvar memória
            </Button>
          </div>

          <p className="text-sm leading-7 text-white/58">
            {isUsingFallback
              ? 'Sem VITE_MEMORY_IMAGE_API_URL configurado, o app mostra uma imagem fallback local para desenvolvimento.'
              : 'O app está usando o endpoint configurado em VITE_MEMORY_IMAGE_API_URL para gerar a imagem.'}
          </p>

          {error && <div className="rounded-3xl bg-red-500/15 px-4 py-3 text-sm text-red-100">{error}</div>}

          {savedMemories.length > 0 && (
            <div className="space-y-3 rounded-[1.75rem] bg-white/5 p-4">
              <div className="text-sm uppercase tracking-[0.24em] text-white/50">Memórias salvas</div>
              <div className="grid gap-3 sm:grid-cols-2">
                {savedMemories.slice(0, 4).map((memory) => (
                  <div key={memory.id} className="rounded-3xl bg-white/8 p-3">
                    <div className="font-semibold">{memory.input}</div>
                    <div className="mt-2 text-sm leading-6 text-white/60">{memory.prompt}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-4">
          {result ? (
            <>
              <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5">
                <img
                  src={result.imageUrl}
                  alt={`Imagem gerada para ${result.input}`}
                  className="h-full min-h-[320px] w-full object-cover"
                />
              </div>
              <div className="rounded-[1.75rem] bg-white/8 p-5">
                <div className="text-sm uppercase tracking-[0.24em] text-white/50">Prompt usado</div>
                <p className="mt-3 text-sm leading-7 text-white/78">{result.prompt}</p>
              </div>
            </>
          ) : (
            <div className="flex min-h-[420px] items-center justify-center rounded-[1.75rem] border border-dashed border-white/15 bg-white/5 p-8 text-center text-white/55">
              Gere uma memória visual para ver a imagem e o prompt.
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
