'use client';

import { useCallback, useEffect, useState } from 'react';
import { prefersReducedMotion } from '../../lib/mascot-capability';

export type TourSfx =
  | 'greet'
  | 'point'
  | 'click'
  | 'celebrate'
  | 'encourage'
  | 'wave'
  | 'none';

export const ARVI_SFX_MUTE_KEY = 'arvi.sfxMuted';

const SFX_SRC: Record<Exclude<TourSfx, 'none'>, string> = {
  greet: '/mascot/sfx/greet.wav',
  point: '/mascot/sfx/point.wav',
  click: '/mascot/sfx/click.wav',
  celebrate: '/mascot/sfx/celebrate.wav',
  encourage: '/mascot/sfx/encourage.wav',
  wave: '/mascot/sfx/wave.wav',
};

function readStoredMute(): boolean | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(ARVI_SFX_MUTE_KEY);
    if (raw === '1') return true;
    if (raw === '0') return false;
  } catch {
    /* private mode */
  }
  return null;
}

function writeStoredMute(muted: boolean): void {
  try {
    localStorage.setItem(ARVI_SFX_MUTE_KEY, muted ? '1' : '0');
  } catch {
    /* ignore */
  }
}

function defaultMuted(): boolean {
  const stored = readStoredMute();
  if (stored != null) return stored;
  return prefersReducedMotion();
}

/**
 * Short SFX for Arvi tour (Stage 3). Mute sticky in localStorage;
 * reduced-motion defaults to muted. Missing assets fail soft.
 */
export function useArviSound() {
  const [muted, setMutedState] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setMutedState(defaultMuted());
    setReady(true);
  }, []);

  const setMuted = useCallback((next: boolean) => {
    setMutedState(next);
    writeStoredMute(next);
  }, []);

  const toggleMute = useCallback(() => {
    setMutedState((prev) => {
      const next = !prev;
      writeStoredMute(next);
      return next;
    });
  }, []);

  const play = useCallback(
    (sfx: TourSfx | undefined) => {
      if (!sfx || sfx === 'none' || muted || typeof window === 'undefined') return;
      const src = SFX_SRC[sfx];
      if (!src) return;
      try {
        const audio = new Audio(src);
        audio.volume = 0.45;
        void audio.play().catch(() => undefined);
      } catch {
        /* fail soft */
      }
    },
    [muted],
  );

  return { muted, setMuted, toggleMute, play, ready };
}
