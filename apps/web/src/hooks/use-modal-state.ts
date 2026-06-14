import { useCallback, useState } from 'react'

interface ModalState<T> {
  isOpen: boolean
  item: T | null
  open: (item?: T) => void
  close: () => void
  setItem: (item: T | null) => void
}

export function useModalState<T = undefined>(): ModalState<T> {
  const [item, setItem] = useState<T | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const open = useCallback((newItem?: T) => {
    setItem(newItem ?? null)
    setIsOpen(true)
  }, [])

  const close = useCallback(() => {
    setIsOpen(false)
    setItem(null)
  }, [])

  return { isOpen, item, open, close, setItem }
}
