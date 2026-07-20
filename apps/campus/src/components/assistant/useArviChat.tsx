'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type ArviChatContextValue = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

const ArviChatContext = createContext<ArviChatContextValue | null>(null);

export function ArviChatProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => setOpen((v) => !v), []);
  const value = useMemo(
    () => ({ open, setOpen, toggle }),
    [open, toggle],
  );
  return (
    <ArviChatContext.Provider value={value}>{children}</ArviChatContext.Provider>
  );
}

export function useArviChat(): ArviChatContextValue {
  const ctx = useContext(ArviChatContext);
  if (!ctx) {
    throw new Error('useArviChat must be used within ArviChatProvider');
  }
  return ctx;
}
