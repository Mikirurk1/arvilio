/**
 * Product tour steps — Stage 1 role tracks.
 * Prefer importing from `./tracks` directly.
 */
export type { TourStep, TourTrackId } from './tracks';
export {
  TOUR_TRACKS,
  getTourSteps,
  resolveTourTrack,
} from './tracks';

/** @deprecated Use getTourSteps(role). Kept for any legacy imports expecting a flat list. */
export { STUDENT_TOUR_STEPS as TOUR_STEPS } from './tracks/student';
