/** Protocol-relative dictionary API URLs (//host/...) need https: for browser Audio. */
export function normalizeAudioUrl(url: string | null | undefined): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;
  if (trimmed.startsWith('//')) return `https:${trimmed}`;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return null;
}

let activeAudio: HTMLAudioElement | null = null;

export function playWordAudio(url: string): void {
  const normalized = normalizeAudioUrl(url);
  if (!normalized) return;
  if (activeAudio) {
    activeAudio.pause();
    activeAudio = null;
  }
  const audio = new Audio(normalized);
  activeAudio = audio;
  audio.onended = () => {
    if (activeAudio === audio) activeAudio = null;
  };
  void audio.play().catch(() => {
    if (activeAudio === audio) activeAudio = null;
  });
}
