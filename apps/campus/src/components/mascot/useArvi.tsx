'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ARVI_REACTION_MS, type MascotPose } from '../../lib/mascot-capability';

type ArviContextValue = {
  pose: MascotPose;
  /** When false, GlobalArviSlot does not render (e.g. product tour open). */
  slotVisible: boolean;
  setSlotVisible: (visible: boolean) => void;
  /** Set pose without auto-idle (e.g. empty-state sleep, auth greet). */
  setPose: (pose: MascotPose) => void;
  /** Transient reaction → auto-return to idle after `ms` (default ARVI_REACTION_MS). */
  react: (pose: MascotPose, ms?: number) => void;
  celebrate: (ms?: number) => void;
  encourage: (ms?: number) => void;
  think: (ms?: number) => void;
  wave: (ms?: number) => void;
  idle: () => void;
};

const ArviContext = createContext<ArviContextValue | null>(null);

export function ArviProvider({
  children,
  initialPose = 'idle',
}: {
  children: ReactNode;
  initialPose?: MascotPose;
}) {
  const [pose, setPoseState] = useState<MascotPose>(initialPose);
  const [slotVisible, setSlotVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current != null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => () => clearTimer(), [clearTimer]);

  const setPose = useCallback(
    (next: MascotPose) => {
      clearTimer();
      setPoseState(next);
    },
    [clearTimer],
  );

  const react = useCallback(
    (next: MascotPose, ms = ARVI_REACTION_MS) => {
      clearTimer();
      setPoseState(next);
      if (ms <= 0) return;
      timerRef.current = setTimeout(() => {
        timerRef.current = null;
        setPoseState('idle');
      }, ms);
    },
    [clearTimer],
  );

  const value = useMemo<ArviContextValue>(
    () => ({
      pose,
      slotVisible,
      setSlotVisible,
      setPose,
      react,
      celebrate: (ms) => react('celebrate', ms),
      encourage: (ms) => react('encourage', ms),
      think: (ms) => react('think', ms),
      wave: (ms) => react('wave', ms),
      idle: () => setPose('idle'),
    }),
    [pose, slotVisible, setPose, react],
  );

  return <ArviContext.Provider value={value}>{children}</ArviContext.Provider>;
}

/**
 * Global Arvi pose controller. Must be under `ArviProvider` (mounted in AppProviders).
 * Safe no-op stubs outside the provider so unit tests / isolated trees don't crash.
 */
export function useArvi(): ArviContextValue {
  const ctx = useContext(ArviContext);
  if (ctx) return ctx;
  return NOOP_ARVI;
}

const NOOP_ARVI: ArviContextValue = {
  pose: 'idle',
  slotVisible: true,
  setSlotVisible: () => undefined,
  setPose: () => undefined,
  react: () => undefined,
  celebrate: () => undefined,
  encourage: () => undefined,
  think: () => undefined,
  wave: () => undefined,
  idle: () => undefined,
};
