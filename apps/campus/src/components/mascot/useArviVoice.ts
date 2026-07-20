'use client';

import { useCallback, useEffect, useRef } from 'react';

export type UseArviVoiceOptions = {
  /** When true, voice does not play (shared with tour SFX mute). */
  muted: boolean;
};

/**
 * Per-step voice-over seam (Stage 6). Lazy `Audio()` on play — no prefetch.
 * Shares mute with SFX via parent `muted`. Missing assets fail soft.
 */
export function useArviVoice({ muted }: UseArviVoiceOptions) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopVoice = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    audio.currentTime = 0;
    audioRef.current = null;
  }, []);

  const pauseVoice = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const playVoice = useCallback(
    (src: string | undefined) => {
      stopVoice();
      if (!src || muted || typeof window === 'undefined') return;
      try {
        const audio = new Audio(src);
        audio.volume = 0.85;
        audioRef.current = audio;
        void audio.play().catch(() => undefined);
      } catch {
        /* fail soft */
      }
    },
    [muted, stopVoice],
  );

  useEffect(() => {
    if (muted) stopVoice();
  }, [muted, stopVoice]);

  useEffect(() => () => stopVoice(), [stopVoice]);

  return { playVoice, pauseVoice, stopVoice };
}
