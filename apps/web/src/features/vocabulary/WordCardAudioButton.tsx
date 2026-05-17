'use client';

import { Volume2 } from 'lucide-react';
import { normalizeAudioUrl, playWordAudio } from '../../lib/vocabulary-audio';

type Props = {
  audioUrl?: string | null;
  className?: string;
};

export function WordCardAudioButton({ audioUrl, className }: Props) {
  const url = normalizeAudioUrl(audioUrl);
  if (!url) return null;

  return (
    <button
      type="button"
      className={className}
      aria-label="Play pronunciation"
      onClick={(event) => {
        event.stopPropagation();
        playWordAudio(url);
      }}
    >
      <Volume2 size={16} aria-hidden />
    </button>
  );
}
