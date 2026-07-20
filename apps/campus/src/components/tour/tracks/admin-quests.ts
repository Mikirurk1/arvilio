import { ADMIN_TOUR_CHAPTERS } from './admin-chapters';
import type { TourStep } from './types';

/** @deprecated Prefer ADMIN_TOUR_CHAPTERS / getTourChapters — flat list for legacy tests. */
export const ADMIN_TOUR_QUESTS: TourStep[] = ADMIN_TOUR_CHAPTERS.flatMap((ch) => ch.steps);
