import { useCallback, useState } from 'react'

interface FormState<T> {
  form: T
  setField: <K extends keyof T>(key: K, value: T[K]) => void
  setForm: (patch: Partial<T>) => void
  reset: () => void
  saved: boolean
  markSaved: () => void
}

export function useFormState<T>(initial: T): FormState<T> {
  const [form, setFormState] = useState<T>(initial)
  const [saved, setSaved] = useState(false)

  const setField = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setFormState((prev) => ({ ...prev, [key]: value }))
    setSaved(false)
  }, [])

  const setForm = useCallback((patch: Partial<T>) => {
    setFormState((prev) => ({ ...prev, ...patch }))
    setSaved(false)
  }, [])

  const reset = useCallback(() => {
    setFormState(initial)
    setSaved(false)
    // initial is intentionally not in deps — callers pass a stable constant
  }, [])

  const markSaved = useCallback(() => setSaved(true), [])

  return { form, setField, setForm, reset, saved, markSaved }
}
