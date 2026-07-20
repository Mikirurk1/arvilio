import { STUDENT_TOUR_CHAPTERS } from './student-chapters';
import type { TourStep } from './types';

/** @deprecated Prefer STUDENT_TOUR_CHAPTERS / getTourChapters — flat list for legacy tests. */
export const STUDENT_TOUR_QUESTS: TourStep[] = STUDENT_TOUR_CHAPTERS.flatMap((ch) => ch.steps);
