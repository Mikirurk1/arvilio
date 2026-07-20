import type { TourStep } from './tracks/types';

export type TourSoftNavPhase = 'A' | 'hub' | 'chapter';

/**
 * Soft auto-navigation is disabled.
 * Forced `router.replace` remounted pages (Vocabulary especially), reset AppShell
 * hosts, and fought click-to-target chapters. Tour card spotlights `navHref` /
 * anchors; the user navigates. First-login / Replay still land on `/dashboard`
 * via `beginFullProductTour` only.
 */
export function shouldSoftNavTourStep(_input: {
  open: boolean;
  contextualMode: boolean;
  phase: TourSoftNavPhase;
  step: TourStep | null | undefined;
  appPath: string;
}): boolean {
  return false;
}
