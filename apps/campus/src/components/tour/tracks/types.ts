import type { MascotPose } from '../../../lib/mascot-capability';
import type { TourSfx } from '../../mascot/useArviSound';

/** Role-specific first-login tour track (Stage 1+). */
export type TourTrackId = 'student' | 'teacher' | 'admin' | 'admin_platform';

/** How a Level B quest detects completion (any match in `detects` wins). */
export type TourQuestDetect =
  | { kind: 'pathname'; value: string; match?: 'exact' | 'startsWith' | 'includes' }
  | { kind: 'selector'; value: string }
  | { kind: 'event'; value: string };

export interface TourQuestAction {
  id: string;
  hint: string;
  detects: TourQuestDetect[];
}

/** Chapter progress status stored in localStorage (Tour v3). */
export type TourChapterStatus = 'todo' | 'done' | 'skipped';

/**
 * Level A guided step, or Level B try-it quest (Stage 4 / Tour v3 chapters).
 * Spotlight: prefer `anchorId` → `[data-tour-anchor]`, else `navHref` → `[data-tour-nav]`.
 * Missing / invisible target → centered card (no crash).
 */
export interface TourStep {
  /** Stable id for analytics and pose debugging. */
  id: string;
  /** Level A = guided tour; Level B = optional post-finish quest / chapter step. */
  level?: 'A' | 'B';
  title: string;
  body: string;
  /** Optional in-app area label shown in the progress line. */
  area?: string;
  /** Sidebar route to spotlight — must match `data-tour-nav` on the nav link. */
  navHref?: string;
  /** Page-section spotlight — must match `data-tour-anchor` (Stage 2). */
  anchorId?: string;
  /** Explicit Arvi pose for this step. */
  pose: MascotPose;
  /** Short SFX on step enter (Stage 3). Defaults derived from pose if omitted. */
  sfx?: TourSfx;
  /** Optional per-locale voice-over URL (Stage 6 seam). Lazy-loaded; missing file fails soft. */
  voiceSrc?: string;
  /** UA meaning for translators (G33) — not rendered in UI. */
  uaIntent?: string;
  /**
   * When set, step is included only if this school feature is on
   * (e.g. `groupLessons` → tea-groups).
   */
  requiresFeature?: 'groupLessons';
  /** Level B only — action gate + soft-skip label. */
  requiresAction?: TourQuestAction;
  softSkipLabel?: string;
}

/**
 * Named scenario after Level A (Tour v3). Soft steps: open UI, cancel OK.
 * Hub lists chapters; each chapter runs its `steps` as Level B quests.
 */
export interface TourChapter {
  id: string;
  title: string;
  body: string;
  area?: string;
  pose: MascotPose;
  requiresFeature?: 'groupLessons';
  steps: TourStep[];
}

/** Map pose → default SFX when step.sfx is omitted. */
export function defaultSfxForPose(pose: MascotPose): TourSfx {
  switch (pose) {
    case 'greet':
      return 'greet';
    case 'celebrate':
      return 'celebrate';
    case 'encourage':
      return 'encourage';
    case 'wave':
      return 'wave';
    case 'point':
      return 'point';
    default:
      return 'none';
  }
}
