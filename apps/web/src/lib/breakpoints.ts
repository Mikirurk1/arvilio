/** Shared viewport breakpoints — align with SCSS $breakpoint-* in styles/_variables.scss */

export const BREAKPOINTS = {
  xs: 480,
  sm: 768,
  md: 1024,
  lg: 1200,
  xl: 1440,
} as const;

/** max-width media query for mobile — matches SCSS `respond-to(sm)` (≤768px) */
export const MOBILE_MAX_WIDTH = BREAKPOINTS.sm;

/** max-width for tablet-only range */
export const TABLET_MAX_WIDTH = BREAKPOINTS.md - 1;

export type BreakpointTier = 'mobile' | 'tablet' | 'desktop';

export function tierFromWidth(width: number): BreakpointTier {
  if (width <= MOBILE_MAX_WIDTH) return 'mobile';
  if (width <= TABLET_MAX_WIDTH) return 'tablet';
  return 'desktop';
}
