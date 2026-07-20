import type { AuthRole } from '../../../lib/active-user-role.util';
import { ADMIN_TOUR_STEPS } from './admin';
import { ADMIN_TOUR_CHAPTERS } from './admin-chapters';
import { ADMIN_PLATFORM_TOUR_STEPS } from './adminPlatform';
import { ADMIN_HELP_STEPS } from './help-admin';
import { STUDENT_HELP_STEPS } from './help-student';
import { TEACHER_HELP_STEPS } from './help-teacher';
import { SHARED_VOCAB_ADD_CHAPTER } from './shared-vocab-chapter';
import { STUDENT_TOUR_STEPS } from './student';
import { STUDENT_TOUR_CHAPTERS } from './student-chapters';
import { TEACHER_TOUR_STEPS } from './teacher';
import { TEACHER_TOUR_CHAPTERS } from './teacher-chapters';
import type { TourChapter, TourStep, TourTrackId } from './types';

export type { TourChapter, TourStep, TourTrackId, TourChapterStatus } from './types';

export type TourStepFilters = {
  groupLessonsEnabled?: boolean;
};

export const TOUR_TRACKS: Record<TourTrackId, TourStep[]> = {
  student: STUDENT_TOUR_STEPS,
  teacher: TEACHER_TOUR_STEPS,
  admin: ADMIN_TOUR_STEPS,
  /** Kept for CMS/docs; Campus maps super_admin → admin (full school tour). */
  admin_platform: ADMIN_PLATFORM_TOUR_STEPS,
};

/** Help catalog (Header ?) — page encyclopedia. super_admin uses admin Help. */
export type HelpTrackId = 'student' | 'teacher' | 'admin';

export const HELP_TRACKS: Record<HelpTrackId, TourStep[]> = {
  student: STUDENT_HELP_STEPS,
  teacher: TEACHER_HELP_STEPS,
  admin: ADMIN_HELP_STEPS,
};

const TOUR_CHAPTER_TRACKS: Record<TourTrackId, TourChapter[]> = {
  student: [SHARED_VOCAB_ADD_CHAPTER, ...STUDENT_TOUR_CHAPTERS],
  teacher: [SHARED_VOCAB_ADD_CHAPTER, ...TEACHER_TOUR_CHAPTERS],
  admin: [SHARED_VOCAB_ADD_CHAPTER, ...ADMIN_TOUR_CHAPTERS],
  admin_platform: [],
};

/** Map auth role → tour track. */
export function resolveTourTrack(role: AuthRole): TourTrackId {
  switch (role) {
    case 'teacher':
      return 'teacher';
    case 'admin':
    case 'super_admin':
      // School Campus: full admin map + chapters (not the 4-step platform stub).
      return 'admin';
    case 'student':
    default:
      return 'student';
  }
}

/** Help catalog track — super_admin gets school admin encyclopedia. */
export function resolveHelpTrack(role: AuthRole): HelpTrackId {
  switch (role) {
    case 'teacher':
      return 'teacher';
    case 'admin':
    case 'super_admin':
      return 'admin';
    case 'student':
    default:
      return 'student';
  }
}

/** Payload `campus-tours.trackId` for Help encyclopedia (Header ?). */
export function resolveHelpCmsTrackId(role: AuthRole): string {
  switch (resolveHelpTrack(role)) {
    case 'teacher':
      return 'helpTeacher';
    case 'admin':
      return 'helpAdmin';
    case 'student':
    default:
      return 'helpStudent';
  }
}

/** Payload track for empty-deck first-words guide. */
export const FIRST_WORDS_CMS_TRACK_ID = 'firstWords';

function featureAllowed(
  requiresFeature: TourStep['requiresFeature'] | TourChapter['requiresFeature'],
  filters: TourStepFilters,
): boolean {
  if (requiresFeature === 'groupLessons') {
    return Boolean(filters.groupLessonsEnabled);
  }
  return true;
}

function stepAllowed(step: TourStep, filters: TourStepFilters): boolean {
  return featureAllowed(step.requiresFeature, filters);
}

function chapterAllowed(chapter: TourChapter, filters: TourStepFilters): boolean {
  if (!featureAllowed(chapter.requiresFeature, filters)) return false;
  return chapter.steps.some((s) => stepAllowed(s, filters));
}

/** Level A steps for the given auth role (feature-gated). Short product map. */
export function getTourSteps(role: AuthRole, filters: TourStepFilters = {}): TourStep[] {
  return TOUR_TRACKS[resolveTourTrack(role)].filter((s) => stepAllowed(s, filters));
}

/**
 * First-login / Replay guided walk: welcome → every Help section (page by page) → done.
 * Soft-nav opens each page; same-page section steps do not re-navigate.
 * Header `?` still uses page-scoped `getHelpSteps` only.
 */
export function getFullProductTourSteps(
  role: AuthRole,
  filters: TourStepFilters = {},
): TourStep[] {
  const levelA = getTourSteps(role, filters);
  const welcome = levelA.filter((s) => /-welcome$/.test(s.id));
  const done = levelA.filter((s) => /-done$/.test(s.id));
  const help = getHelpSteps(role, filters);
  return [...welcome, ...help, ...done];
}

/** Help encyclopedia steps for Header `?` (feature-gated). */
export function getHelpSteps(role: AuthRole, filters: TourStepFilters = {}): TourStep[] {
  return HELP_TRACKS[resolveHelpTrack(role)].filter((s) => stepAllowed(s, filters));
}

/** Tour v3 scenario chapters after Level A (feature-gated). */
export function getTourChapters(role: AuthRole, filters: TourStepFilters = {}): TourChapter[] {
  return TOUR_CHAPTER_TRACKS[resolveTourTrack(role)]
    .filter((ch) => chapterAllowed(ch, filters))
    .map((ch) => ({
      ...ch,
      steps: ch.steps.filter((s) => stepAllowed(s, filters)),
    }))
    .filter((ch) => ch.steps.length > 0);
}

/**
 * Flattened Level B steps (all chapter steps). Kept for analytics / CMS merge helpers.
 * Prefer `getTourChapters` for the hub UI.
 */
export function getTourQuestSteps(role: AuthRole, filters: TourStepFilters = {}): TourStep[] {
  return getTourChapters(role, filters).flatMap((ch) => ch.steps);
}
