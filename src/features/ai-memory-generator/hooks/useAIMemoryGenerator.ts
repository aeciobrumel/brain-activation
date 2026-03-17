import { useCallback, useMemo, useState } from 'react'

import { createFallbackMemoryImage, slugify } from '../../../lib/helpers'
import { getSavedMemories, saveMemory, type SavedMemory } from '../../../lib/storage'

interface GeneratedMemory {
  input: string
  prompt: string
  imageUrl: string
}

function buildVisualPrompt(input: string) {
  const normalized = input.trim()

  if (normalized.toUpperCase() === 'H2O') {
    return 'Uma letra H gigante jogando dois baldes de agua em um oceano enorme, com respingos exagerados, perspectiva cinematografica e energia memoravel.'
  }

  const emphasis = normalized
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((chunk) => `um elemento gigante representando "${chunk}"`)
    .join(', ')

  return `Cena surreal e extremamente memoravel de ${emphasis}, com movimento exagerado, contraste forte, humor visual, objetos enormes e composicao clara para memorizacao rapida.`
}

async function generateImage(prompt: string, input: string) {
  const endpoint = import.meta.env.VITE_MEMORY_IMAGE_API_URL
  const color = '#22c55e'

  if (!endpoint) {
    return createFallbackMemoryImage({ title: input, prompt, color })
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt, input }),
  })

  if (!response.ok) {
    throw new Error('Falha ao gerar imagem.')
  }

  const payload = (await response.json()) as { imageUrl?: string }

  if (!payload.imageUrl) {
    throw new Error('Resposta da API sem imageUrl.')
  }

  return payload.imageUrl
}

export function useAIMemoryGenerator() {
  const [result, setResult] = useState<GeneratedMemory | null>(null)
  const [savedMemories, setSavedMemories] = useState<SavedMemory[]>(() => getSavedMemories())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = useCallback(async (input: string) => {
    const normalized = input.trim()

    if (!normalized) {
      setError('Digite uma palavra, sigla ou conceito para gerar uma memória visual.')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const prompt = buildVisualPrompt(normalized)
      const imageUrl = await generateImage(prompt, normalized)
      setResult({ input: normalized, prompt, imageUrl })
    } catch (generationError) {
      setError(
        generationError instanceof Error
          ? generationError.message
          : 'Não foi possível gerar a imagem.',
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  const saveCurrentMemory = useCallback(() => {
    if (!result) {
      return
    }

    const nextMemories = saveMemory({
      id: `${slugify(result.input)}-${Date.now()}`,
      input: result.input,
      prompt: result.prompt,
      imageUrl: result.imageUrl,
      createdAt: new Date().toISOString(),
    })

    setSavedMemories(nextMemories)
  }, [result])

  return useMemo(
    () => ({
      result,
      savedMemories,
      isLoading,
      error,
      generate,
      saveCurrentMemory,
      isUsingFallback: !import.meta.env.VITE_MEMORY_IMAGE_API_URL,
    }),
    [error, generate, isLoading, result, saveCurrentMemory, savedMemories],
  )
}
