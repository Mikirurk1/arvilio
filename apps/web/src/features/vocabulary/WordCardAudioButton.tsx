'use client';

import { Volume2 } from 'lucide-react';
import { Button } from '../../components/ui';
import { normalizeAudioUrl, playWordAudio } from '../../lib/vocabulary-audio';

type Props = {
  audioUrl?: string | null;
  className?: string;
  iconSize?: number;
  label?: string;
};

export function WordCardAudioButton({
  audioUrl,
  className,
  iconSize = 16,
  label,
}: Props) {
  const url = normalizeAudioUrl(audioUrl);
  if (!url) return null;

  return (
    <Button
      type="button"
      variant="ghost"
      className={className}
      aria-label="Play pronunciation"
      title="Play pronunciation"
      onClick={(event) => {
        event.stopPropagation();
        playWordAudio(url);
      }}
    >
      <Volume2 size={iconSize} aria-hidden />
      {label ? <span>{label}</span> : null}
    </Button>
  );
}
