/**
 * Client preference: contextual help (Header ?) on/off.
 * Does not gate first-login ProductTour or Profile full Replay.
 */
export const ARVI_LEARNING_MODE_KEY = 'arvi.learningMode';
export const LEARNING_MODE_EVENT = 'arvilio:learning-mode';

export type LearningMode = 'on' | 'off';

export function readLearningMode(): LearningMode {
  if (typeof window === 'undefined') return 'on';
  try {
    const raw = localStorage.getItem(ARVI_LEARNING_MODE_KEY);
    if (raw === 'off') return 'off';
    if (raw === 'on') return 'on';
  } catch {
    /* private mode */
  }
  return 'on';
}

export function isLearningModeOn(): boolean {
  return readLearningMode() === 'on';
}

export function setLearningMode(mode: LearningMode): void {
  try {
    localStorage.setItem(ARVI_LEARNING_MODE_KEY, mode);
  } catch {
    /* ignore */
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent(LEARNING_MODE_EVENT, { detail: { mode } }),
    );
  }
}
