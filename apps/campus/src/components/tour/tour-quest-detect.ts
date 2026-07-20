import { normalizeTourPathname } from './tour-context';
import type { TourQuestDetect } from './tracks/types';

export type { TourQuestDetect } from './tracks/types';

/** Custom event: `detail.questId` must match quest `requiresAction.id`. */
export const TOUR_QUEST_SIGNAL_EVENT = 'arvilio:tour-quest-signal';

export function isQuestActionSatisfied(
  detects: TourQuestDetect[],
  pathname: string,
  signaledIds: ReadonlySet<string>,
  questId: string,
): boolean {
  if (signaledIds.has(questId)) return true;
  const path = normalizeTourPathname(pathname);
  return detects.some((d) => matchDetect(d, path, signaledIds));
}

function matchDetect(
  detect: TourQuestDetect,
  pathname: string,
  signaledIds: ReadonlySet<string>,
): boolean {
  switch (detect.kind) {
    case 'pathname': {
      const v = normalizeTourPathname(detect.value);
      const mode = detect.match ?? 'startsWith';
      if (mode === 'exact') return pathname === v;
      if (mode === 'includes') return pathname.includes(v);
      return pathname === v || pathname.startsWith(`${v}/`);
    }
    case 'selector':
      if (typeof document === 'undefined') return false;
      return Boolean(document.querySelector(detect.value));
    case 'event':
      return signaledIds.has(detect.value);
    default:
      return false;
  }
}

/** Fire from app code when a quest should complete via custom event detect. */
export function signalTourQuest(payload: { questId?: string; eventId?: string }): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(TOUR_QUEST_SIGNAL_EVENT, { detail: payload }),
  );
}
