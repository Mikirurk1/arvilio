import { TEACHER_TOUR_CHAPTERS } from './teacher-chapters';
import type { TourStep } from './types';

/** @deprecated Prefer TEACHER_TOUR_CHAPTERS / getTourChapters — flat list for legacy tests. */
export const TEACHER_TOUR_QUESTS: TourStep[] = TEACHER_TOUR_CHAPTERS.flatMap((ch) => ch.steps);
