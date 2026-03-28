import { useCallback, useEffect, useRef, useState } from 'react'

export type TextInputFeedback = 'idle' | 'success' | 'error'

interface UseTextInputOptions {
  onSubmit: (value: string) => boolean | void
  debounceMs?: number
  clearOnSubmit?: boolean
}

export function useTextInput({
  onSubmit,
  debounceMs = 300,
  clearOnSubmit = true,
}: UseTextInputOptions) {
  const [value, setValue] = useState('')
  const [feedback, setFeedback] = useState<TextInputFeedback>('idle')
  const timeoutRef = useRef<number | null>(null)
  const lastSubmittedAtRef = useRef(0)

  const clearFeedback = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }, [])

  const flashFeedback = useCallback(
    (nextFeedback: TextInputFeedback) => {
      clearFeedback()
      setFeedback(nextFeedback)
      timeoutRef.current = window.setTimeout(() => {
        setFeedback('idle')
        timeoutRef.current = null
      }, 320)
    },
    [clearFeedback],
  )

  const submit = useCallback(() => {
    const normalizedValue = value.trim()

    if (!normalizedValue) {
      flashFeedback('error')
      return false
    }

    const now = performance.now()
    if (now - lastSubmittedAtRef.current < debounceMs) {
      return false
    }

    lastSubmittedAtRef.current = now
    const result = onSubmit(normalizedValue)
    const isSuccessful = result !== false

    flashFeedback(isSuccessful ? 'success' : 'error')

    if (clearOnSubmit) {
      setValue('')
    }

    return isSuccessful
  }, [clearOnSubmit, debounceMs, flashFeedback, onSubmit, value])

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key !== 'Enter') {
        return
      }

      event.preventDefault()
      submit()
    },
    [submit],
  )

  useEffect(() => () => clearFeedback(), [clearFeedback])

  return {
    value,
    setValue,
    feedback,
    submit,
    handleKeyDown,
  }
}
