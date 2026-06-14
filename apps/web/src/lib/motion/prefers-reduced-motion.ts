/** Media query for OS “reduce motion” accessibility setting. */
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(REDUCED_MOTION_QUERY).matches;
}

/** Subscribe to reduced-motion changes (e.g. for GSAP timelines). Returns unsubscribe. */
export function subscribeReducedMotion(onChange: (reduced: boolean) => void): () => void {
  if (typeof window === 'undefined') return () => {};

  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  const handler = () => onChange(mq.matches);
  mq.addEventListener('change', handler);
  handler();
  return () => mq.removeEventListener('change', handler);
}

/** Pick duration (ms) based on current reduced-motion preference. */
export function motionDurationMs(normalMs: number, reducedMs = 0): number {
  return prefersReducedMotion() ? reducedMs : normalMs;
}
